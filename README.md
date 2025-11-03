# 🎓 SmartTuter - AI-Powered Learning Platform

전 세계 학생들을 위한 차세대 AI 튜터링 플랫폼

[![Deploy Status](https://img.shields.io/badge/deploy-ready-brightgreen)](https://smarttuter-o7pl06ml2-090723s-projects.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204.5-orange)](https://www.anthropic.com/)

---

## 🌟 주요 특징

### 🎤 Phase 9: 연속 음성 인식 모드 (NEW!)
- **Hands-Free 음성 입력**: 버튼 없이 자동 음성 인식
- **실시간 Waveform 시각화**: 30개 바 애니메이션
- **자동 전송**: 2초 침묵 감지 시 자동 전송
- **실시간 전사 표시**: 말하는 내용 즉시 텍스트 변환

### 📊 Phase 8.5: 학습 리포트 시스템 (NEW!)
- **일별/주간 리포트**: 학습 시간, 세션 수, 성과 분석
- **강점/약점 분석**: AI 기반 학습 패턴 진단
- **맞춤 추천**: 개인화된 학습 경로 제안
- **Demo 데이터**: 신규 사용자를 위한 샘플 리포트

### ✨ Phase 8.2: 튜터 응답 품질 향상 (NEW!)
- **팩트 기반 답변**: 추측/불확실한 표현 금지 (30점)
- **학습 유도 시스템**: 오프토픽 질문 자동 감지 및 학습 전환 (25점)
- **친근한 톤**: 학년별 맞춤 이모지 및 언어 스타일 (20점)
- **긍정적 강화**: 격려 중심 피드백 시스템 (15점)
- **5-Metric 검증**: 실시간 응답 품질 자동 평가

### 🎯 Phase 8: 적응형 학습 시스템
- **실시간 난이도 조정**: Flow Theory 기반 70-85% 정확도 자동 유지
- **AI 학습 경로 생성**: 35개 지식 노드, 선행 학습 체인 검증
- **약점 진단 & 조기 경고**: 20개 위험 요인 모니터링
- **진도 분석 대시보드**: 히트맵, AI 예측, 강점/약점 시각화
- **연구 기반 설계**: Khan Academy, Duolingo, Century Tech 분석 적용

### 🏆 Phase 7: 게이미피케이션 시스템
- **XP & 레벨 시스템**: 지수 성장 곡선, 난이도 배수 (1.0x ~ 2.5x)
- **연속 학습일 스트릭**: 보호권 3개, 일일 보너스 50 XP
- **16개 업적 배지**: 참여도, 숙련도, 일관성 카테고리
- **주간/월간 통계**: 학습 시간, 세션 수, XP 획득
- **실시간 알림**: 레벨업 Confetti, 배지 달성 토스트

### 📚 학년별 맞춤 학습
- 초등학교 ~ 대학교까지 각 학교급에 최적화된 튜터링
- 학생 수준에 맞는 설명 및 예시 제공
- 학년별 맞춤 System Prompt 자동 생성

### 🤖 실시간 AI 튜터
- Google Gemini 2.0 Flash 기반 전문 AI 튜터
- 실시간 스트리밍 응답 (토큰 단위 생성)
- 소크라테스식 교수법 적용
- Grade-Level Guardrails (학년별 제약 조건)

### 📐 수학 & 🗣️ 영어 튜터
- 개념 설명 및 문제 풀이
- 자연스러운 대화 연습
- 한영 이중 언어 지원
- 이미지 기반 문제 풀이 (Vision API)

---

## 🚀 빠른 시작

### 로컬 개발 환경 설정

```bash
# 1. 클론 및 설치
git clone https://github.com/longpapa82-cyber/smarttuter.git
cd smarttuter
npm install

# 2. 환경 변수 설정
cp .env.example .env.local

# 3. 필수 환경 변수 입력 (.env.local 파일 수정)
# GEMINI_API_KEY=your_gemini_api_key_here
# NEXTAUTH_SECRET=your_nextauth_secret_here
# NEXTAUTH_URL=http://localhost:3000

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### Vercel 배포 (고정 URL 생성)

자세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)를 참고하세요.

```bash
# Vercel CLI 설치 및 배포
npm install -g vercel
vercel login
vercel --prod
```

**필수 환경 변수** (Vercel Project Settings에서 설정):
- `GEMINI_API_KEY`: [Google AI Studio](https://aistudio.google.com/apikey)에서 발급
- `NEXTAUTH_SECRET`: `openssl rand -base64 32`로 생성
- `NEXTAUTH_URL`: 배포된 도메인 (예: `https://your-app.vercel.app`)

배포 후 `https://your-app.vercel.app` 형태의 고정 URL이 생성됩니다.

---

## 📦 기술 스택

### Frontend
- **Next.js 15.5.6** (App Router) + React 19
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management

### AI & Backend
- **Google Gemini 2.0 Flash** - AI 튜터 엔진
- **NextAuth.js** - 인증 시스템
- **Web Speech API** - 음성 인식/합성
- **Upstash Redis** (Optional) - Response caching

### Deployment
- **Vercel** - Serverless deployment
- **ICN1** Region - Seoul-based servers

---

## 📈 개발 로드맵

✅ **Phase 1**: MVP 완성 (기본 튜터링 시스템)
✅ **Phase 2**: AI 스트리밍 강화 (실시간 응답)
✅ **Phase 3**: 음성 입력/TTS 기능 (영어 튜터)
✅ **Phase 4**: 음성 기능 확장 (수학 튜터)
✅ **Phase 5**: 학습 분석 시스템
✅ **Phase 6**: 이미지 기반 문제 풀이 (Vision API)
✅ **Phase 7**: 게이미피케이션 시스템 🎮
  - XP & 레벨 시스템
  - 연속 학습일 스트릭 추적
  - 16개 업적 배지
  - 주간/월간 통계 대시보드
  - 실시간 알림 (레벨업, 업적)
✅ **Phase 8**: 적응형 학습 시스템 🧠
  - 실시간 난이도 조정
  - AI 학습 경로 생성
  - 약점 진단 & 조기 경고
✅ **Phase 8.2**: 튜터 응답 품질 향상 ✨
  - 팩트 기반 답변 시스템
  - 학습 유도 자동화
  - 5-Metric 품질 검증
✅ **Phase 8.5**: 학습 리포트 시스템 📊
  - 일별/주간 리포트
  - 강점/약점 분석
  - AI 기반 추천
✅ **Phase 9**: 연속 음성 인식 모드 🎤
  - Hands-free 음성 입력
  - 실시간 waveform 시각화
  - 자동 침묵 감지 및 전송

### 향후 계획
🔜 **Phase 10**: 인터랙티브 퀴즈 시스템
🔜 **Phase 11**: 멀티모달 학습 (비디오, 오디오)
🔜 **Phase 12**: 소셜 학습 (친구와 함께 학습)

---

## 🔧 문제 해결

### 500 에러 또는 빈 화면이 보이는 경우

**원인**: 브라우저나 CDN에 이전 버전이 캐시되어 있을 수 있습니다.

**해결 방법**:

1. **하드 리프레시 (가장 빠름)**
   - Mac: `Cmd ⌘` + `Shift ⇧` + `R`
   - Windows/Linux: `Ctrl` + `Shift` + `R`

2. **브라우저 캐시 완전 삭제**
   - Chrome: DevTools (F12) > Application > Clear Storage > Clear site data
   - Safari: 환경설정 > 개인정보 보호 > 웹사이트 데이터 관리
   - Firefox: 환경설정 > 개인정보 및 보안 > 쿠키 및 사이트 데이터

3. **시크릿 모드에서 테스트**
   - 새 시크릿/프라이빗 창에서 열어보세요

4. **자동 복구 기능 사용**
   - 에러 페이지가 표시되면 2초 후 자동으로 복구를 시도합니다
   - "캐시 삭제 후 새로고침" 버튼을 클릭하세요

### 튜터 페이지 접근 시 온보딩으로 이동하는 경우

**정상 동작입니다!** 프로필이 없으면 자동으로 온보딩 페이지로 리디렉션됩니다.

**해결**: 온보딩을 완료하면 튜터 페이지에 접근할 수 있습니다.

### API 에러 (402, 503 등)

**원인**: Google Gemini API 할당량 초과 또는 일시적 서버 문제

**해결**:
- 429 Rate Limit: 약 1분 후 다시 시도 (무료 tier: 15 requests/minute)
- 500 Server Error: [Google AI Studio](https://aistudio.google.com/apikey)에서 API 키 확인
- 503 Service Unavailable: 잠시 후 다시 시도

### 환경 변수 설정 오류

**증상**: "API 키가 설정되지 않았습니다" 메시지

**해결**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. `GEMINI_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` 필수 변수 확인
3. 개발 서버 재시작: `npm run dev`

### 아이콘이 깨지거나 404 에러

**해결됨**: 최신 배포에서 모든 아이콘 파일이 포함되었습니다.
- 여전히 문제가 있다면 브라우저 캐시를 삭제하세요.

---

## 🧪 테스트

```bash
# E2E 테스트 실행
npm run test:e2e

# UI 모드로 테스트
npm run test:e2e:ui

# 디버그 모드
npm run test:e2e:debug
```

---

## 📚 추가 문서

- [**배포 가이드**](DEPLOYMENT_GUIDE.md) - Vercel 배포 상세 가이드
- [**연속 음성 모드**](claudedocs/continuous-voice-mode-implementation.md) - Hands-free 음성 인식 구현
- [**학습 리포트**](claudedocs/learning-report-feature.md) - 일별/주간 리포트 시스템
- [**응답 품질 개선**](claudedocs/tutor-response-quality-improvements.md) - AI 튜터 품질 향상

---

## 🌐 Live Demo

**Production URL**: https://smarttuter.vercel.app

> 💡 **무료 API 키 필요**: [Google AI Studio](https://aistudio.google.com/apikey)에서 무료 Gemini API 키를 발급받으세요.
>
> 🔄 **최신 버전**: 브라우저 캐시 이슈가 있다면 `Cmd+Shift+R` (Mac) 또는 `Ctrl+Shift+R` (Windows)로 하드 리프레시하세요.

---

## 📜 라이선스

MIT License - 자유롭게 사용하세요!

## 👨‍💻 개발자

Made with ❤️ by SmartTuter Team
