# 🔴 CRITICAL: 튜터 접근 불가 근본 원인 분석

**발견일**: 2025-11-05
**심각도**: P0 (Production Blocking)
**영향 범위**: 게스트 사용자 100% + 운영 환경 전체

---

## 📋 Executive Summary

### 🎯 근본 원인
**아키텍처 불일치**: 온보딩은 게스트 모드를 지원하지만, 미들웨어는 모든 튜터 접근에 인증을 강제함

```
게스트 사용자 → 온보딩 완료 ✅ → 대시보드 접근 ✅ → 튜터 클릭 → 미들웨어 차단 🔴
```

### 💥 사용자 영향
- **게스트 사용자**: 튜터 완전 접근 불가 (온보딩 해도 무용지물)
- **인증 사용자**: 정상 접근 가능
- **신규 사용자**: 혼란스러운 UX (대시보드에 튜터 링크가 있는데 접근 불가)

---

## 🔍 상세 분석

### 1. 배포 상태 확인

#### ✅ Vercel 배포 성공
```bash
$ git log -1
commit 3ca7142d98364707bfbe395c8f68eb299c579db6
Author: 박훈재
Date: Wed Nov 5 12:34:02 2025 +0900

fix: Change tutor pages runtime from edge to nodejs
```

**배포 확인**:
- ✅ GitHub Push 성공
- ✅ Vercel 자동 빌드 성공
- ✅ Production URL 업데이트 완료
- ✅ Runtime 변경 (edge → nodejs) 반영됨

**그런데 왜 문제가 지속되는가?**
→ **Runtime 문제가 아니었음!** 실제 문제는 **인증 아키텍처**

---

### 2. 근본 원인: 인증 미들웨어 차단

#### 🔴 문제의 코드 (middleware.ts:29-34)

```typescript
// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/analytics',
  '/tutor',  // ⚠️ 이것이 문제!
]

// Redirect unauthenticated users trying to access protected routes
if (isProtectedRoute && !isAuthenticated) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(loginUrl)  // 🔴 게스트는 여기서 차단됨
}
```

#### 실제 동작 확인

**Production 헤더 확인**:
```bash
$ curl -I https://smarttuter.vercel.app/tutor/math

HTTP/2 307  # Redirect!
location: /login?callbackUrl=%2Ftutor%2Fmath  # 로그인으로 리다이렉트
```

**결론**: 튜터 페이지 자체는 정상이지만, **접근 자체가 차단됨**

---

### 3. 사용자 플로우 분석

#### 📊 게스트 사용자 플로우 (현재 - 실패)

```
Step 1: 온보딩 시작 (/onboarding)
  ↓
Step 2: 학년/과목 선택 (localStorage 저장)
  ↓
Step 3: 닉네임 입력 (localStorage 저장)
  ↓
Step 4: 인증 단계
  └─→ "Skip" 클릭 (게스트 모드)
      ↓
      completeOnboarding() 실행
      - localStorage에만 프로필 저장
      - NextAuth 토큰 생성 안함 ❌
      ↓
Step 5: 대시보드 이동 (/dashboard)
  ✅ 접근 가능 (미들웨어 bypassAuth || 프로필 존재)
  ↓
Step 6: "Math Tutor" 클릭
  ↓
  미들웨어 실행
  ↓
  토큰 확인: null ❌
  ↓
  🔴 /login으로 리다이렉트

❌ 튜터 접근 실패!
```

#### ✅ 인증 사용자 플로우 (정상)

```
Step 1: 로그인 (/login)
  ↓
Step 2: Google/Kakao OAuth
  ↓
  NextAuth 세션 생성 ✅
  토큰 저장 (쿠키) ✅
  ↓
Step 3: 대시보드 (/dashboard)
  ✅ 접근 가능
  ↓
Step 4: "Math Tutor" 클릭
  ↓
  미들웨어 실행
  ↓
  토큰 확인: 존재 ✅
  ↓
  ✅ /tutor/math 접근 성공!
```

---

### 4. 아키텍처 불일치 상세 분석

#### 🏗️ 현재 아키텍처

