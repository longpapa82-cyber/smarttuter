# Phase 9 계획 - 인터랙티브 학습 시스템

**계획일**: 2025-10-26
**목표**: 세계 최고 수준의 인터랙티브 학습 시스템 구현 (Quizlet, Anki, Kahoot 수준)

---

## 🎯 핵심 목표

### 연구 기반 설계
**참고 시스템**:
- **Quizlet**: 다양한 학습 모드 (Learn, Match, Test), AI 기반 퀴즈 생성
- **Anki**: 강력한 Spaced Repetition 알고리즘 (SM-2, FSRS), 장기 기억 최적화
- **Kahoot**: 실시간 게임쇼 형식 퀴즈, 높은 참여도
- **Quizizz**: 자기주도 학습 + 평가, 게이미피케이션
- **Brainscape**: 신뢰도 기반 반복 스케줄링

**검증된 효과**:
- Spaced Repetition: 다른 학습 기법 대비 월등한 성과
- 게이미피케이션: 참여도 및 동기 부여 대폭 향상
- AI 퀴즈 생성: 교사/학생 시간 절약, 개인화 평가
- 적응형 테스트: 실시간 난이도 조정으로 최적 학습

---

## 📦 구현 기능

### 1. AI 퀴즈 생성 시스템

**기능**:
- 학습 내용 기반 자동 퀴즈 생성
- 난이도 조정 (Phase 8 통합)
- 다양한 문제 유형 (객관식, 단답형, 참/거짓)
- 즉각적인 피드백

**AI 생성 로직**:
```typescript
interface QuizGenerationRequest {
  subject: 'math' | 'english';
  gradeLevel: GradeLevel;
  difficulty: DifficultyLevel;
  knowledgeNodeId?: string;     // 특정 개념 집중
  questionCount: number;        // 기본 5개
  questionTypes: QuestionType[]; // 문제 유형
}

interface Quiz {
  id: string;
  title: string;
  subject: Subject;
  difficulty: DifficultyLevel;
  questions: QuizQuestion[];
  timeLimit?: number;           // 초 단위
  passingScore: number;         // 70%
  createdAt: Date;
}

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  question: string;
  options?: string[];           // 객관식 선택지
  correctAnswer: string;
  explanation: string;          // 정답 해설
  points: number;               // 배점
  knowledgeNodeId?: string;
}
```

**생성 전략**:
```typescript
// Bloom's Taxonomy 기반 난이도 조정
const BLOOM_LEVELS = {
  1: 'Remember',    // 기억: "정의하시오", "나열하시오"
  2: 'Understand',  // 이해: "설명하시오", "요약하시오"
  3: 'Apply',       // 적용: "계산하시오", "사용하시오"
  4: 'Analyze',     // 분석: "비교하시오", "분류하시오"
  5: 'Evaluate',    // 평가: "판단하시오", "비판하시오"
};

// 난이도별 Bloom 레벨 매핑
const DIFFICULTY_BLOOM_MAP = {
  1: [1, 2],        // 기초: 기억, 이해
  2: [2, 3],        // 초급: 이해, 적용
  3: [3, 4],        // 중급: 적용, 분석
  4: [4, 5],        // 고급: 분석, 평가
  5: [5],           // 전문가: 평가
};
```

**XP 보상** (Phase 7 통합):
```typescript
const QUIZ_XP_REWARDS = {
  completion: 50,               // 퀴즈 완료
  perfectScore: 100,            // 만점
  firstTry: 30,                 // 첫 시도 성공
  speedBonus: 20,              // 빠른 완료 (시간 내)
};

// 난이도 배수 적용
const totalXP = baseXP * XP_MULTIPLIERS[difficulty];
```

### 2. Flashcard 복습 시스템

**Spaced Repetition 알고리즘** (SM-2 기반):
```typescript
interface Flashcard {
  id: string;
  front: string;                // 질문/용어
  back: string;                 // 답변/정의
  knowledgeNodeId: string;
  difficulty: DifficultyLevel;

  // SM-2 알고리즘 파라미터
  easeFactor: number;           // 기본 2.5
  interval: number;             // 다음 복습까지 일수
  repetitions: number;          // 연속 성공 횟수
  lastReviewed: Date;
  nextReview: Date;

  // 사용자 성과
  reviewHistory: ReviewRecord[];
  masteryScore: number;         // 0-1
}

interface ReviewRecord {
  reviewedAt: Date;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=완전 잊음, 5=완벽
  responseTime: number;         // 초
}
```

