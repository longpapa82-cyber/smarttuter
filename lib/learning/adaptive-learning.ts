/**
 * Adaptive Learning System
 * 학생의 실력에 따라 동적으로 난이도를 조정하는 시스템
 */

import { CEFRLevel, LevelAssessment, ConversationMessage, assessLevel } from './level-detector';

export interface AdaptiveLearningState {
  userId: string;
  currentLevel: CEFRLevel;
  conversationHistory: ConversationMessage[];
  turnsSinceLastAssessment: number;
  assessmentHistory: LevelAssessment[];
  lastAssessmentTurn: number;
  totalTurns: number;
  levelChangeHistory: Array<{
    fromLevel: CEFRLevel;
    toLevel: CEFRLevel;
    timestamp: Date;
    reason: string;
  }>;
}

export interface DifficultyAdjustmentResult {
  shouldAdjust: boolean;
  newLevel?: CEFRLevel;
  reason: string;
  assessment?: LevelAssessment;
  isLevelUp: boolean;
  isLevelDown: boolean;
}

/**
 * 초기 적응형 학습 상태 생성
 */
export function createInitialAdaptiveState(
  userId: string,
  initialLevel: CEFRLevel
): AdaptiveLearningState {
  return {
    userId,
    currentLevel: initialLevel,
    conversationHistory: [],
    turnsSinceLastAssessment: 0,
    assessmentHistory: [],
    lastAssessmentTurn: 0,
    totalTurns: 0,
    levelChangeHistory: [],
  };
}

/**
 * 대화 턴 추가 및 자동 평가
 * @param state 현재 적응형 학습 상태
 * @param userMessage 사용자 메시지
 * @param assessmentInterval 평가 간격 (기본: 10턴)
 * @returns 업데이트된 상태 및 난이도 조정 결과
 */
export function addConversationTurn(
  state: AdaptiveLearningState,
  userMessage: string,
  assessmentInterval: number = 10
): {
  updatedState: AdaptiveLearningState;
  adjustmentResult: DifficultyAdjustmentResult;
} {
  // 대화 이력에 추가
  const newMessage: ConversationMessage = {
    content: userMessage,
    timestamp: new Date(),
  };

  const updatedHistory = [...state.conversationHistory, newMessage];
  const newTotalTurns = state.totalTurns + 1;
  const newTurnsSinceLastAssessment = state.turnsSinceLastAssessment + 1;

  // 평가 간격 체크
  const shouldAssess = newTurnsSinceLastAssessment >= assessmentInterval;

  if (!shouldAssess) {
    // 평가하지 않음
    return {
      updatedState: {
        ...state,
        conversationHistory: updatedHistory,
        totalTurns: newTotalTurns,
        turnsSinceLastAssessment: newTurnsSinceLastAssessment,
      },
      adjustmentResult: {
        shouldAdjust: false,
        reason: `다음 평가까지 ${assessmentInterval - newTurnsSinceLastAssessment}턴 남음`,
        isLevelUp: false,
        isLevelDown: false,
      },
    };
  }

  // 10턴 동안의 메시지만 평가에 사용 (최신 데이터)
  const recentMessages = updatedHistory.slice(-assessmentInterval);
  const assessment = assessLevel(recentMessages);

  // 레벨 변경 필요 여부 판단
  const adjustmentResult = determineAdjustment(
    state.currentLevel,
    assessment,
    state.assessmentHistory
  );

  let updatedState: AdaptiveLearningState = {
    ...state,
    conversationHistory: updatedHistory,
    totalTurns: newTotalTurns,
    turnsSinceLastAssessment: 0,
    lastAssessmentTurn: newTotalTurns,
    assessmentHistory: [...state.assessmentHistory, assessment],
  };

  // 레벨 변경이 필요한 경우
  if (adjustmentResult.shouldAdjust && adjustmentResult.newLevel) {
    updatedState = {
      ...updatedState,
      currentLevel: adjustmentResult.newLevel,
      levelChangeHistory: [
        ...state.levelChangeHistory,
        {
          fromLevel: state.currentLevel,
          toLevel: adjustmentResult.newLevel,
          timestamp: new Date(),
          reason: adjustmentResult.reason,
        },
      ],
    };
  }

  return {
    updatedState,
    adjustmentResult: {
      ...adjustmentResult,
      assessment,
    },
  };
}