```typescript
// 1️⃣ 온보딩 (app/onboarding/page.tsx)
const handleSkipAuth = () => {
  completeOnboarding();  // localStorage만 업데이트
  router.push('/dashboard');
}

// 2️⃣ 프로필 저장 (lib/user/user-profile.ts)
export function completeOnboarding() {
  // localStorage에만 저장
  localStorage.setItem('aipark_user_profile', JSON.stringify(profile));
  localStorage.setItem('aipark_onboarding_complete', 'true');
  // ❌ NextAuth 세션 생성 없음!
  // ❌ 서버 사이드 인증 없음!
}

// 3️⃣ 미들웨어 (middleware.ts)
const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
});
// 게스트 사용자: token = null ❌
// localStorage는 서버 사이드에서 접근 불가!

const isAuthenticated = !!token;
// 게스트: isAuthenticated = false

if (isProtectedRoute && !isAuthenticated) {
  return NextResponse.redirect(loginUrl);  // 🔴 차단!
}
```

#### 🔑 핵심 문제점

| 컴포넌트 | 게스트 지원 | 실제 동작 |
|---------|----------|---------|
| **온보딩** | ✅ 지원 (Skip Auth) | localStorage만 저장 |
| **대시보드** | ✅ 접근 가능 | 프로필 있으면 OK |
| **미들웨어** | ❌ 지원 안함 | NextAuth 토큰 필수 |
| **튜터 페이지** | ❓ 혼란 | 차단됨 (미들웨어) |

**불일치**:
- 프론트엔드: localStorage 기반 게스트 모드 지원
- 백엔드: NextAuth 토큰 기반 인증 강제
- 결과: **게스트는 튜터 접근 불가**

---

### 5. 왜 로컬에서도 같은 문제인가?

#### 스크린샷 분석
```
URL: https://smarttuter.vercel.app/tutor/math (운영)
또는
URL: http://localhost:3000/tutor/math (로컬)

둘 다 동일하게:
1. 초기 메시지 없음
2. 입력해도 응답 없음
3. 콘솔 에러: [next-auth] error, /api/auth/session 500
```

**이유**:
- 로컬이든 운영이든 **게스트로 접속했기 때문**
- 온보딩만 하고 로그인하지 않음
- 미들웨어가 `/tutor`를 차단
- 실제로 튜터 페이지에 도달하지 못함

**증거**:
```
콘솔 에러:
- POST /api/auth/session 500 (Internal Server Error)
- Uncaught (in promise) TypeError: Failed to execute addAll on Cache

→ NextAuth 세션이 없어서 발생하는 에러
→ 페이지 자체가 제대로 로드되지 않음
```

---

## 🛠️ 해결 방안

### Solution 1: 게스트 모드 완전 지원 (권장) ⭐

**접근**: 게스트 사용자도 튜터에 접근 가능하도록 아키텍처 변경

#### 1.1 미들웨어 수정

```typescript
// middleware.ts

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // E2E 테스트 우회
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  const isE2ETest = request.headers.get('x-e2e-test') === 'true';
  if (bypassAuth || isE2ETest) {
    return NextResponse.next();
  }

  // NextAuth 토큰 확인
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 🆕 게스트 모드 확인 (쿠키로 확인)
  const hasGuestProfile = request.cookies.get('aipark_guest_mode')?.value === 'true';
  const isAuthenticated = !!token || hasGuestProfile;

  // Protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/analytics',
    // '/tutor',  // 🆕 제거! 튜터는 게스트도 접근 가능
  ];

  // 완전 보호된 경로 (인증 필수)
  const strictAuthRoutes = [
    '/profile',      // 프로필 수정은 인증 필요
    '/analytics',    // 분석은 인증 필요
  ];

  // Strict auth routes - always require NextAuth token
  const isStrictAuthRoute = strictAuthRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isStrictAuthRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protected routes - allow guest mode
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

#### 1.2 온보딩 수정 - 게스트 쿠키 설정

```typescript
// app/onboarding/page.tsx

const handleSkipAuth = () => {
  completeOnboarding();

  // 🆕 게스트 모드 쿠키 설정
  document.cookie = 'aipark_guest_mode=true; path=/; max-age=31536000'; // 1년

  router.push('/dashboard');
};
```

#### 1.3 로그아웃 시 게스트 쿠키 제거

```typescript
// app/profile/page.tsx (로그아웃)

