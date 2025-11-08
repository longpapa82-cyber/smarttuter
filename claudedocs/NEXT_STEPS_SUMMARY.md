# 다음 단계 요약 (Next Steps Summary)

**날짜**: 2025-11-08
**현재 상태**: RAG Direct 비활성화 완료, Math 튜터 정상 작동
**작성자**: Claude

---

## 📊 현재 완료 상태

### ✅ 완료된 작업

1. **RAG 시스템 근본 문제 분석** ✅
   - 5 Why 분석 완료
   - 문제 원인: AI가 "basic" 같은 일반적 키워드 반환 → 모든 콘텐츠 매칭
   - 문서: [RAG_SYSTEM_ROOT_CAUSE_ANALYSIS_AND_FIX_PLAN.md](RAG_SYSTEM_ROOT_CAUSE_ANALYSIS_AND_FIX_PLAN.md)

2. **긴급 수정: RAG Direct 비활성화** ✅
   - Math 튜터에서 RAG Direct 완전 비활성화 (`if (false && ...`)
   - 항상 Gemini AI 사용하여 정확한 답변 보장
   - 문서: [EMERGENCY_FIX_RAG_DIRECT_DISABLED.md](EMERGENCY_FIX_RAG_DIRECT_DISABLED.md)

3. **Math RAG 한국어 콘텐츠** (3/30 완료) ✅
   - Addition (덧셈) - Grade 1
   - Fractions (분수) - Grade 3
   - Quadratic Equations (이차방정식) - Grade 9

4. **다른 튜터 검증** ✅
   - English, Science, Social Studies 튜터는 RAG Direct 사용 안 함
   - 모두 정상 작동 중

---

## 🎯 P0 - 긴급 우선순위 (1주 내 완료 목표)

### P0-1: Math RAG 한국어 콘텐츠 완성 (3/30 → 30/30)

**우선순위 순서**:

#### Phase 1: 초등 필수 (6개 항목)
1. ✅ Addition (덧셈) - Grade 1
2. ⬜ **Subtraction (뺄셈) - Grade 1** ← 다음 작업
3. ⬜ **Multiplication (곱셈) - Grade 3**
4. ⬜ **Division (나눗셈) - Grade 3**
5. ⬜ **Decimals (소수) - Grade 5**
6. ✅ Fractions (분수) - Grade 3

#### Phase 2: 중학 필수 (4개 항목)
7. ⬜ **Percentages (백분율) - Grade 6**
8. ⬜ **Linear Equations (일차방정식) - Grade 7**
9. ⬜ **Pythagorean Theorem (피타고라스 정리) - Grade 8**
10. ✅ Quadratic Equations (이차방정식) - Grade 9

#### Phase 3: 고등 주요 (6개 항목)
11. ⬜ **Functions (함수) - Grade 9**
12. ⬜ **Trigonometry (삼각함수) - Grade 10**
13. ⬜ Derivatives (미분) - Grade 12
14. ⬜ Logarithms (로그) - Grade 11
15. ⬜ Limits (극한) - Grade 12
16. ⬜ Integrals (적분) - Grade 12

**작업 방법**:
```typescript
// 각 항목에 추가할 필드:
contentKo?: string;      // 한국어 설명
examplesKo?: string[];   // 한국어 예시
keyPointsKo?: string[];  // 한국어 핵심 포인트

// 참고할 완성된 예시:
// - Addition: lib/tutor/rag-system.ts:786-857
// - Fractions: lib/tutor/rag-system.ts:861-934
// - Quadratic: lib/tutor/rag-system.ts:938-1027
```

**예상 시간**: 각 항목당 10-15분, 총 27개 × 12분 = ~5.4시간

---

### P0-2: RAG Direct 재활성화 조건 확인 ❌ (현재는 비활성화 유지)

**재활성화 금지 이유**:
- Semantic search 미구현
- Vector database 미구현
- 잘못된 콘텐츠 매칭 문제 미해결

**재활성화 조건**:
1. ✅ Vector Database 구축 (Pinecone or Supabase Vector)
2. ✅ Semantic Search 적용 (Vector embeddings)
3. ✅ A/B Testing 결과 95%+ 정확도
4. ✅ 사용자 피드백 시스템 구축
5. ✅ 자동 품질 검증 시스템

**현재 방침**: **절대 재활성화 금지** (false → true 변경 금지)

---

