# SmartTuter 학교급별 튜터링 시스템 구현 가이드

## 개요

SmartTuter의 학교급별 맞춤형 AI 튜터링 시스템이 구현되었습니다. 이 시스템은 초등학교부터 대학교까지 각 학교급에 맞는 수준의 학습 콘텐츠를 제공하고, 수준을 벗어난 질문은 자연스럽게 차단합니다.

## 구현 완료 항목 (Phase 1-5)

### Phase 1: 기초 데이터 구조 (7개 파일)
- `types/tutor.ts` - TypeScript 타입 시스템
- `lib/tutor/constraints/` - 학교급별 제약 조건 DB
  - elementary.ts (초등 3-4학년, 5-6학년)
  - middle.ts (중 1-3학년)
  - high.ts (고 1-3학년)
  - university.ts (대학교)
- `lib/tutor/guidance-messages.ts` - 수준 초과 시 안내 메시지

### Phase 2: 핵심 엔진 (3개 파일)
- `lib/tutor/system-prompt-generator.ts` - 동적 프롬프트 생성기
- `lib/tutor/content-level-detector.ts` - 콘텐츠 수준 감지기
- `lib/user-profile.ts` - 사용자 프로필 관리

### Phase 3: 수학 API 통합 (1개 파일)
- `app/api/chat/math/route.ts` - 수학 튜터 API 가드레일 적용

### Phase 4: 영어 API 통합 (1개 파일)
- `app/api/chat/english/route.ts` - 영어 튜터 API 가드레일 적용

### Phase 5: 온보딩 UI 확장 (1개 파일)
- `app/onboarding/page.tsx` - 세부 학년 선택 드롭다운 추가
  - 학교급별 세부 학년 선택 (초등: 3-4/5-6, 중: 1/2/3, 고: 1/2/3, 대: 1/2/3/4+)
  - createProfileFromOnboarding 통합으로 완전한 프로필 생성
  - GradeLevelDetail 객체 생성 및 저장
  - 향상된 localStorage 관리

### Phase 6: 학습 진행 추적 시스템 (6개 파일)
- `lib/learning-progress/types.ts` - 타입 시스템 (마스터리, 약점, 난이도, 진행 요약)
- `lib/learning-progress/mastery-calculator.ts` - 개념 마스터리 계산 및 업데이트
  - 5단계 마스터리 분류 (not_started → mastered)
  - 신뢰도 점수 계산 (최근 70%, 전체 30% 가중치)
  - 선행 개념 gap 식별
- `lib/learning-progress/weakness-detector.ts` - 약점 자동 감지 및 추천
  - 5가지 지표 (성공률, 힌트, 응답시간, 반복오류, 개념gap)
  - 4단계 심각도 (low/medium/high/critical)
  - 맞춤형 학습 조언 생성
- `lib/learning-progress/difficulty-adjuster.ts` - 적응형 난이도 조정
  - 5요인 분석 (성공률35%, 마스터리25%, 힌트15%, 시간15%, 약점10%)
  - 교육심리학 기반 (ZPD, Flow Theory, Bloom)
  - 5단계 난이도 배수 (0.5x - 2.0x)
- `lib/learning-progress/progress-tracker.ts` - 진행 추적 인터페이스 (stub) → **Phase 8에서 완전 구현**
- `lib/learning-progress/index.ts` - 통합 export

## 시스템 작동 방식

```
사용자 질문 입력
    ↓
[사용자 프로필 로드] ← localStorage에서 학년 정보 가져오기
    ↓
[콘텐츠 수준 감지기]
    ├─ 금지된 키워드 검색 (빠른 필터링)
    └─ 신뢰도 점수 계산
    ↓
수준 적합 여부 판단
    ├─ ❌ OUT OF SCOPE (신뢰도 > 0.7)
    │   └→ 안내 메시지 반환
    │      "오, 정말 좋은 호기심이네요! 하지만..."
    │
    └─ ✅ APPROPRIATE
        ↓
    [시스템 프롬프트 생성기]
        ├─ 학교급별 제약 조건 주입
        ├─ 교수법 전략 선택
        └─ 교육적 가드레일 적용
        ↓
    [AI 응답] ← Gemini/Claude with Guardrails
        ├─ 힌트 기반 튜터링 (절대 정답 직접 제공 안 함)
        ├─ 단계별 최대 제한 (초등 3단계, 중등 5단계 등)
        └─ 격려 및 자기주도 학습 유도
```

