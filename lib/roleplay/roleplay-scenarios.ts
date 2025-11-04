/**
 * lib/roleplay/roleplay-scenarios.ts
 * 실제 상황 기반 영어 회화 롤플레이 시나리오
 *
 * 무료 솔루션: Google Gemini 2.0 Flash 활용
 */

import type { CEFRLevel } from '@/lib/adaptive-learning/level-detector';

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: 'travel' | 'dining' | 'shopping' | 'work' | 'social' | 'emergency';
  level: CEFRLevel;
  difficulty: number; // 1-10

  // 시나리오 설정
  setting: string;           // 장소 및 상황
  userRole: string;          // 사용자 역할
  aiRole: string;            // AI 역할
  objective: string;         // 대화 목표

  // 학습 목표
  keyPhrases: string[];      // 핵심 표현
  vocabulary: string[];      // 학습 어휘
  grammarFocus: string[];    // 문법 포인트

  // 대화 가이드
  expectedTurns: number;     // 예상 대화 턴
  startingMessage: string;   // AI 첫 메시지
  hints: string[];           // 사용자 힌트

  // 평가 기준
  completionCriteria: string[];  // 완료 조건
  commonMistakes: string[];      // 흔한 실수

  // 메타데이터
  estimatedTime: number;     // 예상 소요 시간 (분)
  tags: string[];
  prerequisites?: string[];  // 선수 학습
}

/**
 * 롤플레이 시나리오 데이터베이스
 */
