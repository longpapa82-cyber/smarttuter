/**
 * lib/adaptive-learning/level-detector.ts
 * 사용자 영어 수준 자동 감지 및 CEFR 레벨 매핑
 *
 * 무료 솔루션: 자체 알고리즘 기반 분석
 */

import type { Message } from '@/types/tutor';

// CEFR (Common European Framework of Reference for Languages) 레벨
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface UserLevel {
  cefr: CEFRLevel;
  vocabulary: number;      // 0-100
  grammar: number;         // 0-100
  pronunciation: number;   // 0-100
  comprehension: number;   // 0-100
  overall: number;         // 0-100 (평균)
  confidence: number;      // 분석 신뢰도 0-1
}

export interface LevelAnalysis {
  currentLevel: UserLevel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  estimatedStudyTime: string; // 다음 레벨까지 예상 시간
}

/**
 * 사용자의 영어 수준을 대화 히스토리로부터 자동 감지
 */
export function detectEnglishLevel(chatHistory: Message[]): UserLevel {
  // 최소 5개 이상의 사용자 메시지 필요
  const userMessages = chatHistory.filter(m => m.role === 'user');

  if (userMessages.length < 5) {
    return {
      cefr: 'A1',
      vocabulary: 0,
      grammar: 0,
      pronunciation: 0,
      comprehension: 0,
      overall: 0,
      confidence: 0.1,
    };
  }

  // 1. 어휘 수준 분석
  const vocabulary = analyzeVocabularyLevel(userMessages);

  // 2. 문법 정확도 분석
  const grammar = analyzeGrammarAccuracy(userMessages);

  // 3. 이해력 분석 (질문의 적절성)
  const comprehension = analyzeComprehension(userMessages);

  // 4. 발음 점수는 별도 시스템에서 가져옴 (기본값 50)
  const pronunciation = 50;

  // 5. 종합 점수 계산 (가중 평균)
  const overall = Math.round(
    vocabulary * 0.35 +
    grammar * 0.35 +
    comprehension * 0.20 +
    pronunciation * 0.10
  );

  // 6. CEFR 레벨 매핑
  const cefr = mapScoreToCEFR(overall);

  // 7. 신뢰도 계산 (메시지 수에 비례)
  const confidence = Math.min(1, userMessages.length / 20);

  return {
    cefr,
    vocabulary,
    grammar,
    pronunciation,
    comprehension,
    overall,
    confidence,
  };
}

/**
 * 어휘 수준 분석 (사용된 단어의 고급도)
 */
function analyzeVocabularyLevel(messages: Message[]): number {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  const words = allText.split(/\s+/).filter(w => w.length > 2);

  if (words.length === 0) return 0;

  // 고급 어휘 (CEFR B2-C2)
  const advancedWords = new Set([
    'sophisticated', 'elaborate', 'paradigm', 'inevitable', 'ambiguous',
    'comprehensive', 'controversial', 'fundamental', 'significant', 'substantial',
    'demonstrate', 'establish', 'maintain', 'interpret', 'analyze',
    'furthermore', 'nevertheless', 'consequently', 'alternatively', 'likewise',
  ]);

  // 중급 어휘 (CEFR B1)
  const intermediateWords = new Set([
    'although', 'however', 'therefore', 'actually', 'basically',
    'especially', 'particular', 'situation', 'experience', 'opportunity',
    'according', 'important', 'different', 'available', 'necessary',
  ]);

  // 초급 어휘 (CEFR A1-A2)
  const basicWords = new Set([
    'hello', 'thank', 'please', 'sorry', 'good', 'bad',
    'big', 'small', 'new', 'old', 'happy', 'sad',
    'want', 'need', 'like', 'have', 'go', 'come',
  ]);

  let advancedCount = 0;
  let intermediateCount = 0;
  let basicCount = 0;

  words.forEach(word => {
    if (advancedWords.has(word)) advancedCount++;
    else if (intermediateWords.has(word)) intermediateCount++;
    else if (basicWords.has(word)) basicCount++;
  });

  // 점수 계산
  const advancedRatio = advancedCount / words.length;
  const intermediateRatio = intermediateCount / words.length;
  const basicRatio = basicCount / words.length;

  const score =
    advancedRatio * 100 +
    intermediateRatio * 60 +
    basicRatio * 20;

  return Math.min(100, Math.round(score * 10));
}

/**
 * 문법 정확도 분석 (간단한 휴리스틱)
 */