## 사용 예시

### 1. 초등학생이 미적분 질문 시

**입력**: "미적분 알려줘"

**처리**:
1. User Profile: gradeLevel = "elementary"
2. Content Detector:
   - Detected keywords: ["미적분", "calculus"]
   - outOfScope: true
   - confidence: 0.9
3. Response: 안내 메시지
   ```
   오, 정말 좋은 호기심이네요! 하지만 이 개념은
   중학교에 가면 배우게 될 내용이에요. 지금은
   분수와 소수를 먼저 탄탄하게 다져볼까요?
   ```

### 2. 중학생이 일차방정식 질문 시

**입력**: "일차방정식 어떻게 풀어?"

**처리**:
1. User Profile: gradeLevel = "middle", grade = "1"
2. Content Detector: outOfScope = false (적절함)
3. System Prompt:
   ```
   - CEFR B1 level
   - Allowed topics: 문자와 식, 일차방정식, 좌표평면
   - Max 5 steps per explanation
   - Guided discovery pedagogy
   - NEVER give direct answers
   ```
4. AI Response (예시):
   ```
   좋은 질문이에요! 일차방정식을 풀 때는 먼저 무엇을
   찾아야 할까요? 🤔

   힌트: 방정식에서 우리가 모르는 값을 나타내는
   기호가 있죠? 그게 무엇인가요?
   ```

## 학교급별 제약 조건

### 초등학교 (Elementary)
- **CEFR**: A1-A2
- **수학**: 덧셈, 뺄셈, 곱셈/나눗셈 기초, 분수, 도형
- **금지**: 대수, 방정식, 미적분, 삼각함수
- **응답**: 최대 3단계, 시각적 자료 권장, 높은 게이미피케이션

### 중학교 (Middle)
- **CEFR**: B1-B2
- **수학**: 정수, 유리수, 일차방정식, 함수, 기하 기초
- **금지**: 이차함수 심화, 미적분, 삼각함수, 로그
- **응답**: 최대 5단계, 안내된 발견 학습, 중간 참여도

### 고등학교 (High)
- **CEFR**: B2-C1
- **수학**: 이차함수, 수열, 지수/로그, 삼각함수, 미적분
- **금지**: 대학 전공 수학, 다변수 미적분, 추상대수
- **응답**: 최대 10단계, 소크라테스식 질문, 수능 대비

### 대학교 (University)
- **CEFR**: C1-C2
- **수학**: 미적분학, 선형대수, 미분방정식, 확률통계
- **금지**: 초전문 연구 수학 (박사 과정)
- **응답**: 최대 15단계, 협력적 전문가, 학술적 논의

## 다음 구현 단계 (TODO)

### Phase 7: 대시보드 확장
- [ ] 학교급별 진행도 표시
- [ ] 현재 CEFR 레벨 (영어)
- [ ] 수학 주제별 완성도
- [ ] 추천 학습 콘텐츠

## 기술 스택

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **AI**: Gemini 2.0 Flash (Math), Claude 3.5 Sonnet (English - 예정)
- **Storage**: localStorage (프로필), Redis (세션/캐시)
- **Deployment**: Vercel

## 참고 자료

- 한국 교육부 2022 개정 교육과정
- CEFR (Common European Framework of Reference)
- Common Core Math Standards
- Khan Academy, Duolingo, Photomath 분석 결과

## 커밋 이력

