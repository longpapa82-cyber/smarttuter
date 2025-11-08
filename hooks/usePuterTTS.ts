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
        // Silently skip if Puter.js not loaded - will use Web Speech API
        if (process.env.NODE_ENV === 'development') {
          console.warn('Puter.js TTS not available, skipping');
        }
        return;
      }

      if (!text || text.length === 0) {
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
        // Only log to console in development, don't show user-facing error
        if (process.env.NODE_ENV === 'development') {
          console.warn('Puter.js TTS unavailable, using Web Speech API fallback');
        }

        // Silently fallback to Web Speech API
        try {
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onend = () => {
              setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
              // Silently fail - TTS is not critical functionality
              if (process.env.NODE_ENV === 'development') {
                console.warn('Web Speech API error:', event.error);
              }
              setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
          } else {
            // TTS not available, continue silently
            setIsSpeaking(false);
          }
        } catch (fallbackError) {
          // Silently fail - TTS is not critical functionality
          if (process.env.NODE_ENV === 'development') {
            console.warn('TTS fallback failed:', fallbackError);
          }
          setIsSpeaking(false);
        }

        audioRef.current = null;
        // Don't set error state - TTS failure shouldn't block UI
      }
    },
    [engine, language, voice]
  );

  const stop = useCallback(() => {
    // Stop Puter.js audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
      console.log('🎤 Puter.js TTS stopped');
    }

    // Stop Web Speech API
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      console.log('🎤 Web Speech API stopped');
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
