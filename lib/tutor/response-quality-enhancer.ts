/**
 * 튜터 응답 품질 향상 시스템
 *
 * CLAUDE.md 요구사항:
 * 1. 질문에 가장 정확하게 답변할 수 있는 기능 (팩트가 아닌 내용 답변 금지)
 * 2. 학생들에게 친근감 있고 재미 요소가 고려된 튜터 기능 구현
 * 3. 영어와 수학 튜터가 학습과 무관한 질문을 받을 경우, 학습으로 유도하는 기능
 */

import { GradeLevel, Subject } from '@/types/tutor';

/**
 * 응답 품질 검증 결과
 */
export interface ResponseQualityCheck {
  isFactual: boolean;          // 팩트 기반인지
  isOnTopic: boolean;           // 학습 관련인지
  isFriendly: boolean;          // 친근한지
  isEncouraging: boolean;       // 격려하는지
  hasGuidance: boolean;         // 가이드를 제공하는지
  confidence: number;           // 신뢰도 (0-1)
  suggestions: string[];        // 개선 제안
}

/**
 * 팩트 기반 답변 검증 패턴
 */
const FACTUAL_INDICATORS = {
  // 좋은 표현 (팩트 기반)
  positive: [
    '일반적으로', '대부분', '보통', '~로 알려져 있습니다',
    'according to', 'research shows', 'studies indicate',
    '수학적으로', '문법적으로', '이론상', '정의에 따르면',
    'mathematically', 'grammatically', 'by definition',
  ],

  // 나쁜 표현 (추측/불확실)
  negative: [
    '아마도', '~인 것 같아요', '~일 수도', '확실하지 않지만',
    'probably', 'maybe', 'i think', 'i guess', 'not sure but',
    '제 생각엔', '추측컨대', '~것 같습니다',
  ],

  // 확실성 표현 (좋음)
  certainty: [
    '정확히', '확실히', '명확히', 'definitely', 'certainly',
    'exactly', 'precisely', '틀림없이',
  ],
};

/**
 * 학습 관련 키워드
 */
const LEARNING_KEYWORDS = {
  math: [
    // 한글
    '수학', '계산', '문제', '풀이', '방정식', '함수', '공식', '증명',
    '더하기', '빼기', '곱하기', '나누기', '분수', '소수', '정수',
    '삼각', '미분', '적분', '행렬', '벡터', '기하', '대수',
    '그래프', '좌표', '각도', '넓이', '부피', '확률', '통계',

    // 영어
    'math', 'calculate', 'solve', 'equation', 'function', 'formula',
    'add', 'subtract', 'multiply', 'divide', 'fraction', 'decimal',
    'triangle', 'derivative', 'integral', 'matrix', 'vector',
    'algebra', 'geometry', 'graph', 'angle', 'area', 'volume',
  ],

  english: [
    // 한글
    '영어', '문법', '단어', '발음', '회화', '문장', '표현', '뜻',
    '듣기', '말하기', '읽기', '쓰기', '시제', '명사', '동사',
    '형용사', '부사', '전치사', '접속사', '어휘', '발음',

    // 영어
    'english', 'grammar', 'word', 'vocabulary', 'pronunciation',
    'sentence', 'phrase', 'meaning', 'tense', 'noun', 'verb',
    'adjective', 'adverb', 'preposition', 'conjunction',
    'listen', 'speak', 'read', 'write', 'conversation',
  ],
};

/**
 * 오프토픽 키워드 (학습 무관)
 */
const OFF_TOPIC_KEYWORDS = [
  // 엔터테인먼트
  '게임', '연예인', '아이돌', '영화', '드라마', '유튜브',
  'game', 'youtube', 'movie', 'drama', 'celebrity', 'idol',

  // 스포츠
  '축구', '야구', '농구', '스포츠', '선수', '팀',
  'soccer', 'football', 'baseball', 'basketball', 'sports',

  // 일상
  '음식', '맛집', '요리', '패션', '쇼핑', '날씨',
  'food', 'restaurant', 'cooking', 'fashion', 'shopping', 'weather',

  // 기타
  '뉴스', '정치', '경제', '주식', '코인',
  'news', 'politics', 'economy', 'stock', 'crypto',
];

/**
 * 친근감 지표 (학년별)
 */
const FRIENDLINESS_INDICATORS = {
  elementary: {
    required: ['이모지', 'emoji'],  // 초등은 이모지 필수
    positive: ['우와', '와', '대단해', '멋져', '짱', '최고'],
    negative: ['어렵', '복잡', '힘들'],
  },
  middle: {
    positive: ['좋아', '잘했', '훌륭', '정확', '맞아'],
    negative: ['틀렸', '잘못', '실수'],
  },
  high: {
    positive: ['정확', '논리적', '훌륭', '좋은', '적절'],
    negative: ['틀림', '오류', '실패'],
  },
  university: {
    positive: ['정확', '적절', '논리적', '타당'],
    negative: ['오류', '부정확'],
  },
};