function analyzeGrammarAccuracy(messages: Message[]): number {
  const allText = messages.map(m => m.content).join(' ');

  // 문법 오류 패턴 감지 (단순화)
  const commonErrors = [
    /\b(he|she|it)\s+(do|have)\b/gi,      // "he do", "she have"
    /\b(I|you|we|they)\s+(does|has)\b/gi, // "I does", "they has"
    /\ba\s+[aeiou]/gi,                     // "a apple" (should be "an")
    /\ban\s+[^aeiou]/gi,                   // "an book" (should be "a")
    /\bdoesn't\s+(goes|does)\b/gi,         // "doesn't goes"
    /\bdon't\s+(go|do)\b/gi,               // 이중 부정
  ];

  let errorCount = 0;
  commonErrors.forEach(pattern => {
    const matches = allText.match(pattern);
    if (matches) errorCount += matches.length;
  });

  // 문장 수 추정
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  // 오류율 계산
  const errorRate = sentences > 0 ? errorCount / sentences : 0;

  // 점수 계산 (오류가 적을수록 높은 점수)
  const score = Math.max(0, 100 - errorRate * 50);

  return Math.round(score);
}

/**
 * 이해력 분석 (질문의 적절성 및 복잡도)
 */
function analyzeComprehension(messages: Message[]): number {
  const userMessages = messages.filter(m => m.role === 'user');

  if (userMessages.length === 0) return 0;

  let complexityScore = 0;

  userMessages.forEach(msg => {
    const text = msg.content;

    // 1. 문장 길이 (복잡도 지표)
    const words = text.split(/\s+/).length;
    if (words > 20) complexityScore += 15;
    else if (words > 10) complexityScore += 10;
    else complexityScore += 5;

    // 2. 의문문 사용 (질문 능력)
    if (/\?$/.test(text.trim())) complexityScore += 5;

    // 3. 접속사 사용 (논리적 연결)
    if (/\b(because|although|however|therefore|while|since)\b/i.test(text)) {
      complexityScore += 10;
    }

    // 4. 시제 다양성
    if (/\b(will|would|could|should|might|may)\b/i.test(text)) {
      complexityScore += 5;
    }
  });

  // 평균 점수 계산
  const avgScore = complexityScore / userMessages.length;

  return Math.min(100, Math.round(avgScore * 2));
}

/**
 * 종합 점수를 CEFR 레벨로 매핑
 */
export function mapScoreToCEFR(score: number): CEFRLevel {
  if (score < 20) return 'A1'; // 기초
  if (score < 40) return 'A2'; // 초급
  if (score < 60) return 'B1'; // 중급
  if (score < 80) return 'B2'; // 중상급
  if (score < 95) return 'C1'; // 고급
  return 'C2';                  // 숙련
}

/**
 * CEFR 레벨 설명 및 특징
 */
export const CEFR_DESCRIPTIONS: Record<CEFRLevel, {
  name: string;
  description: string;
  canDo: string[];
  studyFocus: string[];
}> = {
  'A1': {
    name: '기초',
    description: '기본적인 영어 표현을 이해하고 사용할 수 있음',
    canDo: [
      '간단한 자기소개',
      '기본적인 일상 표현 이해',
      '천천히 또렷하게 말하면 이해 가능',
    ],
    studyFocus: [
      '기본 어휘 확장 (색깔, 숫자, 가족 등)',
      '현재 시제 연습',
      '간단한 질문과 대답',
    ],
  },
  'A2': {
    name: '초급',
    description: '일상적인 주제에 대해 기본적인 의사소통 가능',
    canDo: [
      '개인 정보와 가족 소개',
      '쇼핑, 음식 주문 등 실용 대화',
      '간단한 과거 경험 설명',
    ],
    studyFocus: [
      '과거 시제 마스터',
      '비교급/최상급',
      '일상 어휘 확장',
    ],
  },
  'B1': {
    name: '중급',
    description: '친숙한 주제에 대해 명확하게 의견 표현 가능',
    canDo: [
      '여행 중 대부분의 상황 대처',
      '관심사에 대해 간단한 토론',
      '경험, 계획, 의견 설명',
    ],
    studyFocus: [
      '미래 시제 및 조건문',
      '추상적 개념 어휘',
      '문장 구조 다양화',
    ],
  },
  'B2': {
    name: '중상급',
    description: '복잡한 주제에 대해 유창하고 자연스럽게 대화 가능',
    canDo: [
      '원어민과 자연스럽게 대화',
      '전문 분야의 기술적 토론',
      '명확하고 상세한 의견 개진',
    ],
    studyFocus: [
      '고급 문법 (가정법, 관계대명사)',
      '비즈니스 영어',
      '뉘앙스 표현',
    ],
  },
  'C1': {
    name: '고급',
    description: '폭넓은 주제에 대해 유창하고 정확하게 표현',
    canDo: [
      '복잡한 텍스트 이해',
      '학술/전문 분야 논의',
      '명확하고 체계적인 글쓰기',
    ],
    studyFocus: [
      '학술 어휘',
      '정교한 논증',
      '문체와 뉘앙스',
    ],
  },
  'C2': {
    name: '숙련',
    description: '원어민 수준의 이해와 표현 능력',
    canDo: [
      '모든 상황에서 완벽한 의사소통',
      '미묘한 뉘앙스 표현',
      '전문적인 통역/번역',
    ],
    studyFocus: [
      '관용어와 속담',
      '고급 문학 작품',
      '완벽한 발음과 억양',
    ],
  },
};

