# SmartTutor 학교급 선택 및 대시보드 개선 계획

## 📊 글로벌 EdTech 서비스 벤치마크 분석

### 1. 주요 AI 튜터 플랫폼 분석 (2025)

#### Khan Academy (Khanmigo)
- **가격**: $4/월 (기부 기반)
- **핵심 기능**:
  - 소크라테스식 질문 기법으로 학습 유도
  - 실시간 피드백 제공
  - 다중 과목 지원 (수학, 읽기, 코딩)
  - 개인화된 학습 경로
- **온보딩**: 학습 목표와 레벨을 초기에 설정
- **대시보드**: 진행률 추적, 학습 활동과 결과 명확히 분리

#### Duolingo Max
- **가격**: $30/월 또는 $168/년
- **핵심 기능**:
  - GPT-4 기반 대화 연습
  - 게이미피케이션 (포인트, 뱃지, 리더보드)
  - AI 비디오 콜 기능
  - 고급 문법 트랙
- **온보딩 전략** (모범 사례):
  - 프로필 생성을 **온보딩 마지막 단계**로 배치
  - 먼저 가치를 경험하게 한 후 프로필 저장 유도
  - 학습 언어, 학습 목표, 시간 투자를 단계적으로 수집
  - 연령, 성별, 닉네임만 수집 (사진은 선택)
- **대시보드**: 일일 목표, 진행률, 성과가 시각적으로 구분됨

#### 기타 주요 플랫폼
- **Century Tech**: AI 기반 적응형 학습
- **Cognii**: 자연어 처리 기반 튜터링
- **Mindgrasp AI**: 콘텐츠 요약 및 학습 지원
- **Brainly**: 커뮤니티 기반 Q&A + AI
- **Photomath**: 수학 문제 사진 인식 및 풀이

### 2. EdTech 온보딩 UX 모범 사례

#### 핵심 원칙
1. **필수 정보만 수집**: 초기 마찰 최소화
2. **가치 우선 경험**: 등록 전 기능 체험
3. **점진적 공개**: 기본 기능 → 고급 기능 순차 노출
4. **개인화**: 학습 목표와 선호도 기반 경로 제공
5. **간소화된 흐름**: 단일 페이지에서 모든 설정 완료

#### 학교급/레벨 선택 패턴
- **LinkedIn 방식**: 온보딩을 소화 가능한 단계로 분할
- **Duolingo 방식**: 프로필 생성을 가치 경험 후로 연기
- **SoundCloud 방식**: 연령, 성별, 닉네임만 수집 (개인화 추천용)

#### 이름 입력 요구사항
**조사 결과**:
- 대부분의 EdTech 플랫폼은 **닉네임 또는 표시 이름**만 수집
- 실명은 필수가 아닌 **선택 사항**으로 제공
- **개인화된 인사** (예: "Welcome, [이름]")를 위해 First Name만 요청
- Duolingo는 **프로필 생성을 마지막 단계**로 배치하여 마찰 감소

**권장사항**:
- 실명 대신 **닉네임** 수집 (필수)
- 학습 경험 개인화를 위한 최소 정보
- 프로필 설정에서 나중에 변경 가능

### 3. 대시보드 디자인 트렌드 (2025)

#### 카드 기반 디자인
- **장점**: 정보를 논리적 섹션으로 분리, 인지 부하 감소
- **구성**: 시험, 수업 일정, 성적 등을 별도 카드로 구성
- **인터랙션**: 각 카드는 독립적으로 상호작용 가능
- **시각적 계층**: 주요 동작 버튼을 카드 내 가장 눈에 띄게 배치

#### 학습 활동 vs 분석 결과 분리
**모범 사례**:
1. **정보 블록 분리**: 관련 데이터를 논리적 섹션/카드로 그룹화
2. **행동 우선순위**: 경고 및 실행 가능한 항목을 우선 표시
3. **명확한 CTA**: 버튼, 아이콘, 텍스트로 행동 유도
4. **클릭 동작 커스터마이징**: 카드 클릭 시 관련 상세 페이지로 이동

