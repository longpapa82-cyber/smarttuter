# SmartTuter 학교급별 튜터링 시스템 구현 가이드

## 개요

SmartTuter의 학교급별 맞춤형 AI 튜터링 시스템이 구현되었습니다. 이 시스템은 초등학교부터 대학교까지 각 학교급에 맞는 수준의 학습 콘텐츠를 제공하고, 수준을 벗어난 질문은 자연스럽게 차단합니다.

## 구현 완료 항목 (Phase 1-4)

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

### Phase 5: 온보딩 UI
- [ ] app/onboarding/page.tsx 확장
- [ ] 학교급 선택 카드 컴포넌트
- [ ] 세부 학년 선택 드롭다운
- [ ] 프로필 저장 및 검증

### Phase 6: 학습 진행 추적
- [ ] Redis 기반 세션 추적
- [ ] 개념 마스터리 레벨 계산
- [ ] 약점 영역 자동 감지
- [ ] 적응형 난이도 조정

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

---

**작성일**: 2025-01-31
**최종 업데이트**: 2025-01-31
**상태**: Phase 4 완료 (Math & English API 통합 완료)
**다음**: Phase 5 (온보딩 UI 구현)
