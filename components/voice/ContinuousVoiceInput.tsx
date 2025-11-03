'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Radio, Volume2, Activity } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { VoiceActivityDetector, createVAD } from '@/lib/voice/voice-activity-detector';
import { NoiseSuppressor, createNoiseSuppressor } from '@/lib/voice/noise-suppression';

export interface ContinuousVoiceInputProps {
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  disabled?: boolean;
  autoSend?: boolean;
  silenceThreshold?: number;
  autoStart?: boolean; // Phase 1 (P0): Auto-start for English tutor
}

/**
 * Continuous voice input component with always-on listening mode
 *
 * Features:
 * - Always-on voice detection
 * - Automatic silence detection
 * - Real-time waveform visualization
 * - Auto-send on silence
 * - Auto-start (Phase 1 P0): Automatically start listening on mount
 */
export function ContinuousVoiceInput({
  onTranscript,
  onError,
  language = 'ko-KR',
  disabled = false,
  autoSend = true,
  silenceThreshold = 2000, // 2 seconds of silence
  autoStart = false, // Phase 1 (P0): English tutor auto-starts
}: ContinuousVoiceInputProps) {
  const [isActive, setIsActive] = useState(false);
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState(0);

  // Phase 3 (P1): VAD and Noise Suppression
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const noiseSuppressorRef = useRef<NoiseSuppressor | null>(null);
  const [isVADSpeaking, setIsVADSpeaking] = useState(false);
  const [vadMetrics, setVadMetrics] = useState({ energy: 0, zcr: 0 });

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition({
    language,
    continuous: true,
    interimResults: true,
    onStart: () => {
      console.log('🎤 Continuous listening started');
    },
    onResult: (result) => {
      if (result.transcript || result.interimTranscript) {
        setLastSpeechTime(Date.now());
        // Simulate audio level based on speech activity
        setAudioLevel(Math.random() * 0.5 + 0.5);
      }
    },
    onError: (err) => {
      onError?.(err);
      setIsActive(false);
    },
  });

  // Auto-send on silence
  useEffect(() => {
    if (!isActive || !autoSend || !transcript.trim()) return;

    const checkSilence = setInterval(() => {
      const timeSinceLastSpeech = Date.now() - lastSpeechTime;

      if (timeSinceLastSpeech > silenceThreshold && transcript.trim()) {
        console.log('🤐 Silence detected, sending transcript');
        onTranscript?.(transcript.trim());
        resetTranscript();
        setLastSpeechTime(Date.now());
      }
    }, 500);

    return () => clearInterval(checkSilence);
  }, [isActive, autoSend, transcript, lastSpeechTime, silenceThreshold, onTranscript, resetTranscript]);

  // Decay audio level when not speaking
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0);
      return;
    }

    const decay = setInterval(() => {
      setAudioLevel(prev => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(decay);
  }, [isListening]);

  // Phase 3 (P1): VAD monitoring
  useEffect(() => {
    if (!isActive || !vadRef.current) return;

    const vadInterval = setInterval(() => {
      if (vadRef.current) {
        const speaking = vadRef.current.isSpeakingNow();
        const metrics = vadRef.current.getMetrics();
        const level = vadRef.current.getAudioLevel();

        setIsVADSpeaking(speaking);
        setVadMetrics({ energy: metrics.energy, zcr: metrics.zcr });
        setAudioLevel(level);

        if (speaking) {
          setLastSpeechTime(Date.now());
        }
      }
    }, 100); // Update 10 times per second

    return () => clearInterval(vadInterval);
  }, [isActive]);

  const toggleListening = useCallback(async () => {
    if (isActive) {
      stopListening();
      setIsActive(false);
      setAudioLevel(0);

      // Phase 3 (P1): Cleanup VAD and Noise Suppressor
      if (vadRef.current) {
        vadRef.current.destroy();
        vadRef.current = null;
      }
      if (noiseSuppressorRef.current) {
        noiseSuppressorRef.current.destroy();
        noiseSuppressorRef.current = null;
      }
    } else {
      // Phase 3 (P1): Initialize VAD and Noise Suppressor
      try {
        // Get microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Initialize noise suppressor
        noiseSuppressorRef.current = createNoiseSuppressor('normal');
        const processedStream = await noiseSuppressorRef.current.initialize(stream);

        // Initialize VAD
        vadRef.current = createVAD('normal');
        await vadRef.current.initialize(processedStream);

        console.log('✅ VAD and Noise Suppression initialized');
      } catch (error) {
        console.error('❌ Failed to initialize VAD/NS:', error);
      }

      await startListening();
      setIsActive(true);
      setLastSpeechTime(Date.now());
    }
  }, [isActive, startListening, stopListening]);

  // Phase 1 (P0): Auto-start removed - user must click to activate
  // (Previously: auto-started for English tutor, now requires manual activation)

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <MicOff className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">
          Continuous voice input not supported in this browser
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Control Button */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={toggleListening}
          disabled={disabled}
          className={`
            relative flex items-center gap-3 px-6 py-3 rounded-xl
            font-medium transition-all duration-300
            focus:outline-none focus:ring-4
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              isActive
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-400'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-400'
            }
          `}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulse effect when active */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-red-400 rounded-xl"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{
                opacity: 0,
                scale: 1.2,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          )}

          {/* Icon */}
          <div className="relative z-10 flex items-center gap-3">
            {isActive ? (
              <>
                <Radio className="w-5 h-5 animate-pulse" />
                <span>Always Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Start Continuous Mode</span>
              </>
            )}
          </div>
        </motion.button>

        {/* Status indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <motion.div
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <span className="font-medium">LIVE</span>
          </motion.div>
        )}
      </div>

      {/* Audio visualization */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700">
              {/* Waveform visualization */}
              <div className="flex items-center gap-1 h-12 mb-3">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                    animate={{
                      height: isListening
                        ? `${Math.max(20, audioLevel * 100 * (0.5 + Math.random() * 0.5))}%`
                        : '20%',
                    }}
                    transition={{
                      duration: 0.15,
                      delay: i * 0.01,
                    }}
                  />
                ))}
              </div>

              {/* Phase 3 (P1): VAD Status Display */}
              <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Energy: {(vadMetrics.energy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    ZCR: {(vadMetrics.zcr * 100).toFixed(1)}%
                  </span>
                </div>
                {isVADSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span className="font-medium">Speaking</span>
                  </motion.div>
                )}
              </div>

              {/* Transcript display */}
              <div className="space-y-2">
                {transcript && (
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2">
                      <Volume2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Recognized:
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {transcript}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {interimTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700"
                  >
                    <div className="flex items-start gap-2">
                      <Mic className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                          Listening...
                        </p>
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                          {interimTranscript}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!transcript && !interimTranscript && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Speak naturally... I&apos;m listening 👂
                    </p>
                  </div>
                )}
              </div>

              {/* Auto-send indicator */}
              {autoSend && transcript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400"
                >
                  Will auto-send after {silenceThreshold / 1000}s of silence
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700"
        >
          <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
