# RAG 시스템 영어 응답 문제 수정

**문제 발견 일시**: 2025-01-08
**수정 완료 일시**: 2025-01-08
**영향 범위**: 수학 튜터

---

## 🔍 문제 설명

### 증상
사용자가 한국어로 "1더하기1은 왜 2야?"라고 질문했을 때, 영어로 답변이 반환됨:

```
Addition combines two or more numbers to find the total.

Symbols: + (plus sign), = (equals sign)

Basic concept:
- 3 + 2 = 5 (three plus two equals five)
...
```

### 사용자 경험
- 한국어 질문 → 영어 답변
- 교육 콘텐츠의 언어 불일치
- 학습 경험 저하

---

## 🔬 근본 원인 분석

### 1. RAG 시스템 구조

#### RAG Verified Content ([lib/tutor/rag-system.ts](lib/tutor/rag-system.ts:780-850))

```typescript
export const MATH_VERIFIED_CONTENT: VerifiedContent[] = [
  {
    id: "math-elem-addition",
    subject: "math",
    topic: "Addition",
    topicKo: "덧셈",  // ✅ 한국어
    gradeLevel: "1",
    schoolLevel: "elementary",
    content: `Addition combines two or more numbers to find the total.  // ❌ 영어

Symbols: + (plus sign), = (equals sign)
...`,
    examples: [...],  // ❌ 영어
    keyPoints: [...], // ❌ 영어
    source: "Common Core State Standards - Grade 1 Math",
    lastVerified: "2025-01-04"
  },
  // ... 더 많은 영어 콘텐츠
];
```

**문제점**:
- `topicKo`만 한국어로 번역됨
- `content`, `examples`, `keyPoints` 등 실제 교육 콘텐츠는 모두 영어

### 2. RAG Direct 응답 로직

#### Math API Route ([app/api/chat/math/route.ts](app/api/chat/math/route.ts:291-335))

```typescript
// 🚀 Phase 3: P1-1: RAG-First Strategy
const retrievedContext = await retrieveVerifiedContent(
  message,
  'math',
  gradeStr,
  3
);

if (retrievedContext.content.length > 0) {
  const avgConfidence = retrievedContext.content.reduce(
    (sum, c) => sum + (c.confidence ?? 1.0), 0
  ) / retrievedContext.content.length;

  // ❌ 문제 발생 지점
  if (avgConfidence > 0.9 && retrievedContext.content.length >= 2) {
    // RAG 콘텐츠를 그대로 반환 (영어)
    ragDirectAnswer = `📚 **검증된 교육 자료를 바탕으로 답변드려요:**

${retrievedContext.content.map(c => c.content).join('\n\n---\n\n')}

💡 더 궁금한 점이 있으시면 언제든 질문해주세요!`;

    // Gemini API 호출 없이 영어 콘텐츠 직접 반환
    return new Response(ragStream, {
      headers: {
        "X-RAG-Direct": "true",  // 🚨 RAG만 사용, AI 번역 없음
        "X-API-Saved": "4",
      },
    });
  }
}
```

**실행 흐름**:
1. 사용자 질문: "1더하기1은 왜 2야?" (한국어)
2. RAG 시스템이 "Addition" 토픽 매칭 (confidence = 1.0)
3. `avgConfidence > 0.9` 조건 충족
4. 영어 `content` 그대로 반환
5. Gemini AI 호출 없음 → 한국어 번역 없음

### 3. 로그 분석

개발 서버 로그에서 확인:
```
[Cache MISS] Question: "1더하기1은 왜 2야?..."
✅ Vertex AI gemini-2.5-flash generation complete
[RAG Direct] High confidence (1.00) - answering without API  // 🚨 여기서 문제 발생
[Cache SET] Cached response for: "1더하기1은 왜 2야?..."
POST /api/chat/math 200 in 7910ms
```

---

## ✅ 적용된 수정 사항

### 임시 수정: RAG Direct 비활성화

#### 수정 파일: [app/api/chat/math/route.ts](app/api/chat/math/route.ts:305-307)

```typescript
// BEFORE (문제 있는 코드)
if (avgConfidence > 0.9 && retrievedContext.content.length >= 2) {
  // 영어 콘텐츠 직접 반환
}

// AFTER (수정된 코드)
// 🚨 TEMPORARY FIX: Disable RAG Direct to prevent English responses to Korean questions
// TODO: Translate RAG content to Korean or use AI to translate before returning
if (false && avgConfidence > 0.9 && retrievedContext.content.length >= 2) {
  // RAG Direct 비활성화 - 항상 Gemini AI를 통해 한국어로 답변
}
```

### 효과

**이전**:
```
User: "1더하기1은 왜 2야?"
System: "Addition combines two or more numbers to find the total..."  // ❌ 영어
```

**수정 후**:
```
User: "1더하기1은 왜 2야?"
System: (Gemini AI 호출) → 한국어로 설명  // ✅ 한국어
```

---

## 📊 영향 범위

### 수정 전

| 과목 | RAG Direct 사용 | 영어 응답 가능성 |
|-----|---------------|----------------|
| Math | ✅ 활성화 | ❌ 높음 |
| English | ❌ 미구현 | - |
| Science | ❌ 미구현 | - |
| Social Studies | ❌ 미구현 | - |

### 수정 후

| 과목 | RAG Direct 사용 | 영어 응답 가능성 |
|-----|---------------|----------------|
| Math | ❌ 비활성화 | ✅ 없음 |
| English | ❌ 미구현 | - |
| Science | ❌ 미구현 | - |
| Social Studies | ❌ 미구현 | - |

