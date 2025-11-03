# AI Park 서비스 개선 계획 2025
## 우선순위별 상세 실행 계획

**작성일**: 2025-11-02
**목적**: 전 세계 에듀테크 서비스 벤치마킹 기반 사용자 경험 및 학습 효과 극대화

---

## 📋 Executive Summary

전 세계 주요 에듀테크 서비스(Khan Academy, Duolingo, Photomath, Symbolab 등) 분석 결과를 바탕으로 4개 우선순위 영역에서 개선 계획을 수립했습니다:

1. **P0 (즉시 실행)**: 로그인 프로세스 개선 + 브랜딩 변경
2. **P1 (2주 이내)**: 영어 튜터 서비스 고도화
3. **P2 (4주 이내)**: 수학 튜터 서비스 고도화
4. **P3 (지속)**: E2E 테스트 인프라 강화

---

## 🎯 우선순위 P0: 로그인 프로세스 개선 + 브랜딩 변경

### 목표
- 사용자 온보딩 마찰 최소화 (클릭 수 감소)
- 일관된 브랜드 아이덴티티 확립 (SmartTutor → AI Park)

### 현황 분석

**현재 사용자 플로우**:
```
메인 페이지 → [무료로 시작하기] → /onboarding (6단계)
→ Step 0: Welcome
→ Step 1: Experience (건너뛰기 가능)
→ Step 2: Grade Level 선택
→ Step 3: Subject 선택
→ Step 4: Nickname 입력
→ Step 5: Auth (Google/GitHub 또는 건너뛰기)
→ /dashboard
```

**문제점**:
1. 비로그인 상태에서 바로 서비스 체험을 원하는 사용자가 6단계 온보딩을 거쳐야 함
2. Step 5에서 인증을 건너뛸 수 있어 로그인이 선택적임
3. SmartTutor 브랜드명이 19개 파일에 분산되어 있음

### 개선 방안

#### 1. 로그인 프로세스 간소화

**새로운 사용자 플로우 (3가지 경로)**:

```
경로 A (빠른 시작 - 게스트):
메인 페이지 → [무료로 시작하기] → /onboarding/quick
→ 학교급 선택 (1 페이지) → 과목 선택 (1 페이지) → /dashboard (게스트 모드)

경로 B (정식 가입):
메인 페이지 → [로그인/가입] → 소셜 로그인 → /onboarding (2단계만)
→ 학교급 + 과목 선택 → /dashboard (인증된 사용자)

경로 C (기존 사용자):
메인 페이지 → [로그인] → /dashboard
```

**구현 세부사항**:

1. **HomeClient.tsx 수정**:
```typescript
// [무료로 시작하기] 버튼 동작 변경
const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();

  // 비로그인 상태: 빠른 온보딩으로 이동
  if (!isAuthenticated) {
    router.push('/onboarding/quick');
    return;
  }

  // 로그인 상태: 프로필 확인
  const hasProfile = localStorage.getItem('aipark_user_profile');
  router.push(hasProfile ? '/dashboard' : '/onboarding');
};
```

2. **빠른 온보딩 페이지 생성** (`app/onboarding/quick/page.tsx`):
```typescript
// 2단계 온보딩 (학교급 → 과목)
// Step 1: Grade Level (초/중/고/대)
// Step 2: Subject (영어/수학)
// → 게스트 프로필 생성 후 /dashboard 이동
// → 상단에 "회원가입하고 학습 기록 저장하기" CTA 표시
```

3. **게스트 모드 구현**:
- 로컬스토리지 기반 임시 프로필
- 세션 종료 시 학습 데이터 손실 경고
- 대시보드 상단에 "지금 가입하고 진도 저장하기" 배너

#### 2. 브랜딩 변경 (SmartTutor → AI Park)

**변경 대상 파일** (19개 파일):
```
components/navigation/TopNavigation.tsx
components/onboarding/WelcomeStep.tsx
components/onboarding/ExperienceStep.tsx
app/HomeClient.tsx (이미 AI Park 적용됨)
+ 16개 문서 파일 (claudedocs/*)
```

**체계적 변경 전략**:
1. **소스 코드 우선**: 모든 .tsx, .ts 파일에서 "SmartTutor" → "AI Park" 치환
2. **로컬스토리지 키 변경**: `smarttutor_*` → `aipark_*` (마이그레이션 스크립트 필요)
3. **메타데이터 업데이트**: package.json, manifest.ts, robots.txt, sitemap.xml
4. **문서 동기화**: claudedocs/ 폴더 내 모든 마크다운 파일

**마이그레이션 스크립트** (`scripts/migrate-branding.ts`):
```typescript
// 기존 사용자 로컬스토리지 데이터 보존
const oldKeys = ['smarttutor_user_profile', 'smarttutor_onboarding_progress'];
const newKeys = ['aipark_user_profile', 'aipark_onboarding_progress'];

oldKeys.forEach((oldKey, i) => {
  const data = localStorage.getItem(oldKey);
  if (data) {
    localStorage.setItem(newKeys[i], data);
    localStorage.removeItem(oldKey);
  }
});
```

### 성공 지표

1. **온보딩 완료율**: 현재 추정 60% → 목표 85%
2. **첫 튜터 세션 도달 시간**: 현재 ~3분 → 목표 <1분
3. **게스트 → 가입 전환율**: 목표 30%
4. **브랜드 일관성**: 100% (모든 UI에서 "AI Park" 표시)

