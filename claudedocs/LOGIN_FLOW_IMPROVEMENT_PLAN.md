# 로그인 프로세스 개선 계획

## 📋 현황 분석

### 현재 흐름 (문제점 ❌)
```
비로그인 상태 → [무료로 시작하기] 클릭
→ /onboarding/quick (학습자 선택)
→ 과목 선택
→ 게스트 프로필 생성
→ /dashboard (로그인 없이)
```

**문제점:**
1. ❌ 로그인 없이 게스트 모드로 진입 (사용자 데이터 손실 위험)
2. ❌ 온보딩 정보(학교급, 과목)가 로그인 전에 수집됨
3. ❌ 로그인 후 다시 온보딩 정보를 입력해야 함 (중복 입력)
4. ❌ UX가 비직관적 (로그인이 언제 필요한지 불명확)

### 목표 흐름 (개선안 ✅)
```
비로그인 상태 → [무료로 시작하기] 클릭
→ /login (로그인 화면, callbackUrl=/onboarding/quick)
→ 로그인 성공
→ /onboarding/quick (학습자 선택)
→ 과목 선택
→ 프로필 저장 + DB 연동
→ /dashboard (인증된 사용자)
```

**개선점:**
1. ✅ 먼저 인증 → 사용자 데이터 안전하게 보관
2. ✅ 온보딩 정보가 로그인된 사용자에게 연결됨
3. ✅ 중복 입력 방지 (한 번만 입력)
4. ✅ 명확한 사용자 흐름 (로그인 → 설정 → 시작)

---

## 🔍 코드 분석

### 1. app/HomeClient.tsx (홈페이지)
**현재 로직:**
```typescript
// Line 9-23: handleCTAClick
const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();

  // 비로그인 상태: 빠른 온보딩으로 이동
  if (!isAuthenticated) {
    window.location.href = '/onboarding/quick';  // ❌ 문제
    return;
  }

  // 로그인 상태: 프로필 확인
  if (typeof window !== 'undefined') {
    const hasProfile = localStorage.getItem('aipark_user_profile');
    window.location.href = hasProfile ? '/dashboard' : '/onboarding';
  }
};
```

**개선 필요사항:**
- 비로그인 상태에서 `/onboarding/quick` 대신 `/login?callbackUrl=/onboarding/quick`로 이동
- 로그인 후 자동으로 온보딩으로 리다이렉션

### 2. app/onboarding/quick/page.tsx (빠른 온보딩)
**현재 로직:**
```typescript
// Line 33-46: handleSubject (과목 선택 후)
const handleSubject = (selectedSubject: Subject) => {
  setSubject(selectedSubject);

  // 게스트 프로필 생성 ❌
  const guestProfile = createUserProfile({
    nickname: '게스트',
    gradeLevel: gradeLevel!,
    preferredSubjects: [selectedSubject],
    provider: 'guest',  // ❌ 게스트 모드
  });

  saveUserProfile(guestProfile);

  // 대시보드로 이동
  setTimeout(() => {
    router.push('/dashboard');
  }, 500);
};
```

**개선 필요사항:**
- `provider: 'guest'` → 실제 인증된 사용자 정보 사용
- 세션에서 사용자 정보 가져오기 (NextAuth)
- DB에 사용자 프로필 저장 (현재는 localStorage만)

### 3. app/login/LoginClient.tsx (로그인 페이지)
**현재 로직:**
```typescript
// Line 30-53: handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  // ...
  const result = await signIn('credentials', {
    redirect: false,
    email: formData.email,
    password: formData.password,
  });

  if (result?.ok) {
    router.push('/dashboard');  // ❌ 항상 대시보드로
    router.refresh();
  }
};
```

**개선 필요사항:**
- `callbackUrl` 파라미터 확인
- 로그인 후 `callbackUrl`로 리다이렉션 (없으면 대시보드)
- 프로필 유무 확인 → 없으면 온보딩으로

### 4. middleware.ts (인증 미들웨어)
**현재 로직:**
```typescript
// Line 29-34: 보호 라우트 정의
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/analytics',
  '/tutor',
];

// Line 37-39: 보호 라우트 체크
const isProtectedRoute = protectedRoutes.some(route =>
  pathname.startsWith(route)
);

// Line 54-59: 비인증 사용자 리다이렉션
if (isProtectedRoute && !isAuthenticated) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(loginUrl)
}
```

**확인 사항:**
- ✅ `/onboarding`이 보호 라우트에 포함되지 않음 (올바름)
- ✅ `callbackUrl` 파라미터 전달 로직 존재
- ⚠️ `/onboarding`을 보호 라우트에 추가할지 검토 필요

---

## 📝 구현 계획