**LearningViz 모델**:
- **학생 전체 성과 분석 모듈** (결과 조회)
- **학생 그룹 성과 분석 모듈** (결과 조회)
- **최종 시험 항목 분석 모듈** (결과 조회)
- **학습 활동 모듈** (참여 행동)

#### 2025 UI/UX 트렌드
1. **마이크로러닝**: 5분 단위 학습 콘텐츠
2. **게이미피케이션**: 포인트, 뱃지, 리더보드, 진행률 추적
3. **적응형 학습 인터페이스**: 학습자의 진행과 선호도에 반응
4. **모바일 우선 설계**: 스크롤 가능한 카드 인터페이스
5. **개인화**: 난이도 조정, 콘텐츠 추천
6. **AI 기반 실시간 피드백**: 즉각적인 힌트와 피드백

---

## 🎯 SmartTutor 개선 설계안

### Phase 13-1: 학교급 선택 개선

#### 1. 온보딩 흐름 재설계

**현재 문제점**:
- 학교급 선택 시점이 불명확
- 프로필에서 수정 불가능
- 로그인 후 이름 입력 없음

**개선 방안**:

##### A. 초기 온보딩 (최초 방문 시)

```
Step 1: Welcome 화면
┌─────────────────────────────────────┐
│   🎓 SmartTutor에 오신 것을 환영합니다!   │
│                                     │
│   AI 튜터와 함께하는                   │
│   개인화된 영어/수학 학습               │
│                                     │
│   [시작하기] ← 큰 CTA 버튼             │
└─────────────────────────────────────┘

Step 2: 체험 (로그인 없이)
┌─────────────────────────────────────┐
│   먼저 SmartTutor를 체험해보세요!        │
│                                     │
│   📚 영어 튜터 체험                    │
│   🔢 수학 튜터 체험                    │
│                                     │
│   [건너뛰고 계정 만들기]                │
└─────────────────────────────────────┘

Step 3: 간단한 질문 (Duolingo 스타일)
┌─────────────────────────────────────┐
│   어떤 학습자이신가요?                   │
│                                     │
│   🎒 초등학생                          │
│   📖 중학생                            │
│   📘 고등학생                          │
│   🎓 대학생/성인                       │
│                                     │
│   [다음]                              │
└─────────────────────────────────────┘

Step 4: 학습 목표
┌─────────────────────────────────────┐
│   어떤 과목을 집중하고 싶으신가요?         │
│                                     │
│   ✅ 영어                             │
│   ✅ 수학                             │
│   (복수 선택 가능)                     │
│                                     │
│   [다음]                              │
└─────────────────────────────────────┘

Step 5: 닉네임 설정 (가치 경험 후)
┌─────────────────────────────────────┐
│   학습 진행상황을 저장하려면              │
│   닉네임을 설정해주세요!                 │
│                                     │
│   닉네임: [____________]              │
│   (예: 학습왕, StudyKing, 수학천재)     │
│                                     │
│   나중에 프로필에서 변경 가능합니다        │
│                                     │
│   [시작하기]                          │
└─────────────────────────────────────┘

Step 6: 소셜 로그인 (선택)
┌─────────────────────────────────────┐
│   진행상황을 안전하게 저장하세요          │
│                                     │
│   🔵 Google로 계속하기                │
│   ⚫ GitHub로 계속하기                │
│                                     │
│   [건너뛰기 (게스트로 계속)]            │
└─────────────────────────────────────┘
```

**핵심 원칙**:
1. **가치 우선**: 체험 → 질문 → 프로필 순서
2. **최소 마찰**: 닉네임만 필수, 로그인은 선택
3. **점진적 공개**: 한 번에 하나의 질문
4. **게스트 모드**: LocalStorage 기반 임시 저장

##### B. 프로필 편집 기능

