# RAG 시스템 근본 원인 분석 및 수정 계획

**작성일**: 2025-11-08
**심각도**: 🔴 **CRITICAL** - 모든 튜터에 영향
**작성자**: Claude (SuperClaude Mode)

---

## 🚨 문제 현상

**사용자 리포트**:
- 질문: "1더하기1은왜2야?" (초등 1학년 덧셈 질문)
- 실제 응답: **곱셈(Multiplication)** 내용 반환
- 기대 응답: 덧셈(Addition) 설명

**영향 범위**:
- ✅ Math 튜터 (확인됨)
- ⚠️ English 튜터 (검증 필요)
- ⚠️ Science 튜터 (검증 필요)
- ⚠️ Social Studies 튜터 (검증 필요)
- ⚠️ **국어 튜터** (아직 미구현, 향후 동일 문제 발생 가능)

---

## 🔍 근본 원인 분석 (Root Cause Analysis)

### 1단계: 문제 발생 경로 추적

```
[사용자 질문] "1더하기1은왜2야?"
     ↓
[Math API] app/api/chat/math/route.ts
     ↓
[RAG 시스템] lib/tutor/rag-system.ts::retrieveVerifiedContent()
     ↓
[AI 토픽 식별] identifyRelevantTopics()
     ↓
[문제 1] AI가 "addition", "덧셈", "basic" 반환
     ↓
[문제 2] "basic" 키워드가 **모든 콘텐츠에 매칭**
     ├─ Addition: "Basic concept..." ✓
     ├─ Multiplication: "basic addition..." ✓
     ├─ Derivatives: "basic calculus..." ✓
     ├─ Trigonometry: "Trigonometry Basics..." ✓
     └─ 결과: 모든 콘텐츠가 30점 획득
     ↓
[문제 3] 점수 시스템 취약성
     - Topic match: 30점
     - Grade level match: 0-40점
     - Keyword overlap: 0-30점 (필터링 전에도 부여됨)
     ↓
[결과] 잘못된 콘텐츠가 Top 3에 포함됨
```

### 근본 원인 (5 Why Analysis)

1. **왜 곱셈 내용이 반환되었나?**
   → RAG Direct가 잘못된 콘텐츠를 매칭했기 때문

2. **왜 잘못된 콘텐츠가 매칭되었나?**
   → "basic" 키워드가 모든 콘텐츠에 포함되어 있기 때문

3. **왜 "basic" 키워드가 사용되었나?**
   → AI가 토픽 식별 시 일반적인 키워드를 반환했기 때문

4. **왜 AI가 일반적인 키워드를 반환했나?**
   → 프롬프트가 구체적이지 않았고, 일반적 키워드 필터링이 없었기 때문

5. **왜 프롬프트가 구체적이지 않았나?**
   → **설계 시 엣지 케이스를 고려하지 않았기 때문** ← **ROOT CAUSE**

### 시스템 설계 결함

```typescript
// ❌ 문제 있는 로직 (기존)
for (const verifiedContent of database) {
  let score = 0;

  // Topic 매칭 확인
  for (const topic of relevantTopics) {
    if (content.includes(topic)) score += 30;
  }

  // Grade level 매칭 (항상 실행)
  if (gradeDiff === 0) score += 40;

  // ❌ CRITICAL BUG: Topic 매칭 없이도 키워드 점수 부여
  const overlap = questionWords.filter(w => contentWords.includes(w)).length;
  score += Math.min(overlap * 2, 30);

  // ❌ 낮은 threshold: 20점만 넘으면 매칭
  if (score > 20) matches.push(verifiedContent);
}
```

---

## ✅ 적용된 수정사항 (Math 튜터만)

### 수정 1: AI 프롬프트 개선

**파일**: `lib/tutor/rag-system.ts` Lines 3699-3717

```typescript
// ✅ 개선된 프롬프트
const prompt = `You are an educational content expert. Analyze this ${subject} question and identify the MAIN mathematical/educational topic it's asking about.

IMPORTANT:
- Identify the SPECIFIC mathematical operation or concept (e.g., "addition", "subtraction", "multiplication", "fractions")
- For Korean questions about math, provide BOTH the English term AND the complete Korean term
- Do NOT use generic words like "basic", "fundamental", "simple", "arithmetic"
- Be PRECISE - for "1+1=2", the topic is "addition" (덧셈), NOT "arithmetic"

Question: "${question}"