### 구현 일정

| 작업 | 소요 시간 | 담당 |
|------|----------|------|
| 빠른 온보딩 페이지 개발 | 4시간 | 프론트엔드 |
| 게스트 모드 로직 구현 | 3시간 | 백엔드 |
| 브랜딩 일괄 변경 스크립트 | 2시간 | DevOps |
| 마이그레이션 테스트 | 2시간 | QA |
| **총 소요 시간** | **11시간** | **1-2일** |

---

## 🗣️ 우선순위 P1: 영어 튜터 서비스 고도화

### 벤치마킹 인사이트

**글로벌 선도 서비스 분석**:

| 서비스 | 핵심 기능 | 가격 | 차별화 포인트 |
|--------|----------|------|--------------|
| **Duolingo Max** | AI 롤플레이, 설명형 답변, 적응형 학습 경로 | $30/월 | GPT-4 기반, 게이미피케이션 |
| **Langua** | 실시간 음성 대화, 발음 피드백, 무제한 연습 | $13-29/월 | 음성 기술 특화 |
| **BoldVoice** | 할리우드 코치 기반, AI 음성 분석, 즉시 피드백 | - | 액센트 교정 전문 |
| **ELSA Speak** | 7,100+ 레슨, 음절 강세, 억양 분석 | - | 발음 정확도 극대화 |
| **Pronounce AI** | 실시간 대화 + 상세 발음 피드백 | - | 통합 AI 튜터 |

**주요 트렌드 2025**:
1. **초개인화 학습**: 감정 감지 AI로 좌절/흥분 감지 후 레슨 조정
2. **VR/AR 몰입형 연습**: 가상 환경에서 실제 대화 시뮬레이션
3. **고급 발음 분석**: 음소 단위 분석 + 시각적 피드백
4. **AI 비디오 콜**: 아바타 튜터와 화상 대화 연습
5. **게이미피케이션 강화**: 스트릭, 배지, 리그 시스템

### 현재 AI Park 영어 튜터 기능

**기존 기능**:
- ✅ 실시간 음성 인식 (Web Speech API)
- ✅ 학교급별 시스템 프롬프트
- ✅ N턴 대화 기록
- ✅ 학습 리포트 생성

**부족한 부분**:
- ❌ OCR 기반 이미지 문제 풀이
- ❌ 발음 정확도 분석 (음소 단위)
- ❌ 적응형 난이도 조정
- ❌ 실시간 문법 교정
- ❌ 롤플레이 시나리오
- ❌ 학습 경로 추천

### 개선 계획

#### 1. OCR 기반 이미지 학습 기능

**목표**: 영어 문제, 단어, 지문 이미지를 업로드하면 즉시 튜터링

**기술 스택**:
- **OCR Engine**: Google Cloud Vision API (98% 정확도, 200+ 언어 지원)
- **Fallback**: Tesseract OCR (오픈소스, 무료)
- **통합**: 기존 `/api/vision/recognize` 엔드포인트 활용

**구현 단계**:

1. **이미지 업로드 UI 개선** (`components/chat/ImageUploadWithRecognition.tsx`):
```typescript
// 현재: 수학 문제 전용
// 개선: 영어 텍스트 인식 모드 추가

interface OCRResult {
  text: string;
  language: string; // 'en', 'ko', 'mixed'
  confidence: number;
  type: 'math' | 'text' | 'mixed';
}

const handleImageUpload = async (image: File) => {
  // 1. OCR 실행
  const ocrResult = await recognizeImage(image);

  // 2. 텍스트 타입 분류
  if (ocrResult.type === 'text') {
    // 영어 지문/문제/단어로 분류
    const classification = await classifyEnglishContent(ocrResult.text);

    // 3. 튜터에게 컨텍스트 전달
    sendToTutor({
      type: classification.type, // 'reading', 'vocabulary', 'grammar'
      content: ocrResult.text,
      userQuery: "이 문제를 설명해주세요"
    });
  }
};
```

2. **OCR API 엔드포인트 확장** (`app/api/vision/recognize/route.ts`):
```typescript
// 기존: 수학 수식 인식 (LaTeX 변환)
// 추가: 영어 텍스트 인식 (구조화된 출력)

export async function POST(req: Request) {
  const { image, mode } = await req.json(); // mode: 'math' | 'english'

  if (mode === 'english') {
    // Google Vision API - Text Detection
    const ocrResult = await visionClient.textDetection(image);

    return {
      text: ocrResult.fullTextAnnotation.text,
      language: detectLanguage(ocrResult.text),
      structure: analyzeStructure(ocrResult), // 문단, 문장, 단어 구조
      vocabulary: extractVocabulary(ocrResult.text),
      confidence: ocrResult.confidence
    };
  }
}
```

3. **튜터 시스템 프롬프트 강화**:
```typescript
// lib/tutor/system-prompt-generator.ts

const englishTutorPrompt = `
...기존 프롬프트...

## 이미지 기반 학습 처리
사용자가 이미지로 영어 문제를 제공하면:
1. **독해 문제**: 지문 요약 → 문제 분석 → 단계별 풀이 전략
2. **문법 문제**: 문법 규칙 설명 → 예시 제공 → 정답 근거
3. **어휘 문제**: 단어 뜻 + 어원 + 활용 예문 3개
4. **작문 문제**: 샘플 답안 → 구조 분석 → 개선 방안

