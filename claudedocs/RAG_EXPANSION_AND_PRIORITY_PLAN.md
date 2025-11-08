# 🎯 전체 과목 RAG 시스템 확대 및 정확도 개선 계획

## 📊 현황 분석

### 현재 RAG 시스템 구현 상태

| 과목 | RAG 콘텐츠 | 언어 | 상태 | 문제점 |
|------|-----------|------|------|--------|
| **수학** | ✅ 존재 (780줄~) | 영문 | 🔴 긴급 개선 필요 | 영문 콘텐츠로 인한 한국어 응답 불가 버그 |
| **영어** | ✅ 존재 (51줄~) | 영문 | ✅ 정상 동작 | 영어 학습이므로 영문 콘텐츠 적절 |
| **과학** | ✅ 존재 (1478줄~) | 영문 | 🟡 개선 필요 | 한국어 번역 필요, 콘텐츠 확충 |
| **사회** | ✅ 존재 (2230줄~) | 영문 | 🟡 개선 필요 | 한국어 번역 필요, 한국 교육과정 반영 |
| **국어** | ❌ 없음 | - | 🔴 신규 개발 | 완전 신규 구축 필요 |

### API 라우트 구현 상태

| 과목 | API 경로 | RAG 검색 | RAG Direct | 캐싱 |
|------|----------|----------|------------|------|
| 수학 | `/api/chat/math` | ✅ | ⚠️ 비활성화 (버그) | ✅ |
| 영어 | `/api/chat/english` | ✅ | ✅ | ✅ |
| 과학 | `/api/chat/science` | ✅ | ✅ | ✅ |
| 사회 | `/api/chat/social-studies` | ✅ | ✅ | ✅ |
| 국어 | ❌ 미구현 | - | - | - |

---

## 🔍 교육과정 표준 분석 (Web Search 기반)

### 과학 (NGSS - Next Generation Science Standards)

**3차원 학습 접근**:
1. **과학 및 공학 실천**: 과학자가 자연 세계를 탐구하는 방법
2. **교차 개념**: 4개 도메인 간 연결 (물리, 생명, 지구/우주, 공학)
3. **핵심 아이디어**: 도메인별 핵심 개념

**도메인**:
- Physical Science (물리학)
- Life Science (생명과학)
- Earth and Space Science (지구 및 우주 과학)
- Engineering, Technology and Applications (공학 및 기술)

**우리 RAG 시스템 적용**:
```typescript
// lib/tutor/rag-system.ts (1478줄~)
export const SCIENCE_VERIFIED_CONTENT: VerifiedContent[] = [
  // 현재: 영문 콘텐츠
  // 개선: 한국어 번역 + NGSS 기준 추가
  {
    id: "sci-elem-photosynthesis",
    subject: "science",
    topic: "Photosynthesis",
    topicKo: "광합성",
    // ... 기존 영문 콘텐츠
    contentKo: "광합성은 식물이 빛 에너지를 이용하여..." // 추가 필요
  }
];
```

---

### 사회 (NCSS - National Council for Social Studies)

**4대 핵심 분야**:
1. **Civics** (시민학): 정부, 민주주의, 권리와 책임
2. **Economics** (경제학): 시장, 공급과 수요, 무역
3. **Geography** (지리학): 장소, 지역, 환경
4. **History** (역사): 과거 사건, 문화, 문명

**C3 Framework** (College, Career, and Civic Life):
- 38개 주에서 채택
- 탐구 기반 학습 강조
- 질문 → 조사 → 행동

**한국 교육과정 적용 필요**:
- 미국 중심 내용 → 한국사, 한국 지리, 한국 정치/경제 추가
- 예: 삼국시대, 조선시대, 한국전쟁, 대한민국 정부 구조

---

### 국어 (2015 개정 교육과정)

**핵심 영역**:
1. **듣기/말하기**: 대화, 토론, 발표
2. **읽기**: 독해, 문단 분석, 비판적 읽기
3. **쓰기**: 맞춤법, 문장 구조, 장르별 작문
4. **문법**: 품사, 문장 성분, 어법
5. **문학**: 시, 소설, 희곡, 수필

**학년별 중점**:
- 초등 1-2: 한글, 받침, 띄어쓰기
- 초등 3-6: 문장 성분, 글쓰기, 문학 입문
- 중학교: 품사, 문학 작품 분석, 논설문
- 고등학교: 고전 문학, 비평, 화법과 작문

---