**SM-2 알고리즘 구현**:
```typescript
function calculateNextReview(
  card: Flashcard,
  quality: number // 0-5
): { easeFactor: number; interval: number; repetitions: number } {
  let { easeFactor, interval, repetitions } = card;

  // 1. Ease Factor 업데이트
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor); // 최소값 1.3

  // 2. Repetitions & Interval 업데이트
  if (quality < 3) {
    // 실패: 리셋
    repetitions = 0;
    interval = 1;
  } else {
    // 성공: 증가
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  return { easeFactor, interval, repetitions };
}
```

**복습 스케줄**:
```
첫 복습: 1일 후
두 번째: 6일 후
세 번째: 간격 * easeFactor (예: 16일 후)
네 번째: 간격 * easeFactor (예: 40일 후)
...

easeFactor는 성과에 따라 동적 조정 (1.3 ~ 2.5+)
```

**AI 자동 생성**:
```typescript
// 학습 내용에서 자동으로 플래시카드 생성
async function generateFlashcards(
  sessionHistory: Message[],
  count: number = 5
): Promise<Flashcard[]> {
  // Claude API로 핵심 개념 추출 및 카드 생성
  const prompt = `
다음 대화에서 학생이 배운 핵심 개념을 추출하여
플래시카드 ${count}개를 생성해주세요.

형식:
- Front: 간결한 질문 또는 용어
- Back: 명확한 답변 또는 정의
- 학습 효과를 위해 능동적 회상을 유도하는 형태로