**중요**: 답만 주지 말고 "왜 그런지" 설명하기
`;
```

#### 2. 고급 발음 분석 시스템

**목표**: 음소 단위 발음 정확도 분석 + 실시간 시각적 피드백

**기술 스택**:
- **Speech Recognition**: Web Speech API (현재) → Google Cloud Speech-to-Text API (업그레이드)
- **발음 분석**: Pronounce AI SDK 또는 자체 음소 분석 모델
- **시각화**: Waveform + 음소별 색상 코딩

**구현 단계**:

1. **고급 음성 인식 서비스 통합**:
```typescript
// app/api/pronunciation/analyze/route.ts

import speech from '@google-cloud/speech';

export async function POST(req: Request) {
  const { audioBlob, expectedText, schoolLevel } = await req.json();

  // 1. 음성 → 텍스트 변환 (음소 정보 포함)
  const [response] = await speechClient.recognize({
    audio: { content: audioBlob },
    config: {
      encoding: 'WEBM_OPUS',
      languageCode: 'en-US',
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      enableAutomaticPunctuation: true,
      model: 'latest_long', // 최신 모델
    }
  });

  // 2. 발음 정확도 분석
  const analysis = analyzePronunciation(
    response.results[0].alternatives[0],
    expectedText,
    schoolLevel
  );

  return {
    transcription: response.results[0].alternatives[0].transcript,
    accuracy: analysis.overallScore, // 0-100
    phonemes: analysis.phonemeScores, // 음소별 점수
    improvements: analysis.suggestions, // 개선 제안
    visualData: analysis.waveformData // 시각화 데이터
  };
}
```

2. **발음 피드백 UI 컴포넌트** (`components/pronunciation/PronunciationFeedback.tsx`):
```typescript
interface PronunciationResult {
  word: string;
  expected: string;
  actual: string;
  score: number; // 0-100
  phonemeBreakdown: {
    phoneme: string;
    score: number;
    color: 'green' | 'yellow' | 'red';
  }[];
}

export function PronunciationFeedback({ result }: Props) {
  return (
    <div className="pronunciation-analysis">
      <div className="overall-score">
        <CircularProgress value={result.score} />
        <span>{result.score}점</span>
      </div>

      <div className="word-breakdown">
        {result.expected.split('').map((char, i) => (
          <span
            key={i}
            className={`phoneme phoneme-${result.phonemeBreakdown[i].color}`}
          >
            {char}
          </span>
        ))}
      </div>

      <div className="improvements">
        {result.phonemeBreakdown
          .filter(p => p.score < 80)
          .map(p => (
            <div className="tip">
              <strong>{p.phoneme}</strong>: {getImprovementTip(p.phoneme)}
            </div>
          ))}
      </div>
    </div>
  );
}
```

#### 3. 적응형 학습 경로 시스템

**목표**: 사용자 수준 자동 감지 + 동적 난이도 조정

**알고리즘**:
```typescript
// lib/adaptive-learning/english-level-detector.ts

interface UserPerformance {
  vocabulary: number; // 0-100
  grammar: number;
  pronunciation: number;
  comprehension: number;
}

function detectEnglishLevel(history: ChatMessage[]): {
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  performance: UserPerformance;
  nextTopics: string[];
} {
  // 1. 대화 히스토리 분석
  const vocabulary = analyzeVocabularyLevel(history);
  const grammar = analyzeGrammarAccuracy(history);
  const pronunciation = analyzePronunciationHistory(history);

  // 2. CEFR 레벨 매핑
  const avgScore = (vocabulary + grammar + pronunciation) / 3;
  const cefr = mapScoreToCEFR(avgScore);

  // 3. 추천 학습 주제
  const weakAreas = findWeakAreas({ vocabulary, grammar, pronunciation });
  const nextTopics = generateLearningPath(cefr, weakAreas);

  return { cefr, performance: { vocabulary, grammar, pronunciation }, nextTopics };
}
```

**UI 통합**:
```typescript
// components/tutor-pages/EnglishTutorClient.tsx

useEffect(() => {
  if (messages.length >= 10) { // 10턴마다 레벨 재평가
    const level = detectEnglishLevel(messages);

    // 레벨 변화 감지
    if (level.cefr !== currentLevel) {
      showLevelUpNotification(level.cefr);
      adjustDifficulty(level.cefr);
    }

    // 학습 추천
    setRecommendedTopics(level.nextTopics);
  }
}, [messages.length]);
```

#### 4. 롤플레이 시나리오 기능

**목표**: 실제 상황 기반 대화 연습 (Duolingo Roleplay 벤치마킹)

**시나리오 예시**:
```typescript
const roleplayScenarios = [
  {
    id: 'airport-checkin',
    title: '공항 체크인',
    level: 'A2',
    tutor_role: 'airport_staff',
    user_role: 'passenger',
    objective: '탑승권 받고 수하물 체크인하기',
    evaluation_criteria: ['politeness', 'vocabulary', 'task_completion']
  },
  {
    id: 'job-interview',
    title: '영어 면접',
    level: 'B2',
    tutor_role: 'interviewer',
    user_role: 'candidate',
    objective: '자기소개 + 경력 설명 + 질문 답변',
    evaluation_criteria: ['fluency', 'professionalism', 'coherence']
  }
];
```

