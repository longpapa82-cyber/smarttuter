/**
 * Supplementary Learning Recommendation System
 *
 * 학습 세션 완료 후 맞춤형 보조 학습 활동을 추천합니다.
 * 사용자의 학습 패턴, 약점, 선호도를 분석하여 최적의 다음 학습을 제안합니다.
 */

export type SubjectType = 'english' | 'math';

export type SupplementaryActivity =
  | 'microlearning'
  | 'quiz'
  | 'flashcards'
  | 'review'
  | 'pronunciation'
  | 'math-visualization';

export interface LearningContext {
  subject: SubjectType;
  sessionDuration: number; // minutes
  topicsDiscussed: string[];
  weaknessAreas?: string[];
  masteryScore?: number; // 0-100
  emotionalState?: 'positive' | 'neutral' | 'frustrated';
  consecutiveSessions: number;
}

export interface SupplementaryRecommendation {
  activity: SupplementaryActivity;
  title: string;
  description: string;
  reason: string;
  estimatedDuration: number; // minutes
  priority: 'high' | 'medium' | 'low';
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
  link: string;
}

/**
 * 영어 학습 보조 활동 추천
 */
function getEnglishRecommendations(context: LearningContext): SupplementaryRecommendation[] {
  const recommendations: SupplementaryRecommendation[] = [];

  // 발음 연습 추천 (말하기 약점)
  if (context.weaknessAreas?.includes('speaking') || context.weaknessAreas?.includes('pronunciation')) {
    recommendations.push({
      activity: 'pronunciation',
      title: '발음 연습',
      description: 'AI 기반 고급 발음 분석으로 정확한 발음을 익히세요',
      reason: '말하기 영역에서 약점이 발견되었습니다. 발음 연습으로 자신감을 키워보세요.',
      estimatedDuration: 10,
      priority: 'high',
      icon: '🎤',
      color: 'green',
      link: '/pronunciation-practice',
    });
  }

  // 단어 암기 추천 (어휘 약점)
  if (context.weaknessAreas?.includes('vocabulary') || context.masteryScore && context.masteryScore < 60) {
    recommendations.push({
      activity: 'flashcards',
      title: '단어 플래시카드',
      description: 'SM-2 알고리즘으로 효과적인 어휘 암기',
      reason: '어휘력 향상이 필요합니다. 과학적 간격 반복 학습으로 단어를 완벽하게 암기하세요.',
      estimatedDuration: 15,
      priority: 'high',
      icon: '🗂️',
      color: 'blue',
      link: '/flashcards?subject=english',
    });
  }

  // 마이크로러닝 추천 (짧은 세션 후)
  if (context.sessionDuration < 15) {
    recommendations.push({
      activity: 'microlearning',
      title: '5분 집중 학습',
      description: '짧고 효과적인 영어 개념 학습',
      reason: '짧은 학습으로도 큰 효과를 볼 수 있습니다. 5-10분 추가 학습을 추천합니다.',
      estimatedDuration: 7,
      priority: 'medium',
      icon: '🎯',
      color: 'purple',
      link: '/microlearning?subject=english',
    });
  }

  // 퀴즈 추천 (긴 세션 후 복습)
  if (context.sessionDuration >= 30) {
    recommendations.push({
      activity: 'quiz',
      title: 'AI 영어 퀴즈',
      description: '오늘 배운 내용을 테스트하고 복습하세요',
      reason: '긴 학습 세션 후에는 복습 퀴즈로 학습 내용을 확실히 정착시키는 것이 좋습니다.',
      estimatedDuration: 10,
      priority: 'high',
      icon: '✨',
      color: 'orange',
      link: '/quiz?subject=english',
    });
  }

  // 간격 반복 복습 (연속 학습 후)
  if (context.consecutiveSessions >= 3) {
    recommendations.push({
      activity: 'review',
      title: '간격 반복 복습',
      description: '이전에 학습한 내용을 SM-2 알고리즘으로 복습',
      reason: '꾸준히 학습하고 계시네요! 이전 내용을 복습하면 장기 기억에 더 효과적입니다.',
      estimatedDuration: 15,
      priority: 'medium',
      icon: '🧠',
      color: 'pink',
      link: '/review?subject=english',
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * 수학 학습 보조 활동 추천
 */
function getMathRecommendations(context: LearningContext): SupplementaryRecommendation[] {
  const recommendations: SupplementaryRecommendation[] = [];

  // 시각화 추천 (함수/그래프 학습 후)
  const graphTopics = ['함수', '그래프', '좌표', '이차함수', '일차함수'];
  const hasGraphTopic = context.topicsDiscussed.some(topic =>
    graphTopics.some(graphTopic => topic.includes(graphTopic))
  );

  if (hasGraphTopic) {
    recommendations.push({
      activity: 'math-visualization',
      title: '수학 시각화',
      description: '인터랙티브 그래프로 함수를 직접 탐구하세요',
      reason: '그래프와 함수를 시각적으로 이해하면 수학 개념이 훨씬 명확해집니다.',
      estimatedDuration: 12,
      priority: 'high',
      icon: '📊',
      color: 'orange',
      link: '/math-visualization',
    });
  }

  // 문제 풀이 퀴즈 추천 (낮은 마스터리)
  if (context.masteryScore && context.masteryScore < 70) {
    recommendations.push({
      activity: 'quiz',
      title: 'AI 수학 퀴즈',
      description: '맞춤형 문제로 약점을 집중 공략하세요',
      reason: '더 많은 연습이 필요합니다. AI가 당신의 수준에 맞는 문제를 제공합니다.',
      estimatedDuration: 15,
      priority: 'high',
      icon: '✨',
      color: 'blue',
      link: '/quiz?subject=math',
    });
  }

  // 공식 암기 추천 (약점 영역)
  if (context.weaknessAreas?.includes('formula') || context.weaknessAreas?.includes('개념')) {
    recommendations.push({
      activity: 'flashcards',
      title: '공식 플래시카드',
      description: '중요한 수학 공식을 효과적으로 암기하세요',
      reason: '공식을 정확히 기억하면 문제 풀이가 훨씬 쉬워집니다.',
      estimatedDuration: 10,
      priority: 'high',
      icon: '🗂️',
      color: 'purple',
      link: '/flashcards?subject=math',
    });
  }

  // 마이크로러닝 추천 (짧은 세션)
  if (context.sessionDuration < 15) {
    recommendations.push({
      activity: 'microlearning',
      title: '핵심 개념 학습',
      description: '5-10분 집중 수학 개념 정리',
      reason: '짧은 시간에도 핵심 개념을 확실히 이해할 수 있습니다.',
      estimatedDuration: 8,
      priority: 'medium',
      icon: '🎯',
      color: 'green',
      link: '/microlearning?subject=math',
    });
  }

  // 간격 반복 복습 (연속 학습)
  if (context.consecutiveSessions >= 3) {
    recommendations.push({
      activity: 'review',
      title: '간격 반복 복습',
      description: '이전 단원과 문제를 체계적으로 복습',
      reason: '꾸준한 학습을 유지하고 계시네요! 복습으로 완벽하게 마스터하세요.',
      estimatedDuration: 20,
      priority: 'medium',
      icon: '🧠',
      color: 'pink',
      link: '/review?subject=math',
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * 감정 상태에 따른 추천 조정
 */
function adjustForEmotionalState(
  recommendations: SupplementaryRecommendation[],
  emotionalState?: 'positive' | 'neutral' | 'frustrated'
): SupplementaryRecommendation[] {
  if (!emotionalState) return recommendations;

  // 좌절감이 있을 때는 가벼운 활동 우선
  if (emotionalState === 'frustrated') {
    return recommendations.map(rec => {
      if (rec.activity === 'microlearning' || rec.activity === 'flashcards') {
        return { ...rec, priority: 'high' as const };
      }
      if (rec.activity === 'quiz' && rec.priority === 'high') {
        return { ...rec, priority: 'medium' as const };
      }
      return rec;
    }).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // 긍정적일 때는 도전적인 활동 권장
  if (emotionalState === 'positive') {
    return recommendations.map(rec => {
      if (rec.activity === 'quiz') {
        return { ...rec, priority: 'high' as const };
      }
      return rec;
    }).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  return recommendations;
}

/**
 * 메인 추천 함수
 */
export function getSupplementaryRecommendations(
  context: LearningContext
): SupplementaryRecommendation[] {
  let recommendations: SupplementaryRecommendation[] = [];

  // 과목별 추천 생성
  if (context.subject === 'english') {
    recommendations = getEnglishRecommendations(context);
  } else {
    recommendations = getMathRecommendations(context);
  }

  // 감정 상태에 따른 조정
  recommendations = adjustForEmotionalState(recommendations, context.emotionalState);

  // 최대 3개 추천 반환
  return recommendations.slice(0, 3);
}

/**
 * 추천 이유 설명 생성
 */
export function getRecommendationExplanation(context: LearningContext): string {
  const parts: string[] = [];

  // 세션 길이 언급
  if (context.sessionDuration < 15) {
    parts.push('짧은 학습 시간');
  } else if (context.sessionDuration >= 30) {
    parts.push('충실한 학습 세션');
  }

  // 약점 영역 언급
  if (context.weaknessAreas && context.weaknessAreas.length > 0) {
    parts.push(`${context.weaknessAreas.slice(0, 2).join(', ')} 개선 필요`);
  }

  // 마스터리 스코어 언급
  if (context.masteryScore !== undefined) {
    if (context.masteryScore >= 80) {
      parts.push('우수한 성취도');
    } else if (context.masteryScore < 60) {
      parts.push('추가 연습 권장');
    }
  }

  // 연속 학습 언급
  if (context.consecutiveSessions >= 5) {
    parts.push('꾸준한 학습 습관');
  }

  if (parts.length === 0) {
    return '당신의 학습 패턴을 분석하여 최적의 다음 학습을 추천합니다.';
  }

  return `${parts.join(', ')}을 고려하여 추천합니다.`;
}
