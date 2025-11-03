import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechSynthesisProps {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
}

export function useSpeechSynthesis({
  lang = "en-US",
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
}: UseSpeechSynthesisProps = {}): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Speech Synthesis API is supported
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Select best available voice for the language
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to find a voice that matches the language
        const matchingVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
          console.log('🎤 Selected voice:', matchingVoice.name, '(' + matchingVoice.lang + ')');
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        // Handle 'not-allowed' and 'interrupted' errors silently
        if (event.error === 'not-allowed') {
          console.warn('Speech synthesis blocked by browser. User interaction required.');
        } else if (event.error === 'interrupted') {
          // Speech was interrupted (user stopped it, new message, etc.) - this is expected behavior
          console.log('Speech synthesis interrupted (expected behavior)');
        } else {
          // Log other errors for debugging
          console.error("Speech synthesis error:", event);
        }
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;

      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Failed to speak:', error);
        setIsSpeaking(false);
        setIsPaused(false);
      }
    },
    [lang, rate, pitch, volume]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
  };
}