export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  // ============================================================================
  // A1-A2: 기초/초급 - 기본 생활 대화
  // ============================================================================

  {
    id: 'coffee-order-a1',
    title: '☕ 카페에서 커피 주문하기',
    description: '카페에서 기본 음료 주문하는 연습',
    category: 'dining',
    level: 'A1',
    difficulty: 1,

    setting: '동네 카페, 아침 시간',
    userRole: '커피를 주문하려는 손님',
    aiRole: '친절한 바리스타',
    objective: '커피 한 잔을 성공적으로 주문하기',

    keyPhrases: [
      'Can I have...?',
      'I\'d like...',
      'How much is it?',
      'Thank you',
    ],
    vocabulary: [
      'coffee', 'tea', 'latte', 'americano',
      'hot', 'iced', 'small', 'medium', 'large',
      'sugar', 'milk', 'cream',
    ],
    grammarFocus: [
      'Can I...? 요청문',
      'I\'d like... 정중한 표현',
      '크기/온도 형용사',
    ],

    expectedTurns: 5,
    startingMessage: 'Good morning! Welcome to Sunrise Café. What can I get for you today?',
    hints: [
      '먼저 무엇을 원하는지 말해보세요 (I\'d like...)',
      '크기를 선택하세요 (small, medium, large)',
      '뜨거운지 차가운지 말해보세요 (hot or iced)',
    ],

    completionCriteria: [
      '음료 종류를 명확히 주문함',
      '크기를 지정함',
      '온도를 지정함',
      '정중하게 감사 인사함',
    ],
    commonMistakes: [
      'I want... (너무 직접적, I\'d like가 더 정중함)',
      '크기/온도 누락',
      'Please를 과도하게 사용',
    ],

    estimatedTime: 5,
    tags: ['basic', 'food', 'ordering', 'beginner'],
  },

  {
    id: 'airport-checkin-a2',
    title: '✈️ 공항 체크인',
    description: '공항에서 탑승 수속하는 연습',
    category: 'travel',
    level: 'A2',
    difficulty: 3,

    setting: '인천공항 체크인 카운터, 국제선',
    userRole: '뉴욕행 비행기를 탈 승객',
    aiRole: '항공사 체크인 직원',
    objective: '짐을 부치고 탑승권을 받기',

    keyPhrases: [
      'I\'m checking in for...',
      'I have one checked bag',
      'Window seat, please',
      'What time is boarding?',
    ],
    vocabulary: [
      'passport', 'boarding pass', 'gate', 'flight',
      'check in', 'luggage', 'baggage', 'seat',
      'window seat', 'aisle seat', 'boarding time',
    ],
    grammarFocus: [
      '현재진행형 (I\'m checking in)',
      '정중한 요청 (Could you...? / I\'d prefer...)',
      '의문문 (What time...? / Which gate...?)',
    ],

    expectedTurns: 8,
    startingMessage: 'Good afternoon. May I see your passport and booking confirmation, please?',
    hints: [
      '여권과 예약 확인서를 준비했다고 말하세요',
      '짐이 몇 개인지 알려주세요',
      '원하는 좌석을 요청하세요 (창가/복도)',
      '탑승 시간과 게이트를 물어보세요',
    ],

    completionCriteria: [
      '여권 제시',
      '목적지 확인',
      '짐 개수 전달',
      '좌석 선호도 전달',
      '탑승 정보 확인',
    ],
    commonMistakes: [
      'Luggage/baggage 혼동',
      '시제 오류 (I check in → I\'m checking in)',
      '의문사 없이 질문 (Boarding time? → What time is boarding?)',
    ],

    estimatedTime: 8,
    tags: ['travel', 'airport', 'formal', 'practical'],
  },

  // ============================================================================
  // B1: 중급 - 일상적이지만 약간 복잡한 상황
  // ============================================================================

  {
    id: 'restaurant-reservation-b1',
    title: '🍽️ 레스토랑 전화 예약',
    description: '전화로 레스토랑 예약하기',
    category: 'dining',
    level: 'B1',
    difficulty: 5,

    setting: '전화 통화, 고급 이탈리안 레스토랑',
    userRole: '4명을 위한 저녁 예약을 원하는 고객',
    aiRole: '레스토랑 예약 담당자',
    objective: '원하는 날짜/시간에 테이블 예약하기',

    keyPhrases: [
      'I\'d like to make a reservation for...',
      'Do you have any availability for...?',
      'Would it be possible to...?',
      'I\'d prefer a table by the window',
      'Could you confirm the reservation?',
    ],
    vocabulary: [
      'reservation', 'available', 'party of four',
      'window table', 'dietary restrictions',
      'allergy', 'vegetarian', 'confirm',
      'alternative', 'earlier', 'later',
    ],
    grammarFocus: [
      '가정법 (Would it be possible...?)',
      '조건문 (If that\'s not available...)',
      '정중한 요청 (Could you...? / Would you mind...?)',
    ],

    expectedTurns: 10,
    startingMessage: 'Thank you for calling Bella Notte. How may I help you today?',
    hints: [
      '날짜와 시간을 구체적으로 말하세요',
      '인원수를 명확히 하세요 (party of...)',
      '특별한 요청이 있다면 말하세요 (창가 자리, 식이 제한 등)',
      '예약을 확인받으세요',
    ],

    completionCriteria: [
      '날짜/시간 전달',
      '인원수 전달',
      '가능 여부 확인',
      '특별 요청 전달 (선택)',
      '예약 확정 및 확인',
    ],
    commonMistakes: [
      'I want to book (너무 직접적)',
      '날짜/시간 형식 혼동 (미국식 vs 한국식)',
      'Four people → Party of four가 더 자연스러움',
    ],

    estimatedTime: 10,
    tags: ['phone', 'formal', 'planning', 'dining'],
  },

  {
    id: 'shopping-complaint-b1',
    title: '🛍️ 불량 제품 교환',
    description: '구매한 옷에 문제가 있어서 교환 요청',
    category: 'shopping',
    level: 'B1',
    difficulty: 6,

    setting: '의류 매장 고객 서비스 데스크',
    userRole: '불량 제품을 교환하려는 고객',
    aiRole: '고객 서비스 담당자',
    objective: '문제를 설명하고 제품 교환받기',

    keyPhrases: [
      'I bought this... but there\'s a problem',
      'It has a defect/stain/tear',
      'I\'d like to exchange it for...',
      'Do you have this in another size/color?',
      'Can I get a refund instead?',
    ],
    vocabulary: [
      'receipt', 'exchange', 'refund', 'defect',
      'stain', 'tear', 'damaged', 'size',
      'color', 'same item', 'store credit',
    ],
    grammarFocus: [
      '과거 시제 (I bought... / It was damaged)',
      '현재완료 (I\'ve tried... / It hasn\'t worked)',
      '조건부 요청 (I\'d like to... / Could I...?)',
    ],

    expectedTurns: 10,
    startingMessage: 'Hello! How can I help you today?',
    hints: [
      '언제 구매했는지 말하세요',
      '무엇이 문제인지 구체적으로 설명하세요',
      '영수증이 있는지 확인하세요',
      '교환 또는 환불을 요청하세요',
    ],

    completionCriteria: [
      '문제 상황 설명',
      '구매 날짜/영수증 제시',
      '원하는 해결 방법 제시 (교환/환불)',
      '대안 협의',
      '해결책 합의',
    ],
    commonMistakes: [
      'This is broken (너무 간단, 구체적 설명 필요)',
      'I want my money back (너무 직접적)',
      '과거 시제 오류 (I buy → I bought)',
    ],

    estimatedTime: 12,
    tags: ['shopping', 'problem-solving', 'customer-service'],
  },

  // ============================================================================
  // B2: 중상급 - 전문적이거나 복잡한 상황
  // ============================================================================

  {
    id: 'job-interview-b2',
    title: '💼 직장 면접',
    description: '영어로 진행되는 직장 면접 연습',
    category: 'work',
    level: 'B2',
    difficulty: 8,

    setting: '글로벌 기업 면접실, 화상 면접',
    userRole: '마케팅 포지션 지원자',
    aiRole: '면접관 (채용 매니저)',
    objective: '자신의 경험과 역량을 효과적으로 어필하기',

    keyPhrases: [
      'In my previous role, I...',
      'I have experience in...',
      'One of my key strengths is...',
      'I\'m particularly passionate about...',
      'I believe I would be a great fit because...',
    ],
    vocabulary: [
      'experience', 'qualifications', 'achievement',
      'responsibility', 'collaborate', 'initiative',
      'challenge', 'overcome', 'contribute',
      'team player', 'self-motivated', 'deadline',
    ],
    grammarFocus: [
      '현재완료 (I have worked... / I have managed...)',
      '과거 시제 서술 (I led a project that...)',
      '가정법 (If given the opportunity, I would...)',
    ],

    expectedTurns: 12,
    startingMessage: 'Good morning! Thank you for joining us today. Let\'s start with you telling me a bit about yourself and your background.',
    hints: [
      '자신의 배경을 간단히 소개하세요',
      '관련 경험을 구체적으로 말하세요',
      '성과를 수치로 표현하세요 (가능하면)',
      '왜 이 회사/포지션에 관심이 있는지 설명하세요',
    ],

    completionCriteria: [
      '자기소개',
      '관련 경험 설명',
      '강점 어필',
      '회사에 대한 관심 표현',
      '질문에 대한 적절한 답변',
    ],
    commonMistakes: [
      '너무 짧거나 모호한 답변',
      '성과를 구체적으로 설명하지 않음',
      '회사에 대한 사전 조사 부족',
      '부정적인 전 직장 언급',
    ],

    estimatedTime: 15,
    tags: ['professional', 'formal', 'career', 'advanced'],
  },

  {
    id: 'doctor-appointment-b2',
    title: '🏥 병원 예약 및 증상 설명',
    description: '의사에게 증상을 설명하고 진료받기',
    category: 'emergency',
    level: 'B2',
    difficulty: 7,

    setting: '종합병원 진료실',
    userRole: '증상이 있는 환자',
    aiRole: '의사',
    objective: '증상을 정확히 설명하고 진단받기',

    keyPhrases: [
      'I\'ve been experiencing...',
      'It started about... ago',
      'The pain is sharp/dull/throbbing',
      'It gets worse when...',
      'I\'ve tried taking... but it hasn\'t helped',
    ],
    vocabulary: [
      'symptom', 'pain', 'ache', 'fever',
      'headache', 'dizzy', 'nauseous', 'fatigue',
      'prescribe', 'medication', 'treatment',
      'allergic', 'chronic', 'severe', 'mild',
    ],
    grammarFocus: [
      '현재완료 진행형 (I\'ve been feeling...)',
      '시간 표현 (for two days / since Monday)',
      '조건문 (If I take..., it gets better)',
    ],

    expectedTurns: 12,
    startingMessage: 'Hello, please have a seat. What brings you in today?',
    hints: [
      '언제부터 증상이 시작되었는지 말하세요',
      '증상을 구체적으로 설명하세요 (위치, 강도, 빈도)',
      '이미 시도한 치료법이 있다면 말하세요',
      '알레르기나 복용 중인 약이 있다면 알려주세요',
    ],

    completionCriteria: [
      '주요 증상 설명',
      '증상 시작 시기',
      '증상의 특징 (강도, 빈도)',
      '관련 의료 이력',
      '질문에 대한 답변',
    ],
    commonMistakes: [
      '증상을 모호하게 설명 (hurt → sharp pain)',
      '시간 표현 오류 (since vs for)',
      '의학 용어 과도한 사용 시도',
    ],

    estimatedTime: 15,
    tags: ['health', 'emergency', 'important', 'practical'],
  },

  // ============================================================================
  // C1-C2: 고급/숙련 - 복잡하고 미묘한 뉘앙스 필요
  // ============================================================================

  {
    id: 'business-negotiation-c1',
    title: '📊 비즈니스 협상',
    description: '계약 조건을 협상하는 고급 비즈니스 대화',
    category: 'work',
    level: 'C1',
    difficulty: 9,

    setting: '회의실, 중요한 계약 협상',
    userRole: '구매 담당자',
    aiRole: '공급업체 영업 담당자',
    objective: '유리한 조건으로 계약 체결하기',

    keyPhrases: [
      'We appreciate your offer, however...',
      'Would you be willing to consider...?',
      'From our perspective...',
      'That\'s a reasonable point, but...',
      'Let\'s find a middle ground',
    ],
    vocabulary: [
      'negotiate', 'terms', 'conditions', 'concession',
      'compromise', 'deal-breaker', 'leverage',
      'mutual benefit', 'contingent upon',
      'clause', 'provision', 'amendment',
    ],
    grammarFocus: [
      '조건절 (Provided that... / Unless...)',
      '가정법 과거 (If we were to... / We would prefer...)',
      '복합 문장 구조',
    ],

    expectedTurns: 15,
    startingMessage: 'Thank you for meeting with us today. I understand you have some concerns about our initial proposal. Let\'s discuss how we can move forward.',
    hints: [
      '상대의 제안을 인정하면서도 우려사항을 제시하세요',
      '구체적인 대안을 제시하세요',
      '양쪽 모두에게 이익이 되는 점을 강조하세요',
      '양보와 요구를 균형있게 하세요',
    ],

    completionCriteria: [
      '초기 제안에 대한 피드백',
      '대안 제시',
      '합리적 근거 제시',
      '양보점 협의',
      '합의점 도출',
    ],
    commonMistakes: [
      '너무 직접적이거나 공격적인 표현',
      '일방적인 요구만 제시',
      '상대방 관점 고려 부족',
      '전문 용어 남용',
    ],

    estimatedTime: 20,
    tags: ['business', 'advanced', 'negotiation', 'professional'],
  },

  {
    id: 'cultural-discussion-c2',
    title: '🎭 문화적 차이 토론',
    description: '깊이 있는 문화 비교 및 토론',
    category: 'social',
    level: 'C2',
    difficulty: 10,

    setting: '학술 세미나, 문화 교류 행사',
    userRole: '한국 문화를 소개하는 참가자',
    aiRole: '서양 문화권 참가자',
    objective: '문화적 차이를 논리적으로 설명하고 토론하기',

    keyPhrases: [
      'From a cultural standpoint...',
      'This can be attributed to...',
      'There\'s a nuanced difference between...',
      'While that may be the case, it\'s worth noting that...',
      'This perspective stems from...',
    ],
    vocabulary: [
      'collectivism', 'individualism', 'hierarchy',
      'egalitarian', 'nuance', 'implicit', 'explicit',
      'context-dependent', 'cultural norm',
      'social construct', 'paradigm', 'dichotomy',
    ],
    grammarFocus: [
      '복잡한 종속절',
      '추상적 개념 설명',
      '논리적 연결어 (furthermore, nevertheless, consequently)',
    ],

    expectedTurns: 18,
    startingMessage: 'I find Korean workplace culture fascinating, especially the concept of "jeong" and hierarchical relationships. How would you explain these concepts to someone unfamiliar with Korean culture?',
    hints: [
      '추상적 개념을 구체적 예시로 설명하세요',
      '문화적 맥락을 제공하세요',
      '비교와 대조를 활용하세요',
      '균형잡힌 관점을 유지하세요',
    ],

    completionCriteria: [
      '복잡한 개념을 명확히 설명',
      '구체적 예시 제공',
      '비교 문화적 관점',
      '논리적 논증',
      '뉘앙스 포착',
    ],
    commonMistakes: [
      '지나친 일반화',
      '문화적 우월성 표현',
      '구체적 예시 부족',
      '논리적 비약',
    ],

    estimatedTime: 25,
    tags: ['culture', 'academic', 'discussion', 'advanced'],
  },
];

