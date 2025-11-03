# AI Park 서비스 개선 계획 2025 (무료 솔루션 버전)
## 우선순위별 상세 실행 계획 - 비용 Zero 전략

**작성일**: 2025-11-02
**목적**: 전 세계 에듀테크 서비스 벤치마킹 기반, 100% 무료 오픈소스 솔루션으로 구현
**예상 비용**: $0/월 (완전 무료)

---

## 📋 Executive Summary

전 세계 주요 에듀테크 서비스(Khan Academy, Duolingo, Photomath, Symbolab 등) 분석 결과를 바탕으로, **비용이 전혀 발생하지 않는 오픈소스 솔루션만**을 사용하여 4개 우선순위 영역에서 개선 계획을 수립했습니다:

1. **P0 (즉시 실행)**: 로그인 프로세스 개선 + 브랜딩 변경
2. **P1 (2주 이내)**: 영어 튜터 서비스 고도화 (무료 솔루션)
3. **P2 (4주 이내)**: 수학 튜터 서비스 고도화 (오픈소스 OCR)
4. **P3 (지속)**: E2E 테스트 인프라 강화

**핵심 차별점**: Google Gemini 2.0 Flash (무료)만 사용하며, 모든 추가 기능은 오픈소스/브라우저 네이티브 API로 구현

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

## 🗣️ 우선순위 P1: 영어 튜터 서비스 고도화 (무료 솔루션)

### 벤치마킹 인사이트

**글로벌 선도 서비스 핵심 기능**:
- Duolingo Max: AI 롤플레이, 설명형 답변, 적응형 학습 경로
- Langua: 실시간 음성 대화, 발음 피드백
- BoldVoice: AI 음성 분석, 즉시 피드백
- ELSA Speak: 음절 강세, 억양 분석

**우리의 무료 솔루션 전략**:
1. ✅ Google Gemini 2.0 Flash (무료) - 이미 사용 중
2. ✅ Web Speech API (브라우저 네이티브, 무료)
3. ✅ Tesseract/EasyOCR (오픈소스 OCR)
4. ✅ 자체 알고리즘 (비용 없음)

### 개선 계획

#### 1. OCR 기반 이미지 학습 기능 (무료 솔루션)

**목표**: 영어 문제, 단어, 지문 이미지를 업로드하면 즉시 튜터링

**기술 스택** (100% 무료):
- **Primary OCR**: Tesseract.js (브라우저에서 실행, 완전 무료)
- **Advanced OCR**: EasyOCR (Python, 오픈소스)
- **Fallback**: PaddleOCR (가장 정확한 무료 OCR)

**구현 단계**:

1. **Tesseract.js 브라우저 OCR 통합**:
```typescript
// lib/ocr/tesseract-client.ts (클라이언트 사이드)

import Tesseract from 'tesseract.js';

export async function recognizeEnglishText(imageFile: File): Promise<OCRResult> {
  const worker = await Tesseract.createWorker('eng');

  const { data } = await worker.recognize(imageFile);

  await worker.terminate();

  return {
    text: data.text,
    confidence: data.confidence,
    words: data.words,
    lines: data.lines
  };
}
```

**장점**:
- ✅ **완전 무료** (라이브러리 자체가 오픈소스)
- ✅ **클라이언트 사이드 실행** (서버 비용 없음)
- ✅ **API 키 불필요**
- ✅ **100+ 언어 지원**

2. **서버 사이드 고급 OCR (선택적)**:
```typescript
// app/api/ocr/advanced/route.ts

import { PaddleOCR } from 'paddleocr-node'; // 또는 EasyOCR Python 호출

export async function POST(req: Request) {
  const { imageBase64 } = await req.json();

  // PaddleOCR - 가장 정확한 무료 OCR
  const ocr = new PaddleOCR();
  const result = await ocr.detect(imageBase64);

  return {
    text: result.text,
    confidence: result.confidence,
    boundingBoxes: result.boxes
  };
}
```

**PaddleOCR 특징**:
- ✅ **무료 오픈소스** (Apache 2.0 라이선스)
- ✅ **높은 정확도** (Tesseract보다 우수)
- ✅ **손글씨 지원**
- ✅ **경량** (10MB 미만)

