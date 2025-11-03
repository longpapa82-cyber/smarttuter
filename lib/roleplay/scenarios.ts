// lib/roleplay/scenarios.ts

/**
 * 롤플레이 시나리오 데이터
 * 실전 영어 회화 연습을 위한 10가지 상황별 시나리오
 */

export type ScenarioCategory = 'daily' | 'business' | 'academic' | 'travel';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface RoleplayScenario {
  id: string;
  category: ScenarioCategory;
  title: string;
  description: string;
  level: CEFRLevel;
  situation: string;
  yourRole: string;
  aiRole: string;
  objectives: string[];
  keyPhrases: string[];
  initialMessage: string;
  tips: string[];
  estimatedDuration: number; // 분
  icon: string;
}

/**
 * 일상 대화 시나리오 (3개)
 */
const dailyScenarios: RoleplayScenario[] = [
  {
    id: 'daily-restaurant',
    category: 'daily',
    title: '레스토랑에서 주문하기',
    description: '레스토랑에서 음식을 주문하고 계산하는 상황',
    level: 'A2',
    situation: '당신은 새로운 레스토랑에 왔습니다. 메뉴를 보고 음식을 주문하세요.',
    yourRole: '손님',
    aiRole: '웨이터/웨이트리스',
    objectives: [
      '메뉴 추천 받기',
      '음식 주문하기',
      '특별 요청하기 (알레르기, 매운 정도 등)',
      '계산서 요청하기',
    ],
    keyPhrases: [
      "I'd like to order...",
      'Could you recommend...?',
      'I am allergic to...',
      'How spicy is it?',
      'Can I have the bill, please?',
    ],
    initialMessage: "Good evening! Welcome to our restaurant. How many people are in your party?",
    tips: [
      '정중하게 "please"와 "thank you"를 사용하세요',
      '모르는 메뉴는 "What is...?"로 물어보세요',
      '특별 요청은 "Can I have... without...?" 형태로',
    ],
    estimatedDuration: 5,
    icon: '🍽️',
  },
  {
    id: 'daily-shopping',
    category: 'daily',
    title: '쇼핑하기',
    description: '옷 가게에서 쇼핑하고 교환/환불하는 상황',
    level: 'A2',
    situation: '당신은 옷 가게에서 쇼핑 중입니다. 마음에 드는 옷을 찾고 가격과 사이즈를 확인하세요.',
    yourRole: '고객',
    aiRole: '판매원',
    objectives: [
      '원하는 상품 찾기',
      '사이즈와 색상 문의하기',
      '시착 요청하기',
      '가격 확인 및 할인 여부 물어보기',
    ],
    keyPhrases: [
      "I'm looking for...",
      'Do you have this in...?',
      'Can I try this on?',
      'How much is it?',
      'Is there any discount?',
    ],
    initialMessage: "Hi! Welcome to our store. Are you looking for anything specific today?",
    tips: [
      '사이즈는 "Do you have this in size...?"',
      '색상은 "Do you have this in...color?"',
      '가격이 비싸면 "That\'s a bit expensive. Do you have anything cheaper?"',
    ],
    estimatedDuration: 5,
    icon: '🛍️',
  },
  {
    id: 'daily-directions',
    category: 'daily',
    title: '길 물어보기',
    description: '낯선 도시에서 길을 물어보고 찾아가는 상황',
    level: 'A2',
    situation: '당신은 낯선 도시에서 길을 잃었습니다. 지나가는 사람에게 길을 물어보세요.',
    yourRole: '여행자',
    aiRole: '현지인',
    objectives: [
      '목적지까지 가는 방법 물어보기',
      '교통수단 문의하기',
      '소요 시간 확인하기',
      '랜드마크 확인하기',
    ],
    keyPhrases: [
      'Excuse me, how do I get to...?',
      'Is it walking distance?',
      'How long does it take?',
      'Which bus/subway should I take?',
      'Could you show me on the map?',
    ],
    initialMessage: "Oh, you look lost. Can I help you with directions?",
    tips: [
      '"Excuse me"로 정중하게 시작하세요',
      '잘 못 알아들었으면 "Sorry, could you repeat that?"',
      '감사 인사는 "Thank you so much for your help!"',
    ],
    estimatedDuration: 4,
    icon: '🗺️',
  },
];

/**
 * 비즈니스 영어 시나리오 (3개)
 */
