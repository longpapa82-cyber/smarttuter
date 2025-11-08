'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, CheckCircle2, AlertCircle, Trophy, TrendingUp } from 'lucide-react';

interface PronunciationPracticeProps {
  targetText: string;
  onClose?: () => void;
  gradeLevel: string;
}

interface Word {
  text: string;
  accuracy: number;
  isCorrect: boolean;
}

export default function PronunciationPractice({ targetText, onClose, gradeLevel }: PronunciationPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [wordResults, setWordResults] = useState<Word[]>([]);
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Web Speech API 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 3;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          console.log('🎤 Speech recognition started');
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setIsRecording(false);
          console.log('🎤 Speech recognition ended');
        };

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;

          console.log(`📝 Recognized: "${transcript}" (confidence: ${(confidence * 100).toFixed(1)}%)`);
          setRecognizedText(transcript);

          // 발음 분석 수행
          analyzePronunciation(targetText, transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('🚨 Speech recognition error:', event.error);
          setIsListening(false);
          setIsRecording(false);

          if (event.error === 'no-speech') {
            setFeedback('목소리가 들리지 않아요. 다시 시도해주세요.');
          } else if (event.error === 'audio-capture') {
            setFeedback('마이크를 사용할 수 없어요. 마이크 권한을 확인해주세요.');
          } else {
            setFeedback('인식에 실패했어요. 다시 시도해주세요.');
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Levenshtein Distance 계산
  const levenshteinDistance = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[s2.length][s1.length];
  };

  // 유사도 계산
  const calculateSimilarity = (str1: string, str2: string): number => {
    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100;
    return ((maxLength - distance) / maxLength) * 100;
  };

  // 발음 분석
  const analyzePronunciation = (original: string, recognized: string) => {
    const normalizeText = (text: string) =>
      text.toLowerCase().replace(/[.,!?;:]/g, '').trim();

    const originalWords = normalizeText(original).split(/\s+/);
    const recognizedWords = normalizeText(recognized).split(/\s+/);

    // 단어별 분석
    const words: Word[] = [];
    const maxLength = Math.max(originalWords.length, recognizedWords.length);

    for (let i = 0; i < maxLength; i++) {
      const orig = originalWords[i] || '';
      const recog = recognizedWords[i] || '';

      if (orig || recog) {
        const wordAccuracy = calculateSimilarity(orig, recog);
        words.push({
          text: orig,
          accuracy: Math.round(wordAccuracy),
          isCorrect: wordAccuracy >= 80,
        });
      }
    }

    setWordResults(words);

    // 전체 정확도
    const overallAccuracy = calculateSimilarity(
      normalizeText(original),
      normalizeText(recognized)
    );
    setAccuracy(Math.round(overallAccuracy));

    // 피드백 생성
    generateFeedback(overallAccuracy, words);
    setAttemptCount(prev => prev + 1);
  };

  // 피드백 생성
  const generateFeedback = (acc: number, words: Word[]) => {
    let feedbackText = '';
    const suggestionsList: string[] = [];

    if (acc >= 95) {
      feedbackText = '완벽해요! 🌟 원어민처럼 발음하셨어요!';
    } else if (acc >= 85) {
      feedbackText = '아주 좋아요! 👍 거의 완벽한 발음이에요!';
    } else if (acc >= 70) {
      feedbackText = '잘했어요! 😊 조금만 더 연습하면 완벽해질 거예요!';
    } else if (acc >= 50) {
      feedbackText = '괜찮아요! 💪 조금 더 천천히 또박또박 발음해보세요.';
    } else {
      feedbackText = '다시 한번 시도해봐요! 🎯 천천히 따라 읽어보세요.';
    }

    setFeedback(feedbackText);

    // 틀린 단어
    const incorrectWords = words.filter(w => !w.isCorrect && w.text);
    if (incorrectWords.length > 0) {
      suggestionsList.push('특히 주의가 필요한 단어:');
      incorrectWords.slice(0, 3).forEach(word => {
        suggestionsList.push(`  • "${word.text}" (${word.accuracy}%)`);
      });
    }

    // 개선 팁
    if (acc < 85) {
      suggestionsList.push('');
      suggestionsList.push('💡 발음 개선 팁:');
      if (acc < 70) {
        suggestionsList.push('  • 더 천천히, 또박또박 발음하세요');
        suggestionsList.push('  • 각 단어를 명확하게 구분하세요');
      }
      suggestionsList.push('  • 마이크와 입의 거리를 적당히 유지하세요');
    }

    setSuggestions(suggestionsList);
  };

  // 녹음 시작/중지
  const toggleRecording = async () => {
    if (isRecording) {
      // 중지
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // 시작
      setRecognizedText('');
      setAccuracy(null);
      setWordResults([]);
      setFeedback('');
      setSuggestions([]);

      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsRecording(true);
        }
      } catch (error) {
        console.error('Failed to start recording:', error);
        setFeedback('마이크 권한을 확인해주세요.');
      }
    }
  };

  // TTS로 예문 듣기
  const playTargetText = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(targetText);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // 약간 느리게
      window.speechSynthesis.speak(utterance);
    }
  };

  // 정확도 색상
  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return 'text-green-600';
    if (acc >= 75) return 'text-blue-600';
    if (acc >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBgColor = (acc: number) => {
    if (acc >= 90) return 'bg-green-500';
    if (acc >= 75) return 'bg-blue-500';
    if (acc >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">발음 연습</h3>
            <p className="text-sm text-gray-500">아래 문장을 따라 읽어보세요</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Target Text */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex items-start justify-between gap-4">
          <p className="text-lg font-medium text-gray-900 leading-relaxed flex-1">
            {targetText}
          </p>
          <button
            onClick={playTargetText}
            className="shrink-0 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110"
            title="발음 듣기"
          >
            <Volume2 className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Recording Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={toggleRecording}
          whileTap={{ scale: 0.95 }}
          className={`
            relative w-24 h-24 rounded-full shadow-2xl transition-all
            ${isRecording
              ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse'
              : 'bg-gradient-to-br from-green-500 to-blue-500 hover:shadow-green-500/50'
            }
          `}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {isRecording ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </div>
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-300"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>

      <p className="text-center text-sm text-gray-500">
        {isRecording ? '🎤 듣고 있어요... 말씀해주세요!' : '🎙️ 버튼을 누르고 따라 읽어보세요'}
      </p>

      {/* Results */}
      <AnimatePresence>
        {accuracy !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Accuracy Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">발음 정확도</span>
                <div className="flex items-center gap-2">
                  {accuracy >= 85 ? (
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  )}
                  <span className={`text-3xl font-bold ${getAccuracyColor(accuracy)}`}>
                    {accuracy}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${accuracy}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full ${getAccuracyBgColor(accuracy)} rounded-full`}
                />
              </div>

              {/* Feedback */}
              <p className="mt-4 text-center text-lg font-medium text-gray-700">
                {feedback}
              </p>
            </div>

            {/* Word-by-Word Analysis */}
            {wordResults.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-3">단어별 분석</h4>
                <div className="flex flex-wrap gap-2">
                  {wordResults.map((word, index) => (
                    <div
                      key={index}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium
                        ${word.isCorrect
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-red-100 text-red-700 border border-red-300'
                        }
                      `}
                    >
                      {word.text}
                      {!word.isCorrect && (
                        <span className="ml-1 text-xs opacity-70">
                          ({word.accuracy}%)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recognized Text */}
            {recognizedText && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-2">인식된 발음:</p>
                <p className="text-gray-900">{recognizedText}</p>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <p key={index} className="text-sm text-blue-900">
                      {suggestion}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Try Again Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAccuracy(null);
                  setWordResults([]);
                  setRecognizedText('');
                  setFeedback('');
                  setSuggestions([]);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                다시 연습하기
              </button>
              {accuracy >= 85 && onClose && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  완료! ✓
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempt Counter */}
      {attemptCount > 0 && (
        <div className="text-center text-xs text-gray-400">
          연습 횟수: {attemptCount}회
        </div>
      )}
    </div>
  );
}
