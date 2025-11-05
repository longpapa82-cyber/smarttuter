# 즉시 적용 가능한 개선사항 요약

## 📋 사용자 요청사항

### 원하는 프로세스
```
1. 메인 페이지
2. [무료로 시작하기] / [시작하기] 버튼 클릭 → 로그인 페이지
3. 로그인 완료 → 학교급 선택 화면
4. 과목 선택 화면 (영어, 수학, 과학, 사회)
5. 선택한 과목의 튜터 화면
```

---

## ✅ 즉시 적용된 수정사항

### 1. Progress Bar 오류 수정 ✅
**문제**: Step 1에서 2/5 완료로 표시됨
**해결**: `currentStep >= step` → `currentStep > step`

**파일**:
- `app/onboarding/page.tsx:113`
- `app/onboarding/quick/page.tsx:91`

**결과**:
- Step 0 (학교급): ○ ○ (0/2)
- Step 1 (과목): ● ○ (1/2) ✅ 정확

---

## 🎯 추가 필요 수정사항

### 2. 홈페이지 → 로그인 유도 강화

**현재 상황**:
- 로그아웃 상태: "무료로 시작하기" → `/login` ✅
- 게스트 모드: "무료로 시작하기" → `/onboarding/quick`

**개선 방안**:
사용자가 원하는 흐름은 "무조건 로그인 먼저"이므로:

```typescript
// app/HomeClient.tsx
const handleCTAClick = () => {
  // 로그인 상태가 아니면 무조건 로그인 페이지로
  if (!isAuthenticated) {
    window.location.href = '/login';
    return;
  }

  // 로그인 상태: 프로필 확인
  const hasProfile = localStorage.getItem('aipark_user_profile');
  window.location.href = hasProfile ? '/dashboard' : '/onboarding/quick?step=grade';
};
```

### 3. 로그인 후 리다이렉션

**현재**: 로그인 완료 → 프로필 있으면 `/dashboard`, 없으면 `/onboarding/quick`

**사용자 요청**: 로그인 완료 → 학교급 선택 (항상)

**개선 방안**:
```typescript
// app/login/LoginClient.tsx
if (result?.ok) {
  // callbackUrl 우선
  const callbackUrl = searchParams.get('callbackUrl');
  if (callbackUrl && callbackUrl !== '/dashboard') {
    router.push(callbackUrl);
    return;
  }

  // 프로필 확인
  const hasProfile = localStorage.getItem('aipark_user_profile');

  // 프로필 없으면 온보딩 (학교급 선택부터)
  if (!hasProfile) {
    router.push('/onboarding/quick?step=grade');
  }
  // 프로필 있으면 대시보드
  else {
    router.push('/dashboard');
  }
}
```

### 4. 과목 옵션 확장 (4과목)

**현재**: 영어, 수학
**사용자 요청**: 영어, 수학, 과학, 사회

**수정 필요 파일**:

#### A. `types/user.ts`
```typescript
export type Subject = 'english' | 'math' | 'science' | 'social';

export const SUBJECT_OPTIONS = [
  {
    value: 'english' as Subject,
    label: '영어',
    emoji: '📚',
    color: 'from-blue-600 to-indigo-600',
    description: 'AI와 함께하는 맞춤형 영어학습'
  },
  {
    value: 'math' as Subject,
    label: '수학',
    emoji: '🔢',
    color: 'from-purple-600 to-pink-600',
    description: '개념부터 문제풀이까지 완벽 학습'
  },
  {
    value: 'science' as Subject,
    label: '과학',
    emoji: '🔬',
    color: 'from-green-600 to-teal-600',
    description: '생물·화학·물리·지구과학 체계 학습'
  },
  {
    value: 'social' as Subject,
    label: '사회',
    emoji: '🏛️',
    color: 'from-orange-600 to-red-600',
    description: '지리·역사·정치·문화 깊이있는 학습'
  },
];
```

#### B. `app/onboarding/quick/page.tsx`
```typescript
// SubjectQuickStep 컴포넌트의 grid 수정
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
  {SUBJECT_OPTIONS.map((option, index) => (
    // 4개 과목 모두 표시 (2x2 그리드)
  ))}
</div>
```