const businessScenarios: RoleplayScenario[] = [
  {
    id: 'business-meeting',
    category: 'business',
    title: '회의 참여하기',
    description: '팀 미팅에서 의견을 제시하고 토론하는 상황',
    level: 'B2',
    situation: '당신은 신제품 출시 전략 회의에 참석했습니다. 당신의 의견을 제시하고 다른 사람의 의견에 반응하세요.',
    yourRole: '마케팅 매니저',
    aiRole: '프로젝트 리더',
    objectives: [
      '의견 명확하게 제시하기',
      '다른 의견에 동의/반대 표현하기',
      '질문하고 명확히 하기',
      '회의 내용 요약하기',
    ],
    keyPhrases: [
      'I believe that...',
      'From my perspective...',
      'I agree/disagree with...',
      'Could you clarify...?',
      'To summarize...',
    ],
    initialMessage: "Good morning, everyone. Let's start today's meeting about our new product launch strategy. What are your initial thoughts?",
    tips: [
      '의견 제시: "I think we should..." 또는 "In my opinion..."',
      '동의: "I completely agree with that point"',
      '반대: "I see your point, but..." (정중하게)',
    ],
    estimatedDuration: 8,
    icon: '💼',
  },
  {
    id: 'business-email',
    category: 'business',
    title: '비즈니스 이메일 작성',
    description: '거래처에 공식 이메일을 작성하고 답변하는 상황',
    level: 'B1',
    situation: '당신은 해외 거래처에 제품 문의 이메일을 작성해야 합니다. 정중하고 명확하게 작성하세요.',
    yourRole: '구매 담당자',
    aiRole: '영업 담당자',
    objectives: [
      '이메일 인사말 작성하기',
      '문의 내용 명확히 전달하기',
      '필요한 정보 요청하기',
      '정중하게 마무리하기',
    ],
    keyPhrases: [
      'Dear Mr./Ms. ...',
      'I am writing to inquire about...',
      'Could you please provide...?',
      'I would appreciate it if...',
      'Looking forward to hearing from you',
    ],
    initialMessage: "I received your inquiry. Let me help you compose a professional email. What would you like to ask about?",
    tips: [
      '시작: "Dear [Name]" (격식) 또는 "Hi [Name]" (친근)',
      '본문: 명확하고 간결하게',
      '끝: "Best regards" 또는 "Sincerely"',
    ],
    estimatedDuration: 7,
    icon: '📧',
  },
  {
    id: 'business-presentation',
    category: 'business',
    title: '프레젠테이션하기',
    description: '제품이나 아이디어를 발표하고 질문에 답변하는 상황',
    level: 'B2',
    situation: '당신은 신제품을 투자자들에게 프레젠테이션해야 합니다. 명확하고 설득력 있게 발표하세요.',
    yourRole: '발표자',
    aiRole: '투자자/청중',
    objectives: [
      '프레젠테이션 시작하기',
      '주요 포인트 명확히 전달하기',
      '데이터와 예시 제시하기',
      '질문에 효과적으로 답변하기',
    ],
    keyPhrases: [
      "Good morning, I'd like to present...",
      'Let me show you...',
      'As you can see from this data...',
      'To answer your question...',
      'Thank you for your attention',
    ],
    initialMessage: "Welcome! We're ready for your presentation. Please begin whenever you're ready.",
    tips: [
      '시작: 자기소개 + 주제 소개',
      '본론: "First, Second, Finally" 구조',
      '끝: 요약 + 질문 유도',
    ],
    estimatedDuration: 10,
    icon: '📊',
  },
];

/**
 * 학술 영어 시나리오 (2개)
 */
