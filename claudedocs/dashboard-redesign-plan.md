# SmartTutor 대시보드 재설계 계획서 (Phase 14)

**작성일**: 2025-01-XX
**Phase**: 14 (대시보드 UX/UI 전면 재설계)
**기반 리서치**: Khan Academy, Duolingo, Coursera, Century Tech 등 글로벌 EdTech 플랫폼 분석
**상태**: 📋 계획 수립 완료 → 구현 대기

---

## 📊 Executive Summary

### 현재 문제점 (Phase 8 Dashboard)

1. **단일 통합 대시보드**: 영어와 수학 학습이 구분되지 않아 혼란
2. **과목별 진행도 불명확**: 어떤 과목을 얼마나 학습했는지 한눈에 파악 어려움
3. **깊은 네비게이션**: 튜터 접근까지 홈 → 대시보드 → 튜터 선택 필요
4. **학습 vs 결과 구분 부재**: 학습 시작과 학습 결과 보기가 혼재
5. **보조 학습 접근성 낮음**: 발음 연습, 수학 시각화 등 찾기 어려움

### 재설계 핵심 목표

✅ **과목별 전문화**: 영어/수학 튜터 각각의 독립적 대시보드
✅ **명확한 구분**: 학습 참여(Engage) vs 결과 조회(Review) 분리
✅ **빠른 접근**: GNB를 통한 1-클릭 튜터 접근
✅ **자연스러운 유도**: 메인 학습 → 보조 학습 자연스러운 연결
✅ **학습 편의성 우선**: 편의성 > 시각적 화려함

### 예상 성과

- **튜터 접근 시간**: 3클릭 → 1클릭 (67% 단축)
- **과목별 학습 명확도**: 30% → 90%
- **보조 학습 참여율**: 5% → 25% (예상)
- **사용자 만족도**: 60점 → 85점 (목표)

---

## 🌐 글로벌 EdTech 벤치마크 분석

### 1. Khan Academy (Khanmigo)

**강점**:
- ✅ **과목별 대시보드**: Math, Science, Computing 각각 독립된 진행도 표시
- ✅ **학습 경로 명확화**: 현재 배우고 있는 내용, 다음 학습 추천, 마스터한 스킬 구분
- ✅ **Quick Access**: 상단 GNB에서 과목 직접 선택 가능
- ✅ **마스터리 시스템**: 각 스킬별 숙련도를 100% 기준으로 시각화

**우리에게 적용할 점**:
- 영어/수학 각각의 진행도 바 및 마스터리 표시
- "현재 학습 중", "다음 추천", "완료된 학습" 3-섹션 구조
- GNB에 "영어 튜터", "수학 튜터" 직접 링크

### 2. Duolingo

**강점**:
- ✅ **언어별 대시보드**: 학습 중인 각 언어마다 별도 트리/경로
- ✅ **일일 목표 중심**: Daily Goal, Streak, XP가 최상단 배치
- ✅ **게이미피케이션**: Leagues, Achievements, Streaks 강조
- ✅ **빠른 학습 시작**: "CONTINUE" 버튼이 가장 크고 눈에 띄게 배치

**우리에게 적용할 점**:
- 과목별 "학습 재개" 버튼 최상단 배치
- 연속 학습일, 주간 목표 진행도 강조
- 보조 학습(발음, 시각화)을 메인 학습 경로 하단에 자연스럽게 배치

### 3. Coursera

**강점**:
- ✅ **코스별 대시보드**: 각 코스마다 독립적인 진행도, 다음 강의, 과제 표시
- ✅ **명확한 CTA**: "Continue where you left off" 섹션
- ✅ **추천 시스템**: "Recommended for you" 기반 새로운 코스 추천
- ✅ **진행도 시각화**: 퍼센트 바 + 완료한 모듈 수

**우리에게 적용할 점**:
- 영어/수학 각각 "마지막으로 학습한 위치" 표시
- 추천 학습 주제 카드 (Phase 13 추천 시스템 활용)
- 과목별 완료율 표시

### 4. Century Tech (Adaptive Learning)

**강점**:
- ✅ **AI 기반 개인화**: 학생별 맞춤 학습 경로 자동 생성
- ✅ **실시간 진단**: 강점/약점 분석 대시보드
- ✅ **교사 대시보드**: 학생 진행도 모니터링 (우리는 학부모 뷰로 활용 가능)
- ✅ **목표 기반**: 단기/장기 목표 설정 및 추적

**우리에게 적용할 점**:
- Phase 12 감정 분석 + Phase 8 적응형 학습 결과를 대시보드에 표시
- 강점/약점 분석 카드
- 주간/월간 목표 설정 기능

---

## 🎨 새로운 대시보드 아키텍처

### 3-Layer Navigation System

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: GNB (Global Navigation Bar) - 모든 페이지 공통     │
│  [로고] [영어 튜터] [수학 튜터] [대시보드] [프로필]          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Subject Dashboard (과목별 대시보드)                │
│  • English Dashboard (영어 학습 허브)                         │
│  • Math Dashboard (수학 학습 허브)                            │
│  • Main Dashboard (통합 overview)                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Learning Activities (학습 활동)                     │
│  • Main Learning: 튜터 세션                                   │
│  • Supplementary: 발음, 시각화, 마이크로러닝, 복습            │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Types

