# AI Park 핵심 기능 & 사용 방법 영역 고도화 계획서

## 📋 Executive Summary

전 세계 에듀테크 리더(Khan Academy, Duolingo, Coursera)와 2025 디자인 트렌드를 벤치마킹하여, AI Park의 "핵심 기능"과 "사용 방법" 영역을 **전문적이고 인터랙티브한 차세대 학습 플랫폼 UI/UX**로 재설계합니다.

**핵심 개선 방향**:
- ✅ 5과목 완전 통합 (영어, 수학, 과학, 사회, 국어)
- ✅ AI 전문성 강조 (그라데이션, 마이크로 인터랙션, 3D 효과)
- ✅ 정보 가독성 극대화 (타이포그래피, 계층 구조, 스캔 패턴)
- ✅ 히어로 비디오와 자연스러운 통합
- ✅ 차별화 포인트 시각화 (AI 튜터, 실시간 피드백, 개인화)
- ✅ 완벽한 반응형 설계 (Mobile-First)

---

## 🌍 Phase 1: 글로벌 벤치마킹 분석

### 1.1 Khan Academy 분석
**강점**:
- 심플하고 클린한 UI/UX
- 게이미피케이션 요소 (포인트, 배지)
- 명확한 학습 경로 시각화

**적용 요소**:
- 단계별 진행 상태 시각화
- 명확한 CTA 버튼
- 학습 성과 강조

### 1.2 Duolingo 분석
**강점**:
- 강력한 게이미피케이션 (스트릭, 레벨)
- 친근한 캐릭터와 컬러 시스템
- 즉각적인 피드백

**적용 요소**:
- 인터랙티브 아이콘 애니메이션
- 진행도 표시
- 재미 요소 강조

### 1.3 Coursera 분석
**강점**:
- 전문적이고 모던한 디자인
- 깔끔한 5탭 메인 메뉴
- 오프라인 학습 기능 강조

**적용 요소**:
- 프로페셔널한 그라데이션
- 계층적 정보 구조
- 다운로드/오프라인 기능 강조

### 1.4 2025 EdTech 디자인 트렌드
**핵심 트렌드**:
1. **Interactive Animations**: CTA 주변 전략적 애니메이션 배치
2. **Gamification**: 언락 콘텐츠, 배지, 일일 목표
3. **Immersive Tech**: AR/VR 학습 경험
4. **Micro-interactions**: 부드러운 모션, 즉각적 피드백
5. **Multimodal Content**: 텍스트, 이미지, 오디오, 인터랙티브 요소 통합
6. **AI Personalization**: 개인화된 학습 경로

**적용 요소**:
- Hover 시 스무스한 애니메이션
- 스크롤 기반 인터랙션
- 3D 카드 효과
- 그라데이션 + 글래스모피즘

---

## 🎨 Phase 2: 디자인 시스템 재정의

### 2.1 컬러 시스템 확장

#### 기존 컬러 (2과목)
```css
primary: 영어 (파랑)
secondary: 수학 (보라)
```

#### 새로운 5과목 컬러 시스템
```css
/* 과목별 브랜드 컬러 */
--english-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--math-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--science-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--social-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
--korean-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

/* AI 강조 컬러 */
--ai-glow: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
--ai-accent: #00d4ff;
--ai-secondary: #b24bf3;

/* Neutral 시스템 */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-900: #171717;
```

### 2.2 타이포그래피 시스템

```css
/* Headings - Inter Font (AI 느낌) */
--h1-size: clamp(2.5rem, 5vw, 4.5rem);
--h1-weight: 800;
--h1-line-height: 1.1;
--h1-letter-spacing: -0.02em;

--h2-size: clamp(2rem, 4vw, 3.5rem);
--h2-weight: 700;
--h2-line-height: 1.2;

--h3-size: clamp(1.5rem, 3vw, 2rem);
--h3-weight: 600;
--h3-line-height: 1.3;

/* Body Text */
--body-large: 1.25rem;
--body-regular: 1rem;
--body-small: 0.875rem;

/* Feature Text */
--feature-title: clamp(1.75rem, 2.5vw, 2.25rem);
--feature-body: clamp(1rem, 1.2vw, 1.125rem);
```

### 2.3 Spacing & Layout System