const academicScenarios: RoleplayScenario[] = [
  {
    id: 'academic-debate',
    category: 'academic',
    title: '학술 토론',
    description: '학술적 주제에 대해 논리적으로 토론하는 상황',
    level: 'C1',
    situation: '당신은 대학 세미나에서 "AI가 인간의 창의성을 대체할 수 있는가?"에 대해 토론합니다.',
    yourRole: '토론 참가자',
    aiRole: '토론 진행자/상대방',
    objectives: [
      '논거를 논리적으로 제시하기',
      '반론 제기하기',
      '증거와 예시 사용하기',
      '결론 도출하기',
    ],
    keyPhrases: [
      'The evidence suggests that...',
      'While I understand your point...',
      'Research shows that...',
      'To counter that argument...',
      'In conclusion...',
    ],
    initialMessage: "Good afternoon. Today's debate topic is 'Can AI replace human creativity?' Please present your opening statement.",
    tips: [
      '논거: "First of all, Secondly, Moreover"',
      '반론: "However, On the contrary"',
      '증거: "According to..., Studies show..."',
    ],
    estimatedDuration: 12,
    icon: '🎓',
  },
  {
    id: 'academic-presentation',
    category: 'academic',
    title: '논문 발표',
    description: '연구 결과를 학회에서 발표하는 상황',
    level: 'C1',
    situation: '당신은 학회에서 연구 논문을 발표합니다. 연구 방법과 결과를 명확하게 설명하세요.',
    yourRole: '연구자',
    aiRole: '청중/심사위원',
    objectives: [
      '연구 배경과 목적 설명하기',
      '연구 방법론 제시하기',
      '결과 분석하기',
      '학술적 질문에 답변하기',
    ],
    keyPhrases: [
      'The purpose of this study is...',
      'We employed a methodology that...',
      'The findings demonstrate...',
      'The implications of this research...',
      'Future research should address...',
    ],
    initialMessage: "Welcome to our academic conference. Please proceed with your research presentation.",
    tips: [
      '구조: Introduction → Methodology → Results → Discussion → Conclusion',
      '전문 용어를 정확하게 사용',
      '질문에는 "That\'s a good question..." 후 답변',
    ],
    estimatedDuration: 15,
    icon: '📚',
  },
];

/**
 * 초급 레벨 시나리오 (A1) - 5개
 */
const beginnerA1Scenarios: RoleplayScenario[] = [
  {
    id: 'a1-greetings',
    category: 'daily',
    title: '첫 만남 인사하기',
    description: '새로운 사람을 만나서 간단히 인사하고 자기소개하기',
    level: 'A1',
    situation: '영어 수업 첫날, 옆자리 친구와 인사를 나눕니다.',
    yourRole: '학생',
    aiRole: '같은 반 친구',
    objectives: [
      '간단한 인사말 하기',
      '이름 소개하기',
      '나이와 출신 말하기',
      '간단한 질문 주고받기',
    ],
    keyPhrases: [
      'Hello! / Hi!',
      'My name is...',
      'I am ... years old',
      'I am from...',
      'Nice to meet you!',
    ],
    initialMessage: "Hi! This is my first day in this class. What's your name?",
    tips: [
      '"Hello" 또는 "Hi"로 시작하세요',
      '"My name is..."로 자기소개',
      '"Nice to meet you"로 마무리',
    ],
    estimatedDuration: 3,
    icon: '👋',
  },
  {
    id: 'a1-numbers',
    category: 'daily',
    title: '가격 물어보기',
    description: '가게에서 물건 가격을 묻고 간단히 구매하기',
    level: 'A1',
    situation: '편의점에서 간식을 사려고 합니다. 가격을 물어보고 구매하세요.',
    yourRole: '손님',
    aiRole: '점원',
    objectives: [
      '가격 물어보기',
      '간단한 숫자 이해하기',
      '"Yes"와 "No"로 답하기',
      '감사 인사하기',
    ],
    keyPhrases: [
      'How much is this?',
      'How much are these?',
      'I want this',
      'Yes, please / No, thank you',
      'Thank you!',
    ],
    initialMessage: "Hello! Welcome to our store. Can I help you?",
    tips: [
      '가격은 "How much is...?"',
      '원하면 "I want this, please"',
      '항상 "Thank you" 잊지 마세요',
    ],
    estimatedDuration: 3,
    icon: '🛒',
  },
  {
    id: 'a1-family',
    category: 'daily',
    title: '가족 소개하기',
    description: '가족 구성원에 대해 간단히 말하기',
    level: 'A1',
    situation: '친구가 당신의 가족에 대해 물어봅니다.',
    yourRole: '학생',
    aiRole: '친구',
    objectives: [
      '가족 구성원 말하기',
      '형제자매 수 말하기',
      '부모님 직업 간단히 말하기',
    ],
    keyPhrases: [
      'I have ...',
      'My father/mother is...',
      'I have a brother/sister',
      'He/She is...',
    ],
    initialMessage: "Do you have any brothers or sisters?",
    tips: [
      '"I have..."로 가족 구성 말하기',
      '"My father is a teacher" 형태로 직업 소개',
    ],
    estimatedDuration: 4,
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'a1-colors-clothes',
    category: 'daily',
    title: '옷 색상 말하기',
    description: '입고 있는 옷의 색상과 종류 말하기',
    level: 'A1',
    situation: '친구가 당신이 입은 옷에 대해 물어봅니다.',
    yourRole: '학생',
    aiRole: '친구',
    objectives: [
      '색상 이름 말하기',
      '옷 종류 말하기',
      '좋아하는 색 말하기',
    ],
    keyPhrases: [
      'I like red/blue/green...',
      'I am wearing...',
      'This is my...',
      'It is...',
    ],
    initialMessage: "Wow, I like your shirt! What color is it?",
    tips: [
      '색상: "It is blue"',
      '옷: "I am wearing a blue shirt"',
    ],
    estimatedDuration: 3,
    icon: '👕',
  },
  {
    id: 'a1-weather',
    category: 'daily',
    title: '날씨 말하기',
    description: '오늘 날씨에 대해 간단히 대화하기',
    level: 'A1',
    situation: '친구와 오늘 날씨에 대해 이야기합니다.',
    yourRole: '학생',
    aiRole: '친구',
    objectives: [
      '날씨 표현하기',
      '좋다/나쁘다 말하기',
      '계절 말하기',
    ],
    keyPhrases: [
      'It is sunny/rainy/cloudy',
      'It is hot/cold/warm',
      'The weather is good/bad',
      'I like/don\'t like...',
    ],
    initialMessage: "Good morning! How is the weather today?",
    tips: [
      '"It is..."로 날씨 표현',
      '"The weather is..."도 사용 가능',
    ],
    estimatedDuration: 3,
    icon: '☀️',
  },
];

