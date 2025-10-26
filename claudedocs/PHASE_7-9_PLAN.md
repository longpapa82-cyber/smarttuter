# SmartTuter Phase 7-9 Development Plan

## 🎯 목표
전 세계 최고의 튜터 서비스들(Khan Academy, Duolingo, Coursera)의 핵심 기능을 분석하여 SmartTuter에 통합

---

## 📊 경쟁 분석 (2025년 기준)

### 1. Khan Academy의 성공 요소
**핵심 기능**:
- ✅ **Khanmigo AI 튜터**: 실시간 피드백과 상호작용
- ✅ **게이미피케이션**: 포인트, 배지, 레벨 시스템으로 참여도 향상
- ✅ **무료 비디오 레슨** + 연습 문제
- ✅ **진행 상황 추적**: 시각적 대시보드

**SmartTuter 적용 가능**:
- AI 튜터 (✅ 이미 구현 - Claude Sonnet 4.5)
- 게이미피케이션 시스템 (🔜 Phase 7)
- 진행 상황 시각화 (🔜 Phase 7)

### 2. Duolingo의 성공 요소
**핵심 기능**:
- ✅ **중독성 있는 게이미피케이션**: 스트릭(연속 학습일), XP, 리그
- ✅ **적응형 학습**: AI가 개인 수준에 맞춰 커스터마이즈
- ✅ **짧은 학습 세션**: 5-10분 단위 bite-sized learning
- ✅ **즉각적인 피드백**: 실시간 정답/오답 표시

**SmartTuter 적용 가능**:
- 스트릭 시스템 (🔜 Phase 7)
- 적응형 난이도 조정 (🔜 Phase 8)
- 퀵 퀴즈 모드 (🔜 Phase 9)

### 3. Coursera의 성공 요소
**핵심 기능**:
- ✅ **구조화된 코스**: 체계적인 커리큘럼
- ✅ **동료 평가**: Peer-reviewed assignments
- ✅ **수료증**: 완료 시 인증서 제공
- ✅ **고품질 비디오 강의**

**SmartTuter 적용 가능**:
- 학습 경로 추천 (🔜 Phase 8)
- 성취 인증서 (🔜 Phase 7)
- 체계적 진도 관리 (🔜 Phase 8)

---

## 🚀 Phase 7: 게이미피케이션 & 진행 상황 추적

### 목표
학습 동기 부여 및 지속성 향상

### 핵심 기능

#### 1. 포인트 & XP 시스템
```typescript
interface UserPoints {
  totalXP: number;          // 총 경험치
  level: number;            // 현재 레벨
  currentLevelXP: number;   // 현재 레벨 내 XP
  nextLevelXP: number;      // 다음 레벨까지 필요 XP
}

// XP 획득 기준
const XP_REWARDS = {
  chatTurn: 5,           // 대화 1턴당 5 XP
  problemSolved: 20,     // 문제 해결 시 20 XP
  dailyStreak: 50,       // 연속 학습 보너스 50 XP
  voiceUsed: 10,         // 음성 기능 사용 10 XP
  imageUploaded: 15,     // 이미지 업로드 15 XP
  sessionComplete: 30,   // 세션 완료 30 XP
};
```

#### 2. 배지 & 업적 시스템
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: 'engagement' | 'mastery' | 'consistency';
}

const ACHIEVEMENTS = [
  // 참여도 배지
  { id: 'first_chat', name: '첫 대화', icon: '💬', requirement: 1 },
  { id: 'chat_master', name: '대화왕', icon: '🗣️', requirement: 100 },

  // 숙련도 배지
  { id: 'math_novice', name: '수학 입문', icon: '🔢', requirement: 10 },
  { id: 'math_expert', name: '수학 달인', icon: '🧮', requirement: 100 },

  // 일관성 배지
  { id: 'streak_7', name: '일주일 연속', icon: '🔥', requirement: 7 },
  { id: 'streak_30', name: '한 달 연속', icon: '💪', requirement: 30 },
];
```

#### 3. 스트릭 시스템 (연속 학습일)
```typescript
interface StreakData {
  currentStreak: number;    // 현재 연속 학습일
  longestStreak: number;    // 최장 연속 학습일
  lastStudyDate: Date;      // 마지막 학습 날짜
  freezeCount: number;      // 스트릭 보호권 (하루 건너뛰기 허용)
}

