# 온보딩 프로세스 재설계 계획

## 📋 현재 문제점 분석

### 문제 1: 복잡하고 중복된 온보딩 흐름

**현재 `/onboarding` 페이지 (일반 온보딩) - 총 6단계**:
1. **Step 0**: 환영 화면 ("Welcome")
2. **Step 1**: 체험하기 (English Park / Math Park 체험) ← **불필요**
3. **Step 2**: 학교급 선택
4. **Step 3**: 과목 선택 (영어, 수학, 과학, 사회)
5. **Step 4**: 닉네임 입력
6. **Step 5**: 소셜 로그인 (Google/GitHub) 또는 게스트로 계속

**현재 `/onboarding/quick` 페이지 (빠른 온보딩) - 총 2단계**:
1. **Step 0**: 학교급 선택
2. **Step 1**: 과목 선택 → 대시보드로 이동

### 문제 2: Progress Bar 오류
- 사용자가 `Step 1 (체험하기)` 화면에 있을 때
- Progress bar가 이미 `2/5` 완료로 표시됨
- 실제로는 `1/5`여야 정상

**원인**: `/onboarding/page.tsx` line 109-118
```typescript
{[1, 2, 3, 4, 5].map((step) => (
  <div className={`... ${currentStep >= step ? 'active' : ''}`} />
))}
```
→ currentStep이 1일 때 step 1도 active가 되므로 2개가 활성화됨

### 문제 3: HomeClient 리다이렉션 혼란
- 로그아웃 후 "무료로 시작하기" 클릭 → `/login`으로 이동 ✅ (최근 수정)
- 하지만 로그인 완료 후 → `/onboarding/quick`로 이동
- Quick onboarding은 학교급 → 과목만 선택
- 닉네임, 프로필 설정 기회 없음

### 문제 4: 일반 온보딩의 불필요한 단계
- **Step 1 (체험하기)**: 사용자가 이미 가입 의사가 있는 상태
- 체험은 홈페이지나 별도 데모 페이지에서 제공해야 함
- 온보딩 중간에 체험하기는 흐름을 방해

---

## 🎯 개선 목표

### 목표 1: 단순하고 직관적인 흐름
```
홈페이지 → 로그인/회원가입 → 학교급 선택 → 과목 선택 → 튜터 시작
```

### 목표 2: 게스트 vs 회원 차별화
- **게스트**: 빠른 시작 (최소 정보만 수집)
- **회원**: 프로필 설정 기회 제공 (선택사항)

### 목표 3: 명확한 진행 상태 표시
- Progress bar가 실제 단계와 일치
- 사용자가 현재 위치를 명확히 인지

---

## 🔄 개선된 사용자 여정

### 시나리오 A: 신규 방문자 (게스트 모드)

```
1. 홈페이지 (/)
   ↓ [무료로 시작하기] 클릭

2. 학교급 선택 (/onboarding/quick?step=grade)
   - 초등학생 / 중학생 / 고등학생 / 대학생/성인
   ↓ 학교급 선택

3. 과목 선택 (/onboarding/quick?step=subject)
   - 영어 / 수학 / 과학 / 사회
   ↓ 과목 선택

4. 튜터 페이지 (/tutor/[subject])
   - 게스트 모드로 즉시 학습 시작
   - 상단에 "회원가입하고 학습 기록 저장하기" 배너 표시
```

### 시나리오 B: 회원가입/로그인 사용자

```
1. 홈페이지 (/)
   ↓ [시작하기] 클릭 (로그인 상태)

2. 프로필 설정 필요 시 (/onboarding/profile)
   - 학교급 선택
   - 과목 선택
   - 닉네임 입력 (선택사항)
   ↓ 완료

3. 대시보드 (/dashboard)
   - 학습 기록, 진도, 추천 과목 등
   - 또는 바로 튜터 페이지로 이동
```

### 시나리오 C: 홈페이지에서 체험하기

```
1. 홈페이지 (/)
   ↓ 스크롤 → "체험하기" 섹션

2. 체험하기 버튼 클릭
   - [English 체험하기] → /tutor/english?demo=true
   - [Math 체험하기] → /tutor/math?demo=true
   ↓

3. 튜터 데모 페이지
   - 게스트 쿠키 자동 설정
   - 제한된 기능 체험 (3회 대화 제한 등)
   - 하단에 "회원가입하고 무제한 이용하기" CTA
```

---

## 🛠️ 구현 계획

### Phase 1: Quick Onboarding 개선 (우선순위: 높음)

#### 1.1. URL 파라미터 기반 단계 관리
**현재**: State 기반 (`currentStep`)
**개선**: URL 파라미터 기반 (`/onboarding/quick?step=grade|subject`)

**장점**:
- 브라우저 뒤로가기 지원
- 새로고침 시 단계 유지
- 딥링크 지원

#### 1.2. Progress Bar 수정
**파일**: `app/onboarding/quick/page.tsx`