/**
 * 격려 표현 감지
 */
const ENCOURAGEMENT_PATTERNS = [
  // 긍정적 피드백
  '잘했', '좋아', '훌륭', '멋져', '대단', '정확', '맞아',
  'good', 'great', 'excellent', 'well done', 'correct', 'right',

  // 칭찬
  '똑똑', '천재', '실력', '성장', '발전',
  'smart', 'clever', 'talented', 'progress', 'improvement',

  // 동기 부여
  '할 수 있', '해봐', '도전', '계속', '화이팅',
  'you can', 'try', 'challenge', 'keep going', 'fighting',
];

/**
 * 가이드 표현 감지
 */
const GUIDANCE_PATTERNS = [
  // 질문 형태
  '생각해', '어떻게', '무엇', '왜', '어떤',
  'think', 'how', 'what', 'why', 'which', 'can you',

  // 단계적 설명
  '먼저', '다음', '그리고', '마지막',
  'first', 'next', 'then', 'finally', 'step',

  // 힌트 제공
  '힌트', '도움', '단서', '생각해보면',
  'hint', 'clue', 'help', 'consider', 'notice',
];

/**
 * 응답 품질 검증
 */
export function checkResponseQuality(
  response: string,
  subject: Subject,
  gradeLevel: GradeLevel
): ResponseQualityCheck {
  const lowerResponse = response.toLowerCase();
  let confidence = 1.0;
  const suggestions: string[] = [];

  // 1. 팩트 기반 검증
  const hasNegativeIndicators = FACTUAL_INDICATORS.negative.some(
    indicator => lowerResponse.includes(indicator.toLowerCase())
  );

  const hasPositiveIndicators = FACTUAL_INDICATORS.positive.some(
    indicator => lowerResponse.includes(indicator.toLowerCase())
  );

  const hasCertainty = FACTUAL_INDICATORS.certainty.some(
    indicator => lowerResponse.includes(indicator.toLowerCase())
  );

  const isFactual = !hasNegativeIndicators || hasPositiveIndicators || hasCertainty;

  if (hasNegativeIndicators) {
    confidence -= 0.3;
    suggestions.push('불확실한 표현 사용됨 (예: "아마도", "~인 것 같아요"). 더 확실한 표현 사용 권장.');
  }

  // 2. 학습 관련 여부 검증
  const learningKeywords = LEARNING_KEYWORDS[subject];
  const hasLearningContent = learningKeywords.some(
    keyword => lowerResponse.includes(keyword.toLowerCase())
  );

  const hasOffTopicContent = OFF_TOPIC_KEYWORDS.some(
    keyword => lowerResponse.includes(keyword.toLowerCase())
  );

  const isOnTopic = hasLearningContent || !hasOffTopicContent;

  if (hasOffTopicContent && !hasLearningContent) {
    confidence -= 0.4;
    suggestions.push('학습과 무관한 내용 포함. 학습으로 유도 필요.');
  }

  // 3. 친근감 검증
  const friendlinessIndicators = FRIENDLINESS_INDICATORS[gradeLevel];
  const hasFriendlyTone = friendlinessIndicators.positive.some(
    word => lowerResponse.includes(word)
  );

  const hasNegativeTone = friendlinessIndicators.negative.some(
    word => lowerResponse.includes(word)
  );

  // 초등학생은 이모지 필수 체크
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
  const hasEmoji = emojiRegex.test(response);

  let isFriendly = hasFriendlyTone && !hasNegativeTone;

  if (gradeLevel === 'elementary' && !hasEmoji) {
    confidence -= 0.2;
    suggestions.push('초등학생 대상 응답에 이모지 사용 권장 🌟');
    isFriendly = false;
  }

  if (hasNegativeTone) {
    confidence -= 0.2;
    suggestions.push('부정적 표현 사용됨. 긍정적으로 재구성 권장.');
  }

  // 4. 격려 표현 검증
  const hasEncouragement = ENCOURAGEMENT_PATTERNS.some(
    pattern => lowerResponse.includes(pattern)
  );

  if (!hasEncouragement) {
    suggestions.push('격려 표현 추가 권장 (예: "잘했어요!", "계속 해봐요!")');
  }

  // 5. 가이드 제공 검증
  const hasGuidance = GUIDANCE_PATTERNS.some(
    pattern => lowerResponse.includes(pattern)
  );

  if (!hasGuidance) {
    suggestions.push('학습 가이드 제공 권장 (예: 질문 형태, 단계적 설명, 힌트)');
  }

  // 최종 confidence 보정
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    isFactual,
    isOnTopic,
    isFriendly,
    isEncouraging: hasEncouragement,
    hasGuidance,
    confidence,
    suggestions,
  };
}

/**
 * 응답 개선 제안 생성
 */