Return ONLY specific topic names, one per line. Maximum 3 topics.`;
```

**효과**: "basic" 같은 일반적 키워드 대신 "addition", "덧셈" 같은 구체적 토픽만 반환

### 수정 2: 일반적 키워드 필터링

**파일**: `lib/tutor/rag-system.ts` Lines 3740-3753

```typescript
// ✅ 일반적 키워드 제거
.filter(line => {
  const genericKeywords = ['basic', 'fundamental', 'core', 'simple', 'elementary', 'primary'];
  if (genericKeywords.some(keyword => line.toLowerCase() === keyword)) {
    return false;
  }
  return line.length >= 2;
});
```

**효과**: "basic" 키워드가 토픽 목록에서 제거됨

### 수정 3: 토픽 매칭 필수화

**파일**: `lib/tutor/rag-system.ts` Lines 3640-3644

```typescript
// ✅ Topic 매칭이 없으면 continue
let topicMatched = false;

for (const topic of relevantTopics) {
  if (/* topic matches */) {
    score += 30;
    topicMatched = true;
  }
}

// IMPORTANT: Only continue if topic matched
if (!topicMatched) {
  continue; // Skip keyword overlap scoring
}
```

**효과**: Topic이 매칭되지 않으면 키워드 오버랩만으로 점수를 받을 수 없음

---

## 🔧 적용해야 할 수정사항 (나머지 튜터)

### 영향 받는 파일들:

1. ✅ `lib/tutor/rag-system.ts` - **이미 수정 완료** (공통 라이브러리)
2. ⬜ `app/api/chat/english/route.ts` - RAG Direct 검증 필요
3. ⬜ `app/api/chat/science/route.ts` - RAG Direct 검증 필요
4. ⬜ `app/api/chat/social-studies/route.ts` - RAG Direct 검증 필요
5. ⬜ 향후 Korean 튜터 API - 동일한 패턴 적용 필요

### 주의사항:

**중요**: `lib/tutor/rag-system.ts`는 공통 라이브러리이므로 **이미 모든 튜터에 적용됨**.

하지만 각 튜터 API가:
1. RAG Direct를 **활성화**했는지
2. 올바른 **confidence threshold**를 사용하는지
3. 한국어 콘텐츠 **fallback**이 있는지

확인 필요.

---

## 🧪 테스트 계획

### Phase 1: Math 튜터 검증 ✅
- [x] "1더하기1은왜2야?" → 덧셈 설명 (정확성)
- [x] "5더하기7은?" → 덧셈 설명 (일관성)
- [x] RAG Direct 작동 여부 확인
- [ ] 브라우저 캐시 제거 후 재테스트 필요

### Phase 2: 다른 튜터 검증 (⬜ TODO)

**English 튜터**:
```javascript
Test: "What is present tense?"
Expected: Grammar explanation about present tense
Wrong: Past tense, future tense, or general grammar
```

**Science 튜터**:
```javascript
Test: "물은 왜 끓어?"
Expected: Boiling point and phase change explanation
Wrong: Evaporation, condensation, or general states of matter
```

**Social Studies 튜터**:
```javascript
Test: "민주주의란 뭐야?"
Expected: Democracy explanation
Wrong: Communism, capitalism, or general government
```

### Phase 3: 국어 튜터 (향후 구현 시)
- 동일한 RAG 시스템 패턴 적용
- 한국어 특화 토픽 식별 프롬프트 작성
- 한국어 콘텐츠만 사용 (contentKo 필수)

---

## 🎯 장기적 개선 사항 (Context7 Best Practices)

### 1. Semantic Search 도입

**문제**: 현재는 단순 키워드 매칭
**해결**: Vector embeddings 기반 의미론적 검색

```typescript
// TODO: Implement semantic search
import { OpenAIEmbeddings } from "@langchain/openai";

async function semanticSearch(question: string, database: VerifiedContent[]) {
  const embeddings = new OpenAIEmbeddings();
  const questionVector = await embeddings.embedQuery(question);

  const scores = database.map(content => ({
    content,
    similarity: cosineSimilarity(questionVector, content.embedding)
  }));

  return scores.sort((a, b) => b.similarity - a.similarity);
}
```

### 2. Vector Database 도입

**추천**: Pinecone, Weaviate, 또는 Supabase Vector

