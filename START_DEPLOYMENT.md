# 🚀 배포 시작하기 - 실행 가이드

## ✅ 현재 상태: 배포 준비 완료

```
✅ Git 저장소 초기화 완료
✅ 3개 커밋 완료 (43개 파일)
✅ 개발 서버 실행 중
✅ 모든 문서화 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ 다음: GitHub 푸시 → Vercel 배포
```

---

## 🎯 배포 프로세스 (3단계)

### 우선순위 순서:
1. **GitHub 저장소 생성 및 푸시** ← 지금 여기!
2. **Anthropic API 키 발급**
3. **Vercel 배포**

---

## 📋 1단계: GitHub 저장소 생성 (5분)

### Option A: 웹 브라우저에서 생성 (추천!)

#### 1-1. GitHub 새 저장소 만들기

**지금 바로 실행**:
```bash
# 브라우저에서 GitHub 새 저장소 페이지 열기
open https://github.com/new
```

또는 수동으로:
1. 브라우저에서 https://github.com/new 접속
2. GitHub 로그인 (계정이 없다면 먼저 가입)

#### 1-2. 저장소 설정

**다음 정보를 입력하세요**:

```
Repository name: smarttuter
Description: AI-powered tutoring platform for math and English learning
             (선택사항이지만 입력 권장)

Public ✓ (무료이며 Vercel 무료 플랜 사용 가능)

⚠️ 중요: 다음 항목들은 체크 해제!
❌ Add a README file (이미 있음)
❌ Add .gitignore (이미 있음)
❌ Choose a license (나중에 추가 가능)
```

#### 1-3. 저장소 생성
- **"Create repository"** 버튼 클릭

### Option B: GitHub CLI 사용 (고급 사용자)

```bash
# GitHub CLI 설치 (Mac)
brew install gh

# 로그인
gh auth login

# 저장소 생성
gh repo create smarttuter --public --source=. --remote=origin --push
```

---

## 📤 2단계: GitHub에 푸시 (2분)

### 2-1. 원격 저장소 연결

GitHub에서 저장소를 만들면 다음과 같은 화면이 나타납니다:

```
Quick setup — if you've done this kind of thing before
```

**"...or push an existing repository from the command line"** 섹션의 명령어를 사용하세요.

#### 실행할 명령어:

```bash
# ⚠️ YOUR_USERNAME을 실제 GitHub 사용자명으로 변경하세요!
git remote add origin https://github.com/YOUR_USERNAME/smarttuter.git

# main 브랜치 확인 (이미 설정되어 있음)
git branch -M main

# GitHub에 푸시
git push -u origin main
```

#### 예시:
만약 GitHub 사용자명이 `johndoe`라면:
```bash
git remote add origin https://github.com/johndoe/smarttuter.git
git branch -M main
git push -u origin main
```

### 2-2. 인증

푸시할 때 인증을 요구합니다:

**Username**: GitHub 사용자명 입력
**Password**: 🔐 Personal Access Token (PAT) 사용

#### Personal Access Token 생성 (처음 푸시하는 경우):

1. https://github.com/settings/tokens 접속
2. **"Generate new token"** → **"Generate new token (classic)"** 선택
3. Note: `SmartTuter Deployment` 입력
4. Expiration: `90 days` 선택 (또는 원하는 기간)
5. 권한 선택:
   - ✅ **repo** (전체 체크)
6. 페이지 하단 **"Generate token"** 클릭
7. 🔑 생성된 토큰 복사 (ghp_로 시작)
   - ⚠️ 이 페이지를 벗어나면 다시 볼 수 없으니 안전한 곳에 저장!

#### 인증 명령어 실행:
```bash
git push -u origin main

# Username: your-github-username
# Password: ghp_your_personal_access_token (붙여넣기)
```

### 2-3. 푸시 확인

