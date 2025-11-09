# 대시보드 더미 데이터 오류 분석 보고서

## 문제 요약

### 보고된 오류
1. **학습 내역이 없는 신규 계정에서 대시보드 수치 값이 표시됨**
   - 계정: b090723@naver.com
   - 상태: 학습 내역 없음 (신규 가입)
   - 문제: 이번 주 학습 시간, 영역별 진도율, 완료 단원 등 다양한 더미 데이터 표시

2. **학년 선택 문제**
   - 사용자가 "중학교"만 선택했는데 "중2"로 표기됨
   - 학년(Grade Detail) 선택 UI/UX가 없음

---

## 근본 원인 분석

### 1. 하드코딩된 더미 데이터 (Critical Issue)

#### 위치: `app/dashboard/page.tsx`

**영어 학습 카드 (Line 263-342)**
```tsx
<div className="text-right">
  <div className="text-2xl font-bold">A2</div>  // ❌ 하드코딩
  <div className="text-xs text-white/80">CEFR Level</div>
</div>

// 이번 주 학습 시간
<AnimatedCounter value={12} duration={1.5} delay={0.4} className="font-bold" /> // ❌ 하드코딩
<span>20시간</span>  // ❌ 하드코딩

// 영역별 진도율
<AnimatedCounter value={80} suffix="%" ... />  // ❌ Listening 80%
<AnimatedCounter value={60} suffix="%" ... />  // ❌ Speaking 60%
<AnimatedCounter value={100} suffix="%" ... /> // ❌ Reading 100%
<AnimatedCounter value={40} suffix="%" ... />  // ❌ Writing 40%
```

**수학 학습 카드 (Line 348-444)**
```tsx
<div className="text-2xl font-bold">중2</div>  // ❌ 하드코딩
<div className="text-xs text-white/80">Grade Level</div>

<AnimatedCounter value={8} duration={1.5} delay={0.5} className="font-bold" /> // ❌ 8시간
<span>15시간</span>  // ❌ 하드코딩

<AnimatedCounter value={2} duration={1.2} delay={0.9} />  // ❌ 완료 2단원
<span className="text-sm">5</span>  // ❌ 전체 5단원

<motion.div className="text-sm font-bold">이차방정식</motion.div>  // ❌ 하드코딩
```

**과학 학습 카드 (Line 447-543)**
```tsx
<div className="text-2xl font-bold">중2</div>  // ❌ 하드코딩
<AnimatedCounter value={5} ... />  // ❌ 5시간
<span>10시간</span>  // ❌ 하드코딩
<AnimatedCounter value={1} ... />  // ❌ 완료 1단원
<span className="text-sm">4</span>  // ❌ 전체 4단원
<motion.div className="text-sm font-bold">화학반응</motion.div>  // ❌ 하드코딩
```

**사회 학습 카드 (Line 546-642)**
```tsx
<div className="text-2xl font-bold">중2</div>  // ❌ 하드코딩
<AnimatedCounter value={4} ... />  // ❌ 4시간
<span>10시간</span>  // ❌ 하드코딩
<AnimatedCounter value={1} ... />  // ❌ 완료 1단원
<span className="text-sm">4</span>  // ❌ 전체 4단원
<motion.div className="text-sm font-bold">한국사</motion.div>  // ❌ 하드코딩
```

#### 문제점
- **모든 통계 수치가 하드코딩됨**: 실제 사용자 학습 데이터 무시
- **신규 사용자도 동일한 더미 데이터 표시**: 학습 내역이 전혀 없는데 마치 학습한 것처럼 보임
- **데이터 무결성 문제**: 사용자가 실제 학습 현황을 알 수 없음

---

### 2. 학년 자동 설정 로직 (Design Issue)

#### 위치: `app/onboarding/quick/page.tsx` (Line 67-73)

```tsx
// gradeLevel에서 gradeDetail 자동 생성
const gradeDetailMap: Record<GradeLevel, string> = {
  elementary: '초등학교 6학년',
  middle: '중학교 3학년',      // ❌ 중학교 선택 시 무조건 3학년
  high: '고등학교 3학년',
  university: '대학교 4학년',
};
```

#### 문제점
- **사용자 선택권 박탈**: 중학교 선택 시 무조건 "중학교 3학년"으로 설정
- **잘못된 자동 추론**: 사용자가 중학교만 선택했는데 3학년으로 가정
- **실제 표시 불일치**:
  - 온보딩에서는 "중학교 3학년"으로 저장
  - 대시보드에는 하드코딩된 "중2" 표시
  - 실제로는 아무 상관없음 (더미 데이터이므로)

