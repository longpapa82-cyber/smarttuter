'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Lightbulb, Eye, RotateCcw } from 'lucide-react';
import { useVoiceTutor } from '@/lib/voice-tutor/store';
import { useUserStore } from '@/lib/gamification/store';
import { TutorSubject, TutorMessage } from '@/lib/voice-tutor/types';

interface VoiceTutorInterfaceProps {
  subject: TutorSubject;
  userId: string;
  gradeLevel: 'elementary' | 'middle' | 'high' | 'university';
}

export default function VoiceTutorInterface({
  subject,
  userId,
  gradeLevel,
}: VoiceTutorInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentSession,
    startSession,
    sendMessage,
    endSession,
    requestHint,
    generateProblem,
    showSolution,
  } = useVoiceTutor();

  const { addXP } = useUserStore((state) => ({
    addXP: state.addXP,
  }));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // Start session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const greeting = await startSession(subject, gradeLevel, userId);

      // Speak the greeting
      await speakText(greeting);
    } catch (error) {
      console.error('Failed to start session:', error);
      setError('Failed to start voice tutor. Please try again.');
    }
  };

  // Handle voice input
  const handleVoiceInput = async () => {
    if (isListening || isSpeaking || isProcessing) return;

    setIsListening(true);
    setError(null);

    try {
      // Note: MCP Voice Mode would be used here in production
      // For now, we'll simulate with text input
      // In production: const response = await mcp__voice_mode__converse({...})

      // Simulate listening (in production, this would use actual MCP voice mode)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, prompt for text input
      const userInput = prompt('Enter your message (in production, this would be voice):');

      if (!userInput) {
        setIsListening(false);
        return;
      }

      setIsListening(false);
      setIsProcessing(true);

      // Send message to tutor
      const result = await sendMessage(userInput, {
        confidence: 0.95,
        duration: 3,
      });

      // Award XP
      addXP(result.xpEarned, `voice-tutor-${subject}`);

      // Speak the response
      await speakText(result.response);

      setIsProcessing(false);
    } catch (error) {
      console.error('Voice input error:', error);
      setError('Sorry, I had trouble understanding. Please try again.');
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  // Speak text using TTS
  const speakText = async (text: string) => {
    setIsSpeaking(true);

    try {
      // Note: MCP Voice Mode TTS would be used here in production
      // For now, we'll use Web Speech API as fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        await new Promise<void>((resolve) => {
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      } else {
        // Just wait a bit if speech synthesis not available
        await new Promise(resolve => setTimeout(resolve, text.length * 50));
      }
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Handle hint request (Math only)
  const handleHintRequest = async () => {
    if (subject !== 'math') return;

    try {
      const hint = await requestHint();
      await speakText(hint);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle new problem (Math only)
  const handleNewProblem = async () => {
    if (subject !== 'math') return;

    try {
      const problem = await generateProblem();
      await speakText(problem.question);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle show solution (Math only)
  const handleShowSolution = async () => {
    if (subject !== 'math') return;

    try {
      const solution = await showSolution();
      await speakText(solution);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // End session
  const handleEndSession = async () => {
    const finalSession = endSession();

    if (finalSession) {
      // Award final XP
      addXP(finalSession.xpEarned, `voice-session-complete-${subject}`);

      // Navigate back or show summary
      alert(`Session complete! You earned ${finalSession.xpEarned} XP!`);
    }
  };

  const messages = currentSession?.messages || [];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {subject === 'english' ? '📚 English' : '🔢 Math'} Voice Tutor
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentSession ? `${messages.length} messages • ${Math.floor(currentSession.duration / 60)}min` : 'Starting...'}
            </p>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-pink-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 pb-2">
          <div className="max-w-4xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Voice Visualizer & Controls */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Voice Visualizer */}
          <div className="flex items-center justify-center mb-6">
            <AudioVisualizer isActive={isListening || isSpeaking} state={
              isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'
            } />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Main Voice Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceInput}
              disabled={isListening || isSpeaking || isProcessing}
              className={`
                w-20 h-20 rounded-full shadow-lg flex items-center justify-center
                transition-all duration-300
                ${isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : isSpeaking
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:shadow-xl'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isListening ? (
                <Mic className="w-10 h-10 text-white animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 className="w-10 h-10 text-white animate-pulse" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </motion.button>

            {/* Math-specific controls */}
            {subject === 'math' && (
              <>
                <button
                  onClick={handleHintRequest}
                  disabled={isListening || isSpeaking || isProcessing}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  Hint
                </button>

                <button
                  onClick={handleNewProblem}
                  disabled={isListening || isSpeaking || isProcessing}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Problem
                </button>

                <button
                  onClick={handleShowSolution}
                  disabled={isListening || isSpeaking || isProcessing}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Solution
                </button>
              </>
            )}
          </div>

          {/* Status Text */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            {isListening
              ? '🎤 Listening...'
              : isSpeaking
              ? '🔊 Speaking...'
              : isProcessing
              ? '🤔 Thinking...'
              : '👆 Tap to speak'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message, index }: { message: TutorMessage; index: number }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[80%] rounded-2xl p-4 shadow-lg
          ${isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          }
        `}
      >
        <p className="text-sm md:text-base">{message.content}</p>

        {message.feedback && !isUser && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs">
              {message.feedback.isPositive ? (
                <span className="text-green-600 dark:text-green-400">✓ Great!</span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">💡 Tip</span>
              )}
              {message.feedback.score !== undefined && (
                <span className="text-gray-600 dark:text-gray-400">
                  Score: {message.feedback.score}/100
                </span>
              )}
            </div>
          </div>
        )}

        <p className="text-xs opacity-60 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}

// Audio Visualizer Component
function AudioVisualizer({
  isActive,
  state,
}: {
  isActive: boolean;
  state: 'idle' | 'listening' | 'speaking';
}) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer ring */}
      <motion.div
        className={`absolute inset-0 rounded-full border-4 ${
          state === 'listening'
            ? 'border-red-500'
            : state === 'speaking'
            ? 'border-blue-500'
            : 'border-purple-500'
        }`}
        animate={isActive ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />

      {/* Inner circle */}
      <motion.div
        className={`w-24 h-24 rounded-full flex items-center justify-center ${
          state === 'listening'
            ? 'bg-gradient-to-br from-red-400 to-red-600'
            : state === 'speaking'
            ? 'bg-gradient-to-br from-blue-400 to-blue-600'
            : 'bg-gradient-to-br from-purple-400 to-purple-600'
        }`}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      >
        <span className="text-4xl">
          {state === 'listening' ? '🎤' : state === 'speaking' ? '🔊' : '🎯'}
        </span>
      </motion.div>
    </div>
  );
}