const handleSignOut = async () => {
  // 게스트 쿠키 제거
  document.cookie = 'aipark_guest_mode=; path=/; max-age=0';

  await signOut({ callbackUrl: '/login' });
};
```

**장점**:
- ✅ 게스트 사용자가 튜터 기능 사용 가능
- ✅ 온보딩 플로우 의미 있음
- ✅ 기존 인증 사용자 영향 없음
- ✅ 최소한의 변경

**단점**:
- 🟡 쿠키 기반 인증 추가 (보안 고려 필요)
- 🟡 게스트 데이터 서버 저장 안됨

---

### Solution 2: 게스트 모드 제거 (강제 인증)

**접근**: 온보딩에서 인증 건너뛰기 제거, 모든 사용자 인증 필수

#### 2.1 온보딩 수정

```typescript
// app/onboarding/page.tsx

// Step 5: Auth - Complete
const handleGoogleAuth = async () => {
  // 🆕 실제 OAuth 구현
  await signIn('google', {
    callbackUrl: '/dashboard',
    // 온보딩 데이터를 쿼리 파라미터로 전달
    gradeLevel,
    subjects: subjects.join(','),
    nickname,
  });
};

const handleKakaoAuth = async () => {
  await signIn('kakao', {
    callbackUrl: '/dashboard',
    gradeLevel,
    subjects: subjects.join(','),
    nickname,
  });
};

// ❌ handleSkipAuth 제거!
```

#### 2.2 OAuth 콜백 처리

```typescript
// lib/auth/config.ts

callbacks: {
  async signIn({ user, account, profile }) {
    // 🆕 온보딩 데이터를 프로필에 저장
    const onboardingData = {
      gradeLevel: searchParams.get('gradeLevel'),
      subjects: searchParams.get('subjects')?.split(','),
      nickname: searchParams.get('nickname'),
    };

    // 데이터베이스에 저장
    await saveUserProfile(user.id, onboardingData);

    return true;
  },
}
```

**장점**:
- ✅ 일관된 인증 아키텍처
- ✅ 서버 사이드 데이터 저장
- ✅ 진짜 사용자 추적 가능
- ✅ 보안 강화

**단점**:
- 🔴 모든 사용자가 OAuth 필수
- 🔴 진입 장벽 높아짐
- 🔴 익명 체험 불가

---

### Solution 3: 하이브리드 접근 (게스트 → 인증 전환)

**접근**: 게스트 모드 유지 + 일정 시간 후 인증 유도

#### 3.1 게스트 제한 설정

```typescript
// lib/auth/guest-limits.ts

export const GUEST_LIMITS = {
  MAX_SESSIONS: 5,           // 최대 5회 튜터 세션
  MAX_DURATION: 30,          // 최대 30분
  MAX_MESSAGES: 50,          // 최대 50개 메시지
  FEATURE_RESTRICTIONS: {
    flashcards: false,       // 플래시카드 불가
    quiz: false,             // 퀴즈 불가
    analytics: false,        // 분석 불가
    report: false,           // 리포트 불가
  }
};

export function checkGuestLimit(guestProfile: GuestProfile) {
  const sessions = guestProfile.sessionCount;

  if (sessions >= GUEST_LIMITS.MAX_SESSIONS) {
    return {
      allowed: false,
      message: '게스트 모드는 5회까지만 이용 가능합니다. 로그인하여 계속 이용하세요!',
      action: 'LOGIN_REQUIRED',
    };
  }

  return { allowed: true };
}
```

#### 3.2 튜터 페이지에서 제한 확인

```typescript
// components/tutor-pages/SimpleChatInterface.tsx

