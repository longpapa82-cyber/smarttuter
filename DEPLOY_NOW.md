# 🚀 SmartTuter 바로 배포하기

## ⚡ 빠른 배포 가이드 (15분 소요)

이 가이드를 따라하면 15분 내에 SmartTuter를 전 세계에 공개할 수 있습니다!

---

## 📋 준비 사항 체크리스트

배포를 시작하기 전에 다음 항목을 확인하세요:

- [ ] ✅ GitHub 계정 (없으면 [github.com](https://github.com) 가입)
- [ ] ✅ Vercel 계정 (없으면 [vercel.com](https://vercel.com) 가입 - GitHub로 가능)
- [ ] ✅ Anthropic API 키 ([console.anthropic.com](https://console.anthropic.com) 발급)

---

## 1️⃣ Anthropic API 키 발급 (3분)

### 1-1. Anthropic Console 접속
1. [Anthropic Console](https://console.anthropic.com) 열기
2. 계정 생성 또는 로그인
   - 이메일로 가입 또는 Google 계정 연동

### 1-2. API 키 생성
1. 좌측 메뉴에서 **"API Keys"** 클릭
2. **"Create Key"** 버튼 클릭
3. 키 이름 입력 (예: "SmartTuter Production")
4. **"Create Key"** 클릭
5. **API 키 복사** (⚠️ 다시 볼 수 없으니 안전한 곳에 저장!)
   ```
   sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 1-3. 로컬 테스트 (선택사항)
로컬에서 먼저 테스트하고 싶다면:

```bash
# .env.local 파일에 API 키 추가
echo "ANTHROPIC_API_KEY=sk-ant-api03-여기에-실제-키-붙여넣기" >> .env.local

# 브라우저에서 http://localhost:3000 접속하여 테스트
# 온보딩 → 수학/영어 튜터 → AI 채팅 테스트
```

**테스트 방법**:
- 온보딩 페이지에서 학교급 선택 (예: 고등학교)
- 과목 선택 (수학 또는 영어)
- 채팅에서 질문 입력 (예: "이차방정식이 뭐야?")
- AI 응답 확인

---

## 2️⃣ GitHub 저장소 생성 (3분)

### 방법 A: GitHub 웹사이트에서 생성 (초보자 권장)

1. [GitHub 새 저장소](https://github.com/new) 열기
2. **Repository name**: `smarttuter` 입력
3. **Description**: `AI-powered tutoring platform for math and English` (선택사항)
4. **Public** 선택 (무료, 누구나 볼 수 있음)
   - Private도 가능하지만 Vercel 무료 플랜에서는 Public 권장
5. ⚠️ **"Add a README file" 체크 해제** (이미 있음)
6. ⚠️ **.gitignore** 선택 안 함 (이미 있음)
7. **"Create repository"** 클릭

### 2-1. 로컬 저장소와 연결

GitHub에서 저장소 생성 후 표시되는 명령어 중 다음을 복사하여 실행:

```bash
# GitHub 저장소 URL을 원격 저장소로 추가
# ⚠️ YOUR_USERNAME을 실제 GitHub 사용자명으로 변경!
git remote add origin https://github.com/YOUR_USERNAME/smarttuter.git

# main 브랜치로 이름 변경 (이미 되어있을 수 있음)
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**예시**:
```bash
# 사용자명이 "johndoe"인 경우
git remote add origin https://github.com/johndoe/smarttuter.git
git branch -M main
git push -u origin main
```

**인증 방법**:
- Username: GitHub 사용자명
- Password: Personal Access Token (PAT) 사용
  - [토큰 생성](https://github.com/settings/tokens) → "Generate new token (classic)"
  - 권한: `repo` 체크
  - 생성된 토큰을 비밀번호로 사용

### 방법 B: GitHub Desktop 사용 (더 쉬움)

1. [GitHub Desktop](https://desktop.github.com/) 다운로드 및 설치
2. GitHub Desktop 실행
3. **File → Add Local Repository** 클릭
4. `/Users/hoonjaepark/projects/smartTuter` 선택
5. **"Publish repository"** 클릭
6. Repository name: `smarttuter`
7. **Public** 선택
8. **"Publish Repository"** 클릭

✅ 완료! GitHub에서 저장소 확인: `https://github.com/YOUR_USERNAME/smarttuter`

---

## 3️⃣ Vercel 배포 (5분)

### 3-1. Vercel 연결

1. [Vercel](https://vercel.com) 접속
2. **"Sign Up"** 또는 **"Log In"** 클릭
3. **"Continue with GitHub"** 선택
4. GitHub 연동 허용

### 3-2. 프로젝트 Import

1. Vercel 대시보드에서 **"Add New Project"** 클릭
2. **"Import Git Repository"** 섹션에서 `smarttuter` 찾기
   - 안 보이면 **"Adjust GitHub App Permissions"** 클릭하여 권한 부여
3. **"Import"** 클릭

### 3-3. 프로젝트 설정

**Configure Project** 화면에서:

1. **Framework Preset**: Next.js (자동 감지됨)
2. **Root Directory**: `./` (기본값)
3. **Build Command**: `npm run build` (자동 설정됨)
4. **Output Directory**: `.next` (자동 설정됨)

### 3-4. 환경 변수 설정 (중요!)

**Environment Variables** 섹션에서:

1. **Name**: `ANTHROPIC_API_KEY`
2. **Value**: 1단계에서 복사한 API 키 붙여넣기
   ```
   sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **Environment**: `Production`, `Preview`, `Development` 모두 선택 (기본값)
4. **"Add"** 클릭

**추가 환경 변수** (일단 생략 가능, 배포 후 추가):
- Name: `NEXT_PUBLIC_APP_URL`
- Value: 배포 후 생성되는 URL (예: `https://smarttuter.vercel.app`)

### 3-5. 배포 시작

1. **"Deploy"** 버튼 클릭
2. 배포 진행 상황 확인 (약 2-3분 소요)
   - Building... ⏳
   - Deploying... ⏳
   - Ready! ✅

### 3-6. 배포 완료!

축하합니다! 🎉

배포가 완료되면 다음과 같은 화면이 나타납니다:

```
🎉 Congratulations!
Your project is live at: https://smarttuter-xxxx.vercel.app
```

**"Visit"** 버튼 클릭하여 사이트 확인!

---

## 4️⃣ 배포 확인 및 테스트 (4분)

### 4-1. 기본 기능 테스트

배포된 사이트에서 다음을 확인하세요:

- [ ] **랜딩 페이지 로딩** - 애니메이션 정상 작동
- [ ] **온보딩 플로우** - 학교급 선택 → 과목 선택 → 시작
- [ ] **수학 튜터** - AI 채팅 응답 확인
  - 질문 예시: "이차방정식의 근의 공식을 알려줘"
  - 수식 렌더링 확인 ($x^2 + 5x + 6 = 0$)
- [ ] **영어 튜터** - AI 대화 응답 확인
  - 질문 예시: "How do I use 'present perfect' tense?"
- [ ] **학습 리포트** - 데모 데이터 표시 확인
- [ ] **모바일 반응형** - 모바일에서 확인
- [ ] **404 페이지** - `/invalid-url` 접속하여 확인

### 4-2. 성능 확인

Chrome DevTools로 성능 측정:

1. 배포된 사이트에서 **F12** (개발자 도구)
2. **Lighthouse** 탭 선택
3. **"Analyze page load"** 클릭
4. 점수 확인 (목표):
   - Performance: 90+ ✅
   - Accessibility: 95+ ✅
   - Best Practices: 95+ ✅
   - SEO: 100 ✅

### 4-3. URL 업데이트 (선택사항)

배포 완료 후 실제 URL로 환경 변수 업데이트:

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** 탭 → **Environment Variables**
3. `NEXT_PUBLIC_APP_URL` 추가 또는 수정
   - Value: `https://smarttuter-xxxx.vercel.app` (실제 URL)
4. **Save** 클릭
5. **Deployments** 탭 → 최근 배포 → **...** → **Redeploy**

---

## 5️⃣ 커스텀 도메인 설정 (선택사항, 5분)

본인 소유의 도메인이 있다면 연결할 수 있습니다.

### 5-1. 도메인 추가

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Domains**
3. **"Add"** 버튼 클릭
4. 도메인 입력 (예: `smarttuter.com` 또는 `tutor.yourdomain.com`)
5. **"Add"** 클릭

### 5-2. DNS 설정

Vercel에서 제공하는 DNS 레코드를 도메인 제공업체에서 추가:

**A 레코드** (루트 도메인의 경우):
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME 레코드** (서브도메인의 경우):
```
Type: CNAME
Name: tutor
Value: cname.vercel-dns.com
```

### 5-3. SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다 (약 5-10분 소요).

✅ 완료되면 `https://your-domain.com`으로 접속 가능!

---

## 6️⃣ 배포 후 관리

### Analytics 확인

**Vercel Analytics** (무료):
1. Vercel 대시보드 → 프로젝트 선택
2. **Analytics** 탭 클릭
3. **"Enable Analytics"** 클릭
4. 트래픽, 성능, 사용자 데이터 확인

### API 사용량 모니터링

**Anthropic Console**:
1. [Anthropic Console](https://console.anthropic.com) 접속
2. **"Usage"** 탭 클릭
3. API 호출 수, 토큰 사용량, 비용 확인

### 지속적 배포 (CI/CD)

GitHub에 푸시하면 자동으로 배포됩니다!

```bash
# 코드 수정 후
git add .
git commit -m "Update feature"
git push

# Vercel이 자동으로 감지하여 재배포
```

---

## 🎯 빠른 명령어 모음

### 로컬 개발
```bash
# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build

# 프로덕션 모드 실행
npm start
```

### Git 명령어
```bash
# 상태 확인
git status

# 변경사항 커밋
git add .
git commit -m "Update message"

# GitHub에 푸시
git push
```

### Vercel CLI (고급)
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod

# 환경 변수 추가
vercel env add ANTHROPIC_API_KEY
```

---

## ⚠️ 문제 해결

### 배포 실패 시

**빌드 에러**:
1. Vercel 대시보드 → **Deployments** → 실패한 배포 클릭
2. 에러 로그 확인
3. 주로 환경 변수 누락 또는 의존성 문제

**환경 변수 누락**:
```
Error: Missing ANTHROPIC_API_KEY
```
→ Vercel Settings → Environment Variables 확인

**의존성 문제**:
```
Error: Cannot find module 'xxx'
```
→ `package.json` 확인, `npm install` 재실행

### API 응답 없음

**증상**: 채팅에서 AI 응답이 안 옴

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. `ANTHROPIC_API_KEY` 확인
3. Anthropic Console에서 API 키 유효성 확인
4. API 사용량 한도 확인 (무료 크레딧 소진 여부)

### 성능 문제

**느린 로딩**:
1. Lighthouse 점수 확인
2. 이미지 최적화 확인
3. Vercel Analytics에서 성능 메트릭 확인

---

## 💰 비용 안내

### 무료로 운영 가능!

**Vercel (무료 Hobby 플랜)**:
- ✅ 대역폭: 100GB/월
- ✅ 빌드 시간: 100시간/월
- ✅ 서버리스 함수: 무제한
- ✅ 커스텀 도메인: 지원
- **충분**: 월 1,000명 정도까지 무료

**Anthropic API**:
- **무료 크레딧**: 가입 시 $5 제공 (약 100만 토큰)
- **예상 사용량**:
  - 10명/일 사용 시: ~$5-10/월
  - 100명/일 사용 시: ~$50-100/월

**총 예상 비용**:
- **초기 (테스트)**: 거의 무료
- **성장 (100+ 사용자)**: ~$50-100/월
- **확장 (1000+ 사용자)**: ~$200-500/월

---

## 📞 추가 도움말

### 공식 문서
- **Vercel 문서**: https://vercel.com/docs
- **Next.js 문서**: https://nextjs.org/docs
- **Anthropic API**: https://docs.anthropic.com

### 프로젝트 문서
- **README**: [README.md](./README.md)
- **상세 배포 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **체크리스트**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **프로젝트 현황**: [STATUS.md](./STATUS.md)

### 지원
- GitHub Issues: 프로젝트 저장소에서 이슈 생성
- Vercel Support: https://vercel.com/support
- Anthropic Support: https://support.anthropic.com

---

## 🎉 축하합니다!

SmartTuter 배포를 완료하셨습니다! 🚀

**다음 단계**:
1. 친구들에게 공유하기
2. 사용자 피드백 수집
3. Phase 2 개발 (음성 기능)
4. 추가 기능 구현

**공유하기**:
```
🎓 SmartTuter - AI 기반 학습 플랫폼
수학과 영어를 AI 튜터와 함께 공부하세요!

🔗 https://your-deployment-url.vercel.app

✨ 특징:
- 학교급별 맞춤 튜터링
- 실시간 AI 대화
- 학습 분석 리포트
- 완전 무료!
```

---

**만든 이**: SmartTuter Team
**배포 날짜**: 2025년 10월 25일
**버전**: Phase 1 MVP v1.0.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)