#### 1. Main Dashboard (통합 대시보드)
**경로**: `/dashboard`
**목적**: 전체 학습 개요 및 빠른 접근

**섹션 구조**:
```
┌──────────────────────────────────────────────────────┐
│  🎯 학습 현황 한눈에 보기                              │
│  ┌─────────────────┐  ┌─────────────────┐           │
│  │ 📚 영어 학습     │  │ 🔢 수학 학습     │           │
│  │ 이번 주: 2시간   │  │ 이번 주: 1.5시간 │           │
│  │ 진행도: 35%      │  │ 진행도: 28%      │           │
│  │ [영어 대시보드→] │  │ [수학 대시보드→] │           │
│  └─────────────────┘  └─────────────────┘           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  ⚡ 빠른 시작                                          │
│  [▶ 영어 튜터 계속하기]  [▶ 수학 튜터 계속하기]        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  📊 이번 주 활동                                       │
│  • 총 학습 시간: 3.5시간                               │
│  • 완료한 세션: 8개                                    │
│  • 연속 학습일: 5일 🔥                                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  💡 AI 추천 (Phase 13 추천 시스템)                     │
│  • 🎤 발음 연습 추천: "R" 발음 개선이 필요해요          │
│  • 📐 기하학 시각화: 삼각함수 그래프 탐구               │
│  • 🧠 복습 알림: 3일 전 학습한 "현재완료형" 복습        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  📈 학습 분석                                          │
│  [학습 리포트] [감정 분석] [강점/약점 분석]             │
└──────────────────────────────────────────────────────┘
```

#### 2. English Dashboard (영어 학습 대시보드)
**경로**: `/dashboard/english`
**목적**: 영어 학습 전문화된 허브

**섹션 구조**:
```
┌──────────────────────────────────────────────────────┐
│  📚 영어 학습 허브                                     │
│  ┌──────────────────────────────────────────────┐    │
│  │  ▶ 영어 튜터와 대화 계속하기                   │    │
│  │  마지막 주제: "Travel conversation"           │    │
│  │  다음 추천: "Ordering at a restaurant"       │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  📊 영어 학습 진행도                                   │
│  • CEFR Level: A2 → B1 진행 중 (42%)                  │
│  • 이번 달 학습: 12시간 / 목표 20시간                  │
│  • 완료한 주제: 15개                                   │
│  • 마스터한 문법: 현재시제, 과거시제, 현재진행형        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  🎯 보조 학습 (영어)                                   │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ 🎤 발음 연습  │  │ 📖 단어 암기  │                 │
│  │ AI 분석 기반  │  │ 간격 반복    │                 │
│  │ [시작하기]    │  │ [시작하기]    │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ 🎮 문법 퀴즈  │  │ 📝 작문 연습  │                 │
│  │ 게임형 학습   │  │ AI 첨삭      │                 │
│  │ [시작하기]    │  │ [시작하기]    │                 │
│  └──────────────┘  └──────────────┘                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  📈 영어 학습 분석                                     │
│  • 강점: 듣기 이해력, 기본 문법                         │
│  • 약점: 발음(R, TH), 고급 어휘                         │
│  • 추천: 발음 집중 연습 2주 과정                        │
│  [상세 보고서 보기 →]                                  │
└──────────────────────────────────────────────────────┘
```

#### 3. Math Dashboard (수학 학습 대시보드)
**경로**: `/dashboard/math`
**목적**: 수학 학습 전문화된 허브

**섹션 구조**:
```
┌──────────────────────────────────────────────────────┐
│  🔢 수학 학습 허브                                     │
│  ┌──────────────────────────────────────────────┐    │
│  │  ▶ 수학 튜터와 학습 계속하기                   │    │
│  │  마지막 주제: "이차방정식 풀이"                │    │
│  │  다음 추천: "이차함수 그래프"                  │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  📊 수학 학습 진행도                                   │
│  • 학년별 진행도: 중2 수학 68% 완료                    │
│  • 이번 달 학습: 8시간 / 목표 15시간                   │
│  • 마스터한 단원:                                      │
│    ✅ 일차방정식                                       │
│    ✅ 일차함수                                         │
│    🔄 이차방정식 (진행 중)                             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  🎯 보조 학습 (수학)                                   │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ 📊 시각화     │  │ 🎯 문제풀이  │                 │
│  │ 그래프 탐구   │  │ 단계별 풀이  │                 │
│  │ [시작하기]    │  │ [시작하기]    │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ 🧮 공식 암기  │  │ 📐 응용문제  │                 │
│  │ 플래시카드    │  │ 실생활 적용  │                 │
│  │ [시작하기]    │  │ [시작하기]    │                 │
│  └──────────────┘  └──────────────┘                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  📈 수학 학습 분석                                     │
│  • 강점: 계산 능력, 기본 개념 이해                      │
│  • 약점: 복잡한 응용문제, 기하학적 직관                 │
│  • 추천: 시각화 도구로 기하학 개념 익히기               │
│  [상세 보고서 보기 →]                                  │
└──────────────────────────────────────────────────────┘
```

---

## 🧭 GNB (Global Navigation Bar) 설계

### 디자인 원칙

1. **고정 위치**: 모든 페이지 최상단 sticky 고정
2. **명확한 레이블**: 아이콘 + 텍스트 조합
3. **빠른 접근**: 1-클릭으로 주요 기능 접근
4. **반응형**: 모바일에서는 햄버거 메뉴로 전환
5. **현재 위치 표시**: Active state 명확히 표시