/**
 * 초급 레벨 시나리오 (A2) - 기존 + 3개 추가
 */
const beginnerA2ScenariosExtra: RoleplayScenario[] = [
  {
    id: 'a2-doctor',
    category: 'daily',
    title: '병원 가기',
    description: '의사에게 증상을 설명하고 조언 받기',
    level: 'A2',
    situation: '감기에 걸려서 병원에 갔습니다. 의사에게 증상을 설명하세요.',
    yourRole: '환자',
    aiRole: '의사',
    objectives: [
      '증상 설명하기',
      '언제부터 아팠는지 말하기',
      '의사의 질문에 답하기',
      '처방전 받기',
    ],
    keyPhrases: [
      'I don\'t feel well',
      'I have a headache/fever/cough',
      'It started yesterday/two days ago',
      'It hurts here',
      'What should I do?',
    ],
    initialMessage: "Good morning. What seems to be the problem today?",
    tips: [
      '증상: "I have a..."',
      '시간: "It started... days ago"',
      '"It hurts when I..." 형태로 구체적으로',
    ],
    estimatedDuration: 5,
    icon: '🏥',
  },
  {
    id: 'a2-phone-call',
    category: 'daily',
    title: '전화로 예약하기',
    description: '식당이나 미용실에 전화로 예약하기',
    level: 'A2',
    situation: '레스토랑에 전화해서 저녁 예약을 합니다.',
    yourRole: '고객',
    aiRole: '레스토랑 직원',
    objectives: [
      '예약하고 싶다고 말하기',
      '날짜와 시간 말하기',
      '인원 말하기',
      '확인 받기',
    ],
    keyPhrases: [
      'I\'d like to make a reservation',
      'For ... people',
      'At ... o\'clock',
      'On Friday/Saturday...',
      'Can I have your name?',
    ],
    initialMessage: "Good afternoon, Luigi's Restaurant. How can I help you?",
    tips: [
      '시작: "I\'d like to make a reservation"',
      '날짜/시간을 명확하게',
      '이름 철자: "That\'s S-M-I-T-H"',
    ],
    estimatedDuration: 4,
    icon: '📞',
  },
  {
    id: 'a2-weekend',
    category: 'daily',
    title: '주말 계획 이야기하기',
    description: '친구와 주말에 무엇을 할지 이야기하기',
    level: 'A2',
    situation: '금요일입니다. 친구와 주말 계획을 이야기합니다.',
    yourRole: '학생',
    aiRole: '친구',
    objectives: [
      '주말 계획 말하기',
      '시간 표현하기',
      '초대하기/초대 받기',
      '함께 할 활동 제안하기',
    ],
    keyPhrases: [
      'I\'m going to...',
      'I will...',
      'Do you want to...?',
      'That sounds great!',
      'What time?',
    ],
    initialMessage: "It's Friday! Do you have any plans for the weekend?",
    tips: [
      '계획: "I\'m going to..." 또는 "I will..."',
      '제안: "Do you want to...?" 또는 "Let\'s..."',
    ],
    estimatedDuration: 5,
    icon: '🎉',
  },
];