/**
 * 레벨별 시나리오 필터링
 */
export function getScenariosByLevel(level: CEFRLevel): RoleplayScenario[] {
  return ROLEPLAY_SCENARIOS.filter(s => s.level === level);
}

/**
 * 카테고리별 시나리오 필터링
 */
export function getScenariosByCategory(
  category: RoleplayScenario['category']
): RoleplayScenario[] {
  return ROLEPLAY_SCENARIOS.filter(s => s.category === category);
}

/**
 * 난이도별 시나리오 필터링
 */
export function getScenariosByDifficulty(
  minDifficulty: number,
  maxDifficulty: number
): RoleplayScenario[] {
  return ROLEPLAY_SCENARIOS.filter(
    s => s.difficulty >= minDifficulty && s.difficulty <= maxDifficulty
  );
}

/**
 * 추천 시나리오 (사용자 레벨 기반)
 */
export function getRecommendedScenarios(
  userLevel: CEFRLevel,
  completedIds: string[] = []
): RoleplayScenario[] {
  // 현재 레벨 + 한 단계 아래 시나리오
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(userLevel);
  const targetLevels = [
    levels[Math.max(0, currentIndex - 1)],
    levels[currentIndex],
  ].filter(Boolean);

  return ROLEPLAY_SCENARIOS
    .filter(s => targetLevels.includes(s.level))
    .filter(s => !completedIds.includes(s.id))
    .sort((a, b) => a.difficulty - b.difficulty)
    .slice(0, 5);
}

/**
 * 시나리오 통계
 */
export function getScenarioStats() {
  const stats = {
    total: ROLEPLAY_SCENARIOS.length,
    byLevel: {} as Record<CEFRLevel, number>,
    byCategory: {} as Record<RoleplayScenario['category'], number>,
    avgDifficulty: 0,
    avgTime: 0,
  };

  ROLEPLAY_SCENARIOS.forEach(s => {
    stats.byLevel[s.level] = (stats.byLevel[s.level] || 0) + 1;
    stats.byCategory[s.category] = (stats.byCategory[s.category] || 0) + 1;
    stats.avgDifficulty += s.difficulty;
    stats.avgTime += s.estimatedTime;
  });

  stats.avgDifficulty /= stats.total;
  stats.avgTime /= stats.total;

  return stats;
}
