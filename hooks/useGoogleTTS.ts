import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';

interface UseGoogleTTSOptions {
  gradeLevel: string;
  language?: string;
  voiceName?: string; // Optional: specify Neural2 voice (e.g., 'ko-KR-Neural2-A', 'ko-KR-Neural2-B')
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useGoogleTTS({
  gradeLevel,
  language = 'ko-KR',
  voiceName,
  onError,
  onStart,
  onEnd,
}: UseGoogleTTSOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use ref to always read the latest settings dynamically
  const settingsRef = useRef({ gradeLevel, language, voiceName });

  // Use useLayoutEffect to update settings synchronously before other effects
  useLayoutEffect(() => {
    settingsRef.current = { gradeLevel, language, voiceName };
  }, [gradeLevel, language, voiceName]);

  // Speak text using Google TTS with automatic fallback to Web Speech API
  const speak = useCallback(
    async (text: string) => {
      if (!text || isSpeaking) return;

      try {
        setIsLoading(true);
        setIsSpeaking(true);
        onStart?.();

        // Read the latest settings dynamically from ref
        const currentSettings = settingsRef.current;

        // Try Google Cloud TTS first
        const response = await fetch('/api/tts/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            gradeLevel: currentSettings.gradeLevel,
            language: currentSettings.language,
            voiceName: currentSettings.voiceName,
          }),
        });

        const data = await response.json();

        // If Google TTS succeeds, play the audio
        if (response.ok && data.success && data.audio) {
          console.log('✅ Using Google Cloud TTS (Neural2) with voice:', currentSettings.voiceName);
          await playGoogleAudio(data.audio);
          return;
        }

        // Fallback to Web Speech API if Google TTS fails
        if (data.fallback || !response.ok) {
          console.log('⚠️ Google TTS unavailable, falling back to Web Speech API');
          await fallbackToWebSpeech(text);
          return;
        }
      } catch (error) {
        console.error('❌ Google TTS error, falling back to Web Speech API:', error);
        await fallbackToWebSpeech(text);
      } finally {
        setIsLoading(false);
      }
    },
    [isSpeaking, onStart]
  );

  // Play audio from Google TTS base64 data
  const playGoogleAudio = useCallback(
    (audioBase64: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          // Stop any existing audio safely
          if (audioRef.current) {
            try {
              audioRef.current.pause();
              audioRef.current.onended = null;
              audioRef.current.onerror = null;
            } catch (e) {
              // Ignore cleanup errors
            }
            audioRef.current = null;
          }

          // Create audio element with error handling
          const audio = new Audio();
          audioRef.current = audio;

          // Set source after setting up event handlers
          audio.src = `data:audio/mp3;base64,${audioBase64}`;

          audio.onended = () => {
            setIsSpeaking(false);
            onEnd?.();
            resolve();
          };

          audio.onerror = (event) => {
            const audioError = event.target as HTMLAudioElement;
            const errorDetails = {
              error: audioError.error,
              networkState: audioError.networkState,
              readyState: audioError.readyState,
              src: audioError.src?.substring(0, 50) + '...', // Log first 50 chars
            };
            console.error('❌ Audio playback error:', errorDetails);
            setIsSpeaking(false);
            onError?.(new Error('Audio playback failed'));
            reject(event);
          };

          // Load and play audio
          audio.load(); // Explicitly load the audio source
          audio.play().catch((error) => {
            console.error('❌ Audio play error:', error);
            setIsSpeaking(false);
            onError?.(new Error('Failed to start audio playback'));
            reject(error);
          });
        } catch (error) {
          console.error('❌ playGoogleAudio error:', error);
          setIsSpeaking(false);
          onError?.(error as Error);
          reject(error);
        }
      });
    },
    [onEnd, onError]
  );

  // Fallback to Web Speech API
  const fallbackToWebSpeech = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          if (typeof window === 'undefined' || !window.speechSynthesis) {
            throw new Error('Speech synthesis not supported');
          }

          // Read the latest settings dynamically from ref
          const currentSettings = settingsRef.current;

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = currentSettings.language || 'ko-KR';
          utterance.rate = getWebSpeechRate(currentSettings.gradeLevel);
          utterance.pitch = getWebSpeechPitch(currentSettings.gradeLevel);

          // Get Korean voice if available
          const voices = window.speechSynthesis.getVoices();
          const koreanVoice = voices.find((voice) =>
            voice.lang.startsWith((currentSettings.language || 'ko-KR').split('-')[0])
          );
          if (koreanVoice) {
            utterance.voice = koreanVoice;
          }

          utterance.onend = () => {
            setIsSpeaking(false);
            onEnd?.();
            resolve();
          };

          utterance.onerror = (error) => {
            console.error('❌ Web Speech API error:', error);
            setIsSpeaking(false);
            onError?.(new Error('Speech synthesis failed'));
            reject(error);
          };

          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('❌ fallbackToWebSpeech error:', error);
          setIsSpeaking(false);
          onError?.(error as Error);
          reject(error);
        }
      });
    },
    [onEnd, onError]
  );

  // Stop speaking
  const stop = useCallback(() => {
    // Stop Google TTS audio
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset playback position
        // Don't clear src immediately - it can interfere with cleanup
        audioRef.current = null;
      } catch (error) {
        console.error('❌ Error stopping audio:', error);
        audioRef.current = null; // Force cleanup even if error
      }
    }

    // Stop Web Speech API
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
  };
}

// Get Web Speech API speaking rate based on grade level
function getWebSpeechRate(gradeLevel: string): number {
  const isElementary = gradeLevel.includes('초등');
  const isMiddle = gradeLevel.includes('중학');

  if (isElementary) return 0.85;
  if (isMiddle) return 0.95;
  return 1.0;
}

// Get Web Speech API pitch based on grade level
function getWebSpeechPitch(gradeLevel: string): number {
  const isElementary = gradeLevel.includes('초등');

  if (isElementary) return 1.2; // Higher pitch
  return 1.0; // Normal pitch
}