## 📈 RAG 시스템 2025 Best Practices (Web Search 기반)

### 1. RAG 정확도 향상 기법

#### ✅ Context Sufficiency (충분한 맥락)
**Google Research 2025**:
- RAG 시스템이 정확한 답변을 제공하려면 **충분한 맥락**이 필요
- 맥락 충분성 확인 후 생성 시작
- 부족 시: 추가 검색 또는 재순위화

**우리 시스템 적용**:
```typescript
// lib/tutor/rag-system.ts
async function retrieveVerifiedContent(
  question: string,
  subject: Subject,
  gradeLevel: string,
  maxResults: number = 3
): Promise<RetrievedContent> {
  const results = await semanticSearch(question, subject, gradeLevel);

  // ✅ Context Sufficiency 체크 추가
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const totalLength = results.reduce((sum, r) => sum + r.content.length, 0);

  const isSufficient = avgConfidence > 0.85 && totalLength > 500 && results.length >= 2;

  if (!isSufficient) {
    // 추가 검색 또는 재순위화
    const expandedResults = await expandSearch(question, subject);
    return expandedResults;
  }

  return results;
}
```

---

#### ✅ Multi-Stage Retrieval (다단계 검색)
**2025 Best Practice**:
1. **Stage 1**: 경량 필터로 후보 좁히기 (빠름)
2. **Stage 2**: 상세 처리로 정확도 향상 (느림)
3. **Balance**: 속도와 정확도 균형

**우리 시스템 적용**:
```typescript
// Stage 1: 키워드 기반 빠른 필터링
const candidates = VERIFIED_CONTENT.filter(content => {
  const keywords = extractKeywords(question);
  return keywords.some(k =>
    content.topic.includes(k) ||
    content.keyPoints.some(p => p.includes(k))
  );
});

// Stage 2: 의미 기반 정확한 매칭 (Gemini Embeddings)
const semanticScores = await Promise.all(
  candidates.map(c => calculateSemanticSimilarity(question, c.content))
);

const finalResults = candidates
  .map((c, idx) => ({ ...c, confidence: semanticScores[idx] }))
  .sort((a, b) => b.confidence - a.confidence)
  .slice(0, maxResults);
```

---

#### ✅ Query Expansion (쿼리 확장)
**2025 Research**:
- 원래 질문만으로는 관련 콘텐츠를 놓칠 수 있음
- 유의어, 관련 개념으로 쿼리 확장

**우리 시스템 적용**:
```typescript
async function expandQuery(question: string, subject: Subject): Promise<string[]> {
  // Gemini에게 관련 키워드 생성 요청
  const prompt = `다음 질문과 관련된 주요 개념과 유의어를 3-5개 나열하세요.

질문: ${question}
과목: ${subject}

예시:
질문: "광합성이 뭐야?"
관련 개념: 엽록체, 이산화탄소, 포도당, 산소, 빛에너지`;

  const response = await gemini.generateContent(prompt);
  const expandedTerms = parseExpandedTerms(response.text());

  return [question, ...expandedTerms];
}

// 사용
const expandedQueries = await expandQuery("1더하기1은 왜 2야?", "math");
// ["1더하기1은 왜 2야?", "덧셈", "자연수", "수의 합", "기초 연산"]

const allResults = await Promise.all(
  expandedQueries.map(q => semanticSearch(q, subject, gradeLevel))
);
const mergedResults = deduplicate(allResults.flat());
```

---

#### ✅ Evaluation Metrics (평가 지표)

**Retrieval Metrics**:
- **Precision@k**: 검색된 상위 k개 중 관련 문서 비율
- **Recall@k**: 전체 관련 문서 중 검색된 비율
- **MRR (Mean Reciprocal Rank)**: 첫 번째 관련 문서 순위의 역수 평균

**Generation Metrics**:
- **Accuracy**: 사실 정확도
- **Relevance**: 질문 관련성
- **Coherence**: 논리적 일관성

