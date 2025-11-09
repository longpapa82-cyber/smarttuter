# 남은 개발 작업 우선순위

생성일: 2025-11-09 20:35 KST
배포 URL: https://aipark.vercel.app

---

## 🎯 현재 상태

### ✅ 완료된 주요 작업
- Priority 1 작업 100% 완료
- 5개 과목 튜터 구현 (English, Math, Science, Social, Korean)
- Beta 배지 시스템 적용
- Kakao OAuth 설정 (배포 대기 중)
- 프로덕션 배포 완료
- 반응형 디자인 적용

### ⏳ 진행 중
- Kakao 로그인 재배포 (자동 스크립트 실행 중, 22:31 완료 예상)

---

## 📌 P0: 긴급 & 즉시 실행 (1-3시간)

### 🔴 P0-1: Kakao 로그인 테스트 및 검증 ⭐⭐⭐
**목표**: 재배포 완료 후 OAuth 로그인 정상 작동 확인

**현재 상태**:
- ✅ 환경 변수 설정 완료
- ✅ Redirect URI 등록 완료 (5개 도메인)
- ⏳ 자동 배포 스크립트 실행 중 (22:31 완료 예정)

**작업 내용**:
1. 배포 완료 확인 (22:31 이후)
2. 시크릿 모드로 https://aipark.vercel.app/login 접속
3. 카카오 로그인 테스트
4. Google 로그인 테스트
5. 일반 이메일 로그인 테스트

**예상 시간**: 30분
**우선순위**: ⭐⭐⭐ (최우선)

---

### 🔴 P0-2: 임시 파일 정리 및 워크스페이스 정돈 ⭐⭐⭐
**목표**: 개발 과정에서 생성된 임시 파일 정리

**작업 내용**:
1. `.vercel-redeploy` 파일 삭제 또는 .gitignore 추가
2. `deployment.log` 파일 삭제
3. `nohup.out` 파일 정리
4. `scripts/` 디렉토리의 임시 스크립트 정리
5. claudedocs/ 중복 문서 정리

**예상 시간**: 15분
**우선순위**: ⭐⭐⭐

---

### 🟡 P0-3: 프로덕션 기능 전체 테스트 ⭐⭐
**목표**: 배포된 서비스의 모든 기능 검증

**테스트 항목**:
1. **인증**
   - [x] 회원가입
   - [ ] 이메일 로그인
   - [ ] Google OAuth
   - [ ] Kakao OAuth (배포 후)

2. **Dashboard**
   - [ ] Total Dashboard 접속
   - [ ] English Dashboard (Beta 배지 확인)
   - [ ] Math Dashboard (Beta 배지 확인)
   - [ ] Science Dashboard (Beta 배지 확인)
   - [ ] Social Dashboard (Beta 배지 확인)
   - [ ] Korean Dashboard

3. **Tutor 기능**
   - [ ] English Tutor (음성 인식)
   - [ ] Math Tutor (이미지 업로드)
   - [ ] Science Tutor
   - [ ] Social Tutor
   - [ ] Korean Tutor

4. **학습 통계**
   - [ ] 학습 시간 기록
   - [ ] 레포트 생성
   - [ ] 진행률 표시

**예상 시간**: 1시간
**우선순위**: ⭐⭐

---

### 🟡 P0-4: README 업데이트 ⭐⭐
**목표**: 프로젝트 문서 최신화

**작업 내용**:
1. README.md 업데이트
   - 프로젝트 소개
   - 기능 목록 (5개 과목)
   - 기술 스택
   - 배포 URL
   - 스크린샷

2. 환경 변수 가이드
   - .env.example 확인
   - Vercel 배포 가이드

3. 기여 가이드 (선택)

**예상 시간**: 1시간
**우선순위**: ⭐⭐

---

## 📌 P1: 단기 개선 (2-6시간)

### 🟢 P1-1: Enhanced System Prompt 프로덕션 적용 ⭐⭐
**목표**: Week 4 Enhanced Prompt를 API에 통합

**현재 상태**:
- ✅ `enhanced-system-prompt.ts` 생성 완료
- ⚠️ API에 아직 통합 안 됨

**작업 내용**:
1. `app/api/chat/english/route.ts` 업데이트
2. `app/api/chat/math/route.ts` 업데이트
3. `app/api/chat/science/route.ts` 업데이트
4. `app/api/chat/social/route.ts` 업데이트
5. `app/api/chat/korean/route.ts` 업데이트

**코드 변경**:
```typescript
// Before
const systemPrompt = generateSystemPrompt(userProfile, 'english', cefrLevel);

// After
import { generateEnhancedSystemPrompt } from "@/lib/tutor/enhanced-system-prompt";

const systemPrompt = generateEnhancedSystemPrompt({
  subject: 'english',
  grade: userProfile.gradeLevelDetail || '5',
  schoolLevel: userProfile.gradeLevel,
  includeChainOfThought: true,
  includeRAGContext: false
});
```

**예상 효과**:
- 더 명확한 튜터 정체성
- 친근하고 교육적인 응답
- 학년/교과 경계 강화

**예상 시간**: 1시간
**우선순위**: ⭐⭐

