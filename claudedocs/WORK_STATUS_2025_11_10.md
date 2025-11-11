# 작업 현황 (2025년 11월 10일)

## 오늘 완료한 작업

### 1. UI 텍스트 개선 ✅
**파일**: `components/math/MathHandwritingCanvas.tsx`

**변경 내용**:
- Line 557: "Gemini AI로 분석중..." → "AI 분석중..."
- Line 561: "대체 엔진으로 인식중..." → "AI 렌더링 중..."
- Line 691-693: 하단 안내 메시지도 동일하게 변경

**목적**: 사용자 친화적인 메시지로 개선

### 2. 학교급 선택 버그 수정 ✅
**파일**: `app/onboarding/quick/page.tsx`

**문제**: 로그인할 때마다 학교급 선택 페이지가 반복 표시됨

**해결**:
- Line 27-60: 프로필 체크 로직 추가
- 게스트 사용자: localStorage 확인
- 인증된 사용자: 서버 API (`/api/user/profile`) 확인
- 프로필이 있으면 자동으로 `/dashboard`로 리다이렉트

### 3. 프로덕션 배포 ✅
**작업 내용**:
- TypeScript 타입 체크 통과
- 빌드 테스트 완료 (67개 정적 페이지)
- Pix2Text 관련 미구현 파일 제거:
  - `app/api/ocr/pix2text/` 디렉토리 삭제
  - `scripts/test-integration.ts` 삭제
  - `.vercelignore`에 Pix2Text 관련 패턴 추가
- Vercel 프로덕션 배포 성공
- 도메인 alias 수동 연결: `aipark.vercel.app` → 최신 배포

**배포 URL**:
- 메인: https://aipark.vercel.app
- 최신: https://aipark-l2e1ganix-090723s-projects.vercel.app

### 4. 로컬 개발 환경 수정 ✅
**문제**: `/56t1js` 모듈 찾기 오류

**해결**:
- `.next` 캐시 삭제
- 개발 서버 재시작
- 정상 동작 확인 (`http://localhost:3000`)

---

## 다음 작업 (P1 우선순위)

### Phase 1: English Tutor 강화 (예상 2주)

#### 1.1 Tesseract.js 브라우저 OCR 통합 (14시간)
**목표**: 클라이언트 사이드 OCR로 빠른 텍스트 인식

**작업 항목**:
- [ ] Tesseract.js 설치 및 설정
- [ ] 영어 언어 데이터 추가
- [ ] `lib/ocr/tesseract-ocr-client.ts` 구현
- [ ] `components/english/EnglishHandwritingCanvas.tsx` 통합
- [ ] 인식 정확도 테스트 (목표: 85% 이상)

**파일**:
- 신규: `lib/ocr/tesseract-ocr-client.ts`
- 수정: `components/english/EnglishHandwritingCanvas.tsx`
- 수정: `lib/ocr/smart-ocr.ts` (fallback 체인 추가)

#### 1.2 발음 분석 개선 (16시간)
**목표**: Web Speech API + Google TTS 비교 분석

**작업 항목**:
- [ ] Google Cloud TTS API 통합
- [ ] 발음 점수 알고리즘 개선
- [ ] 음소별 피드백 시스템
- [ ] 시각적 피드백 UI 개선

**파일**:
- 신규: `lib/speech/google-tts.ts`
- 수정: `lib/speech/pronunciation-analyzer.ts`
- 수정: `components/pronunciation/PronunciationAnalyzer.tsx`

#### 1.3 역할극 시나리오 (20시간)
**목표**: 실전 회화 연습을 위한 대화 시나리오

**작업 항목**:
- [ ] 시나리오 데이터베이스 설계
- [ ] 레스토랑/공항/쇼핑 시나리오 작성 (각 10개)
- [ ] 대화 흐름 관리 시스템
- [ ] 평가 및 피드백 시스템
- [ ] UI/UX 디자인 및 구현

**파일**:
- 신규: `data/scenarios/` (시나리오 JSON 파일들)
- 신규: `lib/scenarios/scenario-manager.ts`
- 신규: `components/english/RolePlayDialog.tsx`
- 신규: `app/dashboard/english/roleplay/page.tsx`

---

### Phase 2: Math Tutor 강화 (예상 4주)

#### 2.1 Pix2Text Math OCR (18시간)
**목표**: 서버 사이드 고급 수식 인식

**작업 항목**:
- [ ] Python 환경 설정 (Vercel Functions)
- [ ] Pix2Text 설치 및 테스트
- [ ] API 라우트 구현 (`/api/ocr/pix2text`)
- [ ] LaTeX 파싱 및 렌더링
- [ ] 클라이언트 통합

**파일**:
- 복원: `app/api/ocr/pix2text/route.ts`
- 복원: `lib/ocr/pix2text-ocr.ts`
- 수정: `lib/ocr/smart-ocr.ts` (Pix2Text 우선순위 추가)
- 수정: `.vercelignore` (Pix2Text 제외 제거)

#### 2.2 단계별 풀이 시스템 (16시간)
**작업 항목**:
- [ ] 수학 문제 분석 AI 프롬프트
- [ ] 단계별 힌트 생성
- [ ] 진행도 트래킹
- [ ] UI 컴포넌트

