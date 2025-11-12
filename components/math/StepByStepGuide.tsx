'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  HelpCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  type Step,
  type StepByStepSession,
  type SessionSummary,
  createStepByStepSession,
  getCurrentStep,
  calculateProgress,
  moveToNextStep,
  completeStep,
  recordHintUsed,
  getSessionSummary,
} from '@/lib/math/step-by-step-solver';

interface StepByStepGuideProps {
  problem: string;
  gradeLevel?: string;
  onComplete?: (summary: SessionSummary) => void;
  onClose?: () => void;
}

export default function StepByStepGuide({
  problem,
  gradeLevel,
  onComplete,
  onClose,
}: StepByStepGuideProps) {
  const [session, setSession] = useState<StepByStepSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [extraHint, setExtraHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [validating, setValidating] = useState(false);
  const [attempts, setAttempts] = useState<string[]>([]);

  // 문제 분석 및 단계 생성
  useEffect(() => {
    analyzeProblem();
  }, [problem]);

  const analyzeProblem = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('[StepByStepGuide] Analyzing problem...');
      console.log('[StepByStepGuide] Problem:', problem);
      console.log('[StepByStepGuide] Grade level:', gradeLevel);

      // 타임아웃 설정 (30초) - 재시도 로직을 고려하여 충분한 시간 제공
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/math/step-by-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          problem,
          gradeLevel,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('[StepByStepGuide] Response status:', response.status);
      console.log('[StepByStepGuide] Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[StepByStepGuide] Error response:', errorText);
        throw new Error(`Failed to analyze problem (status: ${response.status})`);
      }

      console.log('[StepByStepGuide] Parsing JSON response...');
      const data = await response.json();
      console.log('[StepByStepGuide] Parsed data:', JSON.stringify(data).substring(0, 200));

      if (!data.success) {
        console.error('[StepByStepGuide] API returned success=false');
        throw new Error(data.error || 'Analysis failed');
      }

      if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
        console.error('[StepByStepGuide] Invalid steps data:', data.steps);
        throw new Error('No steps returned from analysis');
      }

      console.log('[StepByStepGuide] ✅ Analysis complete');
      console.log(`[StepByStepGuide] Steps: ${data.steps.length}`);
      console.log(`[StepByStepGuide] Problem type: ${data.problemType}`);
      console.log(`[StepByStepGuide] Difficulty: ${data.difficulty}`);

      // 세션 생성
      const newSession = createStepByStepSession(
        problem,
        data.steps,
        data.problemType,
        data.difficulty
      );

      console.log('[StepByStepGuide] Session created:', newSession.id);
      setSession(newSession);
      console.log('[StepByStepGuide] State updated, loading should be false now');
    } catch (err: any) {
      console.error('[StepByStepGuide] ❌ Error caught:', err);
      console.error('[StepByStepGuide] Error name:', err.name);
      console.error('[StepByStepGuide] Error message:', err.message);

      if (err.name === 'AbortError') {
        setError('요청 시간이 초과되었습니다. 문제가 너무 복잡할 수 있습니다.');
      } else {
        setError(err.message || 'Failed to analyze problem');
      }
    } finally {
      console.log('[StepByStepGuide] Finally block - setting loading to false');
      setLoading(false);
    }
  };

  // 답변 제출
  const handleSubmit = async () => {
    if (!session || !studentAnswer.trim()) return;

    const currentStep = getCurrentStep(session);
    if (!currentStep) return;

    setValidating(true);
    setAttempts([...attempts, studentAnswer]);

    try {
      console.log('[StepByStepGuide] Validating answer...');

      // 타임아웃 설정 (20초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('/api/math/step-by-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          problem,
          step: currentStep,
          studentAnswer,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to validate answer');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Validation failed');
      }

      console.log('[StepByStepGuide] ✅ Validation complete');
      console.log(`[StepByStepGuide] Is correct: ${data.isCorrect}`);

      // 단계 완료 처리
      const updatedSession = completeStep(
        session,
        session.currentStepIndex,
        studentAnswer,
        data.isCorrect,
        data.feedback
      );

      setSession(updatedSession);

      // 입력 초기화
      setStudentAnswer('');
      setShowHint(false);
      setExtraHint('');

      // 정답이든 오답이든 자동으로 다음 단계로 (피드백 확인 후)
      // 정답: 2초 후, 오답: 3초 후 (피드백 읽을 시간)
      const delay = data.isCorrect ? 2000 : 3000;

      setTimeout(() => {
        setAttempts([]);

        if (updatedSession.currentStepIndex + 1 < updatedSession.steps.length) {
          const nextSession = moveToNextStep(updatedSession);
          setSession(nextSession);
        } else {
          // 완료!
          const finalSession = moveToNextStep(updatedSession);
          setSession(finalSession);
          const summary = getSessionSummary(finalSession);
          onComplete?.(summary);
        }
      }, delay);
    } catch (err: any) {
      console.error('[StepByStepGuide] Validation error:', err);
      setError(err.message || 'Failed to validate answer');
    } finally {
      setValidating(false);
    }
  };

  // 힌트 요청
  const handleHintRequest = async () => {
    if (!session) return;

    const currentStep = getCurrentStep(session);
    if (!currentStep) return;

    setLoadingHint(true);
    setShowHint(true);

    try {
      console.log('[StepByStepGuide] Requesting hint...');

      // 타임아웃 설정 (20초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('/api/math/step-by-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hint',
          problem,
          step: currentStep,
          studentAttempts: attempts,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to get hint');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Hint request failed');
      }

      console.log('[StepByStepGuide] ✅ Hint received');

      setExtraHint(data.hint);

      // 힌트 사용 기록
      setSession(recordHintUsed(session));
    } catch (err: any) {
      console.error('[StepByStepGuide] Hint error:', err);
      setError(err.message || 'Failed to get hint');
    } finally {
      setLoadingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">문제를 분석하고 있어요...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">오류 발생</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={analyzeProblem}
              className="mt-3 text-sm text-red-700 hover:text-red-900 font-medium"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentStep = getCurrentStep(session);
  const progress = calculateProgress(session);

  // 완료 화면
  if (session.completed) {
    const summary = getSessionSummary(session);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          축하합니다! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          문제를 모두 풀었어요!
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-600">
              {summary.score}점
            </div>
            <div className="text-sm text-gray-600">점수</div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600">
              {summary.correctSteps}/{summary.totalSteps}
            </div>
            <div className="text-sm text-gray-600">정답</div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-600">
              {summary.hintsUsed}개
            </div>
            <div className="text-sm text-gray-600">힌트 사용</div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-bold text-orange-600">
              {Math.round((summary.timeSpent || 0) / 1000)}초
            </div>
            <div className="text-sm text-gray-600">소요 시간</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          완료
        </button>
      </motion.div>
    );
  }

  if (!currentStep) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 진행도 */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">
            단계 {session.currentStepIndex + 1} / {session.steps.length}
          </span>
          <span className="text-blue-600 font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 문제 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">풀이할 문제</h3>
        <p className="text-lg font-semibold text-gray-900">{problem}</p>
      </div>

      {/* 현재 단계 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={session.currentStepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white border-2 border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              {currentStep.stepNumber}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                {currentStep.instruction}
              </h3>
              {currentStep.explanation && (
                <p className="text-sm text-gray-600 mb-3">
                  {currentStep.explanation}
                </p>
              )}
            </div>
          </div>

          {/* 힌트 */}
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-1">💡 힌트</p>
                  <p className="text-sm text-yellow-800">
                    {extraHint || currentStep.hint || '막히면 힌트를 확인해보세요!'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 피드백 (이전 답변에 대한) */}
          {currentStep.completed && currentStep.feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 mb-4 ${
                currentStep.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {currentStep.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-1 ${
                    currentStep.isCorrect ? 'text-green-900' : 'text-orange-900'
                  }`}>
                    {currentStep.isCorrect ? '정답이에요! ✨' : '다시 한번 생각해볼까요?'}
                  </p>
                  <p className={`text-sm ${
                    currentStep.isCorrect ? 'text-green-800' : 'text-orange-800'
                  }`}>
                    {currentStep.feedback}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 답변 입력 */}
          {!currentStep.completed && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  답을 입력하세요
                </label>
                <input
                  type="text"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="예: x=3, 2+1*3=5, ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  disabled={validating}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!studentAnswer.trim() || validating}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {validating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      확인 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      제출
                    </>
                  )}
                </button>

                <button
                  onClick={handleHintRequest}
                  disabled={loadingHint}
                  className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-all flex items-center gap-2"
                >
                  {loadingHint ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Lightbulb className="w-5 h-5" />
                  )}
                  힌트
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 통계 */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>힌트 사용: {session.hintsUsed}개</div>
        <div>정답률: {Math.round((session.steps.filter(s => s.isCorrect).length / Math.max(session.steps.filter(s => s.completed).length, 1)) * 100)}%</div>
      </div>
    </div>
  );
}