**우리 시스템 적용**:
```typescript
// lib/tutor/rag-evaluation.ts (신규 파일)
interface RAGEvaluationMetrics {
  precision_at_3: number;
  recall_at_3: number;
  mrr: number;
  accuracy: number;
  relevance: number;
}

async function evaluateRAGPerformance(
  testQuestions: Array<{ question: string; relevantContentIds: string[] }>,
  subject: Subject
): Promise<RAGEvaluationMetrics> {
  const results = await Promise.all(
    testQuestions.map(async (test) => {
      const retrieved = await retrieveVerifiedContent(test.question, subject, 'elementary', 3);
      const retrievedIds = retrieved.content.map(c => c.id);

      // Precision@3
      const relevantRetrieved = retrievedIds.filter(id => test.relevantContentIds.includes(id));
      const precision = relevantRetrieved.length / retrievedIds.length;

      // Recall@3
      const recall = relevantRetrieved.length / test.relevantContentIds.length;

      // MRR
      const firstRelevantRank = retrievedIds.findIndex(id => test.relevantContentIds.includes(id)) + 1;
      const mrr = firstRelevantRank > 0 ? 1 / firstRelevantRank : 0;

      return { precision, recall, mrr };
    })
  );

  return {
    precision_at_3: average(results.map(r => r.precision)),
    recall_at_3: average(results.map(r => r.recall)),
    mrr: average(results.map(r => r.mrr)),
    accuracy: 0, // 별도 평가 필요
    relevance: 0 // 별도 평가 필요
  };
}
```

---

### 2. Hallucination 방지 (환각 방지)

**2025 Educational RAG 연구**:
- RAG의 최대 과제: 사실과 다른 정보 생성
- 해결책:
  1. **검증된 콘텐츠만 사용** (우리 시스템 이미 적용 ✅)
  2. **Abstention Threshold**: 확신도 낮으면 "모르겠다" 응답
  3. **Citation Tracking**: 출처 명시

**우리 시스템 적용**:
```typescript
// app/api/chat/math/route.ts
const avgConfidence = retrievedContext.content.reduce(...) / retrievedContext.content.length;

// ✅ Abstention Threshold 적용
const CONFIDENCE_THRESHOLD = 0.7; // 70% 이하면 Gemini 호출

if (avgConfidence < CONFIDENCE_THRESHOLD) {
  console.log(`[RAG Low Confidence] ${avgConfidence.toFixed(2)} < ${CONFIDENCE_THRESHOLD}`);
  console.log('[Fallback to Gemini] For accurate answer');

  // Gemini에게 명시적으로 지시
  const systemPrompt = `...

**중요**: 확실하지 않은 내용은 추측하지 말고 "확실하지 않습니다"라고 답변하세요.`;

  // Gemini 호출
}

// ✅ Citation Tracking (출처 명시)
if (avgConfidence >= 0.9) {
  ragDirectAnswer = `📚 **검증된 교육 자료를 바탕으로 답변드려요:**

${retrievedContext.content.map(c => `
${c.contentKo || c.content}

📖 출처: ${c.source}
✅ 검증일: ${c.lastVerified}
`).join('\n\n---\n\n')}`;
}
```

---

## 🎯 전체 과목 RAG 개선 우선순위 계획

### 🔴 Priority 0: 긴급 (1-2주)

#### P0-1: 수학 RAG 한국어 전환
**현재 문제**:
- 전체 영문 콘텐츠로 인해 한국어 질문에 영어 답변
- RAG Direct 비활성화로 성능 저하 (API 호출 2배)

**목표**:
- 모든 수학 RAG 콘텐츠 한국어 번역
- `contentKo`, `examplesKo`, `keyPointsKo` 필드 추가
- RAG Direct 재활성화

**작업량**:
- 현재 수학 콘텐츠: ~30개 항목
- 학년별 분포: 초등 60%, 중등 30%, 고등 10%
- 예상 시간: 3-4일 (번역 + 검증)

**구현**:
```typescript
// lib/tutor/rag-system.ts
{
  id: "math-elem-addition",
  subject: "math",
  topic: "Addition",
  topicKo: "덧셈",
  gradeLevel: "1",
  schoolLevel: "elementary",

  // 기존 (영문) - 영어 튜터용으로 유지
  content: `Addition combines two or more numbers to find the total...`,
  examples: ["I play soccer every Saturday. (habit)", ...],
  keyPoints: ["Add -s/-es for he/she/it", ...],

  // 신규 추가 (한국어)
  contentKo: `덧셈은 두 개 이상의 수를 합쳐서 전체를 구하는 것입니다.

기호: + (더하기), = (같다)

기본 개념:
- 3 + 2 = 5 (3 더하기 2는 5)
- 사과 3개 + 사과 2개 = 사과 5개

