# 🎓 튜터 시스템 고도화 및 국어 튜터 신규 개발 계획 (2025)

## 📋 목차

1. [전 세계 에듀테크 벤치마킹 분석](#1-전-세계-에듀테크-벤치마킹-분석)
2. [학교급/학년별 학습 범위 기준 수립](#2-학교급학년별-학습-범위-기준-수립)
3. [기존 튜터 고도화 계획](#3-기존-튜터-고도화-계획)
4. [국어 튜터 신규 개발 계획](#4-국어-튜터-신규-개발-계획)
5. [학년 범위 외 질문 안내 시스템](#5-학년-범위-외-질문-안내-시스템)
6. [추천 기능 및 개발 우선순위](#6-추천-기능-및-개발-우선순위)
7. [구현 로드맵](#7-구현-로드맵)

---

## 1. 전 세계 에듀테크 벤치마킹 분석

### 1.1 주요 글로벌 에듀테크 서비스 분석

#### 🏆 Khan Academy - Khanmigo (가장 높은 벤치마킹 가치)

**핵심 특징:**
- **가격**: $4/month (개인), 교사 무료
- **사용자**: 미국 266개 학군, 3-12학년
- **AI 모델**: GPT-4 기반
- **핵심 기능**:
  - ✅ 소크라테스식 교수법: 답을 주지 않고 스스로 찾도록 유도
  - ✅ 개인화 학습 경로: 학습 이력 기반 맞춤형 경로 생성
  - ✅ 실시간 피드백 및 힌트 시스템
  - ✅ 표준 기반 레슨 플래닝 (Common Core 연계)
  - ✅ 교사용 대시보드: 학생 진도 실시간 모니터링

**우리 서비스에 적용할 점**:
1. **소크라테스식 대화**: 바로 답을 주지 않고 질문으로 사고 유도
2. **학습 이력 기반 개인화**: 누적 데이터로 학습 경로 추천
3. **교육과정 표준 연계**: 한국 교육과정과 명확히 연계

---

#### 🌍 Duolingo Max

**핵심 특징:**
- **가격**: $29.99/month
- **AI 모델**: GPT-4 기반
- **핵심 기능**:
  - ✅ Roleplay: 실제 대화 상황 시뮬레이션 (택시 타기, 주문하기 등)
  - ✅ Explain My Answer: 맞춤형 상세 설명 제공 (채택률 65%, 완료율 15% 상승)
  - ✅ AI Video Call (Lily): 실시간 AI 캐릭터와 영상 통화
  - ✅ Adventures: 게임형 실전 시나리오 학습
  - ✅ 게이미피케이션: XP, 연속 학습일(Streak), 배지, 리그 시스템

**우리 서비스에 적용할 점**:
1. **실전 시나리오 학습**: 영어 튜터에서 실생활 대화 연습
2. **상세 설명 기능 강화**: "왜 틀렸는지" 명확히 설명
3. **게이미피케이션 확대**: 현재 XP 시스템에 리그/경쟁 요소 추가

---

#### 📊 수학 전문 AI 튜터 (Photomath, Microsoft Math Solver)

**Photomath (Best Overall)**:
- **가격**: $6.99/month
- **핵심 기능**:
  - ✅ 단계별 풀이 과정 (Step-by-step solutions)
  - ✅ 이미지 인식 정확도 99%+
  - ✅ 다양한 풀이 방법 제시
  - ✅ 개념 설명 동영상 연계

**Microsoft Math Solver (무료)**:
- ✅ 무료 + 광고 없음
- ✅ 그래프 자동 생성
- ✅ 단계별 설명

**우리 서비스에 적용할 점**:
1. **다양한 풀이 방법**: 한 문제에 대해 여러 접근법 제시
2. **그래프 자동 생성**: 함수/방정식 시각화 강화
3. **개념-문제 연계**: 틀린 문제와 관련된 개념 설명 자동 제공

---

#### 🎮 AI 튜터 게이미피케이션 트렌드 (2025)

**핵심 요소**:
1. **배지 및 업적 시스템**:
   - 마일스톤 달성 시 배지 수여 (Khan Academy)
   - 주제별, 난이도별 업적 분류

2. **실시간 진도 추적**:
   - 시각적 진도 링 (Alpha School 스타일)
   - 세션별 90% 이상 정확도 시 링 완성

3. **연속 학습 보상**:
   - Duolingo의 Streak 시스템
   - 일일 목표 달성률 시각화

4. **AI 기반 적응형 난이도**:
   - 지루함/좌절 방지를 위한 자동 난이도 조절
   - 학생 수준에 맞는 적절한 도전 과제 제공

**우리 서비스 현황**:
- ✅ **이미 구현됨**: XP 시스템, 레벨 시스템, 일일 목표, 연속 학습일, 배지
- ⚠️ **개선 필요**:
  - 진도 시각화 (링 시스템)
  - 주제별 업적 체계
  - 경쟁 요소 (리더보드)

---

### 1.2 적응형 학습 (Adaptive Learning) 2025 트렌드

**핵심 기술**:
1. **협업 필터링 (Collaborative Filtering)**: 유사한 학생 패턴 기반 추천
2. **콘텐츠 기반 필터링 (Content-Based Filtering)**: 학습 내용 특성 기반 추천
3. **하이브리드 모델**: 두 방식 결합
4. **실시간 난이도 조절**: 강화학습 기반 실시간 조정

**우리 서비스 적용**:
- 현재: 기본적인 학년별 콘텐츠 필터링
- 목표: 개인별 학습 이력 기반 적응형 난이도 시스템

---

## 2. 학교급/학년별 학습 범위 기준 수립

### 2.1 한국 교육과정 기반 학습 범위

#### 📚 국어 (신규)

| 학교급 | 학년 | 핵심 학습 내용 | 세부 토픽 |
|--------|------|----------------|-----------|
| **초등학교** | 1-2 | 한글 읽기/쓰기, 기초 문법 | 받침, 모음, 자음, 띄어쓰기, 문장 부호 |
| | 3-4 | 독해력, 글쓰기, 기본 문법 | 주어/서술어, 문장 종류, 문단 구성, 일기/편지 쓰기 |
| | 5-6 | 문학 이해, 논설문, 고급 문법 | 비유, 상징, 논증 구조, 토론, 발표 |
| **중학교** | 1-3 | 문학 작품 분석, 작문, 문법 심화 | 시/소설 분석, 논설문 작성, 품사, 문장 성분, 고전 문학 입문 |
| **고등학교** | 1-3 | 고전/현대 문학, 비평, 수능 대비 | 고전 소설/시가, 현대 문학 작품, 비평 이론, 화법과 작문, 독서 |
| **대학교** | 1+ | 학술적 글쓰기, 전문 분야 독해 | 학술 논문 작성, 전공 텍스트 분석, 비평 에세이 |

**국어 핵심 기능 요구사항**:
1. **읽기**: 문단 분석, 주제 파악, 맥락 이해
2. **쓰기**: 맞춤법/띄어쓰기 교정, 문장 구조 개선, 논리적 글쓰기
3. **문법**: 품사, 문장 성분, 어법, 표준어/비표준어
4. **문학**: 시/소설 분석, 작가/작품 배경, 문학사

---

#### 🔢 수학 (기존 - Common Core 기반)

| 학교급 | 학년 | 핵심 학습 내용 | 현재 RAG 콘텐츠 |
|--------|------|----------------|-----------------|
| **초등학교** | 1-2 | 덧셈/뺄셈, 기초 도형 | ✅ Addition, Subtraction (영문) |
| | 3-5 | 곱셈/나눗셈, 분수, 소수 | ✅ Multiplication, Division, Fractions (영문) |
| **중학교** | 6-8 | 비율/비례, 대수, 기하 | ✅ Ratios, Algebra basics, Geometry (영문) |
| **고등학교** | 9-12 | 대수학, 기하학, 삼각법, 미적분 입문 | ⚠️ 부분적 (영문) |
| **대학교** | 1+ | 미적분학, 선형대수, 통계학 | ❌ 미구현 |

**수학 개선 필요사항**:
1. **RAG 콘텐츠 한국어 번역**: 현재 전체 영문 → 한국어로 전환
2. **고등학교/대학교 콘텐츠 확충**: 현재 초중등 중심 → 고급 수학 추가
3. **시각화 강화**: 그래프, 도형 자동 생성 기능

---

#### 🌐 영어 (기존 - CEFR 기반)

| 학교급 | 학년 | CEFR 레벨 | 핵심 학습 내용 | 현재 RAG 콘텐츠 |
|--------|------|-----------|----------------|-----------------|
| **초등학교** | 3-6 | A1-A2 | 기초 회화, 알파벳, 파닉스 | ✅ Present tense, 기본 문법 |
| **중학교** | 1-3 | A2-B1 | 문법 체계, 독해, 작문 입문 | ✅ Present Perfect, 중급 문법 |
| **고등학교** | 1-3 | B1-B2 | 고급 문법, 에세이, 수능 대비 | ✅ Passive Voice, 고급 문법 |
| **대학교** | 1+ | B2-C1 | 학술 영어, 전문 분야 영어 | ⚠️ 부분적 |

**영어 개선 필요사항**:
1. **실전 회화 시나리오**: Duolingo Roleplay 스타일 추가
2. **발음 교정 강화**: 음성 인식 기반 실시간 피드백
3. **에세이 첨삭**: AI 기반 작문 평가 및 개선 제안

---

### 2.2 학년별 콘텐츠 필터링 기준

#### 현재 시스템:
```typescript
// app/api/chat/math/route.ts
const gradeLevelPrompts = {
  elementary: "초등학생 수준에 맞게 쉽고 친근한 언어로",
  middle: "중학생 수준에 맞게 개념을 명확하게",
  high: "고등학생 수준에 맞게 심화된 내용을",
  university: "대학교 수준에 맞게 전문적이고 엄밀한 내용을"
};
```

#### 개선 계획:

**1단계: 명확한 토픽 매핑**
```typescript
// lib/tutor/curriculum-database.ts 확장
interface CurriculumStandard {
  subject: 'korean' | 'math' | 'english';
  schoolLevel: 'elementary' | 'middle' | 'high' | 'university';
  grade: string; // "1", "2", ..., "12"
  topics: {
    id: string;
    name: string;
    nameKo: string;
    difficulty: 1 | 2 | 3 | 4 | 5; // 1=매우 쉬움, 5=매우 어려움
    prerequisites: string[]; // 선수 학습 토픽 ID
    keywords: string[];
    description: string;
  }[];
}
```

**2단계: 질문 분류 및 난이도 판단**
```typescript
// lib/tutor/question-classifier.ts 개선
async function classifyQuestionWithDifficulty(
  question: string,
  subject: Subject,
  userGradeLevel: SchoolLevel
) {
  // 1. 질문의 토픽 파악
  const detectedTopics = await detectTopics(question, subject);

  // 2. 각 토픽의 교육과정상 학년 확인
  const topicGradeLevels = detectedTopics.map(topic =>
    getCurriculumGradeLevel(topic, subject)
  );

  // 3. 사용자 학년과 비교
  const isAppropriate = topicGradeLevels.every(level =>
    isWithinGradeRange(level, userGradeLevel)
  );

  return {
    isAppropriate,
    detectedTopics,
    suggestedGradeLevel: Math.max(...topicGradeLevels),
    reasoning: "이 질문은 X학년 Y 단원에서 다루는 내용입니다."
  };
}
```

---

## 3. 기존 튜터 고도화 계획

### 3.1 수학 튜터 고도화

#### Phase 1: RAG 시스템 한국어 전환 (우선순위: 🔴 긴급)

**현재 문제**:
- RAG 콘텐츠 전체가 영어로 저장 ([lib/tutor/rag-system.ts](../lib/tutor/rag-system.ts))
- 한국어 질문에 영어로 답변하는 버그 ([claudedocs/RAG_ENGLISH_RESPONSE_FIX.md](RAG_ENGLISH_RESPONSE_FIX.md))
- 임시 수정: RAG Direct 비활성화 (성능 저하)

**해결 방안**:
```typescript
// lib/tutor/rag-system.ts
export interface VerifiedContent {
  id: string;
  subject: Subject;
  topic: string;
  topicKo: string;
  gradeLevel: string;
  schoolLevel: SchoolLevel;

  // 기존 (영문)
  content: string;
  examples: string[];
  keyPoints: string[];

  // 신규 추가 (한국어)
  contentKo: string; // 한국어 설명
  examplesKo: string[]; // 한국어 예시
  keyPointsKo: string[]; // 한국어 핵심 포인트

  source: string;
  lastVerified: string;
}
```

**작업 목록**:
1. ✅ 기존 영문 RAG 콘텐츠 유지 (영어 튜터용)
2. ⬜ 수학 RAG 콘텐츠 한국어 번역 (초등 1-6학년 우선)
3. ⬜ 중고등 수학 콘텐츠 확충 및 한국어 작성
4. ⬜ RAG Direct 재활성화 (한국어 버전)

**예상 효과**:
- API 호출 50% 감소 (고신뢰도 질문은 RAG Direct 응답)
- 응답 속도 3-5배 향상
- 99% 정확도 유지

---

#### Phase 2: 다중 풀이 방법 제공

**벤치마크**: Photomath의 "Alternative Methods"

**구현**:
```typescript
// lib/tutor/solution-generator.ts
interface MathSolution {
  question: string;
  methods: {
    name: string; // "대입법", "인수분해", "공식 활용"
    nameEn: string;
    steps: {
      step: number;
      description: string;
      latex: string; // LaTeX 수식
      explanation: string;
    }[];
    difficulty: 'easy' | 'medium' | 'hard';
    recommended: boolean; // 학생 학년에 추천되는 방법
  }[];
}

async function generateMultipleSolutions(
  problem: string,
  gradeLevel: SchoolLevel
): Promise<MathSolution> {
  // Gemini에게 여러 풀이법 요청
  const prompt = `
다음 수학 문제를 최소 2가지 이상의 방법으로 풀어주세요.
각 방법마다 단계별 설명을 포함하고, ${gradeLevel} 학생에게 가장 적합한 방법을 추천해주세요.

문제: ${problem}
  `;

  // ... Gemini API 호출 및 파싱
}
```

**UI 개선**:
```tsx
// components/tutor-pages/MathSolutionDisplay.tsx
<div className="solution-methods">
  <h3>💡 여러 가지 풀이 방법</h3>
  {solution.methods.map((method, idx) => (
    <Accordion key={idx}>
      <AccordionTrigger>
        {method.recommended && <Badge>추천</Badge>}
        {method.name} ({method.difficulty})
      </AccordionTrigger>
      <AccordionContent>
        {method.steps.map(step => (
          <StepCard key={step.step}>
            <MathJax>{step.latex}</MathJax>
            <p>{step.explanation}</p>
          </StepCard>
        ))}
      </AccordionContent>
    </Accordion>
  ))}
</div>
```

---

#### Phase 3: 그래프 자동 생성

**벤치마크**: Microsoft Math Solver

**기술 스택**:
- **Desmos API** 또는 **Plotly.js** (무료)
- LaTeX → 그래프 자동 변환

**구현**:
```typescript
// lib/math/graph-generator.ts
import Plotly from 'plotly.js-dist';

async function generateGraph(equation: string): Promise<GraphData> {
  // 1. LaTeX 파싱
  const parsed = parseLatexEquation(equation);

  // 2. 함수 타입 감지 (1차, 2차, 삼각, 지수, 로그 등)
  const functionType = detectFunctionType(parsed);

  // 3. 정의역 자동 설정
  const domain = getOptimalDomain(functionType);

  // 4. Plotly 그래프 데이터 생성
  const graphData = {
    data: [{
      x: domain.x,
      y: domain.y,
      type: 'scatter',
      mode: 'lines',
      name: equation
    }],
    layout: {
      title: `그래프: ${equation}`,
      xaxis: { title: 'x' },
      yaxis: { title: 'y' }
    }
  };

  return graphData;
}
```

**UI 통합**:
```tsx
// components/math/GraphDisplay.tsx
"use client";
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export function GraphDisplay({ equation }: { equation: string }) {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    generateGraph(equation).then(setGraphData);
  }, [equation]);

  if (!graphData) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="graph-container">
      <Plot
        data={graphData.data}
        layout={graphData.layout}
        config={{ responsive: true }}
      />
    </div>
  );
}
```

---

### 3.2 영어 튜터 고도화

#### Phase 1: 실전 회화 시나리오 (Roleplay)

**벤치마크**: Duolingo Roleplay

**시나리오 예시**:
1. **공항에서**: 체크인, 탑승권 받기
2. **식당에서**: 주문하기, 계산하기
3. **쇼핑**: 가격 물어보기, 결제하기
4. **학교에서**: 자기소개, 수업 관련 대화
5. **병원에서**: 증상 설명하기

**구현**:
```typescript
// lib/tutor/roleplay-scenarios.ts
interface RoleplayScenario {
  id: string;
  title: string;
  titleKo: string;
  gradeLevel: SchoolLevel;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  situation: string; // "You are at a restaurant and want to order food"
  situationKo: string;
  aiRole: string; // "waiter", "teacher", "friend"
  turns: number; // 최소 대화 턴 수
  targetPhrases: string[]; // 학습 목표 표현
  successCriteria: {
    usedTargetPhrases: number; // 최소 사용해야 할 목표 표현 개수
    grammarAccuracy: number; // 최소 문법 정확도 (%)
    completedTurns: number; // 최소 대화 턴
  };
}

const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'restaurant-ordering',
    title: 'Ordering at a Restaurant',
    titleKo: '식당에서 주문하기',
    gradeLevel: 'elementary',
    cefrLevel: 'A2',
    situation: 'You are at a restaurant. The waiter will take your order.',
    situationKo: '식당에 있습니다. 웨이터가 주문을 받을 거예요.',
    aiRole: 'waiter',
    turns: 5,
    targetPhrases: [
      "I'd like to order...",
      "Can I have...?",
      "How much is...?",
      "The bill, please."
    ],
    successCriteria: {
      usedTargetPhrases: 2,
      grammarAccuracy: 70,
      completedTurns: 5
    }
  }
];
```

**UI**:
```tsx
// components/english/RoleplayMode.tsx
export function RoleplayMode({ scenario }: { scenario: RoleplayScenario }) {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [turn, setTurn] = useState(0);

  return (
    <div className="roleplay-container">
      <ScenarioHeader scenario={scenario} />

      <ConversationArea messages={conversation} />

      <TargetPhrasesPanel phrases={scenario.targetPhrases} />

      <VoiceInput onSubmit={handleUserInput} />

      <ProgressTracker
        current={turn}
        total={scenario.turns}
      />
    </div>
  );
}
```

---

#### Phase 2: 발음 교정 강화

**현재**: Web Speech API (브라우저 기본, 품질 낮음)

**개선 방안**:

**옵션 1: Google Cloud Speech-to-Text**
- 정확도: 95%+
- 실시간 스트리밍 지원
- 발음 평가 API 제공
- 비용: $0.006/15초 (매우 저렴)

**옵션 2: Azure Speech Service**
- Pronunciation Assessment API 내장
- CEFR 레벨별 평가
- 음소(phoneme) 단위 정확도 분석

**구현** (Google Cloud 우선):
```typescript
// lib/speech/pronunciation-evaluator.ts
import speech from '@google-cloud/speech';

interface PronunciationScore {
  word: string;
  accuracy: number; // 0-100
  phonemes: {
    phoneme: string;
    score: number;
    feedback: string;
  }[];
}

async function evaluatePronunciation(
  audioBuffer: Buffer,
  expectedText: string
): Promise<PronunciationScore[]> {
  const client = new speech.SpeechClient();

  const request = {
    audio: { content: audioBuffer.toString('base64') },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true
    }
  };

  const [response] = await client.recognize(request);

  // 인식된 텍스트와 예상 텍스트 비교
  const recognizedText = response.results[0].alternatives[0].transcript;

  // 단어별 정확도 계산
  const scores = compareAndScore(recognizedText, expectedText);

  return scores;
}
```

**비용 절감 전략**:
1. 연습 모드: Web Speech API (무료)
2. 평가 모드: Google Cloud (정확한 점수 필요 시만)
3. 캐싱: 동일 문장 재평가 방지

---

### 3.3 게이미피케이션 강화

#### 현재 구현 상태:
- ✅ XP 시스템 ([lib/gamification/xp-calculator.ts](../lib/gamification/xp-calculator.ts))
- ✅ 레벨 시스템
- ✅ 일일 목표 ([lib/gamification/daily-goals.ts](../lib/gamification/daily-goals.ts))
- ✅ 연속 학습일 ([lib/gamification/streak-system.ts](../lib/gamification/streak-system.ts))
- ✅ 배지 ([components/gamification/AchievementBadges.tsx](../components/gamification/AchievementBadges.tsx))

#### 개선 계획:

**1. 진도 링 시스템 (Alpha School 스타일)**
```tsx
// components/gamification/ProgressRing.tsx
export function ProgressRing({ subject, accuracy }: Props) {
  const ringColor = accuracy >= 90 ? 'green' : accuracy >= 70 ? 'yellow' : 'red';
  const circumference = 2 * Math.PI * 45; // radius=45
  const offset = circumference - (accuracy / 100) * circumference;

  return (
    <svg className="progress-ring" width="120" height="120">
      <circle
        cx="60"
        cy="60"
        r="45"
        stroke={ringColor}
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="65" textAnchor="middle" className="text-2xl font-bold">
        {accuracy}%
      </text>
    </svg>
  );
}
```

**2. 주제별 업적 체계**
```typescript
// lib/gamification/achievements.ts
interface Achievement {
  id: string;
  category: 'mastery' | 'streak' | 'social' | 'challenge';
  title: string;
  description: string;
  icon: string;
  requirements: {
    type: 'topic_mastery' | 'consecutive_days' | 'total_xp' | 'perfect_score';
    target: number;
    subject?: Subject;
    topic?: string;
  };
  reward: {
    xp: number;
    badge: string;
    title?: string; // "수학 마스터", "영어 달인"
  };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'math-addition-master',
    category: 'mastery',
    title: '덧셈 마스터',
    description: '덧셈 문제 50개를 90% 이상 정확도로 풀기',
    icon: '🧮',
    requirements: {
      type: 'topic_mastery',
      target: 50,
      subject: 'math',
      topic: 'addition'
    },
    reward: {
      xp: 500,
      badge: 'addition-master',
      title: '덧셈 마스터'
    }
  }
];
```

**3. 리더보드 (선택적 - 개인정보 고려)**
```typescript
// lib/gamification/leaderboard.ts
interface LeaderboardEntry {
  userId: string;
  displayName: string; // 닉네임 (본명 X)
  totalXP: number;
  level: number;
  rank: number;
  avatar: string;
}

// 주간/월간 리더보드
async function getWeeklyLeaderboard(subject: Subject): Promise<LeaderboardEntry[]> {
  // Redis Sorted Set 활용
  const key = `leaderboard:${subject}:${getWeekId()}`;
  const entries = await redis.zrevrange(key, 0, 99, 'WITHSCORES');

  return entries.map((entry, idx) => ({
    ...JSON.parse(entry.value),
    rank: idx + 1
  }));
}
```

---

## 4. 국어 튜터 신규 개발 계획

### 4.1 국어 튜터 핵심 기능 설계

#### 기능 1: 읽기 이해 (독해)

**세부 기능**:
1. **지문 분석**
   - 주제 파악
   - 중심 내용 요약
   - 문단 구조 분석

2. **어휘 학습**
   - 모르는 단어 하이라이트
   - 맥락 속 의미 설명
   - 유의어/반의어 제시

3. **독해 전략 코칭**
   - 예측하며 읽기
   - 중요한 부분 찾기
   - 글의 흐름 파악하기

**구현**:
```typescript
// lib/tutor/korean/reading-comprehension.ts
interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  gradeLevel: SchoolLevel;
  genre: 'narrative' | 'expository' | 'argumentative' | 'poetry';
  questions: {
    type: 'main_idea' | 'detail' | 'inference' | 'vocabulary';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }[];
  vocabularyHighlights: {
    word: string;
    meaning: string;
    synonyms: string[];
  }[];
}

async function analyzeReadingComprehension(
  passage: ReadingPassage,
  studentAnswer: string
): Promise<ReadingFeedback> {
  // Gemini에게 학생 답변 분석 요청
  const prompt = `
학생이 다음 지문을 읽고 질문에 답했습니다.

지문: ${passage.content}
질문: ${passage.questions[0].question}
학생 답변: ${studentAnswer}
정답: ${passage.questions[0].correctAnswer}

학생 답변을 평가하고, 틀렸다면 어떤 부분을 놓쳤는지 설명해주세요.
  `;

  // ... Gemini API 호출
}
```

---

#### 기능 2: 쓰기 (작문 및 첨삭)

**세부 기능**:
1. **맞춤법/띄어쓰기 교정**
   - 실시간 교정 제안
   - 규칙 설명

2. **문장 구조 개선**
   - 어색한 표현 감지
   - 더 자연스러운 표현 제안

3. **글 구조 평가**
   - 서론-본론-결론 구조
   - 논리적 흐름
   - 문단 구성

4. **작문 유형별 코칭**
   - 일기/편지 (초등)
   - 독후감/감상문 (초중등)
   - 논설문/비평문 (중고등)
   - 학술 에세이 (대학)

**구현**:
```typescript
// lib/tutor/korean/writing-assistant.ts
interface WritingFeedback {
  original: string;
  corrections: {
    type: 'spelling' | 'spacing' | 'grammar' | 'expression' | 'structure';
    position: { start: number; end: number };
    error: string;
    suggestion: string;
    explanation: string;
    severity: 'error' | 'warning' | 'info';
  }[];
  overallScore: {
    spelling: number; // 0-100
    grammar: number;
    structure: number;
    creativity: number;
  };
  suggestions: {
    strength: string[];
    improvement: string[];
  };
}

async function evaluateWriting(
  text: string,
  writingType: 'diary' | 'essay' | 'letter' | 'argumentative',
  gradeLevel: SchoolLevel
): Promise<WritingFeedback> {
  // 1. 맞춤법/띄어쓰기 검사 (한글 맞춤법 API 또는 Gemini)
  const spellingCheck = await checkSpelling(text);

  // 2. 문법 검사
  const grammarCheck = await checkGrammar(text, gradeLevel);

  // 3. 구조 평가
  const structureAnalysis = await analyzeStructure(text, writingType);

  // 4. 종합 피드백 생성
  return {
    original: text,
    corrections: [...spellingCheck, ...grammarCheck, ...structureAnalysis],
    overallScore: calculateScores(...),
    suggestions: generateSuggestions(...)
  };
}
```

**외부 API 활용 (선택)**:
- **부산대 맞춤법 검사기 API** (무료, 한국어 전문)
- **네이버 맞춤법 검사기** (크롤링 - 비공식)
- **Gemini 기반 자체 구현** (추천)

---

#### 기능 3: 문법

**세부 기능**:
1. **품사 학습**
   - 명사, 동사, 형용사, 부사 등
   - 품사 구분 연습

2. **문장 성분 분석**
   - 주어, 서술어, 목적어, 보어
   - 문장 성분 찾기 연습

3. **어법 규칙**
   - 높임법 (존댓말/반말)
   - 시제 (과거/현재/미래)
   - 피동/사동 표현
   - 관용 표현

**구현**:
```typescript
// lib/tutor/korean/grammar-analyzer.ts
interface SentenceAnalysis {
  sentence: string;
  components: {
    type: '주어' | '서술어' | '목적어' | '보어' | '관형어' | '부사어';
    text: string;
    position: { start: number; end: number };
  }[];
  words: {
    word: string;
    pos: '명사' | '동사' | '형용사' | '부사' | '조사' | '어미';
    explanation: string;
  }[];
}

async function analyzeSentence(sentence: string): Promise<SentenceAnalysis> {
  // Gemini에게 문장 분석 요청
  const prompt = `
다음 문장을 분석해주세요:
"${sentence}"

1. 문장 성분 (주어, 서술어, 목적어 등) 표시
2. 각 단어의 품사 분류
3. 초등학생도 이해할 수 있게 쉽게 설명
  `;

  // ... Gemini API 호출 및 파싱
}
```

---

#### 기능 4: 문학 작품 분석

**세부 기능**:
1. **시 분석**
   - 시적 화자, 분위기, 주제
   - 비유적 표현 (은유, 상징, 의인화)
   - 운율, 리듬

2. **소설 분석**
   - 인물, 사건, 배경
   - 갈등 구조
   - 주제 의식

3. **작가/작품 배경**
   - 작가 소개
   - 시대적 배경
   - 문학사적 의의

**구현**:
```typescript
// lib/tutor/korean/literature-analyzer.ts
interface LiteratureWork {
  id: string;
  type: 'poetry' | 'novel' | 'essay';
  title: string;
  author: string;
  period: string; // "고전", "근대", "현대"
  content: string;
  gradeLevel: SchoolLevel;
  themes: string[];
  literaryDevices: {
    type: '은유' | '상징' | '의인화' | '역설' | '반어';
    example: string;
    explanation: string;
  }[];
  questions: {
    question: string;
    answer: string;
    hint: string;
  }[];
}

const KOREAN_LITERATURE_DATABASE: LiteratureWork[] = [
  {
    id: 'kim-sowol-azalea',
    type: 'poetry',
    title: '진달래꽃',
    author: '김소월',
    period: '근대',
    content: `나 보기가 역겨워\n가실 때에는\n말없이 고이 보내 드리우리다\n...`,
    gradeLevel: 'middle',
    themes: ['이별', '한', '체념'],
    literaryDevices: [
      {
        type: '상징',
        example: '진달래꽃',
        explanation: '진달래꽃은 이별의 슬픔과 순수한 사랑을 상징합니다.'
      }
    ],
    questions: [...]
  }
];
```

---

### 4.2 국어 튜터 RAG 시스템 설계

```typescript
// lib/tutor/rag-system.ts에 추가
export const KOREAN_VERIFIED_CONTENT: VerifiedContent[] = [
  // 초등 1-2학년: 한글
  {
    id: 'kor-elem-hangul-vowels',
    subject: 'korean',
    topic: 'Hangul Vowels',
    topicKo: '한글 모음',
    gradeLevel: '1',
    schoolLevel: 'elementary',
    contentKo: `한글 모음은 소리를 만드는 글자입니다.

기본 모음 (10개):
ㅏ (아), ㅑ (야), ㅓ (어), ㅕ (여), ㅗ (오)
ㅛ (요), ㅜ (우), ㅠ (유), ㅡ (으), ㅣ (이)

복합 모음 (11개):
ㅐ (애), ㅒ (얘), ㅔ (에), ㅖ (예)
ㅘ (와), ㅙ (왜), ㅚ (외), ㅝ (워), ㅞ (웨), ㅟ (위), ㅢ (의)

모음 쓰기 순서:
1. 세로 모음 (ㅏ, ㅓ 등): 자음 오른쪽에 씁니다 (예: 가, 거)
2. 가로 모음 (ㅗ, ㅜ 등): 자음 아래에 씁니다 (예: 고, 구)`,
    examplesKo: [
      "가방 (가 + 방) - 세로 모음 ㅏ",
      "고양이 (고 + 양 + 이) - 가로 모음 ㅗ",
      "의자 (의 + 자) - 복합 모음 ㅢ"
    ],
    keyPointsKo: [
      "기본 모음 10개를 먼저 외우세요",
      "세로 모음과 가로 모음의 위치를 기억하세요",
      "복합 모음은 기본 모음을 합친 것입니다"
    ],
    source: "2015 개정 교육과정 - 국어 1학년",
    lastVerified: "2025-01-08"
  },

  // 초등 3-4학년: 문장 성분
  {
    id: 'kor-elem-sentence-components',
    subject: 'korean',
    topic: 'Sentence Components',
    topicKo: '문장 성분',
    gradeLevel: '3',
    schoolLevel: 'elementary',
    contentKo: `문장은 여러 성분으로 이루어져 있습니다.

주요 성분:
1. 주어: 동작이나 상태의 주체 ("누가", "무엇이")
   예: 철수가 학교에 간다. (주어: 철수가)

2. 서술어: 주어의 동작이나 상태 ("어떻게 하다", "어떠하다")
   예: 철수가 학교에 간다. (서술어: 간다)

3. 목적어: 동작의 대상 ("무엇을", "누구를")
   예: 나는 책을 읽는다. (목적어: 책을)

4. 보어: 주어나 목적어를 보충 설명 ("무엇이 되다", "무엇이다")
   예: 철수는 학생이다. (보어: 학생이)

부속 성분:
1. 관형어: 명사를 꾸며줌 ("어떤", "무슨")
   예: 예쁜 꽃이 핀다. (관형어: 예쁜)

2. 부사어: 동작이나 상태를 꾸며줌 ("어떻게", "얼마나")
   예: 철수가 빨리 달린다. (부사어: 빨리)`,
    examplesKo: [
      "주어 + 서술어: 새가 / 운다",
      "주어 + 목적어 + 서술어: 고양이가 / 쥐를 / 잡는다",
      "주어 + 보어 + 서술어: 장미는 / 꽃이 / 이다",
      "관형어 + 주어 + 서술어: 빨간 / 사과가 / 떨어진다"
    ],
    keyPointsKo: [
      "주어와 서술어는 문장의 필수 성분입니다",
      "목적어는 '~을/를'로 끝납니다",
      "보어는 '~이/가'로 끝납니다"
    ],
    source: "2015 개정 교육과정 - 국어 3학년",
    lastVerified: "2025-01-08"
  },

  // 중학교: 품사
  {
    id: 'kor-mid-parts-of-speech',
    subject: 'korean',
    topic: 'Parts of Speech',
    topicKo: '품사',
    gradeLevel: '7',
    schoolLevel: 'middle',
    contentKo: `품사는 단어를 기능과 의미에 따라 분류한 것입니다.

9품사:

1. 명사: 사람, 사물, 장소의 이름
   예: 학생, 책상, 서울

2. 대명사: 명사를 대신하는 말
   예: 나, 너, 그, 이것, 저것

3. 동사: 동작이나 작용을 나타냄
   예: 먹다, 가다, 공부하다

4. 형용사: 성질이나 상태를 나타냄
   예: 예쁘다, 크다, 좋다

5. 관형사: 명사를 꾸며줌 (조사 없이)
   예: 새, 헌, 모든, 어떤

6. 부사: 동작이나 상태를 꾸며줌
   예: 매우, 빨리, 잘

7. 조사: 명사 뒤에 붙어 문법적 관계 표시
   예: 이/가, 을/를, 은/는, 에, 에서

8. 감탄사: 감정이나 의지 표현
   예: 아, 오, 아이고, 와

9. 어미: 용언(동사/형용사) 어간 뒤에 붙음
   예: -다, -니, -고, -면

품사 구분 방법:
- 불변어 (형태 안 바뀜): 명사, 대명사, 관형사, 부사, 감탄사, 조사
- 가변어 (형태 바뀜): 동사, 형용사 (어미에 따라 변함)`,
    examplesKo: [
      "명사: 학교에서 책을 읽는다.",
      "동사: 학교에서 책을 읽는다.",
      "부사: 매우 빨리 달린다.",
      "조사: 철수가 학교에 간다.",
      "어미: 먹다 → 먹고, 먹으니, 먹으면"
    ],
    keyPointsKo: [
      "불변어는 형태가 바뀌지 않습니다",
      "가변어(용언)는 어미에 따라 형태가 바뀝니다",
      "조사는 명사 뒤에만 붙습니다"
    ],
    source: "2015 개정 교육과정 - 국어 1(중학교)",
    lastVerified: "2025-01-08"
  }
];
```

---

### 4.3 국어 튜터 API 라우트 개발

```typescript
// app/api/chat/korean/route.ts (신규 파일)
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { retrieveVerifiedContent, formatRetrievedContext } from "@/lib/tutor/rag-system";
import { responseCache } from "@/lib/cache/response-cache";
import { vertexAIClient } from "@/lib/ai/vertex-client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const isVertexAIEnabled = process.env.ENABLE_VERTEX_AI === 'true';

const gradeLevelPrompts: Record<string, string> = {
  elementary: "초등학생 수준에 맞게 쉬운 단어와 짧은 문장으로",
  middle: "중학생 수준에 맞게 문법 용어를 포함하여 명확하게",
  high: "고등학생 수준에 맞게 문학 이론과 함께 심화된 내용을",
  university: "대학생 수준에 맞게 학술적이고 전문적인 내용을",
};

const gradeLevelMap: Record<string, string> = {
  "초등학교": "elementary",
  "중학교": "middle",
  "고등학교": "high",
  "대학교": "university",
};

export async function POST(req: NextRequest) {
  try {
    const { message, gradeLevel, conversationHistory, userId = 'default' } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const gradeStr = gradeLevelMap[gradeLevel] || "elementary";

    // ✅ Phase 1: 캐시 확인
    const cachedResponse = responseCache.get(message, 'korean', gradeStr);
    if (cachedResponse) {
      console.log('[Korean Cache HIT]');
      return new Response(cachedResponse);
    }

    // ✅ Phase 2: RAG 검색
    let ragContext: string | undefined = undefined;
    let ragDirectAnswer: string | undefined = undefined;

    try {
      const retrievedContext = await retrieveVerifiedContent(
        message,
        'korean',
        gradeStr,
        3
      );

      if (retrievedContext.content.length > 0) {
        ragContext = formatRetrievedContext(retrievedContext);

        const avgConfidence = retrievedContext.content.reduce(
          (sum, c) => sum + (c.confidence ?? 1.0),
          0
        ) / retrievedContext.content.length;

        // 고신뢰도 질문은 RAG Direct 응답
        if (avgConfidence > 0.9 && retrievedContext.content.length >= 2) {
          ragDirectAnswer = `📚 **검증된 국어 교육 자료를 바탕으로 답변드려요:**

${retrievedContext.content.map(c => c.contentKo || c.content).join('\n\n---\n\n')}

💡 더 궁금한 점이 있으시면 언제든 질문해주세요!`;

          console.log(`[Korean RAG Direct] High confidence (${avgConfidence.toFixed(2)})`);
          responseCache.set(message, 'korean', gradeStr, ragDirectAnswer);
          return new Response(ragDirectAnswer);
        }
      }
    } catch (error) {
      console.error('[Korean RAG Error]', error);
    }

    // ✅ Phase 3: Gemini AI 호출
    const systemPrompt = `당신은 학생들의 국어 학습을 돕는 친절한 국어 튜터입니다.

**역할**:
- ${gradeLevelPrompts[gradeStr]} 설명합니다
- 맞춤법, 띄어쓰기, 문법을 정확하게 가르칩니다
- 문학 작품은 작품의 배경과 함께 설명합니다
- 학생이 이해할 때까지 친절하게 반복 설명합니다

**지침**:
1. 모든 설명은 한국어로만 합니다
2. 어려운 용어는 쉽게 풀어서 설명합니다
3. 예시를 많이 들어 설명합니다
4. 학생의 질문 의도를 정확히 파악합니다
5. 격려와 칭찬을 자주 합니다

**금지 사항**:
- 거짓 정보 제공 금지
- 비표준어/은어 사용 금지
- 학습과 무관한 대화 금지

${ragContext ? `\n**검증된 교육 자료**:\n${ragContext}\n` : ''}`;

    const formattedHistory = conversationHistory?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || [];

    let responseText = '';

    if (isVertexAIEnabled) {
      responseText = await vertexAIClient.generateContent({
        systemInstruction: systemPrompt,
        messages: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ]
      });
    } else {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction: systemPrompt
      });

      const chat = model.startChat({
        history: formattedHistory
      });

      const result = await chat.sendMessage(message);
      responseText = result.response.text();
    }

    // 캐싱
    responseCache.set(message, 'korean', gradeStr, responseText);

    console.log('[Korean Tutor] Response generated');
    return new Response(responseText);

  } catch (error) {
    console.error('[Korean API Error]', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

---

### 4.4 국어 튜터 UI/UX 설계

#### 메인 인터페이스

```tsx
// components/tutor-pages/KoreanTutorClient.tsx (신규 파일)
"use client";

import { useState } from 'react';
import { SimpleChatInterface } from './SimpleChatInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

type KoreanMode = 'chat' | 'reading' | 'writing' | 'grammar' | 'literature';

export function KoreanTutorClient({ gradeLevel }: { gradeLevel: string }) {
  const [mode, setMode] = useState<KoreanMode>('chat');

  return (
    <div className="korean-tutor-container">
      <header className="tutor-header">
        <h1>📚 국어 튜터</h1>
        <p className="text-sm text-muted-foreground">
          읽기, 쓰기, 문법, 문학을 함께 공부해요
        </p>
      </header>

      <Tabs value={mode} onValueChange={(v) => setMode(v as KoreanMode)}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="chat">💬 대화</TabsTrigger>
          <TabsTrigger value="reading">📖 읽기</TabsTrigger>
          <TabsTrigger value="writing">✍️ 쓰기</TabsTrigger>
          <TabsTrigger value="grammar">📝 문법</TabsTrigger>
          <TabsTrigger value="literature">🎭 문학</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <SimpleChatInterface
            subject="korean"
            gradeLevel={gradeLevel}
            apiEndpoint="/api/chat/korean"
            placeholder="국어 관련 질문을 입력하세요..."
          />
        </TabsContent>

        <TabsContent value="reading">
          <ReadingComprehensionMode gradeLevel={gradeLevel} />
        </TabsContent>

        <TabsContent value="writing">
          <WritingAssistantMode gradeLevel={gradeLevel} />
        </TabsContent>

        <TabsContent value="grammar">
          <GrammarLearningMode gradeLevel={gradeLevel} />
        </TabsContent>

        <TabsContent value="literature">
          <LiteratureAnalysisMode gradeLevel={gradeLevel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

#### 쓰기 모드 UI

```tsx
// components/korean/WritingAssistantMode.tsx (신규 파일)
"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function WritingAssistantMode({ gradeLevel }: { gradeLevel: string }) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const response = await fetch('/api/korean/writing-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, gradeLevel })
    });
    const result = await response.json();
    setFeedback(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="writing-assistant">
      <Card className="p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2">✍️ 글쓰기 연습</h3>
        <p className="text-sm text-muted-foreground mb-4">
          자유롭게 글을 작성하면 맞춤법, 띄어쓰기, 문장 구조를 확인해드려요.
        </p>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 글을 작성하세요..."
          className="min-h-[300px] mb-4"
        />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {text.length}자
          </span>
          <Button onClick={handleAnalyze} disabled={!text || isAnalyzing}>
            {isAnalyzing ? '분석 중...' : '첨삭 받기'}
          </Button>
        </div>
      </Card>

      {feedback && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📊 첨삭 결과</h3>

          {/* 점수 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <ScoreCard label="맞춤법" score={feedback.overallScore.spelling} />
            <ScoreCard label="문법" score={feedback.overallScore.grammar} />
            <ScoreCard label="구조" score={feedback.overallScore.structure} />
            <ScoreCard label="창의성" score={feedback.overallScore.creativity} />
          </div>

          {/* 교정 사항 */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">🔍 교정 사항</h4>
            {feedback.corrections.map((correction, idx) => (
              <CorrectionCard key={idx} correction={correction} />
            ))}
          </div>

          {/* 칭찬 및 개선점 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">💪 잘한 점</h4>
              <ul className="list-disc list-inside space-y-1">
                {feedback.suggestions.strength.map((s, idx) => (
                  <li key={idx} className="text-sm">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">📈 개선할 점</h4>
              <ul className="list-disc list-inside space-y-1">
                {feedback.suggestions.improvement.map((s, idx) => (
                  <li key={idx} className="text-sm">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-600';
    if (s >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${getColor(score)}`}>{score}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function CorrectionCard({ correction }: { correction: any }) {
  const getBadgeColor = (severity: string) => {
    if (severity === 'error') return 'destructive';
    if (severity === 'warning') return 'default';
    return 'secondary';
  };

  return (
    <div className="border-l-4 border-blue-500 pl-4 py-2 mb-2">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant={getBadgeColor(correction.severity)}>
          {correction.type}
        </Badge>
        <span className="text-sm font-semibold">{correction.error}</span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">제안: </span>
        <span className="font-medium">{correction.suggestion}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {correction.explanation}
      </div>
    </div>
  );
}
```

---

## 5. 학년 범위 외 질문 안내 시스템

### 5.1 질문 난이도 감지 시스템

```typescript
// lib/tutor/grade-level-guard.ts (신규 파일)
import { vertexAIClient } from '@/lib/ai/vertex-client';
import type { Subject, SchoolLevel } from './curriculum-database';

interface GradeLevelCheckResult {
  isAppropriate: boolean; // 학년에 적합한가?
  detectedGradeLevel: SchoolLevel; // 감지된 질문의 학년
  detectedTopics: string[]; // 감지된 학습 주제
  confidenceScore: number; // 0-1
  guidanceMessage?: string; // 안내 메시지
  suggestedResources?: string[]; // 추천 학습 자료
}

export async function checkGradeLevelAppropriate(
  question: string,
  subject: Subject,
  userGradeLevel: SchoolLevel
): Promise<GradeLevelCheckResult> {
  const prompt = `다음 질문이 ${userGradeLevel} 학생에게 적합한지 판단해주세요.

질문: "${question}"
과목: ${subject}
학생 학년: ${userGradeLevel}

다음 정보를 JSON 형식으로 제공해주세요:
{
  "isAppropriate": boolean,
  "detectedGradeLevel": "elementary" | "middle" | "high" | "university",
  "detectedTopics": string[],
  "confidenceScore": number (0-1),
  "reasoning": string
}`;

  const response = await vertexAIClient.generateContent({
    systemInstruction: "You are an education level classifier. Respond only with valid JSON.",
    messages: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  const result = JSON.parse(response);

  // 부적합한 경우 안내 메시지 생성
  if (!result.isAppropriate) {
    const guidanceMessage = generateGuidanceMessage(
      result.detectedGradeLevel,
      userGradeLevel,
      result.detectedTopics,
      subject
    );

    return {
      ...result,
      guidanceMessage,
      suggestedResources: getSuggestedResources(result.detectedTopics, userGradeLevel, subject)
    };
  }

  return result;
}

function generateGuidanceMessage(
  detectedLevel: SchoolLevel,
  userLevel: SchoolLevel,
  topics: string[],
  subject: Subject
): string {
  const levelNames = {
    elementary: '초등학교',
    middle: '중학교',
    high: '고등학교',
    university: '대학교'
  };

  const levelOrder = ['elementary', 'middle', 'high', 'university'];
  const detectedIdx = levelOrder.indexOf(detectedLevel);
  const userIdx = levelOrder.indexOf(userLevel);

  if (detectedIdx > userIdx) {
    // 질문이 학년보다 높음
    return `이 질문은 ${levelNames[detectedLevel]} 수준의 내용이에요.
${levelNames[userLevel]} 학생에게는 조금 어려울 수 있어요.

먼저 다음 내용을 공부하면 좋아요:
${getSuggestedPrerequisites(topics, userLevel, subject).map(t => `• ${t}`).join('\n')}

그래도 궁금하다면 쉽게 설명해드릴게요! 계속 질문하시겠어요?`;
  } else {
    // 질문이 학년보다 낮음
    return `이 질문은 ${levelNames[detectedLevel]} 수준의 내용이에요.
${levelNames[userLevel]} 학생이라면 이미 배운 내용일 수 있어요.

더 심화된 내용으로 다음을 공부해보는 건 어떨까요?
${getAdvancedTopics(topics, userLevel, subject).map(t => `• ${t}`).join('\n')}

그래도 복습하고 싶으시면 설명해드릴게요!`;
  }
}

function getSuggestedPrerequisites(
  topics: string[],
  userLevel: SchoolLevel,
  subject: Subject
): string[] {
  // 현재 학년에서 배워야 할 선수 학습 내용
  // curriculum-database.ts에서 가져오기
  return [
    "기초 개념 복습",
    "관련 예제 풀이",
    "단계별 연습 문제"
  ];
}

function getAdvancedTopics(
  topics: string[],
  userLevel: SchoolLevel,
  subject: Subject
): string[] {
  // 현재 주제의 심화 내용
  return [
    "응용 문제",
    "실전 예제",
    "관련 심화 개념"
  ];
}

function getSuggestedResources(
  topics: string[],
  userLevel: SchoolLevel,
  subject: Subject
): string[] {
  return [
    `${subject} 기초 개념 복습`,
    `${topics[0]} 단계별 학습`,
    "관련 예제 풀이"
  ];
}
```

---

### 5.2 API 라우트 통합

```typescript
// app/api/chat/math/route.ts 수정
export async function POST(req: NextRequest) {
  try {
    const { message, gradeLevel, conversationHistory, userId = 'default' } = await req.json();

    // ... (기존 코드)

    const gradeStr = gradeLevelMap[gradeLevel] || "elementary";

    // ✅ 새로운 단계: 학년 적합성 검사
    const gradeLevelCheck = await checkGradeLevelAppropriate(
      message,
      'math',
      gradeStr as SchoolLevel
    );

    if (!gradeLevelCheck.isAppropriate && gradeLevelCheck.confidenceScore > 0.7) {
      // 부적합한 질문이지만, 학생이 원하면 설명 가능
      const warningMessage = `⚠️ ${gradeLevelCheck.guidanceMessage}

**[계속 질문하기]** 버튼을 누르면 쉽게 설명해드릴게요!
**[추천 학습하기]** 버튼을 누르면 지금 배우면 좋은 내용을 알려드려요.`;

      return new Response(
        JSON.stringify({
          type: 'grade_level_warning',
          message: warningMessage,
          suggestedResources: gradeLevelCheck.suggestedResources
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ... (기존 Gemini 호출 코드)
  } catch (error) {
    // ...
  }
}
```

---

### 5.3 UI에서 안내 메시지 처리

```tsx
// components/tutor-pages/SimpleChatInterface.tsx 수정
const handleSendMessage = async () => {
  // ... (기존 코드)

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: input, gradeLevel, conversationHistory })
  });

  const data = await response.json();

  // 학년 부적합 경고 처리
  if (data.type === 'grade_level_warning') {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: data.message,
      isWarning: true,
      suggestedResources: data.suggestedResources
    }]);

    // 사용자 선택 UI 표시
    setShowGradeLevelWarning(true);
    return;
  }

  // 일반 응답 처리
  setMessages(prev => [...prev, {
    id: Date.now().toString(),
    role: 'assistant',
    content: data.message || data
  }]);
};

// 경고 UI
{showGradeLevelWarning && (
  <Card className="bg-yellow-50 border-yellow-200 p-4 mb-4">
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={() => {
          setShowGradeLevelWarning(false);
          // 쉽게 설명 요청
          handleSendMessageWithOverride(input, true);
        }}
      >
        계속 질문하기
      </Button>
      <Button
        variant="default"
        onClick={() => {
          setShowGradeLevelWarning(false);
          // 추천 학습 자료 표시
          showSuggestedResources(suggestedResources);
        }}
      >
        추천 학습하기
      </Button>
    </div>
  </Card>
)}
```

---

## 6. 추천 기능 및 개발 우선순위

### 6.1 글로벌 에듀테크 필수 기능 정리

#### 🔥 긴급 (P0 - 즉시 구현)

1. **수학 RAG 한국어 전환**
   - 현재: 영문 콘텐츠로 인한 품질 저하
   - 목표: 초중등 수학 RAG 콘텐츠 한국어 작성
   - 예상 효과: 응답 품질 향상, API 호출 50% 감소

2. **국어 튜터 MVP 개발**
   - 기본 대화 모드
   - 간단한 문법/맞춤법 교정
   - RAG 시스템 (초등 1-3학년 우선)

---

#### ⚡ 높음 (P1 - 1-2주 내)

1. **학년 범위 외 질문 안내 시스템**
   - 자동 난이도 감지
   - 친절한 학습 가이드 제공
   - 선수/심화 학습 추천

2. **게이미피케이션 강화**
   - 진도 링 시스템 (Alpha School)
   - 주제별 업적 체계
   - 일일/주간 챌린지

3. **영어 실전 회화 시나리오**
   - 5개 기본 시나리오 (식당, 공항, 쇼핑, 학교, 병원)
   - 목표 표현 달성 시스템
   - 음성 인식 기반 연습

---

#### 📊 중간 (P2 - 3-4주 내)

1. **수학 다중 풀이 방법**
   - 문제당 2-3가지 풀이법 제시
   - 학년별 추천 방법 표시
   - 단계별 상세 설명

2. **국어 쓰기 첨삭 시스템**
   - 맞춤법/띄어쓰기 자동 교정
   - 문장 구조 개선 제안
   - 점수 및 피드백

3. **그래프 자동 생성**
   - 함수/방정식 → 그래프 변환
   - 인터랙티브 조작 가능
   - LaTeX 지원

4. **발음 교정 강화**
   - Google Cloud Speech-to-Text 도입
   - 음소 단위 정확도 분석
   - 실시간 피드백

---

#### 🌟 낮음 (P3 - 장기)

1. **리더보드 (경쟁 요소)**
   - 주간/월간 XP 순위
   - 익명 닉네임 사용
   - 개인정보 보호

2. **AI 비디오 콜 (Duolingo Lily)**
   - 캐릭터와 실시간 영상 통화
   - 표정/제스처 인식
   - 실전 대화 연습

3. **적응형 난이도 시스템**
   - 학습 이력 분석
   - 실시간 난이도 조절
   - 개인화 학습 경로

---

### 6.2 벤치마킹 기반 추천 기능 요약

| 기능 | 벤치마크 | 우선순위 | 예상 개발 기간 |
|------|----------|----------|----------------|
| 소크라테스식 대화 | Khan Academy Khanmigo | P1 | 1주 |
| 학습 이력 기반 추천 | Khan Academy, Alpha School | P2 | 2주 |
| 실전 회화 시나리오 | Duolingo Roleplay | P1 | 2주 |
| AI 비디오 콜 | Duolingo Lily | P3 | 4주+ |
| 다중 풀이 방법 | Photomath | P2 | 1주 |
| 그래프 자동 생성 | Microsoft Math Solver | P2 | 1주 |
| 게이미피케이션 확대 | Duolingo, Alpha School | P1 | 2주 |
| 발음 교정 AI | 자체 제안 | P2 | 1주 |
| 국어 쓰기 첨삭 | Grammarly (영어) 응용 | P1 | 2주 |
| 리더보드 | Duolingo | P3 | 1주 |

---

## 7. 구현 로드맵

### Phase 1: 긴급 개선 (1-2주)

**Week 1:**
- ✅ 수학 RAG 한국어 콘텐츠 작성 (초등 1-6학년)
- ✅ 국어 튜터 API 개발
- ✅ 국어 튜터 기본 UI 개발

**Week 2:**
- ✅ 학년 범위 외 질문 안내 시스템 개발
- ✅ 국어 RAG 콘텐츠 작성 (초등 1-3학년)
- ✅ 게이미피케이션: 진도 링 시스템

---

### Phase 2: 핵심 기능 개발 (3-4주)

**Week 3:**
- ✅ 영어 실전 회화 시나리오 5개 개발
- ✅ 소크라테스식 대화 로직 개선
- ✅ 주제별 업적 체계 구축

**Week 4:**
- ✅ 수학 다중 풀이 방법 시스템
- ✅ 국어 쓰기 첨삭 시스템 MVP
- ✅ 수학/국어 RAG 콘텐츠 확충 (중학교)

---

### Phase 3: 고급 기능 (5-8주)

**Week 5-6:**
- ✅ 그래프 자동 생성 시스템
- ✅ 발음 교정 AI (Google Cloud 연동)
- ✅ 국어 문학 작품 분석 DB 구축

**Week 7-8:**
- ✅ 적응형 난이도 시스템 개발
- ✅ 학습 이력 기반 추천 알고리즘
- ✅ RAG 콘텐츠 완성 (고등/대학)

---

### Phase 4: 최적화 및 확장 (9-12주)

**Week 9-10:**
- ✅ 리더보드 시스템 (선택)
- ✅ 성능 최적화 (캐싱, DB 인덱싱)
- ✅ 접근성 개선 (키보드 네비게이션, 스크린리더)

**Week 11-12:**
- ✅ E2E 테스트 작성
- ✅ 사용자 피드백 수집 및 반영
- ✅ 프로덕션 배포 및 모니터링

---

## 8. 성공 지표 (KPI)

### 사용자 참여도
- **일일 활성 사용자 (DAU)**: 목표 1000+
- **주간 활성 사용자 (WAU)**: 목표 3000+
- **평균 세션 시간**: 목표 15분+
- **연속 학습일**: 평균 7일+

### 학습 효과
- **질문 응답 정확도**: 목표 95%+
- **학생 만족도**: 목표 4.5/5.0+
- **주제 마스터리율**: 목표 70%+ (90% 이상 정확도 달성)
- **재방문율**: 목표 60%+

### 기술 성능
- **응답 속도**: 평균 2초 이하
- **RAG Direct 비율**: 50%+ (API 비용 절감)
- **오류율**: 1% 이하
- **시스템 가동률**: 99.9%+

---

## 9. 예상 비용 분석

### AI API 비용

| 서비스 | 월 예상 사용량 | 단가 | 월 비용 |
|--------|----------------|------|---------|
| Vertex AI Gemini 2.0 Flash | 1M requests | $0.075/1K | $75 |
| Google Cloud Speech-to-Text | 100K 15초 세그먼트 | $0.006/15초 | $600 |
| Redis Cache (Upstash) | 10GB | $0.2/GB | $2 |
| Vercel Hosting | Pro Plan | - | $20 |
| **총합** | - | - | **$697/월** |

### 비용 절감 전략
1. **RAG Direct**: API 호출 50% 감소 → $37.5/월 절감
2. **응답 캐싱**: 중복 질문 80% 캐싱 → $60/월 절감
3. **음성 인식 하이브리드**: 연습 모드는 Web Speech API 무료 사용 → $300/월 절감

**예상 실제 비용**: ~$300/월 (사용자 1000명 기준)

---

## 10. 결론

### 핵심 개선 사항 요약

1. **수학 튜터**:
   - RAG 한국어 전환 (긴급)
   - 다중 풀이 방법
   - 그래프 자동 생성

2. **영어 튜터**:
   - 실전 회화 시나리오
   - 발음 교정 AI
   - 에세이 첨삭

3. **국어 튜터 (신규)**:
   - 읽기/쓰기/문법/문학 4대 기능
   - RAG 시스템 구축
   - AI 첨삭 시스템

4. **공통 개선**:
   - 학년 범위 안내 시스템
   - 게이미피케이션 강화
   - 적응형 학습 경로

### 차별화 포인트

| 기능 | 글로벌 서비스 | 우리 서비스 |
|------|---------------|-------------|
| 가격 | $4-30/월 | **무료** (광고 모델 or Freemium) |
| 언어 | 영어 중심 | **한국어 완벽 지원** |
| 과목 | 단일 과목 특화 | **수학+영어+국어 통합** |
| 학년 커버리지 | 특정 학년 | **초등-대학 전체** |
| RAG 정확도 | 95% | **99% (검증된 콘텐츠)** |

### 다음 단계

1. **즉시 착수**: 수학 RAG 한국어 전환
2. **병렬 진행**: 국어 튜터 MVP 개발
3. **점진적 확장**: Phase별 로드맵 실행
4. **지속적 개선**: 사용자 피드백 기반 반복 개선

---

**문서 작성일**: 2025-01-08
**다음 리뷰**: Phase 1 완료 후 (2주 후)
**담당**: AI 튜터 개발팀