```css
/* Container 시스템 */
--container-max: 1280px;
--container-padding: clamp(1rem, 5vw, 2rem);

/* Spacing Scale (8px 베이스) */
--space-xs: 0.5rem;   /* 8px */
--space-sm: 1rem;     /* 16px */
--space-md: 1.5rem;   /* 24px */
--space-lg: 2rem;     /* 32px */
--space-xl: 3rem;     /* 48px */
--space-2xl: 4rem;    /* 64px */
--space-3xl: 6rem;    /* 96px */

/* Grid 시스템 */
--grid-columns: 12;
--grid-gap: clamp(1.5rem, 3vw, 2rem);
```

---

## 🏗️ Phase 3: "핵심 기능" 영역 재설계

### 3.1 현재 문제점 분석
❌ 영어, 수학만 강조 (과학, 사회, 국어 누락)
❌ 정적인 카드 디자인
❌ AI 전문성 부족
❌ 인터랙션 제한적
❌ 모바일 최적화 부족

### 3.2 개선된 구조

#### 섹션 헤더
```jsx
<section id="features" className="py-20 bg-gradient-to-b from-white via-neutral-50 to-white relative overflow-hidden">
  {/* AI 배경 효과 */}
  <div className="absolute inset-0 opacity-30">
    <div className="ai-grid-pattern" />
    <div className="ai-glow-orbs" />
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
    {/* 헤더 */}
    <div className="text-center mb-16">
      <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full text-sm font-semibold text-primary-600 mb-4">
        ✨ AI-Powered Learning
      </span>

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
        <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
          5개 과목 통합
        </span>
        <br />
        <span className="text-neutral-900">차세대 학습 경험</span>
      </h2>

      <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
        영어, 수학, 과학, 사회, 국어를 AI 튜터와 함께 학습하세요.
        <br className="hidden sm:block" />
        실시간 피드백과 개인화된 학습 경로를 제공합니다.
      </p>
    </div>
```

#### 과목별 탭 네비게이션 (NEW)
```jsx
{/* 과목 필터 탭 */}
<div className="flex flex-wrap justify-center gap-3 mb-12">
  {['전체', '영어', '수학', '과학', '사회', '국어'].map((subject) => (
    <button
      key={subject}
      onClick={() => setActiveSubject(subject)}
      className={`
        px-6 py-3 rounded-full font-semibold transition-all duration-300
        ${activeSubject === subject
          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg scale-105'
          : 'bg-white text-neutral-600 hover:bg-neutral-100 hover:scale-105'
        }
      `}
    >
      {subject}
    </button>
  ))}
</div>
```