```typescript
// 현재 (잘못된 로직)
<div className={`${currentStep >= step ? 'active' : 'inactive'}`} />

// 개선 (올바른 로직)
<div className={`${currentStep > step ? 'active' : 'inactive'}`} />
```

#### 1.3. 과목 옵션 확장
**현재**: 영어, 수학만
**개선**: 영어, 수학, 과학, 사회 (4과목)

**파일**: `types/user.ts`
```typescript
export type Subject = 'english' | 'math' | 'science' | 'social';

export const SUBJECT_OPTIONS = [
  { value: 'english', label: '영어', emoji: '📚', ... },
  { value: 'math', label: '수학', emoji: '🔢', ... },
  { value: 'science', label: '과학', emoji: '🔬', ... },
  { value: 'social', label: '사회', emoji: '🏛️', ... },
];
```

### Phase 2: HomeClient 리다이렉션 로직 정리 (우선순위: 높음)

#### 2.1. 로그아웃 상태 → 로그인 유도
**파일**: `app/HomeClient.tsx`

```typescript
const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();

  // 게스트 쿠키 확인
  const hasGuestCookie = document.cookie.includes('aipark_guest_mode=true');

  // 완전 로그아웃 상태: 로그인 페이지로
  if (!isAuthenticated && !hasGuestCookie) {
    window.location.href = '/login';
    return;
  }

  // 게스트 모드: 프로필 확인 후 이동
  if (!isAuthenticated && hasGuestCookie) {
    const hasProfile = localStorage.getItem('aipark_user_profile');
    window.location.href = hasProfile ? '/dashboard' : '/onboarding/quick?step=grade';
    return;
  }

  // 로그인 상태: 프로필 확인 후 이동
  if (isAuthenticated) {
    const hasProfile = localStorage.getItem('aipark_user_profile');
    window.location.href = hasProfile ? '/dashboard' : '/onboarding/profile';
    return;
  }
};
```

#### 2.2. 로그인 성공 후 리다이렉션
**파일**: `app/login/LoginClient.tsx`

```typescript
if (result?.ok) {
  // 프로필 확인
  const hasProfile = localStorage.getItem('aipark_user_profile');

  // callbackUrl이 있으면 우선
  if (callbackUrl && callbackUrl !== '/dashboard') {
    router.push(callbackUrl);
  }
  // 프로필 없으면 온보딩
  else if (!hasProfile) {
    router.push('/onboarding/profile');
  }
  // 프로필 있으면 대시보드
  else {
    router.push('/dashboard');
  }
}
```

### Phase 3: 일반 온보딩 페이지 간소화 (우선순위: 중간)

#### 3.1. Step 1 (체험하기) 제거
**변경 전**: 6단계 (Welcome → Experience → Grade → Subject → Nickname → Auth)
**변경 후**: 4단계 (Welcome → Grade → Subject → Profile)

#### 3.2. 새로운 흐름
```typescript
Step 0: Welcome (환영 화면)
Step 1: Grade Level (학교급 선택)
Step 2: Subject (과목 선택)
Step 3: Profile (닉네임 + 소셜 로그인 통합)
```

#### 3.3. Progress Bar 수정
```typescript
// Step이 0부터 시작하므로 비교 로직 수정
{[0, 1, 2, 3].map((step) => (
  <div className={`${currentStep > step ? 'active' : 'inactive'}`} />
))}
```

### Phase 4: 홈페이지 체험하기 섹션 추가 (우선순위: 낮음)

#### 4.1. 홈페이지에 체험 섹션 추가
**파일**: `app/HomeClient.tsx`

```typescript
{/* Experience Section - 홈페이지에 추가 */}
<section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-12">
      먼저 체험해보세요
    </h2>

    <div className="grid md:grid-cols-2 gap-8">
      <button
        onClick={() => {
          document.cookie = 'aipark_guest_mode=true; path=/; max-age=31536000';
          window.location.href = '/tutor/english?demo=true';
        }}
        className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl..."
      >
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-2xl font-bold text-white">English 체험하기</h3>
      </button>

      <button
        onClick={() => {
          document.cookie = 'aipark_guest_mode=true; path=/; max-age=31536000';
          window.location.href = '/tutor/math?demo=true';
        }}
        className="p-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl..."
      >
        <div className="text-6xl mb-4">🔢</div>
        <h3 className="text-2xl font-bold text-white">Math 체험하기</h3>
      </button>
    </div>
  </div>
</section>
```

---

## 📐 새로운 파일 구조