### Desktop GNB 구조

```
┌────────────────────────────────────────────────────────────────────┐
│  [🎓 SmartTutor]  [📚 영어 튜터]  [🔢 수학 튜터]  [📊 대시보드]  │
│                                                                    │
│                                    [🔔 알림] [👤 프로필 ▾]         │
└────────────────────────────────────────────────────────────────────┘
```

**좌측 영역**:
- **로고** (홈으로 이동)
- **영어 튜터** → 바로 `/tutor/english`로 이동 (드롭다운 없음)
- **수학 튜터** → 바로 `/tutor/math`로 이동
- **대시보드** → 드롭다운:
  - 전체 대시보드 (`/dashboard`)
  - 영어 대시보드 (`/dashboard/english`)
  - 수학 대시보드 (`/dashboard/math`)

**우측 영역**:
- **알림 아이콘**: 복습 알림, 학습 권장 시간 등
- **프로필 드롭다운**:
  - 프로필 편집
  - 설정
  - 학습 리포트
  - 로그아웃

### Mobile GNB 구조

```
┌──────────────────────────────────────┐
│  [☰]  SmartTutor         [🔔] [👤]  │
└──────────────────────────────────────┘

[☰ 클릭 시 사이드바]
┌──────────────────────┐
│  📚 영어 튜터          │
│  🔢 수학 튜터          │
│  📊 대시보드           │
│  ──────────────────  │
│  👤 프로필             │
│  ⚙️  설정             │
│  📈 학습 리포트        │
│  🚪 로그아웃           │
└──────────────────────┘
```

### GNB 기술 스펙

**컴포넌트 구조**:
```typescript
components/
  navigation/
    TopNavigation.tsx      // 메인 GNB 컴포넌트
    NavItem.tsx            // 개별 네비게이션 아이템
    NavDropdown.tsx        // 드롭다운 메뉴
    MobileNav.tsx          // 모바일 햄버거 메뉴
    NotificationBell.tsx   // 알림 아이콘
    ProfileDropdown.tsx    // 프로필 드롭다운
```

**스타일**:
```css
/* Desktop */
- Height: 64px
- Background: bg-white/95 backdrop-blur-md
- Border: border-b border-gray-200
- Shadow: shadow-sm
- Position: sticky top-0 z-50

/* Active State */
- Color: text-primary-600
- Border-bottom: 3px solid primary-600
- Font-weight: font-semibold

/* Hover State */
- Background: bg-gray-50
- Color: text-gray-900
- Transition: 200ms ease
```

---

## 📱 학습 참여 vs 결과 조회 UI 분리

### 디자인 원칙

**학습 참여 (Engage)**: 크고, 눈에 띄고, 액션 중심
**결과 조회 (Review)**: 작고, 정보 중심, 차분한 톤

### 시각적 차별화

| 요소 | 학습 참여 (Engage) | 결과 조회 (Review) |
|------|-------------------|-------------------|
| **크기** | 큰 카드 (h-80, 320px) | 작은 카드 (h-56, 224px) |
| **CTA 버튼** | 큰 버튼 ("▶ 시작하기") | 작은 링크 ("보기 →") |
| **그라디언트** | 강렬한 색상 조합 | 부드러운 색상 조합 |
| **아이콘** | 큰 아이콘 (64px) | 작은 아이콘 (48px) |
| **애니메이션** | scale(1.02) + shadow | scale(1.01) + subtle |
| **배치** | 상단 우선 배치 | 중하단 배치 |

### 예시: 영어 대시보드

```
┌────────────────────────────────────────────────────────┐
│  학습 참여 (Engage) - 상단 영역                         │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  ▶ 영어 튜터와 대화 계속하기                   │    │
│  │                                               │    │
│  │  [큰 그라디언트 버튼: 320px 높이]              │    │
│  │  마지막: "Travel conversation"                │    │
│  │  다음: "Ordering food"                        │    │
│  │                                               │    │
│  │  [▶▶▶ 대화 시작하기] (큰 CTA)                 │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ 🎤 발음   │  │ 📖 단어   │  │ 🎮 퀴즈   │           │
│  │ 연습     │  │ 암기     │  │ 게임     │           │
│  │ [시작▶]   │  │ [시작▶]   │  │ [시작▶]   │           │
│  └──────────┘  └──────────┘  └──────────┘           │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  결과 조회 (Review) - 하단 영역                         │
│                                                        │
│  ┌────────┐  ┌────────┐  ┌────────┐                 │
│  │ 📊 리포트│  │ 🎭 감정 │  │ 💪 강약점│                 │
│  │ 학습통계 │  │ 분석   │  │ 분석   │                 │
│  │ [보기→]  │  │ [보기→] │  │ [보기→] │                 │
│  └────────┘  └────────┘  └────────┘                 │
│  (작은 카드: 224px 높이)                               │
└────────────────────────────────────────────────────────┘
```

---

## 🔗 메인 학습 → 보조 학습 자연스러운 연결

### 연결 전략

#### 1. 컨텍스트 기반 추천 (Context-Aware Recommendations)