/**
 * 난이도 조정 판단
 */
function determineAdjustment(
  currentLevel: CEFRLevel,
  assessment: LevelAssessment,
  assessmentHistory: LevelAssessment[]
): DifficultyAdjustmentResult {
  const { currentLevel: assessedLevel, confidence, assessmentDetails } = assessment;

  // 신뢰도가 낮으면 조정하지 않음
  if (confidence < 60) {
    return {
      shouldAdjust: false,
      reason: `평가 신뢰도 부족 (${confidence}% < 60%)`,
      isLevelUp: false,
      isLevelDown: false,
    };
  }

  const levelToNumber = (level: CEFRLevel): number => {
    const mapping = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    return mapping[level];
  };

  const numberToLevel = (num: number): CEFRLevel => {
    const mapping: Record<number, CEFRLevel> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
    return mapping[num] || 'A1';
  };

  const currentNum = levelToNumber(currentLevel);
  const assessedNum = levelToNumber(assessedLevel);
  const diff = assessedNum - currentNum;

  // 레벨이 동일하면 조정 불필요
  if (diff === 0) {
    return {
      shouldAdjust: false,
      reason: `현재 레벨 ${currentLevel}이 적절합니다`,
      isLevelUp: false,
      isLevelDown: false,
    };
  }

  // 레벨업 판단 (평가 레벨이 2단계 이상 높고, 신뢰도 80% 이상)
  if (diff >= 2 && confidence >= 80) {
    const newLevel = numberToLevel(currentNum + 1);
    return {
      shouldAdjust: true,
      newLevel,
      reason: `뛰어난 실력 향상! ${currentLevel} → ${newLevel}`,
      isLevelUp: true,
      isLevelDown: false,
    };
  }

  // 레벨업 판단 (평가 레벨이 1단계 높고, 신뢰도 70% 이상, 점수 75점 이상)
  if (diff >= 1 && confidence >= 70 && assessmentDetails.overallScore >= 75) {
    const newLevel = numberToLevel(currentNum + 1);
    return {
      shouldAdjust: true,
      newLevel,
      reason: `실력 향상 확인! ${currentLevel} → ${newLevel}`,
      isLevelUp: true,
      isLevelDown: false,
    };
  }

  // 레벨다운 판단 (평가 레벨이 2단계 이상 낮고, 신뢰도 70% 이상)
  if (diff <= -2 && confidence >= 70) {
    const newLevel = numberToLevel(currentNum - 1);
    return {
      shouldAdjust: true,
      newLevel,
      reason: `좀 더 기초부터 다시 해봐요. ${currentLevel} → ${newLevel}`,
      isLevelUp: false,
      isLevelDown: true,
    };
  }

  // 레벨다운 판단 (평가 레벨이 1단계 낮고, 점수 40점 이하, 연속 2회 낮은 평가)
  if (diff <= -1 && assessmentDetails.overallScore <= 40) {
    // 최근 2회 평가가 모두 낮은지 확인
    const recentAssessments = assessmentHistory.slice(-2);
    const allLowScores = recentAssessments.every(a => a.assessmentDetails.overallScore <= 50);

    if (allLowScores && recentAssessments.length >= 2) {
      const newLevel = numberToLevel(currentNum - 1);
      return {
        shouldAdjust: true,
        newLevel,
        reason: `난이도를 조금 낮춰봐요. ${currentLevel} → ${newLevel}`,
        isLevelUp: false,
        isLevelDown: true,
      };
    }
  }

  // 조정 불필요
  return {
    shouldAdjust: false,
    reason: `현재 레벨 ${currentLevel}을 유지합니다 (평가: ${assessedLevel}, 점수: ${assessmentDetails.overallScore})`,
    isLevelUp: false,
    isLevelDown: false,
  };
}

/**
 * 학습 경로 추천
 */