#### 향상된 Feature Cards (6개 → 8개)
```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Feature Card 1: 실시간 음성 대화 (영어) */}
  <div
    className="feature-card group"
    data-subject="english"
  >
    <div className="card-glow" />

    {/* 3D 아이콘 */}
    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-english-start to-english-end rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
        <span className="text-4xl">🎙️</span>
      </div>
      {/* AI 펄스 효과 */}
      <div className="absolute inset-0 rounded-2xl bg-english-gradient opacity-0 group-hover:opacity-20 animate-pulse" />
    </div>

    {/* 과목 태그 */}
    <span className="inline-block px-3 py-1 bg-english-gradient bg-opacity-10 rounded-full text-xs font-semibold text-english-600 mb-3">
      영어
    </span>

    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-english-600 transition-colors">
      실시간 음성 대화
    </h3>

    <p className="text-neutral-600 leading-relaxed mb-4">
      AI 튜터와 자연스러운 영어 대화를 나누세요. 저지연 음성 인식 기술로 실시간 발음 교정과 표현 피드백을 받을 수 있습니다.
    </p>

    {/* 기능 하이라이트 */}
    <ul className="space-y-2 text-sm text-neutral-500">
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>실시간 발음 분석</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>문맥 기반 표현 추천</span>
      </li>
    </ul>

    {/* Hover 시 CTA */}
    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href="/tutor/english" className="inline-flex items-center text-english-600 font-semibold hover:gap-3 transition-all">
        영어 튜터 시작하기
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>

  {/* Feature Card 2: 수학 문제 풀이 */}
  <div className="feature-card group" data-subject="math">
    <div className="card-glow" />

    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-math-start to-math-end rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
        <span className="text-4xl">📐</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-math-gradient opacity-0 group-hover:opacity-20 animate-pulse" />
    </div>

    <span className="inline-block px-3 py-1 bg-math-gradient bg-opacity-10 rounded-full text-xs font-semibold text-math-600 mb-3">
      수학
    </span>

    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-math-600 transition-colors">
      AI 수학 문제 풀이
    </h3>

    <p className="text-neutral-600 leading-relaxed mb-4">
      사진 촬영만으로 문제를 인식하고 단계별 풀이 과정을 제공합니다. 그래프, 도형, 함수를 시각화하여 개념을 쉽게 이해하세요.
    </p>

    <ul className="space-y-2 text-sm text-neutral-500">
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>손글씨 인식 OCR</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>인터랙티브 그래프</span>
      </li>
    </ul>

    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href="/tutor/math" className="inline-flex items-center text-math-600 font-semibold hover:gap-3 transition-all">
        수학 튜터 시작하기
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>

  {/* Feature Card 3: 과학 실험 시뮬레이션 (NEW) */}
  <div className="feature-card group" data-subject="science">
    <div className="card-glow" />

    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-science-start to-science-end rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
        <span className="text-4xl">🔬</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-science-gradient opacity-0 group-hover:opacity-20 animate-pulse" />
    </div>

    <span className="inline-block px-3 py-1 bg-science-gradient bg-opacity-10 rounded-full text-xs font-semibold text-science-600 mb-3">
      과학
    </span>

    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-science-600 transition-colors">
      과학 실험 시뮬레이션
    </h3>

    <p className="text-neutral-600 leading-relaxed mb-4">
      가상 실험실에서 물리, 화학, 생물 실험을 안전하게 수행하세요. 3D 시각화로 복잡한 과학 개념을 직관적으로 이해할 수 있습니다.
    </p>

    <ul className="space-y-2 text-sm text-neutral-500">
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>인터랙티브 3D 모델</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>가상 실험 환경</span>
      </li>
    </ul>

    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href="/tutor/science" className="inline-flex items-center text-science-600 font-semibold hover:gap-3 transition-all">
        과학 튜터 시작하기
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>

  {/* Feature Card 4: 사회 탐구 학습 (NEW) */}
  <div className="feature-card group" data-subject="social">
    <div className="card-glow" />

    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-social-start to-social-end rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
        <span className="text-4xl">🌍</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-social-gradient opacity-0 group-hover:opacity-20 animate-pulse" />
    </div>

    <span className="inline-block px-3 py-1 bg-social-gradient bg-opacity-10 rounded-full text-xs font-semibold text-social-600 mb-3">
      사회
    </span>

    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-social-600 transition-colors">
      사회 탐구 학습
    </h3>

    <p className="text-neutral-600 leading-relaxed mb-4">
      역사, 지리, 정치, 경제를 스토리텔링 방식으로 학습하세요. 인터랙티브 지도와 타임라인으로 세계를 이해합니다.
    </p>

    <ul className="space-y-2 text-sm text-neutral-500">
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>역사 타임라인</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>인터랙티브 지도</span>
      </li>
    </ul>

    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href="/tutor/social-studies" className="inline-flex items-center text-social-600 font-semibold hover:gap-3 transition-all">
        사회 튜터 시작하기
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>

  {/* Feature Card 5: 국어 독해 및 작문 (NEW) */}
  <div className="feature-card group" data-subject="korean">
    <div className="card-glow" />

    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-korean-start to-korean-end rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
        <span className="text-4xl">📚</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-korean-gradient opacity-0 group-hover:opacity-20 animate-pulse" />
    </div>

    <span className="inline-block px-3 py-1 bg-korean-gradient bg-opacity-10 rounded-full text-xs font-semibold text-korean-600 mb-3">
      국어
    </span>

    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-korean-600 transition-colors">
      국어 독해 및 작문
    </h3>

    <p className="text-neutral-600 leading-relaxed mb-4">
      한글 읽기, 쓰기, 문법, 문학을 체계적으로 학습하세요. AI가 맞춤법을 교정하고 논리적인 글쓰기를 도와드립니다.
    </p>

    <ul className="space-y-2 text-sm text-neutral-500">
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>맞춤법 자동 교정</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>작문 피드백</span>
      </li>
    </ul>

    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href="/tutor/korean" className="inline-flex items-center text-korean-600 font-semibold hover:gap-3 transition-all">
        국어 튜터 시작하기
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>

  {/* Feature Card 6: 학습 분석 리포트 */}
  <div className="feature-card group" data-subject="all">
    <div className="card-glow" />

    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
        <span className="text-4xl">📊</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 opacity-0 group-hover:opacity-20 animate-pulse" />
    </div>

    <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-400/10 to-emerald-600/10 rounded-full text-xs font-semibold text-green-700 mb-3">
      공통
    </span>

    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-green-600 transition-colors">
      AI 학습 분석 리포트
    </h3>

    <p className="text-neutral-600 leading-relaxed mb-4">
      일일, 주간, 월간 학습 데이터를 시각화하여 제공합니다. 강점과 약점을 파악하고 맞춤형 학습 계획을 수립하세요.
    </p>

    <ul className="space-y-2 text-sm text-neutral-500">
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>실시간 대시보드</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>성장 추이 분석</span>
      </li>
    </ul>

    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href="/learning-report" className="inline-flex items-center text-green-600 font-semibold hover:gap-3 transition-all">
        학습 리포트 보기
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>

  {/* Feature Card 7: 게이미피케이션 */}
  <div className="feature-card group" data-subject="all">
    <div className="card-glow" />

    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
        <span className="text-4xl">🏆</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 opacity-0 group-hover:opacity-20 animate-pulse" />
    </div>

    <span className="inline-block px-3 py-1 bg-gradient-to-r from-pink-400/10 to-rose-600/10 rounded-full text-xs font-semibold text-pink-700 mb-3">
      공통
    </span>

    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-pink-600 transition-colors">
      게이미피케이션 시스템
    </h3>

    <p className="text-neutral-600 leading-relaxed mb-4">
      레벨, 배지, 학습 스트릭으로 동기부여를 유지하세요. 목표를 달성하고 보상을 획득하며 성장하세요.
    </p>

    <ul className="space-y-2 text-sm text-neutral-500">
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>일일 퀘스트</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>업적 시스템</span>
      </li>
    </ul>

    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href="/dashboard#achievements" className="inline-flex items-center text-pink-600 font-semibold hover:gap-3 transition-all">
        업적 확인하기
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>

  {/* Feature Card 8: 24/7 즉각 피드백 */}
  <div className="feature-card group" data-subject="all">
    <div className="card-glow" />

    <div className="relative mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
        <span className="text-4xl">⚡</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 opacity-0 group-hover:opacity-20 animate-pulse" />
    </div>

    <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-400/10 to-amber-600/10 rounded-full text-xs font-semibold text-orange-700 mb-3">
      공통
    </span>

    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-orange-600 transition-colors">
      24/7 즉각 피드백
    </h3>

    <p className="text-neutral-600 leading-relaxed mb-4">
      언제 어디서나 AI 튜터에게 질문하고 즉시 답변을 받으세요. 시간과 장소에 구애받지 않는 학습이 가능합니다.
    </p>

    <ul className="space-y-2 text-sm text-neutral-500">
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>무제한 질문</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>실시간 응답</span>
      </li>
    </ul>

    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href="/dashboard" className="inline-flex items-center text-orange-600 font-semibold hover:gap-3 transition-all">
        지금 시작하기
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>
</div>
```