---

### 3. 데이터 흐름 분석

#### 현재 구조
```
사용자 회원가입
  ↓
온보딩 (학교급만 선택 → 자동으로 gradeDetail="중학교 3학년" 설정)
  ↓
서버 저장 (gradeLevel="middle", gradeDetail="중학교 3학년")
  ↓
대시보드 진입
  ↓
하드코딩된 더미 데이터 표시 (실제 DB 데이터 무시)
  ↓
사용자: "왜 학습 내역이 보이지?" ❌
```

#### 문제
1. **온보딩에서 gradeDetail을 자동 생성**: 사용자에게 선택권 없음
2. **대시보드에서 하드코딩된 값 사용**: DB에 저장된 실제 데이터와 무관
3. **데이터 정합성 없음**: 표시되는 데이터가 실제 사용자 프로필과 무관

---

## 수정 계획

### Phase 1: 하드코딩 더미 데이터 제거 (High Priority)

#### 1.1 실제 사용자 프로필 데이터 사용

**수정 대상**: `app/dashboard/page.tsx`

**변경 내용**:
```tsx
// Before (하드코딩)
<div className="text-2xl font-bold">중2</div>

// After (실제 데이터 사용)
<div className="text-2xl font-bold">
  {profile?.gradeDetail || profile?.gradeLevel || '미설정'}
</div>
```

#### 1.2 학습 통계 데이터 조건부 렌더링

**변경 내용**:
```tsx
// 학습 데이터가 있을 때만 표시
{learningStats ? (
  <>
    <AnimatedCounter value={learningStats.weeklyHours} />
    <span>/{learningStats.weeklyGoal}시간</span>
  </>
) : (
  <div className="text-sm text-white/60">학습 시작 전</div>
)}
```

#### 1.3 빈 상태 (Empty State) UI 추가

**새로운 컴포넌트 추가**:
```tsx
function EmptyLearningCard({ subject }: { subject: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">📚</div>
      <p className="text-white/80 mb-2">아직 학습 기록이 없습니다</p>
      <button className="bg-white/20 px-4 py-2 rounded-lg">
        {subject} 학습 시작하기 →
      </button>
    </div>
  );
}
```

---

### Phase 2: 학년 선택 UI/UX 추가 (Medium Priority)

#### 2.1 온보딩 단계 추가

**현재**: 학교급 선택 → 과목 선택 (2단계)
**개선**: 학교급 선택 → **학년 선택** → 과목 선택 (3단계)

#### 2.2 학년 선택 컴포넌트 구현

**새 파일**: `components/onboarding/GradeDetailStep.tsx`

```tsx
type GradeDetailOption = {
  gradeLevel: GradeLevel;
  options: string[];
};

const GRADE_DETAIL_OPTIONS: GradeDetailOption[] = [
  {
    gradeLevel: 'elementary',
    options: ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년']
  },
  {
    gradeLevel: 'middle',
    options: ['1학년', '2학년', '3학년']
  },
  {
    gradeLevel: 'high',
    options: ['1학년', '2학년', '3학년']
  },
  {
    gradeLevel: 'university',
    options: ['1학년', '2학년', '3학년', '4학년', '대학원']
  }
];

export function GradeDetailStep({
  gradeLevel,
  onSelect
}: {
  gradeLevel: GradeLevel;
  onSelect: (detail: string) => void;
}) {
  const options = GRADE_DETAIL_OPTIONS.find(g => g.gradeLevel === gradeLevel)?.options || [];

  return (
    <div className="grid grid-cols-3 gap-4">
      {options.map((option) => (
        <motion.button
          key={option}
          onClick={() => onSelect(option)}
          className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-2xl font-bold">{option}</div>
        </motion.button>
      ))}
    </div>
  );
}
```

#### 2.3 온보딩 플로우 업데이트

**수정 대상**: `app/onboarding/quick/page.tsx`

```tsx
// Step 추가: 0: 학교급, 1: 학년, 2: 과목
const [currentStep, setCurrentStep] = useState(0);
const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(null);
const [gradeDetail, setGradeDetail] = useState<string | null>(null);
const [subject, setSubject] = useState<Subject | null>(null);

// Step 1 → Step 2 이동
const handleGradeLevel = (level: GradeLevel) => {
  setGradeLevel(level);
  setCurrentStep(1);  // 학년 선택 단계로
};

// Step 2 → Step 3 이동
const handleGradeDetail = (detail: string) => {
  setGradeDetail(detail);
  setCurrentStep(2);  // 과목 선택 단계로
};

// Step 3: 과목 선택 후 완료
const handleSubject = async (selectedSubject: Subject) => {
  // gradeDetail을 그대로 사용 (자동 생성 제거)
  const response = await fetch('/api/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gradeLevel: gradeLevel,
      gradeDetail: `${getGradeLevelKorean(gradeLevel!)} ${gradeDetail}`,  // "중학교 2학년"
      preferredSubjects: [selectedSubject],
    }),
  });

  // ... 나머지 로직
};
```