export interface LearningPathRecommendation {
  focusAreas: Array<{
    area: 'vocabulary' | 'grammar' | 'complexity';
    priority: 'high' | 'medium' | 'low';
    currentLevel: CEFRLevel;
    targetLevel: CEFRLevel;
    activities: string[];
  }>;
  nextTopics: string[];
  practiceExercises: Array<{
    type: string;
    description: string;
    difficulty: CEFRLevel;
  }>;
  estimatedTimeToNextLevel: string;
}

/**
 * 맞춤형 학습 경로 생성
 */
export function generateLearningPath(
  state: AdaptiveLearningState,
  latestAssessment: LevelAssessment
): LearningPathRecommendation {
  const { currentLevel, assessmentHistory } = state;
  const { assessmentDetails, weaknesses, strengths } = latestAssessment;

  const levelToNumber = (level: CEFRLevel): number => {
    const mapping = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    return mapping[level];
  };

  const numberToLevel = (num: number): CEFRLevel => {
    const mapping: Record<number, CEFRLevel> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
    return mapping[num] || 'A1';
  };

  // 약점 영역 파악
  const focusAreas: LearningPathRecommendation['focusAreas'] = [];

  const currentNum = levelToNumber(currentLevel);
  const targetNum = Math.min(6, currentNum + 1);
  const targetLevel = numberToLevel(targetNum);

  // 어휘 분석
  const vocabNum = levelToNumber(assessmentDetails.vocabularyLevel);
  if (vocabNum < currentNum) {
    focusAreas.push({
      area: 'vocabulary',
      priority: 'high',
      currentLevel: assessmentDetails.vocabularyLevel,
      targetLevel: currentLevel,
      activities: [
        `${currentLevel} 레벨 핵심 어휘 100개 암기`,
        '매일 새로운 단어 10개씩 학습',
        '어휘 퀴즈 풀기 (플래시카드)',
        '문맥 속에서 새 단어 사용 연습',
      ],
    });
  }

  // 문법 분석
  const grammarNum = levelToNumber(assessmentDetails.grammarLevel);
  if (grammarNum < currentNum) {
    focusAreas.push({
      area: 'grammar',
      priority: 'high',
      currentLevel: assessmentDetails.grammarLevel,
      targetLevel: currentLevel,
      activities: [
        `${currentLevel} 레벨 문법 패턴 집중 학습`,
        '문법 예문 따라 쓰기',
        '문법 퀴즈 풀기',
        '실제 대화에서 문법 적용 연습',
      ],
    });
  }

  // 문장 복잡도 분석
  const complexityNum = levelToNumber(assessmentDetails.sentenceComplexity);
  if (complexityNum < currentNum) {
    focusAreas.push({
      area: 'complexity',
      priority: 'medium',
      currentLevel: assessmentDetails.sentenceComplexity,
      targetLevel: currentLevel,
      activities: [
        '긴 문장 만들기 연습',
        '접속사 활용하기 (because, although, however)',
        '관계대명사로 문장 연결하기',
        '복잡한 문장 구조 읽기 연습',
      ],
    });
  }

  // 강점 영역 유지
  if (vocabNum >= currentNum) {
    focusAreas.push({
      area: 'vocabulary',
      priority: 'low',
      currentLevel: assessmentDetails.vocabularyLevel,
      targetLevel: targetLevel,
      activities: [
        `${targetLevel} 레벨 고급 어휘 학습`,
        '동의어/반의어 확장',
        '관용구 및 숙어 학습',
      ],
    });
  }

  if (grammarNum >= currentNum) {
    focusAreas.push({
      area: 'grammar',
      priority: 'low',
      currentLevel: assessmentDetails.grammarLevel,
      targetLevel: targetLevel,
      activities: [
        `${targetLevel} 레벨 문법 도전`,
        '고급 문법 구조 학습',
        '뉘앙스 차이 이해하기',
      ],
    });
  }

  // 다음 학습 주제 (레벨별)
  const nextTopics = getNextTopics(currentLevel, weaknesses);

  // 연습 문제 추천
  const practiceExercises = getPracticeExercises(currentLevel, focusAreas);

  // 다음 레벨까지 예상 시간
  const estimatedTimeToNextLevel = estimateTimeToNextLevel(
    currentLevel,
    assessmentHistory,
    focusAreas
  );

  return {
    focusAreas,
    nextTopics,
    practiceExercises,
    estimatedTimeToNextLevel,
  };
}