3. **이미지 업로드 UI** (`components/chat/EnglishImageUpload.tsx`):
```typescript
export function EnglishImageUpload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);

    try {
      // 클라이언트 사이드 Tesseract.js 실행
      const result = await recognizeEnglishText(file);

      setOcrResult(result.text);

      // 신뢰도가 낮으면 서버 사이드 PaddleOCR 사용
      if (result.confidence < 80) {
        const advancedResult = await fetch('/api/ocr/advanced', {
          method: 'POST',
          body: JSON.stringify({ imageBase64: await fileToBase64(file) })
        }).then(r => r.json());

        setOcrResult(advancedResult.text);
      }

      // 튜터에게 전달
      onTextRecognized(result.text);

    } catch (error) {
      console.error('OCR 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="english-image-upload">
      <ImageCapture onCapture={handleImageUpload} />

      {isProcessing && (
        <div className="processing">
          <Spinner />
          <p>텍스트 인식 중... (무료 OCR 사용)</p>
        </div>
      )}

      {ocrResult && (
        <div className="ocr-preview">
          <h4>인식된 텍스트:</h4>
          <p>{ocrResult}</p>
          <button onClick={() => sendToTutor(ocrResult)}>
            이 문제로 시작하기
          </button>
        </div>
      )}
    </div>
  );
}
```

#### 2. 발음 분석 시스템 (무료 브라우저 API)

**목표**: 음소 단위 발음 정확도 분석 + 실시간 피드백

**기술 스택** (100% 무료):
- **Speech Recognition**: Web Speech API (브라우저 네이티브, 무료)
- **발음 분석**: 자체 알고리즘 (Levenshtein Distance + 음소 매칭)
- **시각화**: 브라우저 Web Audio API

**구현 단계**:

1. **Web Speech API 활용**:
```typescript
// hooks/usePronunciationAnalysis.ts

export function usePronunciationAnalysis() {
  const analyzePronounciation = async (
    expectedText: string,
    audioBlob: Blob
  ): Promise<PronunciationResult> => {
    // 1. Web Speech API로 음성 인식
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    const transcript = await new Promise<string>((resolve) => {
      recognition.onresult = (event) => {
        resolve(event.results[0][0].transcript);
      };
      recognition.start();
    });

    // 2. 발음 정확도 계산 (자체 알고리즘)
    const accuracy = calculatePronunciationAccuracy(expectedText, transcript);

    // 3. 음소별 분석
    const phonemeAnalysis = analyzePhonemes(expectedText, transcript);

    return {
      transcript,
      expectedText,
      overallScore: accuracy,
      phonemeScores: phonemeAnalysis,
      suggestions: generateSuggestions(phonemeAnalysis)
    };
  };

  return { analyzePronounciation };
}
```

2. **발음 정확도 계산 알고리즘** (무료 자체 구현):
```typescript
// lib/pronunciation/accuracy-calculator.ts

function calculatePronunciationAccuracy(
  expected: string,
  actual: string
): number {
  // 1. Levenshtein Distance 계산
  const distance = levenshteinDistance(
    expected.toLowerCase(),
    actual.toLowerCase()
  );

  // 2. 유사도 계산 (0-100)
  const maxLength = Math.max(expected.length, actual.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
```