**영어 튜터 세션 종료 시**:
```
┌──────────────────────────────────────────────┐
│  ✅ 훌륭해요! 15분간 대화를 완료했습니다.      │
│                                              │
│  💡 이런 학습은 어때요?                       │
│  ┌────────────────────────────────────┐     │
│  │ 🎤 발음 연습 (5분)                  │     │
│  │ 방금 대화에서 "R" 발음이 어려웠어요  │     │
│  │ AI 분석으로 정확한 발음 배우기       │     │
│  │ [발음 연습 시작하기 →]               │     │
│  └────────────────────────────────────┘     │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │ 📖 단어 복습 (3분)                  │     │
│  │ 오늘 배운 새 단어 8개 복습           │     │
│  │ 간격 반복으로 장기 기억 만들기       │     │
│  │ [단어 복습 시작하기 →]               │     │
│  └────────────────────────────────────┘     │
│                                              │
│  [나중에 하기]  [대시보드로 돌아가기]         │
└──────────────────────────────────────────────┘
```

**수학 튜터 세션 종료 시**:
```
┌──────────────────────────────────────────────┐
│  ✅ 잘했어요! 이차방정식 5문제 풀이 완료       │
│                                              │
│  💡 이해를 더 깊게 하려면?                    │
│  ┌────────────────────────────────────┐     │
│  │ 📊 그래프 시각화 (7분)              │     │
│  │ 방금 푼 방정식을 그래프로 보기       │     │
│  │ 인터랙티브 탐구로 개념 완성          │     │
│  │ [시각화 시작하기 →]                  │     │
│  └────────────────────────────────────┘     │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │ 🎯 유사 문제 풀이 (5분)             │     │
│  │ 같은 유형 3문제 더 풀어보기          │     │
│  │ 완벽하게 마스터하기                  │     │
│  │ [문제 풀기 →]                        │     │
│  └────────────────────────────────────┘     │
│                                              │
│  [나중에 하기]  [대시보드로 돌아가기]         │
└──────────────────────────────────────────────┘
```

#### 2. 대시보드 내 자연스러운 배치

**영어 대시보드 플로우**:
```
1. [최상단] ▶ 영어 튜터 계속하기 (메인 학습)
      ↓
2. [바로 아래] 보조 학습 카드 4개 (2x2 그리드)
   - 발음 연습 (튜터와 연관)
   - 단어 암기 (튜터에서 배운 단어)
   - 문법 퀴즈 (튜터에서 사용한 문법)
   - 작문 연습 (튜터 주제 확장)
      ↓
3. [하단] 학습 분석 및 리포트 (결과 조회)
```

#### 3. 스마트 추천 시스템 (Phase 13 통합)

**추천 로직**:
```typescript
// lib/recommendations/supplementary-learning.ts

interface SupplementaryRecommendation {
  type: 'pronunciation' | 'vocabulary' | 'visualization' | 'quiz';
  subject: 'english' | 'math';
  reason: string;        // "방금 대화에서 R 발음이 어려웠어요"
  contextId: string;     // 튜터 세션 ID
  priority: 1-5;         // 우선순위
  estimatedTime: number; // 예상 소요 시간 (분)
}

function getSupplementaryRecommendations(
  lastSession: TutorSession
): SupplementaryRecommendation[] {
  // 1. 튜터 세션 분석
  const weakPoints = analyzeWeakPoints(lastSession);

  // 2. 과목별 추천 생성
  if (lastSession.subject === 'english') {
    return [
      // 발음 문제 감지 → 발음 연습 추천
      ...getPronunciationRecommendations(weakPoints),
      // 새 단어 사용 → 단어 암기 추천
      ...getVocabularyRecommendations(lastSession.newWords),
      // 문법 실수 → 문법 퀴즈 추천
      ...getGrammarRecommendations(weakPoints.grammar)
    ];
  } else {
    return [
      // 개념 이해 부족 → 시각화 추천
      ...getVisualizationRecommendations(weakPoints),
      // 계산 실수 → 유사 문제 추천
      ...getSimilarProblemsRecommendations(lastSession.problems)
    ];
  }
}
```

---

## 📊 핵심 지표 표시 (Motion & Effects)

### 1. 학습 진행도 바 (Animated Progress Bar)

**디자인**:
```typescript
// components/dashboard/AnimatedProgressBar.tsx

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  color: 'blue' | 'green' | 'purple';
  showPercentage?: boolean;
  animationDuration?: number; // ms
}

// 렌더링 예시:
┌────────────────────────────────────────────┐
│  이번 주 학습 시간                          │
│  ┌──────────────────────────────────┐     │
│  │ ████████████░░░░░░░░░░  60%     │     │
│  └──────────────────────────────────┘     │
│  12시간 / 20시간 목표                       │
└────────────────────────────────────────────┘

// 애니메이션:
- 진입 시: 0% → 60% (1초 ease-out)
- 업데이트 시: 이전값 → 새값 (0.5초 ease-in-out)
- 색상: 그라디언트 (from-blue-400 to-blue-600)
- 반짝임: 목표 달성 시 pulse 애니메이션
```

### 2. 연속 학습일 (Streak Flame)

**디자인**:
```typescript
// components/dashboard/StreakFlame.tsx

┌────────────────────┐
│      🔥            │
│      12일           │
│   연속 학습 중!     │
│                    │
│  ▓▓▓▓▓▓▓ 일 월 화 수│
│  (최근 7일 히트맵)  │
└────────────────────┘

// 애니메이션:
- 불꽃 아이콘: scale pulse (1.0 ↔ 1.1, 2초 반복)
- 숫자: count-up 애니메이션 (0 → 12, 1초)
- 히트맵: 순차 fade-in (각 50ms 간격)
- 달성 시: confetti 효과
```