성공 메시지:
```
Enumerating objects: 43, done.
Counting objects: 100% (43/43), done.
Delta compression using up to 8 threads
Compressing objects: 100% (38/38), done.
Writing objects: 100% (43/43), 154.32 KiB | 7.72 MiB/s, done.
Total 43 (delta 5), reused 0 (delta 0), pack-reused 0
To https://github.com/YOUR_USERNAME/smarttuter.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **성공!** GitHub에서 코드 확인:
```bash
# 브라우저에서 저장소 열기
open https://github.com/YOUR_USERNAME/smarttuter
```

---

## 🔑 3단계: Anthropic API 키 발급 (3분)

### 3-1. Anthropic Console 접속

```bash
# 브라우저에서 열기
open https://console.anthropic.com
```

또는 수동으로 https://console.anthropic.com 접속

### 3-2. 계정 생성 또는 로그인

**신규 사용자**:
1. **"Sign Up"** 클릭
2. 이메일로 가입 또는 Google 계정 연동
3. 이메일 인증 완료
4. 무료 크레딧 $5 자동 지급!

**기존 사용자**:
1. **"Sign In"** 클릭
2. 이메일/Google 로그인

### 3-3. API 키 생성

1. 좌측 메뉴 **"API Keys"** 클릭
2. 우측 상단 **"Create Key"** 버튼 클릭
3. **Key Name**: `SmartTuter Production` 입력
4. **"Create Key"** 클릭
5. 🔑 API 키 복사 (sk-ant-api03-로 시작)

```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **중요**:
- 이 키는 다시 볼 수 없습니다!
- 안전한 곳에 저장하세요 (예: 비밀번호 관리자)
- 절대 GitHub에 커밋하거나 공개하지 마세요!

### 3-4. 로컬 테스트 (선택사항)

배포 전에 로컬에서 먼저 테스트하고 싶다면:

```bash
# .env.local 파일에 API 키 추가
echo "ANTHROPIC_API_KEY=sk-ant-api03-여기에-실제-키-붙여넣기" >> .env.local

# 개발 서버는 이미 실행 중이므로 브라우저에서 테스트
# http://localhost:3000
```

**테스트 시나리오**:
1. 온보딩: 고등학교 → 수학 선택
2. 수학 튜터: "이차방정식의 근의 공식을 알려줘" 입력
3. AI 응답 확인 (약 3-5초 소요)
4. 수식 렌더링 확인 ($x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$)

---

## 🚀 4단계: Vercel 배포 (5분)

### 4-1. Vercel 접속 및 로그인

```bash
# 브라우저에서 Vercel 열기
open https://vercel.com
```

1. https://vercel.com 접속
2. **"Sign Up"** 또는 **"Log In"** 클릭
3. **"Continue with GitHub"** 선택
4. GitHub 계정 연동 허용

### 4-2. 새 프로젝트 Import

1. Vercel 대시보드에서 **"Add New..."** 버튼 클릭
2. **"Project"** 선택
3. **"Import Git Repository"** 섹션에서 `smarttuter` 저장소 찾기

**저장소가 안 보이는 경우**:
1. **"Adjust GitHub App Permissions"** 클릭
2. Repository access → **"All repositories"** 선택 또는
3. **"Only select repositories"** → `smarttuter` 선택
4. **"Save"** 클릭
5. Vercel로 돌아가서 새로고침

### 4-3. 프로젝트 설정

**Import** 버튼을 클릭하면 **Configure Project** 화면 표시:

#### 기본 설정 (자동 감지됨)
```
Framework Preset: Next.js ✅ (자동)
Root Directory: ./ ✅ (기본값)
Build Command: npm run build ✅ (자동)
Output Directory: .next ✅ (자동)
Install Command: npm install ✅ (자동)
```

→ 이 설정들은 그대로 두세요!

#### 환경 변수 설정 (중요! ⚠️)

**Environment Variables** 섹션에서:

1. **Name** 입력: `ANTHROPIC_API_KEY`
2. **Value** 입력: 3단계에서 복사한 API 키 붙여넣기
   ```
   sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **Environment** 선택:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   (기본값 - 모두 선택된 상태)
4. **"Add"** 버튼 클릭

**추가 환경 변수** (선택사항 - 나중에 추가 가능):
```
Name: NEXT_PUBLIC_APP_URL
Value: (배포 후 자동 생성되는 URL)
Environment: Production, Preview, Development
```

### 4-4. 배포 시작

1. 모든 설정 확인
2. **"Deploy"** 버튼 클릭
3. 배포 진행 상황 확인

**배포 단계**:
```
🔄 Building...        (약 1-2분)
   ├─ Installing dependencies
   ├─ Building Next.js application
   └─ Optimizing production build