export function generateImprovementSuggestions(
  check: ResponseQualityCheck,
  subject: Subject,
  gradeLevel: GradeLevel
): string[] {
  const improvements: string[] = [];

  if (!check.isFactual) {
    improvements.push(
      '✓ 팩트 기반 답변: 불확실한 표현 대신 "일반적으로", "수학적으로", "문법적으로" 등 사용'
    );
  }

  if (!check.isOnTopic) {
    improvements.push(
      '✓ 학습 유도: 오프토픽 질문에 "흥미로운 질문이네요! 하지만 지금은 [학습 주제]에 집중해봐요" 형식 사용'
    );
  }

  if (!check.isFriendly) {
    if (gradeLevel === 'elementary') {
      improvements.push(
        '✓ 친근감 향상: 이모지 사용 (😊, 🎉, ✨) + 짧고 간단한 문장 + "우와", "대단해" 등 표현'
      );
    } else if (gradeLevel === 'middle') {
      improvements.push(
        '✓ 친근감 향상: 적절한 이모지 + "좋아요", "잘했어요" 등 격려'
      );
    }
  }

  if (!check.isEncouraging) {
    improvements.push(
      '✓ 격려 추가: 학생의 노력을 인정하고 칭찬하는 표현 추가'
    );
  }

  if (!check.hasGuidance) {
    improvements.push(
      '✓ 가이드 제공: 직접 답 주지 말고 질문이나 힌트로 스스로 생각하도록 유도'
    );
  }

  return improvements;
}

/**
 * 응답 품질 점수 계산 (0-100)
 */
export function calculateQualityScore(check: ResponseQualityCheck): number {
  let score = 0;

  // 각 항목별 가중치
  const weights = {
    isFactual: 30,        // 팩트 기반 (가장 중요)
    isOnTopic: 25,        // 학습 관련
    isFriendly: 20,       // 친근감
    isEncouraging: 15,    // 격려
    hasGuidance: 10,      // 가이드 제공
  };

  if (check.isFactual) score += weights.isFactual;
  if (check.isOnTopic) score += weights.isOnTopic;
  if (check.isFriendly) score += weights.isFriendly;
  if (check.isEncouraging) score += weights.isEncouraging;
  if (check.hasGuidance) score += weights.hasGuidance;

  // Confidence로 조정
  score = Math.round(score * check.confidence);

  return score;
}

/**
 * 응답 품질 등급 반환
 */
export function getQualityGrade(score: number): {
  grade: string;
  emoji: string;
  description: string;
} {
  if (score >= 90) {
    return {
      grade: 'A+',
      emoji: '🏆',
      description: '탁월한 응답! 모든 기준을 충족합니다.',
    };
  } else if (score >= 80) {
    return {
      grade: 'A',
      emoji: '⭐',
      description: '우수한 응답! 대부분의 기준을 충족합니다.',
    };
  } else if (score >= 70) {
    return {
      grade: 'B',
      emoji: '👍',
      description: '좋은 응답! 약간의 개선이 필요합니다.',
    };
  } else if (score >= 60) {
    return {
      grade: 'C',
      emoji: '💡',
      description: '보통 응답. 여러 부분 개선 필요.',
    };
  } else {
    return {
      grade: 'D',
      emoji: '⚠️',
      description: '응답 품질 향상 필요. 기준 재검토 권장.',
    };
  }
}

/**
 * 통합 품질 검증 및 리포트
 */
export function generateQualityReport(
  response: string,
  subject: Subject,
  gradeLevel: GradeLevel
): {
  check: ResponseQualityCheck;
  score: number;
  grade: ReturnType<typeof getQualityGrade>;
  improvements: string[];
  summary: string;
} {
  const check = checkResponseQuality(response, subject, gradeLevel);
  const score = calculateQualityScore(check);
  const grade = getQualityGrade(score);
  const improvements = generateImprovementSuggestions(check, subject, gradeLevel);

  // 요약 생성
  const passedChecks = [
    check.isFactual && '✅ 팩트 기반',
    check.isOnTopic && '✅ 학습 관련',
    check.isFriendly && '✅ 친근한 톤',
    check.isEncouraging && '✅ 격려 표현',
    check.hasGuidance && '✅ 가이드 제공',
  ].filter(Boolean);

  const failedChecks = [
    !check.isFactual && '❌ 팩트 미흡',
    !check.isOnTopic && '❌ 오프토픽',
    !check.isFriendly && '❌ 친근감 부족',
    !check.isEncouraging && '❌ 격려 부족',
    !check.hasGuidance && '❌ 가이드 부족',
  ].filter(Boolean);

  const summary = `
${grade.emoji} 품질 등급: ${grade.grade} (${score}점)
${grade.description}

${passedChecks.join('\n')}
${failedChecks.join('\n')}

신뢰도: ${Math.round(check.confidence * 100)}%
  `.trim();

  return {
    check,
    score,
    grade,
    improvements,
    summary,
  };
}