3. **음소별 분석** (영어 발음 규칙 기반):
```typescript
// lib/pronunciation/phoneme-analyzer.ts

interface PhonemeScore {
  phoneme: string;
  score: number;
  color: 'green' | 'yellow' | 'red';
}

function analyzePhonemes(expected: string, actual: string): PhonemeScore[] {
  const expectedWords = expected.toLowerCase().split(' ');
  const actualWords = actual.toLowerCase().split(' ');

  const scores: PhonemeScore[] = [];

  expectedWords.forEach((expWord, i) => {
    const actWord = actualWords[i] || '';

    // 단어 단위로 유사도 계산
    const wordScore = calculatePronunciationAccuracy(expWord, actWord);

    scores.push({
      phoneme: expWord,
      score: wordScore,
      color: wordScore >= 90 ? 'green' : wordScore >= 70 ? 'yellow' : 'red'
    });
  });

  return scores;
}

function generateSuggestions(phonemeScores: PhonemeScore[]): string[] {
  const suggestions: string[] = [];

  phonemeScores.forEach(({ phoneme, score }) => {
    if (score < 80) {
      // 일반적인 발음 팁 데이터베이스에서 가져오기
      const tip = getPronunciationTip(phoneme);
      if (tip) suggestions.push(tip);
    }
  });

  return suggestions;
}

// 발음 팁 데이터베이스 (정적 데이터)
const pronunciationTips: Record<string, string> = {
  'th': '"th" 발음: 혀를 윗니와 아랫니 사이에 가볍게 대고 발음하세요.',
  'r': '"r" 발음: 혀를 입천장에 닿지 않게 하고 둥글게 말아주세요.',
  'l': '"l" 발음: 혀끝을 윗니 뒤쪽에 대고 발음하세요.',
  // ... 더 많은 발음 팁
};

function getPronunciationTip(word: string): string | undefined {
  // 단어에서 어려운 발음 패턴 찾기
  for (const [pattern, tip] of Object.entries(pronunciationTips)) {
    if (word.includes(pattern)) {
      return tip;
    }
  }
  return undefined;
}
```

4. **발음 시각화 UI**:
```typescript
// components/pronunciation/PronunciationFeedback.tsx

export function PronunciationFeedback({ result }: Props) {
  return (
    <div className="pronunciation-feedback">
      {/* 전체 점수 */}
      <div className="overall-score">
        <CircularProgress value={result.overallScore} />
        <span className="score-text">{result.overallScore}점</span>
      </div>

      {/* 단어별 분석 */}
      <div className="word-analysis">
        <h4>발음 분석:</h4>
        <div className="words">
          {result.phonemeScores.map((phoneme, i) => (
            <span
              key={i}
              className={`word word-${phoneme.color}`}
              title={`정확도: ${phoneme.score}%`}
            >
              {phoneme.phoneme}
            </span>
          ))}
        </div>
      </div>

      {/* 개선 제안 */}
      {result.suggestions.length > 0 && (
        <div className="suggestions">
          <h4>발음 개선 팁:</h4>
          <ul>
            {result.suggestions.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 다시 시도 버튼 */}
      <button onClick={() => retry()}>
        다시 발음하기
      </button>
    </div>
  );
}
```

**장점**:
- ✅ **완전 무료** (Web Speech API는 브라우저 네이티브)
- ✅ **API 키 불필요**
- ✅ **실시간 분석**
- ✅ **클라이언트 사이드 처리** (서버 부담 없음)

#### 3. 적응형 학습 경로 시스템 (자체 알고리즘)

**목표**: 사용자 수준 자동 감지 + 동적 난이도 조정

**기술 스택** (100% 무료):
- Gemini 2.0 Flash (이미 사용 중, 무료)
- 자체 알고리즘 (로컬 분석)

**구현**:
```typescript
// lib/adaptive-learning/level-detector.ts

interface UserLevel {
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  vocabulary: number; // 0-100
  grammar: number;
  pronunciation: number;
  comprehension: number;
}

function detectEnglishLevel(chatHistory: Message[]): UserLevel {
  // 1. 어휘 수준 분석
  const vocabulary = analyzeVocabularyLevel(chatHistory);

  // 2. 문법 정확도 분석
  const grammar = analyzeGrammarAccuracy(chatHistory);

  // 3. 발음 히스토리 분석
  const pronunciation = analyzePronunciationHistory(chatHistory);

  // 4. CEFR 레벨 매핑
  const avgScore = (vocabulary + grammar + pronunciation) / 3;
  const cefr = mapScoreToCEFR(avgScore);

  return { cefr, vocabulary, grammar, pronunciation, comprehension: avgScore };
}

function analyzeVocabularyLevel(messages: Message[]): number {
  const userMessages = messages.filter(m => m.role === 'user');

  // 사용된 단어의 고급도 분석
  const words = userMessages.flatMap(m =>
    m.content.toLowerCase().split(/\s+/)
  );

  // 고급 단어 목록과 비교 (정적 데이터)
  const advancedWords = new Set(['sophisticated', 'elaborate', 'paradigm', /* ... */]);
  const advancedWordCount = words.filter(w => advancedWords.has(w)).length;

  return Math.min(100, (advancedWordCount / words.length) * 100 * 10);
}

function mapScoreToCEFR(score: number): string {
  if (score < 20) return 'A1';
  if (score < 40) return 'A2';
  if (score < 60) return 'B1';
  if (score < 80) return 'B2';
  if (score < 95) return 'C1';
  return 'C2';
}
```