#### C. 튜터 페이지 생성
- `app/tutor/science/page.tsx` (NEW)
- `app/tutor/social/page.tsx` (NEW)
- `components/tutor-pages/ScienceTutorClient.tsx` (이미 존재)
- `components/tutor-pages/SocialStudiesTutorClient.tsx` (이미 존재)

---

## 📊 최종 사용자 여정

### 시나리오: 신규 사용자

```
1. 홈페이지 (/)
   - [무료로 시작하기] 버튼 표시
   ↓ 클릭

2. 로그인 페이지 (/login)
   - 이메일/비밀번호 입력 또는
   - Google/GitHub 로그인
   ↓ 로그인 성공

3. 학교급 선택 (/onboarding/quick?step=grade)
   Progress: ○ ○ (1/2 단계)
   - 초등학생 / 중학생 / 고등학생 / 대학생·성인
   ↓ 선택

4. 과목 선택 (/onboarding/quick?step=subject)
   Progress: ● ○ (1/2 단계)
   - 영어 / 수학 / 과학 / 사회
   ↓ 선택

5. 튜터 페이지 (/tutor/[subject])
   - 즉시 학습 시작
   - 프로필 자동 저장 (localStorage + 서버)
```

### 기존 사용자 (프로필 있음)

```
1. 홈페이지 (/)
   - [학습 시작하기] 버튼 표시 (로그인 상태)
   ↓ 클릭

2. 대시보드 (/dashboard)
   - 학습 기록, 진도, 추천 과목
   - 바로 튜터 페이지로 이동 가능
```

---

## 🚀 구현 순서

### Step 1: Progress Bar 수정 (완료 ✅)
- `/app/onboarding/page.tsx`
- `/app/onboarding/quick/page.tsx`

### Step 2: 홈페이지 리다이렉션 단순화 (5분)
- `/app/HomeClient.tsx`
- 게스트 쿠키 체크 로직 제거
- 로그인 안 되어 있으면 무조건 `/login`

### Step 3: 로그인 후 리다이렉션 수정 (5분)
- `/app/login/LoginClient.tsx`
- 프로필 없으면 → `/onboarding/quick?step=grade`
- 프로필 있으면 → `/dashboard`

### Step 4: 과목 확장 (20분)
- `/types/user.ts` - Subject 타입 확장
- `/app/onboarding/quick/page.tsx` - 4과목 표시
- 튜터 페이지 확인 (이미 존재함)

### Step 5: 테스트 (10분)
- 신규 사용자 흐름
- 기존 사용자 흐름
- 로그아웃 후 재방문

**총 예상 시간**: 40분

---

## ⚠️ 주의사항

### 게스트 모드 관련
현재 많은 곳에서 게스트 쿠키를 체크하고 있습니다:
- `middleware.ts` - 튜터 페이지 접근 제어
- `HomeClient.tsx` - 리다이렉션 로직
- `ExperienceStep.tsx` - 체험하기 버튼

**질문**: 게스트 모드를 완전히 제거할까요?

**옵션 1 - 게스트 모드 유지** (추천):
- 홈페이지에서 "체험하기" 버튼 별도 제공
- "무료로 시작하기"는 로그인 필수
- 데모는 제한된 기능만 (3회 대화 등)

**옵션 2 - 게스트 모드 제거**:
- 모든 기능 로그인 필수
- 홈페이지 체험하기 제거
- 단순한 구조

---

## 📝 다음 단계 결정 필요

### A. 게스트 모드 정책
- [ ] 옵션 1: 게스트 모드 유지 (추천)
- [ ] 옵션 2: 완전 제거

### B. 온보딩 페이지 정리
- [ ] `/onboarding` (일반) 페이지 제거 또는 간소화
- [ ] `/onboarding/quick`만 사용

### C. 체험하기 위치
- [ ] 홈페이지에 별도 섹션 추가
- [ ] 완전 제거

---

## ✅ 즉시 적용 가능한 변경사항 커밋

```bash
git add app/onboarding/page.tsx app/onboarding/quick/page.tsx claudedocs/
git commit -m "fix: Correct progress bar display logic

- Change condition from currentStep >= step to currentStep > step
- Fix /onboarding showing 2/5 when on step 1
- Fix /onboarding/quick showing 2/2 when on step 0
- Now accurately shows current progress

User impact:
- Step 0 (grade selection): 0/2 or 1/5 ✅
- Step 1 (subject selection): 1/2 or 2/5 ✅
"
```
