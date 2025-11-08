# 데모 영상 보기 기능 구현 계획

## 1. 조사 개요

### 1.1 전 세계 에듀테크 서비스 분석

**조사 대상 서비스**:
- **Khan Academy**: 개인화 학습 경로, Khanmigo AI 튜터
- **Duolingo**: 게이미피케이션, 마이크로러닝, VR 연습
- **Coursera**: 깔끔한 디자인, 개인화 추천, 진행도 추적
- **StudyFetch**: AI 튜터 Spark.e, 인터랙티브 학습
- **CogniSpark**: 스마트 퀴즈, 24/7 지원, 데모 예약 시스템
- **Mindgrasp**: AI 튜터, 자동 플래시카드, 퀴즈 생성

### 1.2 주요 발견 사항

#### UI/UX 트렌드 (2024)
1. **개인화 (Personalization)**: 학습자별 맞춤 경험
2. **게이미피케이션**: 배지, 스트릭, 진행도 바
3. **마이크로러닝**: 짧고 집중된 학습 세션
4. **몰입형 기술**: VR, 인터랙티브 요소
5. **접근성 우선**: 모든 연령과 능력 지원
6. **모바일 최적화**: 스마트폰 우선 디자인

#### 비디오 라이트박스 모범 사례 (2024)
1. **오버레이 효과**: 검은색 배경, 80% 불투명도
2. **모바일 최적화**: 스마트폰에서 완벽 작동
3. **쉬운 닫기**: X 버튼 + 배경 클릭
4. **인터랙티브 요소**: 자막, 챕터, 퀴즈 통합
5. **전략적 타이밍**: 사용자 행동 기반 표시
6. **접근성**: 키보드 네비게이션, 스크린 리더 지원
7. **성능**: 지연 로딩, 빠른 시작

#### AI 튜터 데모 패턴
1. **실시간 상호작용 표시**: 튜터와 학생 간 대화
2. **개인화된 학습 경로**: 적응형 질문
3. **즉각적인 피드백**: 단계별 설명
4. **게이미피케이션**: 진행도, 포인트, 배지
5. **반응형 디자인**: 모든 기기 지원
6. **인터랙티브 요소**: 퀴즈, 분기 내러티브

---

## 2. 권장 구현 방안

### 2.1 선택된 패턴: **모달 라이트박스 + 인터랙티브 요소**

**선택 이유**:
1. ✅ **사용자 친화적**: 현재 페이지를 벗어나지 않음
2. ✅ **집중도 향상**: 어두운 배경으로 비디오에 집중
3. ✅ **모바일 최적화**: 반응형 디자인 적용 가능
4. ✅ **인터랙티브**: 자막, 챕터, CTA 버튼 추가 가능
5. ✅ **에듀테크 표준**: Khan Academy, Coursera 등 사용
6. ✅ **접근성**: 키보드/스크린 리더 지원

**대안 분석**:
| 방식 | 장점 | 단점 | 결론 |
|------|------|------|------|
| **모달 라이트박스** | 집중도↑, UX 우수, 인터랙티브 | 구현 복잡도 중간 | ✅ **권장** |
| 인라인 비디오 | 구현 간단 | 집중도↓, 페이지 레이아웃 변경 | ❌ |
| 새 페이지 이동 | SEO 유리 | UX 저하, 이탈률↑ | ❌ |
| YouTube 임베드 | 간단, 안정적 | 커스터마이징↓, 광고 가능성 | △ (백업) |

---

## 3. 상세 구현 계획

### 3.1 컴포넌트 아키텍처

```
/components/demo/
  ├── VideoModal.tsx           # 메인 모달 컴포넌트
  ├── VideoPlayer.tsx          # HTML5 비디오 플레이어
  ├── VideoControls.tsx        # 커스텀 컨트롤 (재생/일시정지/음량/전체화면)
  ├── VideoChapters.tsx        # 챕터 네비게이션 (선택사항)
  ├── VideoTranscript.tsx      # 자막/스크립트 표시 (선택사항)
  └── VideoInteractive.tsx     # CTA 버튼, 퀴즈 등 (선택사항)
```

### 3.2 기술 스택

**핵심 기술**:
- **React + TypeScript**: 타입 안전성
- **Framer Motion**: 부드러운 애니메이션 (이미 프로젝트에 존재)
- **Tailwind CSS**: 반응형 스타일링 (이미 프로젝트에 존재)
- **HTML5 Video**: 네이티브 비디오 재생
- **React Portal**: 모달을 body에 마운트