성질:
1. 교환법칙: 3 + 2 = 2 + 3 (순서를 바꿔도 같음)
2. 항등원: 5 + 0 = 5 (0을 더해도 변하지 않음)`,

  examplesKo: [
    "3 + 2 = 5",
    "10 + 5 = 15",
    "사과 4개 + 사과 3개 = 사과 7개"
  ],

  keyPointsKo: [
    "더하기는 합치는 것입니다",
    "순서를 바꿔도 답은 같아요",
    "0을 더하면 그대로예요"
  ],

  source: "2015 개정 교육과정 - 수학 1학년",
  lastVerified: "2025-01-08"
}
```

**API 수정**:
```typescript
// app/api/chat/math/route.ts
if (avgConfidence > 0.9 && retrievedContext.content.length >= 2) {
  ragDirectAnswer = `📚 **검증된 수학 교육 자료를 바탕으로 답변드려요:**

${retrievedContext.content.map(c => c.contentKo || c.content).join('\n\n---\n\n')}

💡 더 궁금한 점이 있으시면 언제든 질문해주세요!`;

  console.log(`[Math RAG Direct KO] High confidence (${avgConfidence.toFixed(2)})`);
  // RAG Direct 재활성화!
}
```

---

#### P0-2: 국어 튜터 RAG 콘텐츠 구축 (초등 1-3학년)
**현재 상황**: 완전 신규 개발 필요

**목표**:
- 초등 1-3학년 핵심 내용 RAG 콘텐츠 작성
- 최소 30개 항목 (학년당 10개)

**콘텐츠 예시**:
```typescript
// lib/tutor/rag-system.ts
export const KOREAN_VERIFIED_CONTENT: VerifiedContent[] = [
  // 1학년: 한글
  {
    id: "kor-elem-1-hangul-vowels",
    subject: "korean",
    topic: "Hangul Vowels",
    topicKo: "한글 모음",
    gradeLevel: "1",
    schoolLevel: "elementary",
    contentKo: `한글 모음은 소리를 만드는 글자입니다.

기본 모음 (10개):
ㅏ (아), ㅑ (야), ㅓ (어), ㅕ (여), ㅗ (오)
ㅛ (요), ㅜ (우), ㅠ (유), ㅡ (으), ㅣ (이)

쓰기:
- 세로 모음 (ㅏ, ㅓ 등): 자음 오른쪽
- 가로 모음 (ㅗ, ㅜ 등): 자음 아래`,
    examplesKo: [
      "가방: ㄱ + ㅏ = 가 (세로 모음)",
      "고양이: ㄱ + ㅗ = 고 (가로 모음)",
      "우유: ㅇ + ㅜ = 우"
    ],
    keyPointsKo: [
      "기본 모음 10개를 외우세요",
      "세로 모음은 오른쪽, 가로 모음은 아래"
    ],
    source: "2015 개정 교육과정 - 국어 1학년",
    lastVerified: "2025-01-08"
  },

  // 2학년: 받침
  {
    id: "kor-elem-2-final-consonants",
    subject: "korean",
    topic: "Final Consonants",
    topicKo: "받침",
    gradeLevel: "2",
    schoolLevel: "elementary",
    contentKo: `받침은 모음 아래에 오는 자음입니다.

7개 대표 받침:
ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ

겹받침:
ㄳ, ㄵ, ㄶ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ

발음 규칙:
- 받침 7개만 소리 남 (나머지는 대표 받침으로 발음)
- 예: 닭 [닥], 값 [갑]`,
    examplesKo: [
      "밥: ㅂ + ㅏ + ㅂ",
      "책: ㅊ + ㅐ + ㄱ",
      "밖: [박] (ㄲ은 ㄱ으로 발음)"
    ],
    keyPointsKo: [
      "받침은 7개만 소리가 나요",
      "겹받침도 대표 받침으로 발음해요"
    ],
    source: "2015 개정 교육과정 - 국어 2학년",
    lastVerified: "2025-01-08"
  },

  // 3학년: 문장 성분
  {
    id: "kor-elem-3-sentence-parts",
    subject: "korean",
    topic: "Sentence Components",
    topicKo: "문장 성분",
    gradeLevel: "3",
    schoolLevel: "elementary",
    contentKo: `문장은 여러 성분으로 이루어져 있습니다.

주요 성분:
1. 주어: "누가/무엇이" (동작의 주인공)
2. 서술어: "어떻게 하다/어떠하다" (주어의 동작/상태)

예문:
- 철수가 공부한다.
  주어: 철수가
  서술어: 공부한다