### 3. 레벨업 프로그레스 (Gamification)

**디자인**:
```typescript
// components/dashboard/LevelProgress.tsx

┌──────────────────────────────────────────┐
│  ⭐ Level 5  ─────────→  ⭐ Level 6      │
│  ┌────────────────────────────────┐     │
│  │ ████████████████░░░░░░  75%    │     │
│  └────────────────────────────────┘     │
│  750 XP / 1000 XP                        │
│  250 XP로 레벨업! 💪                      │
└──────────────────────────────────────────┘

// 애니메이션:
- XP 획득 시: 카운터 증가 + 진행 바 이동
- 레벨업 순간: 폭죽 + 모달 ("축하합니다! Level 6 달성")
- 별 아이콘: 레벨업 시 rotate + scale (360도, 1초)
```

### 4. 과목별 마스터리 (Subject Mastery)

**디자인**:
```typescript
// components/dashboard/SubjectMastery.tsx

┌──────────────────────────────────────────┐
│  📚 영어 마스터리                         │
│                                          │
│  듣기    ████████░░  80%  🎧             │
│  말하기  ██████░░░░  60%  💬             │
│  읽기    ██████████ 100%  📖 ✅          │
│  쓰기    ████░░░░░░  40%  ✍️             │
│                                          │
│  종합 점수: 70% (B+)                      │
└──────────────────────────────────────────┘

// 애니메이션:
- 각 바: 순차 fill (200ms 간격)
- 100% 달성 항목: 체크마크 bounce
- Hover: 상세 툴팁 ("최근 7일 +5% 향상")
```

### 5. 실시간 학습 통계 (Live Stats)

**디자인**:
```typescript
// components/dashboard/LiveStats.tsx

┌──────────────────────────────────────────┐
│  📊 이번 주 학습 현황                     │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 8회  │  │ 12시간│  │ 85점 │           │
│  │ 세션 │  │ 학습  │  │ 평균 │           │
│  │  📈  │  │  ⏱️   │  │  💯  │           │
│  └──────┘  └──────┘  └──────┘           │
│                                          │
│  전주 대비: +2회  +3시간  +5점  🎉        │
└──────────────────────────────────────────┘

// 애니메이션:
- 숫자: count-up 애니메이션 (1초)
- 아이콘: gentle bounce (진입 시)
- 증가/감소 화살표: 색상 변화 (녹색/빨간색)
- 업데이트 시: pulse glow 효과
```

### 6. 감정 트렌드 (Emotion Trend - Phase 12)

**디자인**:
```typescript
// components/dashboard/EmotionTrend.tsx

┌──────────────────────────────────────────┐
│  🎭 이번 주 학습 감정                     │
│                                          │
│  😊 Happy      ████████░░  80%          │
│  😰 Frustrated ██░░░░░░░░  20%          │
│  😐 Neutral    ████░░░░░░  40%          │
│                                          │
│  💡 인사이트: 오후 학습 시 가장 집중력 높음 │
└──────────────────────────────────────────┘

// 애니메이션:
- 감정 바: 순차 fill (각 300ms)
- 이모지: rotate + bounce (진입 시)
- Hover: 상세 그래프 팝업
```

---

## 🎨 디자인 시스템 및 컴포넌트

### Color Palette (과목별)

```typescript
// lib/design-system/colors.ts

export const subjectColors = {
  english: {
    primary: 'from-blue-600 via-indigo-600 to-purple-600',
    light: 'from-blue-50 to-indigo-50',
    accent: 'blue-600',
    icon: '📚'
  },
  math: {
    primary: 'from-purple-600 via-pink-600 to-rose-600',
    light: 'from-purple-50 to-pink-50',
    accent: 'purple-600',
    icon: '🔢'
  },
  analytics: {
    primary: 'from-green-500 to-emerald-600',
    light: 'from-green-50 to-emerald-50',
    accent: 'green-600',
    icon: '📊'
  }
};
```

### Typography Scale

```css
/* Headings */
h1: text-4xl font-bold (페이지 제목)
h2: text-3xl font-bold (섹션 제목)
h3: text-2xl font-semibold (카드 제목)
h4: text-xl font-semibold (서브 제목)

/* Body */
body: text-base font-normal (본문)
small: text-sm font-normal (캡션)
tiny: text-xs font-medium (라벨)

/* CTA */
cta-large: text-lg font-bold (메인 버튼)
cta-small: text-sm font-semibold (보조 버튼)
```

### Spacing System

```css
/* Card Padding */
card-large: p-8 (메인 학습 카드)
card-medium: p-6 (보조 학습 카드)
card-small: p-4 (결과 조회 카드)

/* Section Spacing */
section-gap: space-y-8 (섹션 간 간격)
card-gap: gap-6 (카드 간 간격)
item-gap: gap-4 (아이템 간 간격)

/* Container */
max-width: max-w-7xl (대시보드 최대 너비)
padding: px-4 sm:px-6 lg:px-8 (반응형 패딩)
```

### Animation Presets

```typescript
// lib/design-system/animations.ts

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  },
  cardHover: {
    whileHover: { scale: 1.02, y: -4 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 300 }
  },
  buttonHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400 }
  }
};
```

