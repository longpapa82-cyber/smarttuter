# Smart Tuter - 이후 우선순위별 로드맵
# Post-Completion Priority Roadmap

**현재 상태**: Week 1-4 튜터 정확도 향상 완료
**작성일**: 2025-01-04
**배포 URL**: https://smarttuter.vercel.app/

---

## 🎯 우선순위별 작업 계획

### 📌 P0: 즉시 실행 가능한 핵심 작업 (1-2시간)

#### P0-1: Enhanced System Prompt 프로덕션 적용 ⭐⭐⭐
**목표**: Week 4에서 생성한 Enhanced System Prompt를 실제 API에 적용

**현재 상태**:
- ✅ `enhanced-system-prompt.ts` 생성 완료 (358 lines)
- ✅ Week 1-3 정확도 시스템 모두 구현 완료
- ⚠️ 아직 API에 통합되지 않음

**작업 내용**:
1. `app/api/chat/english/route.ts` 업데이트
   - 기존 `generateSystemPrompt` → `generateEnhancedSystemPrompt`로 교체
   - RAG context 전달 (if available)
   - Chain-of-Thought 활성화

2. `app/api/chat/math/route.ts` 업데이트
   - 동일한 패턴으로 Enhanced Prompt 적용

**예상 결과**:
- 모든 정확도 시스템이 프롬프트 레벨에서 작동
- 더 명확한 교과/학년 경계
- 친근하고 교육적인 응답 톤

**코드 예시**:
```typescript
// Before
const systemPrompt = generateSystemPrompt(userProfile, 'english', cefrLevel);

// After
const systemPrompt = generateEnhancedSystemPrompt({
  subject: 'english',
  grade: userProfile.gradeLevelDetail || '5',
  schoolLevel: userProfile.gradeLevel,
  includeChainOfThought: true,
  includeRAGContext: false // Week 3 RAG 시스템 연결 시 true
});
```

**예상 시간**: 30분
**우선순위**: ⭐⭐⭐ (최우선)

---

#### P0-2: 배포된 서비스 기능 테스트 및 검증
**목표**: 현재 프로덕션 서비스가 정상 작동하는지 확인

**작업 내용**:
1. https://smarttuter.vercel.app/ 접속
2. 회원가입/로그인 테스트
3. English Park 기능 테스트
   - 영어 질문 → 정상 답변 확인
   - 수학 질문 → "Math Park로 가세요" 안내 확인
4. Math Park 기능 테스트
   - 수학 질문 → 정상 답변 확인
   - 영어 질문 → "English Park로 가세요" 안내 확인
5. 학년 수준 검증 테스트
   - 현재 학년보다 높은 질문 → 선행학습 방지 메시지 확인

**예상 결과**:
- 모든 핵심 기능 정상 작동 확인
- 문제 발견 시 즉시 수정

**예상 시간**: 30분
**우선순위**: ⭐⭐⭐

---

#### P0-3: README 업데이트 및 사용자 가이드 작성
**목표**: 프로젝트 README를 최신 상태로 업데이트

**작업 내용**:
1. `README.md` 업데이트
   - 최신 기능 설명
   - 튜터 정확도 향상 시스템 소개
   - 배포 URL 명시
   - 기술 스택 업데이트

2. 사용자 가이드 작성 (한글)
   - 서비스 시작 방법
   - 영어/수학 튜터 사용법
   - 학년별 사용 팁
   - FAQ

**예상 결과**:
- 신규 사용자가 쉽게 시작 가능
- 프로젝트 이해도 향상

**예상 시간**: 1시간
**우선순위**: ⭐⭐

---

### 📌 P1: 단기 개선 작업 (2-4시간)

#### P1-1: RAG 시스템 프로덕션 통합 ⭐⭐
**목표**: Week 3 RAG 시스템을 API에 연결

**현재 상태**:
- ✅ `rag-system.ts` 완성 (670 lines)
- ✅ 7개 verified content entries
- ⚠️ API에서 아직 사용하지 않음

**작업 내용**:
1. API 요청 시 질문 분석
2. `retrieveVerifiedContent()` 호출
3. 관련 콘텐츠 검색 (relevance score 기반)
4. RAG context를 Enhanced System Prompt에 포함
5. 응답 생성 시 verified content 기반으로 답변

**예상 효과**:
- 답변 정확도 크게 향상 (99% 목표)
- 검증된 정보만 제공
- 환각(hallucination) 방지

**예상 시간**: 2시간
**우선순위**: ⭐⭐

---

#### P1-2: Chain-of-Thought 응답 포맷 적용
**목표**: 복잡한 질문에 대해 단계별 풀이 제공

**작업 내용**:
1. 질문 복잡도 판단 로직 추가
2. 복잡한 질문 → `generateChainOfThought()` 호출
3. 단계별 풀이 포맷으로 응답 생성
4. 학생 친화적 포맷팅

**예상 효과**:
- 학생이 풀이 과정을 이해
- 교육적 가치 증대
- 단순 정답 제공 → 학습 지원

**예상 시간**: 1.5시간
**우선순위**: ⭐⭐

---