**시스템 프롬프트**:
```typescript
const roleplayPrompt = `
You are playing the role of ${scenario.tutor_role}.
The user is ${scenario.user_role}.
Scenario: ${scenario.title}

Your task:
1. Stay in character throughout the conversation
2. Guide the user to complete: ${scenario.objective}
3. Provide natural responses as a real ${scenario.tutor_role} would
4. After 5-7 exchanges, evaluate based on: ${scenario.evaluation_criteria.join(', ')}
5. Give constructive feedback in Korean

Example conversation start:
You: "Hello! Welcome to the airport. May I see your passport and ticket?"
`;
```

### 성공 지표

1. **OCR 기능 사용률**: 목표 40% (전체 세션 중)
2. **발음 분석 정확도**: 목표 >90% (Google Speech-to-Text 기준)
3. **적응형 학습 효과**: 목표 20% 성적 향상 (4주 기준)
4. **롤플레이 완료율**: 목표 60%
5. **사용자 만족도**: 목표 4.5/5

### 구현 일정

| Phase | 작업 | 소요 시간 |
|-------|------|----------|
| Phase 1.1 | OCR 통합 + 이미지 업로드 UI | 12시간 |
| Phase 1.2 | 발음 분석 시스템 | 16시간 |
| Phase 1.3 | 적응형 학습 알고리즘 | 20시간 |
| Phase 1.4 | 롤플레이 시나리오 (10개) | 24시간 |
| **총 소요 시간** | | **72시간 (2주)** |

---

## 📐 우선순위 P2: 수학 튜터 서비스 고도화

### 벤치마킹 인사이트

**글로벌 선도 서비스 분석**:

| 서비스 | 핵심 기능 | 가격 | 차별화 포인트 |
|--------|----------|------|--------------|
| **Photomath** | OCR + 단계별 풀이, 애니메이션 설명 | $2.99-19.99/월 | 손글씨 인식 98% 정확도 |
| **Symbolab** | 고급 수학 (미적분, 통계), LaTeX 지원 | $4.99/월 | 대학 수준 수학 특화 |
| **Mathpix** | 수식 OCR (99% 정확도), LaTeX 변환 | API 기반 | 수식 인식 업계 1위 |
| **Wolfram Alpha** | 복잡한 방정식, 그래프 생성, 단계별 풀이 | - | 계산 엔진 + 교육 |
| **Microsoft Math Solver** | 무료, OCR, 다국어 지원 | 무료 | Microsoft 기술 지원 |

**주요 트렌드 2025**:
1. **시각화 강화**: 동적 그래프, 3D 모델, 인터랙티브 조작
2. **AI 평가**: 풀이 과정 분석 + 부분 점수 + 오류 진단
3. **개념 연결**: 문제 → 관련 개념 → 추천 학습 자료
4. **협업 학습**: 학생 간 문제 공유 + 토론
5. **마이크로러닝**: 5분 단위 개념 학습 모듈

### 현재 AI Park 수학 튜터 기능

**기존 기능**:
- ✅ 텍스트 기반 수학 문제 풀이
- ✅ 학교급별 맞춤 설명
- ✅ LaTeX 수식 렌더링
- ✅ 수학 시각화 (Math Visualization 페이지)

**부족한 부분**:
- ❌ OCR 기반 손글씨 수학 문제 인식
- ❌ 단계별 풀이 과정 자동 생성
- ❌ 인터랙티브 그래프 조작
- ❌ 오답 원인 진단
- ❌ 개념 학습 경로 추천

### 개선 계획

#### 1. OCR 기반 수학 문제 인식 (손글씨 지원)

**목표**: 손글씨/인쇄된 수학 문제를 촬영하면 LaTeX로 변환 후 즉시 풀이

**기술 스택**:
- **Primary OCR**: Mathpix API (99% 정확도, 손글씨 특화)
- **Fallback**: Google Vision API + Custom Math Parser
- **LaTeX Renderer**: KaTeX (기존 사용 중)

**구현 단계**:

1. **Mathpix API 통합**:
```typescript
// app/api/ocr/mathpix/route.ts

import axios from 'axios';

export async function POST(req: Request) {
  const { imageBase64 } = await req.json();

  // Mathpix API 호출
  const response = await axios.post(
    'https://api.mathpix.com/v3/text',
    {
      src: `data:image/jpeg;base64,${imageBase64}`,
      formats: ['text', 'latex_styled', 'asciimath'],
      metadata: {
        include_detected_alphabets: true,
        include_line_data: true
      }
    },
    {
      headers: {
        'app_id': process.env.MATHPIX_APP_ID,
        'app_key': process.env.MATHPIX_APP_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    latex: response.data.latex_styled,
    plainText: response.data.text,
    confidence: response.data.confidence,
    detectedElements: response.data.detected_alphabets // 검출된 수식 요소
  };
}
```