- 꽃이 예쁘다.
  주어: 꽃이
  서술어: 예쁘다`,
    examplesKo: [
      "새가 / 운다 (주어 + 서술어)",
      "해가 / 뜬다",
      "비가 / 온다"
    ],
    keyPointsKo: [
      "주어는 '~가/이'로 끝나요",
      "서술어는 '~다'로 끝나요",
      "주어와 서술어는 꼭 있어야 해요"
    ],
    source: "2015 개정 교육과정 - 국어 3학년",
    lastVerified: "2025-01-08"
  }
];
```

**작업량**:
- 1학년: 10개 (한글, 받침, 띄어쓰기)
- 2학년: 10개 (받침, 문장 부호, 간단한 글쓰기)
- 3학년: 10개 (문장 성분, 문단, 독해)
- 예상 시간: 5-6일

---

### 🟡 Priority 1: 높음 (3-4주)

#### P1-1: 과학 RAG 한국어 전환 + NGSS 반영
**현재 상태**: 영문 콘텐츠 (1478줄~)

**목표**:
- 기존 과학 콘텐츠 한국어 번역
- NGSS 3차원 학습 구조 반영
- 한국 교육과정 추가 (예: 한국의 계절, 한반도 지형)

**구현**:
```typescript
{
  id: "sci-elem-photosynthesis",
  subject: "science",
  topic: "Photosynthesis",
  topicKo: "광합성",
  gradeLevel: "5",
  schoolLevel: "elementary",

  // NGSS 차원 추가
  ngssDimensions: {
    practice: "모델 개발 및 사용",
    crosscuttingConcept: "에너지와 물질",
    coreIdea: "LS1.C: 물질과 에너지의 조직화"
  },

  content: `Photosynthesis is the process by which plants make food...`,

  contentKo: `광합성은 식물이 빛 에너지를 이용하여 양분을 만드는 과정입니다.

과정:
1. 잎의 엽록체가 빛을 흡수합니다
2. 뿌리에서 흡수한 물(H₂O)과 공기 중 이산화탄소(CO₂)를 사용합니다
3. 포도당(C₆H₁₂O₆)과 산소(O₂)를 만듭니다

화학식:
6CO₂ + 6H₂O + 빛에너지 → C₆H₁₂O₆ + 6O₂

중요성:
- 식물의 먹이 생산
- 산소 방출 (우리가 숨 쉬는 산소!)
- 지구 생태계의 기초`,

  examplesKo: [
    "낮에 식물 잎이 햇빛을 받으면 광합성을 해요",
    "광합성으로 만든 포도당은 식물의 에너지원이에요",
    "광합성 결과 나온 산소를 동물들이 호흡해요"
  ],

  keyPointsKo: [
    "빛 + 물 + 이산화탄소 → 포도당 + 산소",
    "엽록체에서 일어나요",
    "낮에만 일어나요 (빛이 필요)"
  ],

  commonMistakes: [
    "❌ 광합성은 밤에도 일어난다 → ✅ 낮에만 (빛 필요)",
    "❌ 뿌리에서 광합성 → ✅ 잎의 엽록체에서",
    "❌ 산소를 흡수한다 → ✅ 산소를 방출한다"
  ],

  source: "2015 개정 교육과정 - 과학 5학년 / NGSS 5-LS1-1",
  lastVerified: "2025-01-08"
}
```

**작업량**:
- 기존 과학 콘텐츠: ~25개 항목
- 신규 추가 (한국 특화): ~10개
- 예상 시간: 1주

---

#### P1-2: 사회 RAG 한국 교육과정 재구성
**현재 상태**: 미국 중심 영문 콘텐츠 (2230줄~)

**문제**:
- 미국 역사, 미국 지리, 미국 정부 중심
- 한국 학생에게 부적합

**해결 방안**:
1. **한국 역사** 추가: 삼국시대, 고려, 조선, 근현대사
2. **한국 지리** 추가: 한반도 지형, 행정구역, 산업 지역
3. **한국 정치/경제** 추가: 대한민국 정부 구조, 민주주의, 시장경제
4. **세계사/세계지리** 유지: 글로벌 시민 교육

**구현**:
```typescript
export const SOCIAL_STUDIES_VERIFIED_CONTENT: VerifiedContent[] = [
  // 한국사
  {
    id: "social-elem-three-kingdoms",
    subject: "social-studies",
    topic: "Three Kingdoms of Korea",
    topicKo: "삼국시대",
    gradeLevel: "5",
    schoolLevel: "elementary",
    contentKo: `삼국시대는 고구려, 백제, 신라 세 나라가 있던 시대입니다.

