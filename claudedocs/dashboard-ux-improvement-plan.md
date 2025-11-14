# AI Park 전체 UI/UX 고도화 계획서

**작성일**: 2025-01-14
**목적**: 사용자 경험 개선 및 글로벌 에듀테크 서비스 수준의 UX 구현
**벤치마킹**: Khan Academy, Duolingo, Coursera, Udemy 등 글로벌 에듀테크 플랫폼

---

## 📋 목차

1. [현황 분석](#1-현황-분석)
2. [글로벌 벤치마킹 인사이트](#2-글로벌-벤치마킹-인사이트)
3. [주요 문제점 및 개선 방향](#3-주요-문제점-및-개선-방향)
4. [Information Architecture 재설계](#4-information-architecture-재설계)
5. [GNB 개선 계획](#5-gnb-개선-계획)
6. [Total Dashboard 재구성](#6-total-dashboard-재구성)
7. [과목별 서브 Dashboard 개선](#7-과목별-서브-dashboard-개선)
8. [단계별 구현 로드맵](#8-단계별-구현-로드맵)
9. [성공 지표 (KPI)](#9-성공-지표-kpi)

---

## 1. 현황 분석

### 1.1 현재 구조

```
AI Park
├── Home (/)
├── Total Dashboard (/dashboard)
│   ├── 전체 학습 통계
│   ├── 게이미피케이션 요소 (레벨, 스트릭, 배지)
│   ├── 학습 목표 (Goals)
│   ├── 주간 통계
│   ├── 과목별 학습 카드
│   └── 목표 타임라인
├── English Tutor (/tutor/english)
├── Math Tutor (/tutor/math)
├── Science Tutor (/tutor/science)
├── Social Tutor (/tutor/social)
└── Korean Tutor (/tutor/korean)
```

### 1.2 문제점

#### 🔴 Critical Issues

1. **잘못된 Navigation Flow**
   - GNB에서 "English" 클릭 → 바로 `/tutor/english`로 이동
   - 서브 대시보드 (`/dashboard/english`) 건너뜀
   - 사용자가 학습 현황을 확인할 기회 없음

2. **정보 중복 과다**
   - Total Dashboard와 과목별 대시보드에서 동일한 정보 반복
   - 예시: 학습 시간, 완료 세션 수, 진행률 등
   - 사용자 인지 부하 증가

3. **Information Architecture 혼란**
   - Total Dashboard의 역할이 불명확
   - 과목별 대시보드와 튜터의 관계가 모호함
   - 깊이 있는 분석과 개요 정보가 혼재

#### 🟡 Important Issues

4. **일관성 없는 UX 패턴**
   - Korean만 `/tutor/korean`으로 직접 링크 (대시보드 없음)
   - 다른 과목들은 대시보드 존재하지만 접근 불가

5. **모바일 최적화 부족**
   - 복잡한 대시보드가 작은 화면에서 압도적
   - 터치 타겟 크기 불충분

---

## 2. 글로벌 벤치마킹 인사이트

### 2.1 Khan Academy 패턴

**Two-Tier Navigation**
```
[Dashboard] → [Subject Dashboard] → [Content/Lesson]
     ↓              ↓                      ↓
  전체 개요    과목별 상세 진행률      실제 학습 콘텐츠
```

**핵심 원칙**:
- Dashboard: 전체적인 학습 여정 개요 (Overview)
- Subject Dashboard: 특정 과목의 상세 분석 및 추천
- Lesson/Tutor: 실제 학습 활동

### 2.2 Duolingo 패턴

**Gamification-First Navigation**
```
[Home Path] → [Lesson]
     ↓
  - Daily Goal Progress
  - Streak Counter
  - XP Overview
  - Next Recommended Lesson
```

**핵심 원칙**:
- 최소한의 클릭으로 학습 시작 (Friction-less)
- 명확한 다음 행동 유도 (Clear CTA)
- 진행 상태 시각화 우선

### 2.3 Coursera 패턴

**Clean & Professional Layout**
```
[My Learning] → [Course Dashboard] → [Week/Module] → [Lesson]
```

**핵심 원칙**:
- 명확한 계층 구조
- 각 레벨에서 제공하는 정보의 차별화
- Breadcrumb Navigation으로 현재 위치 인식

### 2.4 2025 UX 트렌드 종합

1. **Minimalist Design** (78% Millennials 선호)
   - 불필요한 요소 제거
   - 핵심 정보만 표시
   - 여백 활용

2. **Personalization**
   - 사용자별 맞춤 대시보드
   - AI 기반 추천 학습 경로
   - 학습 패턴 분석

3. **Mobile-First**
   - 작은 화면에서도 명확한 정보 전달
   - 터치 친화적 인터페이스
   - 44px 이상의 터치 타겟

4. **Progress Visualization**
   - 시각적 진행 표시기
   - Micro-interactions
   - Immediate Feedback

5. **Reduced Cognitive Load**
   - 일관된 UI 패턴
   - 명확한 Visual Hierarchy
   - 최소 클릭 수 (Good navigation = Least clicks)

---

## 3. 주요 문제점 및 개선 방향

### 3.1 Navigation Flow 개선

#### 현재 (문제)
```
GNB [English] → /tutor/english (튜터 바로 실행)
                 ❌ 대시보드 건너뜀
```

#### 개선안
```
GNB [English] → /dashboard/english → [학습 시작] 버튼 → /tutor/english
                      ↓
                 과목별 상세 진행률
                 추천 학습 주제
                 최근 학습 이력
                 성과 분석
```

**근거**: Khan Academy, Coursera 모두 과목 선택 → 과목 대시보드 → 학습 시작 패턴 사용

### 3.2 Information Architecture 재설계

#### 핵심 원칙

**Total Dashboard의 역할** (Global Overview)
- 전체 학습 여정의 Bird's Eye View
- 교차 과목 성과 비교
- 통합 게이미피케이션 요소
- **과목별 세부 정보는 제외**

**Subject Dashboard의 역할** (Subject-Specific Deep Dive)
- 해당 과목의 상세 분석
- 과목별 학습 경로 및 추천
- 과목 특화 성과 지표
- 튜터 시작 진입점

### 3.3 정보 중복 제거 원칙

| 정보 유형 | Total Dashboard | Subject Dashboard | 튜터 |
|---------|----------------|-------------------|------|
| 전체 학습 시간 | ✅ 통합 | ❌ | ❌ |
| 과목별 학습 시간 | ✅ 요약 (Bar Chart) | ✅ 상세 | ❌ |
| 레벨/XP | ✅ 통합 | ❌ | ❌ |
| 스트릭 | ✅ 전체 | ❌ | ❌ |
| 과목별 진행률 | ✅ 요약 (%) | ✅ 상세 (Topic별) | ❌ |
| 학습 목표 | ✅ 전체 목표 | ✅ 과목별 목표 | ❌ |
| 최근 학습 이력 | ✅ 최근 3개 | ✅ 전체 이력 | ❌ |
| 추천 학습 | ❌ | ✅ | ❌ |
| 약점 분석 | ❌ | ✅ | ✅ (실시간) |

---

## 4. Information Architecture 재설계

### 4.1 새로운 사이트맵

```
AI Park
│
├── 🏠 Home (/)
│   └── Quick Start (각 과목 바로가기)
│
├── 📊 Total Dashboard (/dashboard)
│   ├── 전체 학습 여정 개요
│   ├── 게이미피케이션 (레벨, XP, 스트릭, 배지)
│   ├── 학습 목표 진행 상황
│   ├── 과목별 성과 비교 (차트)
│   └── 최근 활동 요약 (3-5개)
│
├── 📚 English Dashboard (/dashboard/english)
│   ├── 영어 학습 상세 진행률
│   ├── CEFR 레벨 분석
│   ├── 4대 영역 (Listening, Speaking, Reading, Writing) 상세
│   ├── 추천 학습 주제
│   ├── 완료/진행 중/추천 토픽
│   ├── 최근 학습 이력 (전체)
│   └── [학습 시작] CTA → /tutor/english
│
├── 🔢 Math Dashboard (/dashboard/math)
│   ├── 수학 학습 상세 진행률
│   ├── 토픽별 마스터리 (대수, 기하, 미적분 등)
│   ├── 문제 풀이 정확도 분석
│   ├── 추천 학습 주제
│   ├── 완료/진행 중/추천 토픽
│   ├── 최근 학습 이력 (전체)
│   └── [학습 시작] CTA → /tutor/math
│
├── 🧪 Science Dashboard (/dashboard/science)
│   └── (Math와 유사한 구조)
│
├── 🏛️ Social Dashboard (/dashboard/social)
│   └── (Math와 유사한 구조)
│
├── 📖 Korean Dashboard (/dashboard/korean) [신규 생성]
│   └── (Math와 유사한 구조)
│
└── 🎓 Tutors (학습 실행)
    ├── /tutor/english
    ├── /tutor/math
    ├── /tutor/science
    ├── /tutor/social
    └── /tutor/korean
```

### 4.2 User Journey 시나리오

#### 시나리오 1: 새로운 학습 시작

```
사용자 로그인
   ↓
Total Dashboard 진입
   ↓
"English 학습을 시작하고 싶다"
   ↓
GNB에서 [English] 클릭
   ↓
English Dashboard 진입
   ↓
- 현재 CEFR 레벨: B1
- 추천 토픽: "Phrasal Verbs"
- 최근 학습: 3일 전
   ↓
[Continue Learning] 또는 [Start New Topic] 버튼 클릭
   ↓
English Tutor 시작
```

#### 시나리오 2: 진행 상황 확인

```
사용자 로그인
   ↓
Total Dashboard 진입
   ↓
전체 학습 현황 한눈에 파악:
- 총 학습 시간: 12시간 30분
- 레벨: 5 (XP 1,250/1,500)
- 스트릭: 7일
- 과목별 비교: English 40%, Math 30%, Science 20%, Social 10%
   ↓
"영어 상세 진행률이 궁금하다"
   ↓
English Dashboard 카드 클릭 또는 GNB [English] 클릭
   ↓
English Dashboard에서 상세 분석 확인
```

---

## 5. GNB 개선 계획

### 5.1 현재 GNB 구조 (문제)

```tsx
<a href="/dashboard/english">English</a>  // ❌ 잘못된 링크
<a href="/dashboard/math">Math</a>        // ❌ 잘못된 링크
...
<a href="/tutor/korean">Korean</a>       // ❌ 일관성 없음
```

### 5.2 개선된 GNB 구조

```tsx
// 모든 과목 → 과목 대시보드로 통일
<a href="/dashboard/english">English</a>  // ✅ 올바른 링크
<a href="/dashboard/math">Math</a>        // ✅ 올바른 링크
<a href="/dashboard/science">Science</a>  // ✅ 올바른 링크
<a href="/dashboard/social">Social</a>    // ✅ 올바른 링크
<a href="/dashboard/korean">Korean</a>    // ✅ 새로 생성
<a href="/dashboard">Total Dashboard</a>  // ✅ 통합 대시보드
```

### 5.3 Active State 표시 개선

**현재 위치 명확화**:
```tsx
// English Dashboard에 있을 때
GNB: [English] (활성 상태 표시)
Breadcrumb: Home > English Dashboard

// English Tutor에 있을 때
GNB: [English] (활성 상태 표시)
Breadcrumb: Home > English Dashboard > Learning Session
```

### 5.4 모바일 GNB

**모바일 메뉴 구조**:
```
☰ Menu
├── 🏠 Home
├── 📊 My Dashboard
├── 📚 Subjects
│   ├── 📖 English
│   ├── 🔢 Math
│   ├── 🧪 Science
│   ├── 🏛️ Social
│   └── 📚 Korean
├── 🎯 My Goals
├── 🏆 Achievements
└── ⚙️ Settings
```

---

## 6. Total Dashboard 재구성

### 6.1 개선 전략

**핵심 원칙**: "통합 개요 + 과목 비교 + 게이미피케이션"

### 6.2 제거할 요소 (중복 제거)

❌ **과목별 상세 진행률** → Subject Dashboard로 이동
❌ **과목별 토픽 목록** → Subject Dashboard로 이동
❌ **과목별 약점 분석** → Subject Dashboard로 이동
❌ **과목별 최근 이력 전체** → Subject Dashboard로 이동

### 6.3 유지/강화할 요소

✅ **전체 학습 통계**
- 총 학습 시간
- 총 완료 세션 수
- 전체 레벨 및 XP

✅ **게이미피케이션 요소**
- 레벨 진행바
- 스트릭 (연속 학습 일수)
- 획득 배지 갤러리
- 주간/월간 목표 달성률

✅ **과목별 비교 (요약만)**
- Bar Chart: 과목별 학습 시간 비교
- Progress Ring: 각 과목 진행률 (%)
- Quick Stats: 각 과목의 핵심 지표 1-2개만

✅ **통합 학습 목표**
- 전체 목표 (예: "이번 주 10시간 학습")
- 목표 달성 타임라인

✅ **최근 활동 요약** (3-5개만)
- 최근 학습 세션 3개
- "더 보기" 버튼 → 각 Subject Dashboard로 이동

### 6.4 새로운 Total Dashboard 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  📊 Total Dashboard                            👤 Profile │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  🎯 Learning Journey Overview                            │
│  ┌─────────────┬─────────────┬─────────────┐           │
│  │ 총 학습시간   │ 완료 세션    │ 현재 레벨    │           │
│  │ 24h 30m     │ 48 sessions │ Level 5     │           │
│  └─────────────┴─────────────┴─────────────┘           │
│                                                           │
│  🔥 Streak & Motivation                                  │
│  ┌─────────────────────────────────────────┐           │
│  │ 🔥 7 Days Streak                         │           │
│  │ [████████░░] 80% Weekly Goal             │           │
│  └─────────────────────────────────────────┘           │
│                                                           │
│  📚 Subject Performance Comparison                       │
│  ┌─────────────────────────────────────────┐           │
│  │ English  [██████████░░] 75%              │           │
│  │ Math     [████████░░░░] 60%              │           │
│  │ Science  [██████░░░░░░] 50%              │           │
│  │ Social   [████░░░░░░░░] 30%              │           │
│  └─────────────────────────────────────────┘           │
│                                                           │
│  🎯 Active Goals (3)                                     │
│  ┌─────────────────────────────────────────┐           │
│  │ [✓] Study 5 days this week (7/5)        │           │
│  │ [□] Complete 10 English sessions (7/10)  │           │
│  │ [□] Master 3 Math topics (2/3)           │           │
│  └─────────────────────────────────────────┘           │
│                                                           │
│  📝 Recent Activity (Last 3)                             │
│  ┌─────────────────────────────────────────┐           │
│  │ 📖 English - Phrasal Verbs (2h ago)     │ [상세 →] │
│  │ 🔢 Math - Quadratic Equations (1d ago)  │ [상세 →] │
│  │ 🧪 Science - Chemical Bonds (2d ago)    │ [상세 →] │
│  └─────────────────────────────────────────┘           │
│                                                           │
│  🚀 Quick Start                                          │
│  ┌────────┬────────┬────────┬────────┐                 │
│  │English │  Math  │Science │ Social │                 │
│  │  [→]   │  [→]   │  [→]   │  [→]   │                 │
│  └────────┴────────┴────────┴────────┘                 │
│                                                           │
│  🏆 Achievements Gallery                                 │
│  [배지1][배지2][배지3][배지4][배지5] [View All →]         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 6.5 Total Dashboard 컴포넌트 구조

```tsx
// app/dashboard/page.tsx

export default function TotalDashboard() {
  return (
    <div className="total-dashboard">
      {/* Hero Stats */}
      <OverallStatsCard />

      {/* Gamification */}
      <StreakAndMotivation />

      {/* Subject Comparison (Summary Only) */}
      <SubjectComparisonChart />

      {/* Goals */}
      <ActiveGoalsWidget />

      {/* Recent Activity (Max 3-5) */}
      <RecentActivitySummary maxItems={3} />

      {/* Quick Access */}
      <QuickStartGrid />

      {/* Achievements */}
      <AchievementsGallery />
    </div>
  );
}
```

---

## 7. 과목별 서브 Dashboard 개선

### 7.1 공통 레이아웃 템플릿

모든 과목 대시보드는 일관된 구조를 가져야 함:

```
┌─────────────────────────────────────────────────────────┐
│  📚 [Subject] Dashboard                        [Beta]   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📊 Progress Overview                                    │
│  - 현재 레벨/진행률                                       │
│  - 학습 시간 (이번 주/전체)                               │
│  - 완료 토픽 수                                          │
│                                                           │
│  🎯 Recommended Next Steps                               │
│  - AI 추천 학습 주제                                      │
│  - 약점 보완 토픽                                         │
│  - 계속하기 (마지막 학습)                                 │
│                                                           │
│  📈 Detailed Analytics                                   │
│  - 과목별 특화 분석 (예: 영어 4대 영역, 수학 토픽별)      │
│  - 정확도/마스터리 차트                                   │
│                                                           │
│  📝 Learning History                                     │
│  - 전체 학습 이력 (페이지네이션)                          │
│  - 필터: 날짜, 토픽, 성과                                 │
│                                                           │
│  🎯 Subject-Specific Goals                               │
│  - 과목별 목표 관리                                       │
│                                                           │
│  🚀 [Start Learning] CTA Button                          │
│  → /tutor/[subject]                                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 7.2 English Dashboard 상세 설계

```tsx
// app/dashboard/english/page.tsx

export default function EnglishDashboard() {
  return (
    <div className="subject-dashboard english">
      {/* Header */}
      <DashboardHeader
        subject="English"
        icon={<BookOpen />}
        badge={<BetaBadge />}
      />

      {/* Progress Overview */}
      <EnglishProgressCard>
        - CEFR Level Badge (A1, A2, B1, B2, C1, C2)
        - 총 학습 시간
        - 완료 토픽 / 전체 토픽
      </EnglishProgressCard>

      {/* Recommended Next Steps */}
      <RecommendedTopics>
        - "Continue: Phrasal Verbs" (마지막 학습)
        - "Recommended: Conditional Sentences" (AI 추천)
        - "Practice: Speaking Fluency" (약점 보완)
      </RecommendedTopics>

      {/* 4 Skills Breakdown */}
      <FourSkillsAnalysis>
        - Listening: 75% (상세 차트)
        - Speaking: 60% (상세 차트)
        - Reading: 80% (상세 차트)
        - Writing: 55% (상세 차트)
      </FourSkillsAnalysis>

      {/* Topic Progress Grid */}
      <TopicProgressGrid>
        - Completed Topics (체크 표시)
        - In Progress Topics (진행바)
        - Recommended Topics (별 표시)
      </TopicProgressGrid>

      {/* Learning History */}
      <LearningHistoryTable
        subject="english"
        pagination={true}
      />

      {/* Goals */}
      <SubjectGoalsWidget subject="english" />

      {/* CTA */}
      <CTAButton
        text="Start English Learning"
        href="/tutor/english"
        size="large"
        primary
      />
    </div>
  );
}
```

### 7.3 Korean Dashboard 신규 생성

**현재 문제**: Korean은 대시보드가 없고 `/tutor/korean`으로 바로 이동

**해결책**: `/dashboard/korean` 생성

```tsx
// app/dashboard/korean/page.tsx (신규)

export default function KoreanDashboard() {
  // English Dashboard와 유사한 구조
  // 한국어 특화 분석:
  // - 문법, 어휘, 독해, 작문
  // - 급수별 진행률 (초급, 중급, 고급)
}
```

---

## 8. 단계별 구현 로드맵

### Phase 1: 긴급 수정 (1-2일)

**우선순위: 🔴 Critical**

1. **GNB 링크 수정**
   - 파일: `components/Header.tsx` 또는 `app/layout.tsx`
   - 수정: 모든 과목 링크를 `/dashboard/[subject]`로 변경
   - 예상 시간: 30분

2. **Korean Dashboard 생성**
   - 파일: `app/dashboard/korean/page.tsx` (신규)
   - 내용: 기존 과목 대시보드 템플릿 복사 후 수정
   - 예상 시간: 2시간

3. **각 Subject Dashboard에 [Start Learning] CTA 버튼 추가**
   - 위치: 대시보드 상단 및 하단
   - 링크: `/tutor/[subject]`
   - 예상 시간: 1시간

**예상 완료**: 1일

### Phase 2: Total Dashboard 재구성 (3-5일)

**우선순위: 🟡 Important**

1. **정보 중복 제거**
   - 과목별 상세 정보 제거
   - 통합 요약 정보만 유지
   - 예상 시간: 4시간

2. **Subject Comparison Chart 추가**
   - 과목별 학습 시간 비교 (Bar Chart)
   - 과목별 진행률 비교 (Progress Rings)
   - 예상 시간: 6시간

3. **Recent Activity 요약 (최대 3-5개)**
   - "View More" 버튼 → Subject Dashboard로 이동
   - 예상 시간: 3시간

4. **Quick Start Grid 추가**
   - 각 과목으로 빠르게 이동할 수 있는 버튼 그리드
   - 예상 시간: 2시간

**예상 완료**: 3일

### Phase 3: Subject Dashboard 고도화 (5-7일)

**우선순위: 🟢 Enhancement**

1. **공통 템플릿 컴포넌트 개발**
   - `<SubjectDashboardLayout />`
   - `<ProgressOverviewCard />`
   - `<RecommendedTopics />`
   - 예상 시간: 1일

2. **과목별 특화 분석 컴포넌트**
   - English: 4 Skills Analysis
   - Math: Topic Mastery Grid
   - Science: Concept Map
   - Social: Timeline Progress
   - Korean: Grammar & Vocabulary
   - 예상 시간: 2일

3. **Learning History 개선**
   - 필터링 기능 (날짜, 토픽, 성과)
   - 페이지네이션
   - 상세 보기 모달
   - 예상 시간: 1일

4. **AI 추천 시스템 통합**
   - "Recommended Next Steps" 섹션
   - 약점 분석 기반 추천
   - 예상 시간: 1일

**예상 완료**: 5일

### Phase 4: 모바일 최적화 (3-4일)

**우선순위: 🟢 Enhancement**

1. **Responsive Layout 개선**
   - Breakpoints: 320px, 640px, 1024px, 1280px
   - Mobile GNB (햄버거 메뉴)
   - 예상 시간: 1일

2. **터치 최적화**
   - 모든 버튼 최소 44px × 44px
   - Swipe gestures 지원
   - 예상 시간: 1일

3. **모바일 대시보드 레이아웃**
   - 세로 스크롤 최적화
   - 카드 형태로 정보 분할
   - 예상 시간: 1일

**예상 완료**: 3일

### Phase 5: UX 개선 및 폴리싱 (2-3일)

**우선순위: 🟢 Enhancement**

1. **Breadcrumb Navigation 추가**
   - 현재 위치 표시
   - 예상 시간: 4시간

2. **Loading States & Skeleton UI**
   - 모든 비동기 로딩에 Skeleton
   - 예상 시간: 4시간

3. **Empty States 개선**
   - 학습 데이터가 없을 때 친화적인 안내
   - 예상 시간: 4시간

4. **Micro-interactions**
   - Hover effects
   - Click animations
   - Progress animations
   - 예상 시간: 1일

**예상 완료**: 2일

### 전체 타임라인

```
Week 1: Phase 1 (긴급 수정) + Phase 2 시작
Week 2: Phase 2 완료 + Phase 3 시작
Week 3: Phase 3 완료 + Phase 4
Week 4: Phase 5 + 테스트 & 버그 수정
```

**총 예상 기간**: 3-4주

---

## 9. 성공 지표 (KPI)

### 9.1 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|-----|------|------|----------|
| **Click-to-Learn** | 3 클릭 (홈 → GNB → 튜터) | 2 클릭 (홈 → Subject Dashboard → 튜터) | Analytics |
| **Dashboard 진입률** | 알 수 없음 (우회) | >80% | `dashboard/[subject]` 페이지뷰 |
| **정보 중복도** | ~60% | <20% | 컴포넌트 분석 |
| **모바일 Bounce Rate** | 추정 >40% | <25% | Analytics |
| **평균 세션 시간** | 미측정 | +30% 증가 | Analytics |

### 9.2 정성적 지표

- **사용자 피드백**: "대시보드가 명확하고 유용하다"
- **Navigation 만족도**: 5점 만점에 4.5점 이상
- **Information Overload 감소**: "정보가 너무 많다" 피드백 50% 감소

### 9.3 A/B 테스트 계획

**Test 1: Total Dashboard Layout**
- A: 현재 (정보 많음)
- B: 개선안 (요약 중심)
- 지표: 체류 시간, Subject Dashboard 전환율

**Test 2: CTA 버튼 위치**
- A: 상단만
- B: 상단 + 하단
- 지표: 튜터 진입률

**Test 3: Subject Comparison Chart 형태**
- A: Bar Chart
- B: Radial Chart
- 지표: 사용자 이해도 (설문)

---

## 10. 기술 스택 및 구현 가이드

### 10.1 사용할 라이브러리

```json
{
  "charting": "recharts (이미 사용 중)",
  "animations": "framer-motion (이미 사용 중)",
  "icons": "lucide-react (이미 사용 중)",
  "state": "zustand (이미 사용 중)",
  "routing": "next/navigation (이미 사용 중)"
}
```

### 10.2 파일 구조

```
app/
├── dashboard/
│   ├── page.tsx                    # Total Dashboard (수정)
│   ├── english/
│   │   └── page.tsx               # English Dashboard (수정)
│   ├── math/
│   │   └── page.tsx               # Math Dashboard (수정)
│   ├── science/
│   │   └── page.tsx               # Science Dashboard (수정)
│   ├── social/
│   │   └── page.tsx               # Social Dashboard (수정)
│   └── korean/
│       └── page.tsx               # Korean Dashboard (신규)
│
components/
├── dashboard/
│   ├── total/
│   │   ├── OverallStatsCard.tsx   # 신규
│   │   ├── SubjectComparisonChart.tsx # 신규
│   │   ├── QuickStartGrid.tsx     # 신규
│   │   └── RecentActivitySummary.tsx # 신규
│   ├── subject/
│   │   ├── SubjectDashboardLayout.tsx # 신규 (템플릿)
│   │   ├── ProgressOverviewCard.tsx # 신규
│   │   ├── RecommendedTopics.tsx  # 신규
│   │   ├── LearningHistoryTable.tsx # 신규
│   │   └── StartLearningCTA.tsx   # 신규
│   └── ...
│
```

### 10.3 코드 예시

#### GNB 수정

```tsx
// components/Header.tsx (또는 해당 파일)

// ❌ Before
<Link href="/tutor/english">English</Link>

// ✅ After
<Link href="/dashboard/english">English</Link>
```

#### Subject Dashboard Template

```tsx
// components/dashboard/subject/SubjectDashboardLayout.tsx

import { ReactNode } from 'react';
import { StartLearningCTA } from './StartLearningCTA';

interface Props {
  subject: string;
  icon: ReactNode;
  children: ReactNode;
}

export function SubjectDashboardLayout({ subject, icon, children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {icon}
            {subject} Dashboard
          </h1>
          <BetaBadge subject={subject} />
        </div>

        {/* Main Content */}
        {children}

        {/* CTA */}
        <StartLearningCTA subject={subject} />
      </div>
    </div>
  );
}
```

#### Start Learning CTA

```tsx
// components/dashboard/subject/StartLearningCTA.tsx

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  subject: string;
}

export function StartLearningCTA({ subject }: Props) {
  return (
    <div className="mt-12 text-center">
      <Link
        href={`/tutor/${subject}`}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95"
      >
        Start {subject.charAt(0).toUpperCase() + subject.slice(1)} Learning
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
```

---

## 11. 참고 자료

### 11.1 벤치마킹 리소스

- [Khan Academy Dashboard UX](https://www.khanacademy.org/)
- [Duolingo Gamification Patterns](https://www.duolingo.com/)
- [Coursera Learning Dashboard](https://www.coursera.org/)
- [Dashboard Design Principles 2025](https://www.uxpin.com/studio/blog/dashboard-design-principles/)

### 11.2 디자인 가이드라인

- Material Design 3 (Google)
- Human Interface Guidelines (Apple)
- Accessible Color Contrast (WCAG 2.1 AA)
- Touch Target Size: 44×44px minimum

### 11.3 성능 기준

- First Contentful Paint (FCP): < 1.8s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

---

## 12. 의사결정 매트릭스

### 12.1 우선순위 결정 기준

| 기능 | 사용자 영향 | 구현 난이도 | ROI | 우선순위 |
|-----|-----------|-----------|-----|---------|
| GNB 링크 수정 | 🔴 High | 🟢 Low | 🟢 High | P0 |
| Korean Dashboard 생성 | 🟡 Medium | 🟢 Low | 🟡 Medium | P1 |
| Total Dashboard 재구성 | 🔴 High | 🟡 Medium | 🟢 High | P1 |
| Subject Dashboard CTA | 🟡 Medium | 🟢 Low | 🟢 High | P1 |
| 모바일 최적화 | 🟡 Medium | 🟡 Medium | 🟡 Medium | P2 |
| AI 추천 시스템 | 🟢 Low | 🔴 High | 🟢 High | P3 |

### 12.2 리스크 관리

| 리스크 | 영향도 | 가능성 | 완화 전략 |
|-------|-------|-------|----------|
| 기존 사용자 혼란 | High | Medium | 온보딩 튜토리얼 추가 |
| API 부하 증가 | Medium | Low | 캐싱 전략 |
| 모바일 성능 저하 | Medium | Medium | Lazy loading, 코드 스플리팅 |
| 정보 부족 불만 | Low | Medium | "More Details" 링크 제공 |

---

## 13. 최종 권고사항

### 13.1 즉시 실행 (이번 주)

1. ✅ GNB 링크 수정 (`/tutor/*` → `/dashboard/*`)
2. ✅ Korean Dashboard 페이지 생성
3. ✅ 각 Subject Dashboard에 "Start Learning" CTA 버튼 추가

### 13.2 단기 실행 (2주 내)

1. ✅ Total Dashboard 정보 중복 제거
2. ✅ Subject Comparison Chart 추가
3. ✅ Recent Activity 요약 (최대 3-5개)

### 13.3 중기 실행 (1개월 내)

1. ✅ 공통 Subject Dashboard 템플릿 개발
2. ✅ 과목별 특화 분석 컴포넌트
3. ✅ 모바일 최적화

### 13.4 장기 실행 (2-3개월)

1. ✅ AI 추천 시스템 고도화
2. ✅ 개인화 대시보드
3. ✅ A/B 테스트 및 최적화

---

## 부록 A: 용어 정리

- **Total Dashboard**: 전체 학습 여정을 통합적으로 보여주는 메인 대시보드
- **Subject Dashboard**: 특정 과목(영어, 수학 등)의 상세 학습 현황을 보여주는 대시보드
- **CTA (Call-to-Action)**: 사용자에게 특정 행동을 유도하는 버튼/링크
- **Information Architecture (IA)**: 정보 구조화 및 조직화 방법
- **Cognitive Load**: 사용자가 정보를 처리하는 데 필요한 인지적 노력
- **Friction-less**: 마찰 없는, 즉 최소한의 노력으로 목표를 달성할 수 있는 UX

## 부록 B: 컴포넌트 체크리스트

### Total Dashboard
- [ ] OverallStatsCard (총 학습 시간, 완료 세션, 레벨)
- [ ] StreakAndMotivation (스트릭, 주간 목표)
- [ ] SubjectComparisonChart (과목별 비교)
- [ ] ActiveGoalsWidget (활성 목표 3개)
- [ ] RecentActivitySummary (최근 활동 3-5개)
- [ ] QuickStartGrid (과목 바로가기)
- [ ] AchievementsGallery (배지)

### Subject Dashboard (공통)
- [ ] SubjectDashboardLayout (템플릿)
- [ ] ProgressOverviewCard (진행률 개요)
- [ ] RecommendedTopics (추천 학습)
- [ ] DetailedAnalytics (과목별 특화 분석)
- [ ] LearningHistoryTable (전체 이력)
- [ ] SubjectGoalsWidget (과목별 목표)
- [ ] StartLearningCTA (학습 시작 버튼)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-01-14
**작성자**: Claude (AI Assistant)
**검토자**: 개발팀

---

이 문서는 AI Park 서비스의 사용자 경험을 글로벌 에듀테크 수준으로 향상시키기 위한 포괄적인 계획서입니다. 단계적으로 실행하여 사용자에게 명확하고 직관적인 학습 환경을 제공하는 것을 목표로 합니다.
