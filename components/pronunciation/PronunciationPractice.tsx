'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, CheckCircle2, AlertCircle, Trophy, TrendingUp, Lightbulb, Play } from 'lucide-react';
import { calculateWordAccuracies, type WordAccuracy } from '@/lib/pronunciation/accuracy-calculator';
import { findDifficultPhonemes, type PhonemeTip } from '@/lib/pronunciation/phoneme-tips-database';

interface PronunciationPracticeProps {
  targetText: string;
  onClose?: () => void;
  gradeLevel: string;
}

export default function PronunciationPractice({ targetText, onClose, gradeLevel }: PronunciationPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [wordAccuracies, setWordAccuracies] = useState<WordAccuracy[]>([]);
  const [feedback, setFeedback] = useState('');
  const [phonemeTips, setPhonemeTips] = useState<PhonemeTip[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

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

  // 발음 분석 (고급 분석기 사용)
  const analyzePronunciation = (original: string, recognized: string) => {
    // 단어별 정확도 계산 (Levenshtein Distance 기반)
    const wordAccs = calculateWordAccuracies(original, recognized);
    setWordAccuracies(wordAccs);

    // 전체 정확도 (단어 평균)
    const overallAccuracy = wordAccs.length > 0
      ? wordAccs.reduce((sum, w) => sum + w.accuracy, 0) / wordAccs.length
      : 0;
    setAccuracy(Math.round(overallAccuracy));

    // 어려운 음소 찾기 및 발음 팁 제공
    const difficultWords = wordAccs
      .filter(w => w.accuracy < 80)
      .map(w => w.expectedWord);

    const allTips: PhonemeTip[] = [];
    for (const word of difficultWords) {
      const tips = findDifficultPhonemes(word);
      // 중복 제거 (동일 음소)
      for (const tip of tips) {
        if (!allTips.find(t => t.phoneme === tip.phoneme)) {
          allTips.push(tip);
        }
      }
    }
    setPhonemeTips(allTips.slice(0, 3)); // 최대 3개만 표시

    // 피드백 생성
    generateFeedback(overallAccuracy, wordAccs);
    setAttemptCount(prev => prev + 1);
  };

  // 피드백 생성
  const generateFeedback = (acc: number, words: WordAccuracy[]) => {
    let feedbackText = '';

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
      setWordAccuracies([]);
      setFeedback('');
      setPhonemeTips([]);

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

  // 단어별 발음 재생
  const playWord = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setPlayingWord(word);
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // 더 느리게
      utterance.onend = () => setPlayingWord(null);
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
            {wordAccuracies.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-3">단어별 분석</h4>
                <div className="flex flex-wrap gap-2">
                  {wordAccuracies.map((wordAcc, index) => {
                    const bgColor =
                      wordAcc.color === 'green' ? 'bg-green-100 text-green-700 border-green-300' :
                      wordAcc.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                      'bg-red-100 text-red-700 border-red-300';

                    return (
                      <button
                        key={index}
                        onClick={() => playWord(wordAcc.expectedWord)}
                        disabled={playingWord === wordAcc.expectedWord}
                        className={`
                          group relative px-3 py-1.5 rounded-lg text-sm font-medium border
                          ${bgColor}
                          ${playingWord === wordAcc.expectedWord ? 'opacity-50' : 'hover:shadow-md transition-all cursor-pointer'}
                        `}
                      >
                        <span className="flex items-center gap-1.5">
                          {wordAcc.expectedWord}
                          {wordAcc.accuracy < 90 && (
                            <span className="text-xs opacity-70">
                              ({wordAcc.accuracy}%)
                            </span>
                          )}
                          {playingWord !== wordAcc.expectedWord && (
                            <Play className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                          )}
                        </span>
                        {wordAcc.accuracy < 90 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            클릭하여 정확한 발음 듣기
                          </div>
                        )}
                      </button>
                    );
                  })}
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

            {/* Phoneme Tips (발음 팁) */}
            {phonemeTips.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-purple-900">발음 교정 가이드</h4>
                </div>
                <div className="space-y-4">
                  {phonemeTips.map((tip, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-purple-200">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-mono font-bold mb-1">
                            {tip.phoneme}
                          </span>
                          <p className="text-sm font-medium text-gray-900">{tip.koreanGuide}</p>
                        </div>
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-medium
                          ${tip.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                            tip.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'}
                        `}>
                          {tip.difficulty === 'hard' ? '어려움' : tip.difficulty === 'medium' ? '보통' : '쉬움'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">조음 방법:</span>
                          <p className="text-gray-600 mt-1">{tip.articulationTip}</p>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">예시 단어:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {tip.examples.map((example, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>

                        {tip.commonMistakes.length > 0 && (
                          <div>
                            <span className="font-medium text-red-600">흔한 실수:</span>
                            <ul className="mt-1 space-y-0.5">
                              {tip.commonMistakes.map((mistake, i) => (
                                <li key={i} className="text-gray-600 text-xs">• {mistake}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <span className="font-medium text-blue-600">연습 단어:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {tip.practiceWords.map((word, i) => (
                              <button
                                key={i}
                                onClick={() => playWord(word)}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                              >
                                {word} 🔊
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Try Again Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAccuracy(null);
                  setWordAccuracies([]);
                  setRecognizedText('');
                  setFeedback('');
                  setPhonemeTips([]);
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
