# SmartTuter 배포 체크리스트

## ✅ Phase 1 완료 상태

### 개발 완료 항목
- [x] Next.js 15 프로젝트 초기화
- [x] TypeScript + Tailwind CSS 설정
- [x] 랜딩 페이지 (애니메이션, 반응형)
- [x] 온보딩 플로우 (학교급/과목 선택)
- [x] 수학 튜터 (AI 채팅 + KaTeX 수식 렌더링)
- [x] 영어 튜터 (AI 대화 인터페이스)
- [x] 학습 리포트 (일일/주간 분석, 차트, 게이지)
- [x] 모바일 반응형 디자인 + 햄버거 메뉴
- [x] 404/500 에러 페이지
- [x] SEO 최적화 (sitemap, robots, metadata)
- [x] Vercel 배포 설정 파일
- [x] 전체 문서화 (README, DEPLOYMENT, PROGRESS)
- [x] Git 저장소 초기화 및 커밋

### 파일 구조 검증
```
✅ 총 39개 파일 커밋 완료
✅ 7개 페이지 (/, /onboarding, /tutor/math, /tutor/english, /report, /404, /500)
✅ 13개 컴포넌트 (UI 5개, Chat 3개, Report 2개, Layout 3개)
✅ 2개 API 엔드포인트 (/api/chat/math, /api/chat/english)
```

---

## 🚀 Vercel 배포 단계

### 1단계: 환경 변수 준비