**파일**:
- 신규: `lib/math/step-by-step-solver.ts`
- 신규: `components/math/StepBySteGuide.tsx`

#### 2.3 인터랙티브 Mafs 시각화 (24시간)
**작업 항목**:
- [ ] Mafs 라이브러리 통합 (이미 설치됨)
- [ ] 함수 그래프 시각화
- [ ] 기하학 도형 그리기
- [ ] 애니메이션 및 인터랙션
- [ ] 문제 유형별 시각화 템플릿

**파일**:
- 수정: `components/math/InteractiveMathGraph.tsx` (기존 파일 확장)
- 신규: `lib/math/graph-generator.ts`
- 신규: `components/math/GeometryVisualizer.tsx`

#### 2.4 오류 진단 AI (16시간)
**작업 항목**:
- [ ] 학생 답안 분석 AI
- [ ] 일반적인 실수 패턴 DB
- [ ] 맞춤형 피드백 생성
- [ ] 반복 실수 트래킹

**파일**:
- 신규: `lib/math/error-analyzer.ts`
- 신규: `data/math-error-patterns.json`
- 수정: `app/dashboard/math/tutor/page.tsx`

---

## 기술 부채 및 개선 사항

### 우선순위: 중간
- [ ] Prisma instrumentation 경고 해결
- [ ] Sentry 설정 최적화
- [ ] Web Vitals 성능 개선
- [ ] 테스트 커버리지 확대 (현재: E2E 테스트 인프라만 구축)

### 우선순위: 낮음
- [ ] PWA 오프라인 기능 개선
- [ ] Redis 캐싱 전략 최적화
- [ ] 이미지 최적화 (Next.js Image)

---

## 현재 프로젝트 상태

### 기술 스택
- **Frontend**: Next.js 15.5.6, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **OCR**: Gemini Vision API (운영 중), Tesseract.js (예정)
- **Speech**: Web Speech API, Google TTS (예정)
- **Math**: Mafs (설치됨), Pix2Text (예정)
- **Database**: Redis (인증, 캐싱)
- **Deployment**: Vercel

### 주요 기능 현황
- ✅ 사용자 인증 (Kakao, Google, GitHub)
- ✅ 온보딩 플로우
- ✅ 학교급/학년 설정
- ✅ 대시보드 (영어, 수학, 과학, 사회)
- ✅ 필기 인식 (수학 - Gemini Vision)
- ✅ 음성 인식 (영어 - Web Speech API)
- ✅ AI 튜터 (Gemini 2.0 Flash)
- ✅ 학습 리포트
- ✅ 진행도 트래킹
- ⏳ 고급 OCR (Pix2Text - 계획)
- ⏳ 역할극 시나리오 (계획)
- ⏳ 단계별 수학 풀이 (계획)

### 배포 상태
- **로컬**: http://localhost:3000 (정상 동작)
- **운영**: https://aipark.vercel.app (최신 배포 반영)
- **최근 배포**: 2025-11-10 14:06 (aipark-l2e1ganix)

---

## 다음 작업 시작 방법

### 명령어 예시:
```
"최근 작업에 이어서 진행해줘"
"P1-1.1 Tesseract.js 통합 작업을 시작해줘"
"영어 튜터 발음 분석 개선을 진행해줘"
```

### 작업 시작 전 확인사항:
1. Git 상태 확인 (`git status`)
2. 로컬 개발 서버 실행 여부
3. 환경 변수 설정 (`.env.local`)
4. 의존성 설치 (`npm install`)

---

## 중요 참고사항

### Vercel 배포 시 주의사항
- `.vercelignore`에 제외된 파일 확인
- 배포 후 도메인 alias 자동 연결 확인
- 배포 실패 시 로그 확인: `npx vercel inspect [deployment-url] --logs`

### 개발 환경 이슈 해결
- 모듈 오류 발생 시: `rm -rf .next && npm run dev`
- 포트 충돌 시: `lsof -ti:3000 | xargs kill -9`
- TypeScript 오류: `npx tsc --noEmit`

### Git Workflow
- 항상 `main` 브랜치에서 작업 중
- 중요 변경사항은 커밋 메시지에 명확히 기록
- 배포 전 빌드 테스트 필수

---

## 연락처 및 리소스

### 프로젝트 문서
- `/claudedocs/` - 모든 기획 및 기술 문서
- `/claudedocs/PHASE_*.md` - 단계별 개발 계획
- `/claudedocs/SERVICE_IMPROVEMENT_PLAN_2025_FREE.md` - 서비스 개선 계획

### API 키 위치
- `.env.local` (로컬)
- Vercel 환경 변수 (운영)

### 주요 문서
- `CLAUDE.md` - 프로젝트 개발 목표 및 요구사항
- `README.md` - 프로젝트 소개
- `package.json` - 의존성 및 스크립트

---

**마지막 업데이트**: 2025년 11월 10일 14:15 KST
**다음 우선순위**: P1-1.1 Tesseract.js 브라우저 OCR 통합
