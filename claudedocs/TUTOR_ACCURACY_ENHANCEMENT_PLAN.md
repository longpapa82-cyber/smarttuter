# 영어·수학 튜터 정확도 고도화 상세 계획

## 📋 목차
1. [핵심 요구사항 분석](#핵심-요구사항-분석)
2. [글로벌 벤치마크 분석](#글로벌-벤치마크-분석)
3. [기술 아키텍처](#기술-아키텍처)
4. [구현 로드맵](#구현-로드맵)
5. [품질 보증 체계](#품질-보증-체계)

---

## 🎯 핵심 요구사항 분석

### 1. 교과 경계 설정 (Subject Boundary Control)

**목표**: 영어 튜터는 영어만, 수학 튜터는 수학만 답변

#### 요구사항 상세
- **영어 튜터**: 수학, 과학, 사회 등 타 교과 질문 거부
- **수학 튜터**: 영어, 과학, 사회 등 타 교과 질문 거부
- **일상 대화**: 학습 무관 일상 대화도 학습 주제로 유도

#### 예외 처리
- **교과 통합 질문**: "영어로 수학 문제를 설명해줘"
  - 영어 튜터: 영어 표현 측면만 도움 (수학 내용 설명 X)
  - 수학 튜터: 수학 내용만 설명 (영어 표현 교정 X)

### 2. 선행학습 방지 (Advanced Learning Prevention)

**목표**: 학생의 학교급에 맞는 학습 범위 내에서만 답변

#### 학교급별 커리큘럼 범위

**초등학교 (Elementary)**:
- 영어: 기초 어휘, 간단한 문장, 파닉스, 기초 회화
- 수학: 사칙연산, 기초 도형, 간단한 분수

**중학교 (Middle School)**:
- 영어: 중급 문법, 독해, 에세이 작성 기초
- 수학: 대수학 기초, 기하학 기초, 확률과 통계 기초

**고등학교 (High School)**:
- 영어: 고급 문법, 문학 분석, 학술적 글쓰기
- 수학: 대수학 II, 기하학, 삼각함수, 미적분 기초

**대학교 (University)**:
- 영어: 학술 영어, 전문 분야 영어
- 수학: 고급 미적분, 선형대수, 통계학

#### 선행학습 감지 예시
- 초등 5학년이 "미적분 개념" 질문 → 거부
- 중학 2학년이 "대학 수준 선형대수" 질문 → 거부
- 고등 1학년이 "고등 3학년 과정" 질문 → 현재 학년 수준으로 안내

### 3. 정확도 보장 (Accuracy Assurance)

**목표**: 추측 답변 제거, 팩트 기반 답변만 제공

#### 요구사항
- 확실하지 않은 답변 제공 금지
- 출처가 불명확한 정보 제공 금지
- 수학 문제는 단계별 검증 필수

---

## 🌍 글로벌 벤치마크 분석

### 1. Khan Academy Khanmigo (2025)

**핵심 기능**:
- GPT-4 기반 커스텀 프롬프트 + 가드레일
- Khan Academy 공식 콘텐츠 라이브러리 통합
- 주제 이탈 방지 필터링 시스템

**장점**:
- 검증된 교육 콘텐츠와 AI 결합
- 부적절한 질문 차단 시스템
- 안전 우선 설계 (학생 보호)

**적용 가능 기술**:
- Moderation Filter 시스템
- Content Library 기반 RAG
- Safety Guardrails

### 2. AI 환각(Hallucination) 방지 기술 (2025)

**연구 결과**:
- AI 챗봇 응답의 최대 27% 환각 포함
- 생성 텍스트의 46% 팩트 오류 포함

**방지 기술**:

#### Retrieval-Augmented Generation (RAG)
- 신뢰할 수 있는 데이터베이스 연동
- 실시간 정확한 정보 접근
- 팩트 정확도와 사용자 신뢰 향상

#### Cross-Model Validation
- 여러 독립 AI 시스템 동시 쿼리
- 출력 비교로 불일치 감지
- 환각 가능성 식별

#### Chain-of-Thought Prompting
- 단계별 추론 과정 설명 요구
- 논리적 갭 노출
- 근거 없는 주장 감지

#### Temperature Adjustment
- 낮은 temperature (0-0.3) 사용
- 더 집중되고 일관된 출력
- 팩트 기반 응답 강화

#### Automated Reasoning Checks
- 최대 99% 검증 정확도
- AI 환각 감지 자동화
- 신뢰할 수 있는 소스와 비교

### 3. 학년별 표준 커리큘럼 (Common Core Standards)

**활용 자료**:
- Common Core State Standards (CCSS)
- 주별 K-12 학습 표준
- Illustrative Mathematics 커리큘럼 (2024 v.360)

**적용 방법**:
- 각 학교급별 학습 범위 DB 구축
- 질문 분석 시 학년 수준 매칭
- 범위 초과 시 안내 메시지

---

## 🏗️ 기술 아키텍처

### Phase 1: 교과 분류 시스템 (Subject Classification)

#### 1.1 질문 분류기 (Question Classifier)

```typescript
// lib/tutor/question-classifier.ts

interface QuestionClassification {
  subject: 'english' | 'math' | 'science' | 'social' | 'other';
  confidence: number;
  isOnTopic: boolean;
  reason?: string;
}

/**
 * AI를 사용하여 질문이 어느 교과에 해당하는지 분류
 */
async function classifyQuestion(
  question: string,
  expectedSubject: 'english' | 'math'
): Promise<QuestionClassification> {
  // Gemini AI를 사용하여 질문 분류
  const prompt = `
당신은 교육 전문가입니다. 다음 질문이 어느 교과에 해당하는지 분류하세요.

질문: "${question}"

다음 중 하나로 분류:
- english: 영어 문법, 어휘, 독해, 작문, 회화 관련
- math: 수학 계산, 문제 풀이, 개념 설명 관련
- science: 과학 실험, 이론, 현상 설명 관련
- social: 역사, 지리, 사회 현상 관련
- other: 위 범주에 해당하지 않는 일상 대화 등

JSON 형식으로 응답:
{
  "subject": "분류된 교과",
  "confidence": 0-100 사이 신뢰도,
  "reason": "분류 이유"
}
`;

  const result = await callGeminiAPI(prompt);
  const classification = JSON.parse(result);

  return {
    ...classification,
    isOnTopic: classification.subject === expectedSubject
  };
}
```

#### 1.2 응답 필터링 (Response Filtering)

```typescript
// lib/tutor/response-filter.ts

interface FilterResult {
  shouldRespond: boolean;
  redirectMessage?: string;
}

/**
 * 질문이 교과 범위 내인지 확인하고 필터링
 */
function filterBySubject(
  classification: QuestionClassification,
  tutorType: 'english' | 'math'
): FilterResult {
  if (classification.isOnTopic) {
    return { shouldRespond: true };
  }

  // 교과 이탈 시 안내 메시지
  const redirectMessages = {
    english: {
      math: "수학 관련 질문은 Math Park에서 도와드릴 수 있어요. 영어 학습과 관련된 질문을 해주세요!",
      science: "과학 질문은 현재 지원하지 않아요. 영어 문법, 어휘, 독해, 작문에 대해 물어보세요!",
      social: "사회 과목은 현재 지원하지 않아요. 영어 학습에 집중해볼까요?",
      other: "영어 학습과 관련된 질문을 해주시면 더 잘 도와드릴 수 있어요. 예를 들어, 문법이나 어휘, 독해 연습 등이 있어요!"
    },
    math: {
      english: "영어 관련 질문은 English Park에서 도와드릴 수 있어요. 수학 문제나 개념에 대해 물어보세요!",
      science: "과학 질문은 현재 지원하지 않아요. 수학 계산이나 문제 풀이를 도와드릴게요!",
      social: "사회 과목은 현재 지원하지 않아요. 수학 학습에 집중해볼까요?",
      other: "수학 학습과 관련된 질문을 해주시면 더 잘 도와드릴 수 있어요. 예를 들어, 문제 풀이나 개념 설명 등이 있어요!"
    }
  };

  return {
    shouldRespond: false,
    redirectMessage: redirectMessages[tutorType][classification.subject] ||
      `현재는 ${tutorType === 'english' ? '영어' : '수학'} 학습만 지원하고 있어요. 관련 질문을 해주세요!`
  };
}
```

### Phase 2: 학년 수준 검증 시스템 (Grade Level Validation)

#### 2.1 커리큘럼 데이터베이스

```typescript
// lib/curriculum/curriculum-database.ts

interface CurriculumScope {
  gradeLevel: 'elementary' | 'middle' | 'high' | 'university';
  subject: 'english' | 'math';
  topics: string[];
  keywords: string[];
  excludedTopics: string[];
}

const CURRICULUM_DB: CurriculumScope[] = [
  // 초등학교 영어
  {
    gradeLevel: 'elementary',
    subject: 'english',
    topics: [
      'alphabet', 'phonics', 'basic vocabulary', 'simple sentences',
      'greetings', 'colors', 'numbers', 'family words', 'animals'
    ],
    keywords: ['알파벳', '파닉스', '기초 어휘', '인사', '색깔', '숫자'],
    excludedTopics: ['grammar rules', 'essay writing', 'literature analysis', 'academic writing']
  },
  // 초등학교 수학
  {
    gradeLevel: 'elementary',
    subject: 'math',
    topics: [
      'addition', 'subtraction', 'multiplication', 'division',
      'basic fractions', 'basic geometry', 'simple word problems'
    ],
    keywords: ['더하기', '빼기', '곱하기', '나누기', '분수', '도형'],
    excludedTopics: ['algebra', 'calculus', 'trigonometry', 'derivatives', 'integrals']
  },
  // 중학교 영어
  {
    gradeLevel: 'middle',
    subject: 'english',
    topics: [
      'intermediate grammar', 'reading comprehension', 'basic essay',
      'verb tenses', 'prepositions', 'conjunctions', 'paragraph writing'
    ],
    keywords: ['문법', '독해', '동사', '시제', '전치사', '접속사', '문단'],
    excludedTopics: ['literary criticism', 'thesis writing', 'academic research']
  },
  // 중학교 수학
  {
    gradeLevel: 'middle',
    subject: 'math',
    topics: [
      'algebra basics', 'linear equations', 'basic geometry',
      'probability', 'statistics', 'ratios', 'proportions'
    ],
    keywords: ['대수', '방정식', '확률', '통계', '비율'],
    excludedTopics: ['calculus', 'derivatives', 'integrals', 'limits', 'advanced trigonometry']
  },
  // 고등학교 영어
  {
    gradeLevel: 'high',
    subject: 'english',
    topics: [
      'advanced grammar', 'literature analysis', 'academic writing',
      'argumentative essay', 'rhetorical devices', 'critical reading'
    ],
    keywords: ['고급 문법', '문학', '논술', '비평', '수사법'],
    excludedTopics: ['linguistics theory', 'advanced phonetics']
  },
  // 고등학교 수학
  {
    gradeLevel: 'high',
    subject: 'math',
    topics: [
      'algebra II', 'geometry', 'trigonometry', 'pre-calculus',
      'functions', 'logarithms', 'exponentials', 'basic calculus'
    ],
    keywords: ['대수학', '기하학', '삼각함수', '함수', '로그', '지수'],
    excludedTopics: ['multivariable calculus', 'differential equations', 'linear algebra', 'abstract algebra']
  },
  // 대학교 영어
  {
    gradeLevel: 'university',
    subject: 'english',
    topics: [
      'academic English', 'research writing', 'professional communication',
      'specialized vocabulary', 'presentation skills'
    ],
    keywords: ['학술 영어', '연구 논문', '전문 용어', '프레젠테이션'],
    excludedTopics: []
  },
  // 대학교 수학
  {
    gradeLevel: 'university',
    subject: 'math',
    topics: [
      'advanced calculus', 'linear algebra', 'differential equations',
      'statistics', 'discrete mathematics', 'analysis'
    ],
    keywords: ['고급 미적분', '선형대수', '미분방정식', '통계학', '이산수학'],
    excludedTopics: []
  }
];
```

#### 2.2 학년 수준 검증기

```typescript
// lib/curriculum/grade-level-validator.ts

interface ValidationResult {
  isAppropriate: boolean;
  detectedLevel?: string;
  suggestedGrade?: string;
  message?: string;
}

/**
 * 질문이 학생의 학년 수준에 적합한지 검증
 */
async function validateGradeLevel(
  question: string,
  studentGradeLevel: 'elementary' | 'middle' | 'high' | 'university',
  subject: 'english' | 'math'
): Promise<ValidationResult> {
  // 1. AI를 사용하여 질문의 난이도 분석
  const prompt = `
당신은 교육 과정 전문가입니다. 다음 질문의 학년 수준을 분석하세요.

질문: "${question}"
교과: ${subject === 'english' ? '영어' : '수학'}

다음 중 하나로 분류:
- elementary: 초등학교 수준
- middle: 중학교 수준
- high: 고등학교 수준
- university: 대학교 수준

JSON 형식으로 응답:
{
  "detectedLevel": "감지된 학년 수준",
  "topics": ["관련 주제들"],
  "confidence": 0-100 사이 신뢰도,
  "reason": "판단 이유"
}
`;

  const result = await callGeminiAPI(prompt);
  const analysis = JSON.parse(result);

  // 2. 학생 학년과 비교
  const levelOrder = ['elementary', 'middle', 'high', 'university'];
  const studentLevelIndex = levelOrder.indexOf(studentGradeLevel);
  const detectedLevelIndex = levelOrder.indexOf(analysis.detectedLevel);

  if (detectedLevelIndex <= studentLevelIndex) {
    return {
      isAppropriate: true
    };
  }

  // 3. 선행학습 감지 시 안내 메시지
  const gradeNames = {
    elementary: '초등학교',
    middle: '중학교',
    high: '고등학교',
    university: '대학교'
  };

  return {
    isAppropriate: false,
    detectedLevel: analysis.detectedLevel,
    suggestedGrade: studentGradeLevel,
    message: `이 질문은 ${gradeNames[analysis.detectedLevel]} 수준의 내용이에요. 현재 ${gradeNames[studentGradeLevel]} 과정에 맞는 내용부터 차근차근 배워보는 것이 좋아요! 😊

지금 학년에 맞는 기초부터 탄탄히 다지면, 나중에 더 어려운 내용도 쉽게 이해할 수 있답니다. 현재 학습 단계에 맞는 질문을 해주세요!`
  };
}
```

### Phase 3: 정확도 보장 시스템 (Accuracy Assurance)

#### 3.1 RAG (Retrieval-Augmented Generation) 시스템

```typescript
// lib/tutor/rag-system.ts

interface RAGConfig {
  subject: 'english' | 'math';
  gradeLevel: string;
  useVerifiedContent: boolean;
}

/**
 * 검증된 교육 콘텐츠를 참조하여 답변 생성
 */
async function generateRAGResponse(
  question: string,
  config: RAGConfig
): Promise<string> {
  // 1. 관련 검증된 콘텐츠 검색
  const relevantContent = await searchVerifiedContent(question, config);

  // 2. 콘텐츠가 없으면 "모르겠다" 응답
  if (!relevantContent || relevantContent.length === 0) {
    return "죄송해요, 이 질문에 대해 확실한 답변을 드리기 어려워요. 좀 더 구체적으로 질문해주시거나, 다른 방식으로 물어봐 주시겠어요?";
  }

  // 3. 검증된 콘텐츠 기반 답변 생성
  const prompt = `
당신은 ${config.subject === 'english' ? '영어' : '수학'} 튜터입니다.
학생 학년: ${config.gradeLevel}

다음 검증된 교육 자료를 참고하여 답변하세요:
${relevantContent.map(c => `- ${c.content} (출처: ${c.source})`).join('\n')}

학생 질문: "${question}"

중요 규칙:
1. 반드시 제공된 자료에 근거하여 답변하세요
2. 확실하지 않은 내용은 추측하지 마세요
3. 출처를 명확히 하세요
4. 학생 수준에 맞는 언어로 설명하세요
`;

  return await callGeminiAPI(prompt);
}

/**
 * 검증된 교육 콘텐츠 검색
 */
async function searchVerifiedContent(
  query: string,
  config: RAGConfig
): Promise<Array<{ content: string; source: string; }>> {
  // 실제 구현 시:
  // 1. Vector DB에서 유사도 검색
  // 2. 학년 수준 필터링
  // 3. 신뢰도 높은 출처만 반환

  // 예시 데이터
  return [
    {
      content: "검증된 교육 콘텐츠 내용",
      source: "Common Core Standards / Khan Academy"
    }
  ];
}
```

#### 3.2 답변 검증 시스템 (Answer Verification)

```typescript
// lib/tutor/answer-verifier.ts

interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  issues?: string[];
  correctedAnswer?: string;
}

/**
 * Cross-Model Validation을 사용한 답변 검증
 */
async function verifyAnswer(
  question: string,
  answer: string,
  subject: 'english' | 'math'
): Promise<VerificationResult> {
  // 1. 수학 문제는 단계별 검증
  if (subject === 'math') {
    return await verifyMathAnswer(question, answer);
  }

  // 2. 영어는 문법 + 내용 정확성 검증
  return await verifyEnglishAnswer(question, answer);
}

/**
 * 수학 답변 검증 (단계별)
 */
async function verifyMathAnswer(
  question: string,
  answer: string
): Promise<VerificationResult> {
  const prompt = `
당신은 수학 검증 전문가입니다.

문제: "${question}"
제시된 답변: "${answer}"

다음을 검증하세요:
1. 계산 과정이 정확한가?
2. 각 단계가 논리적으로 연결되는가?
3. 최종 답이 맞는가?
4. 다른 풀이 방법이 있는가?

JSON 형식으로 응답:
{
  "isCorrect": true/false,
  "confidence": 0-100,
  "issues": ["발견된 오류들"],
  "correctAnswer": "올바른 답변 (오류 발견 시)"
}
`;

  const result = await callGeminiAPI(prompt);
  const verification = JSON.parse(result);

  return {
    isVerified: verification.isCorrect && verification.confidence > 85,
    confidence: verification.confidence,
    issues: verification.issues,
    correctedAnswer: verification.correctAnswer
  };
}

/**
 * 영어 답변 검증
 */
async function verifyEnglishAnswer(
  question: string,
  answer: string
): Promise<VerificationResult> {
  const prompt = `
당신은 영어 교육 전문가입니다.

질문: "${question}"
제시된 답변: "${answer}"

다음을 검증하세요:
1. 문법적으로 정확한가?
2. 제공된 정보가 사실에 근거하는가?
3. 학생 수준에 적절한 설명인가?
4. 더 나은 설명 방법이 있는가?

JSON 형식으로 응답:
{
  "isAccurate": true/false,
  "confidence": 0-100,
  "issues": ["발견된 문제들"],
  "improvedAnswer": "개선된 답변 (필요 시)"
}
`;

  const result = await callGeminiAPI(prompt);
  const verification = JSON.parse(result);

  return {
    isVerified: verification.isAccurate && verification.confidence > 85,
    confidence: verification.confidence,
    issues: verification.issues,
    correctedAnswer: verification.improvedAnswer
  };
}
```

#### 3.3 Chain-of-Thought 강제 시스템

```typescript
// lib/tutor/chain-of-thought.ts

/**
 * 단계별 추론 과정을 강제하여 정확도 향상
 */
async function generateWithCoT(
  question: string,
  subject: 'english' | 'math',
  gradeLevel: string
): Promise<string> {
  const prompt = `
당신은 ${subject === 'english' ? '영어' : '수학'} 튜터입니다.
학생 학년: ${gradeLevel}

질문: "${question}"

반드시 다음 단계를 따라 답변하세요:

1. 질문 분석
   - 학생이 무엇을 묻는지 명확히 파악
   - 필요한 배경 지식 확인

2. 단계별 설명
   - 각 단계를 명확하게 구분
   - 왜 그렇게 하는지 이유 설명
   - 학생이 이해할 수 있는 언어 사용

3. 검증
   - 최종 답변이 질문에 부합하는지 확인
   - 논리적 비약이 없는지 점검

4. 요약
   - 핵심 내용 정리
   - 학생이 기억해야 할 포인트

형식:
## 🤔 질문 분석
[분석 내용]

## 📝 단계별 설명
### 1단계: [제목]
[설명]

### 2단계: [제목]
[설명]

## ✅ 검증
[검증 내용]

## 💡 요약
[핵심 정리]
`;

  return await callGeminiAPI(prompt, {
    temperature: 0.2, // 낮은 temperature로 정확도 향상
    topP: 0.8,
    topK: 40
  });
}
```

### Phase 4: 통합 튜터 시스템

#### 4.1 강화된 시스템 프롬프트

```typescript
// lib/tutor/enhanced-system-prompt.ts

export function generateEnhancedSystemPrompt(
  subject: 'english' | 'math',
  gradeLevel: 'elementary' | 'middle' | 'high' | 'university',
  studentName?: string
): string {
  const subjectInfo = {
    english: {
      name: '영어',
      scope: '영어 문법, 어휘, 독해, 작문, 회화',
      otherSubjects: '수학, 과학, 사회 등',
      redirectService: 'Math Park (수학 튜터)'
    },
    math: {
      name: '수학',
      scope: '수학 계산, 문제 풀이, 개념 설명',
      otherSubjects: '영어, 과학, 사회 등',
      redirectService: 'English Park (영어 튜터)'
    }
  };

  const gradeInfo = {
    elementary: {
      name: '초등학교',
      nextLevel: '중학교',
      appropriateTopics: subject === 'english'
        ? '알파벳, 파닉스, 기초 어휘, 간단한 문장, 기초 회화'
        : '사칙연산, 기초 분수, 간단한 도형, 기본 문제 풀이',
      excludedTopics: subject === 'english'
        ? '고급 문법, 문학 비평, 학술적 글쓰기'
        : '대수학, 미적분, 삼각함수, 고급 기하학'
    },
    middle: {
      name: '중학교',
      nextLevel: '고등학교',
      appropriateTopics: subject === 'english'
        ? '중급 문법, 독해, 기초 에세이, 중급 어휘'
        : '대수학 기초, 기하학 기초, 확률과 통계 기초',
      excludedTopics: subject === 'english'
        ? '고급 문학 이론, 전문 학술 글쓰기'
        : '고급 미적분, 선형대수, 미분방정식'
    },
    high: {
      name: '고등학교',
      nextLevel: '대학교',
      appropriateTopics: subject === 'english'
        ? '고급 문법, 문학 분석, 학술적 글쓰기, 논술'
        : '대수학 II, 기하학, 삼각함수, 미적분 기초',
      excludedTopics: subject === 'english'
        ? '고급 언어학 이론, 전문 연구 논문'
        : '다변수 미적분, 추상대수학, 위상수학'
    },
    university: {
      name: '대학교',
      nextLevel: null,
      appropriateTopics: subject === 'english'
        ? '학술 영어, 연구 논문 작성, 전문 분야 영어'
        : '고급 미적분, 선형대수, 미분방정식, 통계학',
      excludedTopics: null
    }
  };

  const info = subjectInfo[subject];
  const grade = gradeInfo[gradeLevel];

  return `# 당신의 역할과 정체성

당신은 **${info.name} 전문 AI 튜터**입니다. ${studentName ? `학생 이름은 ${studentName}이고, ` : ''}학생의 학년은 **${grade.name}**입니다.

---

## 🎯 핵심 원칙

### 1. 교과 범위 엄수 (CRITICAL)

**허용 범위**: ${info.scope}만 다룹니다.

**금지 사항**:
- ❌ ${info.otherSubjects} 관련 질문에는 절대 답변하지 않습니다
- ❌ 교과 무관한 일상 대화는 학습으로 유도합니다
- ❌ 다른 교과 문제를 풀어주거나 설명하지 않습니다

**대응 방법**:
학생이 ${info.otherSubjects} 질문을 하면:
"그 질문은 ${info.name} 범위를 벗어나요. ${info.name} 학습에 집중해볼까요? ${info.scope}에 대해 물어보세요!"

다른 교과 서비스가 필요하면:
"${info.otherSubjects} 관련 질문은 ${info.redirectService}에서 도와드릴 수 있어요!"

### 2. 선행학습 방지 (CRITICAL)

**현재 학년 범위**: ${grade.appropriateTopics}

${grade.excludedTopics ? `**금지 주제**: ${grade.excludedTopics}` : '**제한 없음**: 대학교 수준이므로 모든 주제 가능'}

**대응 방법**:
학생이 ${grade.nextLevel ? `${grade.nextLevel} 이상` : '더 높은'} 수준 질문을 하면:
"이 내용은 ${grade.nextLevel ? `${grade.nextLevel}에서` : '더 높은 학년에서'} 배우는 내용이에요! 😊

지금은 ${grade.name} 과정에 맞는 ${grade.appropriateTopics}부터 탄탄히 다져보는 게 좋아요. 기초가 튼튼하면 나중에 더 어려운 내용도 쉽게 이해할 수 있답니다!

${grade.name}에 맞는 질문을 해주세요!"

### 3. 정확도 최우선 (CRITICAL)

**반드시 지킬 것**:
- ✅ 확실한 내용만 답변합니다
- ✅ 모르는 것은 "잘 모르겠어요"라고 솔직히 말합니다
- ✅ 추측하지 않습니다
- ✅ ${subject === 'math' ? '수학 문제는 단계별로 검증하며 풉니다' : '문법과 어휘는 정확한 근거를 제시합니다'}

**답변 시 포함할 요소**:
1. 단계별 설명 (Chain-of-Thought)
2. 왜 그런지 이유 설명
3. ${subject === 'math' ? '계산 검증' : '예문과 함께 설명'}
4. 학생이 스스로 확인할 방법 제시

**불확실할 때**:
"이 부분은 제가 확실하지 않아서 정확한 답변을 드리기 어려워요. 다른 방식으로 질문해주시거나, 선생님께 여쭤보시는 것을 추천해요!"

### 4. 학생 중심 교육

**친근하고 격려하는 톤**:
- 학생의 노력을 인정하고 칭찬합니다
- 실수를 비난하지 않고 성장의 기회로 봅니다
- 긍정적이고 동기부여하는 언어를 사용합니다

**소크라틱 방법 활용**:
- 답을 바로 주지 않고 질문으로 생각을 유도합니다
- 학생 스스로 답을 찾도록 돕습니다
- 힌트를 단계적으로 제공합니다

**개인화**:
- 학생의 이해 수준에 맞춰 설명합니다
- 어려워하면 더 쉽게 풀어서 설명합니다
- 이미 아는 내용은 간단히 넘어갑니다

---

## 📋 답변 체크리스트

모든 답변 전에 확인:
- [ ] ${info.name} 교과 범위 내 질문인가?
- [ ] ${grade.name} 수준에 맞는 내용인가?
- [ ] 확실하고 정확한 정보인가?
- [ ] 단계별로 명확히 설명했는가?
- [ ] 학생이 이해하기 쉬운 언어인가?

하나라도 "아니오"면 답변을 수정하거나 안내 메시지를 제공하세요.

---

## 💬 응답 예시

### ✅ 좋은 응답 (범위 내 질문)

학생: "현재완료 시제가 뭐예요?"

튜터: "좋은 질문이에요! 현재완료는 과거에 시작된 일이 현재까지 영향을 미칠 때 사용해요.

## 구조
**have/has + 과거분사**

## 예문
✅ I have finished my homework. (숙제를 끝냈어요 - 지금 끝난 상태)
✅ She has lived here for 5 years. (5년 동안 여기 살았어요 - 지금도 살고 있음)

## 연습
다음 문장을 현재완료로 바꿔볼까요?
'I eat breakfast.' → 'I ___ ___ breakfast.'

한번 해볼래요?"

### ❌ 거부 응답 (타 교과 질문)

학생: "이차방정식 푸는 법 알려줘"

영어 튜터: "수학 문제는 Math Park(수학 튜터)에서 도와드릴 수 있어요!

저는 영어 전문 튜터라서 영어 문법, 어휘, 독해, 작문을 도와드려요. 영어 관련 질문을 해주세요! 😊"

### ⚠️ 거부 응답 (선행학습)

학생 (초등 5학년): "미적분 개념 설명해줘"

수학 튜터: "미적분은 고등학교나 대학교에서 배우는 내용이에요!

지금은 초등학교 과정의 사칙연산, 분수, 도형부터 탄탄하게 배우는 게 더 중요해요. 기초가 튼튼하면 나중에 미적분도 훨씬 쉽게 이해할 수 있답니다!

초등 수학 범위에서 궁금한 게 있나요?"

---

이제 학생의 질문에 답변해주세요!`;
}
```

#### 4.2 통합 API 엔드포인트 강화

```typescript
// app/api/chat/english/route.ts (수정)
// app/api/chat/math/route.ts (수정)

import { classifyQuestion } from '@/lib/tutor/question-classifier';
import { filterBySubject } from '@/lib/tutor/response-filter';
import { validateGradeLevel } from '@/lib/curriculum/grade-level-validator';
import { generateRAGResponse } from '@/lib/tutor/rag-system';
import { verifyAnswer } from '@/lib/tutor/answer-verifier';
import { generateWithCoT } from '@/lib/tutor/chain-of-thought';
import { generateEnhancedSystemPrompt } from '@/lib/tutor/enhanced-system-prompt';

export async function POST(req: Request) {
  const { message, gradeLevel, conversationHistory } = await req.json();
  const tutorType: 'english' | 'math' = req.url.includes('/english') ? 'english' : 'math';

  try {
    // 1. 질문 분류
    const classification = await classifyQuestion(message, tutorType);

    // 2. 교과 필터링
    const filterResult = filterBySubject(classification, tutorType);
    if (!filterResult.shouldRespond) {
      return Response.json({
        response: filterResult.redirectMessage,
        isRedirect: true
      });
    }

    // 3. 학년 수준 검증
    const gradeValidation = await validateGradeLevel(message, gradeLevel, tutorType);
    if (!gradeValidation.isAppropriate) {
      return Response.json({
        response: gradeValidation.message,
        isOutOfScope: true
      });
    }

    // 4. 강화된 시스템 프롬프트 생성
    const systemPrompt = generateEnhancedSystemPrompt(tutorType, gradeLevel);

    // 5. RAG 기반 답변 생성 (검증된 콘텐츠 사용)
    const ragResponse = await generateRAGResponse(message, {
      subject: tutorType,
      gradeLevel,
      useVerifiedContent: true
    });

    // 6. Chain-of-Thought로 재생성 (더 정확한 답변)
    const cotResponse = await generateWithCoT(message, tutorType, gradeLevel);

    // 7. 답변 검증
    const verification = await verifyAnswer(message, cotResponse, tutorType);

    if (!verification.isVerified && verification.confidence < 70) {
      // 신뢰도 낮으면 솔직하게 알림
      return Response.json({
        response: "죄송해요, 이 질문에 대해 확실한 답변을 드리기 어려워요. 좀 더 구체적으로 질문해주시거나, 선생님께 여쭤보시는 것을 추천해요!",
        isUncertain: true
      });
    }

    // 8. 최종 답변 (검증 통과 or 교정된 답변)
    const finalResponse = verification.correctedAnswer || cotResponse;

    return Response.json({
      response: finalResponse,
      metadata: {
        classification: classification.subject,
        gradeLevel: gradeValidation.detectedLevel,
        confidence: verification.confidence,
        verified: verification.isVerified
      }
    });

  } catch (error) {
    console.error('Enhanced tutor error:', error);
    return Response.json(
      { error: '답변 생성 중 오류가 발생했어요. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
```

---

## 🗓️ 구현 로드맵

### Week 1: 교과 분류 시스템

**목표**: 질문이 올바른 교과인지 판별하고 필터링

- [ ] Day 1-2: Question Classifier 구현
- [ ] Day 3-4: Response Filter 구현 및 테스트
- [ ] Day 5: 통합 테스트 및 정확도 측정

**성공 지표**:
- 교과 분류 정확도 > 95%
- 타 교과 질문 거부율 100%

### Week 2: 학년 수준 검증

**목표**: 선행학습 방지 시스템 구축

- [ ] Day 1-2: 커리큘럼 데이터베이스 구축
- [ ] Day 3-4: Grade Level Validator 구현
- [ ] Day 5: 학년별 테스트 및 검증

**성공 지표**:
- 학년 수준 감지 정확도 > 90%
- 선행학습 질문 거부율 100%

### Week 3: 정확도 보장 시스템

**목표**: 환각 방지 및 팩트 검증

- [ ] Day 1-2: RAG 시스템 구축
- [ ] Day 3: Chain-of-Thought 구현
- [ ] Day 4: Answer Verifier 구현
- [ ] Day 5: 통합 및 검증

**성공 지표**:
- 팩트 정확도 > 95%
- 환각 발생률 < 5%
- 불확실 시 거부율 100%

### Week 4: 통합 및 최적화

**목표**: 전체 시스템 통합 및 성능 최적화

- [ ] Day 1-2: Enhanced System Prompt 적용
- [ ] Day 3: API 엔드포인트 통합
- [ ] Day 4: E2E 테스트
- [ ] Day 5: 성능 최적화 및 배포

**성공 지표**:
- 응답 시간 < 3초
- 전체 시스템 안정성 > 99%
- 사용자 만족도 > 4.5/5

---

## ✅ 품질 보증 체계

### 1. 자동화 테스트

#### 교과 분류 테스트

```typescript
// tests/tutor/question-classifier.test.ts

describe('Question Classifier', () => {
  it('should correctly classify English questions', async () => {
    const testCases = [
      { question: "현재완료 시제가 뭐예요?", expected: 'english' },
      { question: "How do I use present perfect?", expected: 'english' },
      { question: "문법 질문이에요", expected: 'english' }
    ];

    for (const testCase of testCases) {
      const result = await classifyQuestion(testCase.question, 'english');
      expect(result.subject).toBe(testCase.expected);
      expect(result.isOnTopic).toBe(true);
    }
  });

  it('should reject off-topic questions', async () => {
    const testCases = [
      { question: "이차방정식 푸는 법", subject: 'math' },
      { question: "광합성이 뭐예요?", subject: 'science' },
      { question: "오늘 날씨 어때?", subject: 'other' }
    ];

    for (const testCase of testCases) {
      const result = await classifyQuestion(testCase.question, 'english');
      expect(result.isOnTopic).toBe(false);
      expect(result.subject).toBe(testCase.subject);
    }
  });
});
```

#### 학년 수준 테스트

```typescript
// tests/curriculum/grade-level-validator.test.ts

describe('Grade Level Validator', () => {
  it('should allow appropriate level questions', async () => {
    const result = await validateGradeLevel(
      "분수 더하기 방법 알려줘",
      'elementary',
      'math'
    );
    expect(result.isAppropriate).toBe(true);
  });

  it('should reject advanced learning questions', async () => {
    const result = await validateGradeLevel(
      "미적분 개념 설명해줘",
      'elementary',
      'math'
    );
    expect(result.isAppropriate).toBe(false);
    expect(result.detectedLevel).toBe('high' or 'university');
    expect(result.message).toContain('고등학교' or '대학교');
  });
});
```

#### 정확도 테스트

```typescript
// tests/tutor/answer-verifier.test.ts

describe('Answer Verifier', () => {
  it('should verify correct math answers', async () => {
    const question = "2 + 2는 얼마예요?";
    const answer = "2 + 2 = 4입니다.";

    const result = await verifyAnswer(question, answer, 'math');
    expect(result.isVerified).toBe(true);
    expect(result.confidence).toBeGreaterThan(95);
  });

  it('should catch incorrect answers', async () => {
    const question = "2 + 2는 얼마예요?";
    const answer = "2 + 2 = 5입니다.";

    const result = await verifyAnswer(question, answer, 'math');
    expect(result.isVerified).toBe(false);
    expect(result.issues).toContain('계산 오류');
    expect(result.correctedAnswer).toContain('4');
  });

  it('should detect hallucinations', async () => {
    const question = "현재완료 시제 설명해줘";
    const answer = "현재완료는 'did + 동사원형'으로 만듭니다."; // 틀린 설명

    const result = await verifyAnswer(question, answer, 'english');
    expect(result.isVerified).toBe(false);
    expect(result.correctedAnswer).toContain('have/has + 과거분사');
  });
});
```

### 2. E2E 테스트

```typescript
// tests/e2e/tutor-accuracy.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Tutor Accuracy Enhancement', () => {
  test('should reject off-topic questions in English tutor', async ({ page }) => {
    await page.goto('/tutor/english');

    // 수학 질문 입력
    await page.fill('[data-testid="chat-input"]', '이차방정식 푸는 법');
    await page.click('[data-testid="send-button"]');

    // 거부 메시지 확인
    const response = await page.locator('[data-testid="tutor-message"]').last();
    await expect(response).toContainText('Math Park');
    await expect(response).toContainText('영어');
  });

  test('should reject advanced learning questions', async ({ page }) => {
    await page.goto('/tutor/math');
    await page.selectOption('[data-testid="grade-select"]', 'elementary');

    // 고등 수학 질문
    await page.fill('[data-testid="chat-input"]', '미적분 개념 설명해줘');
    await page.click('[data-testid="send-button"]');

    // 선행학습 방지 메시지 확인
    const response = await page.locator('[data-testid="tutor-message"]').last();
    await expect(response).toContainText('고등학교');
    await expect(response).toContainText('초등학교');
    await expect(response).toContainText('기초');
  });

  test('should provide accurate step-by-step math solutions', async ({ page }) => {
    await page.goto('/tutor/math');

    await page.fill('[data-testid="chat-input"]', '12 + 8은 얼마예요?');
    await page.click('[data-testid="send-button"]');

    const response = await page.locator('[data-testid="tutor-message"]').last();
    await expect(response).toContainText('20');
    await expect(response).toContainText('단계'); // 단계별 설명 확인
  });
});
```

### 3. 성능 모니터링

```typescript
// lib/monitoring/accuracy-monitor.ts

interface AccuracyMetrics {
  totalQuestions: number;
  onTopicRate: number;
  gradeLevelAccuracy: number;
  factAccuracy: number;
  hallucinationRate: number;
  averageConfidence: number;
}

/**
 * 튜터 정확도 지표 수집 및 모니터링
 */
export async function trackAccuracyMetrics(
  questionId: string,
  classification: QuestionClassification,
  validation: ValidationResult,
  verification: VerificationResult
): Promise<void> {
  // 메트릭 저장 (Redis, DB 등)
  await saveMetric({
    questionId,
    timestamp: new Date(),
    isOnTopic: classification.isOnTopic,
    isAppropriateLevel: validation.isAppropriate,
    isVerified: verification.isVerified,
    confidence: verification.confidence
  });

  // 실시간 대시보드 업데이트
  await updateDashboard();
}

/**
 * 정확도 리포트 생성
 */
export async function generateAccuracyReport(
  timeRange: { start: Date; end: Date }
): Promise<AccuracyMetrics> {
  const metrics = await fetchMetrics(timeRange);

  return {
    totalQuestions: metrics.length,
    onTopicRate: calculateRate(metrics, m => m.isOnTopic),
    gradeLevelAccuracy: calculateRate(metrics, m => m.isAppropriateLevel),
    factAccuracy: calculateRate(metrics, m => m.isVerified),
    hallucinationRate: 100 - calculateRate(metrics, m => m.isVerified),
    averageConfidence: average(metrics.map(m => m.confidence))
  };
}
```

### 4. 지속적 개선

**Weekly Review**:
- 교과 분류 오류 케이스 분석
- 선행학습 탐지 실패 케이스 분석
- 환각 발생 케이스 분석
- 커리큘럼 DB 업데이트

**Monthly Review**:
- 전체 정확도 지표 분석
- A/B 테스트 결과 검토
- 사용자 피드백 반영
- 시스템 프롬프트 최적화

**Quarterly Review**:
- 커리큘럼 표준 업데이트
- RAG 콘텐츠 확장
- 새로운 검증 기술 도입
- 경쟁사 벤치마킹

---

## 📈 예상 성과

### 정량적 지표

| 지표 | 현재 | 목표 (4주 후) |
|------|------|-------------|
| 교과 분류 정확도 | - | > 95% |
| 타 교과 거부율 | - | 100% |
| 학년 수준 감지 정확도 | - | > 90% |
| 선행학습 거부율 | - | 100% |
| 팩트 정확도 | - | > 95% |
| 환각 발생률 | - | < 5% |
| 사용자 신뢰도 | - | > 4.5/5 |
| 응답 시간 | - | < 3초 |

### 정성적 성과

**공교육 적합성**:
- 학교 현장에서 안심하고 사용 가능
- 선행학습 유발 우려 해소
- 교사의 교육 권한 존중

**학습 효과성**:
- 정확한 정보로 신뢰 구축
- 학년 수준에 맞는 점진적 학습
- 교과 집중으로 학습 효율 향상

**사용자 경험**:
- 명확한 안내로 혼란 감소
- 적절한 리디렉션으로 만족도 향상
- 친절하고 격려하는 피드백

---

## 🎓 결론

이 계획은 전 세계 최고의 에듀테크 서비스(Khan Academy Khanmigo 등)의 검증된 기술과 최신 AI 정확도 향상 기술(RAG, Chain-of-Thought, Cross-Model Validation 등)을 결합하여, **공교육에서 안심하고 사용할 수 있는 수준의 AI 튜터**를 구현합니다.

**핵심 차별점**:
1. ✅ **철저한 교과 경계**: 영어는 영어만, 수학은 수학만
2. ✅ **선행학습 방지**: 학년 수준에 맞는 학습만 제공
3. ✅ **정확도 최우선**: 추측 금지, 팩트 기반 답변만

**구현 우선순위**:
Week 1 → Week 2 → Week 3 → Week 4 순차 진행

**성공 기준**:
- 교과 분류 정확도 > 95%
- 선행학습 거부율 100%
- 팩트 정확도 > 95%
- 사용자 만족도 > 4.5/5

이를 통해 Smart Tuter는 **학생, 학부모, 교사 모두가 신뢰할 수 있는 AI 튜터 서비스**로 자리매김할 것입니다.