---

### 🟢 P1-2: RAG 시스템 프로덕션 통합 ⭐⭐
**목표**: 검증된 콘텐츠 기반 답변 제공

**현재 상태**:
- ✅ `rag-system.ts` 완성
- ✅ 검증된 콘텐츠 일부 작성 완료
- ⚠️ API에 연결 안 됨

**작업 내용**:
1. 질문 분석 후 `retrieveVerifiedContent()` 호출
2. 관련 콘텐츠를 Enhanced Prompt에 포함
3. RAG context 기반 응답 생성
4. 검증 로그 기록

**예상 효과**:
- 답변 정확도 99% 목표
- 환각(hallucination) 방지
- 검증된 정보만 제공

**예상 시간**: 2시간
**우선순위**: ⭐⭐

---

### 🟢 P1-3: 검증된 콘텐츠 확장 ⭐
**목표**: RAG 콘텐츠 7개 → 50개 이상 확장

**작업 내용**:
1. 각 과목별 핵심 주제 선정
   - English: 문법, 어휘, 회화 (10개)
   - Math: 연산, 대수, 기하 (10개)
   - Science: 물리, 화학, 생물 (10개)
   - Social: 역사, 지리, 경제 (10개)
   - Korean: 문법, 문학, 작문 (10개)

2. 검증된 출처 기반 콘텐츠 작성
3. `rag-system.ts`에 추가
4. 테스트 및 검증

**예상 시간**: 4시간 (주제당 5분)
**우선순위**: ⭐

---

### 🟢 P1-4: Answer Verifier 적용 ⭐
**목표**: 7단계 검증 시스템 활성화

**작업 내용**:
1. 모든 응답에 `verifyAnswer()` 호출
2. 검증 실패 시 fallback 메시지
3. 낮은 confidence → "확실하지 않아요" 안내
4. 검증 로그 저장

**예상 효과**:
- 품질 낮은 응답 필터링
- 학생에게 신뢰성 높은 답변만 제공

**예상 시간**: 1.5시간
**우선순위**: ⭐

---

### 🟢 P1-5: Chain-of-Thought 응답 포맷 적용 ⭐
**목표**: 복잡한 질문에 단계별 풀이 제공

**작업 내용**:
1. 질문 복잡도 판단 로직
2. 복잡한 질문 → `generateChainOfThought()` 호출
3. 단계별 풀이 포맷으로 응답
4. 학생 친화적 마크다운

**예상 효과**:
- 학생이 풀이 과정 이해
- 교육적 가치 증대

**예상 시간**: 1.5시간
**우선순위**: ⭐

---

### 🟢 P1-6: 성능 최적화 ⭐
**목표**: 응답 속도 및 로딩 개선

**작업 내용**:
1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용
   - WebP 포맷 변환
   - Lazy loading

2. **번들 크기 최적화**
   - Dynamic imports
   - Code splitting
   - Tree shaking 확인

3. **API 응답 속도**
   - Redis 캐싱 활용
   - Response streaming 최적화

4. **Lighthouse 점수 개선**
   - Performance: 90+ 목표
   - Accessibility: 95+ 목표
   - Best Practices: 95+ 목표
   - SEO: 100 목표

**예상 시간**: 2시간
**우선순위**: ⭐

---

## 📌 P2: 중기 확장 (1-3일)

### 🔵 P2-1: 학습 분석 대시보드 고도화 ⭐
**목표**: 학생별 상세 학습 분석 제공

**작업 내용**:
1. **학습 패턴 분석**
   - 질문 카테고리별 통계
   - 시간대별 학습 패턴
   - 주간/월간 학습량

2. **취약 영역 식별**
   - 과목별 이해도
   - 반복 질문 분석
   - 오답률 높은 주제

3. **맞춤형 추천**
   - 다음 학습 주제
   - 복습 필요 항목
   - 추천 학습 시간

4. **시각화**
   - Chart.js 또는 Recharts
   - 진행률 그래프
   - 학습 히트맵

**예상 시간**: 1.5일
**우선순위**: ⭐

---

### 🔵 P2-2: 다국어 지원 (i18n) ⭐
**목표**: 한국어 + 영어 UI 제공

**작업 내용**:
1. next-i18next 설정
2. 모든 UI 텍스트 번역 파일 생성
3. 언어 전환 기능 추가
4. SEO 다국어 최적화

**예상 시간**: 1일
**우선순위**: ⭐

---

### 🔵 P2-3: 모바일 최적화 개선 ⭐
**목표**: 모바일 UX 대폭 개선

**작업 내용**:
1. 터치 인터페이스 최적화
2. 모바일 음성 인식 개선
3. 작은 화면 레이아웃 조정
4. PWA 기능 추가
   - 오프라인 지원
   - 홈 화면 추가
   - 푸시 알림

**예상 시간**: 1일
**우선순위**: ⭐

---

### 🔵 P2-4: 소셜 로그인 확장 ⭐
**목표**: Apple, Naver, GitHub 로그인 추가

**작업 내용**:
1. Apple Sign In 통합
2. Naver OAuth 통합
3. GitHub OAuth 통합 (개발자용)
4. 통합 테스트