/**
 * 상세 레벨 분석 및 추천
 */
export function analyzeUserLevel(chatHistory: Message[]): LevelAnalysis {
  const currentLevel = detectEnglishLevel(chatHistory);
  const cefrInfo = CEFR_DESCRIPTIONS[currentLevel.cefr];

  // 강점 분석
  const strengths: string[] = [];
  const scores = {
    vocabulary: currentLevel.vocabulary,
    grammar: currentLevel.grammar,
    comprehension: currentLevel.comprehension,
    pronunciation: currentLevel.pronunciation,
  };

  Object.entries(scores).forEach(([key, value]) => {
    if (value >= 70) {
      strengths.push(getStrengthMessage(key as keyof typeof scores, value));
    }
  });

  // 약점 분석
  const weaknesses: string[] = [];
  Object.entries(scores).forEach(([key, value]) => {
    if (value < 50) {
      weaknesses.push(getWeaknessMessage(key as keyof typeof scores, value));
    }
  });

  // 추천 학습 방향
  const recommendations: string[] = [...cefrInfo.studyFocus];

  // 예상 학습 시간
  const estimatedStudyTime = getEstimatedStudyTime(currentLevel.cefr);

  return {
    currentLevel,
    strengths,
    weaknesses,
    recommendations,
    estimatedStudyTime,
  };
}

function getStrengthMessage(category: string, score: number): string {
  const messages: Record<string, string> = {
    vocabulary: `어휘력이 우수합니다! (${score}점)`,
    grammar: `문법 실력이 탄탄합니다! (${score}점)`,
    comprehension: `이해력이 뛰어납니다! (${score}점)`,
    pronunciation: `발음이 정확합니다! (${score}점)`,
  };
  return messages[category] || `${category} 능력이 좋습니다!`;
}

function getWeaknessMessage(category: string, score: number): string {
  const messages: Record<string, string> = {
    vocabulary: `어휘력 향상이 필요합니다 (${score}점) - 더 다양한 단어를 사용해보세요`,
    grammar: `문법 연습이 필요합니다 (${score}점) - 기본 문법 규칙을 복습하세요`,
    comprehension: `이해력 개선이 필요합니다 (${score}점) - 더 많은 영어 노출이 필요합니다`,
    pronunciation: `발음 연습이 필요합니다 (${score}점) - 발음 연습 기능을 활용하세요`,
  };
  return messages[category] || `${category} 능력 개선이 필요합니다`;
}

function getEstimatedStudyTime(currentLevel: CEFRLevel): string {
  const timeEstimates: Record<CEFRLevel, string> = {
    'A1': '3-6개월 (A2 도달)',
    'A2': '6-9개월 (B1 도달)',
    'B1': '9-12개월 (B2 도달)',
    'B2': '12-18개월 (C1 도달)',
    'C1': '18-24개월 (C2 도달)',
    'C2': '원어민 수준 유지',
  };
  return timeEstimates[currentLevel];
}

/**
 * 사용자 프로필에 레벨 정보 저장
 */
export function saveUserLevel(userId: string, level: UserLevel): void {
  if (typeof window === 'undefined') return;

  const key = `aipark_user_level_${userId}`;
  const data = {
    ...level,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 저장된 레벨 정보 로드
 */
export function loadUserLevel(userId: string): UserLevel | null {
  if (typeof window === 'undefined') return null;

  const key = `aipark_user_level_${userId}`;
  const data = localStorage.getItem(key);

  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return parsed as UserLevel;
  } catch {
    return null;
  }
}