고구려 (BC 37 - AD 668):
- 위치: 한반도 북부 + 만주
- 특징: 강한 군사력, 광개토대왕, 을지문덕
- 수도: 국내성 → 평양

백제 (BC 18 - AD 660):
- 위치: 한반도 서남부
- 특징: 발달한 문화, 일본과 교류
- 수도: 위례성 → 웅진 → 사비

신라 (BC 57 - AD 935):
- 위치: 한반도 동남부
- 특징: 삼국 통일, 화랑도, 골품제
- 수도: 서라벌 (경주)

삼국의 문화:
- 불교 전래 (고구려 → 백제 → 신라)
- 고분 (고구려 벽화, 백제 무령왕릉, 신라 천마총)
- 예술 (금동 미륵보살 반가사유상)`,
    examplesKo: [
      "광개토대왕: 고구려를 크게 넓힌 왕",
      "백제 금동 대향로: 뛰어난 백제 공예",
      "신라 첨성대: 세계에서 가장 오래된 천문대"
    ],
    keyPointsKo: [
      "삼국: 고구려, 백제, 신라",
      "고구려는 군사력, 백제는 문화, 신라는 통일",
      "불교가 삼국에 전파되었어요"
    ],
    source: "2015 개정 교육과정 - 사회 5학년",
    lastVerified: "2025-01-08"
  },

  // 한국 지리
  {
    id: "social-elem-korea-geography",
    subject: "social-studies",
    topic: "Geography of Korea",
    topicKo: "한국의 지형",
    gradeLevel: "4",
    schoolLevel: "elementary",
    contentKo: `한반도는 삼면이 바다로 둘러싸여 있습니다.

지형 특징:
- 동쪽: 높은 산 (태백산맥, 동해)
- 서쪽: 낮은 평야 (서해)
- 남쪽: 많은 섬 (남해, 제주도)
- 산이 많아요 (70% 이상)

주요 산:
- 백두산 (2,744m, 최고봉)
- 한라산 (1,950m, 제주도)
- 지리산 (1,915m)

주요 강:
- 한강: 서울을 지나 서해로
- 낙동강: 남부 지역, 동해로
- 금강: 충청도 지역
- 영산강: 전라도 지역

기후:
- 사계절이 뚜렷해요
- 여름: 덥고 비가 많아요 (장마)
- 겨울: 춥고 건조해요`,
    examplesKo: [
      "동해: 깊고 파란 바다",
      "서해: 얕고 갯벌이 많아요",
      "제주도: 화산섬, 한라산"
    ],
    keyPointsKo: [
      "삼면이 바다 (동해, 서해, 남해)",
      "산이 많아요 (70% 이상)",
      "사계절이 뚜렷해요"
    ],
    source: "2015 개정 교육과정 - 사회 4학년",
    lastVerified: "2025-01-08"
  },

  // 대한민국 정부
  {
    id: "social-mid-korea-government",
    subject: "social-studies",
    topic: "Government of South Korea",
    topicKo: "대한민국 정부",
    gradeLevel: "6",
    schoolLevel: "middle",
    contentKo: `대한민국은 민주공화국입니다.

삼권분립:
1. 입법부 (국회): 법을 만들어요
   - 국회의원 300명
   - 임기: 4년
   - 법안 심의, 예산 심의

2. 행정부 (정부): 법을 집행해요
   - 대통령: 나라의 대표
   - 임기: 5년 (단임제)
   - 국무총리, 장관들

3. 사법부 (법원): 법을 해석하고 판결해요
   - 대법원, 고등법원, 지방법원
   - 독립적으로 판결

국민의 권리:
- 선거권: 만 18세 이상
- 언론의 자유
- 집회의 자유
- 재산권

국민의 의무:
- 납세의 의무
- 국방의 의무
- 교육의 의무`,
    examplesKo: [
      "국회: 국회의원들이 모여 법을 만들어요",
      "대통령: 5년 동안 나라를 이끌어요",
      "법원: 범죄자를 판결해요"
    ],
    keyPointsKo: [
      "삼권분립: 입법, 행정, 사법",
      "국민이 선거로 대표를 뽑아요",
      "권리와 의무가 있어요"
    ],
    source: "2015 개정 교육과정 - 사회 6학년",
    lastVerified: "2025-01-08"
  }
];
```