### Phase 1: 홈페이지 CTA 버튼 수정 ✅

**파일:** `app/HomeClient.tsx`

**변경 내용:**
```typescript
const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();

  // 비로그인 상태: 로그인 페이지로 이동 (온보딩 콜백)
  if (!isAuthenticated) {
    window.location.href = '/login?callbackUrl=/onboarding/quick';
    return;
  }

  // 로그인 상태: 프로필 확인
  if (typeof window !== 'undefined') {
    const hasProfile = localStorage.getItem('aipark_user_profile');
    window.location.href = hasProfile ? '/dashboard' : '/onboarding/quick';
  }
};
```

**영향 범위:**
- "무료로 시작하기" 버튼 (2곳)
- "지금 시작하기 →" 버튼 (1곳)

---

### Phase 2: 로그인 페이지 callbackUrl 처리 ✅

**파일:** `app/login/LoginClient.tsx`

**변경 내용:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else if (result?.ok) {
      // callbackUrl 확인
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

      // 프로필 확인 (로그인 직후)
      const hasProfile = typeof window !== 'undefined'
        ? localStorage.getItem('aipark_user_profile')
        : null;

      // 우선순위: callbackUrl > 프로필 유무
      const redirectUrl = callbackUrl !== '/dashboard'
        ? callbackUrl
        : hasProfile
          ? '/dashboard'
          : '/onboarding/quick';

      router.push(redirectUrl);
      router.refresh();
    }
  } catch (err) {
    setError('로그인 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};
```

**개선점:**
1. ✅ `callbackUrl` 파라미터 우선 사용
2. ✅ 프로필 없으면 온보딩으로 자동 이동
3. ✅ OAuth 로그인도 동일한 로직 적용

---

### Phase 3: 빠른 온보딩 인증 연동 ✅

**파일:** `app/onboarding/quick/page.tsx`

**변경 내용:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';  // ✅ 추가
import { motion, AnimatePresence } from 'framer-motion';
import { GRADE_LEVEL_OPTIONS, SUBJECT_OPTIONS, type GradeLevel, type Subject } from '@/types/user';
import { createUserProfile, saveUserProfile } from '@/lib/user/user-profile';

export default function QuickOnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();  // ✅ 세션 가져오기
  const [currentStep, setCurrentStep] = useState(0);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  // Step 2: 과목 선택 후 완료
  const handleSubject = async (selectedSubject: Subject) => {
    setSubject(selectedSubject);

    // 인증된 사용자 프로필 생성 ✅
    const userProfile = createUserProfile({
      nickname: session?.user?.name || '사용자',  // ✅ 실제 이름
      email: session?.user?.email,                // ✅ 이메일
      gradeLevel: gradeLevel!,
      preferredSubjects: [selectedSubject],
      provider: session?.user ? 'credentials' : 'guest',  // ✅ 실제 provider
    });

    // localStorage + 서버 저장
    saveUserProfile(userProfile);

    // TODO: API 호출로 서버에도 저장
    // await fetch('/api/user/profile', {
    //   method: 'POST',
    //   body: JSON.stringify(userProfile),
    // });

    // 대시보드로 이동
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  // ... 나머지 코드 동일
}
```

**추가 작업:**
- [ ] API 라우트 생성: `/api/user/profile` (POST)
- [ ] DB 스키마 업데이트: User 테이블에 `gradeLevel`, `preferredSubjects` 컬럼 추가
- [ ] 프로필 저장 로직 구현

---

### Phase 4: 미들웨어 검토 (선택사항)

**파일:** `middleware.ts`

**검토 사항:**
1. `/onboarding`을 보호 라우트에 추가할지?
   - ✅ **추천:** 추가 (로그인 후에만 온보딩 가능)
   - ❌ **현재:** 미추가 (누구나 접근 가능)

**변경안:**
```typescript
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/analytics',
  '/tutor',
  '/onboarding',  // ✅ 추가
];
```

**영향:**
- 비로그인 사용자가 직접 `/onboarding` 접근 시 → `/login?callbackUrl=/onboarding`로 리다이렉션
- 로그인 후 자동으로 온보딩 페이지로 이동

---

## 🎯 최종 사용자 흐름

### 시나리오 1: 신규 사용자 (첫 방문)
```
1. 홈페이지 접속
2. [무료로 시작하기] 클릭
3. → /login?callbackUrl=/onboarding/quick
4. 회원가입 링크 클릭 → /signup
5. 회원가입 완료 → /login?signup=success
6. 로그인
7. → /onboarding/quick (callbackUrl)
8. 학교급 선택 → 과목 선택
9. → /dashboard (프로필 완성)
```

### 시나리오 2: 기존 사용자 (프로필 있음)
```
1. 홈페이지 접속
2. [무료로 시작하기] 클릭
3. → /login?callbackUrl=/onboarding/quick
4. 로그인
5. 프로필 있음 확인 → /dashboard (온보딩 스킵)
```

### 시나리오 3: 로그인된 사용자 (프로필 없음)
```
1. 홈페이지 접속
2. [무료로 시작하기] 클릭
3. 이미 로그인됨 확인
4. 프로필 없음 확인 → /onboarding/quick
5. 학교급 선택 → 과목 선택
6. → /dashboard
```

---

## ✅ 구현 체크리스트

### 필수 (Critical)
- [ ] HomeClient.tsx 수정 - CTA 버튼 로직 변경
- [ ] LoginClient.tsx 수정 - callbackUrl 처리 로직 추가
- [ ] QuickOnboardingPage 수정 - 세션 연동

### 권장 (Recommended)
- [ ] middleware.ts 수정 - /onboarding을 보호 라우트에 추가
- [ ] API 라우트 생성 - /api/user/profile (POST)
- [ ] DB 스키마 업데이트 - User 모델 확장

### 선택 (Optional)
- [ ] 온보딩 진행 상태 표시 개선
- [ ] 로그인 페이지에 "빠른 시작" 메시지 추가
- [ ] OAuth 로그인 후 온보딩 연동 테스트

---

## 🧪 테스트 시나리오

### 테스트 1: 비로그인 → 로그인 → 온보딩
1. 로그아웃 상태에서 홈페이지 접속
2. "무료로 시작하기" 클릭
3. 로그인 페이지로 이동 확인 (URL: `/login?callbackUrl=/onboarding/quick`)
4. 로그인 완료
5. `/onboarding/quick`로 자동 리다이렉션 확인
6. 학교급 선택 → 과목 선택
7. 대시보드 이동 확인

### 테스트 2: 로그인 → 프로필 없음 → 온보딩
1. 로그인 상태에서 홈페이지 접속
2. localStorage에 프로필 없음 확인
3. "무료로 시작하기" 클릭
4. `/onboarding/quick`로 직접 이동 확인

### 테스트 3: 로그인 → 프로필 있음 → 대시보드
1. 로그인 상태에서 홈페이지 접속
2. localStorage에 프로필 있음
3. "무료로 시작하기" 클릭
4. `/dashboard`로 직접 이동 확인

### 테스트 4: OAuth 로그인 → 온보딩
1. "Google로 계속하기" 클릭
2. Google 인증 완료
3. `/onboarding/quick`로 이동 확인 (신규 사용자)

---

## 📊 예상 영향

### 긍정적 효과
1. ✅ **사용자 데이터 보호** - 게스트 모드 제거로 데이터 손실 방지
2. ✅ **UX 개선** - 명확한 흐름 (로그인 → 설정 → 시작)
3. ✅ **중복 입력 방지** - 온보딩 정보가 계정에 영구 저장
4. ✅ **전환율 향상** - 로그인 전에 온보딩 정보 수집 불가로 회원가입 유도

### 잠재적 리스크
1. ⚠️ **마찰 증가** - 로그인 단계 추가로 즉시 체험 불가
2. ⚠️ **이탈률 증가 가능성** - 로그인 요구로 일부 사용자 이탈 가능

### 완화 전략
1. 로그인 페이지에 "빠른 체험하기" 메시지 추가
2. OAuth 로그인 강조 (Google, Kakao 원클릭)
3. 회원가입 과정 간소화 (이메일 인증 생략 가능)

---

## 🚀 배포 계획

### 1단계: 개발 환경 테스트
- [ ] 로컬 환경에서 전체 흐름 테스트
- [ ] 각 시나리오별 동작 확인
- [ ] 콘솔 에러 확인

### 2단계: 스테이징 배포
- [ ] Vercel Preview 배포
- [ ] E2E 테스트 실행
- [ ] QA 테스트

### 3단계: 프로덕션 배포
- [ ] 메인 브랜치 머지
- [ ] 프로덕션 배포
- [ ] 모니터링 (전환율, 이탈률)

---

## 📈 성공 지표

### KPI
1. **회원가입 전환율** - "무료로 시작하기" → 회원가입 완료
2. **온보딩 완료율** - 로그인 → 온보딩 완료
3. **첫 튜터 세션 시작율** - 온보딩 완료 → 튜터 사용

### 목표
- 회원가입 전환율: 30% 이상
- 온보딩 완료율: 80% 이상
- 첫 튜터 세션 시작율: 60% 이상

---

**작성일**: 2025-11-02
**작성자**: Claude (SuperClaude Framework)
**우선순위**: P0 (Critical)