### 3.3 CSS/Animations

```css
/* Feature Card 스타일 */
.feature-card {
  @apply relative p-8 bg-white rounded-3xl transition-all duration-500;
  @apply hover:shadow-2xl hover:-translate-y-2;
  @apply border border-neutral-200/50;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  padding: 2px;
  background: linear-gradient(135deg, transparent, rgba(99, 102, 241, 0.1), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.5s;
}

.feature-card:hover::before {
  opacity: 1;
}

/* Glow Effect */
.card-glow {
  position: absolute;
  inset: -100%;
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.15), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.feature-card:hover .card-glow {
  opacity: 1;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
}

/* AI Grid Background */
.ai-grid-pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-float 20s linear infinite;
}

@keyframes grid-float {
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
}

/* AI Glow Orbs */
.ai-glow-orbs {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ai-glow-orbs::before,
.ai-glow-orbs::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.ai-glow-orbs::before {
  top: -150px;
  left: -150px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  animation: orb-float-1 15s ease-in-out infinite;
}

.ai-glow-orbs::after {
  bottom: -150px;
  right: -150px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  animation: orb-float-2 20s ease-in-out infinite;
}

@keyframes orb-float-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(100px, 100px); }
}

@keyframes orb-float-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-100px, -100px); }
}

/* 반응형 Grid */
@media (max-width: 768px) {
  .feature-card {
    @apply p-6;
  }
}
```