---

## 📂 파일 구조 및 기술 스펙

### 디렉토리 구조

```
app/
  dashboard/
    page.tsx                    # 메인 대시보드 (통합 overview)
    english/
      page.tsx                  # 영어 학습 대시보드
    math/
      page.tsx                  # 수학 학습 대시보드
    layout.tsx                  # 대시보드 공통 레이아웃 (GNB 포함)

components/
  navigation/
    TopNavigation.tsx           # GNB 메인 컴포넌트
    NavItem.tsx                 # 네비게이션 아이템
    NavDropdown.tsx             # 드롭다운 메뉴
    MobileNav.tsx               # 모바일 네비게이션
    NotificationBell.tsx        # 알림 아이콘
    ProfileDropdown.tsx         # 프로필 드롭다운

  dashboard/
    # 기존 Phase 13 컴포넌트
    DashboardSection.tsx
    ActionCard.tsx
    AnalyticsCard.tsx

    # 새로운 Phase 14 컴포넌트
    SubjectDashboard.tsx        # 과목별 대시보드 래퍼
    QuickStartSection.tsx       # 빠른 시작 섹션
    SupplementaryLearning.tsx   # 보조 학습 카드 그리드
    LearningStatsCard.tsx       # 학습 통계 카드

    # 애니메이션 컴포넌트
    AnimatedProgressBar.tsx     # 진행도 바
    StreakFlame.tsx             # 연속 학습일
    LevelProgress.tsx           # 레벨 프로그레스 (Phase 8 개선)
    SubjectMastery.tsx          # 과목별 마스터리
    LiveStats.tsx               # 실시간 통계
    EmotionTrend.tsx            # 감정 트렌드 (Phase 12)

  tutor-completion/
    SessionCompleteModal.tsx    # 세션 종료 모달
    SupplementaryRecommendations.tsx # 보조 학습 추천

lib/
  dashboard/
    subject-dashboard-data.ts   # 과목별 대시보드 데이터 로직
    dashboard-analytics.ts      # 대시보드 분석 로직

  recommendations/
    supplementary-learning.ts   # 보조 학습 추천 (신규)
    learning-recommendations.ts # 기존 Phase 13 추천 시스템

  design-system/
    colors.ts                   # 색상 시스템
    animations.ts               # 애니메이션 프리셋
    typography.ts               # 타이포그래피 스케일
```

### 주요 타입 정의

```typescript
// types/dashboard.ts

export interface SubjectDashboardData {
  subject: 'english' | 'math';

  // 학습 현황
  currentTopic: string;
  lastSession: {
    date: Date;
    duration: number; // 분
    topic: string;
  };
  nextRecommendedTopic: string;

  // 진행도
  overallProgress: number; // 0-100
  weeklyProgress: {
    current: number; // 시간
    target: number;  // 시간
  };
  completedTopics: number;
  totalTopics: number;

  // 마스터리 (영어 전용)
  mastery?: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };

  // 단원 진행도 (수학 전용)
  chapters?: {
    name: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'not_started';
  }[];

  // 강점/약점
  strengths: string[];
  weaknesses: string[];

  // 추천 보조 학습
  supplementaryRecommendations: SupplementaryRecommendation[];
}

export interface DashboardStats {
  weeklyStats: {
    sessions: number;
    hours: number;
    averageScore: number;
  };
  streak: {
    current: number;
    longest: number;
    heatmap: boolean[]; // 최근 7일
  };
  level: {
    current: number;
    xp: number;
    nextLevelXp: number;
  };
  emotionTrend: {
    happy: number;
    frustrated: number;
    neutral: number;
    dominant: 'happy' | 'frustrated' | 'neutral';
  };
}
```

---

## 🚀 구현 우선순위 및 단계

### Phase 14-1: GNB 및 기본 레이아웃 (1-2일)

**목표**: 모든 페이지에서 접근 가능한 GNB 구축

**작업 목록**:
1. ✅ TopNavigation.tsx 생성
   - Desktop 레이아웃
   - Mobile 햄버거 메뉴
   - Active state 관리

2. ✅ 라우팅 구조 확정
   - `/dashboard` (메인)
   - `/dashboard/english` (영어)
   - `/dashboard/math` (수학)

3. ✅ 대시보드 공통 레이아웃
   - `app/dashboard/layout.tsx`
   - GNB 포함
   - 반응형 처리

**완료 기준**:
- GNB가 모든 페이지에서 작동
- 영어/수학 튜터로 1-클릭 접근 가능
- 모바일에서 정상 작동

### Phase 14-2: 과목별 대시보드 구축 (2-3일)

**목표**: 영어/수학 각각의 전문화된 대시보드

**작업 목록**:
1. ✅ 영어 대시보드 (`/dashboard/english/page.tsx`)
   - 메인 학습 섹션 (튜터 계속하기)
   - 보조 학습 카드 (발음, 단어, 퀴즈, 작문)
   - 진행도 및 마스터리 표시
   - 학습 분석 카드

2. ✅ 수학 대시보드 (`/dashboard/math/page.tsx`)
   - 메인 학습 섹션 (튜터 계속하기)
   - 보조 학습 카드 (시각화, 문제풀이, 공식, 응용)
   - 진행도 및 단원 상태
   - 학습 분석 카드