#### P1-3: Answer Verifier 적용
**목표**: 모든 응답을 7단계 검증 후 제공

**작업 내용**:
1. 응답 생성 후 `verifyAnswer()` 호출
2. 검증 실패 시 fallback 메시지
3. 낮은 confidence 시 "확실하지 않아요" 안내
4. 검증 로그 기록 (모니터링용)

**예상 효과**:
- 품질 낮은 응답 필터링
- 학생에게 신뢰할 수 있는 답변만 제공
- 환각 방지

**예상 시간**: 1시간
**우선순위**: ⭐⭐

---

#### P1-4: 검증된 콘텐츠 확장
**목표**: Verified content entries 7개 → 30개 이상 확장

**작업 내용**:
1. 자주 묻는 질문 분석
2. 각 학년별 핵심 주제 식별
3. 검증된 콘텐츠 작성 (출처 명시)
4. `rag-system.ts`에 추가

**예상 효과**:
- RAG 시스템 효과 극대화
- 더 많은 질문에 검증된 답변 제공

**예상 시간**: 2시간 (주제당 10분)
**우선순위**: ⭐⭐

---

### 📌 P2: 중기 확장 작업 (1-2일)

#### P2-1: 과학 (Science) 튜터 추가
**목표**: 영어, 수학에 이어 과학 튜터 런칭

**작업 내용**:
1. 과학 교육과정 데이터베이스 구축
   - 물리, 화학, 생물, 지구과학
   - K-12 주제 정리
2. `/app/api/chat/science/route.ts` 생성
3. Science Park UI 추가
4. 테스트 및 검증

**예상 효과**:
- 교과 범위 확장
- 더 많은 학생 지원

**예상 시간**: 1일
**우선순위**: ⭐

---

#### P2-2: 사회 (Social Studies) 튜터 추가
**목표**: 사회 (역사, 지리, 경제, 정치) 튜터 추가

**작업 내용**:
1. 사회 교육과정 데이터베이스
2. API 및 UI 구현
3. 테스트

**예상 시간**: 1일
**우선순위**: ⭐

---

#### P2-3: 학습 분석 대시보드
**목표**: 학생별 학습 패턴 분석 및 시각화

**작업 내용**:
1. 질문 카테고리별 통계
2. 학년 수준 적합도 그래프
3. 취약 영역 식별
4. 추천 학습 주제

**예상 효과**:
- 학생이 자신의 학습 상태 파악
- 맞춤형 학습 경로 제공

**예상 시간**: 1.5일
**우선순위**: ⭐

---

#### P2-4: 다국어 지원 (영어 UI)
**목표**: 한국어 + 영어 UI 제공

**작업 내용**:
1. i18n 설정 (next-i18next)
2. 모든 UI 텍스트 번역
3. 언어 전환 기능
4. 다국어 교육과정 지원

**예상 효과**:
- 글로벌 사용자 확대
- 해외 학생 지원

**예상 시간**: 1일
**우선순위**: ⭐

---

### 📌 P3: 장기 고도화 작업 (1주 이상)

#### P3-1: 개인화 학습 시스템
**목표**: 학생별 맞춤형 학습 경험

**작업 내용**:
1. 학습 스타일 분석
2. 설명 방식 최적화
3. 난이도 자동 조절
4. 개인별 커리큘럼 추천

**예상 효과**:
- 학습 효율 극대화
- 학생별 최적화된 경험

**예상 시간**: 1주
**우선순위**: ⭐

---

#### P3-2: AI 음성 튜터 (TTS + STT)
**목표**: 음성으로 질문하고 답변 듣기

**작업 내용**:
1. Speech-to-Text 통합 (Whisper API)
2. Text-to-Speech 통합 (Google TTS)
3. 실시간 음성 대화
4. 발음 평가 (영어)

**예상 효과**:
- 더 자연스러운 학습 경험
- 회화 연습 지원

**예상 시간**: 1주
**우선순위**: ⭐

---

#### P3-3: 멀티미디어 지원
**목표**: 이미지, 그래프, 도표 자동 생성

**작업 내용**:
1. Mermaid.js 통합 (그래프, 다이어그램)
2. Math rendering (LaTeX, KaTeX)
3. 이미지 생성 (DALL-E 또는 Stable Diffusion)
4. Interactive visualizations

**예상 효과**:
- 시각적 학습 지원
- 복잡한 개념 쉽게 이해

**예상 시간**: 5일
**우선순위**: ⭐

---

#### P3-4: 협력 학습 기능
**목표**: 여러 학생이 함께 학습

**작업 내용**:
1. 그룹 채팅 기능
2. 퀴즈/문제 공유
3. 학습 진도 비교
4. 친구 초대 시스템

**예상 효과**:
- 학습 동기 증대
- 경쟁/협력을 통한 성장

**예상 시간**: 1주
**우선순위**: ⭐

---

#### P3-5: 모바일 앱 (React Native)
**목표**: iOS/Android 네이티브 앱

**작업 내용**:
1. React Native 프로젝트 설정
2. API 연동
3. 모바일 최적화 UI
4. 푸시 알림 (학습 리마인더)
5. 앱 스토어 배포