**필수 환경 변수**:
- `ANTHROPIC_API_KEY` - Claude API 키 ([발급받기](https://console.anthropic.com))
- `NEXT_PUBLIC_APP_URL` - 배포 후 URL (예: https://smarttuter.vercel.app)

**API 키 발급 방법**:
1. [Anthropic Console](https://console.anthropic.com) 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 키를 안전한 곳에 복사 (다시 볼 수 없음)

### 2단계: GitHub 저장소 연결

**옵션 A: GitHub Desktop 사용** (초보자 권장)
```bash
# 1. GitHub Desktop 앱 열기
# 2. File → Add Local Repository
# 3. /Users/hoonjaepark/projects/smartTuter 선택
# 4. Publish repository 클릭
# 5. 저장소 이름: smarttuter (또는 원하는 이름)
# 6. Private/Public 선택 후 Publish
```

**옵션 B: 커맨드라인 사용** (고급 사용자)
```bash
# 1. GitHub에서 새 저장소 생성 (https://github.com/new)
# 2. 터미널에서 실행:
git remote add origin https://github.com/YOUR_USERNAME/smarttuter.git
git branch -M main
git push -u origin main
```

### 3단계: Vercel 배포

**방법 1: Vercel 웹사이트에서 배포** (권장)

1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "Add New Project" 클릭
4. GitHub 저장소 연결 허용
5. `smarttuter` 저장소 선택
6. "Import" 클릭
7. **Environment Variables 설정**:
   - `ANTHROPIC_API_KEY`: [발급받은 API 키]
   - `NEXT_PUBLIC_APP_URL`: [자동 생성된 URL]
8. "Deploy" 클릭
9. 배포 완료 대기 (약 2-3분)

**방법 2: Vercel CLI 사용**

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포 (프로젝트 디렉토리에서 실행)
vercel

# 환경 변수 추가
vercel env add ANTHROPIC_API_KEY
# API 키 입력 후 Enter
# Production, Preview, Development 모두 선택

# 프로덕션 배포
vercel --prod
```

### 4단계: 배포 확인

**테스트 체크리스트**:
- [ ] 랜딩 페이지 로딩 확인
- [ ] 온보딩 플로우 동작 확인 (학교급 → 과목 선택)
- [ ] 수학 튜터 AI 응답 테스트
- [ ] 영어 튜터 AI 응답 테스트
- [ ] 수식 렌더링 테스트 (예: "$x^2 + 5x + 6 = 0$" 입력)
- [ ] 학습 리포트 페이지 확인
- [ ] 모바일 반응형 테스트
- [ ] 404 페이지 확인 (/invalid-url 접속)

**성능 확인**:
```bash
# Chrome DevTools → Lighthouse 실행
목표 점수:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100
```

---

## 🔧 배포 후 최적화

### 환경 변수 업데이트

배포 완료 후 `NEXT_PUBLIC_APP_URL`을 실제 URL로 변경:

```bash
# Vercel 대시보드에서:
# Settings → Environment Variables → NEXT_PUBLIC_APP_URL 편집
# 값: https://your-actual-url.vercel.app

# 또는 CLI로:
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL production
# 실제 URL 입력

# 재배포
vercel --prod
```

### 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Domains
3. "Add Domain" 클릭
4. 도메인 입력 (예: smarttuter.com)
5. DNS 설정 지시 따라하기
6. SSL 인증서 자동 발급 대기

### Analytics 연동 (선택사항)

**Vercel Analytics** (무료):
1. Vercel 대시보드 → Analytics 탭
2. "Enable Analytics" 클릭
3. 코드 추가 불필요 (자동 연동)

**Google Analytics**:
- [DEPLOYMENT.md](./DEPLOYMENT.md#google-analytics) 참조

---

## 📊 현재 상태 요약

| 항목 | 상태 | 세부 정보 |
|------|------|-----------|
| **Phase 1 개발** | ✅ 100% | 7 페이지, 13 컴포넌트 |
| **Git 저장소** | ✅ 초기화 | 39 파일 커밋 완료 |
| **문서화** | ✅ 완료 | README, DEPLOYMENT, PHASE1_COMPLETE |
| **Vercel 설정** | ✅ 준비 | vercel.json 작성 완료 |
| **SEO 최적화** | ✅ 완료 | sitemap, robots, metadata |
| **환경 변수** | ⚠️ 설정 필요 | ANTHROPIC_API_KEY 입력 필요 |
| **GitHub 푸시** | ⏳ 대기 | 다음 단계 |
| **Vercel 배포** | ⏳ 대기 | 다음 단계 |

---

## 🎯 다음 단계 선택지

### 옵션 1: 로컬 테스트 (권장)
```bash
# .env.local에 API 키 추가
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local

# 개발 서버 실행
npm run dev

# 브라우저에서 테스트: http://localhost:3000
```

### 옵션 2: 바로 배포
1. GitHub 저장소 생성 및 푸시
2. Vercel 연결 및 배포
3. 환경 변수 설정
4. 배포 확인

### 옵션 3: Phase 2 개발 시작
- 실시간 음성 대화 기능
- WebRTC + LiveKit 통합
- Speech-to-Text (STT)
- Text-to-Speech (TTS)

---

## ⚠️ 중요 사항

### API 키 보안
- ✅ `.env.local`은 `.gitignore`에 포함되어 있음 (안전)
- ✅ `.env.example`만 공개 저장소에 포함
- ❌ 절대 API 키를 코드에 하드코딩하지 말 것
- ❌ API 키를 공개 저장소에 커밋하지 말 것

### 비용 관리
- Vercel: 무료 플랜 (Hobby) 사용 가능
- Anthropic API: 사용량 기반 과금
  - Claude Sonnet 4.5: 입력 $3/MTok, 출력 $15/MTok
  - 예상 비용: 테스트 단계에서는 매우 낮음 (몇 달러 이하)

### 성능 모니터링
- Vercel Analytics로 트래픽 확인
- Anthropic Console에서 API 사용량 모니터링
- Lighthouse 점수 주기적 확인

---

## 📞 지원 및 문서

- **전체 배포 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **프로젝트 개요**: [README.md](./README.md)
- **개발 진행 상황**: [PROGRESS.md](./PROGRESS.md)
- **Phase 1 완료 보고서**: [PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md)

- **Vercel 문서**: https://vercel.com/docs
- **Next.js 문서**: https://nextjs.org/docs
- **Anthropic API 문서**: https://docs.anthropic.com

---

**🎉 SmartTuter Phase 1 MVP 완성을 축하합니다!**

배포 준비가 완료되었습니다. 위 단계를 따라 배포를 진행하거나, 추가 개발을 계속하실 수 있습니다.
