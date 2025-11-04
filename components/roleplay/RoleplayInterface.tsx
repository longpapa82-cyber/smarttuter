'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Lightbulb,
  CheckCircle2,
  Award,
  Clock,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import type { RoleplayScenario } from '@/lib/roleplay/roleplay-scenarios';
import {
  createRoleplaySession,
  processRoleplayTurn,
  evaluateRoleplaySession,
  getHintForCurrentTurn,
  saveRoleplaySession,
  type RoleplaySession,
  type RoleplayMessage,
  type RoleplayEvaluation,
} from '@/lib/roleplay/roleplay-engine';

interface RoleplayInterfaceProps {
  scenario: RoleplayScenario;
  onClose?: () => void;
  onComplete?: (evaluation: RoleplayEvaluation) => void;
}

export default function RoleplayInterface({
  scenario,
  onClose,
  onComplete,
}: RoleplayInterfaceProps) {
  const [session, setSession] = useState<RoleplaySession>(() =>
    createRoleplaySession(scenario)
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<RoleplayEvaluation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  // 세션 저장
  useEffect(() => {
    saveRoleplaySession(session);
  }, [session]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setShowHint(false);

    try {
      const { updatedSession } = await processRoleplayTurn(session, input);
      setSession(updatedSession);
      setInput('');

      // 완료 체크
      if (updatedSession.completionStatus === 'completed') {
        const evalResult = await evaluateRoleplaySession(updatedSession);
        setEvaluation(evalResult);
        setShowEvaluation(true);
        onComplete?.(evalResult);
      }
    } catch (error) {
      console.error('❌ Roleplay turn error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const currentHint = getHintForCurrentTurn(session);

  // 대화 메시지만 필터링 (시스템 메시지 제외)
  const conversationMessages = session.messages.filter(m => m.role !== 'system');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="w-full max-w-4xl h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{scenario.title}</h2>
              <p className="text-sm opacity-90">{scenario.description}</p>
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            )}
          </div>

          {/* 시나리오 정보 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>당신: {scenario.userRole}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>예상 시간: {scenario.estimatedTime}분</span>
            </div>
          </div>

          {/* 진행 상황 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>진행 상황</span>
              <span>{session.turnCount} / {scenario.expectedTurns} 턴</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (session.turnCount / scenario.expectedTurns) * 100)}%` }}
                className="bg-white rounded-full h-full"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* 대화 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversationMessages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              aiRole={scenario.aiRole}
            />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-gray-500"
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm">{scenario.aiRole}이(가) 답변 중...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 힌트 영역 */}
        <AnimatePresence>
          {showHint && currentHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-6 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    힌트
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {currentHint}
                  </p>
                </div>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 입력 영역 */}
        {!showEvaluation && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              {currentHint && !showHint && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShowHint}
                  className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                  title="힌트 보기"
                >
                  <Lightbulb className="w-5 h-5" />
                </motion.button>
              )}

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="영어로 답변하세요..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}

        {/* 평가 결과 */}
        <AnimatePresence>
          {showEvaluation && evaluation && (
            <EvaluationPanel
              evaluation={evaluation}
              scenario={scenario}
              onClose={onClose}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/**
 * 메시지 말풍선
 */
function MessageBubble({
  message,
  aiRole,
}: {
  message: RoleplayMessage;
  aiRole: string;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}
      >
        {!isUser && (
          <div className="text-xs font-semibold mb-1 opacity-70">{aiRole}</div>
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </motion.div>
  );
}

/**
 * 평가 패널
 */
function EvaluationPanel({
  evaluation,
  scenario,
  onClose,
}: {
  evaluation: RoleplayEvaluation;
  scenario: RoleplayScenario;
  onClose?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 bg-white dark:bg-gray-900 overflow-y-auto p-6"
    >
      {/* 종합 점수 */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center mb-6">
        <Award className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-4xl font-bold mb-2">{evaluation.overallScore}점</h2>
        <p className="text-lg opacity-90">
          {evaluation.overallScore >= 80
            ? '훌륭합니다! 🎉'
            : evaluation.overallScore >= 60
            ? '잘했어요! 💪'
            : '좋은 시도였어요! 🌟'}
        </p>
      </div>

      {/* 세부 점수 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ScoreCard
          title="목표 달성"
          score={evaluation.completionScore}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <ScoreCard
          title="언어 정확도"
          score={evaluation.languageAccuracy}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <ScoreCard
          title="상황 적절성"
          score={evaluation.appropriateness}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* 강점 */}
      {evaluation.strengths.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
            ✨ 잘한 점
          </h3>
          <ul className="space-y-1">
            {evaluation.strengths.map((strength, i) => (
              <li key={i} className="text-sm text-green-800 dark:text-green-200">
                • {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 개선점 */}
      {evaluation.improvements.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
            💡 개선할 점
          </h3>
          <ul className="space-y-1">
            {evaluation.improvements.map((improvement, i) => (
              <li key={i} className="text-sm text-orange-800 dark:text-orange-200">
                • {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 다음 단계 */}
      {evaluation.nextSteps.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
            🚀 다음 단계
          </h3>
          <ul className="space-y-1">
            {evaluation.nextSteps.map((step, i) => (
              <li key={i} className="text-sm text-blue-800 dark:text-blue-200">
                • {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 닫기 버튼 */}
      {onClose && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg"
        >
          완료
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * 점수 카드
 */
function ScoreCard({
  title,
  score,
  icon,
}: {
  title: string;
  score: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
      <div className="flex items-center justify-center text-purple-600 mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {score}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{title}</div>
    </div>
  );
}