**예상 효과**:
- 모바일 접근성 향상
- 더 많은 사용자 도달

**예상 시간**: 2주
**우선순위**: ⭐

---

## 📊 우선순위 매트릭스

### 즉시 실행 (P0) - 오늘 완료 가능
| 작업 | 시간 | 난이도 | 효과 | 우선순위 |
|------|------|--------|------|----------|
| P0-1: Enhanced Prompt 적용 | 30분 | 쉬움 | 높음 | ⭐⭐⭐ |
| P0-2: 서비스 테스트 | 30분 | 쉬움 | 높음 | ⭐⭐⭐ |
| P0-3: README 업데이트 | 1시간 | 쉬움 | 중간 | ⭐⭐ |

### 단기 실행 (P1) - 1-2일 내 완료
| 작업 | 시간 | 난이도 | 효과 | 우선순위 |
|------|------|--------|------|----------|
| P1-1: RAG 통합 | 2시간 | 중간 | 매우 높음 | ⭐⭐ |
| P1-2: Chain-of-Thought | 1.5시간 | 중간 | 높음 | ⭐⭐ |
| P1-3: Answer Verifier | 1시간 | 중간 | 높음 | ⭐⭐ |
| P1-4: 콘텐츠 확장 | 2시간 | 쉬움 | 중간 | ⭐⭐ |

### 중기 실행 (P2) - 1주 내 완료
| 작업 | 시간 | 난이도 | 효과 | 우선순위 |
|------|------|--------|------|----------|
| P2-1: 과학 튜터 | 1일 | 중간 | 높음 | ⭐ |
| P2-2: 사회 튜터 | 1일 | 중간 | 중간 | ⭐ |
| P2-3: 학습 대시보드 | 1.5일 | 중간 | 높음 | ⭐ |
| P2-4: 다국어 지원 | 1일 | 중간 | 높음 | ⭐ |

### 장기 실행 (P3) - 1주 이상
| 작업 | 시간 | 난이도 | 효과 | 우선순위 |
|------|------|--------|------|----------|
| P3-1: 개인화 학습 | 1주 | 어려움 | 매우 높음 | ⭐ |
| P3-2: 음성 튜터 | 1주 | 어려움 | 높음 | ⭐ |
| P3-3: 멀티미디어 | 5일 | 중간 | 높음 | ⭐ |
| P3-4: 협력 학습 | 1주 | 어려움 | 중간 | ⭐ |
| P3-5: 모바일 앱 | 2주 | 어려움 | 매우 높음 | ⭐ |

---

## 🎯 권장 실행 순서

### 오늘 (2-3시간)
1. ✅ P0-1: Enhanced System Prompt 프로덕션 적용
2. ✅ P0-2: 서비스 기능 테스트
3. ✅ P0-3: README 업데이트

### 내일 (4-6시간)
4. ✅ P1-1: RAG 시스템 통합
5. ✅ P1-2: Chain-of-Thought 적용
6. ✅ P1-3: Answer Verifier 적용

### 이번 주 (2-3일)
7. ✅ P1-4: 검증된 콘텐츠 확장 (30개 이상)
8. ✅ P2-3: 학습 분석 대시보드

### 다음 주 (1주)
9. P2-1: 과학 튜터 추가
10. P2-2: 사회 튜터 추가
11. P2-4: 다국어 지원

### 다음 달 (1개월)
12. P3-1: 개인화 학습 시스템
13. P3-2: AI 음성 튜터
14. P3-3: 멀티미디어 지원

---

## 💡 즉시 시작 가능한 작업

### 🚀 지금 바로 시작하기 (P0-1)

**Enhanced System Prompt 프로덕션 적용** - 30분 소요

1. `app/api/chat/english/route.ts` 열기
2. Line 226 찾기:
   ```typescript
   const systemPrompt = generateSystemPrompt(userProfile, 'english', cefrLevel);
   ```

3. 다음으로 교체:
   ```typescript
   import { generateEnhancedSystemPrompt } from "@/lib/tutor/enhanced-system-prompt";

   const systemPrompt = generateEnhancedSystemPrompt({
     subject: 'english',
     grade: userProfile.gradeLevelDetail || '5',
     schoolLevel: userProfile.gradeLevel,
     studentName: userId,
     includeChainOfThought: true,
     includeRAGContext: false // P1-1 완료 후 true로
   });
   ```

4. Math API도 동일하게 적용
5. 빌드 테스트: `npm run build`
6. 로컬 테스트: `npm run dev`
7. 배포: `vercel --prod`

**예상 결과**:
- 더 명확한 튜터 정체성
- 친근하고 교육적인 톤
- 학년/교과 경계 강화

---

## 📝 다음 액션 아이템

**지금 바로 시작할 수 있는 것**:
1. ✅ Enhanced System Prompt 프로덕션 적용 (30분)
2. ✅ 서비스 테스트 및 검증 (30분)
3. ✅ README 업데이트 (1시간)

**오늘 완료 목표**: P0-1, P0-2, P0-3 (총 2시간)

---

**질문이 있으시거나 특정 작업을 먼저 진행하고 싶으시면 말씀해주세요!** 🚀