### P0-3: 국어 튜터 RAG 콘텐츠 (초1-3) ⬜

**목표**: 초등 1-3학년 국어 교육 콘텐츠 30개 항목

**콘텐츠 카테고리**:
1. **읽기** (10개)
   - 자음/모음 인식
   - 받침 읽기
   - 문장 읽기
   - 문단 읽기
   - 독해 전략

2. **쓰기** (10개)
   - 자음/모음 쓰기
   - 받침 쓰기
   - 문장 쓰기
   - 문단 쓰기
   - 일기 쓰기

3. **문법** (5개)
   - 명사/동사/형용사
   - 문장 구조
   - 높임말
   - 띄어쓰기
   - 맞춤법 기초

4. **어휘** (5개)
   - 기본 어휘
   - 반의어/유의어
   - 관용 표현
   - 속담 기초
   - 의성어/의태어

**우선순위**: P0-1 완료 후 시작

---

### P0-4: 국어 튜터 API 개발 ⬜

**파일**: `/app/api/chat/korean/route.ts` (신규 생성)

**기능 요구사항**:
- Gemini 2.5 Flash 사용
- 한국어 최적화 프롬프트
- RAG 시스템 통합 (국어 콘텐츠)
- **RAG Direct는 비활성화** (현재 정책)
- 학년별 맞춤 응답
- 문법 오류 친절한 교정

**참고 파일**:
- Math 튜터: `/app/api/chat/math/route.ts`
- English 튜터: `/app/api/chat/english/route.ts`

---

### P0-5: 국어 튜터 기본 UI ⬜

**파일**: `/app/tutor/korean/page.tsx` (신규 생성)

**UI 요구사항**:
- 학년 선택 (초1-초3)
- 텍스트 입력
- 음성 입력 (Web Speech API)
- 실시간 응답
- 학습 리포트 연동

**참고 파일**:
- Math 튜터 UI: `/app/tutor/math/page.tsx`
- English 튜터 UI: `/app/tutor/english/page.tsx`

---

## 🔄 P1 - 단기 우선순위 (2주 내)

### P1-1: Semantic Search POC

**목표**: Vector embeddings 기반 의미론적 검색 구현

**기술 스택**:
```typescript
// Option 1: OpenAI Embeddings + Pinecone
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

// Option 2: OpenAI Embeddings + Supabase Vector
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
```

**단계**:
1. Vector Database 선택 (Pinecone vs Supabase)
2. 기존 RAG 콘텐츠 → Vector embeddings 변환
3. Semantic search 함수 구현
4. A/B Testing with current system

---

### P1-2: 사용자 피드백 시스템

**목표**: 답변 정확도 평가 UI

**UI 컴포넌트**:
```typescript
<FeedbackButtons>
  <ThumbsUp onClick={() => recordFeedback('positive')} />
  <ThumbsDown onClick={() => recordFeedback('negative')} />
  <ReportButton onClick={() => openReportDialog()} />
</FeedbackButtons>
```

**데이터 저장**: Supabase or Redis

**활용**:
- RAG Direct 재활성화 결정 지표
- 콘텐츠 품질 개선 데이터
- A/B Testing 검증

---

### P1-3: E2E 테스트 작성

**목표**: 전체 튜터 자동 테스트

**테스트 케이스**:
```typescript
// Math Tutor
test('덧셈 질문 → 덧셈 답변', async () => {
  const response = await chatMath('1더하기1은왜2야?');
  expect(response).toContain('덧셈');
  expect(response).not.toContain('곱셈');
  expect(response).not.toContain('미적분');
});

// English Tutor
test('현재 시제 질문 → 현재 시제 답변', async () => {
  const response = await chatEnglish('What is present tense?');
  expect(response).toContain('present tense');
  expect(response).not.toContain('past tense');
});
```

**도구**: Playwright (이미 설치됨)

---

## 📈 P2 - 중기 우선순위 (1개월 내)

### P2-1: Vector Database 전체 마이그레이션

- 모든 RAG 콘텐츠 → Vector DB
- Semantic search 전면 적용
- 성능 최적화
- 비용 최적화

### P2-2: RAG Direct v2.0

- Semantic search 기반 재설계
- 적응형 confidence threshold
- 사용자 피드백 통합
- A/B Testing 검증

### P2-3: Advanced RAG

- ReRanking (Cohere Rerank)
- Query Fusion
- Multi-query retrieval
- Context compression

---