useEffect(() => {
  if (typeof window !== 'undefined') {
    const isGuest = !token;

    if (isGuest) {
      const limit = checkGuestLimit(guestProfile);

      if (!limit.allowed) {
        toast.error(limit.message);
        router.push('/login?reason=guest_limit');
        return;
      }
    }

    // 세션 시작
    const newSessionId = startSession(subject, gradeLevel);
    setSessionId(newSessionId);
  }
}, []);
```

**장점**:
- ✅ 게스트 체험 가능
- ✅ 자연스러운 전환 유도
- ✅ 진입 장벽 낮음
- ✅ 장기 사용자는 인증 유도

**단점**:
- 🟡 복잡한 로직
- 🟡 게스트 데이터 관리 필요

---

## 📊 권장 솔루션 비교

| 솔루션 | 구현 난이도 | 사용자 경험 | 보안 | 데이터 | 추천도 |
|--------|----------|----------|------|--------|-------|
| **1. 게스트 완전 지원** | 🟢 낮음 | ⭐⭐⭐⭐⭐ | 🟡 중간 | localStorage | ⭐⭐⭐⭐⭐ |
| **2. 강제 인증** | 🟢 낮음 | ⭐⭐ | ⭐⭐⭐⭐⭐ | Database | ⭐⭐ |
| **3. 하이브리드** | 🔴 높음 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Hybrid | ⭐⭐⭐ |

**최종 추천**: **Solution 1 (게스트 완전 지원)** ⭐

**이유**:
1. 현재 온보딩 플로우를 최대한 활용
2. 최소한의 코드 변경
3. 사용자 경험 개선 (즉시 사용 가능)
4. 빠른 배포 가능 (1-2시간)

---

## 🚀 즉시 실행 계획

### Phase 1: 미들웨어 수정 (30분)

```bash
# 1. middleware.ts 수정
- /tutor를 protectedRoutes에서 제거
- 게스트 쿠키 체크 로직 추가
- strictAuthRoutes 도입

# 2. 테스트
npm run dev
- 온보딩 완료
- 대시보드 접근
- 튜터 접근 (게스트)
```

### Phase 2: 게스트 쿠키 설정 (15분)

```bash
# 1. onboarding/page.tsx 수정
- handleSkipAuth에 쿠키 설정 추가

# 2. profile/page.tsx 수정
- handleSignOut에 쿠키 제거 추가

# 3. 테스트
- 온보딩 → 쿠키 확인
- 로그아웃 → 쿠키 제거 확인
```

### Phase 3: 배포 및 검증 (15분)

```bash
# 1. 로컬 빌드
npm run build

# 2. Git 커밋
git add .
git commit -m "fix: Allow guest users to access tutor pages"
git push origin main

# 3. 운영 테스트
- https://smarttuter.vercel.app
- 온보딩 완료
- 튜터 접근 확인
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 게스트 사용자

```
1. https://smarttuter.vercel.app 접속
2. 온보딩 시작
3. 학년/과목/닉네임 입력
4. "Skip" 클릭 (게스트 모드)
5. ✅ 대시보드 접근 확인
6. "Math Tutor" 클릭
7. ✅ 초기 메시지 확인: "안녕! AI Park이에요!"
8. "3*6" 입력
9. ✅ 튜터 응답 확인
```

### 시나리오 2: 인증 사용자

```
1. 로그인 (Google/Kakao)
2. ✅ 대시보드 접근
3. "Math Tutor" 클릭
4. ✅ 초기 메시지 확인
5. ✅ 모든 기능 정상
```

### 시나리오 3: 게스트 → 인증 전환

```
1. 게스트로 튜터 사용
2. 프로필 클릭
3. "로그인" 클릭
4. OAuth 완료
5. ✅ 게스트 데이터 유지
6. ✅ 인증 사용자로 전환
```

---

## 📁 관련 파일

### 수정 필요
- ✏️ `middleware.ts` (핵심)
- ✏️ `app/onboarding/page.tsx`
- ✏️ `app/profile/page.tsx`

### 참고
- 📄 `lib/user/user-profile.ts`
- 📄 `lib/auth/config.ts`
- 📄 `components/tutor-pages/SimpleChatInterface.tsx`

---

## 🎯 결론

### 발견된 문제
1. ❌ Edge Runtime 문제 **아님**
2. ✅ **인증 아키텍처 불일치**가 근본 원인
3. ✅ 게스트 모드는 온보딩까지만 작동, 튜터는 차단됨

### 해결 방법
- **권장**: 게스트 쿠키 기반 인증 추가
- **소요 시간**: 1-2시간
- **영향 범위**: 미들웨어 + 온보딩 (최소)

### 예상 결과
- ✅ 게스트 사용자 튜터 접근 가능
- ✅ 온보딩 플로우 의미 있음
- ✅ 인증 사용자 영향 없음
- ✅ 사용자 경험 대폭 개선

---

**작성**: Claude + SuperClaude Framework
**분석 도구**: Context7, WebSearch, Task Agent (Explore)
**우선순위**: P0 (즉시 수정 필요)