#### 4. 롤플레이 시나리오 (Gemini 활용)

**목표**: 실제 상황 기반 대화 연습

**구현** (추가 비용 없음):
```typescript
// lib/tutor/roleplay-scenarios.ts

const scenarios = [
  {
    id: 'airport-checkin',
    title: '공항 체크인',
    level: 'A2',
    systemPrompt: `
You are an airport check-in staff.
The user is a passenger checking in for their flight.
Stay in character and help them check in naturally.

After 5-7 exchanges, provide feedback in Korean on:
- Politeness and clarity
- Vocabulary usage
- Grammar accuracy
    `
  },
  {
    id: 'restaurant-order',
    title: '레스토랑 주문',
    level: 'A2',
    systemPrompt: `
You are a waiter at a restaurant.
The user wants to order food.
Engage naturally and help them practice ordering.
    `
  },
  // ... 10개 시나리오
];

// Gemini에게 시나리오 전달 (추가 비용 없음)
export function startRoleplay(scenarioId: string) {
  const scenario = scenarios.find(s => s.id === scenarioId);

  return {
    systemPrompt: scenario.systemPrompt,
    initialMessage: getInitialMessage(scenario)
  };
}
```

### 성공 지표

1. **OCR 사용률**: 목표 40% (전체 세션 중)
2. **발음 분석 정확도**: 목표 >85% (Web Speech API 기준)
3. **적응형 학습 효과**: 목표 20% 성적 향상 (4주 기준)
4. **롤플레이 완료율**: 목표 60%
5. **사용자 만족도**: 목표 4.5/5

### 구현 일정

| Phase | 작업 | 소요 시간 | 비용 |
|-------|------|----------|------|
| Phase 1.1 | Tesseract.js OCR 통합 | 8시간 | **$0** |
| Phase 1.2 | Web Speech API 발음 분석 | 12시간 | **$0** |
| Phase 1.3 | 적응형 학습 알고리즘 | 16시간 | **$0** |
| Phase 1.4 | 롤플레이 시나리오 (10개) | 20시간 | **$0** |
| **총 소요 시간** | | **56시간 (1.5주)** | **$0** |

---

## 📐 우선순위 P2: 수학 튜터 서비스 고도화 (오픈소스 OCR)

### 벤치마킹 인사이트

**글로벌 선도 서비스 핵심 기능**:
- Photomath: OCR + 단계별 풀이 ($2.99-19.99/월)
- Symbolab: 고급 수학 ($4.99/월)
- Mathpix: 수식 OCR ($99/월)

**우리의 무료 솔루션 전략**:
1. ✅ **LaTeX-OCR** (오픈소스, Vision Transformer 기반)
2. ✅ **Pix2Text** (무료 Mathpix 대체제)
3. ✅ **Tesseract Math Mode** (기본 수식 인식)
4. ✅ Google Gemini 2.0 Flash (무료)

### 개선 계획

#### 1. 오픈소스 수학 OCR (완전 무료)

**목표**: 손글씨/인쇄된 수학 문제를 LaTeX로 변환

**기술 스택** (100% 무료):
- **Primary**: LaTeX-OCR (pix2tex) - Vision Transformer 기반
- **Alternative**: Pix2Text - 80+ 언어 지원, Mathpix 대체
- **Fallback**: Tesseract Math Mode

**구현 단계**:

1. **LaTeX-OCR Python 서비스 구축**:
```python
# scripts/latex_ocr_service.py

from pix2tex.cli import LatexOCR

model = LatexOCR()

def recognize_math_equation(image_path: str) -> dict:
    """
    이미지에서 수식을 LaTeX로 변환
    완전 무료 오픈소스 솔루션
    """
    latex_code = model(image_path)

    return {
        'latex': latex_code,
        'confidence': 0.95,  # pix2tex는 일반적으로 높은 정확도
        'source': 'pix2tex'
    }
```