```typescript
// /app/profile/page.tsx 개선

interface UserProfile {
  nickname: string;
  gradeLevel: 'elementary' | 'middle' | 'high' | 'university';
  preferredSubjects: ('english' | 'math')[];
  learningGoals?: string;
  avatar?: string; // 선택 사항
}

// 편집 가능한 필드:
- 닉네임 (언제든 변경 가능)
- 학교급 (언제든 변경 가능)
- 선호 과목 (언제든 변경 가능)
- 학습 목표 (선택 사항)
- 아바타 (선택 사항)
```

**프로필 페이지 와이어프레임**:
```
┌─────────────────────────────────────┐
│  👤 내 프로필                         │
├─────────────────────────────────────┤
│                                     │
│  🎭 [아바타 이미지]                   │
│     닉네임: 학습왕 [편집]              │
│                                     │
│  📚 학습 정보                         │
│  ├─ 학교급: 중학생 [변경]             │
│  ├─ 선호 과목: 영어, 수학 [변경]       │
│  └─ 학습 목표: [추가하기]             │
│                                     │
│  🔗 계정 연결                         │
│  └─ Google: 연결됨 ✓                │
│                                     │
│  [저장]                              │
└─────────────────────────────────────┘
```

#### 2. 데이터 저장 전략

```typescript
// /lib/user/user-profile.ts

/**
 * 사용자 프로필 저장 (LocalStorage + Database 준비)
 */
export interface UserProfile {
  id: string;
  nickname: string;
  gradeLevel: GradeLevel;
  preferredSubjects: Subject[];
  createdAt: Date;
  updatedAt: Date;

  // 선택 사항
  learningGoals?: string;
  avatar?: string;
  email?: string; // 소셜 로그인 시
  provider?: 'google' | 'github';
}

// LocalStorage 키
const PROFILE_KEY = 'smarttutor_user_profile';

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  // TODO: Database 동기화 (추후 인증 시스템 추가 시)
}

export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(PROFILE_KEY);
  if (!stored) return null;

  return JSON.parse(stored);
}

export function updateUserProfile(updates: Partial<UserProfile>): void {
  const current = getUserProfile();
  if (!current) return;

  const updated = {
    ...current,
    ...updates,
    updatedAt: new Date(),
  };

  saveUserProfile(updated);
}
```

---

### Phase 13-2: 대시보드 개선

#### 1. 현재 대시보드 분석

