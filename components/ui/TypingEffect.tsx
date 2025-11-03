'use client';

import { useState, useEffect, useRef } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  isStreaming?: boolean; // NEW: flag to indicate if text is still streaming
}

export function TypingEffect({
  text,
  speed = 30,
  onComplete,
  className = '',
  isStreaming = false // NEW: default to false for backward compatibility
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevTextRef = useRef('');

  useEffect(() => {
    // If streaming, just show the text directly without typing effect
    if (isStreaming) {
      setDisplayedText(text);
      prevTextRef.current = text;
      return;
    }

    // If text is complete and different from previous, start typing effect
    if (!isStreaming && text !== prevTextRef.current) {
      prevTextRef.current = text;
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    // Typing effect logic (only when not streaming)
    if (!isStreaming && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isStreaming && currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, isStreaming]);

  return (
    <span className={className}>
      {displayedText}
      {!isStreaming && currentIndex < text.length && (
        <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
      )}
    </span>
  );
}