// 스트릭 UI 예시
🔥 7일 연속 학습 중!
💎 스트릭 보호권 2개 보유
```

#### 4. 프로그레스 대시보드
```typescript
interface ProgressDashboard {
  weeklyStats: {
    totalTime: number;      // 주간 총 학습 시간 (분)
    sessionsCompleted: number; // 완료한 세션 수
    topicsStudied: string[]; // 학습한 주제들
    avgAccuracy: number;    // 평균 정확도 (%)
  };

  monthlyGoals: {
    target: number;         // 목표 학습 시간 (시간)
    current: number;        // 현재 학습 시간 (시간)
    percentage: number;     // 달성률 (%)
  };

  subjectMastery: {
    english: number;        // 영어 숙련도 (0-100)
    math: number;           // 수학 숙련도 (0-100)
  };
}
```

### UI/UX 설계

#### 대시보드 레이아웃
```
┌─────────────────────────────────────┐
│  🏆 레벨 15 (980/1000 XP)          │
│  ████████████░░ 98%                 │
├─────────────────────────────────────┤
│  🔥 연속 7일  💎 보호권 2개        │
├─────────────────────────────────────┤
│  📊 이번 주 학습 현황               │
│  ⏱️  120분 학습                    │
│  ✅ 15개 세션 완료                 │
│  📈 정확도 85%                      │
├─────────────────────────────────────┤
│  🎯 이달의 목표                     │
│  10시간 중 8시간 달성 (80%)         │
│  ████████░░ [8/10]                  │
├─────────────────────────────────────┤
│  🏅 최근 획득 배지                  │
│  🗣️ 대화왕   🔥 일주일 연속        │
└─────────────────────────────────────┘
```

### 데이터 구조 (Local Storage)
```typescript
interface UserProfile {
  id: string;
  username: string;
  avatar: string;

  // 게이미피케이션 데이터
  points: UserPoints;
  achievements: string[];    // 획득한 배지 ID들
  streak: StreakData;

  // 학습 기록
  sessions: SessionRecord[];
  totalStudyTime: number;    // 총 학습 시간 (분)

  // 레벨별 진도
  gradeLevel: string;
  subjectProgress: {
    english: TopicProgress[];
    math: TopicProgress[];
  };
}

interface SessionRecord {
  id: string;
  date: Date;
  subject: 'english' | 'math';
  duration: number;           // 분
  turnsCompleted: number;
  xpEarned: number;
  topicsCovered: string[];
}
```

---

## 🎯 Phase 8: 적응형 학습 경로 (Adaptive Learning Path)

### 목표
학생의 수준과 진도에 맞춰 개인화된 학습 경로 제공

### 핵심 기능

#### 1. 난이도 자동 조정
```typescript
interface DifficultyLevel {
  current: 1 | 2 | 3 | 4 | 5;  // 1=매우 쉬움, 5=매우 어려움
  history: number[];            // 과거 정확도 기록
  adjustmentThreshold: number;  // 조정 임계값
}

// 난이도 조정 로직
function adjustDifficulty(accuracy: number, current: DifficultyLevel): number {
  if (accuracy > 90 && current.current < 5) {
    return current.current + 1; // 난이도 상승
  } else if (accuracy < 60 && current.current > 1) {
    return current.current - 1; // 난이도 하강
  }
  return current.current;
}
```

#### 2. 학습 경로 추천
```typescript
interface LearningPath {
  currentTopic: string;
  suggestedNext: string[];
  prerequisitesMissing: string[];
  estimatedCompletion: number; // 주 단위
}

// 영어 학습 경로 예시
const ENGLISH_PATH = {
  elementary: [
    '알파벳과 발음',
    '기본 단어 (100개)',
    '간단한 문장 만들기',
    '현재 시제',
    '일상 대화',
  ],
  middle: [
    '과거/미래 시제',
    '문법 기초',
    '독해 연습',
    '작문 기초',
    '발표 연습',
  ],
  high: [
    '고급 문법',
    '학술 영어',
    '토론 및 논증',
    '에세이 작성',
    '시험 준비',
  ],
};

