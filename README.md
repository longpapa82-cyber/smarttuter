# 🎓 SmartTuter - AI-Powered Learning Platform

전 세계 학생들을 위한 차세대 AI 튜터링 플랫폼

[![Deploy Status](https://img.shields.io/badge/deploy-ready-brightgreen)](https://smarttuter-o7pl06ml2-090723s-projects.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204.5-orange)](https://www.anthropic.com/)

---

## 🌟 주요 특징

### 🎯 Phase 8: 적응형 학습 시스템 (NEW!)
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

### 🤖 실시간 AI 튜터
- Claude Sonnet 4.5 기반 전문 AI 튜터
- 실시간 스트리밍 응답 (토큰 단위 생성)
- 소크라테스식 교수법 적용

### 📐 수학 & 🗣️ 영어 튜터
- 개념 설명 및 문제 풀이
- 자연스러운 대화 연습
- 한영 이중 언어 지원

---

## 🚀 빠른 시작

```bash
# 클론 및 설치
git clone https://github.com/longpapa82-cyber/smarttuter.git
cd smarttuter
npm install

# 환경 변수 설정
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 📦 기술 스택

- Next.js 15.5.6 + TypeScript
- Claude Sonnet 4.5 AI
- Tailwind CSS + Framer Motion
- Vercel Deployment

---

## 📈 로드맵

✅ Phase 1: MVP 완성
✅ Phase 2: AI 스트리밍 강화
✅ Phase 3: 음성 입력/TTS 기능 (영어 튜터)
✅ Phase 4: 음성 기능 확장 (수학 튜터)
✅ Phase 5: 학습 분석 시스템
✅ Phase 6: 이미지 기반 문제 풀이 (Vision API)
✅ **Phase 7: 게이미피케이션 시스템** 🎮
  - XP & 레벨 시스템
  - 연속 학습일 스트릭 추적
  - 16개 업적 배지
  - 주간/월간 통계 대시보드
  - 실시간 알림 (레벨업, 업적)
🎨 UI/UX: AI 아바타 개선 완료
🔧 Fix: SSE 스트리밍 응답 형식 통일
🔜 Phase 8: 적응형 학습 경로
🔜 Phase 9: 인터랙티브 퀴즈

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

**원인**: Anthropic API 크레딧 부족 또는 일시적 서버 문제

**해결**:
- 502 Payment Required: [Anthropic Console](https://console.anthropic.com/settings/billing)에서 크레딧 추가
- 503 Service Unavailable: 잠시 후 다시 시도

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

**Live Demo**: https://smarttuter.vercel.app

> ⚠️ **API 크레딧 필요**: 서비스를 사용하려면 [Anthropic Console](https://console.anthropic.com/settings/billing)에서 API 크레딧을 추가해주세요.
>
> **최신 버전**: 브라우저 캐시 이슈가 있다면 `Cmd+Shift+R` (Mac) 또는 `Ctrl+Shift+R` (Windows)로 하드 리프레시하세요.