/**
 * 중급 레벨 시나리오 (B1) - 기존 + 3개 추가
 */
const intermediateB1ScenariosExtra: RoleplayScenario[] = [
  {
    id: 'b1-job-interview',
    category: 'business',
    title: '간단한 면접',
    description: '파트타임 일자리 면접 보기',
    level: 'B1',
    situation: '카페 파트타임 일자리에 지원했습니다. 매니저와 면접을 봅니다.',
    yourRole: '지원자',
    aiRole: '매니저',
    objectives: [
      '자기소개하기',
      '경험과 강점 말하기',
      '근무 가능 시간 말하기',
      '질문에 답하고 질문하기',
    ],
    keyPhrases: [
      'I have experience in...',
      'I am good at...',
      'I can work on...',
      'What would my responsibilities be?',
      'When can I start?',
    ],
    initialMessage: "Hello! Thanks for coming in today. Tell me a little about yourself.",
    tips: [
      '경험: "I worked at..." 또는 "I have... years of experience"',
      '강점: "I am a hard worker" / "I learn quickly"',
      '질문도 적극적으로!',
    ],
    estimatedDuration: 7,
    icon: '💼',
  },
  {
    id: 'b1-complaint',
    category: 'daily',
    title: '불만 제기하기',
    description: '잘못된 주문이나 서비스에 대해 정중하게 불만 제기하기',
    level: 'B1',
    situation: '온라인으로 주문한 상품이 잘못 왔습니다. 고객 서비스에 연락합니다.',
    yourRole: '고객',
    aiRole: '고객 서비스 담당자',
    objectives: [
      '문제 설명하기',
      '원하는 해결책 말하기',
      '정중하게 불만 표현하기',
      '해결 방법 협의하기',
    ],
    keyPhrases: [
      'I ordered... but I received...',
      'I\'m not satisfied with...',
      'Could you please...?',
      'I would like a refund/exchange',
      'I hope this can be resolved',
    ],
    initialMessage: "Customer service, how can I help you today?",
    tips: [
      '정중함 유지: "I\'m afraid..." / "Unfortunately..."',
      '문제 명확히: "I ordered X but received Y"',
      '해결책 제시: "I would like to..."',
    ],
    estimatedDuration: 6,
    icon: '📦',
  },
  {
    id: 'b1-advice',
    category: 'daily',
    title: '조언 구하고 주기',
    description: '친구에게 조언을 구하거나 조언해주기',
    level: 'B1',
    situation: '진로나 학업에 대해 친구와 조언을 주고받습니다.',
    yourRole: '학생',
    aiRole: '친구',
    objectives: [
      '상황 설명하기',
      '조언 요청하기',
      '의견 표현하기',
      '조언에 반응하기',
    ],
    keyPhrases: [
      'What do you think I should do?',
      'If I were you, I would...',
      'Have you considered...?',
      'That\'s a good idea',
      'I\'ll think about it',
    ],
    initialMessage: "Hey, you look worried. Is everything okay? Do you want to talk about it?",
    tips: [
      '조언 요청: "What would you do?" / "Do you have any advice?"',
      '조언 주기: "If I were you..." / "Why don\'t you...?"',
      '감사: "Thanks for the advice!"',
    ],
    estimatedDuration: 7,
    icon: '💭',
  },
];

/**
 * 여행 영어 시나리오 (2개)
 */