🔄 Deploying...       (약 30초)
   ├─ Uploading build output
   └─ Configuring serverless functions

✅ Ready!             (완료)
```

### 4-5. 배포 완료! 🎉

성공 화면:
```
🎉 Congratulations! Your project has been deployed.

Production Deployment
https://smarttuter-xxxxxxxxxxxx.vercel.app

Domain: smarttuter-xxxxxxxxxxxx.vercel.app
Status: Ready
Deployment Time: ~2-3 minutes
```

**"Visit"** 버튼 클릭 또는 URL 복사하여 접속!

---

## ✅ 5단계: 배포 확인 (3분)

### 5-1. 기능 테스트 체크리스트

배포된 사이트에서 다음을 확인하세요:

- [ ] **랜딩 페이지**
  - 애니메이션 정상 작동
  - "시작하기" 버튼 클릭

- [ ] **온보딩 플로우**
  - 학교급 선택 (예: 고등학교)
  - 과목 선택 (수학)
  - "학습 시작하기" 클릭

- [ ] **수학 튜터**
  - AI 채팅 입력: "이차방정식의 근의 공식을 알려줘"
  - AI 응답 확인 (3-5초 소요)
  - 수식 렌더링 확인 ($...$)
  - 이미지 업로드 버튼 확인

- [ ] **영어 튜터** (뒤로가기 → 영어 선택)
  - AI 채팅 입력: "How do I use present perfect tense?"
  - AI 응답 확인
  - 음성 모드 버튼 확인 (UI만)

- [ ] **학습 리포트**
  - 상단 네비게이션 "리포트" 클릭
  - 일일/주간 토글 작동 확인
  - 차트 표시 확인
  - 성과 게이지 확인

- [ ] **모바일 반응형**
  - 모바일 화면으로 전환 (Chrome DevTools F12 → 모바일 모드)
  - 햄버거 메뉴 작동 확인
  - 모든 페이지 레이아웃 확인

- [ ] **404 페이지**
  - `/invalid-url` 접속
  - 404 페이지 디자인 확인
  - "홈으로 돌아가기" 버튼 작동

### 5-2. 성능 측정

**Lighthouse 점수 확인**:

1. 배포된 사이트에서 **F12** (개발자 도구)
2. **Lighthouse** 탭 선택
3. Device: **Desktop** 선택
4. Categories: **모두 선택**
5. **"Analyze page load"** 클릭
6. 결과 확인 (목표):

```
Performance:      90+ ⚡
Accessibility:    95+ ♿
Best Practices:   95+ ✅
SEO:             100 🔍
```

### 5-3. 환경 변수 업데이트 (선택사항)

배포 완료 후 실제 URL로 업데이트:

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** 탭 → **Environment Variables**
3. **"Add New"** 클릭
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: `https://smarttuter-xxxx.vercel.app` (실제 URL)
   - Environment: Production, Preview, Development
4. **"Save"** 클릭
5. **Deployments** 탭 → 최근 배포 → **"..."** → **"Redeploy"**

---

## 🔧 문제 해결

### ❌ 빌드 실패

**증상**: Build failed - Check logs
**해결**:
1. Vercel 대시보드 → **Deployments** → 실패한 배포 클릭
2. **"Building"** 섹션에서 에러 로그 확인
3. 주요 원인:
   - 의존성 누락: `package.json` 확인
   - TypeScript 에러: 로컬에서 `npm run build` 테스트
   - 환경 변수 누락: ANTHROPIC_API_KEY 확인

### ❌ AI 응답 없음

**증상**: 채팅 입력 후 응답 없거나 에러
**해결**:
1. 브라우저 개발자 도구 (F12) → **Console** 탭
2. 에러 메시지 확인
3. 주요 원인:
   - API 키 누락: Vercel Settings → Environment Variables 확인
   - API 키 오류: Anthropic Console에서 키 유효성 확인
   - 크레딧 소진: Anthropic Console → Usage 확인

### ❌ 404 오류

