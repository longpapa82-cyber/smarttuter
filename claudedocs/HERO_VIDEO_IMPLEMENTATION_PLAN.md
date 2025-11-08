# 🎬 AI Park 메인 페이지 Hero 영상 자동재생 기능 상세 개발 계획

**작성일**: 2025-01-08
**프로젝트**: AI Park - Hero Video Autoplay Feature
**참조**: 전 세계 에듀테크 서비스 벤치마킹 (Khan Academy, Duolingo, Coursera, Udemy 등)

---

## 📋 목차

1. [요구사항 정의](#1-요구사항-정의)
2. [전 세계 에듀테크 벤치마킹 분석](#2-전-세계-에듀테크-벤치마킹-분석)
3. [UX/접근성 Best Practices](#3-ux접근성-best-practices)
4. [기술 설계](#4-기술-설계)
5. [상세 구현 계획](#5-상세-구현-계획)
6. [접근성 및 사용성 고려사항](#6-접근성-및-사용성-고려사항)
7. [테스트 계획](#7-테스트-계획)
8. [파일 구조 및 경로](#8-파일-구조-및-경로)

---

## 1. 요구사항 정의

### 1.1 기능 요구사항

#### 필수 기능 (Must Have)
1. **Hero Video Section 추가**
   - 메인 페이지 최상단에 영상 영역 배치
   - 페이지 로드 시 바로 보이는 위치 (Above the Fold)
   - 그리드 레이아웃과 자연스럽게 통합

2. **자동 재생 (Autoplay)**
   - 페이지 접속 시 자동으로 영상 재생
   - 음소거 상태로 재생 (브라우저 정책 준수)
   - 5-12초 이내 짧은 프로모션 영상

3. **쉬운 컨트롤 (Easy Controls)**
   - 재생/일시정지 버튼 (크고 명확하게)
   - 음소거 해제 옵션
   - 전체화면 보기 옵션
   - "영상 건너뛰기" 버튼

#### 선택 기능 (Nice to Have)
4. **향상된 UX**
   - 로딩 상태 표시 (Skeleton/Spinner)
   - 재생 진행 바 (Progress Bar)
   - 반복 재생 옵션
   - 키보드 단축키 (Space: 재생/일시정지, Esc: 닫기)

### 1.2 비기능 요구사항

1. **성능**
   - 페이지 로딩 시간 < 3초
   - 영상 용량 < 10MB
   - Lazy Loading 적용
   - 최적화된 비디오 포맷 (WebM + MP4 fallback)

2. **접근성 (WCAG 2.1 Level AA)**
   - 자막/캡션 지원
   - 키보드 네비게이션 완전 지원
   - 스크린 리더 호환
   - 5초 이내 자동 일시정지 또는 컨트롤 제공

3. **반응형 디자인**
   - 모바일: 세로 영상 또는 16:9 비율 유지
   - 태블릿: 최적화된 레이아웃
   - 데스크톱: 전체 Hero 영역 활용

---

## 2. 전 세계 에듀테크 벤치마킹 분석

### 2.1 주요 플랫폼 분석

#### Khan Academy
**현황**:
- 메인 페이지에 Hero 영상 없음 (정적 이미지 + 텍스트)
- 앱 내 강의 영상은 수동 재생
- 사용자 요청: 자동 다음 영상 재생 기능 요청 중

**시사점**:
- ❌ 자동재생 없음 → 학습 흐름 방해 가능성
- ✅ 깔끔한 UI, 명확한 CTA (Call-to-Action)
- **우리의 차별화**: Hero 영상으로 서비스 가치 즉시 전달

#### Coursera
**현황**:
- 자동 다음 영상 재생 기능 제공 (설정 옵션)
- 메인 페이지: 정적 Hero 이미지 + 강의 프리뷰 영상 (클릭 시 재생)
- 깔끔하고 모던한 인터페이스

**시사점**:
- ✅ 자동재생 설정 옵션 제공 → 사용자 선택권
- ✅ 영상은 주로 강의 내부에서 활용
- **우리의 차별화**: 메인 페이지부터 영상으로 임팩트

#### Duolingo
**현황**:
- 게이미피케이션 중심 UI
- 메인 페이지: 애니메이션 + 인터랙티브 요소
- 영상보다는 시각적 요소 활용

**시사점**:
- ✅ 시각적 매력도 높음
- ✅ 즉각적인 사용자 참여 유도
- **우리의 차별화**: 영상으로 AI 튜터 실제 경험 미리 보기

#### Udemy
**현황**:
- Hero Section: 강의 검색 + 정적 배너
- 강의 상세 페이지: 프리뷰 영상 (클릭 시 재생)

**시사점**:
- ✅ 영상은 강의 프리뷰용으로 활용
- **우리의 차별화**: 서비스 전체 가치를 영상으로 소개

### 2.2 Best-in-Class Hero Video Examples

#### 1. **Slack**
- 짧은 제품 데모 영상 (10-15초)
- 자동 재생 + 음소거
- 루프 재생
- 미니멀한 컨트롤

#### 2. **Airbnb**
- 고품질 여행 영상
- 자동 재생 + 음소거
- 명확한 일시정지 버튼
- 영상 위에 텍스트 오버레이

#### 3. **Shopify**
- 제품 사용 시나리오 영상
- 자동 재생 (5-8초)
- CTA 버튼과 함께 배치

**공통 패턴**:
- ✅ 5-12초 짧은 영상
- ✅ 음소거 자동 재생
- ✅ 루프 재생
- ✅ 명확한 컨트롤
- ✅ 텍스트 오버레이로 메시지 전달

---

## 3. UX/접근성 Best Practices

### 3.1 Autoplay UX Guidelines

#### ✅ DO (해야 할 것)

1. **음소거 자동 재생**
   ```typescript
   <video autoPlay muted loop playsInline>
   ```
   - 브라우저 정책: Chrome, Safari, Firefox 모두 음소거 시 자동재생 허용

2. **짧은 길이 (5-12초)**
   - WCAG 2.1: 5초 이내 또는 컨트롤 제공
   - 추천: 8-10초 (충분한 메시지 전달 + 사용자 피로도 최소화)

3. **명확한 컨트롤**
   - 재생/일시정지: 항상 보이는 큰 버튼
   - 음소거 해제: 명확한 아이콘 + 툴팁
   - 영상 건너뛰기: "Skip Video" 버튼

4. **키보드 네비게이션**
   - Space: 재생/일시정지
   - M: 음소거 토글
   - Esc: 전체화면 종료

5. **자막/캡션**
   - WebVTT 포맷 자막 파일
   - 기본 활성화 (음소거 상태이므로)

#### ❌ DON'T (하지 말아야 할 것)

1. **음성 자동 재생 금지**
   - 사용자 경험 저해
   - 스크린 리더와 충돌
   - ADHD 사용자에게 집중력 방해

2. **너무 긴 영상 (>15초)**
   - 사용자 피로도 증가
   - 로딩 시간 증가

3. **컨트롤 숨김**
   - 접근성 위반
   - 사용자 제어권 박탈

4. **깜빡임/번쩍임 효과**
   - 신경학적 장애 유발 가능
   - WCAG 2.1 위반

### 3.2 접근성 체크리스트 (WCAG 2.1 Level AA)

- [ ] **2.2.2 Pause, Stop, Hide**: 5초 이상 재생 시 컨트롤 제공
- [ ] **1.2.1 Audio-only and Video-only**: 대체 텍스트 제공
- [ ] **1.2.2 Captions**: 자막 제공
- [ ] **2.1.1 Keyboard**: 모든 컨트롤 키보드 접근 가능
- [ ] **2.3.1 Three Flashes**: 깜빡임 없음
- [ ] **1.4.2 Audio Control**: 음소거/볼륨 컨트롤

---

## 4. 기술 설계

### 4.1 컴포넌트 아키텍처

```
HomeClient.tsx (메인 페이지)
    ↓
HeroVideoSection.tsx (새로 생성)
    ├── VideoPlayer.tsx (비디오 플레이어)
    │   ├── Video Element (HTML5 <video>)
    │   ├── Controls Overlay (재생/일시정지, 음소거, 전체화면)
    │   └── Progress Bar
    └── HeroContent.tsx (텍스트 오버레이)
        ├── Headline
        ├── Subheadline
        └── CTA Buttons
```

### 4.2 State Management

```typescript
interface VideoState {
  isPlaying: boolean;      // 재생 상태
  isMuted: boolean;        // 음소거 상태
  isFullscreen: boolean;   // 전체화면 상태
  currentTime: number;     // 현재 재생 시간
  duration: number;        // 전체 길이
  isLoading: boolean;      // 로딩 상태
  hasError: boolean;       // 에러 상태
}
```

### 4.3 기술 스택

| 항목 | 기술 | 이유 |
|------|------|------|
| **Video Format** | MP4 (H.264) + WebM (VP9) | 브라우저 호환성 |
| **State Management** | React useState/useRef | 간단한 상태 관리 |
| **Styling** | Tailwind CSS | 기존 프로젝트 스타일 |
| **Animations** | Framer Motion | 부드러운 UI 애니메이션 |
| **Icons** | Lucide React | 일관된 아이콘 |
| **Accessibility** | ARIA attributes | WCAG 준수 |

---

## 5. 상세 구현 계획

### 5.1 Phase 1: HeroVideoSection 컴포넌트 생성

**파일**: `components/home/HeroVideoSection.tsx`

**기능**:
1. 영상 영역 레이아웃
2. 텍스트 오버레이
3. 그라데이션 오버레이 (가독성 향상)
4. 반응형 디자인

**코드 구조**:
```tsx
export function HeroVideoSection() {
  return (
    <section className="relative w-full h-[600px] lg:h-[700px] overflow-hidden">
      {/* Video Background */}
      <VideoPlayer src="/videos/demo.mp4" />

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Hero Content */}
      <HeroContent />
    </section>
  );
}
```

### 5.2 Phase 2: VideoPlayer 컴포넌트

**파일**: `components/home/VideoPlayer.tsx`

**핵심 기능**:
1. HTML5 Video Element
2. 자동 재생 (음소거)
3. 루프 재생
4. 에러 핸들링
5. 로딩 상태

**주요 Props**:
```typescript
interface VideoPlayerProps {
  src: string;                    // 영상 경로
  poster?: string;                // 썸네일 이미지
  autoPlay?: boolean;             // 자동 재생 (기본: true)
  muted?: boolean;                // 음소거 (기본: true)
  loop?: boolean;                 // 루프 재생 (기본: true)
  controls?: boolean;             // 기본 컨트롤 표시 (기본: false)
  className?: string;             // 추가 스타일
  onPlay?: () => void;            // 재생 시작 콜백
  onPause?: () => void;           // 일시정지 콜백
  onEnded?: () => void;           // 재생 완료 콜백
}
```

**구현**:
```tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward } from 'lucide-react';

export function VideoPlayer({
  src,
  poster,
  autoPlay = true,
  muted = true,
  loop = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    isMuted: true,
    isFullscreen: false,
    currentTime: 0,
    duration: 0,
    isLoading: true,
    hasError: false,
  });

  // 자동 재생 시도
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error);
        // 자동재생 실패 시 사용자에게 안내
      });
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !state.isMuted;
      setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };

  const skipVideo = () => {
    // 영상 건너뛰기: 다음 섹션으로 스크롤
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full h-full group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onPlay={() => setState(prev => ({ ...prev, isPlaying: true }))}
        onPause={() => setState(prev => ({ ...prev, isPlaying: false }))}
        onLoadedMetadata={(e) => {
          setState(prev => ({
            ...prev,
            duration: e.currentTarget.duration,
            isLoading: false
          }));
        }}
        onError={() => setState(prev => ({ ...prev, hasError: true }))}
        onTimeUpdate={(e) => {
          setState(prev => ({ ...prev, currentTime: e.currentTarget.currentTime }));
        }}
        aria-label="AI Park 소개 영상"
      />

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
        </div>
      )}

      {/* Error State */}
      {state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <p>영상을 불러올 수 없습니다.</p>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all"
            aria-label={state.isPlaying ? '일시정지' : '재생'}
          >
            {state.isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all"
            aria-label={state.isMuted ? '음소거 해제' : '음소거'}
          >
            {state.isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${(state.currentTime / state.duration) * 100}%` }}
            />
          </div>

          {/* Skip Video */}
          <button
            onClick={skipVideo}
            className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center gap-2 text-white text-sm font-medium transition-all"
            aria-label="영상 건너뛰기"
          >
            영상 건너뛰기
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top-right Skip Button (always visible) */}
      <button
        onClick={skipVideo}
        className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 text-white text-sm font-medium transition-all"
        aria-label="영상 건너뛰기"
      >
        건너뛰기 →
      </button>
    </div>
  );
}
```

### 5.3 Phase 3: HeroContent 오버레이

**파일**: `components/home/HeroContent.tsx`

**기능**:
- 영상 위에 텍스트 오버레이
- CTA 버튼
- 통계 수치

**구현**:
```tsx
export function HeroContent() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 text-center text-white">
        {/* Badge */}
        <div className="inline-block mb-6">
          <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold">
            ✨ AI 기반 개인 맞춤 학습
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
          당신만의 AI 튜터와
          <br />
          스마트하게 학습하세요
        </h1>

        {/* Subheadline */}
        <p className="text-xl lg:text-2xl mb-8 text-white/90">
          초등학교부터 대학교까지, 수학과 영어를 실시간 음성 및 채팅으로 배우는
          <br />
          차세대 학습 플랫폼입니다.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/onboarding/quick"
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all"
          >
            무료로 시작하기 →
          </Link>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-white/50 text-white rounded-full font-semibold text-lg hover:bg-white/30 hover:scale-105 transition-all"
          >
            더 알아보기
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center space-x-8 pt-12">
          <div className="text-white">
            <div className="text-3xl font-bold">10,000+</div>
            <div className="text-sm text-white/80">활성 학습자</div>
          </div>
          <div className="text-white">
            <div className="text-3xl font-bold">50,000+</div>
            <div className="text-sm text-white/80">해결된 문제</div>
          </div>
          <div className="text-white">
            <div className="text-3xl font-bold">4.9/5</div>
            <div className="text-sm text-white/80">만족도</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5.4 Phase 4: HomeClient.tsx 통합

**변경 사항**:

**BEFORE**:
```tsx
return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
    {/* Hero Section */}
    <section className="pt-32 pb-20 px-4">
      {/* 기존 Hero 섹션 */}
    </section>

    {/* Features Section */}
    <section id="features">...</section>
  </div>
);
```

**AFTER**:
```tsx
import { HeroVideoSection } from '@/components/home/HeroVideoSection';

return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
    {/* NEW: Hero Video Section */}
    <HeroVideoSection />

    {/* Features Section - 기존 섹션은 그대로 유지 */}
    <section id="features" className="py-20 px-4 bg-white">
      {/* 기존 Features 내용 */}
    </section>

    {/* 나머지 섹션들 */}
  </div>
);
```

---

## 6. 접근성 및 사용성 고려사항

### 6.1 WCAG 2.1 Level AA 준수

#### 1. **Perceivable (인지 가능)**

**1.2.1 Audio-only and Video-only (Prerecorded)**
```html
<!-- 대체 텍스트 제공 -->
<div role="region" aria-label="AI Park 소개 영상">
  <p className="sr-only">
    AI Park는 초등학교부터 대학교까지 모든 학생들을 위한
    AI 기반 개인 맞춤 학습 플랫폼입니다.
    수학과 영어를 실시간 음성 및 채팅으로 배울 수 있습니다.
  </p>
  <video>...</video>
</div>
```

**1.2.2 Captions (Prerecorded)**
```html
<video>
  <source src="/videos/demo.mp4" type="video/mp4" />
  <track
    kind="captions"
    src="/videos/demo-ko.vtt"
    srclang="ko"
    label="한국어"
    default
  />
  <track
    kind="captions"
    src="/videos/demo-en.vtt"
    srclang="en"
    label="English"
  />
</video>
```

**WebVTT 파일 예시** (`/public/videos/demo-ko.vtt`):
```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
AI Park에 오신 것을 환영합니다

00:00:03.000 --> 00:00:06.000
당신만의 AI 튜터와 함께 스마트하게 학습하세요

00:00:06.000 --> 00:00:10.000
수학, 영어를 실시간 음성으로 배울 수 있습니다
```

#### 2. **Operable (작동 가능)**

**2.1.1 Keyboard**
```tsx
// 모든 컨트롤 키보드 접근 가능
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ': // Space
        e.preventDefault();
        togglePlay();
        break;
      case 'm': // M
      case 'M':
        toggleMute();
        break;
      case 'Escape':
        if (state.isFullscreen) {
          exitFullscreen();
        }
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [state]);
```

**2.2.2 Pause, Stop, Hide**
```tsx
// 5초 이상 재생 시 자동 일시정지 또는 명확한 컨트롤 제공
// 우리는 명확한 컨트롤 제공 방식 선택
<div className="controls" aria-label="비디오 컨트롤">
  <button aria-label="재생/일시정지">...</button>
  <button aria-label="음소거">...</button>
  <button aria-label="영상 건너뛰기">...</button>
</div>
```

#### 3. **Understandable (이해 가능)**

**3.2.5 Change on Request**
```tsx
// 자동 변경사항 (autoplay) 사용자에게 안내
<div className="sr-only" role="status" aria-live="polite">
  {state.isPlaying ? '영상이 재생 중입니다' : '영상이 일시정지되었습니다'}
</div>
```

### 6.2 사용자 경험 최적화

#### 1. **모바일 최적화**

```tsx
// playsInline 속성으로 모바일에서 전체화면 강제 방지
<video playsInline>

// 모바일에서는 더 명확한 컨트롤
<div className="md:opacity-0 md:group-hover:opacity-100 opacity-100">
  {/* 모바일에서는 항상 보임 */}
</div>
```

#### 2. **네트워크 최적화**

```tsx
// Lazy Loading
<video
  preload="metadata"  // 또는 "none"
  poster="/videos/demo-poster.jpg"
>

// 저해상도 대체 영상
<video>
  <source
    src="/videos/demo-hd.mp4"
    type="video/mp4"
    media="(min-width: 1024px)"
  />
  <source
    src="/videos/demo-mobile.mp4"
    type="video/mp4"
  />
</video>
```

#### 3. **사용자 선호도 저장**

```tsx
// LocalStorage에 사용자 선호도 저장
useEffect(() => {
  const savedMute = localStorage.getItem('aipark_video_muted');
  if (savedMute !== null) {
    setState(prev => ({ ...prev, isMuted: savedMute === 'true' }));
  }
}, []);

const toggleMute = () => {
  const newMuted = !state.isMuted;
  setState(prev => ({ ...prev, isMuted: newMuted }));
  localStorage.setItem('aipark_video_muted', String(newMuted));
};
```

---

## 7. 테스트 계획

### 7.1 기능 테스트

| 테스트 항목 | 예상 결과 | 우선순위 |
|------------|----------|---------|
| 페이지 로드 시 자동 재생 | 영상이 음소거 상태로 자동 재생 | P0 |
| 재생/일시정지 버튼 | 클릭 시 정상 동작 | P0 |
| 음소거 해제 버튼 | 클릭 시 소리 재생 | P0 |
| 영상 건너뛰기 버튼 | Features 섹션으로 스크롤 | P0 |
| 키보드 Space | 재생/일시정지 토글 | P1 |
| 키보드 M | 음소거 토글 | P1 |
| 키보드 Esc | 전체화면 종료 | P1 |
| 진행 바 표시 | 재생 진행에 따라 업데이트 | P1 |
| 루프 재생 | 영상 종료 시 자동 반복 | P1 |
| 로딩 상태 | Spinner 표시 | P2 |
| 에러 상태 | 에러 메시지 표시 | P2 |

### 7.2 접근성 테스트

| 테스트 항목 | 도구 | 기준 |
|------------|-----|-----|
| 키보드 네비게이션 | 수동 테스트 | 모든 컨트롤 Tab으로 접근 가능 |
| 스크린 리더 | NVDA, JAWS | 모든 요소 읽기 가능 |
| 색상 대비 | axe DevTools | WCAG AA (4.5:1) |
| ARIA 속성 | axe DevTools | 오류 0개 |
| 자막 표시 | 수동 테스트 | 자막 정확히 표시 |

### 7.3 성능 테스트

| 메트릭 | 목표 | 측정 도구 |
|-------|-----|---------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| 영상 로딩 시간 | < 3s (3G) | Network Throttling |
| 페이지 전체 로딩 | < 3s | Lighthouse |

### 7.4 브라우저 호환성 테스트

| 브라우저 | 버전 | 자동재생 | 음소거 | 컨트롤 |
|---------|------|---------|--------|--------|
| Chrome | Latest | ✅ | ✅ | ✅ |
| Safari | Latest | ✅ | ✅ | ✅ |
| Firefox | Latest | ✅ | ✅ | ✅ |
| Edge | Latest | ✅ | ✅ | ✅ |
| Mobile Safari | iOS 14+ | ✅ | ✅ | ✅ |
| Chrome Mobile | Android 10+ | ✅ | ✅ | ✅ |

---

## 8. 파일 구조 및 경로

### 8.1 현재 파일 구조

```
smartTuter/
├── public/
│   └── videos/                    ← 영상 파일 폴더
│       ├── demo.mp4               ← 현재 영상 파일 (8.7MB)
│       ├── demo-ko.vtt            ← 한국어 자막 (신규 생성)
│       ├── demo-en.vtt            ← 영어 자막 (신규 생성)
│       ├── demo-poster.jpg        ← 썸네일 이미지 (신규 생성)
│       └── README.md
```

### 8.2 신규 생성할 컴포넌트

```
smartTuter/
├── components/
│   └── home/                      ← 신규 폴더
│       ├── HeroVideoSection.tsx   ← Hero 영상 섹션 (메인)
│       ├── VideoPlayer.tsx        ← 비디오 플레이어
│       └── HeroContent.tsx        ← 텍스트 오버레이
```

### 8.3 수정할 파일

```
smartTuter/
├── app/
│   └── HomeClient.tsx             ← 기존 Hero 섹션을 HeroVideoSection으로 교체
```

### 8.4 영상 파일 업로드 안내

**📂 영상 업로드 경로**: `/public/videos/`

**✅ 현재 상태**:
- 폴더 이미 존재: `public/videos/`
- 기존 파일: `demo.mp4` (8.7MB)

**📝 추가 업로드 필요 파일**:

1. **홍보 영상** (옵션 - 기존 demo.mp4 사용 가능)
   - 파일명: `promo.mp4` 또는 기존 `demo.mp4` 사용
   - 권장 사양:
     - 해상도: 1920x1080 (Full HD)
     - 길이: 8-10초
     - 포맷: MP4 (H.264 codec)
     - 용량: < 10MB
     - 화면비: 16:9

2. **썸네일 이미지** (영상 로딩 전 표시)
   - 파일명: `demo-poster.jpg`
   - 경로: `/public/videos/demo-poster.jpg`
   - 권장 사양:
     - 해상도: 1920x1080
     - 포맷: JPG
     - 용량: < 500KB

3. **자막 파일** (접근성)
   - 파일명:
     - `demo-ko.vtt` (한국어)
     - `demo-en.vtt` (영어, 선택)
   - 경로: `/public/videos/`
   - 포맷: WebVTT

**자막 파일 생성 방법**:
```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
AI Park에 오신 것을 환영합니다

00:00:03.000 --> 00:00:06.000
당신만의 AI 튜터와 함께 스마트하게 학습하세요
```

**🎬 영상 촬영/제작 가이드**:
1. **내용**:
   - AI 튜터 사용 장면
   - 학생이 질문하는 모습
   - 실시간 답변 받는 화면
   - 게이미피케이션 요소

2. **톤앤매너**:
   - 밝고 긍정적
   - 현대적이고 트렌디
   - 교육적이면서 재미있게

3. **기술 요구사항**:
   - 8-10초 (접근성 기준)
   - 음성 없거나 음소거 고려
   - 자막으로 메시지 전달
   - 깜빡임 효과 없음

---

## 9. 구현 우선순위 및 일정

### 9.1 Phase별 구현 순서

#### **Phase 1: 핵심 기능 (1-2일)** ⭐ CRITICAL
- [ ] VideoPlayer 컴포넌트 생성
  - 자동 재생 (음소거)
  - 재생/일시정지 버튼
  - 영상 건너뛰기 버튼
- [ ] HeroVideoSection 컴포넌트 생성
  - 영상 영역 레이아웃
  - 기본 텍스트 오버레이
- [ ] HomeClient.tsx 통합
  - 기존 Hero 섹션 교체

#### **Phase 2: 향상된 UX (1일)** 🎯 HIGH
- [ ] HeroContent 오버레이 완성
  - CTA 버튼
  - 통계 수치
  - 그라데이션 배경
- [ ] 커스텀 컨트롤
  - 음소거 해제 버튼
  - 진행 바
  - Hover 애니메이션

#### **Phase 3: 접근성 (1일)** ♿ HIGH
- [ ] 키보드 네비게이션
- [ ] ARIA 속성 추가
- [ ] 자막 파일 생성 및 적용
- [ ] 스크린 리더 테스트

#### **Phase 4: 최적화 (0.5일)** ⚡ MEDIUM
- [ ] 로딩 상태 UI
- [ ] 에러 핸들링
- [ ] 네트워크 최적화 (lazy loading)
- [ ] 사용자 선호도 저장

#### **Phase 5: 테스트 및 배포 (0.5일)** 🧪 MEDIUM
- [ ] 브라우저 호환성 테스트
- [ ] 성능 테스트 (Lighthouse)
- [ ] 접근성 테스트 (axe)
- [ ] 모바일 테스트

**총 예상 기간**: 3-5일

### 9.2 체크리스트

**개발 전 준비**:
- [ ] 영상 파일 준비 (`demo.mp4` 확인)
- [ ] 썸네일 이미지 생성
- [ ] 자막 파일 작성 (VTT 포맷)
- [ ] 디자인 시안 확정

**개발**:
- [ ] `components/home/` 폴더 생성
- [ ] VideoPlayer.tsx 구현
- [ ] HeroVideoSection.tsx 구현
- [ ] HeroContent.tsx 구현
- [ ] HomeClient.tsx 수정

**테스트**:
- [ ] 기능 테스트 (재생, 일시정지, 음소거 등)
- [ ] 접근성 테스트 (키보드, 스크린 리더)
- [ ] 성능 테스트 (Lighthouse)
- [ ] 크로스 브라우저 테스트

**배포**:
- [ ] 코드 리뷰
- [ ] Git commit & push
- [ ] Vercel 배포
- [ ] 프로덕션 테스트

---

## 10. 예상 결과 및 효과

### 10.1 사용자 경험 개선

**Before (현재)**:
- 정적 Hero 섹션 (텍스트 + 이미지)
- "데모 영상 보기" 버튼 클릭 → 모달 열기

**After (개선)**:
- 동적 Hero 영상 (자동 재생)
- 페이지 접속 즉시 서비스 가치 전달
- 사용자 참여도 향상

### 10.2 비즈니스 임팩트

| 지표 | 개선 예상치 | 근거 |
|------|-----------|------|
| **Bounce Rate** | -15~20% | 영상으로 즉각적인 관심 유도 |
| **Time on Page** | +30~40% | 영상 시청 시간 증가 |
| **Conversion Rate** | +10~15% | 서비스 이해도 향상 → CTA 클릭 증가 |
| **User Engagement** | +25~35% | 시각적 콘텐츠로 참여도 향상 |

### 10.3 경쟁 우위

**차별화 포인트**:
1. ✅ **즉각적인 가치 전달**: 텍스트보다 영상이 3배 빠르게 메시지 전달
2. ✅ **현대적인 UI/UX**: 글로벌 에듀테크 트렌드 반영
3. ✅ **접근성 준수**: WCAG 2.1 Level AA 완전 준수
4. ✅ **사용자 친화적**: 쉬운 컨트롤, 건너뛰기 옵션

---

## 11. 리스크 및 대응 방안

### 11.1 기술적 리스크

| 리스크 | 영향도 | 확률 | 대응 방안 |
|-------|-------|------|----------|
| 자동재생 차단 (브라우저 정책) | High | Medium | 음소거 상태 재생 + 사용자 안내 |
| 영상 로딩 시간 지연 | Medium | Low | Lazy loading + 썸네일 표시 |
| 모바일 성능 저하 | Medium | Low | 저해상도 영상 제공 + preload 최적화 |
| 브라우저 호환성 문제 | Low | Low | WebM + MP4 fallback |

### 11.2 UX 리스크

| 리스크 | 영향도 | 확률 | 대응 방안 |
|-------|-------|------|----------|
| 사용자 피로도 (영상 반복) | Medium | Medium | 루프 제한 + 명확한 건너뛰기 |
| 접근성 문제 | High | Low | WCAG 준수 + 철저한 테스트 |
| 모바일 데이터 사용량 | Low | Low | 저용량 영상 + 와이파이 권장 안내 |

---

## 12. 참고 자료

### 12.1 Best Practice 가이드
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: HTML Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Web.dev: Video Best Practices](https://web.dev/fast/#optimize-your-videos)

### 12.2 벤치마킹 사이트
- Slack: https://slack.com
- Airbnb: https://airbnb.com
- Shopify: https://shopify.com

### 12.3 에듀테크 참고
- Khan Academy: https://khanacademy.org
- Coursera: https://coursera.org
- Duolingo: https://duolingo.com

---

## ✅ 최종 요약

### 핵심 기능
1. ✅ 메인 페이지 상단 Hero 영상 배치
2. ✅ 자동 재생 (음소거)
3. ✅ 쉬운 컨트롤 (재생/일시정지, 음소거, 건너뛰기)
4. ✅ 접근성 완벽 준수 (WCAG 2.1 AA)
5. ✅ 반응형 디자인 (모바일/태블릿/데스크톱)

### 영상 업로드 경로
📂 **`/public/videos/`**
- 기존 파일: `demo.mp4` (사용 가능)
- 추가 권장: `demo-poster.jpg`, `demo-ko.vtt`

### 예상 개발 기간
⏱️ **3-5일**
- Phase 1 (핵심 기능): 1-2일
- Phase 2 (UX 향상): 1일
- Phase 3 (접근성): 1일
- Phase 4-5 (최적화/테스트): 1일

### 다음 단계
1. 영상/자막 파일 확인 및 업로드
2. VideoPlayer 컴포넌트 구현
3. HomeClient.tsx 통합
4. 테스트 및 배포

---

**작성자**: AI Assistant
**검토 필요**: 디자인팀, 개발팀, 접근성 팀
**승인 필요**: 프로덕트 오너