**작업량**:
- 한국사: 15개 (선사~현대)
- 한국 지리: 10개 (지형, 기후, 자원)
- 한국 정치/경제: 10개 (정부, 민주주의, 경제)
- 세계사/지리 한국어 번역: 20개
- 예상 시간: 2주

---

#### P1-3: RAG 품질 개선 시스템 구축

**Context Sufficiency Checker**:
```typescript
// lib/tutor/rag-quality-checker.ts (신규 파일)
interface QualityMetrics {
  sufficiency: number; // 0-1
  relevance: number; // 0-1
  diversity: number; // 0-1
  freshness: number; // 0-1
}

async function assessRAGQuality(
  question: string,
  retrievedContent: VerifiedContent[]
): Promise<QualityMetrics> {
  // 1. Sufficiency: 충분한 정보인가?
  const totalLength = retrievedContent.reduce((sum, c) => sum + (c.contentKo || c.content).length, 0);
  const sufficiency = Math.min(totalLength / 1000, 1.0); // 1000자 이상이면 충분

  // 2. Relevance: 질문과 관련 있는가?
  const relevanceScores = await Promise.all(
    retrievedContent.map(c => calculateSemanticSimilarity(question, c.contentKo || c.content))
  );
  const relevance = average(relevanceScores);

  // 3. Diversity: 다양한 관점인가?
  const uniqueTopics = new Set(retrievedContent.map(c => c.topic)).size;
  const diversity = uniqueTopics / retrievedContent.length;

  // 4. Freshness: 최신 정보인가?
  const avgAge = retrievedContent.reduce((sum, c) => {
    const verifiedDate = new Date(c.lastVerified);
    const ageInDays = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);
    return sum + ageInDays;
  }, 0) / retrievedContent.length;
  const freshness = Math.max(0, 1 - avgAge / 365); // 1년 이상 지나면 0

  return { sufficiency, relevance, diversity, freshness };
}

// 사용
const quality = await assessRAGQuality(question, retrievedContent);

if (quality.sufficiency < 0.7 || quality.relevance < 0.8) {
  console.log('[RAG Quality Low] Expanding search...');
  const expandedResults = await expandSearch(question, subject);
  return expandedResults;
}
```

---

### 📊 Priority 2: 중간 (5-8주)

#### P2-1: 국어 RAG 전체 학년 확충
- 초등 4-6학년: 20개
- 중학교 1-3학년: 30개
- 고등학교 1-3학년: 30개
- 예상 시간: 2주

#### P2-2: 수학/과학/사회 고등학교 콘텐츠 확충
- 수학: 미적분, 확률과 통계, 기하
- 과학: 물리학, 화학, 생명과학, 지구과학
- 사회: 한국사, 세계사, 사회문화, 윤리
- 예상 시간: 3주

#### P2-3: Multimodal RAG (이미지/동영상)
- 과학 실험 이미지
- 수학 그래프/도형
- 사회 지도/사진
- 예상 시간: 3주

---

### 🌟 Priority 3: 낮음 (9주+)

#### P3-1: 적응형 RAG (Adaptive RAG)
- 학생 학습 이력 기반 개인화
- 약한 부분 콘텐츠 우선 검색
- 예상 시간: 4주

#### P3-2: Real-time Knowledge Update
- 교육과정 변경 시 자동 업데이트
- 최신 과학 발견 반영
- 예상 시간: 4주

---

## 📋 전체 우선순위별 작업 목록

### 🔴 P0: 긴급 (1-2주, 즉시 시작)

| 순번 | 작업 | 과목 | 예상 시간 | 담당 | 상태 |
|------|------|------|-----------|------|------|
| P0-1 | 수학 RAG 한국어 전환 (초중등) | 수학 | 3-4일 | AI팀 | ⬜ 대기 |
| P0-2 | RAG Direct 재활성화 테스트 | 수학 | 1일 | AI팀 | ⬜ 대기 |
| P0-3 | 국어 RAG 콘텐츠 작성 (초1-3) | 국어 | 5-6일 | 교육팀 | ⬜ 대기 |
| P0-4 | 국어 튜터 API 개발 | 국어 | 2일 | 개발팀 | ⬜ 대기 |
| P0-5 | 국어 튜터 기본 UI 개발 | 국어 | 2일 | 프론트팀 | ⬜ 대기 |

**예상 완료**: 2주 후

---

### 🟡 P1: 높음 (3-4주)