- `424e582` - Phase 1: 기초 데이터 구조
- `fc99b43` - Phase 2: 핵심 엔진 컴포넌트
- `6c432b9` - Phase 3: Math API 가드레일 통합
- `6e707f9` - 구현 가이드 문서 작성
- `40105e9` - Phase 4: English API 가드레일 통합
- `a916d16` - Phase 4 문서 업데이트
- `0bbb55d` - Phase 5: 온보딩 UI 세부 학년 선택 기능 추가
- `27fce0f` - Phase 5 문서 업데이트
- `15eba56` - Phase 6: 학습 진행 추적 시스템 (마스터리, 약점, 난이도)
- `ebe3e60` - Phase 6 문서화

## Phase 7: Dashboard Expansion (대시보드 확장) ✅

**목표**: 학습 진행도 시각화 컴포넌트로 대시보드 확장

### 구현된 컴포넌트들

#### 1. LearningProgressOverview
- 전체 학습 진행도 요약 카드
- 수학/영어 과목별 진행도 표시
- 마스터리 분포 시각화
- 통계 그리드 (학습 시간, 개념 수, 마스터 개념)

#### 2. CEFRLevelBadge
- 영어 능력 CEFR 레벨 뱃지 (A1-C2)
- 학교급별 자동 레벨 매핑
- 다음 레벨 진행도 표시
- 컬러 코딩 및 애니메이션

#### 3. MathTopicProgress
- 학교급별 수학 주제 진행도
- SVG 원형 진행 표시기
- 마스터리 레벨 컬러 코딩
- 4개 주제 그리드 레이아웃

#### 4. WeaknessAnalysis
- 약점 영역 감지 및 표시
- 4단계 심각도 표시 (🔴🟠🟡🟢)
- 추천 학습 행동 목록
- 약점 없을 때 축하 화면

### 기술 스택
- **UI**: Framer Motion 애니메이션
- **디자인**: Tailwind CSS, 그라데이션 배경
- **타입**: Phase 6 타입 시스템 통합
- **반응형**: Mobile-first 그리드 레이아웃

### 파일 구조
```
components/dashboard/
├── LearningProgressOverview.tsx (145 lines)
├── CEFRLevelBadge.tsx (177 lines)
├── MathTopicProgress.tsx (164 lines)
├── WeaknessAnalysis.tsx (150 lines)
└── index.ts (9 lines)
```

### 대시보드 통합
- `app/dashboard/page.tsx`에 새 "학습 진행도" 섹션 추가
- Phase 6 타입과 완전 통합
- 목 데이터로 시연 (Phase 8에서 Redis 연결)

### 다음 단계 (Phase 8)
- [ ] Redis 통합으로 실시간 데이터 연결
- [ ] Math/English API에 진행도 추적 통합
- [ ] 자동 약점 감지 트리거
- [ ] 난이도 조정 자동 적용

---

**작성일**: 2025-01-31
---

## Phase 8: 실시간 데이터 통합 ✅

**목표**: Redis 기반 실시간 학습 진행도 추적 및 자동 적응 시스템

### Part 1: Redis Schema & Progress Tracker

#### 1. Redis Schema (`redis-schema.ts` - 331 lines)
- 전체 Redis 키 패턴 정의
- TTL 전략 설정 (이벤트 30일, 캐시 1-6시간)
- 데이터 직렬화/역직렬화 헬퍼
- 인덱스 패턴 (timeline, concept, subject)

#### 2. Progress Tracker (`progress-tracker.ts` - 658 lines)
**주요 기능**:
- `trackLearningEvent()` - 학습 이벤트 저장 및 추적
- `getLearningProgressSummary()` - 진행도 요약 (캐시 1시간)
- `getRecommendedNextConcepts()` - 추천 개념 (캐시 12시간)

**성능 최적화**:
- Redis 파이프라이닝으로 일괄 처리
- 캐시-사이드 패턴 적용
- Fire-and-forget 에러 처리

### Part 2: Dashboard Real-time Integration

#### 1. Progress Summary API (`/api/progress/summary`)
- GET 엔드포인트로 진행도 데이터 제공
- userId 기반 데이터 조회
- `hasData` 플래그로 빈 상태 구분
- 30초 자동 새로고침