---

## 🔮 향후 개선 방안

### Option 1: RAG 콘텐츠 한국어 번역 (권장)

**장점**:
- 99% 정확도의 검증된 콘텐츠 활용 가능
- API 비용 절감 (RAG Direct 사용 가능)
- 빠른 응답 속도

**작업 내용**:
1. `MATH_VERIFIED_CONTENT`의 모든 `content`, `examples`, `keyPoints`를 한국어로 번역
2. `contentKo`, `examplesKo`, `keyPointsKo` 필드 추가
3. RAG Direct 로직에서 한국어 필드 사용

```typescript
{
  id: "math-elem-addition",
  topic: "Addition",
  topicKo: "덧셈",
  content: `Addition combines two or more numbers...`,
  contentKo: `덧셈은 두 개 이상의 숫자를 합쳐서 전체를 구하는 것입니다.

기호: + (더하기 기호), = (같다 기호)

기본 개념:
- 3 + 2 = 5 (3 더하기 2는 5)
- 사과 3개 + 사과 2개 = 사과 5개

성질:
1. 교환법칙: 3 + 2 = 2 + 3 (순서가 바뀌어도 같음)
2. 항등원: 5 + 0 = 5 (0을 더해도 값이 안 바뀜)`,
  examples: [...],
  examplesKo: [...],
  // ...
}
```

### Option 2: AI 번역 레이어 추가

**장점**:
- 기존 영어 콘텐츠 유지
- 자동 번역으로 유지보수 간편

**단점**:
- 번역 품질 보장 어려움
- 추가 API 호출 필요

```typescript
if (avgConfidence > 0.9 && retrievedContext.content.length >= 2) {
  // Gemini AI로 영어 콘텐츠 한국어 번역
  const translatedContent = await translateToKorean(
    retrievedContext.content.map(c => c.content).join('\n\n')
  );

  ragDirectAnswer = `📚 **검증된 교육 자료를 바탕으로 답변드려요:**

${translatedContent}

💡 더 궁금한 점이 있으시면 언제든 질문해주세요!`;
}
```

### Option 3: 언어 감지 및 조건부 RAG Direct

**장점**:
- 영어 질문에는 RAG Direct 사용 (빠름)
- 한국어 질문에는 AI 번역 사용

```typescript
const detectedLanguage = detectLanguage(message); // 'ko' or 'en'

if (avgConfidence > 0.9 && retrievedContext.content.length >= 2) {
  if (detectedLanguage === 'en') {
    // 영어 질문 → 영어 콘텐츠 직접 반환
    ragDirectAnswer = retrievedContext.content.map(c => c.content).join('\n\n');
  } else {
    // 한국어 질문 → AI로 번역하거나 비활성화
    return useAIResponse();
  }
}
```

---

## 🧪 테스트 결과

### 수정 전
```
Request: POST /api/chat/math
Body: { message: "1더하기1은 왜 2야?", gradeLevel: "elementary" }

Response Headers:
  X-RAG-Direct: true
  X-API-Saved: 4

Response Body:
  📚 **검증된 교육 자료를 바탕으로 답변드려요:**

  Addition combines two or more numbers to find the total.

  Symbols: + (plus sign), = (equals sign)
  ...
```

### 수정 후
```
Request: POST /api/chat/math
Body: { message: "1더하기1은 왜 2야?", gradeLevel: "elementary" }

Response Headers:
  X-RAG-Direct: (없음)
  X-API-Used: gemini-2.5-flash

Response Body:
  (Gemini AI가 생성한 한국어 답변)

  안녕! 1+1이 왜 2인지 궁금하구나! 😊

  덧셈은 물건을 합치는 것이야.
  ...
```

---

## 📝 작업 이력

### 2025-01-08
- **발견**: 사용자 보고 - "1더하기1은 왜 2야?" 질문에 영어 답변
- **분석**: RAG 시스템 영어 콘텐츠 직접 반환 확인
- **수정**: RAG Direct 기능 임시 비활성화 (`if (false && ...)`)
- **테스트**: 로컬 개발 서버에서 정상 작동 확인
- **문서화**: 본 문서 작성

---

## 🔗 관련 파일

- [lib/tutor/rag-system.ts](lib/tutor/rag-system.ts:780-850) - RAG Verified Content 정의
- [app/api/chat/math/route.ts](app/api/chat/math/route.ts:286-335) - RAG Direct 로직
- [app/api/chat/english/route.ts](app/api/chat/english/route.ts) - 영어 튜터 (RAG Direct 미사용)
- [app/api/chat/science/route.ts](app/api/chat/science/route.ts) - 과학 튜터 (RAG Direct 미사용)
- [app/api/chat/social-studies/route.ts](app/api/chat/social-studies/route.ts) - 사회 튜터 (RAG Direct 미사용)

---

## ✅ 체크리스트

- [x] 문제 원인 파악
- [x] 임시 수정 적용 (RAG Direct 비활성화)
- [x] 로컬 테스트 완료
- [x] 문서화 완료
- [ ] 영구 해결 방안 선택 (Option 1/2/3)
- [ ] RAG 콘텐츠 한국어 번역 (Option 1 선택 시)
- [ ] Vercel 프로덕션 배포
- [ ] 프로덕션 테스트

---

**작성자**: Claude Code Agent
**검토자**: 사용자 피드백 대기