---

## 🚀 Phase 4: "사용 방법" 영역 재설계

### 4.1 현재 문제점 분석
❌ 단순한 3단계 설명
❌ 정적인 숫자 아이콘
❌ 인터랙션 없음
❌ 시각적 흐름 부족

### 4.2 개선된 구조 - 인터랙티브 스텝 플로우

```jsx
<section id="how-it-works" className="py-20 bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
  {/* Animated Background */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
    <div className="absolute top-0 right-1/4 w-64 h-64 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
    <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
    {/* Header */}
    <div className="text-center mb-20">
      <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full text-sm font-semibold text-primary-600 mb-4">
        🚀 Simple 3-Step Process
      </span>

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
        <span className="text-neutral-900">3단계로 시작하는</span>
        <br />
        <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
          스마트 학습 여정
        </span>
      </h2>

      <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
        복잡한 설정 없이 바로 시작하세요.
        <br className="hidden sm:block" />
        AI 튜터가 당신의 학습 수준에 맞춰 최적화된 경험을 제공합니다.
      </p>
    </div>

    {/* Interactive Timeline */}
    <div className="relative">
      {/* Connection Line */}
      <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 transform -translate-y-1/2 opacity-20" />

      <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
        {/* Step 1 */}
        <div className="step-card group relative">
          {/* Step Number with Animation */}
          <div className="relative mb-8 mx-auto w-fit">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
              <span className="text-4xl font-bold text-white">1</span>
            </div>

            {/* Animated Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-primary-500 opacity-0 group-hover:opacity-50 animate-ping" />

            {/* Particles */}
            <div className="absolute inset-0">
              <div className="particle particle-1" />
              <div className="particle particle-2" />
              <div className="particle particle-3" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-neutral-900 group-hover:text-primary-600 transition-colors">
              학교급 및 과목 선택
            </h3>

            <p className="text-neutral-600 text-lg mb-6 leading-relaxed">
              초등학교부터 대학교까지 학교급을 선택하고,
              <br className="hidden sm:block" />
              5개 과목(영어, 수학, 과학, 사회, 국어) 중 학습할 과목을 선택하세요.
            </p>

            {/* Visual Selector Preview */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {['초등', '중등', '고등', '대학'].map((grade) => (
                <span key={grade} className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {grade}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {['영어', '수학', '과학', '사회', '국어'].map((subject, idx) => (
                <span
                  key={subject}
                  className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm font-semibold hover:bg-primary-500 hover:text-white transition-colors cursor-pointer"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>

          {/* Arrow Connector (Desktop only) */}
          <div className="hidden lg:block absolute top-12 -right-8 text-primary-500 opacity-50">
            <svg className="w-16 h-16 animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>

        {/* Step 2 */}
        <div className="step-card group relative">
          <div className="relative mb-8 mx-auto w-fit">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
              <span className="text-4xl font-bold text-white">2</span>
            </div>

            <div className="absolute inset-0 rounded-full border-4 border-secondary-500 opacity-0 group-hover:opacity-50 animate-ping" />

            <div className="absolute inset-0">
              <div className="particle particle-1" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }} />
              <div className="particle particle-2" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }} />
              <div className="particle particle-3" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }} />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-neutral-900 group-hover:text-secondary-600 transition-colors">
              AI 튜터와 실시간 대화
            </h3>

            <p className="text-neutral-600 text-lg mb-6 leading-relaxed">
              음성 또는 채팅으로 자유롭게 질문하고,
              <br className="hidden sm:block" />
              AI 튜터의 맞춤형 설명과 즉각적인 피드백을 받으세요.
            </p>

            {/* Chat Bubble Animation */}
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] animate-slide-in-left">
                  <p className="text-sm text-neutral-700">이차방정식이 뭐예요?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] animate-slide-in-right">
                  <p className="text-sm">ax² + bx + c = 0 형태의 방정식이에요!</p>
                </div>
              </div>
            </div>

            {/* Input Methods */}
            <div className="flex justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="text-2xl">🎤</span>
                <span>음성</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="text-2xl">💬</span>
                <span>채팅</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="text-2xl">📸</span>
                <span>사진</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block absolute top-12 -right-8 text-secondary-500 opacity-50">
            <svg className="w-16 h-16 animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>

        {/* Step 3 */}
        <div className="step-card group relative">
          <div className="relative mb-8 mx-auto w-fit">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
              <span className="text-4xl font-bold text-white">3</span>
            </div>

            <div className="absolute inset-0 rounded-full border-4 border-accent-500 opacity-0 group-hover:opacity-50 animate-ping" />

            <div className="absolute inset-0">
              <div className="particle particle-1" style={{ background: 'linear-gradient(135deg, #ffa751, #ffe259)' }} />
              <div className="particle particle-2" style={{ background: 'linear-gradient(135deg, #ffa751, #ffe259)' }} />
              <div className="particle particle-3" style={{ background: 'linear-gradient(135deg, #ffa751, #ffe259)' }} />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-neutral-900 group-hover:text-accent-600 transition-colors">
              성장 확인 및 목표 설정
            </h3>

            <p className="text-neutral-600 text-lg mb-6 leading-relaxed">
              학습 리포트로 진도와 향상도를 확인하고,
              <br className="hidden sm:block" />
              AI가 추천하는 다음 학습 목표를 설정하세요.
            </p>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200/50">
                <div className="text-2xl font-bold text-green-600 mb-1">87%</div>
                <div className="text-xs text-green-700">정답률</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-200/50">
                <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                <div className="text-xs text-blue-700">연속일</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-200/50">
                <div className="text-2xl font-bold text-orange-600 mb-1">Lv.5</div>
                <div className="text-xs text-orange-700">레벨</div>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full border border-amber-200">
              <span className="text-2xl">🏆</span>
              <span className="text-sm font-semibold text-amber-800">새 배지 획득!</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* CTA Section */}
    <div className="text-center mt-16">
      <div className="inline-flex flex-col sm:flex-row gap-4">
        <Link
          href="/dashboard"
          className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl"
        >
          <span className="relative z-10 flex items-center gap-2">
            대시보드로 이동
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>

          {/* Animated Shine Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </Link>

        <Link
          href="/demo"
          className="inline-flex items-center justify-center px-10 py-5 bg-white text-primary-600 rounded-full font-bold text-lg border-2 border-primary-500 hover:bg-primary-50 transition-all hover:scale-105"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            데모 영상 보기
          </span>
        </Link>
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>무료 체험</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>신용카드 불필요</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>언제든지 취소</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 4.3 Animations & CSS

```css
/* Step Card */
.step-card {
  @apply transition-all duration-500;
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}