const travelScenarios: RoleplayScenario[] = [
  {
    id: 'travel-hotel',
    category: 'travel',
    title: '호텔 체크인',
    description: '호텔에서 체크인하고 시설 문의하는 상황',
    level: 'A2',
    situation: '당신은 해외 호텔에 도착했습니다. 체크인하고 필요한 정보를 얻으세요.',
    yourRole: '투숙객',
    aiRole: '프론트 데스크 직원',
    objectives: [
      '예약 확인하기',
      '체크인 절차 완료하기',
      '호텔 시설 문의하기',
      '특별 요청하기',
    ],
    keyPhrases: [
      'I have a reservation under...',
      'What time is breakfast?',
      'Is there Wi-Fi in the room?',
      'Could I get a wake-up call at...?',
      'Where is the elevator/gym/pool?',
    ],
    initialMessage: "Good evening! Welcome to our hotel. Do you have a reservation with us?",
    tips: [
      '예약 확인: "I booked a room under the name..."',
      '요청: "Could you..." 또는 "Is it possible to..."',
      '감사: "Thank you for your help"',
    ],
    estimatedDuration: 5,
    icon: '🏨',
  },
  {
    id: 'travel-airport',
    category: 'travel',
    title: '공항 체크인',
    description: '공항에서 탑승 수속하고 정보 확인하는 상황',
    level: 'A2',
    situation: '당신은 국제공항에서 비행기를 탑승하기 위해 체크인합니다.',
    yourRole: '승객',
    aiRole: '공항 직원',
    objectives: [
      '티켓 제시하고 체크인하기',
      '수하물 규정 확인하기',
      '좌석 요청하기',
      '탑승구와 시간 확인하기',
    ],
    keyPhrases: [
      "Here's my passport and ticket",
      'How many bags can I check in?',
      'Could I have a window/aisle seat?',
      'What time does boarding start?',
      'Which gate is my flight?',
    ],
    initialMessage: "Good morning! May I see your passport and ticket, please?",
    tips: [
      '수하물: "How many bags can I check?" / "Is this carry-on okay?"',
      '좌석: "I prefer a window/aisle seat"',
      '게이트: "What gate do I go to?"',
    ],
    estimatedDuration: 5,
    icon: '✈️',
  },
];

/**
 * 고급 레벨 시나리오 (B2, C1, C2) - 6개 추가
 */
