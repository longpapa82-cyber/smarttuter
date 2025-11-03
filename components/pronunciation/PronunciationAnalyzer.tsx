// components/pronunciation/PronunciationAnalyzer.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Volume2, TrendingUp, Award } from 'lucide-react';
import { getPronunciationAnalyzer } from '@/lib/pronunciation/pronunciation-analyzer';
import type { PronunciationAnalysis } from '@/types/pronunciation';

interface Props {
  targetText: string;
  onAnalysisComplete?: (analysis: PronunciationAnalysis) => void;
}

export function PronunciationAnalyzerComponent({ targetText, onAnalysisComplete }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [transcript, setTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const analyzerRef = useRef(getPronunciationAnalyzer());
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      await analyzerRef.current.initialize();
    };
    init();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Store reference before cleanup
      const analyzer = analyzerRef.current;
      if (analyzer) {
        analyzer.dispose();
      }
    };
  }, []);

  const updateWaveform = () => {
    try {
      const data = analyzerRef.current.getWaveformData();
      // 30개 샘플만 사용 (시각화용)
      const samples = Array.from(data).filter((_, i) => i % (data.length / 30) === 0).slice(0, 30);
      setWaveformData(samples.map((v) => Math.abs(v)));
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    } catch (error) {
      // Analyzer not ready yet
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 발음 분석기에 스트림 연결
      await analyzerRef.current.connectStream(stream);

      // 미디어 레코더 설정
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await analyzeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      updateWaveform();

      // Web Speech API 음성 인식 시작
      startSpeechRecognition();
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);

    try {
      const result = await analyzerRef.current.analyze(audioBlob, targetText, transcript || targetText);
      setAnalysis(result);
      onAnalysisComplete?.(result);

      console.log('✅ Pronunciation analysis complete:', result);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      alert('발음 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 타겟 텍스트 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">연습할 문장:</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{targetText}</p>
      </div>

      {/* 녹음 컨트롤 */}
      <div className="flex justify-center">
        {!isRecording && !isAnalyzing && !analysis && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Mic className="w-6 h-6" />
            <span className="text-lg font-semibold">발음 연습 시작</span>
          </motion.button>
        )}

        {isRecording && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Square className="w-6 h-6" />
            <span className="text-lg font-semibold">녹음 중지 및 분석</span>
          </motion.button>
        )}
      </div>

      {/* 파형 시각화 */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-1 h-32 bg-gray-900 dark:bg-gray-800 rounded-2xl p-6"
          >
            {waveformData.map((value, i) => (
              <motion.div
                key={i}
                className="w-2 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full"
                animate={{ height: `${Math.max(10, value * 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 인식된 텍스트 */}
      {transcript && isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">인식된 텍스트:</h4>
          <p className="text-lg text-gray-900 dark:text-white">{transcript}</p>
        </motion.div>
      )}

      {/* 분석 중 로딩 */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">발음 분석 중...</p>
        </motion.div>
      )}

      {/* 분석 결과 */}
      {analysis && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 종합 점수 */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-12 h-12" />
              <h2 className="text-4xl font-bold">{Math.round(analysis.overallScore)}</h2>
              <span className="text-2xl font-medium">/ 100</span>
            </div>
            <p className="text-xl font-semibold mb-2">등급: {analysis.grade}</p>
            <p className="text-sm opacity-90">분석 시간: {Math.round(analysis.processingTime)}ms</p>
          </div>

          {/* 세부 점수 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreCard
              title="발음 정확도"
              score={analysis.phonemeAccuracy}
              icon={<Volume2 className="w-6 h-6" />}
              color="blue"
            />
            <ScoreCard
              title="유창성"
              score={analysis.fluencyScore}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <ScoreCard
              title="억양"
              score={analysis.intonationScore}
              icon={<Award className="w-6 h-6" />}
              color="purple"
            />
          </div>

          {/* 개선 제안 */}
          {analysis.improvements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💡 개선 제안</h3>
              <div className="space-y-3">
                {analysis.improvements.map((improvement, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      improvement.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      improvement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {improvement.priority.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{improvement.suggestion}</p>
                      {improvement.examples && (
                        <ul className="mt-2 space-y-1">
                          {improvement.examples.map((example, j) => (
                            <li key={j} className="text-sm text-gray-600 dark:text-gray-400">• {example}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 다시 연습하기 버튼 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setAnalysis(null);
              setTranscript('');
              setWaveformData([]);
            }}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            다시 연습하기
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function ScoreCard({
  title,
  score,
  icon,
  color,
}: {
  title: string;
  score: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-gradient-to-br ${colorClasses[color]} text-white rounded-lg`}>
          {icon}
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(score)}</span>
        <span className="text-lg text-gray-500">/ 100</span>
      </div>
    </div>
  );
}