**대안 라이브러리** (필요 시):
- **react-player**: YouTube/Vimeo 지원
- **video.js**: 고급 비디오 기능
- **plyr**: 경량 비디오 플레이어

### 3.3 데이터 구조

#### 비디오 메타데이터
```typescript
interface DemoVideo {
  id: string;
  title: string;
  description: string;
  url: string;              // 비디오 파일 URL
  thumbnail: string;        // 썸네일 이미지
  duration: number;         // 초 단위
  chapters?: Chapter[];     // 챕터 정보 (선택)
  transcript?: string;      // 자막/스크립트 (선택)
  ctaButton?: {
    text: string;
    action: string;         // '/onboarding/quick' 등
  };
}

interface Chapter {
  id: string;
  title: string;
  timestamp: number;        // 시작 시간 (초)
  thumbnail?: string;
}
```

### 3.4 UI/UX 디자인

#### 모달 레이아웃
```
┌─────────────────────────────────────────────┐
│  [X 닫기]                                    │
│  ┌───────────────────────────────────────┐ │
│  │                                        │ │
│  │         비디오 플레이어                 │ │
│  │       (16:9 또는 4:3 비율)              │ │
│  │                                        │ │
│  └───────────────────────────────────────┘ │
│                                              │
│  🎯 AI 튜터와 스마트 학습 시작하기            │
│  실시간 음성/채팅으로 수학과 영어를 배우세요   │
│                                              │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │ 무료로 시작하기 →│  │ 더 알아보기      │ │
│  └─────────────────┘  └──────────────────┘ │
│                                              │
│  📚 챕터 (선택사항)                          │
│  • 00:00 - 인트로                           │
│  • 00:30 - AI 튜터 소개                     │
│  • 01:00 - 실시간 학습 데모                 │
└─────────────────────────────────────────────┘
```

#### 모바일 레이아웃
```
┌───────────────────┐
│      [X 닫기]      │
│  ┌───────────────┐│
│  │               ││
│  │    비디오     ││
│  │   플레이어    ││
│  │               ││
│  └───────────────┘│
│                   │
│  제목 및 설명      │
│                   │
│  [무료 시작하기]   │
│  [더 알아보기]     │
│                   │
│  📚 챕터 (접힌 상태)│
└───────────────────┘
```

### 3.5 애니메이션 전략

**Framer Motion 활용**:
```typescript
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: { duration: 0.2 }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
```

### 3.6 접근성 (A11y)

**필수 구현 사항**:
1. **키보드 네비게이션**:
   - `Esc`: 모달 닫기
   - `Space` / `Enter`: 재생/일시정지
   - `←` / `→`: 10초 되감기/빨리감기
   - `↑` / `↓`: 음량 조절
   - `F`: 전체화면 토글

2. **ARIA 속성**:
   ```tsx
   <div
     role="dialog"
     aria-modal="true"
     aria-labelledby="video-title"
     aria-describedby="video-description"
   >
   ```

3. **스크린 리더**:
   - 비디오 제목 읽기
   - 현재 재생 시간 안내
   - 버튼 상태 안내 (재생 중/일시정지)

4. **자막/스크립트**:
   - WebVTT 자막 파일 지원
   - 스크립트 토글 버튼

### 3.7 성능 최적화

1. **지연 로딩**:
   - 모달이 열릴 때만 비디오 로드
   - 썸네일 이미지 최적화 (WebP)

2. **비디오 최적화**:
   - 다중 해상도 지원 (480p, 720p, 1080p)
   - 적응형 비트레이트 스트리밍 (HLS/DASH)
   - 프리로딩 전략: `preload="metadata"`

3. **번들 크기**:
   - 동적 임포트로 모달 코드 분리
   ```typescript
   const VideoModal = dynamic(() => import('@/components/demo/VideoModal'), {
     ssr: false,
     loading: () => <LoadingSpinner />
   });
   ```

4. **캐싱**:
   - 비디오 CDN 활용 (Vercel Blob, Cloudflare Stream)
   - 브라우저 캐싱 헤더 설정

---

## 4. 구현 단계별 계획

### Phase 1: 기본 모달 구현 (2-3시간)

**목표**: 비디오 재생이 가능한 기본 모달

1. **VideoModal 컴포넌트 생성**
   - Framer Motion으로 애니메이션
   - React Portal로 body에 마운트
   - 오버레이 클릭/ESC로 닫기

2. **VideoPlayer 컴포넌트**
   - HTML5 `<video>` 태그
   - 기본 컨트롤 활성화
   - 반응형 16:9 비율