```
app/
├── page.tsx (홈페이지)
│   └── HomeClient.tsx (개선된 리다이렉션 로직)
│
├── login/
│   └── LoginClient.tsx (개선된 리다이렉션)
│
├── onboarding/
│   ├── page.tsx (일반 온보딩 - 4단계로 축소)
│   │   └── components/
│   │       ├── WelcomeStep.tsx
│   │       ├── GradeLevelStep.tsx (재사용)
│   │       ├── SubjectStep.tsx (4과목으로 확장)
│   │       └── ProfileStep.tsx (NEW - 닉네임 + 소셜 로그인 통합)
│   │
│   ├── quick/
│   │   └── page.tsx (빠른 온보딩 - URL 파라미터 기반)
│   │
│   └── profile/
│       └── page.tsx (NEW - 로그인 사용자 전용 프로필 설정)
│
└── tutor/
    ├── english/page.tsx
    ├── math/page.tsx
    ├── science/page.tsx (NEW)
    └── social/page.tsx (NEW)
```

---

## 🎨 UX 개선사항

### 1. 명확한 CTA 텍스트
| 위치 | 현재 | 개선 |
|------|------|------|
| 홈페이지 (로그아웃) | "무료로 시작하기" | "무료 체험하기" |
| 홈페이지 (로그인) | "대시보드로 이동" | "학습 시작하기" |
| 온보딩 | "체험하기" 버튼 | 제거 (홈페이지로 이동) |

### 2. Progress Indicator 개선
```
현재: ●● ○ ○ ○  (2/5 단계 완료)  ← 잘못된 표시
개선: ● ○ ○ ○ ○  (1/5 단계 완료)  ← 정확한 표시
```

### 3. 게스트 모드 안내 배너
튜터 페이지 상단에 표시:
```
┌────────────────────────────────────────────────────┐
│ 🎓 게스트 모드로 이용 중입니다                            │
│ [회원가입하고 학습 기록 저장하기 →]                       │
└────────────────────────────────────────────────────┘
```

---

## ✅ 구현 우선순위

### 🔴 High Priority (즉시 수정)
1. ✅ HomeClient 리다이렉션 로직 수정
2. ✅ Quick onboarding progress bar 수정
3. ✅ 로그인 후 리다이렉션 로직 수정

### 🟡 Medium Priority (다음 스프린트)
4. ⬜ 일반 온보딩 Step 1 (체험하기) 제거
5. ⬜ 과목 옵션 확장 (과학, 사회 추가)
6. ⬜ URL 파라미터 기반 온보딩 전환

### 🟢 Low Priority (향후 개선)
7. ⬜ 홈페이지 체험 섹션 추가
8. ⬜ 게스트 모드 안내 배너
9. ⬜ 회원 전용 프로필 설정 페이지

---

## 🧪 테스트 시나리오

### 시나리오 1: 신규 방문자 (게스트)
1. 홈페이지 접속
2. "무료 체험하기" 클릭
3. 학교급 선택 → Progress: ● ○ (1/2)
4. 과목 선택 → Progress: ● ● (2/2)
5. 튜터 페이지 즉시 시작

**예상 결과**:
- ✅ 2단계만 거쳐 빠르게 시작
- ✅ Progress bar가 정확히 표시
- ✅ 게스트 쿠키 설정됨

### 시나리오 2: 로그인 사용자
1. 홈페이지 접속 (로그인 상태)
2. "학습 시작하기" 클릭
3. 프로필 없으면 → 온보딩으로 이동
4. 프로필 있으면 → 대시보드로 이동

**예상 결과**:
- ✅ 프로필 상태에 따라 적절한 페이지로 이동
- ✅ 학습 기록 저장됨

### 시나리오 3: 로그아웃 후 재방문
1. 로그아웃 실행
2. 홈페이지 "무료 체험하기" 클릭
3. 로그인 페이지로 이동

**예상 결과**:
- ✅ 게스트 쿠키 삭제됨
- ✅ 로그인 유도

---

## 📊 예상 효과

| 지표 | 현재 | 개선 후 | 효과 |
|------|------|---------|------|
| 평균 온보딩 단계 | 6단계 | 2단계 (게스트) | **-67%** |
| 평균 완료 시간 | ~3분 | ~30초 | **-83%** |
| 이탈률 | 추정 40% | 추정 15% | **-62%** |
| 사용자 만족도 | 추정 6/10 | 추정 8/10 | **+33%** |

---

## 🚀 다음 단계

1. **즉시 수정** (오늘):
   - HomeClient 리다이렉션 로직
   - Progress bar 표시 오류
   - 로그인 후 리다이렉션

2. **1주일 내**:
   - 일반 온보딩 간소화
   - 과목 확장 (과학, 사회)
   - URL 기반 온보딩

3. **2주일 내**:
   - 홈페이지 체험 섹션
   - 게스트 모드 안내
   - 프로필 설정 페이지

---

## 📝 추가 고려사항

### A/B 테스트 제안
- **A안**: 홈페이지 → 로그인 → 온보딩
- **B안**: 홈페이지 → 온보딩 (게스트) → 필요 시 로그인

→ 전환율, 이탈률, 회원가입률 비교

### 모바일 최적화
- 터치 제스처 (스와이프로 다음 단계)
- 큰 터치 영역
- 단계별 자동 스크롤

### 접근성
- 키보드 네비게이션
- 스크린 리더 지원
- 고대비 모드