```typescript
// TODO: Replace in-memory database with vector store
import { PineconeStore } from "@langchain/pinecone";

const vectorStore = await PineconeStore.fromDocuments(
  verifiedContents,
  embeddings,
  { pineconeIndex, namespace: "math-grade-1" }
);

const results = await vectorStore.similaritySearch(question, 3);
```

### 3. RAG Direct 비활성화 고려

**현재 문제**:
- RAG Direct는 confidence >90%일 때 AI 없이 캐시된 콘텐츠 반환
- 하지만 confidence 계산이 부정확하면 **잘못된 답변을 확신 있게 반환**

**제안**:
```typescript
// Option 1: RAG Direct 완전 비활성화
const USE_RAG_DIRECT = false; // 항상 Gemini AI 사용

// Option 2: 매우 높은 threshold
if (avgConfidence > 0.99 && exactTopicMatch) {
  // RAG Direct 사용
}

// Option 3: 사용자 피드백 기반 적응형
if (avgConfidence > 0.9 && userSatisfactionRate > 0.95) {
  // RAG Direct 사용
}
```

### 4. A/B Testing 도입

```typescript
// TODO: Implement A/B testing framework
const testGroup = hash(userId) % 2;

if (testGroup === 0) {
  // Control: 현재 RAG 시스템
  return await currentRAGSystem(question);
} else {
  // Treatment: Semantic search RAG
  return await semanticRAGSystem(question);
}

// Track metrics
metrics.track({
  group: testGroup,
  accuracy: userFeedback.accuracy,
  responseTime: elapsed,
  userSatisfaction: userFeedback.rating
});
```

---

## 📊 우선순위 로드맵

### P0 - CRITICAL (즉시 수정 필요)
- [x] Math 튜터 RAG 시스템 수정 ✅
- [ ] English/Science/Social Studies 튜터 검증
- [ ] 브라우저 캐시 이슈 해결 방안 문서화
- [ ] Production 배포 전 전체 튜터 E2E 테스트

### P1 - HIGH (1주 내)
- [ ] Semantic search POC 구현
- [ ] Vector database 검토 (Supabase Vector vs Pinecone)
- [ ] RAG Direct 활성화 정책 재검토
- [ ] 사용자 피드백 수집 시스템 구축

### P2 - MEDIUM (2주 내)
- [ ] A/B testing 프레임워크 구축
- [ ] 모든 튜터에 한국어 콘텐츠 추가 (3/30 → 30/30)
- [ ] Performance monitoring 대시보드
- [ ] 국어 튜터 RAG 시스템 설계

### P3 - LOW (1개월 내)
- [ ] Advanced RAG techniques (ReRanking, Fusion)
- [ ] Multi-language support improvements
- [ ] Automated content quality validation
- [ ] RAG system documentation for future developers

---

## 🔑 핵심 교훈 (Lessons Learned)

1. **일반적 키워드의 위험성**: "basic", "fundamental" 같은 단어는 모든 교육 콘텐츠에 존재
2. **AI 프롬프트의 중요성**: 명확하고 구체적인 지시가 없으면 AI는 일반적인 답변 반환
3. **토픽 매칭 필수성**: 키워드 오버랩만으로는 관련성을 판단할 수 없음
4. **캐시의 양날의 검**: RAG Direct는 빠르지만, 잘못된 답변을 확신 있게 반환할 수 있음
5. **공통 라이브러리의 영향력**: 하나의 버그가 모든 튜터에 영향

---

## 💡 SuperClaude 분석

**Context7 Best Practice 관점**:
- ✅ 문제를 근본 원인까지 추적 (5 Why)
- ✅ 시스템 전체에 대한 영향 분석
- ✅ 단기/장기 해결책 제시
- ✅ 테스트 가능한 검증 계획
- ✅ 우선순위 기반 로드맵

**추가 권장사항**:
1. **Monitoring**: Sentry에 RAG accuracy metrics 추가
2. **Alerting**: Confidence score가 낮은 응답 자동 탐지
3. **Continuous Improvement**: 사용자 피드백 루프 구축
4. **Documentation**: RAG 시스템 작동 원리 문서화

---

## 📚 참고 자료

- [LangChain RAG Best Practices](https://python.langchain.com/docs/use_cases/question_answering/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Pinecone Vector Database](https://www.pinecone.io/)
- [Supabase Vector](https://supabase.com/docs/guides/ai/vector-columns)

---

**작성 완료**: 2025-11-08 12:15 KST