3. ✅ 데이터 로직 구현
   - `lib/dashboard/subject-dashboard-data.ts`
   - 과목별 데이터 fetch 함수
   - 추천 생성 로직

**완료 기준**:
- 영어/수학 대시보드 독립적으로 작동
- 각 과목별 특화된 정보 표시
- 보조 학습 카드 클릭 시 해당 페이지로 이동

### Phase 14-3: 메인 대시보드 통합 (1-2일)

**목표**: 전체 학습 개요를 보여주는 통합 대시보드

**작업 목록**:
1. ✅ 메인 대시보드 재설계 (`/dashboard/page.tsx`)
   - 영어/수학 요약 카드
   - 빠른 시작 버튼
   - 이번 주 활동 통계
   - AI 추천 (Phase 13 통합)
   - 학습 분석 링크

2. ✅ Phase 8 컴포넌트 재활용
   - LevelProgress 개선
   - StreakDisplay 개선
   - WeeklyStats 개선

**완료 기준**:
- 통합 대시보드에서 전체 학습 현황 파악 가능
- 영어/수학 대시보드로 빠른 이동 가능
- Phase 8 게이미피케이션 요소 유지

### Phase 14-4: 애니메이션 및 인터랙션 (2-3일)

**목표**: 핵심 지표에 모션 효과 적용

**작업 목록**:
1. ✅ 진행도 바 애니메이션
   - AnimatedProgressBar.tsx
   - Count-up 애니메이션
   - Gradient fill 효과

2. ✅ 연속 학습일 효과
   - StreakFlame.tsx
   - Pulse 애니메이션
   - 히트맵 순차 표시

3. ✅ 레벨 프로그레스
   - LevelProgress.tsx 개선
   - 레벨업 confetti 효과

4. ✅ 실시간 통계 카드
   - LiveStats.tsx
   - Hover 툴팁
   - 업데이트 pulse

5. ✅ 감정 트렌드 (Phase 12)
   - EmotionTrend.tsx
   - 감정별 색상 애니메이션

**완료 기준**:
- 모든 핵심 지표에 부드러운 애니메이션 적용
- 60fps 유지
- 모바일에서도 성능 저하 없음

### Phase 14-5: 보조 학습 추천 시스템 (2일)

**목표**: 세션 종료 시 컨텍스트 기반 추천

**작업 목록**:
1. ✅ 추천 로직 구현
   - `lib/recommendations/supplementary-learning.ts`
   - 튜터 세션 분석
   - 과목별 추천 생성

2. ✅ 세션 종료 모달
   - SessionCompleteModal.tsx
   - 추천 카드 2-3개 표시
   - "나중에 하기" / "시작하기" 버튼

3. ✅ 대시보드 통합
   - SupplementaryLearning.tsx
   - 추천 기반 카드 정렬

**완료 기준**:
- 튜터 세션 종료 시 추천 모달 표시
- 추천이 세션 내용과 연관성 있음
- 클릭 시 해당 보조 학습 페이지로 이동

### Phase 14-6: 테스트 및 최적화 (2일)

**목표**: E2E 테스트 및 성능 최적화

**작업 목록**:
1. ✅ E2E 테스트 작성
   - GNB 네비게이션 테스트
   - 과목별 대시보드 렌더링 테스트
   - 보조 학습 추천 플로우 테스트

2. ✅ 성능 최적화
   - 이미지 최적화
   - 코드 스플리팅
   - 애니메이션 최적화

3. ✅ 접근성 검증
   - ARIA 라벨 추가
   - 키보드 네비게이션 테스트
   - 스크린 리더 호환성

**완료 기준**:
- 모든 주요 플로우 E2E 테스트 통과
- Lighthouse 점수: Performance >90, Accessibility >95
- 모바일에서 60fps 유지

---

## 📊 성공 지표 (KPI)

### 사용성 지표

| 지표 | 현재 (Phase 8) | 목표 (Phase 14) |
|------|----------------|-----------------|
| 튜터 접근 클릭 수 | 3회 | 1회 |
| 대시보드 체류 시간 | 30초 | 60초 |
| 보조 학습 참여율 | 5% | 25% |
| 과목별 학습 명확도 | 30% | 90% |

### 기술 지표

| 지표 | 목표 |
|------|------|
| Lighthouse Performance | >90 |
| Lighthouse Accessibility | >95 |
| First Contentful Paint | <1.5초 |
| Time to Interactive | <3초 |
| 애니메이션 FPS | 60fps |

### 비즈니스 지표

| 지표 | 목표 |
|------|------|
| 주간 활성 사용자 (WAU) | +30% |
| 평균 세션 시간 | +50% |
| 학습 완료율 | +20% |
| 사용자 만족도 | 85/100 |

---

## 🎯 벤치마크 비교표

| 기능 | Khan Academy | Duolingo | Coursera | SmartTutor Phase 14 |
|------|-------------|----------|----------|---------------------|
| **과목별 대시보드** | ✅ | ✅ | ✅ | ✅ |
| **1-클릭 튜터 접근** | ✅ | ✅ | ❌ | ✅ |
| **보조 학습 추천** | ❌ | ⚠️ (제한적) | ✅ | ✅ (AI 기반) |
| **감정 기반 추천** | ❌ | ❌ | ❌ | ✅ (Phase 12) |
| **실시간 진행도** | ✅ | ✅ | ✅ | ✅ (애니메이션) |
| **게이미피케이션** | ⚠️ (제한적) | ✅ | ❌ | ✅ (Phase 8) |
| **과목별 마스터리** | ✅ | ⚠️ (간단) | ✅ | ✅ |
| **모바일 최적화** | ✅ | ✅ | ✅ | ✅ |