2. **이미지 업로드 UI** (`components/math/MathImageUpload.tsx`):
```typescript
export function MathImageUpload() {
  const [ocrResult, setOcrResult] = useState<MathOCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageCapture = async (file: File) => {
    setIsProcessing(true);

    // 1. 이미지 → Base64
    const base64 = await fileToBase64(file);

    // 2. OCR 실행
    const result = await fetch('/api/ocr/mathpix', {
      method: 'POST',
      body: JSON.stringify({ imageBase64: base64 })
    }).then(r => r.json());

    setOcrResult(result);

    // 3. 튜터에게 전달
    if (result.confidence > 0.8) {
      onMathProblemDetected({
        latex: result.latex,
        plainText: result.plainText,
        imageUrl: URL.createObjectURL(file)
      });
    } else {
      // 신뢰도 낮으면 수동 확인 요청
      setShowConfirmDialog(true);
    }

    setIsProcessing(false);
  };

  return (
    <div className="math-image-upload">
      <ImageCapture onCapture={handleImageCapture} />

      {isProcessing && <LoadingSpinner text="수학 문제 인식 중..." />}

      {ocrResult && (
        <div className="ocr-preview">
          <h4>인식된 수식:</h4>
          <MathRenderer latex={ocrResult.latex} />
          <p>신뢰도: {(ocrResult.confidence * 100).toFixed(1)}%</p>

          <button onClick={() => confirmAndSend(ocrResult)}>
            이 문제로 시작하기
          </button>
        </div>
      )}
    </div>
  );
}
```

#### 2. 단계별 풀이 생성 시스템

**목표**: Photomath 스타일 단계별 애니메이션 풀이

**시스템 프롬프트 강화**:
```typescript
// lib/tutor/system-prompt-generator.ts - 수학 튜터 전용

const mathTutorPrompt = `
...기존 프롬프트...

## 단계별 풀이 생성 규칙

모든 수학 문제는 다음 형식으로 단계별 풀이를 제공하세요:

**문제**: [LaTeX 형식 문제]

**풀이 과정**:

### Step 1: [단계 제목]
[설명]
$$[수식 변환]$$

### Step 2: [단계 제목]
[설명]
$$[수식 변환]$$

...

**최종 답**: $$[답]$$

**개념 설명**: [관련 개념 3줄 요약]
**유사 문제**: [연습할 수 있는 유사 문제 1개]

예시:
문제: $$2x + 5 = 13$$

Step 1: 양변에서 5를 빼기
$$2x + 5 - 5 = 13 - 5$$
$$2x = 8$$

Step 2: 양변을 2로 나누기
$$\\frac{2x}{2} = \\frac{8}{2}$$
$$x = 4$$

최종 답: $$x = 4$$
`;
```

**풀이 과정 애니메이션**:
```typescript
// components/math/StepByStepSolution.tsx

export function StepByStepSolution({ steps }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateToNextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="step-solution">
      <div className="progress-bar">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i <= currentStep ? 'active' : ''}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="step-content"
        >
          <h3>{steps[currentStep].title}</h3>
          <p>{steps[currentStep].explanation}</p>
          <MathRenderer latex={steps[currentStep].equation} />
        </motion.div>
      </AnimatePresence>

      <div className="controls">
        <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
          이전 단계
        </button>
        <button onClick={animateToNextStep} disabled={currentStep === steps.length - 1}>
          다음 단계
        </button>
      </div>
    </div>
  );
}
```

#### 3. 인터랙티브 수학 시각화

**목표**: Desmos/GeoGebra 스타일 조작 가능한 그래프

**기술 스택**:
- **그래프 라이브러리**: Plotly.js (이미 사용 중) + Mafs (React 전용)
- **3D 시각화**: Three.js (입체 도형, 3D 그래프)
- **애니메이션**: Framer Motion

**구현 예시**:
```typescript
// components/math/InteractiveGraph.tsx

import { Mafs, Coordinates, Plot, Point, useMovablePoint } from 'mafs';

export function InteractiveQuadraticGraph() {
  const a = useMovablePoint([0, 1]); // 계수 a 조작

  return (
    <Mafs>
      <Coordinates.Cartesian />
      <Plot.OfX
        y={(x) => a.point[1] * x * x}
        color="blue"
      />
      <Point {...a} color="red" />

      <text x={a.point[0]} y={a.point[1] + 0.5}>
        a = {a.point[1].toFixed(2)}
      </text>
    </Mafs>
  );
}
```

**통합 전략**:
```typescript
// lib/math/visualization-generator.ts

function generateVisualization(problem: string, solution: string) {
  // 문제 유형 감지
  const type = detectProblemType(problem); // 'quadratic', 'linear', 'geometry', etc.

  switch (type) {
    case 'quadratic':
      return <InteractiveQuadraticGraph equation={extractEquation(problem)} />;
    case 'geometry':
      return <GeometryCanvas shapes={extractShapes(problem)} />;
    case 'calculus':
      return <DerivativeGraph function={extractFunction(problem)} />;
    default:
      return <StaticMathRenderer latex={solution} />;
  }
}
```

#### 4. 오답 원인 진단 시스템

**목표**: 학생이 틀린 이유를 AI가 분석하여 맞춤 피드백