// 수학 학습 경로 예시
const MATH_PATH = {
  elementary: [
    '덧셈과 뺄셈',
    '곱셈과 나눗셈',
    '분수 기초',
    '기하학 도형',
    '측정과 단위',
  ],
  middle: [
    '방정식',
    '함수 기초',
    '기하학',
    '확률과 통계',
    '비율과 백분율',
  ],
  high: [
    '미적분 기초',
    '삼각함수',
    '벡터',
    '행렬',
    '고급 확률',
  ],
};
```

#### 3. 약점 진단 & 보완 학습
```typescript
interface WeaknessAnalysis {
  topic: string;
  accuracy: number;
  attemptsCount: number;
  lastAttempt: Date;
  recommendedPractice: Exercise[];
}

// 약점 진단 UI
┌─────────────────────────────────────┐
│  📉 보완이 필요한 주제              │
├─────────────────────────────────────┤
│  🔴 방정식 풀이 (정확도 45%)        │
│     → 추천: 기초부터 다시 학습      │
│                                     │
│  🟡 분수 계산 (정확도 65%)          │
│     → 추천: 연습 문제 5개 더 풀기  │
│                                     │
│  🟢 곱셈 구구단 (정확도 95%)        │
│     ✅ 잘하고 있어요!               │
└─────────────────────────────────────┘
```

#### 4. 스마트 복습 시스템 (Spaced Repetition)
```typescript
interface ReviewSchedule {
  topic: string;
  lastReview: Date;
  nextReview: Date;
  interval: number;        // 복습 간격 (일)
  easeFactor: number;      // 난이도 계수
}

// 복습 알고리즘 (SuperMemo-2 기반)
function calculateNextReview(
  currentInterval: number,
  quality: number // 0-5 (회상 품질)
): number {
  if (quality < 3) {
    return 1; // 다시 학습
  }

  if (currentInterval === 0) return 1;
  if (currentInterval === 1) return 6;

  return Math.round(currentInterval * 2.5);
}
```

---

## 🎮 Phase 9: 인터랙티브 연습 문제

### 목표
다양한 형식의 연습 문제로 학습 효과 극대화

### 핵심 기능

#### 1. 퀵 퀴즈 모드
```typescript
interface QuickQuiz {
  id: string;
  subject: 'english' | 'math';
  difficulty: 1 | 2 | 3 | 4 | 5;
  questions: Question[];
  timeLimit: number;        // 초 단위
  xpReward: number;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'true_false' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hint?: string;
}

// 퀴즈 UI 예시
┌─────────────────────────────────────┐
│  ⏱️  00:45                          │
│  문제 3/10                          │
├─────────────────────────────────────┤
│  다음 중 올바른 영어 문장은?        │
│                                     │
│  ○ A. I goed to school             │
│  ● B. I went to school             │
│  ○ C. I go to school yesterday     │
│  ○ D. I goes to school             │
│                                     │
│  [💡 힌트 보기]  [다음 →]          │
└─────────────────────────────────────┘
```

#### 2. 대화형 시나리오 연습 (영어)
```typescript
interface ConversationScenario {
  id: string;
  title: string;
  situation: string;        // "공항에서", "레스토랑에서" 등
  difficulty: number;
  turns: ScenarioTurn[];
}

interface ScenarioTurn {
  speaker: 'npc' | 'user';
  text?: string;            // NPC 대사
  expectedResponse?: string; // 예상 답변 (참고용)
  alternatives: string[];   // 가능한 응답들
  feedback: string;         // 피드백
}

// 시나리오 예시: "레스토랑에서 주문하기"
const RESTAURANT_SCENARIO = {
  title: '레스토랑에서 주문하기',
  turns: [
    {
      speaker: 'npc',
      text: "Good evening! Welcome to our restaurant. Table for how many?",
    },
    {
      speaker: 'user',
      alternatives: [
        "Table for two, please.",
        "Just one person.",
        "We have a reservation for four.",
      ],
    },
    // ... 이어지는 대화
  ],
};
```

#### 3. 실시간 피드백 & 설명
```typescript
interface FeedbackSystem {
  immediate: boolean;       // 즉각 피드백 여부
  showCorrectAnswer: boolean;
  showExplanation: boolean;
  showHint: boolean;
}