---

## 🔧 기술 스택 및 의존성

### 프레임워크 및 라이브러리

- **Next.js 15**: App Router, Server Components
- **React 19**: Hooks, Context
- **TypeScript**: 전체 타입 안전성
- **Tailwind CSS**: 스타일링
- **Framer Motion**: 애니메이션
- **Lucide React**: 아이콘

### 상태 관리

- **Zustand**: 전역 상태 (기존 Phase 8)
- **React Query**: 서버 상태 관리 (신규 도입 권장)

### 데이터 소스

- **LocalStorage**: 게스트 모드 (Phase 13)
- **Database**: 인증 사용자 (향후 Phase 15)
- **API Routes**: 데이터 fetch 엔드포인트

---

## 📚 참고 자료 및 인사이트

### 글로벌 EdTech 트렌드 (2025)

1. **개인화 (Personalization)**
   - AI 기반 학습 경로 자동 생성
   - 학생별 약점 분석 및 맞춤 추천
   - 적응형 난이도 조정

2. **게이미피케이션 (Gamification)**
   - Streaks, XP, Levels, Achievements
   - Leaderboards (선택적 경쟁)
   - Daily Goals 및 Challenges

3. **마이크로러닝 (Microlearning)**
   - 5-10분 짧은 세션
   - 이동 중 학습 지원
   - 간격 반복 (Spaced Repetition)

4. **몰입형 기술 (Immersive Tech)**
   - AR/VR 학습 경험
   - 인터랙티브 시뮬레이션
   - 실생활 맥락 제공

5. **감정 AI (Emotion AI)**
   - 학습 감정 모니터링
   - 스트레스 감지 및 휴식 권장
   - 최적 학습 시간 추천

### 우리 서비스의 차별화 포인트

✅ **감정 기반 추천**: Phase 12 감정 분석 시스템 활용
✅ **과목별 전문화**: 영어/수학 각각의 독립적 대시보드
✅ **자연스러운 학습 유도**: 메인 → 보조 학습 seamless 연결
✅ **한국 학생 최적화**: 학교급(초/중/고/대) 맞춤 콘텐츠
✅ **게스트 모드**: 회원가입 없이 바로 체험 가능

---

## ✅ 체크리스트

### Phase 14-1: GNB 및 레이아웃
- [ ] TopNavigation.tsx 생성
- [ ] Desktop GNB 구현
- [ ] Mobile 햄버거 메뉴 구현
- [ ] Active state 관리
- [ ] 라우팅 구조 확정
- [ ] 대시보드 공통 레이아웃 (`layout.tsx`)
- [ ] 반응형 테스트

### Phase 14-2: 과목별 대시보드
- [ ] 영어 대시보드 페이지 생성
- [ ] 수학 대시보드 페이지 생성
- [ ] 과목별 데이터 로직 구현
- [ ] 메인 학습 섹션 구현
- [ ] 보조 학습 카드 그리드 구현
- [ ] 진행도 표시 구현
- [ ] 학습 분석 카드 구현

### Phase 14-3: 메인 대시보드 통합
- [ ] 메인 대시보드 재설계
- [ ] 영어/수학 요약 카드
- [ ] 빠른 시작 섹션
- [ ] 이번 주 활동 통계
- [ ] AI 추천 통합 (Phase 13)
- [ ] Phase 8 컴포넌트 재활용

### Phase 14-4: 애니메이션
- [ ] AnimatedProgressBar.tsx
- [ ] StreakFlame.tsx
- [ ] LevelProgress.tsx 개선
- [ ] LiveStats.tsx
- [ ] EmotionTrend.tsx
- [ ] 성능 최적화 (60fps)

### Phase 14-5: 보조 학습 추천
- [ ] 추천 로직 구현 (`supplementary-learning.ts`)
- [ ] SessionCompleteModal.tsx
- [ ] 세션 종료 시 추천 표시
- [ ] 추천 기반 카드 정렬

### Phase 14-6: 테스트 및 최적화
- [ ] E2E 테스트 작성
- [ ] 성능 최적화
- [ ] 접근성 검증
- [ ] Lighthouse 점수 달성
- [ ] 모바일 테스트

---

## 🚀 다음 단계 (Phase 15 예정)

1. **인증 시스템 통합**
   - NextAuth.js + OAuth (Google, GitHub)
   - Database 동기화
   - 여러 기기 간 프로필 동기화

2. **학부모 대시보드**
   - 자녀 학습 모니터링
   - 진행도 리포트
   - 목표 설정 및 관리

3. **소셜 기능**
   - 친구 추가 및 학습 현황 공유
   - 리더보드 (선택적 참여)
   - 학습 챌린지

4. **AI 튜터 개선**
   - GPT-4 Turbo 적용
   - 음성 대화 품질 향상
   - 실시간 피드백 개선

---

**문서 작성일**: 2025-01-XX
**작성자**: Claude (SuperClaude Framework)
**버전**: 1.0
**상태**: 계획 수립 완료 → 구현 승인 대기