3. **HomeClient.tsx 통합**
   - 버튼 클릭 핸들러 추가
   - 모달 상태 관리 (useState)

**예상 코드**:
```typescript
// HomeClient.tsx
const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

<button
  onClick={() => setIsVideoModalOpen(true)}
  className="..."
>
  데모 영상 보기 ▶
</button>

{isVideoModalOpen && (
  <VideoModal
    isOpen={isVideoModalOpen}
    onClose={() => setIsVideoModalOpen(false)}
    videoUrl="/videos/demo.mp4"
  />
)}
```

### Phase 2: 커스텀 컨트롤 및 인터랙티브 요소 (3-4시간)

**목표**: 브랜드에 맞는 커스텀 UI

1. **VideoControls 컴포넌트**
   - 재생/일시정지 버튼
   - 진행도 바 (시크바)
   - 음량 조절
   - 전체화면 버튼
   - 재생 속도 선택 (0.5x, 1x, 1.25x, 1.5x, 2x)

2. **인터랙티브 요소**
   - CTA 버튼 (비디오 하단)
   - 제목 및 설명 표시
   - 소셜 공유 버튼 (선택)

3. **스타일링**
   - 브랜드 그라데이션 적용
   - 호버 효과
   - 로딩 스피너

### Phase 3: 고급 기능 (선택사항, 4-6시간)

**목표**: 프리미엄 사용자 경험

1. **VideoChapters 컴포넌트**
   - 챕터 목록 표시
   - 클릭 시 해당 시간으로 이동
   - 현재 챕터 하이라이트

2. **VideoTranscript 컴포넌트**
   - 자막/스크립트 토글
   - 시간 동기화
   - 검색 기능

3. **분석 트래킹**
   - 비디오 재생 시작
   - 25%, 50%, 75%, 100% 시청 완료
   - CTA 버튼 클릭 추적

4. **다중 비디오 지원**
   - 비디오 선택 드롭다운
   - "영어 튜터 데모", "수학 튜터 데모" 등

### Phase 4: 최적화 및 테스트 (2-3시간)

1. **성능 최적화**
   - 동적 임포트
   - 이미지 최적화
   - 비디오 프리로딩 전략

2. **접근성 테스트**
   - 키보드 네비게이션 검증
   - 스크린 리더 테스트
   - WCAG 2.1 AA 준수 확인

3. **크로스 브라우저 테스트**
   - Chrome, Firefox, Safari, Edge
   - iOS Safari, Android Chrome
   - 폴백 처리 (비디오 포맷)

4. **사용자 테스트**
   - 모바일 UX 검증
   - 로딩 속도 측정
   - 피드백 수집

---

## 5. 비디오 호스팅 전략

### 5.1 권장 옵션

| 옵션 | 장점 | 단점 | 비용 | 권장도 |
|------|------|------|------|--------|
| **Vercel Blob** | Next.js 통합 우수, 간단 | 무료 한도 제한 | 무료: 100GB, 유료: $0.15/GB | ⭐⭐⭐⭐⭐ |
| **Cloudflare Stream** | 빠름, 안정적, 분석 제공 | 설정 필요 | $1/1000분 저장, $1/1000분 시청 | ⭐⭐⭐⭐ |
| **AWS S3 + CloudFront** | 확장성 우수, 저렴 | 설정 복잡 | 매우 저렴 (GB당 $0.023) | ⭐⭐⭐⭐ |
| **YouTube (비공개)** | 무료, 안정적 | 커스터마이징 제한, 광고 | 무료 | ⭐⭐⭐ |
| **Self-hosted (public/)** | 완전 제어 | 느림, 대역폭 비용 | Vercel 대역폭 한도 | ⭐⭐ |

### 5.2 권장 방안: **Vercel Blob**

**선택 이유**:
1. ✅ Next.js와 완벽 통합
2. ✅ 간단한 업로드 API
3. ✅ 자동 CDN 배포
4. ✅ 무료 100GB (데모 영상 충분)
5. ✅ 프로그래밍 방식 관리

**사용 예시**:
```typescript
// 비디오 업로드 (한 번만)
import { put } from '@vercel/blob';

const blob = await put('demo-video.mp4', file, {
  access: 'public',
});

console.log(blob.url);
// https://xxxxx.public.blob.vercel-storage.com/demo-video.mp4
```

**대안 (MVP 단계)**:
- YouTube 비공개 링크 사용
- `react-player`로 임베드
- 추후 Vercel Blob으로 마이그레이션

---

## 6. 예상 구현 코드 (MVP)

### 6.1 VideoModal.tsx (기본 버전)