대화 내역:
${sessionHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
`;

  // AI 응답 파싱 및 플래시카드 생성
}
```

### 3. 학습 도전 과제 시스템

**도전 과제 유형**:
```typescript
interface Challenge {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  difficulty: DifficultyLevel;

  // 목표
  goal: {
    type: 'quiz_score' | 'flashcard_review' | 'streak_maintain' | 'xp_earn';
    target: number;
    current: number;
  };

  // 보상
  rewards: {
    xp: number;
    badge?: string;
    unlock?: string;            // 잠금 해제 콘텐츠
  };

  // 기간
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'expired';
}
```

**도전 과제 예시**:
```typescript
const CHALLENGES = [
  // 일일 도전
  {
    type: 'daily',
    title: '퀴즈 마스터',
    description: '오늘 퀴즈 3개를 80% 이상으로 완료하세요',
    goal: { type: 'quiz_score', target: 3 },
    rewards: { xp: 100, badge: 'daily_quizzer' },
  },
  {
    type: 'daily',
    title: '복습왕',
    description: '오늘 플래시카드 20개를 복습하세요',
    goal: { type: 'flashcard_review', target: 20 },
    rewards: { xp: 80 },
  },

  // 주간 도전
  {
    type: 'weekly',
    title: '7일 연속 학습',
    description: '이번 주 매일 학습하세요',
    goal: { type: 'streak_maintain', target: 7 },
    rewards: { xp: 300, badge: 'weekly_warrior' },
  },

  // 특별 도전
  {
    type: 'special',
    title: '약점 정복자',
    description: '약점 영역 퀴즈 5개를 완벽히 완료하세요',
    goal: { type: 'quiz_score', target: 5 },
    rewards: { xp: 500, badge: 'weakness_conqueror' },
  },
];
```

### 4. 학습 노트 시스템

**기능**:
- AI 자동 요약
- 핵심 개념 하이라이트
- 플래시카드/퀴즈로 변환
- 마크다운 지원

```typescript
interface LearningNote {
  id: string;
  title: string;
  subject: Subject;
  knowledgeNodeId?: string;

  // 내용
  content: string;              // 마크다운
  summary?: string;             // AI 생성 요약
  keyPoints: string[];          // 핵심 개념

  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
  sessionId?: string;           // 연결된 학습 세션

  // 변환
  flashcards: string[];         // 생성된 플래시카드 ID
  quizzes: string[];            // 생성된 퀴즈 ID
}
```

**AI 요약 기능**:
```typescript
async function generateNoteSummary(note: LearningNote): Promise<string> {
  const prompt = `
다음 학습 노트를 3-5개의 핵심 포인트로 요약해주세요.

노트 내용:
${note.content}

형식:
- 핵심 포인트 1
- 핵심 포인트 2
...
`;

  return await callClaudeAPI(prompt);
}
```

---

## 🏗️ 기술 아키텍처

### 데이터 모델
```typescript
// lib/interactive-learning/types.ts
interface InteractiveLearningStore {
  // Quiz
  quizzes: Quiz[];
  quizResults: QuizResult[];

  // Flashcard
  flashcards: Flashcard[];
  reviewSchedule: ReviewSchedule;

  // Challenges
  challenges: Challenge[];

  // Notes
  notes: LearningNote[];
}
```

### Zustand Store
```typescript
// lib/interactive-learning/store.ts
interface InteractiveLearningActions {
  // Quiz
  generateQuiz(request: QuizGenerationRequest): Promise<Quiz>;
  submitQuiz(quizId: string, answers: QuizAnswer[]): QuizResult;

  // Flashcard
  generateFlashcards(content: string): Promise<Flashcard[]>;
  reviewFlashcard(cardId: string, quality: number): void;
  getReviewDue(): Flashcard[];

  // Challenges
  updateChallengeProgress(challengeId: string, progress: number): void;
  claimChallengeReward(challengeId: string): void;

  // Notes
  createNote(note: Partial<LearningNote>): LearningNote;
  generateSummary(noteId: string): Promise<string>;
  convertToFlashcards(noteId: string): Promise<Flashcard[]>;
}
```

### 파일 구조
```
lib/interactive-learning/
├── types.ts                   # 타입 정의
├── store.ts                   # Zustand store
├── quiz-generator.ts          # AI 퀴즈 생성
├── flashcard-scheduler.ts     # SM-2 알고리즘
├── challenge-manager.ts       # 도전 과제 관리
└── note-summarizer.ts         # AI 노트 요약

components/interactive-learning/
├── QuizView.tsx               # 퀴즈 UI
├── FlashcardReview.tsx        # 플래시카드 복습
├── ChallengePanel.tsx         # 도전 과제 패널
├── NotesEditor.tsx            # 노트 에디터
└── ProgressTracker.tsx        # 진행 상황 추적

app/
├── quiz/
│   ├── page.tsx               # 퀴즈 목록
│   └── [id]/page.tsx          # 퀴즈 상세
├── flashcards/
│   └── page.tsx               # 플래시카드 복습
├── challenges/
│   └── page.tsx               # 도전 과제
└── notes/
    └── page.tsx               # 학습 노트
```

---

## 🎮 사용자 경험 흐름

### 퀴즈
1. **대시보드** → "퀴즈 생성" 버튼
2. **설정 선택** → 과목, 난이도, 문제 수
3. **AI 생성** → 3초 내 퀴즈 완성
4. **퀴즈 풀기** → 실시간 피드백
5. **결과 확인** → 정답률, XP 획득, 약점 분석

### 플래시카드
1. **학습 세션 후** → "플래시카드 생성" 제안
2. **AI 자동 생성** → 핵심 개념 5개 카드
3. **복습 시작** → 카드 넘기며 회상
4. **자가 평가** → 5단계 품질 (0-5)
5. **다음 복습** → SM-2 알고리즘 스케줄링

### 도전 과제
1. **일일 도전 알림** → "오늘의 도전 과제 확인"
2. **진행 상황** → 실시간 프로그레스 바
3. **완료** → 보상 획득 애니메이션
4. **배지 획득** → Phase 7 통합

---

## 🔮 Phase 7+8 통합

### Phase 7 (게이미피케이션)
- **XP 획득**: 퀴즈 완료, 플래시카드 복습, 도전 과제
- **배지**: 퀴즈 마스터, 복습왕, 도전 완주자
- **레벨업**: 인터랙티브 활동으로 XP 가속

### Phase 8 (적응형 학습)
- **난이도 조정**: 퀴즈 난이도 자동 조정
- **약점 집중**: 약점 영역 퀴즈/플래시카드 생성
- **학습 경로**: 퀴즈 결과로 경로 업데이트

---

## 📅 구현 단계

### Step 1: AI 퀴즈 생성 (60분)
- 타입 정의
- Claude API 통합
- 퀴즈 생성 로직
- 결과 저장

### Step 2: 플래시카드 시스템 (90분)
- SM-2 알고리즘 구현
- 복습 스케줄링
- AI 카드 생성
- 복습 UI

### Step 3: 도전 과제 (45분)
- 도전 과제 정의
- 진행 상황 추적
- 보상 시스템
- 알림

### Step 4: 학습 노트 (45분)
- 노트 에디터
- AI 요약
- 플래시카드/퀴즈 변환

### Step 5: UI 컴포넌트 (75분)
- QuizView
- FlashcardReview
- ChallengePanel
- NotesEditor

### Step 6: 통합 & 테스트 (45분)
- Phase 7+8 통합
- 빌드 & 배포

**총 예상 시간**: 6시간

---

**준비 완료! 구현을 시작하겠습니다.** 🚀