**예상 시간**: 4시간
**우선순위**: ⭐

---

## 📌 P3: 장기 고도화 (1주 이상)

### ⚪ P3-1: AI 음성 튜터 (TTS + STT) ⭐
**목표**: 완전한 음성 기반 학습 경험

**작업 내용**:
1. Whisper API 통합 (STT)
2. Google TTS 통합
3. 실시간 음성 대화
4. 발음 평가 시스템 (영어)
5. 음성 명령 지원

**예상 시간**: 1주
**우선순위**: ⭐

---

### ⚪ P3-2: 개인화 학습 시스템 ⭐
**목표**: AI 기반 맞춤형 학습 경로

**작업 내용**:
1. 학습 스타일 분석 AI
2. 설명 방식 자동 최적화
3. 난이도 동적 조절
4. 개인별 커리큘럼 생성

**예상 시간**: 1주
**우선순위**: ⭐

---

### ⚪ P3-3: 멀티미디어 지원 강화 ⭐
**목표**: 시각적 학습 자료 자동 생성

**작업 내용**:
1. Mermaid.js 통합 (다이어그램)
2. Math rendering (LaTeX)
3. 이미지 생성 (DALL-E)
4. Interactive visualizations

**예상 시간**: 5일
**우선순위**: ⭐

---

### ⚪ P3-4: 협력 학습 기능 ⭐
**목표**: 그룹 학습 지원

**작업 내용**:
1. 그룹 채팅 기능
2. 퀴즈/문제 공유
3. 친구 초대 시스템
4. 리더보드

**예상 시간**: 1주
**우선순위**: ⭐

---

### ⚪ P3-5: 모바일 앱 (React Native) ⭐
**목표**: iOS/Android 네이티브 앱

**작업 내용**:
1. React Native 프로젝트 설정
2. API 연동
3. 모바일 최적화 UI
4. 푸시 알림
5. 앱 스토어 배포

**예상 시간**: 2주
**우선순위**: ⭐

---

## 🎯 권장 실행 순서

### 🔥 오늘 (22:30 이후, 2-3시간)
1. ✅ P0-1: Kakao 로그인 테스트
2. ✅ P0-2: 임시 파일 정리
3. ✅ P0-3: 전체 기능 테스트

### 📅 내일 (4-6시간)
4. ✅ P0-4: README 업데이트
5. ✅ P1-1: Enhanced System Prompt 적용
6. ✅ P1-2: RAG 시스템 통합

### 📆 이번 주 (2-3일)
7. ✅ P1-3: 검증된 콘텐츠 확장 (50개)
8. ✅ P1-4: Answer Verifier 적용
9. ✅ P1-5: Chain-of-Thought 적용
10. ✅ P1-6: 성능 최적화

### 📅 다음 주 (1주)
11. P2-1: 학습 분석 대시보드
12. P2-2: 다국어 지원
13. P2-3: 모바일 최적화
14. P2-4: 소셜 로그인 확장

### 📅 다음 달 (1개월)
15. P3-1: AI 음성 튜터
16. P3-2: 개인화 학습 시스템
17. P3-3: 멀티미디어 지원
18. P3-4: 협력 학습 기능
19. P3-5: 모바일 앱

---

## 📊 우선순위 매트릭스

| 우선순위 | 작업 | 시간 | 효과 | 난이도 |
|---------|------|------|------|--------|
| P0-1 ⭐⭐⭐ | Kakao 로그인 테스트 | 30분 | 높음 | 쉬움 |
| P0-2 ⭐⭐⭐ | 임시 파일 정리 | 15분 | 중간 | 쉬움 |
| P0-3 ⭐⭐ | 전체 기능 테스트 | 1시간 | 높음 | 쉬움 |
| P0-4 ⭐⭐ | README 업데이트 | 1시간 | 중간 | 쉬움 |
| P1-1 ⭐⭐ | Enhanced Prompt | 1시간 | 매우 높음 | 쉬움 |
| P1-2 ⭐⭐ | RAG 통합 | 2시간 | 매우 높음 | 중간 |
| P1-3 ⭐ | 콘텐츠 확장 | 4시간 | 높음 | 쉬움 |
| P1-4 ⭐ | Answer Verifier | 1.5시간 | 높음 | 중간 |
| P1-5 ⭐ | Chain-of-Thought | 1.5시간 | 높음 | 중간 |
| P1-6 ⭐ | 성능 최적화 | 2시간 | 높음 | 중간 |

---

## 💡 즉시 시작 가능한 작업

### 지금 바로 (배포 완료 후)
```bash
# 1. 배포 로그 확인
tail -f deployment.log

# 2. Kakao 로그인 테스트
# 시크릿 모드로 https://aipark.vercel.app/login 접속

# 3. 임시 파일 정리
rm -f .vercel-redeploy deployment.log nohup.out
```

---

**배포가 완료되면 즉시 P0 작업들을 시작하시면 됩니다!** 🚀

현재 자동 배포 스크립트가 22:31에 완료 예정이므로, 그 이후에 테스트를 시작하세요.