/**
 * 다음 학습 주제 추천
 */
function getNextTopics(currentLevel: CEFRLevel, weaknesses: string[]): string[] {
  const topicsByLevel: Record<CEFRLevel, string[]> = {
    A1: ['자기소개', '일상 인사', '가족 소개', '기본 질문하기', '숫자와 시간'],
    A2: ['쇼핑하기', '길 묻기', '과거 경험 말하기', '계획 이야기하기', '의견 표현하기'],
    B1: ['교육과 학습', '기술과 인터넷', '환경 문제', '문화 비교', '사회 이슈 토론'],
    B2: ['비즈니스 영어', '과학과 혁신', '정치와 사회', '예술과 문화', '국제 관계'],
    C1: ['학술 토론', '전문 분야 프레젠테이션', '철학적 논의', '비판적 분석', '창작'],
    C2: ['전문가 수준 대화', '문학 분석', '복잡한 협상', '통역/번역', '전문 강의'],
  };

  const baseTopics = topicsByLevel[currentLevel] || topicsByLevel.A1;

  // 약점에 따라 주제 우선순위 조정
  if (weaknesses.some(w => w.includes('어휘'))) {
    return ['어휘력 강화', ...baseTopics.slice(0, 4)];
  }

  if (weaknesses.some(w => w.includes('문법'))) {
    return ['문법 패턴 연습', ...baseTopics.slice(0, 4)];
  }

  return baseTopics.slice(0, 5);
}

/**
 * 연습 문제 추천
 */
function getPracticeExercises(
  currentLevel: CEFRLevel,
  focusAreas: LearningPathRecommendation['focusAreas']
): LearningPathRecommendation['practiceExercises'] {
  const exercises: LearningPathRecommendation['practiceExercises'] = [];

  // 약점 영역 기반 연습
  for (const area of focusAreas.filter(a => a.priority === 'high')) {
    if (area.area === 'vocabulary') {
      exercises.push({
        type: '어휘 퀴즈',
        description: `${currentLevel} 레벨 핵심 단어 50개 플래시카드`,
        difficulty: currentLevel,
      });
      exercises.push({
        type: '빈칸 채우기',
        description: '문맥 속에서 적절한 어휘 선택하기',
        difficulty: currentLevel,
      });
    }

    if (area.area === 'grammar') {
      exercises.push({
        type: '문법 문제',
        description: `${currentLevel} 레벨 문법 패턴 20문제`,
        difficulty: currentLevel,
      });
      exercises.push({
        type: '문장 만들기',
        description: '주어진 문법 패턴으로 문장 5개 작성',
        difficulty: currentLevel,
      });
    }

    if (area.area === 'complexity') {
      exercises.push({
        type: '문장 결합',
        description: '짧은 문장들을 접속사로 연결하기',
        difficulty: currentLevel,
      });
      exercises.push({
        type: '문장 확장',
        description: '기본 문장에 세부 정보 추가하기',
        difficulty: currentLevel,
      });
    }
  }

  // 종합 연습 (최소 1개)
  if (exercises.length === 0) {
    exercises.push({
      type: '자유 대화',
      description: `${currentLevel} 레벨 주제로 AI 튜터와 10턴 대화하기`,
      difficulty: currentLevel,
    });
  }

  return exercises.slice(0, 5); // 최대 5개
}

/**
 * 다음 레벨까지 예상 시간 계산
 */
function estimateTimeToNextLevel(
  currentLevel: CEFRLevel,
  assessmentHistory: LevelAssessment[],
  focusAreas: LearningPathRecommendation['focusAreas']
): string {
  const highPriorityAreas = focusAreas.filter(a => a.priority === 'high').length;

  // 약점이 많을수록 시간이 더 필요
  if (highPriorityAreas >= 3) {
    return '약 4-6주 (매일 30분 학습 시)';
  }

  if (highPriorityAreas >= 2) {
    return '약 3-4주 (매일 30분 학습 시)';
  }

  if (highPriorityAreas >= 1) {
    return '약 2-3주 (매일 30분 학습 시)';
  }

  // 약점이 없으면 빠른 진행 가능
  return '약 1-2주 (매일 30분 학습 시)';
}