**현재 구조** ([app/dashboard/page.tsx:402-431](app/dashboard/page.tsx#L402-L431)):
```
5개 카드가 그리드로 배치:
1. 영어 튜터
2. 수학 튜터
3. 학습 리포트
4. 복습 관리
5. 감정 분석 (Phase 12 추가)
```

**문제점**:
1. ❌ 학습 참여(1,2) vs 결과 조회(3,4,5) 구분 불명확
2. ❌ 영어/수학 튜터가 메인임을 시각적으로 강조 부족
3. ❌ 모든 카드가 동일한 크기와 중요도로 표시됨
4. ❌ 클릭 시 어디로 이동하는지 불명확

#### 2. 개선 설계안

##### A. 2-섹션 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  🎓 SmartTutor Dashboard                            │
│  안녕하세요, 학습왕님! 👋                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🚀 학습 시작하기                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  📚 영어 튜터      │  │  🔢 수학 튜터      │        │
│  │                  │  │                  │        │
│  │  AI와 함께하는    │  │  개념부터 문제풀이 │        │
│  │  맞춤형 영어학습   │  │  까지 완벽 학습    │        │
│  │                  │  │                  │        │
│  │  ▶ 학습 시작      │  │  ▶ 학습 시작      │  ← 큰 버튼
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  오늘의 추천: 영어 튜터 (3일간 미접속)                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📊 학습 현황 & 분석                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 📈 리포트 │ │ 🔄 복습   │ │ 🎭 감정   │  ← 작은 카드
│  │          │ │          │ │          │           │
│  │ 학습 통계 │ │ 복습 일정 │ │ 감정 분석 │           │
│  │ 및 성과   │ │ 및 관리   │ │ 및 패턴   │           │
│  │          │ │          │ │          │           │
│  │  보기 →  │ │  보기 →  │ │  보기 →  │  ← 작은 텍스트 링크
│  └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ⚡ 빠른 액세스                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                     │
│  • 어제 학습한 내용 복습하기                           │
│  • 오늘의 추천 학습: 영어 문법 - 현재완료               │
│  • 감정 분석: 최근 좌절감 증가 → 휴식 추천             │
└─────────────────────────────────────────────────────┘
```

##### B. 시각적 계층 구조

**레벨 1: 주요 학습 활동** (영어/수학 튜터)
- 크기: 큰 카드 (300px 높이)
- 위치: 상단 섹션
- 색상: 강렬한 그라디언트 (파란색, 보라색)
- 버튼: 큰 "▶ 학습 시작" CTA
- 아이콘: 큰 이모지 또는 SVG (64px)

**레벨 2: 결과 & 분석** (리포트, 복습, 감정)
- 크기: 중간 카드 (200px 높이)
- 위치: 중간 섹션
- 색상: 부드러운 그라디언트 (그린, 오렌지, 핑크)
- 버튼: 작은 "보기 →" 텍스트 링크
- 아이콘: 중간 이모지 (48px)

**레벨 3: 빠른 액세스** (추천 항목)
- 크기: 리스트 형태
- 위치: 하단 섹션
- 색상: 흰색 배경 + 텍스트
- 버튼: 인라인 링크
- 아이콘: 작은 불릿 포인트

##### C. 인터랙션 개선

```typescript
// 각 카드에 명확한 행동 지시

interface DashboardCard {
  id: string;
  type: 'action' | 'analysis';
  title: string;
  description: string;
  cta: {
    text: string;
    action: 'navigate' | 'modal' | 'external';
    destination: string;
  };
  badge?: {
    text: string;
    color: string;
  };
  stats?: {
    label: string;
    value: string | number;
  }[];
}

// 예시: 영어 튜터 카드
const englishTutorCard: DashboardCard = {
  id: 'english-tutor',
  type: 'action',
  title: '📚 영어 튜터',
  description: 'AI와 함께하는 맞춤형 영어학습',
  cta: {
    text: '▶ 학습 시작',
    action: 'navigate',
    destination: '/tutor/english',
  },
  badge: {
    text: '3일간 미접속',
    color: 'orange',
  },
  stats: [
    { label: '총 학습 시간', value: '12시간 30분' },
    { label: '이번 주 학습', value: '0분' },
  ],
};

// 예시: 리포트 카드
const reportCard: DashboardCard = {
  id: 'learning-report',
  type: 'analysis',
  title: '📈 학습 리포트',
  description: '학습 통계 및 성과',
  cta: {
    text: '보기 →',
    action: 'navigate',
    destination: '/report',
  },
  stats: [
    { label: '이번 주 학습', value: '5시간' },
    { label: '평균 점수', value: '85점' },
  ],
};
```

##### D. 반응형 디자인

**데스크톱 (>1024px)**:
```
[영어 튜터]  [수학 튜터]
[리포트]  [복습]  [감정]
```

**태블릿 (768px - 1024px)**:
```
[영어 튜터]
[수학 튜터]
[리포트]  [복습]  [감정]
```

**모바일 (<768px)**:
```
[영어 튜터]
[수학 튜터]
[리포트]
[복습]
[감정]
```

#### 3. 컴포넌트 구조

```typescript
// /components/dashboard/DashboardSection.tsx

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function DashboardSection({ title, subtitle, icon, children }: DashboardSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-3xl">{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
      <div className="border-b-2 border-gray-200 mb-6" />
      {children}
    </section>
  );
}

// /components/dashboard/ActionCard.tsx (학습 시작 카드)

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  ctaText: string;
  onAction: () => void;
  badge?: { text: string; color: string };
  stats?: { label: string; value: string }[];
}

