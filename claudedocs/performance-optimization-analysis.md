# SmartTutor 성능 최적화 분석 및 계획

## 작성일
2025-11-01

## 현황 분석

### 프로젝트 상태
- **Phase**: 14 완료 (100%)
- **배포 준비**: 90% 완료
- **성능 최적화**: 진행 중

### 현재 설정 분석

#### ✅ 이미 적용된 최적화

**Next.js 설정** ([next.config.ts](file:///Users/hoonjaepark/projects/smartTuter/next.config.ts:1-128)):
```typescript
✅ compress: true                    // Gzip 압축 활성화
✅ poweredByHeader: false            // 보안 강화
✅ images.formats: ['avif', 'webp']  // 최신 이미지 포맷
✅ optimizePackageImports            // lucide-react, framer-motion
✅ outputFileTracingRoot             // 작은 배포 번들
✅ Cache-Control headers             // 정적 자산 캐싱
```

**의존성 크기**:
- `node_modules`: 1.2GB
- 이미지 파일: ~23KB (아이콘만)

#### ⚠️ 개선 필요 영역

1. **대용량 라이브러리 (4개)**
   - `@tensorflow/tfjs` (4.22.0) - 음성 인식
   - `three` (0.181.0) - 3D 시각화
   - `@sentry/nextjs` (10.22.0) - 에러 모니터링
   - `framer-motion` (12.23.24) - 애니메이션

2. **중복/미사용 SDK**
   - `@anthropic-ai/sdk` - 사용하지 않음 (Gemini 사용 중)
   - `openai` - 사용하지 않음

3. **번들 크기 미측정**
   - 현재 번들 분석 없음
   - 실제 로드 시간 미측정

## 최적화 전략

### Phase 1: 즉시 적용 (High Impact, Low Effort)

#### 1.1 미사용 의존성 제거
**목표**: 번들 크기 5-10% 감소

```bash
# 제거할 패키지
npm uninstall @anthropic-ai/sdk openai

# 예상 효과: ~50-100MB 감소
```

**영향받는 파일**: 없음 (이미 Gemini API 사용 중)

#### 1.2 Dynamic Imports 적용
**목표**: 초기 로딩 시간 30-40% 개선

**적용 대상**:
1. **TensorFlow** (음성 인식) - 사용 시에만 로드
   ```typescript
   // app/tutor/english/page.tsx
   const { SpeechCommandRecognizer } = await import('@tensorflow-models/speech-commands')
   ```

2. **Three.js** (3D 시각화) - 수학 시각화 페이지에서만
   ```typescript
   // app/math-visualization/page.tsx
   const THREE = await import('three')
   ```

3. **React Confetti** - 성취 달성 시에만
   ```typescript
   // components/gamification/AchievementPopup.tsx
   const Confetti = await import('react-confetti')
   ```

4. **KaTeX** (수식 렌더링) - 수학 튜터에서만
   ```typescript
   // components/tutor-pages/MathTutorClient.tsx
   const katex = await import('katex')
   ```

#### 1.3 optimizePackageImports 확장
**목표**: Tree-shaking 개선

```typescript
// next.config.ts
experimental: {
  optimizePackageImports: [
    'lucide-react',
    'framer-motion',
    'recharts',      // 추가
    'date-fns',      // 추가
    'd3',            // 추가
    'react-hot-toast' // 추가
  ],
}
```

### Phase 2: 코드 스플리팅 (Medium Impact, Medium Effort)

#### 2.1 Route-based Code Splitting
**자동 적용**: Next.js App Router가 자동으로 처리
**확인 필요**: 각 페이지가 독립적인 번들로 분리되는지

#### 2.2 Component-level Splitting
**적용 대상**:

1. **대시보드 차트 컴포넌트**
   ```typescript
   // app/dashboard/page.tsx
   const AnalyticsCard = dynamic(() => import('@/components/dashboard/AnalyticsCard'), {
     loading: () => <LoadingSkeleton />,
     ssr: false
   })
   ```

2. **수학 시각화 컴포넌트**
   ```typescript
   const InteractiveFunctionGraph = dynamic(
     () => import('@/components/math/InteractiveFunctionGraph'),
     { ssr: false }
   )
   ```

3. **감정 분석 컴포넌트**
   ```typescript
   const EmotionDetector = dynamic(
     () => import('@/components/emotion/EmotionDetector'),
     { ssr: false }
   )
   ```

### Phase 3: 성능 측정 및 모니터링 (High Priority)

#### 3.1 번들 분석 설정

**도구 설치**:
```bash
npm install --save-dev @next/bundle-analyzer
```

**설정**:
```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
```

**실행**:
```bash
ANALYZE=true npm run build
```

#### 3.2 Core Web Vitals 측정

**이미 구현됨**: `web-vitals` 패키지 설치됨

**확인 필요**:
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- FCP (First Contentful Paint) < 1.8s
- TTFB (Time to First Byte) < 600ms

#### 3.3 Lighthouse 감사

**목표 점수**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

**실행 방법**:
```bash
# Chrome DevTools
# F12 → Lighthouse 탭 → Analyze page load

# CLI (선택)
npx lighthouse https://your-deployment-url.vercel.app --view
```

### Phase 4: 고급 최적화 (Low Priority, High Effort)

#### 4.1 이미지 최적화
**현황**: 이미지 사용량 매우 적음 (아이콘만)
**우선순위**: Low (필요 시에만)

#### 4.2 폰트 최적화
**확인 필요**: 커스텀 폰트 사용 여부
**추천**: next/font 사용

#### 4.3 API Route 최적화
**고려사항**:
- Streaming responses for AI chat
- Edge Runtime for faster cold starts
- Redis caching for repeated queries

## 예상 성능 개선

### Before (현재 추정)
```
Initial Bundle Size: ~500-800KB (gzipped)
First Load JS: ~300-500KB
LCP: ~2-3s
FCP: ~1.5-2s
```

### After (Phase 1-2 완료 시)
```
Initial Bundle Size: ~300-400KB (gzipped, -40%)
First Load JS: ~150-250KB (-50%)
LCP: ~1.5-2s (-30%)
FCP: ~1-1.5s (-40%)
```

### Performance Score 예상
```
Current (추정): 70-80
After Phase 1-2: 85-92
After Phase 3: 90-95+
```

## 실행 계획

### ✅ 완료된 작업
- [x] 성능 최적화 계획 수립
- [x] 현황 분석 완료
- [x] Next.js 기본 최적화 확인

### 📋 다음 단계 (우선순위 순)

#### 즉시 실행 (오늘, 30분)
1. [ ] 미사용 의존성 제거 (`@anthropic-ai/sdk`, `openai`)
2. [ ] `package.json` 정리 및 재설치
3. [ ] Git commit

#### 단기 실행 (1-2일, 2-3시간)
4. [ ] Dynamic imports 적용 (TensorFlow, Three.js, React Confetti)
5. [ ] optimizePackageImports 확장
6. [ ] Component-level code splitting 적용
7. [ ] 번들 분석 도구 설치 및 실행
8. [ ] Git commit

#### 중기 실행 (1주일, 4-6시간)
9. [ ] Lighthouse 감사 실행
10. [ ] Core Web Vitals 측정 및 개선
11. [ ] 성능 모니터링 대시보드 설정
12. [ ] 최종 성능 보고서 작성

## 세부 구현 가이드

### 1. 미사용 의존성 제거

**파일**: `package.json`

```bash
# 1. 의존성 제거
npm uninstall @anthropic-ai/sdk openai

# 2. 사용하지 않는지 확인
grep -r "@anthropic-ai/sdk" app/ components/ lib/
grep -r "openai" app/ components/ lib/

# 3. 재설치 및 테스트
npm install
npm run build
```

**예상 결과**:
- `node_modules` 크기: 1.2GB → ~1.1GB (-100MB)
- 번들 크기: 영향 없음 (tree-shaking으로 이미 제외됨)

### 2. Dynamic Imports 구현

**파일**: `app/tutor/english/page.tsx` (예시)

```typescript
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Heavy library - load on demand
const SpeechCommandRecognizer = dynamic(
  () => import('@tensorflow-models/speech-commands').then(mod => mod.SpeechCommandRecognizer),
  {
    ssr: false,
    loading: () => <div>음성 인식 로딩 중...</div>
  }
)

export default function EnglishTutorPage() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  return (
    <div>
      {voiceEnabled && <SpeechCommandRecognizer />}
      <button onClick={() => setVoiceEnabled(true)}>
        음성 인식 시작
      </button>
    </div>
  )
}
```

**적용 파일 목록**:
1. `app/tutor/english/page.tsx` - TensorFlow
2. `app/math-visualization/page.tsx` - Three.js
3. `components/gamification/*` - React Confetti
4. `components/tutor-pages/MathTutorClient.tsx` - KaTeX

### 3. Bundle Analyzer 설정

**파일**: `next.config.ts`

```typescript
import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // ... existing config

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      'date-fns',
      'd3',
      'react-hot-toast'
    ],
  },
}

// Apply both Sentry and Bundle Analyzer
export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    // ... existing Sentry config
  }
)
```

**실행**:
```bash
# 번들 분석
ANALYZE=true npm run build

# 결과는 브라우저에서 자동으로 열림
# 각 페이지별 번들 크기와 의존성 트리 확인 가능
```

## 성능 측정 체크리스트

### Lighthouse 감사 항목
- [ ] Performance Score: 90+
- [ ] Accessibility Score: 95+
- [ ] Best Practices Score: 95+
- [ ] SEO Score: 100
- [ ] PWA (선택): 해당 없음

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] FCP < 1.8s
- [ ] TTFB < 600ms

### 번들 크기
- [ ] Initial Bundle < 400KB (gzipped)
- [ ] First Load JS < 250KB
- [ ] Largest Route < 500KB
- [ ] 사용하지 않는 코드 < 10%

## 리스크 및 주의사항

### 높은 리스크 (신중히 진행)
1. **TensorFlow Dynamic Import**
   - 음성 인식 첫 사용 시 로딩 지연 발생 가능
   - 해결: 백그라운드 prefetch 또는 명시적 로딩 UI

2. **Three.js Dynamic Import**
   - 3D 렌더링 초기화 지연
   - 해결: 페이지 진입 시 즉시 preload

3. **Sentry 번들 크기**
   - Sentry가 ~50-80KB 추가
   - 해결: Production only, tunnel route 사용

### 중간 리스크
1. **Code Splitting 과다**
   - 너무 많은 chunk는 오히려 성능 저하
   - 해결: 50KB 이상 컴포넌트만 split

2. **Dynamic Import SSR**
   - SSR이 필요한 컴포넌트는 dynamic import 불가
   - 해결: `ssr: false` 옵션 명시

### 낮은 리스크
1. **의존성 제거**
   - 미사용 패키지 제거는 안전
   - 확인: grep으로 사용 여부 확인 후 제거

## 모니터링 및 유지보수

### 지속적 모니터링
1. **Vercel Analytics**
   - Real User Monitoring (RUM)
   - Core Web Vitals tracking
   - 페이지별 성능 분석

2. **Sentry Performance**
   - Transaction monitoring
   - Database query performance
   - API response times

3. **정기 Lighthouse 감사**
   - 주 1회 자동 실행 (CI/CD)
   - 점수 하락 시 알림

### 성능 예산
```yaml
performance_budget:
  bundle_size:
    initial: 400KB  # gzipped
    per_route: 500KB

  core_web_vitals:
    lcp: 2.5s
    fid: 100ms
    cls: 0.1

  lighthouse_scores:
    performance: 90
    accessibility: 95
    best_practices: 95
    seo: 100
```

## 참고 자료

### Next.js 최적화
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

### Web Performance
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

### React 최적화
- [React Lazy Loading](https://react.dev/reference/react/lazy)
- [Code Splitting](https://react.dev/learn/render-and-commit#optimizing-performance)

---

**다음 액션**: 미사용 의존성 제거부터 시작

**예상 완료**: Phase 1-2 완료 시 성능 20-30% 개선

🤖 Generated with [Claude Code](https://claude.com/claude-code)