**알고리즘**:
```typescript
// lib/math/error-diagnosis.ts

interface ErrorDiagnosis {
  category: 'calculation' | 'concept' | 'careless' | 'method';
  specificError: string;
  conceptGap: string[];
  recommendation: string;
}

function diagnoseError(
  problem: string,
  studentAnswer: string,
  correctAnswer: string,
  workingProcess?: string
): ErrorDiagnosis {
  // 1. 답 비교
  const answerDiff = compareAnswers(studentAnswer, correctAnswer);

  // 2. 풀이 과정 분석 (있는 경우)
  if (workingProcess) {
    const steps = parseSteps(workingProcess);
    const errorStep = findFirstError(steps, correctSolution);

    return {
      category: classifyError(errorStep),
      specificError: `Step ${errorStep.index}에서 ${errorStep.mistake}`,
      conceptGap: identifyMissingConcepts(errorStep),
      recommendation: generateRecommendation(errorStep)
    };
  }

  // 3. 답만 있는 경우 패턴 분석
  return analyzeAnswerPattern(problem, studentAnswer, correctAnswer);
}
```

**UI 통합**:
```typescript
// components/math/ErrorFeedback.tsx

export function ErrorFeedback({ diagnosis }: Props) {
  return (
    <div className="error-feedback">
      <div className={`error-badge ${diagnosis.category}`}>
        {getErrorIcon(diagnosis.category)}
        {getErrorLabel(diagnosis.category)}
      </div>

      <h4>무엇이 문제였나요?</h4>
      <p>{diagnosis.specificError}</p>

      <h4>복습이 필요한 개념</h4>
      <ul>
        {diagnosis.conceptGap.map(concept => (
          <li key={concept}>
            <Link href={`/concept/${concept}`}>{concept}</Link>
          </li>
        ))}
      </ul>

      <h4>추천 학습</h4>
      <p>{diagnosis.recommendation}</p>

      <button onClick={() => loadSimilarProblem()}>
        비슷한 문제 다시 풀기
      </button>
    </div>
  );
}
```

### 성공 지표

1. **OCR 인식 정확도**: 목표 >95% (Mathpix 기준)
2. **단계별 풀이 만족도**: 목표 4.6/5
3. **시각화 사용률**: 목표 50% (그래프 문제에서)
4. **오답 진단 정확도**: 목표 >85%
5. **학습 성과**: 목표 30% 정답률 향상 (4주 기준)

### 구현 일정

| Phase | 작업 | 소요 시간 |
|-------|------|----------|
| Phase 2.1 | Mathpix OCR 통합 | 10시간 |
| Phase 2.2 | 단계별 풀이 시스템 | 16시간 |
| Phase 2.3 | 인터랙티브 시각화 (5개 유형) | 24시간 |
| Phase 2.4 | 오답 진단 알고리즘 | 18시간 |
| **총 소요 시간** | | **68시간 (2주)** |

---

## 🧪 우선순위 P3: E2E 테스트 인프라 강화

### 목표
- 모든 주요 사용자 플로우에 대한 자동화 테스트
- 배포 전 품질 게이트 확립
- 회귀 버그 방지

### 현재 상태

**기존 테스트**:
```
tests/e2e/
├── landing.spec.ts         ✅ 메인 페이지 기본 테스트
├── onboarding.spec.ts      ✅ 온보딩 플로우
├── tutor-flow.spec.ts      ✅ 튜터 세션 시작
├── dashboard-navigation.spec.ts ✅ 대시보드 내비게이션
└── tutor-ui.spec.ts        ✅ 튜터 UI 상호작용
```

**커버리지 부족 영역**:
- ❌ OCR 이미지 업로드 플로우
- ❌ 발음 분석 기능
- ❌ 학습 리포트 생성
- ❌ 프로필 관리
- ❌ 에러 핸들링 시나리오

### 테스트 전략

#### 1. 핵심 사용자 플로우 (Critical Path)

**우선순위 1 테스트**:
```typescript
// tests/e2e/critical-paths/guest-to-dashboard.spec.ts

test.describe('게스트 사용자 → 대시보드 플로우', () => {
  test('빠른 시작으로 게스트 모드 진입', async ({ page }) => {
    // 1. 메인 페이지 방문
    await page.goto('/');

    // 2. [무료로 시작하기] 클릭
    await page.click('text=무료로 시작하기');

    // 3. 빠른 온보딩 페이지 확인
    await expect(page).toHaveURL('/onboarding/quick');

    // 4. 학교급 선택 (중학교)
    await page.click('text=중학교');
    await page.click('text=다음');

    // 5. 과목 선택 (영어)
    await page.click('text=영어');
    await page.click('text=시작하기');

    // 6. 대시보드 도달 확인
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=환영합니다')).toBeVisible();

    // 7. 게스트 모드 배너 확인
    await expect(page.locator('text=지금 가입하고 진도 저장하기')).toBeVisible();
  });
});
```