---

### Phase 3: API 데이터 연동 (High Priority)

#### 3.1 학습 통계 API 구현

**새 파일**: `app/api/user/learning-stats/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return createErrorResponse('인증 필요', 401, 'UNAUTHORIZED');
  }

  const userId = session.user.email;

  // Redis 또는 DB에서 실제 학습 통계 조회
  const stats = await getLearningStats(userId);

  return NextResponse.json({
    success: true,
    data: {
      english: {
        cefrLevel: stats.english.cefrLevel || null,
        weeklyHours: stats.english.weeklyHours || 0,
        weeklyGoal: 20,
        skills: {
          listening: stats.english.listening || 0,
          speaking: stats.english.speaking || 0,
          reading: stats.english.reading || 0,
          writing: stats.english.writing || 0,
        }
      },
      math: {
        weeklyHours: stats.math.weeklyHours || 0,
        weeklyGoal: 15,
        completedUnits: stats.math.completedUnits || 0,
        totalUnits: stats.math.totalUnits || 0,
        currentTopic: stats.math.currentTopic || null,
      },
      // ... 과학, 사회 등
    }
  });
}
```

#### 3.2 대시보드에서 API 호출

**수정 대상**: `app/dashboard/page.tsx`

```tsx
const [learningStats, setLearningStats] = useState(null);

useEffect(() => {
  async function fetchLearningStats() {
    try {
      const response = await fetch('/api/user/learning-stats');
      if (response.ok) {
        const result = await response.json();
        setLearningStats(result.data);
      }
    } catch (error) {
      console.error('학습 통계 로딩 실패:', error);
    }
  }

  if (isAuthenticated && user) {
    fetchLearningStats();
  }
}, [isAuthenticated, user]);

// 렌더링에서 실제 데이터 사용
{learningStats?.english ? (
  <AnimatedCounter value={learningStats.english.weeklyHours} />
) : (
  <EmptyLearningCard subject="영어" />
)}
```

---

## 우선순위 및 일정

### Critical (즉시 수정 필요)
1. **하드코딩된 더미 데이터 제거** (Phase 1.1, 1.2)
   - 예상 시간: 2시간
   - 영향도: 매우 높음
   - 이유: 사용자 혼란 및 신뢰도 문제

2. **빈 상태 UI 추가** (Phase 1.3)
   - 예상 시간: 1시간
   - 영향도: 높음
   - 이유: 신규 사용자 UX 개선

### High (빠른 시일 내 수정)
3. **학습 통계 API 구현 및 연동** (Phase 3)
   - 예상 시간: 4시간
   - 영향도: 높음
   - 이유: 실제 데이터 기반 대시보드 필수

### Medium (기능 개선)
4. **학년 선택 UI/UX 추가** (Phase 2)
   - 예상 시간: 3시간
   - 영향도: 중간
   - 이유: 사용자 선택권 제공 및 정확도 향상

---

## 예상 효과

### Before (현재)
```
신규 사용자 → 학습 내역 없음 → 더미 데이터 표시 → 혼란 ❌
중학교 선택 → 자동으로 "중학교 3학년" → 사용자 의도와 불일치 ❌
```

### After (수정 후)
```
신규 사용자 → 학습 내역 없음 → "학습 시작 전" 표시 → 명확 ✅
중학교 선택 → 1학년/2학년/3학년 선택 UI → 정확한 정보 입력 ✅
실제 학습 후 → API에서 실제 통계 조회 → 정확한 진도 표시 ✅
```

---

## 결론

### 핵심 문제
1. **더미 데이터 하드코딩**: 모든 사용자에게 동일한 가짜 통계 표시
2. **학년 자동 설정**: 사용자 선택 없이 임의의 학년 지정
3. **데이터 무시**: 실제 DB 프로필 데이터 사용하지 않음

### 해결 방안
1. **즉시**: 하드코딩 제거 + 빈 상태 UI
2. **단기**: 실제 학습 통계 API 연동
3. **중기**: 학년 선택 UI/UX 추가

### 수정 우선순위
**Critical → High → Medium** 순서로 진행하여 사용자 경험 개선 및 데이터 정확성 확보