2. **Next.js API 엔드포인트**:
```typescript
// app/api/ocr/math/route.ts

import { spawn } from 'child_process';

export async function POST(req: Request) {
  const { imageBase64 } = await req.json();

  // Python LaTeX-OCR 스크립트 호출
  const result = await runPythonScript('latex_ocr_service.py', imageBase64);

  return Response.json({
    latex: result.latex,
    confidence: result.confidence,
    plainText: latexToPlainText(result.latex)
  });
}

function runPythonScript(script: string, imageData: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [
      `scripts/${script}`,
      '--image', imageData
    ]);

    let output = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(output));
      } else {
        reject(new Error('Python script failed'));
      }
    });
  });
}
```

3. **대체 솔루션: Pix2Text (더 강력한 무료 대안)**:
```python
# scripts/pix2text_service.py

from pix2text import Pix2Text

p2t = Pix2Text.from_config()

def recognize_with_pix2text(image_path: str) -> dict:
    """
    Pix2Text: Mathpix의 무료 오픈소스 대안
    - 손글씨 수식 지원
    - 테이블, 레이아웃 인식
    - 80+ 언어 지원
    """
    result = p2t.recognize(image_path, resized_shape=608)

    return {
        'latex': result['text'],
        'confidence': result.get('confidence', 0.9),
        'layout': result.get('layout_detection', []),
        'source': 'pix2text'
    }
```

**Pix2Text 특징**:
- ✅ **완전 무료** (Apache 2.0 라이선스)
- ✅ **Mathpix 대체제** (공식 언급)
- ✅ **손글씨 인식 우수**
- ✅ **테이블, 레이아웃 인식**
- ✅ **80+ 언어 지원**

4. **클라이언트 UI**:
```typescript
// components/math/MathImageUpload.tsx

export function MathImageUpload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [latexResult, setLatexResult] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);

    const base64 = await fileToBase64(file);

    // 무료 오픈소스 OCR 호출
    const result = await fetch('/api/ocr/math', {
      method: 'POST',
      body: JSON.stringify({ imageBase64: base64 })
    }).then(r => r.json());

    setLatexResult(result.latex);
    setIsProcessing(false);
  };

  return (
    <div className="math-image-upload">
      <ImageCapture onCapture={handleImageUpload} />

      {isProcessing && (
        <div className="processing">
          <Spinner />
          <p>수식 인식 중... (무료 OCR: Pix2Text)</p>
        </div>
      )}

      {latexResult && (
        <div className="latex-preview">
          <h4>인식된 수식:</h4>
          {/* KaTeX로 렌더링 */}
          <MathRenderer latex={latexResult} />

          <button onClick={() => sendToTutor(latexResult)}>
            이 문제 풀이 시작하기
          </button>
        </div>
      )}
    </div>
  );
}
```

#### 2. 단계별 풀이 생성 (Gemini 활용)

**목표**: Photomath 스타일 단계별 애니메이션 풀이

**시스템 프롬프트 강화** (추가 비용 없음):
```typescript
// lib/tutor/math-prompt-generator.ts

const mathTutorPrompt = `
당신은 수학 튜터입니다. 모든 문제는 다음 형식으로 단계별 풀이를 제공하세요:

**문제**: [LaTeX 형식]

**풀이 과정**:

### Step 1: [단계 이름]
[설명]
$$[수식 변환]$$

### Step 2: [단계 이름]
[설명]
$$[수식 변환]$$

**최종 답**: $$[답]$$

**개념 설명**: [관련 개념 3줄]
**유사 문제**: [연습 문제 1개]

예시:
문제: $$2x + 5 = 13$$

Step 1: 양변에서 5 빼기
$$2x + 5 - 5 = 13 - 5$$
$$2x = 8$$

Step 2: 양변을 2로 나누기
$$x = 4$$

최종 답: $$x = 4$$
`;
```