**우선순위 2 테스트**:
```typescript
// tests/e2e/critical-paths/image-ocr-tutor.spec.ts

test.describe('이미지 OCR → 튜터 질문 플로우', () => {
  test.use({ storageState: 'tests/.auth/user.json' }); // 인증된 사용자

  test('영어 문제 이미지 업로드 후 풀이', async ({ page }) => {
    // 1. 영어 튜터 진입
    await page.goto('/dashboard/english');

    // 2. 이미지 업로드 버튼 클릭
    await page.click('[data-testid="image-upload-button"]');

    // 3. 테스트 이미지 선택
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=파일 선택');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/english-problem.jpg');

    // 4. OCR 처리 대기
    await expect(page.locator('text=인식 중...')).toBeVisible();
    await page.waitForSelector('[data-testid="ocr-result"]', { timeout: 10000 });

    // 5. 인식된 텍스트 확인
    const ocrText = await page.locator('[data-testid="ocr-result"]').textContent();
    expect(ocrText).toContain('What is the main idea');

    // 6. 튜터에게 전송
    await page.click('text=이 문제로 시작하기');

    // 7. AI 응답 대기
    await expect(page.locator('.ai-message')).toBeVisible({ timeout: 15000 });

    // 8. 응답 내용 검증
    const aiResponse = await page.locator('.ai-message').first().textContent();
    expect(aiResponse).toContain('주요 내용'); // 한국어 응답 확인
  });

  test('수학 문제 손글씨 OCR 후 단계별 풀이', async ({ page }) => {
    await page.goto('/dashboard/math');

    // 카메라로 촬영 시뮬레이션
    await page.click('[data-testid="camera-capture"]');
    const fileChooser = await page.waitForEvent('filechooser');
    await fileChooser.setFiles('tests/fixtures/handwritten-math.jpg');

    // Mathpix OCR 대기 (손글씨)
    await page.waitForSelector('[data-testid="latex-preview"]', { timeout: 15000 });

    // LaTeX 수식 확인
    const latex = await page.getAttribute('[data-testid="latex-preview"]', 'data-latex');
    expect(latex).toMatch(/\\frac|\\sqrt|\\int/); // 수식 포함 확인

    // 풀이 요청
    await page.click('text=풀이 보기');

    // 단계별 풀이 확인
    await expect(page.locator('text=Step 1:')).toBeVisible();
    await expect(page.locator('text=Step 2:')).toBeVisible();

    // 다음 단계 애니메이션 테스트
    await page.click('text=다음 단계');
    await expect(page.locator('[data-testid="current-step"]')).toHaveText('2');
  });
});
```

#### 2. 성능 테스트

```typescript
// tests/e2e/performance/tutor-response-time.spec.ts

test.describe('튜터 응답 시간 성능', () => {
  test('영어 튜터 첫 응답 < 3초', async ({ page }) => {
    await page.goto('/dashboard/english');

    // 성능 측정 시작
    const startTime = Date.now();

    // 질문 전송
    await page.fill('[data-testid="chat-input"]', 'What is a noun?');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // 응답 대기
    await page.waitForSelector('.ai-message', { timeout: 5000 });

    const responseTime = Date.now() - startTime;

    // 3초 이내 응답 확인
    expect(responseTime).toBeLessThan(3000);

    console.log(`응답 시간: ${responseTime}ms`);
  });

  test('OCR 처리 시간 < 5초', async ({ page }) => {
    await page.goto('/dashboard/math');

    const startTime = Date.now();

    // 이미지 업로드
    const fileChooser = await page.waitForEvent('filechooser');
    await page.click('[data-testid="image-upload"]');
    await fileChooser.setFiles('tests/fixtures/math-equation.png');

    // OCR 완료 대기
    await page.waitForSelector('[data-testid="ocr-complete"]');

    const ocrTime = Date.now() - startTime;

    expect(ocrTime).toBeLessThan(5000);

    console.log(`OCR 시간: ${ocrTime}ms`);
  });
});
```

#### 3. 접근성 테스트

```typescript
// tests/e2e/accessibility/a11y.spec.ts

import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('접근성 검사', () => {
  test('메인 페이지 WCAG 2.1 AA 준수', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);

    // 접근성 검사 실행
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('튜터 인터페이스 키보드 네비게이션', async ({ page }) => {
    await page.goto('/dashboard/english');

    // Tab 키로 모든 인터랙티브 요소 접근 가능
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Enter로 채팅 전송
    await page.fill('[data-testid="chat-input"]', 'Hello');
    await page.keyboard.press('Enter');

    await expect(page.locator('.user-message')).toHaveText('Hello');
  });
});
```

#### 4. 크로스 브라우저 테스트

```typescript
// playwright.config.ts 확장

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

#### 5. 시각적 회귀 테스트

```typescript
// tests/e2e/visual/screenshot-comparison.spec.ts

test.describe('시각적 회귀 테스트', () => {
  test('대시보드 레이아웃 일관성', async ({ page }) => {
    await page.goto('/dashboard');

    // 스크린샷 촬영 및 비교
    await expect(page).toHaveScreenshot('dashboard-layout.png', {
      maxDiffPixels: 100 // 100px 이하 차이 허용
    });
  });

  test('튜터 채팅 UI 일관성', async ({ page }) => {
    await page.goto('/dashboard/english');

    // 메시지 몇 개 추가
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message');

    await expect(page).toHaveScreenshot('tutor-chat-ui.png');
  });
});
```

### CI/CD 통합

**GitHub Actions 워크플로우**:
```yaml
# .github/workflows/e2e-tests.yml