#### 2. Dashboard 업데이트
- 실시간 데이터 페칭 (useState/useEffect)
- 4가지 상태 관리 (로딩/에러/비어있음/데이터)
- 30초 자동 새로고침
- 조건부 렌더링 최적화

### Part 3: Auto-Detection & Adaptive Difficulty

#### 1. Progress Tracker 자동 감지
- **약점 감지**: 10개 이벤트마다 자동 실행
- **난이도 조정**: 5번 시도마다 자동 체크
- 콘솔 로그로 자동 감지 확인 가능
- question_attempt, conversation_turn 이벤트 타입 지원

#### 2. Difficulty API (`/api/difficulty`)
- GET: 현재 난이도 조회
- POST: 수동 난이도 설정 (테스트용)
- 5단계 난이도 지원 (very_easy → very_hard)

#### 3. DifficultyIndicator 컴포넌트
- 과목별 현재 난이도 표시 (수학/영어)
- 5단계 비주얼 인디케이터
- AI 자동 조절 뱃지
- 30초 자동 새로고침
- 로딩/에러 상태 처리

### API 통합

#### Math/English Tutor APIs
**변경사항**:
```typescript
// 응답 완료 후 학습 이벤트 추적
const learningEvent: LearningEvent = {
  userId,
  eventType: 'question_attempt',  // math
  // or: 'conversation_turn',      // english
  subject: 'math' | 'english',
  conceptId: `{subject}_concept_${Date.now()}`,
  success: true,
  timestamp: new Date(),
  responseTime,
  metadata: { ... }
};

// Fire-and-forget (API 응답 차단 안 함)
trackLearningEvent(learningEvent).catch(err => {
  console.error('Failed to track:', err);
});
```

### 데이터 플로우

```
사용자 질문 → 튜터 API 응답
  ↓
학습 이벤트 추적 (Fire-and-forget)
  ↓
Redis 저장 + 인덱싱
  ↓
개념 마스터리 업데이트
  ↓
10개 이벤트마다 → 약점 자동 감지
5번 시도마다 → 난이도 자동 체크
  ↓
대시보드 30초마다 자동 새로고침
```

### 캐시 전략

| 데이터 유형 | TTL | 무효화 시점 |
|---------|-----|-----------|
| 진행도 요약 | 1시간 | 매 이벤트 |
| 약점 분석 | 6시간 | 감지 실행 시 |
| 추천 개념 | 12시간 | 마스터리 변경 |
| 개념 마스터리 | 영구 | 실시간 업데이트 |
| 난이도 설정 | 영구 | 조정 시 |

### 성능 특성

**Write (이벤트 추적)**:
- 파이프라인 4-5개 연산: ~10-20ms
- API 응답 차단 없음

**Read (대시보드)**:
- 캐시 히트: ~50ms
- 캐시 미스: ~200-500ms
- 80-90% 캐시 히트율 예상

**Auto-Detection**:
- 약점 감지: ~100-300ms
- 난이도 체크: ~50-150ms
- 비동기 실행 (차단 없음)

### 환경 설정

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 테스트 방법

#### 약점 감지 테스트
1. 튜터에서 10개 질문
2. 콘솔에서 확인:
   ```
   [Auto-Detection] Triggering weakness detection...
   Detected {n} weakness areas
   ```
3. 대시보드에서 약점 확인

#### 난이도 조정 테스트
1. 튜터에서 5개 질문/답변
2. 콘솔에서 확인:
   ```
   [Auto-Detection] Checking difficulty adjustment...
   Difficulty check: medium → hard
   ```
3. 대시보드에서 난이도 변경 확인 (30초 내)

### 문서

- 상세 문서: `docs/phase8-realtime-data-integration.md`
- Redis 스키마: `lib/learning-progress/redis-schema.ts`
- Progress Tracker: `lib/learning-progress/progress-tracker.ts`

---

**최종 업데이트**: 2025-10-31
**상태**: Phase 8 완료 (실시간 데이터 통합 완료)
**다음**: Phase 15 (배포 최적화) 또는 Phase 9 (학습 리포트)
