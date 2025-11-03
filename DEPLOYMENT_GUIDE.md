# AI Park 배포 가이드

## 📋 목차
1. [Vercel을 통한 배포](#vercel을-통한-배포)
2. [환경 변수 설정](#환경-변수-설정)
3. [배포 후 확인 사항](#배포-후-확인-사항)
4. [커스텀 도메인 연결](#커스텀-도메인-연결)
5. [문제 해결](#문제-해결)

## 🚀 Vercel을 통한 배포

### 방법 1: Vercel CLI를 통한 배포 (추천)

#### 1단계: Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2단계: 로그인
```bash
vercel login
```

브라우저가 열리면 이메일 또는 GitHub 계정으로 로그인

#### 3단계: 프로젝트 배포
```bash
# 프로젝트 루트 디렉토리에서
vercel

# 프로덕션 배포
vercel --prod
```

**첫 배포 시 질문에 답변**:
- Set up and deploy?: `Y`
- Which scope?: 본인 계정 선택
- Link to existing project?: `N` (첫 배포 시)
- What's your project's name?: `ai-park` (또는 원하는 이름)
- In which directory is your code located?: `./`
- Want to override the settings?: `N`

#### 4단계: 환경 변수 설정
```bash
# 로컬 환경 변수를 Vercel에 추가
vercel env add GEMINI_API_KEY
# 값 입력: your_gemini_api_key_here

vercel env add NEXTAUTH_SECRET
# 값 입력: your_nextauth_secret

vercel env add NEXTAUTH_URL
# 값 입력: https://your-app.vercel.app
```

또는 Vercel 대시보드에서 설정 (아래 참조)

#### 5단계: 재배포
환경 변수 설정 후 다시 배포:
```bash
vercel --prod
```

### 방법 2: GitHub 연동 자동 배포

#### 1단계: GitHub에 코드 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/ai-park.git
git push -u origin main
```

#### 2단계: Vercel과 GitHub 연동
1. https://vercel.com 접속
2. "New Project" 클릭
3. "Import Git Repository" 선택
4. GitHub 저장소 선택 (`your-username/ai-park`)
5. "Import" 클릭

#### 3단계: 프로젝트 설정
- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: `./`
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

#### 4단계: 환경 변수 설정 (중요!)
"Environment Variables" 섹션에서 아래 변수 추가:

| 변수 이름 | 값 | 설명 |
|----------|-----|------|
| `GEMINI_API_KEY` | `your_gemini_api_key` | **필수** - Google Gemini API 키 |
| `NEXTAUTH_SECRET` | `your_nextauth_secret` | **필수** - NextAuth 암호화 키 |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | **필수** - 배포 URL |
| `UPSTASH_REDIS_REST_URL` | `your_redis_url` | **선택** - Redis 캐시 URL |
| `UPSTASH_REDIS_REST_TOKEN` | `your_redis_token` | **선택** - Redis 토큰 |
| `GOOGLE_CLIENT_ID` | `your_google_client_id` | **선택** - Google OAuth |
| `GOOGLE_CLIENT_SECRET` | `your_google_client_secret` | **선택** - Google OAuth |
| `SENTRY_DSN` | `your_sentry_dsn` | **선택** - 에러 모니터링 |

#### 5단계: 배포
"Deploy" 버튼 클릭

⏱️ **배포 시간**: 약 2-3분

✅ **완료**: 배포가 완료되면 고유 URL이 생성됩니다
- 예: `https://ai-park-abc123.vercel.app`

### 방법 3: Vercel 대시보드 직접 배포

1. https://vercel.com 접속 → 로그인
2. "Add New..." → "Project"
3. "Continue with GitHub" (또는 다른 Git 서비스)
4. 저장소 선택
5. 환경 변수 설정
6. "Deploy" 클릭

## 🔐 환경 변수 설정

### 필수 환경 변수

#### 1. GEMINI_API_KEY (필수)
**Google Gemini API 키** - AI 튜터 기능에 필요

**발급 방법**:
1. https://aistudio.google.com/apikey 접속
2. "Create API Key" 클릭
3. Google Cloud 프로젝트 선택 또는 생성
4. API 키 복사

**Vercel 설정**:
```bash
# CLI
vercel env add GEMINI_API_KEY
# 값: AIzaSyC...

# 대시보드
Settings → Environment Variables → Add New
Name: GEMINI_API_KEY
Value: AIzaSyC...
Environment: Production, Preview, Development
```

#### 2. NEXTAUTH_SECRET (필수)
**NextAuth 암호화 키** - 인증 세션 보안

**생성 방법**:
```bash
# 랜덤 문자열 생성
openssl rand -base64 32
# 결과 예: 8B7hWQx4+JkZzVmTU4A9nF2cLpDqXw==
```

**Vercel 설정**:
```bash
vercel env add NEXTAUTH_SECRET
# 값: 생성된 랜덤 문자열
```

#### 3. NEXTAUTH_URL (필수)
**NextAuth 콜백 URL** - 인증 리디렉션

**값**: 배포된 앱의 URL
- 프로덕션: `https://your-app.vercel.app`
- 커스텀 도메인: `https://aipark.com`

**Vercel 설정**:
```bash
vercel env add NEXTAUTH_URL
# Production: https://your-app.vercel.app
# Preview: https://your-app-preview.vercel.app
```

### 선택 환경 변수

#### UPSTASH_REDIS_REST_URL & TOKEN (권장)
**Redis 캐싱** - API 응답 캐싱으로 성능 향상

**Upstash Redis 설정**:
1. https://upstash.com 가입
2. "Create Database" 클릭
3. "REST API" 탭에서 URL과 TOKEN 복사

```bash
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

**없어도 동작**: localStorage로 fallback

#### GOOGLE_CLIENT_ID & SECRET (선택)
**Google OAuth 로그인** - Google 계정으로 로그인

**Google Cloud Console 설정**:
1. https://console.cloud.google.com 접속
2. "APIs & Services" → "Credentials"
3. "Create Credentials" → "OAuth 2.0 Client ID"
4. Authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`

```bash
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

#### SENTRY_DSN (선택)
**에러 모니터링** - 프로덕션 에러 추적

**Sentry 설정**:
1. https://sentry.io 가입
2. 프로젝트 생성
3. DSN 복사

```bash
vercel env add SENTRY_DSN
```

### 환경 변수 확인

**Vercel CLI**:
```bash
# 환경 변수 목록 확인
vercel env ls

# 특정 환경 변수 가져오기
vercel env pull .env.local
```

**Vercel 대시보드**:
1. 프로젝트 선택
2. "Settings" → "Environment Variables"
3. 모든 변수 확인

## ✅ 배포 후 확인 사항

### 1. 기본 기능 테스트

**URL 접속**:
```
https://your-app.vercel.app
```

**체크리스트**:
- [ ] 홈페이지 로딩
- [ ] 회원가입 기능
- [ ] 로그인 기능
- [ ] 온보딩 페이지
- [ ] 영어 튜터 (/tutor/english)
- [ ] 수학 튜터 (/tutor/math)
- [ ] 대시보드 (/dashboard)
- [ ] 학습 리포트 (/learning-report)

### 2. API 기능 테스트

**Health Check**:
```bash
curl https://your-app.vercel.app/api/health
# 응답: {"status":"ok","timestamp":"..."}
```

**Chat API** (Gemini 연동 확인):
```bash
curl -X POST https://your-app.vercel.app/api/chat/english \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","gradeLevel":"초등학교"}'
```

### 3. 성능 확인

**Lighthouse 점수**:
```bash
# Chrome DevTools에서
1. 배포된 URL 접속
2. F12 → Lighthouse 탭
3. "Analyze page load" 클릭
```

**목표**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### 4. 에러 모니터링

**Vercel 대시보드**:
1. 프로젝트 → "Deployments"
2. 최신 배포 클릭
3. "Runtime Logs" 확인
4. 에러 없는지 확인

**Sentry** (설정한 경우):
1. https://sentry.io 접속
2. 프로젝트 선택
3. "Issues" 확인

## 🌐 커스텀 도메인 연결

### 1. 도메인 구매
- Namecheap: https://www.namecheap.com
- GoDaddy: https://www.godaddy.com
- Cloudflare: https://www.cloudflare.com

### 2. Vercel에 도메인 추가

**방법 1: Vercel CLI**
```bash
vercel domains add aipark.com
```

**방법 2: Vercel 대시보드**
1. 프로젝트 → "Settings" → "Domains"
2. "Add Domain" 클릭
3. 도메인 입력 (예: `aipark.com`)
4. DNS 레코드 설정

### 3. DNS 설정

**Vercel이 제공하는 DNS 레코드를 도메인 제공업체에 추가**:

**A 레코드**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME 레코드** (www):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. HTTPS 설정

Vercel이 자동으로 SSL 인증서 발급 (Let's Encrypt)
- 도메인 추가 후 약 15분 소요
- 자동 갱신

### 5. 환경 변수 업데이트

**NEXTAUTH_URL 변경**:
```bash
vercel env add NEXTAUTH_URL production
# 값: https://aipark.com
```

### 6. 재배포
```bash
vercel --prod
```

## 🐛 문제 해결

### 문제 1: 빌드 실패

**증상**: "Build failed" 에러

**원인**:
- TypeScript 에러
- ESLint 에러
- 환경 변수 누락

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 및 수정
npm run lint
```

### 문제 2: API 응답 없음

**증상**: 튜터가 응답하지 않음

**원인**: `GEMINI_API_KEY` 미설정 또는 잘못됨

**해결**:
1. Vercel 대시보드 → Environment Variables 확인
2. `GEMINI_API_KEY` 값 재확인
3. 재배포: `vercel --prod`

### 문제 3: 로그인 안 됨

**증상**: 로그인 후 리디렉션 실패

**원인**: `NEXTAUTH_URL` 또는 `NEXTAUTH_SECRET` 잘못됨

**해결**:
```bash
# NEXTAUTH_URL 확인
vercel env ls

# 올바른 URL로 재설정
vercel env add NEXTAUTH_URL production
# 값: https://your-actual-app-url.vercel.app

# 재배포
vercel --prod
```

### 문제 4: 도메인 연결 안 됨

**증상**: 커스텀 도메인 접속 불가

**원인**: DNS 설정 미완료

**해결**:
1. DNS 전파 확인 (최대 48시간 소요):
```bash
nslookup aipark.com
```

2. Vercel 대시보드에서 도메인 상태 확인:
   - ✅ Active: 정상
   - ⏳ Pending: DNS 전파 대기 중
   - ❌ Invalid: DNS 설정 오류

### 문제 5: 500 Internal Server Error

**증상**: 특정 페이지 접속 시 500 에러

**원인**: 서버 사이드 에러

**해결**:
1. Vercel 대시보드 → Deployments → Runtime Logs
2. 에러 로그 확인
3. 로컬에서 재현:
```bash
npm run build
npm run start
```

### 문제 6: 느린 로딩 속도

**증상**: 페이지 로딩이 느림

**원인**:
- 이미지 최적화 안 됨
- JavaScript 번들 크기가 큼
- API 캐싱 안 됨

**해결**:
1. Redis 캐싱 활성화 (UPSTASH_REDIS_REST_URL 설정)
2. 이미지 최적화:
```jsx
// <img> 대신 next/image 사용
import Image from 'next/image'
<Image src="/logo.png" width={200} height={100} alt="Logo" />
```

3. 번들 크기 분석:
```bash
npm run build
# "First Load JS" 확인
```

## 📊 배포 상태 확인

### Vercel 대시보드

**URL**: https://vercel.com/dashboard

**확인 사항**:
- ✅ 배포 상태 (Ready)
- ✅ 도메인 상태 (Active)
- ✅ 빌드 시간
- ✅ 함수 실행 횟수
- ✅ 대역폭 사용량

### 배포 URL 구조

```
Production (main branch):
https://your-app.vercel.app
https://your-app-git-main-username.vercel.app

Preview (other branches):
https://your-app-git-feature-username.vercel.app

Custom Domain:
https://aipark.com
```

### 자동 배포 설정

**GitHub 푸시 시 자동 배포**:
- `main` 브랜치 → Production 배포
- 다른 브랜치 → Preview 배포

**설정 확인**:
1. Vercel 대시보드 → Settings → Git
2. "Production Branch": `main`
3. "Automatic Deployments": 활성화

## 🔄 재배포

### 코드 변경 후 재배포

**GitHub 연동 시** (자동):
```bash
git add .
git commit -m "Update feature"
git push
# → Vercel이 자동으로 감지하여 배포
```

**Vercel CLI** (수동):
```bash
vercel --prod
```

### 환경 변수 변경 후 재배포

```bash
# 환경 변수 변경
vercel env add GEMINI_API_KEY production

# 반드시 재배포 필요!
vercel --prod
```

## 📝 배포 체크리스트

배포 전 최종 확인:

- [ ] `npm run build` 로컬에서 성공
- [ ] `npm run lint` 에러 없음
- [ ] `.env.local` 파일을 Vercel 환경 변수로 설정
- [ ] `GEMINI_API_KEY` 발급 및 설정
- [ ] `NEXTAUTH_SECRET` 생성 및 설정
- [ ] `NEXTAUTH_URL` 배포 URL로 설정
- [ ] GitHub 저장소 public 또는 Vercel 권한 부여
- [ ] vercel.json 파일 확인
- [ ] README.md 업데이트
- [ ] 도메인 DNS 설정 (커스텀 도메인 사용 시)

## 🎉 배포 완료!

축하합니다! AI Park이 성공적으로 배포되었습니다.

**다음 단계**:
1. ✅ URL 공유: `https://your-app.vercel.app`
2. ✅ 사용자 테스트 진행
3. ✅ 피드백 수집
4. ✅ 지속적 개선

**문제 발생 시**:
- Vercel 대시보드 Runtime Logs 확인
- GitHub Issues에 문제 리포트
- 이 가이드의 "문제 해결" 섹션 참조

## 📚 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [환경 변수 관리](https://vercel.com/docs/concepts/projects/environment-variables)
- [커스텀 도메인 설정](https://vercel.com/docs/concepts/projects/custom-domains)