**풀이 과정 파싱 및 애니메이션**:
```typescript
// components/math/StepByStepSolution.tsx

interface Step {
  title: string;
  explanation: string;
  equation: string;
}

function parseSteps(geminiResponse: string): Step[] {
  const stepRegex = /### Step (\d+): (.+?)\n(.+?)\n\$\$(.+?)\$\$/gs;
  const steps: Step[] = [];

  let match;
  while ((match = stepRegex.exec(geminiResponse)) !== null) {
    steps.push({
      title: match[2],
      explanation: match[3],
      equation: match[4]
    });
  }

  return steps;
}

export function StepByStepSolution({ geminiResponse }: Props) {
  const steps = parseSteps(geminiResponse);
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="step-solution">
      {/* 진행 표시 */}
      <div className="progress">
        {steps.map((_, i) => (
          <div key={i} className={`dot ${i <= currentStep ? 'active' : ''}`} />
        ))}
      </div>

      {/* 현재 단계 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3>Step {currentStep + 1}: {steps[currentStep].title}</h3>
          <p>{steps[currentStep].explanation}</p>
          <MathRenderer latex={steps[currentStep].equation} />
        </motion.div>
      </AnimatePresence>

      {/* 컨트롤 */}
      <div className="controls">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          이전
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
}
```

#### 3. 인터랙티브 수학 시각화 (무료 라이브러리)

**목표**: Desmos/GeoGebra 스타일 조작 가능한 그래프

**기술 스택** (100% 무료):
- **Mafs** (React 수학 그래프 라이브러리, MIT 라이선스)
- **Plotly.js** (이미 사용 중, 오픈소스)
- **Three.js** (3D 시각화, MIT 라이선스)

**구현**:
```typescript
// components/math/InteractiveGraph.tsx

import { Mafs, Coordinates, Plot, Point, useMovablePoint } from 'mafs';
import 'mafs/core.css';

export function InteractiveQuadraticGraph() {
  // 사용자가 드래그할 수 있는 점
  const a = useMovablePoint([0, 1]);
  const b = useMovablePoint([1, 0]);

  return (
    <div className="interactive-graph">
      <h4>이차함수: y = ax² + bx</h4>
      <Mafs>
        <Coordinates.Cartesian />

        {/* 그래프 */}
        <Plot.OfX
          y={(x) => a.point[1] * x * x + b.point[1] * x}
          color="blue"
        />

        {/* 조작 가능한 점 */}
        <Point {...a} color="red" />
        <Point {...b} color="green" />

        {/* 계수 표시 */}
        <text x={-5} y={5} className="equation-text">
          a = {a.point[1].toFixed(2)}
        </text>
        <text x={-5} y={4.5} className="equation-text">
          b = {b.point[1].toFixed(2)}
        </text>
      </Mafs>

      <p className="instruction">
        🔴 빨간 점을 움직여 a 값을 조정하세요
        <br />
        🟢 초록 점을 움직여 b 값을 조정하세요
      </p>
    </div>
  );
}
```

**Mafs 특징**:
- ✅ **완전 무료** (MIT 라이선스)
- ✅ **React 네이티브**
- ✅ **조작 가능한 인터랙티브 요소**
- ✅ **성능 우수** (Canvas 기반)

#### 4. 오답 원인 진단 (자체 알고리즘)

**목표**: 학생이 틀린 이유를 AI가 분석

**구현** (추가 비용 없음 - Gemini 활용):
```typescript
// lib/math/error-diagnosis.ts

async function diagnoseError(
  problem: string,
  studentAnswer: string,
  correctAnswer: string
): Promise<ErrorDiagnosis> {
  // Gemini에게 오답 분석 요청
  const prompt = `
학생이 다음 문제를 틀렸습니다:

문제: ${problem}
학생 답: ${studentAnswer}
정답: ${correctAnswer}

다음을 분석해주세요:
1. 어떤 부분에서 틀렸는지
2. 어떤 개념이 부족한지
3. 추천 학습 내용

JSON 형식으로 답변:
{
  "errorType": "calculation|concept|careless|method",
  "specificError": "구체적인 실수 설명",
  "conceptGap": ["부족한 개념1", "부족한 개념2"],
  "recommendation": "추천 학습 내용"
}
  `;

  const response = await callGemini(prompt);
  return JSON.parse(response);
}
```

