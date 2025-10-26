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

**Live Demo**: https://smarttuter-3mkfea3h2-090723s-projects.vercel.app

> ⚠️ **API 크레딧 필요**: 현재 Anthropic API 크레딧이 부족합니다. 서비스를 사용하려면 [Anthropic Console](https://console.anthropic.com/settings/billing)에서 크레딧을 추가해주세요.
>
> **브라우저 캐시**: 최신 버전을 확인하려면 브라우저 캐시를 지우세요 (Ctrl+Shift+R 또는 Cmd+Shift+R)