// 피드백 UI
┌─────────────────────────────────────┐
│  ❌ 틀렸습니다                      │
├─────────────────────────────────────┤
│  정답: I went to school             │
│                                     │
│  📝 설명:                           │
│  "go"의 과거형은 "went"입니다.      │
│  "yesterday"가 있으므로 과거형을    │
│  사용해야 합니다.                   │
│                                     │
│  💡 팁:                             │
│  불규칙 동사의 과거형은 외워야      │
│  합니다. go-went-gone              │
│                                     │
│  [다시 풀기]  [다음 문제 →]        │
└─────────────────────────────────────┘
```

#### 4. 진도 기반 도전 과제
```typescript
interface Challenge {
  id: string;
  title: string;
  description: string;
  requirements: {
    level: number;
    prerequisite: string[];
  };
  rewards: {
    xp: number;
    badge?: string;
    unlocks?: string[];
  };
  tasks: ChallengeTask[];
}

// 도전 과제 예시
const CHALLENGES = [
  {
    id: 'math_marathon',
    title: '수학 마라톤',
    description: '30분 안에 20문제 풀기',
    requirements: { level: 5, prerequisite: [] },
    rewards: { xp: 500, badge: 'marathon_master' },
  },
  {
    id: 'english_conversation',
    title: '영어 대화 달인',
    description: '10턴 이상 대화 5회 완료',
    requirements: { level: 3, prerequisite: [] },
    rewards: { xp: 300, badge: 'conversation_pro' },
  },
];
```

---

## 🎨 UI/UX 개선 사항

### 1. 메인 대시보드 추가
- 사용자 프로필 (레벨, XP, 스트릭)
- 주간/월간 통계 요약
- 추천 학습 경로
- 최근 획득 배지

### 2. 게이미피케이션 요소
- 레벨업 애니메이션
- 배지 획득 알림 (토스트)
- XP 획득 시 시각적 피드백
- 스트릭 유지 격려 메시지

### 3. 프로그레스 바 & 차트
- 주간 학습 시간 차트
- 과목별 숙련도 레이더 차트
- 월간 목표 진행률
- 주제별 정확도 히트맵

---

## 📦 기술 스택 확장

### 추가 라이브러리
```json
{
  "recharts": "^2.10.0",        // 차트 및 그래프
  "react-confetti": "^6.1.0",   // 레벨업 축하 효과
  "date-fns": "^3.0.0",         // 날짜 계산
  "zustand": "^4.5.0",          // 전역 상태 관리
  "react-hot-toast": "^2.4.1"   // 알림 토스트
}
```

### 데이터 저장
- **Local Storage**: 사용자 프로필, 진행 상황
- **Session Storage**: 현재 세션 데이터
- **IndexedDB** (선택): 대용량 학습 기록

---

## 📅 구현 우선순위

### Phase 7 (높음)
1. ✅ 포인트 & XP 시스템
2. ✅ 레벨 시스템
3. ✅ 배지 & 업적
4. ✅ 스트릭 추적
5. ✅ 프로그레스 대시보드

### Phase 8 (중간)
1. ✅ 난이도 자동 조정
2. ✅ 학습 경로 추천
3. ✅ 약점 진단
4. ⏸️ 스마트 복습 시스템 (선택)

### Phase 9 (낮음)
1. ✅ 퀵 퀴즈 모드
2. ⏸️ 대화형 시나리오 (영어)
3. ✅ 실시간 피드백
4. ⏸️ 도전 과제 시스템 (선택)

---

## 🎯 성공 지표 (KPI)

### 사용자 참여도
- **일일 활성 사용자(DAU)** 증가
- **평균 세션 시간** 15분 이상
- **스트릭 유지율** 70% 이상

### 학습 효과
- **주제별 정확도** 80% 이상
- **완료율** (시작한 세션 중 완료한 비율) 85% 이상
- **복습 참여율** 60% 이상

### 게이미피케이션 효과
- **배지 획득률** 사용자당 평균 5개 이상
- **레벨 10 달성률** 30% 이상
- **7일 스트릭 달성률** 50% 이상

---

**작성일**: 2025-10-26
**다음 단계**: Phase 7 구현 시작 (게이미피케이션 시스템)