name: E2E Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    strategy:
      matrix:
        browser: [chromium, firefox, webkit]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          GOOGLE_GEMINI_API_KEY: ${{ secrets.GOOGLE_GEMINI_API_KEY }}
          MATHPIX_APP_ID: ${{ secrets.MATHPIX_APP_ID }}
          MATHPIX_APP_KEY: ${{ secrets.MATHPIX_APP_KEY }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30
```

### 성공 지표

1. **테스트 커버리지**: 목표 >80% (핵심 플로우)
2. **테스트 실행 시간**: 목표 <10분 (전체 스위트)
3. **Flaky Test 비율**: 목표 <5%
4. **버그 탐지율**: 목표 >90% (배포 전)

### 구현 일정

| 작업 | 소요 시간 |
|------|----------|
| 핵심 플로우 테스트 10개 | 16시간 |
| 성능 테스트 5개 | 8시간 |
| 접근성 테스트 | 6시간 |
| 시각적 회귀 테스트 | 6시간 |
| CI/CD 통합 | 4시간 |
| **총 소요 시간** | **40시간 (1주)** |

---

## 📊 종합 실행 계획

### Phase별 우선순위 및 일정

```
┌─────────────────────────────────────────────────────────────┐
│ Timeline: 6주 계획                                           │
├─────────────────────────────────────────────────────────────┤
│ Week 1-2: P0 (로그인 개선 + 브랜딩) + P1 시작                │
│   Day 1-2:   빠른 온보딩 개발 (11시간)                       │
│   Day 3-7:   영어 OCR 통합 (12시간)                          │
│   Day 8-10:  발음 분석 시스템 (16시간)                       │
│                                                              │
│ Week 3-4: P1 완료 + P2 시작                                  │
│   Day 11-15: 적응형 학습 + 롤플레이 (44시간)                │
│   Day 16-18: 수학 OCR 통합 (10시간)                          │
│   Day 19-21: 단계별 풀이 시스템 (16시간)                     │
│                                                              │
│ Week 5-6: P2 완료 + P3                                       │
│   Day 22-26: 인터랙티브 시각화 (24시간)                      │
│   Day 27-29: 오답 진단 시스템 (18시간)                       │
│   Day 30-35: E2E 테스트 인프라 (40시간)                      │
│                                                              │
│ Week 7: QA & 배포                                            │
│   Day 36-38: 통합 테스트 및 버그 수정                        │
│   Day 39-40: 프로덕션 배포 및 모니터링                       │
└─────────────────────────────────────────────────────────────┘
```

### 리소스 요구사항

**외부 서비스 계정**:
1. ✅ Google Cloud Platform (Vision API, Speech-to-Text API)
2. ⚠️ Mathpix API (수학 OCR) - 신규 가입 필요
3. ✅ Vercel (배포)
4. ✅ Sentry (에러 모니터링)

**예상 비용** (월간):
- Google Cloud Vision: ~$50 (1만 요청 기준)
- Google Speech-to-Text: ~$100 (5만 분 기준)
- Mathpix API: ~$99/월 (Standard 플랜)
- **총 예상**: ~$250/월

### KPI 및 성과 측정

**사용자 경험 지표**:
- 온보딩 완료율: 60% → 85%
- 첫 튜터 세션 도달 시간: 3분 → <1분
- 세션당 평균 사용 시간: 10분 → 20분
- 주간 활성 사용자 재방문율: 40% → 65%

**학습 효과 지표**:
- 문제 정답률 향상: 20% (4주 기준)
- 발음 점수 향상: 15점 (100점 만점 기준, 4주)
- 사용자 만족도: 4.5/5
- NPS (Net Promoter Score): >50

**기술 지표**:
- 튜터 응답 시간: <3초
- OCR 처리 시간: <5초
- 앱 로딩 시간: <2초
- 에러율: <1%

---

## 🎯 다음 단계 (Next Steps)

### 즉시 실행 가능한 작업

1. **P0 시작** (오늘 착수 가능):
   - [ ] `/app/onboarding/quick/page.tsx` 생성
   - [ ] HomeClient.tsx 버튼 로직 수정
   - [ ] 브랜딩 일괄 변경 스크립트 실행

2. **계정 설정**:
   - [ ] Mathpix 계정 가입 및 API 키 발급
   - [ ] Google Cloud Speech-to-Text API 활성화
   - [ ] 환경 변수 `.env.local` 업데이트

3. **팀 조율**:
   - [ ] 개발 일정 검토 및 조정
   - [ ] 디자인 리소스 요청 (새 온보딩 페이지)
   - [ ] QA 계획 수립

---

## 📎 참고 자료

### 벤치마크 서비스 링크
- [Khan Academy Khanmigo](https://www.khanacademy.org/khanmigo)
- [Duolingo Max](https://www.duolingo.com/max)
- [Photomath](https://photomath.com/)
- [Mathpix](https://mathpix.com/)
- [Langua AI Tutor](https://langua.io/)

### 기술 문서
- [Google Cloud Vision API](https://cloud.google.com/vision/docs/ocr)
- [Google Speech-to-Text API](https://cloud.google.com/speech-to-text/docs)
- [Mathpix API Reference](https://docs.mathpix.com/)
- [Playwright Testing](https://playwright.dev/)

### 내부 문서
- [Phase 14 완료 보고서](claudedocs/PHASE_14_COMPLETE.md)
- [배포 가이드](PRODUCTION_DEPLOYMENT_GUIDE.md)
- [성능 최적화 분석](claudedocs/performance-optimization-analysis.md)

---

**문서 버전**: 1.0
**최종 수정**: 2025-11-02
**작성자**: Claude (SuperClaude Framework)
**승인 대기**: Product Owner