export function ActionCard({ title, description, icon, gradient, ctaText, onAction, badge, stats }: ActionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-gradient-to-r ${gradient} rounded-3xl p-8 h-80 flex flex-col justify-between cursor-pointer shadow-xl`}
      onClick={onAction}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="text-6xl">{icon}</div>
          {badge && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-800`}>
              {badge.text}
            </span>
          )}
        </div>

        <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/90 text-lg">{description}</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/20 rounded-lg p-3">
              <div className="text-xs text-white/70">{stat.label}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
        {ctaText}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </motion.div>
  );
}

// /components/dashboard/AnalyticsCard.tsx (결과 조회 카드)

interface AnalyticsCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  href: string;
  stats?: { label: string; value: string }[];
}

export function AnalyticsCard({ title, description, icon, gradient, href, stats }: AnalyticsCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 h-56 flex flex-col justify-between shadow-lg`}
      >
        <div>
          <div className="text-4xl mb-3">{icon}</div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>

        {stats && (
          <div className="space-y-1">
            {stats.map((stat, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white/70">{stat.label}</span>
                <span className="text-white font-medium">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-white text-sm flex items-center gap-1 font-medium">
          보기 <span>→</span>
        </div>
      </motion.div>
    </Link>
  );
}
```

---

## 📋 구현 계획

### Phase 13-1: 학교급 선택 개선 (예상 소요: 4-6시간)

#### Task 13-1-1: 사용자 프로필 시스템
- [ ] `/lib/user/user-profile.ts` 생성
  - UserProfile 타입 정의
  - LocalStorage CRUD 함수
  - 프로필 유효성 검사
- [ ] `/types/user.ts` 생성
  - GradeLevel 타입
  - Subject 타입
  - UserProfile 인터페이스

#### Task 13-1-2: 온보딩 플로우 컴포넌트
- [ ] `/components/onboarding/WelcomeStep.tsx`
  - 환영 화면
  - "시작하기" CTA
- [ ] `/components/onboarding/ExperienceStep.tsx`
  - 체험 모드 선택
  - "건너뛰고 계정 만들기" 옵션
- [ ] `/components/onboarding/GradeLevelStep.tsx`
  - 학교급 선택 (4개 옵션)
  - 큰 클릭 가능한 카드
- [ ] `/components/onboarding/SubjectStep.tsx`
  - 과목 선택 (복수 선택)
  - 체크박스 UI
- [ ] `/components/onboarding/NicknameStep.tsx`
  - 닉네임 입력
  - 유효성 검사 (2-20자, 특수문자 제한)
- [ ] `/components/onboarding/AuthStep.tsx`
  - 소셜 로그인 옵션
  - 게스트 모드 계속하기

#### Task 13-1-3: 온보딩 페이지
- [ ] `/app/onboarding/page.tsx` 리팩토링
  - 6단계 스텝 진행바
  - 각 스텝 컴포넌트 통합
  - "뒤로" 버튼 (Step 1 제외)
  - 진행률 LocalStorage 저장

#### Task 13-1-4: 프로필 편집 기능
- [ ] `/app/profile/page.tsx` 개선
  - 닉네임 편집
  - 학교급 변경
  - 선호 과목 변경
  - 학습 목표 추가
  - 아바타 업로드 (선택)
- [ ] `/components/profile/EditableField.tsx`
  - 인라인 편집 컴포넌트
  - "편집" 버튼 → 입력 필드로 전환

#### Task 13-1-5: 통합 테스트
- [ ] 온보딩 플로우 E2E 테스트
- [ ] 프로필 편집 테스트
- [ ] LocalStorage 동기화 테스트

---

### Phase 13-2: 대시보드 개선 (예상 소요: 6-8시간)

#### Task 13-2-1: 대시보드 컴포넌트
- [ ] `/components/dashboard/DashboardSection.tsx`
  - 섹션 제목 + 구분선
  - 아이콘 지원
- [ ] `/components/dashboard/ActionCard.tsx`
  - 큰 학습 시작 카드
  - 통계 표시
  - 뱃지 표시
  - 호버 애니메이션
- [ ] `/components/dashboard/AnalyticsCard.tsx`
  - 작은 분석 카드
  - 링크 기능
  - 미니 통계

#### Task 13-2-2: 대시보드 레이아웃
- [ ] `/app/dashboard/page.tsx` 완전 재설계
  - 3개 섹션 구조
    1. 학습 시작하기 (영어, 수학)
    2. 학습 현황 & 분석 (리포트, 복습, 감정)
    3. 빠른 액세스 (추천 항목)
  - 반응형 그리드 (Tailwind Grid)
  - 개인화 인사 (닉네임 사용)

#### Task 13-2-3: 추천 시스템
- [ ] `/lib/recommendations/learning-recommendations.ts`
  - 최근 미접속 과목 감지
  - 복습 필요 항목 추출
  - 감정 기반 추천 (Phase 12 통합)
- [ ] `/components/dashboard/QuickAccess.tsx`
  - 추천 항목 리스트
  - 클릭 시 바로 이동

#### Task 13-2-4: 통계 위젯
- [ ] `/lib/analytics/dashboard-stats.ts`
  - 총 학습 시간 계산
  - 이번 주 학습 시간
  - 평균 점수
  - 복습 대기 항목 수
- [ ] 각 카드에 통계 표시

#### Task 13-2-5: 반응형 테스트
- [ ] 데스크톱 레이아웃 (>1024px)
- [ ] 태블릿 레이아웃 (768-1024px)
- [ ] 모바일 레이아웃 (<768px)
- [ ] 다크 모드 (선택 사항)

---

## 🎨 디자인 사양

### 색상 팔레트

**학습 활동 (Primary Actions)**:
- 영어 튜터: `from-blue-600 via-indigo-600 to-purple-600`
- 수학 튜터: `from-purple-600 via-pink-600 to-rose-600`

**분석 결과 (Secondary Actions)**:
- 학습 리포트: `from-green-500 to-emerald-600`
- 복습 관리: `from-orange-500 to-amber-600`
- 감정 분석: `from-purple-500 to-pink-500`

**배경**:
- 메인 배경: `bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50`
- 섹션 배경: `bg-white`
- 카드 호버: `shadow-xl` + `scale-1.02`

### 타이포그래피

**섹션 제목**:
```css
font-size: 1.5rem; /* text-2xl */
font-weight: 700; /* font-bold */
color: #111827; /* text-gray-900 */
```

**카드 제목 (Action)**:
```css
font-size: 1.875rem; /* text-3xl */
font-weight: 700; /* font-bold */
color: #ffffff; /* text-white */
```

**카드 제목 (Analytics)**:
```css
font-size: 1.25rem; /* text-xl */
font-weight: 700; /* font-bold */
color: #ffffff; /* text-white */
```

**CTA 버튼**:
```css
font-size: 1.125rem; /* text-lg */
font-weight: 700; /* font-bold */
padding: 1rem 2rem; /* py-4 px-8 */
border-radius: 0.75rem; /* rounded-xl */
```

### 간격 및 크기

**ActionCard** (학습 시작):
- Width: `100%`
- Height: `320px` (h-80)
- Padding: `2rem` (p-8)
- Border Radius: `1.5rem` (rounded-3xl)

**AnalyticsCard** (결과 조회):
- Width: `100%`
- Height: `224px` (h-56)
- Padding: `1.5rem` (p-6)
- Border Radius: `1rem` (rounded-2xl)

**섹션 간격**:
- Margin Bottom: `2rem` (mb-8)
- Section Divider: `2px` border

---

## 🔄 기존 코드와의 통합

### 1. 학교급 선택 통합

**기존 코드**:
- [app/onboarding/page.tsx](app/onboarding/page.tsx) - 기존 온보딩 페이지
- [components/providers/NavigationProvider.tsx](components/providers/NavigationProvider.tsx) - 네비게이션 상태 관리

**변경 사항**:
- `onboarding/page.tsx` 완전 재작성
- NavigationProvider에 `userProfile` 상태 추가
- 모든 튜터 페이지에서 `userProfile.gradeLevel` 사용

### 2. 대시보드 통합

**기존 코드**:
- [app/dashboard/page.tsx:402-431](app/dashboard/page.tsx#L402-L431) - 현재 5-카드 레이아웃

**변경 사항**:
- 완전 재설계 (3-섹션 레이아웃)
- 기존 링크 유지:
  - `/tutor/english`
  - `/tutor/math`
  - `/report`
  - `/review`
  - `/emotion-report`
- Phase 12 감정 분석 기능 통합

### 3. Phase 12 통합

**감정 기반 추천**:
```typescript
// /lib/recommendations/learning-recommendations.ts

import { analyzeEmotionPatterns } from '@/lib/emotion/emotion-storage';

export function getEmotionBasedRecommendations(userId: string) {
  const patterns = analyzeEmotionPatterns(userId, 7); // 최근 7일

  const recommendations: string[] = [];

  // 부정적 패턴 감지
  if (patterns.concerningPatterns.length > 0) {
    patterns.concerningPatterns.forEach((pattern) => {
      if (pattern.includes('frustrated') || pattern.includes('anxious')) {
        recommendations.push('🧘 휴식을 권장합니다. 잠시 쉬어가세요!');
      }
      if (pattern.includes('confused')) {
        recommendations.push('📚 개념 복습을 추천합니다.');
      }
    });
  }

  // 긍정적 패턴 유지
  if (patterns.positivePatterns.length > 0) {
    recommendations.push('✨ 좋은 학습 패턴을 유지하고 있습니다!');
  }

  return recommendations;
}
```

---

## 📊 성공 지표

### 온보딩 개선 (Phase 13-1)
- ✅ 온보딩 완료율 목표: >80%
- ✅ 평균 온보딩 시간: <2분
- ✅ 프로필 편집 사용률: >30% (첫 주)
- ✅ 게스트 → 로그인 전환율: >40%

### 대시보드 개선 (Phase 13-2)
- ✅ 영어/수학 튜터 클릭률: >60% (방문당)
- ✅ 분석 페이지 조회율: >30%
- ✅ 빠른 액세스 사용률: >20%
- ✅ 대시보드 체류 시간: 30초 → 60초

### UX 품질
- ✅ 모바일 반응형: 100% 작동
- ✅ 접근성 (a11y): WCAG 2.1 AA 준수
- ✅ 로딩 속도: <1초 (LCP)
- ✅ 사용자 만족도: >4.5/5.0

---

## 🚀 다음 단계

### 즉시 실행 (Phase 13)
1. **Phase 13-1 구현**: 온보딩 및 프로필 시스템
2. **Phase 13-2 구현**: 대시보드 재설계
3. **통합 테스트**: E2E 사용자 시나리오

### 추가 고려사항 (Phase 14+)
1. **인증 시스템**: NextAuth.js + Google/GitHub OAuth
2. **데이터베이스**: Supabase 또는 PlanetScale 통합
3. **실시간 동기화**: 여러 기기 간 프로필 동기화
4. **A/B 테스트**: 온보딩 플로우 최적화
5. **분석 대시보드**: 사용자 행동 추적 (PostHog, Mixpanel)

---

## 📚 참고 자료

### 벤치마크 서비스
- [Khan Academy Khanmigo](https://www.khanmigo.ai/) - 소크라테스식 AI 튜터
- [Duolingo Max](https://www.duolingo.com/) - 게이미피케이션 + GPT-4
- [Century Tech](https://www.century.tech/) - 적응형 학습

### 디자인 리소스
- [EdTech UX Best Practices](https://userpilot.com/blog/customer-onboarding-in-edtech/)
- [Dashboard Design Principles](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [Card UI Examples](https://www.eleken.co/blog-posts/card-ui-examples-and-best-practices-for-product-owners)

### 기술 문서
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션
- [Tailwind CSS](https://tailwindcss.com/) - 스타일링
- [Next.js 15](https://nextjs.org/) - 프레임워크

---

**문서 작성일**: 2025년 1월 (Phase 12 완료 후)
**작성자**: Claude (SuperClaude Framework)
**버전**: 1.0
**상태**: 구현 준비 완료
