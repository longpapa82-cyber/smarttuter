# SmartTuter - AI-Powered Learning Platform

> 🎓 AI 기반 개인 맞춤형 수학·영어 학습 튜터링 서비스

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 주요 기능

### ✅ 현재 이용 가능

- 🎙️ **실시간 AI 대화** - Claude AI 기반 자연스러운 대화형 학습
- 📐 **수학 수식 렌더링** - KaTeX를 활용한 수학 수식 완벽 지원
- 🗣️ **영어 회화 연습** - 실시간 대화로 영어 실력 향상
- 📊 **학습 분석 리포트** - 일일/주간 성과 분석 및 맞춤 추천
- 🎯 **맞춤형 튜터링** - 학교급(초/중/고/대)별 최적화된 학습
- 📱 **완전 반응형** - 모바일, 태블릿, 데스크톱 모두 지원
- ⚡ **실시간 피드백** - 24/7 즉각적인 학습 지원

### 🚧 개발 예정 (Phase 2+)

- 🎤 실시간 음성 대화 (WebRTC + LiveKit)
- 🎮 게이미피케이션 (레벨, 배지, 스트릭)
- 📝 오답 노트 & 문제 은행
- 👥 사용자 인증 & 프로필 관리

---

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn
- [Anthropic API 키](https://console.anthropic.com/) (필수)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/yourusername/smarttuter.git
cd smarttuter

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 ANTHROPIC_API_KEY를 설정하세요

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요!

### API 키 설정

`.env.local` 파일에 다음을 추가:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

[Anthropic Console](https://console.anthropic.com)에서 무료 API 키를 발급받을 수 있습니다.

---

## 📁 프로젝트 구조

```
smartTuter/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # 랜딩 페이지
│   ├── layout.tsx               # 루트 레이아웃 + SEO
│   ├── not-found.tsx            # 404 페이지
│   ├── error.tsx                # 500 페이지
│   ├── onboarding/              # 온보딩 플로우
│   │   └── page.tsx            # 학교급/과목 선택
│   ├── tutor/                   # 튜터 페이지
│   │   ├── math/page.tsx       # 수학 튜터
│   │   └── english/page.tsx    # 영어 튜터
│   ├── report/                  # 학습 리포트
│   │   └── page.tsx            # 일일/주간 분석
│   └── api/chat/                # API 엔드포인트
│       ├── math/route.ts       # 수학 AI API
│       └── english/route.ts    # 영어 AI API
├── components/                  # 재사용 컴포넌트
│   ├── ui/                     # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── MobileMenu.tsx
│   ├── chat/                   # 채팅 컴포넌트
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── MathRenderer.tsx   # KaTeX 수식 렌더링
│   └── report/                 # 리포트 컴포넌트
│       ├── WeeklyChart.tsx    # 주간 차트
│       └── PerformanceGauge.tsx
├── lib/                        # 유틸리티 함수
│   └── utils/
│       └── learningData.ts    # 학습 데이터 관리
├── public/                     # 정적 파일
└── docs/                       # 문서
    ├── DEPLOYMENT.md          # 배포 가이드
    ├── PROGRESS.md            # 개발 진행 상황
    └── PHASE1_COMPLETE.md     # Phase 1 완료 보고서
```

---

## 🛠️ 기술 스택

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React 프레임워크 (App Router)
- **[TypeScript](https://www.typescriptlang.org/)** - 타입 안전성
- **[Tailwind CSS](https://tailwindcss.com/)** - 유틸리티 CSS 프레임워크
- **[Framer Motion](https://www.framer.com/motion/)** - 애니메이션 라이브러리
- **[Lucide React](https://lucide.dev/)** - 아이콘 세트
- **[KaTeX](https://katex.org/)** - 수학 수식 렌더링

### Backend & AI
- **[Anthropic Claude API](https://www.anthropic.com/)** - AI 튜터링 (Sonnet 4.5)
- **[Vercel Edge Functions](https://vercel.com/docs/functions)** - 서버리스 API

### 데이터 시각화
- **[Recharts](https://recharts.org/)** - 학습 분석 차트 라이브러리

### 배포 & 호스팅
- **[Vercel](https://vercel.com/)** - 프로덕션 호스팅 (권장)

---

## 📊 현재 개발 상태

### Phase 1: MVP (✅ 완료 - 100%)

- ✅ 프로젝트 초기 설정 및 디자인 시스템
- ✅ 랜딩 페이지 (애니메이션, 반응형)
- ✅ 온보딩 플로우 (학교급/과목 선택)
- ✅ 수학 튜터 (AI 채팅 + 수식 렌더링)
- ✅ 영어 튜터 (AI 대화 + 음성 UI)
- ✅ 학습 리포트 (일일/주간 분석, 차트, 게이지)
- ✅ 에러 페이지 (404/500)
- ✅ SEO 최적화 (메타 태그, sitemap, robots.txt)
- ✅ 모바일 반응형 디자인
- ✅ 배포 준비 (Vercel 설정)

**진행률**: Phase 1 완료 (7/7 페이지, 13개 컴포넌트)

### Phase 2: 음성 기능 (예정)
- ⏳ WebRTC + LiveKit 설정
- ⏳ Speech-to-Text 통합
- ⏳ Text-to-Speech 통합
- ⏳ 실시간 음성 대화
- ⏳ 발음 평가 기능

### Phase 3: 고급 기능 (예정)
- ⏳ 게이미피케이션 (레벨, 배지, 스트릭)
- ⏳ 맞춤형 학습 경로 알고리즘
- ⏳ 문제 은행 시스템
- ⏳ 오답 노트
- ⏳ 사용자 인증 (NextAuth.js)

---

## 🎨 디자인 시스템

### 컬러 팔레트

- **Primary (Indigo)**: `#6366f1` - 신뢰감, 기술
- **Secondary (Purple)**: `#8b5cf6` - 창의성, 학습
- **Accent (Cyan)**: `#06b6d4` - 활력, 인터랙션

### 핵심 원칙

- ✨ 최신 AI 서비스 느낌의 그라데이션
- 🎯 직관적이고 사용자 친화적인 인터페이스
- 📱 모바일 우선 반응형 디자인
- 🎭 부드러운 애니메이션과 트랜지션

---

## 📝 사용 방법

### 1. 온보딩

1. 랜딩 페이지에서 "시작하기" 클릭
2. 학교급 선택 (초/중/고/대)
3. 과목 선택 (수학 또는 영어)
4. "학습 시작하기" 클릭

### 2. 학습하기

**수학 튜터:**
```
질문 예시:
- "이차방정식이 뭐야?"
- "$x^2 + 5x + 6 = 0$을 풀어줘"
- "미분의 기본 개념을 설명해줘"
```

**영어 튜터:**
```
질문 예시:
- "Hello, how are you?"
- "현재완료 시제를 설명해줘"
- "Let's talk about movies"
```

### 3. 리포트 확인

- 상단 차트 아이콘 클릭
- 일일/주간 리포트 전환
- 강점, 개선 영역, 추천사항 확인

---

## 🚢 배포하기

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

### Vercel 빠른 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

환경 변수를 잊지 마세요:
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## 🧪 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 린팅
npm run lint

# 타입 체크
npm run type-check
```

---

## 📈 성능 지표

### Lighthouse 점수 목표

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 사용합니다:

- [Next.js](https://nextjs.org/) - The React Framework
- [Anthropic Claude](https://www.anthropic.com/) - AI Assistant
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Framer Motion](https://www.framer.com/motion/) - Animation Library
- [KaTeX](https://katex.org/) - Math Typesetting
- [Recharts](https://recharts.org/) - Chart Library

---

## 📞 문의 및 지원

- 📧 Email: support@smarttuter.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/smarttuter/issues)
- 📖 문서: [Documentation](./docs)

---

## 🎯 로드맵

### 2025 Q1
- ✅ Phase 1 MVP 완료
- 🔄 Vercel 프로덕션 배포
- 🔄 사용자 피드백 수집

### 2025 Q2
- ⏳ Phase 2: 실시간 음성 대화
- ⏳ 모바일 앱 (React Native)
- ⏳ 다국어 지원 (영어, 일본어)

### 2025 Q3
- ⏳ Phase 3: 게이미피케이션
- ⏳ 소셜 기능 (친구, 랭킹)
- ⏳ 프리미엄 구독 모델

---

<div align="center">

**Made with ❤️ by SmartTuter Team**

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!

[🌐 라이브 데모](https://smarttuter.vercel.app) · [📖 문서](./docs) · [🐛 버그 리포트](https://github.com/yourusername/smarttuter/issues)

</div>
