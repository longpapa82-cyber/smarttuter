import { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';

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

// Global flag to track if we've already warned about Puter.js unavailability
let hasShownUnavailableWarning = false;

interface UsePuterTTSProps {
  language?: string;
  engine?: 'standard' | 'neural' | 'generative';
  voice?: string;
  enabled?: boolean; // Only initialize when this TTS engine is active
}

export function usePuterTTS({
  language = 'ko-KR',
  engine = 'neural',
  voice,
  enabled = true, // Default to enabled for backward compatibility
}: UsePuterTTSProps = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use ref to always read the latest settings dynamically
  const settingsRef = useRef({ language, engine, voice, enabled });

  // Use useLayoutEffect to update settings synchronously before other effects
  useLayoutEffect(() => {
    settingsRef.current = { language, engine, voice, enabled };
  }, [language, engine, voice, enabled]);

  // Check if Puter.js is loaded (only when enabled)
  useEffect(() => {
    // Skip initialization if this TTS engine is not active
    if (!enabled) {
      setIsReady(false);
      return;
    }

    const checkPuter = () => {
      if (window.puter?.ai?.txt2speech) {
        setIsReady(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Puter.js TTS ready');
        }
      } else {
        // Retry after a short delay
        setTimeout(checkPuter, 100);
      }
    };

    checkPuter();
  }, [enabled]);

  const speak = useCallback(
    async (text: string) => {
      // Read the latest settings dynamically from ref
      const currentSettings = settingsRef.current;

      // Skip if this TTS engine is not enabled
      if (!currentSettings.enabled) {
        return;
      }

      if (!window.puter?.ai?.txt2speech) {
        // Silently skip if Puter.js not loaded - will use Web Speech API
        // Only warn once in development to avoid console spam
        if (process.env.NODE_ENV === 'development' && !hasShownUnavailableWarning) {
          console.warn('⚠️ Puter.js TTS not available - falling back to Web Speech API');
          hasShownUnavailableWarning = true;
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

        if (process.env.NODE_ENV === 'development') {
          console.log('🎤 Puter.js TTS:', {
            engine: currentSettings.engine,
            language: currentSettings.language,
            voice: currentSettings.voice,
            textLength: text.length,
          });
        }

        const audio = await window.puter.ai.txt2speech(text, {
          engine: currentSettings.engine,
          language: currentSettings.language,
          ...(currentSettings.voice && { voice: currentSettings.voice }),
        });

        audioRef.current = audio;

        // Add event listeners
        audio.onended = () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🎤 Puter.js TTS finished');
          }
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
        // Only log to console in development, and only once to avoid spam
        if (process.env.NODE_ENV === 'development' && !hasShownUnavailableWarning) {
          console.warn('⚠️ Puter.js TTS unavailable - falling back to Web Speech API');
          hasShownUnavailableWarning = true;
        }

        // Silently fallback to Web Speech API
        try {
          if ('speechSynthesis' in window) {
            const currentSettings = settingsRef.current;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentSettings.language || 'ko-KR';
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
    []
  );

  const stop = useCallback(() => {
    // Stop Puter.js audio
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset playback position
        // Don't clear src immediately - it can interfere with cleanup
        audioRef.current = null;
        setIsSpeaking(false);
        if (process.env.NODE_ENV === 'development') {
          console.log('🎤 Puter.js TTS stopped');
        }
      } catch (error) {
        console.error('❌ Error stopping Puter audio:', error);
        audioRef.current = null; // Force cleanup even if error
        setIsSpeaking(false);
      }
    }

    // Stop Web Speech API
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('🎤 Web Speech API stopped');
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (process.env.NODE_ENV === 'development') {
        console.log('🎤 Puter.js TTS paused');
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      if (process.env.NODE_ENV === 'development') {
        console.log('🎤 Puter.js TTS resumed');
      }
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