| 순번 | 작업 | 과목 | 예상 시간 | 담당 | 상태 |
|------|------|------|-----------|------|------|
| P1-1 | 과학 RAG 한국어 전환 + NGSS | 과학 | 1주 | AI+교육팀 | ⬜ 대기 |
| P1-2 | 사회 RAG 한국 교육과정 재구성 | 사회 | 2주 | 교육팀 | ⬜ 대기 |
| P1-3 | RAG Quality Checker 구축 | 전체 | 3일 | AI팀 | ⬜ 대기 |
| P1-4 | Context Sufficiency 시스템 | 전체 | 3일 | AI팀 | ⬜ 대기 |
| P1-5 | Query Expansion 구현 | 전체 | 2일 | AI팀 | ⬜ 대기 |
| P1-6 | 학년 범위 안내 시스템 | 전체 | 1주 | AI+개발팀 | ⬜ 대기 |

**예상 완료**: 4주 후 (P0 이후)

---

### 📊 P2: 중간 (5-8주)

| 순번 | 작업 | 과목 | 예상 시간 | 담당 | 상태 |
|------|------|------|-----------|------|------|
| P2-1 | 국어 RAG 전체 학년 확충 | 국어 | 2주 | 교육팀 | ⬜ 대기 |
| P2-2 | 수학 고등/대학 콘텐츠 | 수학 | 1주 | 교육팀 | ⬜ 대기 |
| P2-3 | 과학 고등 콘텐츠 (물/화/생/지) | 과학 | 1.5주 | 교육팀 | ⬜ 대기 |
| P2-4 | 사회 고등 콘텐츠 (한/세/사/윤) | 사회 | 1.5주 | 교육팀 | ⬜ 대기 |
| P2-5 | RAG 평가 시스템 구축 | 전체 | 1주 | AI팀 | ⬜ 대기 |
| P2-6 | Multimodal RAG 설계 | 과학/수학 | 1주 | AI팀 | ⬜ 대기 |

**예상 완료**: 8주 후 (P1 이후)

---

### 🌟 P3: 낮음 (9주+)

| 순번 | 작업 | 과목 | 예상 시간 | 담당 | 상태 |
|------|------|------|-----------|------|------|
| P3-1 | 적응형 RAG 개발 | 전체 | 4주 | AI팀 | ⬜ 대기 |
| P3-2 | Real-time Update 시스템 | 전체 | 4주 | AI+DevOps | ⬜ 대기 |
| P3-3 | Multimodal RAG 구현 | 과학/수학 | 3주 | AI팀 | ⬜ 대기 |
| P3-4 | 대학교 전공 과목 RAG | 전체 | 8주+ | 교육팀 | ⬜ 대기 |

**예상 완료**: 16주+ 후 (P2 이후)

---

## 📈 기대 효과

### 정확도 개선
| 지표 | 현재 | P0 완료 후 | P1 완료 후 | P2 완료 후 |
|------|------|-----------|-----------|-----------|
| RAG 한국어 응답률 | 20% (영어만) | 100% (수학/국어) | 100% (전과목) | 100% |
| RAG Direct 비율 | 0% (비활성화) | 50% | 60% | 70% |
| 답변 정확도 | 85% | 92% | 95% | 98% |
| 평균 응답 속도 | 3.5초 | 2.0초 | 1.5초 | 1.2초 |

### 비용 절감
- RAG Direct 50% → API 호출 50% 감소
- 월 예상 비용: $75 → $37.5 (50% 절감)
- 연간 절감: $450

### 사용자 만족도
- 정확한 답변으로 신뢰도 상승
- 빠른 응답으로 학습 몰입도 향상
- 한국어 자연스러운 설명으로 이해도 증가

---

## 🎯 결론

### 즉시 착수 (이번 주)
1. **P0-1**: 수학 RAG 한국어 전환 시작
2. **P0-3**: 국어 RAG 콘텐츠 작성 시작

### 다음 단계 (2주 후)
1. **P1-1**: 과학 RAG 한국어 전환
2. **P1-2**: 사회 RAG 한국 교육과정 재구성
3. **P1-3~6**: RAG 품질 개선 시스템

### 장기 목표 (3개월 후)
1. 전 과목 고등학교까지 RAG 완성
2. Multimodal RAG 도입
3. 적응형 개인화 학습 경로

---

**문서 작성일**: 2025-01-08
**다음 리뷰**: P0 완료 후 (2주 후)
**최종 목표**: 99% 정확도 달성, 전 과목 완벽 지원