const advancedScenariosExtra: RoleplayScenario[] = [
  {
    id: 'b2-negotiation',
    category: 'business',
    title: '협상하기',
    description: '거래 조건이나 가격을 협상하기',
    level: 'B2',
    situation: '당신은 공급업체와 계약 조건을 협상합니다.',
    yourRole: '구매 담당자',
    aiRole: '공급업체 영업 담당자',
    objectives: [
      '초기 제안 듣기',
      '반대 제안하기',
      '타협점 찾기',
      '합의 도달하기',
    ],
    keyPhrases: [
      'I appreciate your offer, but...',
      'Would you consider...?',
      'We could meet halfway',
      'That seems reasonable',
      'Let\'s find a win-win solution',
    ],
    initialMessage: "Thank you for meeting with us today. We're prepared to discuss the terms of our agreement. Our initial offer is...",
    tips: [
      '정중하게 거절: "I understand, but unfortunately..."',
      '대안 제시: "What if we..." / "How about..."',
      '타협: "We could compromise on..."',
    ],
    estimatedDuration: 10,
    icon: '🤝',
  },
  {
    id: 'b2-cultural-discussion',
    category: 'daily',
    title: '문화 차이 토론',
    description: '다양한 문화에 대해 토론하고 비교하기',
    level: 'B2',
    situation: '국제 학생들과 각국의 문화 차이에 대해 이야기합니다.',
    yourRole: '학생',
    aiRole: '외국 친구',
    objectives: [
      '문화적 관습 설명하기',
      '문화 차이 비교하기',
      '문화적 오해 이해하기',
      '존중하는 태도 보이기',
    ],
    keyPhrases: [
      'In my culture, we...',
      'It\'s interesting how...',
      'What do people in your country think about...?',
      'I\'ve noticed that...',
      'Cultural differences can be fascinating',
    ],
    initialMessage: "I'm really curious about cultural differences. How do people in your country celebrate special occasions?",
    tips: [
      '비교: "In my country... but in yours..."',
      '질문: "Is it true that...?"',
      '존중: "I find that very interesting/unique"',
    ],
    estimatedDuration: 8,
    icon: '🌍',
  },
  {
    id: 'c1-research-discussion',
    category: 'academic',
    title: '연구 프로젝트 논의',
    description: '연구 주제와 방법론에 대해 심도 있게 논의하기',
    level: 'C1',
    situation: '지도교수와 석사 논문 주제를 논의합니다.',
    yourRole: '대학원생',
    aiRole: '지도교수',
    objectives: [
      '연구 주제 제안하기',
      '연구의 의의 설명하기',
      '방법론 논의하기',
      '피드백 받고 수정하기',
    ],
    keyPhrases: [
      'My proposed research focuses on...',
      'The significance of this study lies in...',
      'I intend to employ a mixed-methods approach',
      'Given the limitations...',
      'Building on previous research by...',
    ],
    initialMessage: "Good morning. I've reviewed your preliminary proposal. Let's discuss your research direction in more depth.",
    tips: [
      '학술적 표현 사용',
      '선행 연구 언급: "As Smith (2020) argued..."',
      '비판적 사고 보이기',
    ],
    estimatedDuration: 15,
    icon: '🔬',
  },
  {
    id: 'c1-policy-debate',
    category: 'academic',
    title: '정책 토론',
    description: '사회 정책에 대해 찬반 토론하기',
    level: 'C1',
    situation: '환경 정책에 대한 토론회에 참가합니다.',
    yourRole: '토론자',
    aiRole: '반대편 토론자',
    objectives: [
      '논리적 주장 전개하기',
      '증거 제시하기',
      '반론 구성하기',
      '설득력 있게 마무리하기',
    ],
    keyPhrases: [
      'The data unequivocally shows...',
      'While your argument has merit...',
      'We must consider the broader implications',
      'The evidence contradicts that assertion',
      'A more nuanced approach would be...',
    ],
    initialMessage: "Welcome to today's debate on environmental policy. Please present your opening arguments.",
    tips: [
      '논리적 구조: Problem → Evidence → Solution → Impact',
      '반론: "Your point overlooks..." / "However, research indicates..."',
      '강조: "It is crucial/imperative that..."',
    ],
    estimatedDuration: 12,
    icon: '⚖️',
  },
  {
    id: 'c2-philosophical-discussion',
    category: 'academic',
    title: '철학적 논의',
    description: '추상적이고 복잡한 철학적 개념 토론하기',
    level: 'C2',
    situation: '세미나에서 윤리와 AI에 대해 철학적으로 논의합니다.',
    yourRole: '연구자',
    aiRole: '철학 교수',
    objectives: [
      '추상적 개념 정의하기',
      '다양한 철학적 관점 제시하기',
      '논리적 모순 찾기',
      '새로운 통찰 제시하기',
    ],
    keyPhrases: [
      'From a utilitarian perspective...',
      'This raises fundamental questions about...',
      'The epistemological implications are...',
      'One might argue that...',
      'The paradox inherent in this position is...',
    ],
    initialMessage: "I'd like to explore the ethical dimensions of artificial consciousness. What are your thoughts on whether AI systems can possess genuine moral agency?",
    tips: [
      '철학 용어의 정확한 사용',
      '다양한 관점 제시: utilitarian, deontological, virtue ethics',
      '사고 실험(thought experiment) 활용',
    ],
    estimatedDuration: 15,
    icon: '💭',
  },
  {
    id: 'c2-literary-analysis',
    category: 'academic',
    title: '문학 비평',
    description: '문학 작품에 대해 비평적으로 분석하고 토론하기',
    level: 'C2',
    situation: '대학원 세미나에서 현대 문학 작품을 분석합니다.',
    yourRole: '문학 연구자',
    aiRole: '교수/동료 연구자',
    objectives: [
      '작품의 주제와 상징 분석하기',
      '문학적 기법 논의하기',
      '문화적/역사적 맥락 연결하기',
      '비평 이론 적용하기',
    ],
    keyPhrases: [
      'The author employs a narrative technique that...',
      'Through the lens of post-colonial theory...',
      'The symbolism is particularly nuanced in...',
      'This work subverts traditional genre conventions',
      'The intertextual references to...',
    ],
    initialMessage: "Let's delve into the narrative structure of this novel. How do you interpret the author's use of fragmented chronology?",
    tips: [
      '문학 이론 용어 사용: post-modernism, deconstruction, etc.',
      '텍스트 증거 인용',
      '다층적 해석 제시',
    ],
    estimatedDuration: 15,
    icon: '📖',
  },
];

/**
 * 모든 시나리오 통합
 */
