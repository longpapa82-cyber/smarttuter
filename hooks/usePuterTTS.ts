import { useState, useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    puter?: {
      ai: {
        txt2speech: (
          text: string,
          options?: {
            voice?: string;
            engine?: 'standard' | 'neural' | 'generative';
            language?: string;
          }
        ) => Promise<HTMLAudioElement>;
      };
    };
  }
}

interface UsePuterTTSProps {
  language?: string;
  engine?: 'standard' | 'neural' | 'generative';
  voice?: string;
}

export function usePuterTTS({
  language = 'ko-KR',
  engine = 'neural',
  voice,
}: UsePuterTTSProps = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if Puter.js is loaded
  useEffect(() => {
    const checkPuter = () => {
      if (window.puter?.ai?.txt2speech) {
        setIsReady(true);
        console.log('✅ Puter.js TTS ready');
      } else {
        // Retry after a short delay
        setTimeout(checkPuter, 100);
      }
    };

    checkPuter();
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!window.puter?.ai?.txt2speech) {
        const errorMsg = 'Puter.js not loaded yet';
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      if (!text || text.length === 0) {
        console.warn('Empty text provided to Puter TTS');
        return;
      }

      // Check character limit (Puter.js has 3000 character limit)
      if (text.length > 3000) {
        console.warn(`Text too long (${text.length} chars). Truncating to 3000 characters.`);
        text = text.substring(0, 3000);
      }

      try {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        setIsSpeaking(true);
        setError(null);

        console.log('🎤 Puter.js TTS:', {
          engine,
          language,
          voice,
          textLength: text.length,
        });

        const audio = await window.puter.ai.txt2speech(text, {
          engine,
          language,
          ...(voice && { voice }),
        });

        audioRef.current = audio;

        // Add event listeners
        audio.onended = () => {
          console.log('🎤 Puter.js TTS finished');
          setIsSpeaking(false);
          audioRef.current = null;
        };

        audio.onerror = (event) => {
          console.error('🎤 Puter.js TTS error:', event);
          setError('Speech synthesis error');
          setIsSpeaking(false);
          audioRef.current = null;
        };

        // Play the audio (with autoplay policy handling)
        try {
          await audio.play();
        } catch (playError: any) {
          // Handle autoplay policy errors gracefully
          if (playError.name === 'NotAllowedError' || playError.message.includes("user didn't interact")) {
            console.warn('⚠️ Autoplay blocked - user interaction required first');
            // Try to play when user interacts
            const playOnInteraction = async () => {
              try {
                await audio.play();
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
              } catch (retryError) {
                console.error('Failed to play after interaction:', retryError);
              }
            };
            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('keydown', playOnInteraction, { once: true });
          } else {
            throw playError;
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to speak with Puter.js:', errorMessage);
        setError(errorMessage);
        setIsSpeaking(false);
        audioRef.current = null;
      }
    },
    [engine, language, voice]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
      console.log('🎤 Puter.js TTS stopped');
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      console.log('🎤 Puter.js TTS paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      console.log('🎤 Puter.js TTS resumed');
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isReady,
    error,
  };
}