```typescript
"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  description?: string;
  ctaButton?: {
    text: string;
    href: string;
  };
}

export function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title = "AI 튜터 데모 영상",
  description = "실시간 음성/채팅으로 수학과 영어를 배우는 과정을 확인하세요",
  ctaButton = { text: "무료로 시작하기 →", href: "/onboarding/quick" }
}: VideoModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // 스크롤 방지
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="video-title"
              aria-describedby="video-description"
            >
              {/* 닫기 버튼 */}
              <div className="flex justify-end p-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="모달 닫기"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* 비디오 플레이어 */}
              <div className="px-8 pb-6">
                <div className="relative w-full pb-[56.25%] bg-gray-900 rounded-2xl overflow-hidden">
                  <video
                    className="absolute inset-0 w-full h-full"
                    controls
                    autoPlay
                    preload="metadata"
                    poster="/images/video-thumbnail.jpg"
                  >
                    <source src={videoUrl} type="video/mp4" />
                    <track
                      kind="captions"
                      src="/captions/demo-ko.vtt"
                      srcLang="ko"
                      label="한국어"
                    />
                    브라우저가 비디오를 지원하지 않습니다.
                  </video>
                </div>
              </div>

              {/* 정보 섹션 */}
              <div className="px-8 pb-8 space-y-6">
                <div>
                  <h2
                    id="video-title"
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    {title}
                  </h2>
                  <p
                    id="video-description"
                    className="text-gray-600"
                  >
                    {description}
                  </p>
                </div>

                {/* CTA 버튼 */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={ctaButton.href}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-center hover:shadow-xl hover:scale-105 transition-all"
                  >
                    {ctaButton.text}
                  </a>
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:border-primary-500 hover:text-primary-600 transition-all"
                  >
                    나중에 보기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Portal로 body에 마운트
  return createPortal(modalContent, document.body);
}
```

### 6.2 HomeClient.tsx 수정

```typescript
// 상단에 추가
import { useState } from 'react';
import { VideoModal } from '@/components/demo/VideoModal';

export function HomeClient() {
  const { isAuthenticated, isLoading, navigateProtected } = useAuth();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // ... 기존 코드 ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* ... 기존 Hero Section ... */}

      {/* 데모 영상 보기 버튼 수정 */}
      <button
        onClick={() => setIsVideoModalOpen(true)}
        className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold text-lg hover:border-primary-500 hover:text-primary-600 transition-all text-center"
      >
        데모 영상 보기 ▶
      </button>

      {/* ... 나머지 섹션 ... */}

      {/* 비디오 모달 */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://your-video-url.mp4"
        title="AI 튜터와 스마트 학습 체험"
        description="실시간 음성/채팅으로 수학과 영어를 배우는 과정을 확인하세요"
        ctaButton={{
          text: "무료로 시작하기 →",
          href: "/onboarding/quick"
        }}
      />
    </div>
  );
}
```

---

## 7. 테스트 체크리스트

### 7.1 기능 테스트
- [ ] 버튼 클릭 시 모달 열림
- [ ] ESC 키로 모달 닫힘
- [ ] 오버레이 클릭 시 모달 닫힘
- [ ] 비디오 자동 재생
- [ ] 재생/일시정지 작동
- [ ] 음량 조절 작동
- [ ] 전체화면 작동
- [ ] CTA 버튼 클릭 시 올바른 페이지 이동

### 7.2 반응형 테스트
- [ ] 데스크톱 (1920x1080)
- [ ] 노트북 (1366x768)
- [ ] 태블릿 (768x1024)
- [ ] 모바일 (375x667, 414x896)
- [ ] 가로 모드 대응

### 7.3 브라우저 호환성
- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (최신)
- [ ] Edge (최신)
- [ ] iOS Safari
- [ ] Android Chrome

### 7.4 접근성 테스트
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 (NVDA/JAWS)
- [ ] 색상 대비 (WCAG AA)
- [ ] 포커스 표시
- [ ] ARIA 속성 검증

### 7.5 성능 테스트
- [ ] 초기 로딩 시간 < 3초
- [ ] 모달 열림 애니메이션 부드러움
- [ ] 비디오 버퍼링 최소화
- [ ] Lighthouse 점수 > 90

---

## 8. 예상 일정

### MVP (최소 기능 제품)
- **Phase 1**: 2-3시간
- **테스트 및 버그 수정**: 1시간
- **총 소요 시간**: 3-4시간

