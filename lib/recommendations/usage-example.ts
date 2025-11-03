/**
 * SessionCompleteModal 사용 예제
 *
 * 튜터 페이지에서 학습 세션 완료 시 이 모달을 표시하는 방법
 */

import { useState } from "react";
import { SessionCompleteModal } from "@/components/modals/SessionCompleteModal";
import { LearningContext } from "./supplementary-learning";

/**
 * 예제 1: 영어 튜터에서 세션 완료 시
 */
export function useEnglishSessionComplete() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionContext, setSessionContext] = useState<LearningContext | null>(null);

  const handleSessionComplete = (
    sessionDuration: number,
    topicsDiscussed: string[],
    weaknessAreas?: string[],
    masteryScore?: number,
    emotionalState?: 'positive' | 'neutral' | 'frustrated'
  ) => {
    const context: LearningContext = {
      subject: 'english',
      sessionDuration,
      topicsDiscussed,
      weaknessAreas,
      masteryScore,
      emotionalState,
      consecutiveSessions: getConsecutiveSessions(), // localStorage에서 가져오기
    };

    setSessionContext(context);
    setIsModalOpen(true);
  };

  return {
    isModalOpen,
    sessionContext,
    handleSessionComplete,
    closeModal: () => setIsModalOpen(false),
  };
}

/**
 * 예제 2: 수학 튜터에서 세션 완료 시
 */
export function useMathSessionComplete() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionContext, setSessionContext] = useState<LearningContext | null>(null);

  const handleSessionComplete = (
    sessionDuration: number,
    topicsDiscussed: string[],
    weaknessAreas?: string[],
    masteryScore?: number
  ) => {
    const context: LearningContext = {
      subject: 'math',
      sessionDuration,
      topicsDiscussed,
      weaknessAreas,
      masteryScore,
      consecutiveSessions: getConsecutiveSessions(),
    };

    setSessionContext(context);
    setIsModalOpen(true);
  };

  return {
    isModalOpen,
    sessionContext,
    handleSessionComplete,
    closeModal: () => setIsModalOpen(false),
  };
}

/**
 * localStorage에서 연속 학습 세션 수 가져오기
 */
function getConsecutiveSessions(): number {
  if (typeof window === 'undefined') return 0;

  const lastSessionDate = localStorage.getItem('lastSessionDate');
  const consecutiveSessions = parseInt(localStorage.getItem('consecutiveSessions') || '0', 10);

  const today = new Date().toDateString();

  if (lastSessionDate === today) {
    // 오늘 이미 학습했으면 그대로 반환
    return consecutiveSessions;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastSessionDate === yesterday.toDateString()) {
    // 어제 학습했으면 +1
    const newCount = consecutiveSessions + 1;
    localStorage.setItem('consecutiveSessions', newCount.toString());
    localStorage.setItem('lastSessionDate', today);
    return newCount;
  }

  // 연속 학습이 끊겼으면 1로 리셋
  localStorage.setItem('consecutiveSessions', '1');
  localStorage.setItem('lastSessionDate', today);
  return 1;
}

/**
 * 튜터 컴포넌트 통합 예제
 */
/*
// EnglishTutorClient.tsx 또는 MathTutorClient.tsx에서:

import { useEnglishSessionComplete } from "@/lib/recommendations/usage-example";
import { SessionCompleteModal } from "@/components/modals/SessionCompleteModal";

export function EnglishTutorClient() {
  const { isModalOpen, sessionContext, handleSessionComplete, closeModal } = useEnglishSessionComplete();

  // 세션 종료 버튼 클릭 시
  const handleEndSession = () => {
    const sessionDuration = calculateSessionDuration(); // 세션 시작부터 경과 시간 (분)
    const topicsDiscussed = extractTopicsFromMessages(); // 대화에서 주제 추출
    const weaknessAreas = analyzeWeaknesses(); // 약점 분석 (선택적)
    const masteryScore = calculateMasteryScore(); // 마스터리 점수 (선택적)
    const emotionalState = detectEmotionalState(); // 감정 상태 (선택적)

    handleSessionComplete(
      sessionDuration,
      topicsDiscussed,
      weaknessAreas,
      masteryScore,
      emotionalState
    );
  };

  return (
    <>
      {// ... 기존 튜터 UI}
      <button onClick={handleEndSession}>세션 종료</button>

      {// SessionCompleteModal}
      {sessionContext && (
        <SessionCompleteModal
          isOpen={isModalOpen}
          onClose={closeModal}
          context={sessionContext}
          sessionStats={{
            totalMessages: messages.length,
            correctAnswers: 8,
            totalQuestions: 10,
          }}
        />
      )}
    </>
  );
}
*/

/**
 * 간단한 사용 예제 (최소 구현)
 */
/*
// 최소한의 정보만으로 모달 표시
const handleQuickSessionComplete = () => {
  const context: LearningContext = {
    subject: 'english',
    sessionDuration: 25,
    topicsDiscussed: ['Daily Conversation', 'Grammar'],
    consecutiveSessions: 1,
  };

  setSessionContext(context);
  setIsModalOpen(true);
};
*/