export const allScenarios: RoleplayScenario[] = [
  ...beginnerA1Scenarios,
  ...dailyScenarios,
  ...beginnerA2ScenariosExtra,
  ...businessScenarios,
  ...intermediateB1ScenariosExtra,
  ...academicScenarios,
  ...travelScenarios,
  ...advancedScenariosExtra,
];

/**
 * 카테고리별 시나리오 조회
 */
export function getScenariosByCategory(category: ScenarioCategory): RoleplayScenario[] {
  return allScenarios.filter(s => s.category === category);
}

/**
 * 레벨별 시나리오 조회
 */
export function getScenariosByLevel(level: CEFRLevel): RoleplayScenario[] {
  return allScenarios.filter(s => s.level === level);
}

/**
 * ID로 시나리오 조회
 */
export function getScenarioById(id: string): RoleplayScenario | undefined {
  return allScenarios.find(s => s.id === id);
}

/**
 * 학년 또는 CEFR 레벨에 맞는 시나리오 추천
 * @param gradeLevelOrCEFR - 학년 (예: "중학교 1학년") 또는 CEFR 레벨 (예: "B1")
 */
export function getRecommendedScenarios(gradeLevelOrCEFR: string): RoleplayScenario[] {
  let recommendedLevel: CEFRLevel;

  // Check if input is CEFR level
  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (cefrLevels.includes(gradeLevelOrCEFR as CEFRLevel)) {
    recommendedLevel = gradeLevelOrCEFR as CEFRLevel;
  } else {
    // Convert grade level to CEFR
    if (gradeLevelOrCEFR.includes('초등')) {
      recommendedLevel = 'A2';
    } else if (gradeLevelOrCEFR.includes('중학')) {
      recommendedLevel = 'B1';
    } else if (gradeLevelOrCEFR.includes('고등')) {
      recommendedLevel = 'B2';
    } else {
      recommendedLevel = 'C1';
    }
  }

  // 추천 레벨과 한 단계 아래/위 레벨의 시나리오 반환 (적응형 학습을 위해)
  const levelMap: Record<CEFRLevel, CEFRLevel[]> = {
    A1: ['A1', 'A2'], // A1 + 한 단계 위
    A2: ['A1', 'A2', 'B1'], // 한 단계 아래 + A2 + 한 단계 위
    B1: ['A2', 'B1', 'B2'], // 한 단계 아래 + B1 + 한 단계 위
    B2: ['B1', 'B2', 'C1'], // 한 단계 아래 + B2 + 한 단계 위
    C1: ['B2', 'C1', 'C2'], // 한 단계 아래 + C1 + 한 단계 위
    C2: ['C1', 'C2'], // 한 단계 아래 + C2
  };

  const targetLevels = levelMap[recommendedLevel];
  return allScenarios.filter(s => targetLevels.includes(s.level));
}

/**
 * 적응형 학습을 위한 정확한 레벨의 시나리오만 가져오기
 * @param cefrLevel - 현재 CEFR 레벨
 */
export function getScenariosByExactLevel(cefrLevel: CEFRLevel): RoleplayScenario[] {
  return allScenarios.filter(s => s.level === cefrLevel);
}

/**
 * 시나리오 통계 정보
 */
export function getScenarioStats() {
  const stats = {
    total: allScenarios.length,
    byLevel: {} as Record<CEFRLevel, number>,
    byCategory: {} as Record<ScenarioCategory, number>,
  };

  // Count by level
  cefrLevels.forEach(level => {
    stats.byLevel[level] = allScenarios.filter(s => s.level === level).length;
  });

  // Count by category
  const categories: ScenarioCategory[] = ['daily', 'business', 'academic', 'travel'];
  categories.forEach(category => {
    stats.byCategory[category] = allScenarios.filter(s => s.category === category).length;
  });

  return stats;
}

// Helper for stats function
const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * 카테고리 정보
 */
export const categoryInfo = {
  daily: {
    name: '일상 대화',
    description: '일상생활에서 자주 마주치는 상황',
    icon: '🌟',
    color: 'blue',
  },
  business: {
    name: '비즈니스 영어',
    description: '직장과 업무에서 필요한 영어',
    icon: '💼',
    color: 'purple',
  },
  academic: {
    name: '학술 영어',
    description: '학교와 연구에 필요한 영어',
    icon: '🎓',
    color: 'green',
  },
  travel: {
    name: '여행 영어',
    description: '여행 중 필요한 영어',
    icon: '✈️',
    color: 'orange',
  },
};