## 🚀 P3 - 장기 우선순위 (3개월 내)

### P3-1: Multi-modal RAG

- 이미지 + 텍스트 통합 검색
- 수학 그래프/도형 인식
- 과학 다이어그램 분석

### P3-2: Adaptive Learning

- 학생별 학습 이력 분석
- 취약점 자동 감지
- 개인화 학습 경로 생성

### P3-3: 실시간 협업 학습

- 다중 사용자 동시 학습
- 그룹 스터디 기능
- 실시간 질의응답

---

## 📝 즉시 시작 가능한 작업

### 1️⃣ Subtraction (뺄셈) 한국어 콘텐츠 추가

**파일**: `lib/tutor/rag-system.ts` Line 1086

**필요한 작업**:
```typescript
{
  id: "math-elem-subtraction",
  subject: "math",
  topic: "Subtraction",
  topicKo: "뺄셈",  // 추가
  gradeLevel: "1",
  schoolLevel: "elementary",
  content: `...`,  // 기존 영어 콘텐츠
  contentKo: `...`,  // ⬜ 한국어 콘텐츠 추가
  examples: [...],  // 기존 영어 예시
  examplesKo: [...],  // ⬜ 한국어 예시 추가
  keyPoints: [...],  // 기존 영어 핵심
  keyPointsKo: [...],  // ⬜ 한국어 핵심 추가
}
```

**예상 시간**: 10-15분

---

### 2️⃣ Math 튜터 정확도 검증 테스트

**테스트 질문**:
```
1. "1더하기1은왜2야?" → 덧셈 설명 ✓
2. "5곱하기3은?" → 곱셈 설명 (곱셈만!)
3. "10나누기2는?" → 나눗셈 설명 (나눗셈만!)
4. "분수가 뭐야?" → 분수 설명 (분수만!)
5. "이차방정식 풀어줘" → 이차방정식 설명 (이차방정식만!)
```

**검증 포인트**:
- ✅ 정확한 주제 답변
- ✅ 관련 없는 주제 언급 없음
- ✅ 한국어 친절한 설명
- ✅ 학년 수준에 맞는 설명

---

## 🎯 권장 작업 순서

**오늘 (11/08)**:
1. ✅ RAG Direct 비활성화 완료
2. ✅ 문제 분석 및 문서화 완료
3. ⬜ Math 튜터 정확도 검증 테스트 (사용자 테스트)

**내일 (11/09)**:
1. Subtraction (뺄셈) 한국어 콘텐츠 추가
2. Multiplication (곱셈) 한국어 콘텐츠 추가
3. Division (나눗셈) 한국어 콘텐츠 추가

**이번 주 (11/10-11/14)**:
1. 초등 수학 6개 항목 완성
2. 중학 수학 4개 항목 완성
3. E2E 테스트 작성

**다음 주 (11/15-11/21)**:
1. 고등 수학 6개 항목 완성
2. 국어 튜터 RAG 콘텐츠 30개 작성
3. Semantic Search POC 시작

---

## 📚 참고 문서

1. [RAG_SYSTEM_ROOT_CAUSE_ANALYSIS_AND_FIX_PLAN.md](RAG_SYSTEM_ROOT_CAUSE_ANALYSIS_AND_FIX_PLAN.md) - 근본 원인 분석
2. [EMERGENCY_FIX_RAG_DIRECT_DISABLED.md](EMERGENCY_FIX_RAG_DIRECT_DISABLED.md) - 긴급 수정 내역
3. [P0_PROGRESS_SUMMARY.md](P0_PROGRESS_SUMMARY.md) - P0 진행 상황

---

## ⚠️ 주의사항

### 절대 하지 말 것:
1. ❌ RAG Direct 재활성화 (`if (false && ...` → `if (true && ...`)
2. ❌ Confidence threshold 낮추기 (`>0.9` → `>0.7`)
3. ❌ Topic 매칭 필수 로직 제거

### 반드시 할 것:
1. ✅ 각 작업 완료 시 테스트
2. ✅ Git commit with clear message
3. ✅ 문서 업데이트
4. ✅ 사용자 피드백 수집

---

**최종 업데이트**: 2025-11-08 12:25 KST
**다음 작업**: Subtraction (뺄셈) 한국어 콘텐츠 추가
**서버 상태**: ✅ Running on http://localhost:3000
**RAG Direct**: ❌ DISABLED (정확성 우선)