### 완전판 (모든 기능)
- **Phase 1**: 2-3시간
- **Phase 2**: 3-4시간
- **Phase 3**: 4-6시간 (선택)
- **Phase 4**: 2-3시간
- **총 소요 시간**: 11-16시간

### 권장 접근법
1. **1일차**: Phase 1 구현 (기본 모달)
2. **2일차**: Phase 2 구현 (커스텀 컨트롤)
3. **3일차**: 테스트 및 최적화
4. **4일차 이후**: Phase 3 (선택적 고급 기능)

---

## 9. 비용 예상

### 비디오 호스팅 (Vercel Blob)
- **무료 티어**: 100GB 저장, 100GB 대역폭/월
- **데모 영상 크기**: ~50MB (1080p, 2분)
- **월 예상 트래픽**: 1,000회 시청 = 50GB
- **비용**: **$0/월** (무료 한도 내)

### 개발 비용
- **개발자 시급**: $50 (가정)
- **MVP (4시간)**: $200
- **완전판 (16시간)**: $800

### 총 비용
- **MVP**: $200 (개발) + $0 (호스팅) = **$200**
- **완전판**: $800 (개발) + $0 (호스팅) = **$800**

---

## 10. 성공 지표 (KPI)

### 사용자 행동
- **비디오 시청률**: > 60% (버튼 클릭 → 재생)
- **완료율**: > 40% (75% 이상 시청)
- **CTA 클릭률**: > 20% (비디오 시청 → 회원가입)

### 기술 성능
- **로딩 시간**: < 3초
- **재생 버퍼링**: < 5%
- **모바일 UX**: Lighthouse 모바일 점수 > 85

### 비즈니스 임팩트
- **회원 전환율**: 비디오 시청자의 > 25%가 회원가입
- **이탈률 감소**: 데모 영상 추가 후 > 15% 감소

---

## 11. 위험 요소 및 대응 방안

### 위험 1: 비디오 로딩 느림
**대응**:
- 다중 해상도 제공 (480p, 720p, 1080p)
- CDN 활용 (Vercel Blob, Cloudflare)
- 프리로딩 최적화 (`preload="metadata"`)

### 위험 2: 모바일 UX 저하
**대응**:
- 모바일 우선 디자인
- 터치 제스처 지원
- 전체화면 자동 전환 (선택)

### 위험 3: 브라우저 호환성 문제
**대응**:
- 폴백 비디오 포맷 (WebM, MP4)
- YouTube 임베드 대안 준비
- 크로스 브라우저 테스트 자동화

### 위험 4: 접근성 미흡
**대응**:
- WCAG 2.1 AA 준수
- 키보드 네비게이션 필수 구현
- 자막/스크립트 제공

---

## 12. 다음 단계

### 즉시 실행
1. **비디오 준비**: 데모 영상 녹화 또는 기존 영상 확보
2. **MVP 개발**: Phase 1 (기본 모달) 구현
3. **테스트**: 주요 브라우저 및 모바일 검증

### 단기 (1주일 내)
4. **고급 기능**: Phase 2 (커스텀 컨트롤) 구현
5. **최적화**: 성능 및 접근성 개선
6. **분석 추가**: 비디오 시청 트래킹

### 중기 (1개월 내)
7. **다중 비디오**: 영어/수학 튜터 별도 데모
8. **A/B 테스트**: 모달 vs 인라인 vs 새 페이지
9. **사용자 피드백**: 개선 사항 수집 및 반영

---

## 13. 결론

### 권장 구현 방안 요약

**선택된 패턴**: 모달 라이트박스 + HTML5 비디오
**기술 스택**: React + Framer Motion + Tailwind CSS
**비디오 호스팅**: Vercel Blob
**우선순위**: MVP 먼저 구현 → 점진적 개선

### 주요 장점
1. ✅ **사용자 친화적**: 페이지 이탈 없이 시청
2. ✅ **모바일 최적화**: 반응형 디자인
3. ✅ **빠른 구현**: 3-4시간 (MVP)
4. ✅ **확장 가능**: 고급 기능 추가 용이
5. ✅ **비용 효율적**: 무료 호스팅 (Vercel Blob)

### 차별화 포인트
- **브랜드 일관성**: 그라데이션 및 디자인 시스템 유지
- **인터랙티브**: CTA 버튼으로 즉시 전환 유도
- **접근성**: 모든 사용자 지원 (키보드, 스크린 리더)
- **성능**: 빠른 로딩, 부드러운 애니메이션

---

**작성일**: 2025-11-08
**작성자**: AI Assistant (Claude)
**문서 버전**: 1.0
**다음 업데이트**: 구현 후 실제 데이터 반영