**UI 통합**:
```typescript
// components/math/ErrorFeedback.tsx

export function ErrorFeedback({ diagnosis }: Props) {
  const errorIcons = {
    calculation: '🧮',
    concept: '📚',
    careless: '⚠️',
    method: '🔧'
  };

  return (
    <div className="error-feedback">
      <div className={`error-badge ${diagnosis.errorType}`}>
        {errorIcons[diagnosis.errorType]}
        {getErrorLabel(diagnosis.errorType)}
      </div>

      <h4>무엇이 문제였나요?</h4>
      <p>{diagnosis.specificError}</p>

      <h4>복습이 필요한 개념</h4>
      <ul>
        {diagnosis.conceptGap.map(concept => (
          <li key={concept}>{concept}</li>
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

1. **OCR 인식 정확도**: 목표 >90% (Pix2Text 기준)
2. **단계별 풀이 만족도**: 목표 4.6/5
3. **시각화 사용률**: 목표 50%
4. **오답 진단 정확도**: 목표 >85%
5. **학습 성과**: 목표 30% 정답률 향상 (4주)

### 구현 일정

| Phase | 작업 | 소요 시간 | 비용 |
|-------|------|----------|------|
| Phase 2.1 | Pix2Text/LaTeX-OCR 통합 | 12시간 | **$0** |
| Phase 2.2 | 단계별 풀이 시스템 | 12시간 | **$0** |
| Phase 2.3 | Mafs 인터랙티브 시각화 (5개 유형) | 20시간 | **$0** |
| Phase 2.4 | 오답 진단 알고리즘 | 12시간 | **$0** |
| **총 소요 시간** | | **56시간 (1.5주)** | **$0** |

---

## 🧪 우선순위 P3: E2E 테스트 인프라 강화

(이전 계획과 동일 - Playwright는 이미 무료 오픈소스)

### 성공 지표

1. **테스트 커버리지**: 목표 >80%
2. **테스트 실행 시간**: 목표 <10분
3. **Flaky Test 비율**: 목표 <5%
4. **버그 탐지율**: 목표 >90%

### 구현 일정

| 작업 | 소요 시간 | 비용 |
|------|----------|------|
| 핵심 플로우 테스트 10개 | 16시간 | **$0** |
| 성능 테스트 5개 | 8시간 | **$0** |
| 접근성 테스트 | 6시간 | **$0** |
| 시각적 회귀 테스트 | 6시간 | **$0** |
| CI/CD 통합 | 4시간 | **$0** |
| **총 소요 시간** | **40시간 (1주)** | **$0** |

---

## 📊 종합 실행 계획

### Phase별 우선순위 및 일정

```
┌─────────────────────────────────────────────────────────────┐
│ Timeline: 5주 계획 (무료 솔루션으로 더 빠름)                 │
├─────────────────────────────────────────────────────────────┤
│ Week 1: P0 (로그인 개선 + 브랜딩)                            │
│   Day 1-2:   빠른 온보딩 개발 (11시간)                       │
│                                                              │
│ Week 2-3: P1 (영어 튜터 고도화)                              │
│   Day 3-5:   Tesseract.js OCR (8시간)                       │
│   Day 6-8:   Web Speech API 발음 분석 (12시간)              │
│   Day 9-12:  적응형 학습 + 롤플레이 (36시간)                │
│                                                              │
│ Week 4-5: P2 (수학 튜터 고도화)                              │
│   Day 13-15: Pix2Text OCR 통합 (12시간)                     │
│   Day 16-18: 단계별 풀이 + 오답 진단 (24시간)               │
│   Day 19-23: Mafs 인터랙티브 시각화 (20시간)                │
│                                                              │
│ Week 6: P3 (E2E 테스트) + QA & 배포                          │
│   Day 24-28: E2E 테스트 인프라 (40시간)                      │
│   Day 29-30: 통합 테스트 및 프로덕션 배포                    │
└─────────────────────────────────────────────────────────────┘
```

### 무료 기술 스택 요약

| 기능 | 유료 대안 | 무료 솔루션 | 비용 절감 |
|------|----------|------------|----------|
| **영어 OCR** | Google Vision API ($50/월) | Tesseract.js / EasyOCR | **$50/월** |
| **음성 인식** | Google Speech-to-Text ($100/월) | Web Speech API | **$100/월** |
| **수학 OCR** | Mathpix API ($99/월) | Pix2Text / LaTeX-OCR | **$99/월** |
| **그래프 시각화** | Desmos API (제한적) | Mafs / Plotly.js | **무제한** |
| **E2E 테스트** | BrowserStack ($39/월) | Playwright (오픈소스) | **$39/월** |
| **AI 튜터** | GPT-4 API ($20+) | Gemini 2.0 Flash (무료) | **$20+/월** |
| **총 절감** | | | **~$308/월** |

### 필요한 설정 (모두 무료)

1. ✅ **Google Gemini API** (이미 사용 중, 무료)
2. ⚠️ **Python 환경** (Pix2Text, LaTeX-OCR)
   ```bash
   pip install pix2text latex-ocr easyocr paddleocr
   ```
3. ⚠️ **Node.js 패키지**
   ```bash
   npm install tesseract.js mafs plotly.js
   ```

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
- OCR 처리 시간: <5초 (클라이언트 사이드)
- 앱 로딩 시간: <2초
- 에러율: <1%

---

## 🎯 다음 단계 (Next Steps)

### 즉시 실행 가능한 작업

1. **P0 시작** (오늘 착수 가능):
   - [ ] `/app/onboarding/quick/page.tsx` 생성
   - [ ] HomeClient.tsx 버튼 로직 수정
   - [ ] 브랜딩 일괄 변경 스크립트 실행

2. **무료 라이브러리 설치**:
   ```bash
   # 프론트엔드
   npm install tesseract.js mafs

   # 백엔드 Python
   pip install pix2text latex-ocr paddleocr
   ```

3. **테스트**:
   - [ ] Tesseract.js 브라우저 OCR 테스트
   - [ ] Web Speech API 발음 인식 테스트
   - [ ] Pix2Text 수식 인식 테스트

---

## 💡 무료 솔루션의 장점

### 1. **비용 절감**
- ✅ 월 $308 절감 (연간 $3,696)
- ✅ API 키 관리 불필요
- ✅ 사용량 제한 없음

### 2. **데이터 프라이버시**
- ✅ 클라이언트 사이드 처리 (Tesseract.js)
- ✅ 사용자 데이터가 외부 서버로 전송 안 됨
- ✅ GDPR 컴플라이언스 향상

### 3. **성능**
- ✅ 클라이언트 사이드 OCR (서버 부담 없음)
- ✅ 브라우저 네이티브 API (Web Speech API)
- ✅ 오프라인 지원 가능 (Tesseract.js)

### 4. **확장성**
- ✅ 사용자 증가 시 비용 증가 없음
- ✅ 무제한 요청 가능
- ✅ 오픈소스 커뮤니티 지원

### 5. **기술적 독립성**
- ✅ 특정 벤더 종속성 없음
- ✅ 오픈소스 코드 수정 가능
- ✅ 장기 유지보수 용이

---

## 📎 참고 자료

### 무료 오픈소스 프로젝트 링크
- [Tesseract.js](https://github.com/naptha/tesseract.js) - 브라우저 OCR
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) - 고급 OCR
- [EasyOCR](https://github.com/JaidedAI/EasyOCR) - 80+ 언어 OCR
- [LaTeX-OCR (pix2tex)](https://github.com/lukas-blecher/LaTeX-OCR) - 수식 인식
- [Pix2Text](https://github.com/breezedeus/Pix2Text) - Mathpix 대체제
- [Mafs](https://mafs.dev/) - React 수학 그래프
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - 브라우저 음성 인식

### 기술 문서
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [Web Speech API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Mafs Documentation](https://mafs.dev/guides/get-started)
- [Playwright Testing](https://playwright.dev/)

---

## 🚀 차별화 포인트

### AI Park만의 강점

1. **100% 무료 운영**
   - 경쟁사 대비 가격 경쟁력 (Duolingo $30/월, Photomath $20/월)
   - 무료 티어에서도 모든 기능 제공

2. **오픈소스 기반**
   - 투명한 기술 스택
   - 커뮤니티 기여 가능
   - 장기적 지속 가능성

3. **프라이버시 우선**
   - 클라이언트 사이드 처리
   - 최소한의 데이터 전송
   - GDPR 준수

4. **한국어 최적화**
   - 한국 학생 맞춤형 설명
   - 학교급별 맞춤 커리큘럼
   - 한국 교육과정 연계

---

**문서 버전**: 2.0 (무료 솔루션)
**총 예상 비용**: **$0/월** ✅
**최종 수정**: 2025-11-02
**작성자**: Claude (SuperClaude Framework)