.step-card:nth-child(1) { animation-delay: 0.1s; }
.step-card:nth-child(2) { animation-delay: 0.3s; }
.step-card:nth-child(3) { animation-delay: 0.5s; }

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Particles */
.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  opacity: 0;
}

.group:hover .particle {
  animation: particle-burst 1s ease-out forwards;
}

.particle-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.particle-2 {
  top: 10%;
  right: 10%;
  animation-delay: 0.1s;
}

.particle-3 {
  bottom: 10%;
  left: 50%;
  animation-delay: 0.2s;
}

@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx, 50px), var(--ty, -50px)) scale(0);
  }
}

/* Blob Animation */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Horizontal Bounce */
@keyframes bounce-horizontal {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}

.animate-bounce-horizontal {
  animation: bounce-horizontal 2s infinite;
}

/* Slide Animations */
@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-left {
  animation: slide-in-left 0.5s ease-out forwards;
  animation-delay: 0.5s;
  opacity: 0;
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out forwards;
  animation-delay: 0.8s;
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .step-card {
    margin-bottom: 2rem;
  }
}
```

---

## 📱 Phase 5: 반응형 설계

### 5.1 Breakpoint 시스템

```css
/* Tailwind Breakpoints */
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large */
```

### 5.2 Mobile-First 전략

#### Features Grid
```jsx
{/* Mobile: 1 column */}
{/* Tablet: 2 columns */}
{/* Desktop: 4 columns */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

#### How It Works
```jsx
{/* Mobile: Stack vertically */}
{/* Tablet: Stack vertically */}
{/* Desktop: 3 columns */}
<div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
```

### 5.3 터치 최적화

```css
/* Touch Targets (최소 44px) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Hover States - Desktop Only */
@media (hover: hover) and (pointer: fine) {
  .hover\:scale-105:hover {
    transform: scale(1.05);
  }
}

/* Touch Feedback */
.active\:scale-95:active {
  transform: scale(0.95);
}
```

---

## 🎯 Phase 6: AI Park 차별화 포인트 시각화

### 6.1 AI 강조 섹션 (NEW)

```jsx
{/* AI Capabilities Showcase - Features 섹션 전에 삽입 */}
<section className="py-16 bg-neutral-900 text-white relative overflow-hidden">
  {/* Neural Network Background */}
  <div className="absolute inset-0 opacity-10">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="neural-net" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="2" fill="currentColor" />
          <line x1="50" y1="50" x2="0" y2="0" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#neural-net)" />
    </svg>
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
        <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          AI-Powered
        </span>
        <br />
        차세대 학습 기술
      </h2>
      <p className="text-lg text-neutral-300">
        Google Gemini 2.0 Flash와 Vertex AI 기반의 최첨단 AI 튜터링
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {/* AI Feature 1 */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-primary-500 transition-all">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-3">실시간 AI 분석</h3>
          <p className="text-neutral-400">
            Google Gemini 2.0 Flash 모델을 통한 즉각적인 문제 분석과 맞춤형 피드백 제공
          </p>
        </div>
      </div>

      {/* AI Feature 2 */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-secondary-500 transition-all">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-bold mb-3">적응형 학습 엔진</h3>
          <p className="text-neutral-400">
            학습 패턴을 분석하여 난이도와 진도를 자동으로 조절하는 지능형 시스템
          </p>
        </div>
      </div>

      {/* AI Feature 3 */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-accent-500 transition-all">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-xl font-bold mb-3">멀티모달 학습</h3>
          <p className="text-neutral-400">
            텍스트, 음성, 이미지, 비디오를 통합한 다감각 학습 경험 제공
          </p>
        </div>
      </div>
    </div>

    {/* Tech Stack */}
    <div className="mt-12 pt-8 border-t border-neutral-800">
      <p className="text-center text-sm text-neutral-500 mb-4">Powered by</p>
      <div className="flex flex-wrap justify-center items-center gap-6">
        <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <span className="text-sm font-semibold">Google Gemini 2.0 Flash</span>
        </div>
        <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <span className="text-sm font-semibold">Vertex AI</span>
        </div>
        <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <span className="text-sm font-semibold">Next.js 15</span>
        </div>
        <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <span className="text-sm font-semibold">React 19</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 📋 Phase 7: 단계별 구현 계획

### Week 1: 디자인 시스템 구축
**Day 1-2**: 컬러 시스템, 타이포그래피, Spacing 시스템 설정
- `tailwind.config.ts` 확장
- CSS 변수 정의
- 반응형 breakpoint 설정

**Day 3-4**: 공통 컴포넌트 개발
- FeatureCard 컴포넌트
- StepCard 컴포넌트
- AnimatedButton 컴포넌트
- GradientText 컴포넌트

**Day 5-7**: 애니메이션 라이브러리 구축
- Framer Motion 통합
- 커스텀 CSS 애니메이션
- Intersection Observer 설정
- Scroll-triggered animations

### Week 2: Features 섹션 재구현
**Day 1-2**: 구조 및 데이터 준비
- 5과목 Feature 데이터 구조화
- API 엔드포인트 확인
- 이미지/아이콘 최적화

**Day 3-4**: UI 구현
- 8개 Feature Cards
- 과목 필터 탭
- Hover/Touch 인터랙션

**Day 5-7**: 애니메이션 및 최적화
- Card entrance animations
- Glow effects
- Performance optimization
- Mobile 최적화

### Week 3: How It Works 섹션 재구현
**Day 1-2**: Interactive Timeline
- 3 Step 구조
- 연결선 애니메이션
- Number badge 효과

**Day 3-4**: 상세 콘텐츠
- Step 별 설명 및 비주얼
- Chat bubble animation
- Stats preview

**Day 5-7**: CTA 및 Trust Indicators
- Animated CTA buttons
- Trust badges
- A/B 테스트 준비

### Week 4: AI 차별화 섹션 및 최종 통합
**Day 1-2**: AI Capabilities Showcase
- Neural network background
- Tech stack visualization
- Feature highlights

**Day 3-4**: 전체 통합 및 테스트
- 섹션 간 스크롤 애니메이션
- 히어로 비디오와 통합
- Cross-browser 테스트

**Day 5-7**: 최적화 및 배포
- Lighthouse 최적화 (>90 점수)
- Accessibility audit (WCAG 2.1 AA)
- Production 배포
- 모니터링 설정

---

## 🎨 Phase 8: 디자인 에셋 및 리소스

### 8.1 아이콘 시스템
- **Lucide React**: 기본 아이콘 세트
- **Custom Animated Icons**: Lottie files for hero sections
- **3D Icons**: Three.js for premium feel

### 8.2 일러스트레이션
- **unDraw**: 무료 커스터마이징 일러스트
- **Storyset**: 애니메이션 일러스트
- **Blush**: 고품질 믹스 앤 매치

### 8.3 애니메이션 라이브러리
```bash
npm install framer-motion
npm install lottie-react
npm install @react-spring/web
```

---

## ✅ Phase 9: 성공 지표 (KPI)

### 9.1 기술 지표
- **Lighthouse Performance**: >90
- **Lighthouse Accessibility**: >95
- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Cumulative Layout Shift (CLS)**: <0.1

### 9.2 사용자 경험 지표
- **Engagement Rate**: Feature card hover 비율 >60%
- **Scroll Depth**: How It Works 섹션 도달률 >75%
- **CTA Click Rate**: 대시보드 버튼 클릭률 >15%
- **Mobile Bounce Rate**: <40%

### 9.3 비즈니스 지표
- **Conversion Rate**: 회원가입 전환율 >8%
- **Time on Page**: 평균 체류 시간 >3분
- **Return Visit Rate**: 재방문율 >30%

---

## 🔧 기술 스택 및 도구

### Frontend
- **Framework**: Next.js 15.5.6 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 3.4.1
- **Animations**: Framer Motion 11.x
- **Icons**: Lucide React 0.468.0
- **Forms**: React Hook Form 7.x

### Performance
- **Image Optimization**: Next/Image with Sharp
- **Code Splitting**: Dynamic imports
- **Bundle Analysis**: @next/bundle-analyzer
- **Caching**: SWR or React Query

### Testing
- **Unit**: Jest + React Testing Library
- **E2E**: Playwright
- **Visual**: Chromatic
- **Accessibility**: axe-core

### Deployment
- **Platform**: Vercel
- **CDN**: Vercel Edge Network
- **Analytics**: Vercel Analytics
- **Monitoring**: Sentry

---

## 📊 비교: Before vs After

### Before (현재)
- ❌ 2개 과목만 강조 (영어, 수학)
- ❌ 정적인 카드 디자인
- ❌ 제한적인 인터랙션
- ❌ AI 전문성 부족
- ❌ 단순한 3단계 설명
- ❌ 모바일 최적화 부족

### After (개선 후)
- ✅ 5개 과목 완전 통합 (영어, 수학, 과학, 사회, 국어)
- ✅ 3D 효과 + 그라데이션 카드
- ✅ Hover, Scroll 기반 인터랙션
- ✅ AI 기술 강조 섹션 추가
- ✅ 인터랙티브 타임라인
- ✅ Mobile-First 완벽 반응형

---

## 🚀 즉시 시작 가능한 Quick Wins

### Phase 1A: Immediate Improvements (1-2 days)
1. 5과목 컬러 시스템 추가
2. Feature Cards에 hover 효과
3. Typography 업그레이드
4. 과목 필터 탭 추가

### Phase 1B: Visual Enhancement (3-5 days)
1. 그라데이션 배경
2. AI glow 효과
3. Card entrance animations
4. Responsive grid 개선

---

## 📝 결론

이 계획서는 **전 세계 에듀테크 리더 벤치마킹**과 **2025 디자인 트렌드**를 기반으로, AI Park의 핵심 기능과 사용 방법 영역을 **차세대 학습 플랫폼 수준**으로 끌어올립니다.

**핵심 차별화 요소**:
1. 5과목 완전 통합
2. AI 전문성 시각화
3. 인터랙티브 경험
4. Mobile-First 설계
5. 접근성 최우선

이제 단계별로 구현을 시작하시겠습니까?