**증상**: 특정 페이지 접속 시 404
**해결**:
1. URL 확인: `/tutor/math` (정확한 경로)
2. 대소문자 확인: Next.js는 대소문자 구분
3. 배포 로그에서 빌드된 페이지 확인

### ❌ 느린 로딩

**증상**: 페이지 로딩이 5초 이상
**해결**:
1. Vercel Analytics 확인
2. Lighthouse 점수 확인
3. 네트워크 연결 확인
4. 필요시 이슈 생성

---

## 📊 배포 후 관리

### Analytics 활성화

**Vercel Analytics** (무료):
1. Vercel 대시보드 → 프로젝트 선택
2. **Analytics** 탭 클릭
3. **"Enable Analytics"** 클릭
4. 데이터 확인:
   - 방문자 수
   - 페이지뷰
   - 성능 메트릭
   - 국가별 분포

### API 사용량 모니터링

**Anthropic Console**:
1. https://console.anthropic.com → **"Usage"** 탭
2. 확인 사항:
   - 일일/월간 API 호출 수
   - 토큰 사용량 (입력/출력)
   - 예상 비용
   - 남은 크레딧

**알림 설정**:
1. Anthropic Console → **Settings**
2. Billing alerts 설정
3. 크레딧 $1 남았을 때 이메일 알림

### 지속적 배포 (CI/CD)

GitHub에 푸시하면 자동으로 배포됩니다!

```bash
# 코드 수정 후
git add .
git commit -m "Fix: update chatbot response format"
git push

# Vercel이 자동으로:
# 1. 변경사항 감지
# 2. 빌드 시작
# 3. 테스트
# 4. 자동 배포 (약 2-3분)
```

**Preview Deployments**:
- 브랜치 푸시 시 Preview URL 자동 생성
- PR(Pull Request)마다 별도 URL
- 프로덕션 영향 없이 테스트 가능

---

## 🎯 빠른 명령어 참고

### GitHub 푸시
```bash
# 원격 저장소 추가 (최초 1회)
git remote add origin https://github.com/YOUR_USERNAME/smarttuter.git

# 푸시
git push -u origin main
```

### 코드 업데이트 및 재배포
```bash
# 변경사항 확인
git status

# 커밋
git add .
git commit -m "Update: feature description"

# 푸시 (자동 배포)
git push
```

### Vercel CLI (선택사항)
```bash
# 설치
npm i -g vercel

# 로그인
vercel login

# 로컬 배포 테스트
vercel dev

# 프로덕션 배포
vercel --prod
```

---

## 💰 비용 관리

### 무료 사용 범위

**Vercel (Hobby 플랜)**:
- ✅ 대역폭: 100GB/월
- ✅ 빌드: 100시간/월
- ✅ 서버리스 함수: 무제한
- **충분**: 월 ~1,000명

**Anthropic API**:
- 🎁 무료 크레딧: $5
- 💰 Claude Sonnet 4.5:
  - 입력: $3/MTok
  - 출력: $15/MTok
- **예상**: $5 크레딧으로 ~1,000-2,000 대화

### 비용 절감 팁

1. **캐싱 활용**: 자주 묻는 질문 캐싱
2. **토큰 최적화**: 프롬프트 길이 최소화
3. **사용량 모니터링**: 주기적으로 확인
4. **알림 설정**: 예산 초과 전 알림

---

## 🎉 배포 완료!

축하합니다! SmartTuter가 성공적으로 배포되었습니다! 🚀

### 다음 단계:

1. **🌍 공유하기**
   ```
   🎓 SmartTuter - AI 학습 플랫폼

   수학과 영어를 AI 튜터와 함께!
   🔗 https://your-url.vercel.app

   ✨ 무료로 시작하세요!
   ```

2. **📊 모니터링**
   - Vercel Analytics 매일 확인
   - Anthropic Usage 주간 확인
   - 사용자 피드백 수집

3. **🚀 Phase 2 개발**
   - 실시간 음성 대화
   - 게이미피케이션
   - 사용자 인증

---

**배포 URL**: https://smarttuter-xxxx.vercel.app
**GitHub**: https://github.com/YOUR_USERNAME/smarttuter
**문서**: README.md, DEPLOY_NOW.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
