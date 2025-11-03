# Smart Tuter Vercel 배포 - 단계별 가이드

## 🎯 배포 방법: GitHub 자동 배포 (가장 추천)

이 방법은 가장 간단하고 안전하며, 향후 코드 변경 시 자동으로 배포됩니다.

---

## ✅ 사전 준비 완료 사항

- [x] Production build 테스트 완료 (성공)
- [x] TypeScript 컴파일 에러 수정
- [x] Git history 정리 (민감 정보 제거)
- [x] GitHub 저장소 push 완료
  - 저장소: `https://github.com/longpapa82-cyber/smarttuter`
  - 브랜치: `main`

---

## 📋 배포 단계

### 1단계: Vercel 접속 및 로그인

1. **https://vercel.com** 접속
2. **"Continue with GitHub"** 클릭하여 GitHub 계정으로 로그인
3. Vercel이 GitHub 접근 권한을 요청하면 **"Authorize Vercel"** 클릭

---

### 2단계: 새 프로젝트 생성

1. Vercel 대시보드에서 **"Add New..."** 버튼 클릭
2. **"Project"** 선택
3. **"Import Git Repository"** 섹션에서 **"smarttuter"** 검색
4. **"longpapa82-cyber/smarttuter"** 저장소 선택
5. **"Import"** 버튼 클릭

---

### 3단계: 프로젝트 설정 확인

다음 설정들이 자동으로 감지됩니다:

| 설정 항목 | 값 | 비고 |
|----------|-----|------|
| **Framework Preset** | Next.js | 자동 감지 |
| **Root Directory** | `./` | 기본값 |
| **Build Command** | `npm run build` | 자동 설정 |
| **Output Directory** | `.next` | 자동 설정 |
| **Install Command** | `npm install` | 자동 설정 |

**→ 이 설정들은 그대로 두면 됩니다.**

---

### 4단계: Environment Variables 설정 (중요!)

**"Environment Variables"** 섹션에서 다음 변수들을 추가하세요:

#### 필수 변수 (REQUIRED) - 반드시 설정 필요

##### 1. GEMINI_API_KEY
```
Name: GEMINI_API_KEY
Value: [Google AI Studio에서 발급받은 API 키]
Environment: Production, Preview, Development (모두 선택)
```

**발급 방법**:
- https://aistudio.google.com/apikey 접속
- "Create API Key" 클릭
- 생성된 키 복사 (예: `AIzaSyC...`)

##### 2. NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: [아래 명령어로 생성한 랜덤 문자열]
Environment: Production, Preview, Development (모두 선택)
```

**생성 방법** (터미널에서 실행):
```bash
openssl rand -base64 32
```
결과 예: `8B7hWQx4+JkZzVmTU4A9nF2cLpDqXw==`

##### 3. NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://smarttuter.vercel.app (배포 후 실제 URL로 변경)
Environment: Production만 선택
```

**주의**: 첫 배포 시에는 임시로 `https://smarttuter.vercel.app` 입력 후,
배포 완료 후 실제 URL로 변경해야 합니다.

---

#### 선택 변수 (OPTIONAL) - 추가 기능용

##### 4. UPSTASH_REDIS_REST_URL & TOKEN (권장)
```
Name: UPSTASH_REDIS_REST_URL
Value: [Upstash Redis URL]
Environment: Production, Preview, Development

Name: UPSTASH_REDIS_REST_TOKEN
Value: [Upstash Redis Token]
Environment: Production, Preview, Development
```

**설정 방법**:
- https://upstash.com 가입
- "Create Database" 클릭
- "REST API" 탭에서 URL과 TOKEN 복사

**효과**: API 응답 캐싱으로 성능 향상 (없어도 동작함)

##### 5. Google OAuth (선택사항)
Google 로그인 기능을 원하는 경우에만 설정:

```
Name: GOOGLE_CLIENT_ID
Value: [Google Cloud Console에서 발급]

Name: GOOGLE_CLIENT_SECRET
Value: [Google Cloud Console에서 발급]
```

---

### 5단계: 배포 실행

1. 모든 환경 변수 설정 완료 후
2. 페이지 하단의 **"Deploy"** 버튼 클릭
3. 배포 진행 상황 모니터링

**배포 시간**: 약 2-5분

---

## 🎉 배포 완료 후

### 1. 배포 URL 확인

배포가 완료되면 다음과 같은 URL들이 생성됩니다:

- **Production URL**: `https://smarttuter-xxx.vercel.app`
- **자동 생성 URL**: `https://smarttuter-git-main-longpapa82-cyber.vercel.app`

### 2. NEXTAUTH_URL 업데이트 (중요!)

1. Vercel 대시보드 → 프로젝트 선택
2. **"Settings"** → **"Environment Variables"** 클릭
3. `NEXTAUTH_URL` 찾기
4. 실제 배포된 URL로 변경 (예: `https://smarttuter-abc123.vercel.app`)
5. **"Redeploy"** 버튼 클릭 (오른쪽 상단의 "Deployments" 탭 → 최신 배포 → "Redeploy")

### 3. 배포 확인 체크리스트

배포된 사이트에서 다음 항목들을 확인하세요:

- [ ] 홈페이지 로딩 (`/`)
- [ ] English Park 튜터 (`/tutor/english`)
- [ ] Math Park 튜터 (`/tutor/math`)
- [ ] 대시보드 (`/dashboard`)
- [ ] 학습 리포트 (`/learning-report`)
- [ ] 플래시카드 (`/flashcards`)
- [ ] 퀴즈 (`/quiz`)
- [ ] 회원가입/로그인 기능
- [ ] 음성 인식 기능 (HTTPS 환경이므로 작동)

### 4. Health Check API 테스트

터미널에서 실행:
```bash
curl https://smarttuter-your-url.vercel.app/api/health
```

정상 응답:
```json
{"status":"ok","timestamp":"2025-11-03T..."}
```

---

## 🔄 자동 배포 설정

이제부터 GitHub에 코드를 push하면 자동으로 배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "기능 개선"
git push origin main

# → Vercel이 자동으로 감지하여 배포 시작
```

- **main 브랜치** → Production 배포
- **다른 브랜치** → Preview 배포 (테스트용)

---

## 🌐 커스텀 도메인 연결 (선택사항)

원하는 도메인(예: `aipark.com`)을 연결하려면:

1. Vercel 대시보드 → **"Settings"** → **"Domains"**
2. **"Add Domain"** 클릭
3. 도메인 입력 (예: `aipark.com`)
4. Vercel이 제공하는 DNS 레코드를 도메인 제공업체에 설정

**DNS 설정 예**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## ⚠️ 주의사항

### 환경 변수 변경 시
환경 변수를 변경한 후에는 반드시 **재배포**가 필요합니다:

1. Settings → Environment Variables에서 변수 수정
2. Deployments 탭 → 최신 배포 → **"Redeploy"** 클릭

### GEMINI_API_KEY 보안
- API 키는 절대 GitHub에 커밋하지 마세요
- Vercel Environment Variables에만 설정
- `.env.local` 파일은 `.gitignore`에 포함되어 있음 (안전)

### 배포 실패 시
1. Vercel 대시보드 → **"Deployments"** 탭
2. 실패한 배포 클릭
3. **"Build Logs"** 확인
4. 에러 메시지에 따라 수정

---

## 📊 배포 모니터링

### Vercel Analytics 활성화
1. 프로젝트 대시보드 → **"Analytics"** 탭
2. **"Enable Web Analytics"** 클릭
3. 실시간 트래픽, 성능 지표 확인 가능

### Runtime Logs 확인
1. 프로젝트 대시보드 → **"Deployments"**
2. 최신 배포 클릭
3. **"Runtime Logs"** 탭에서 실시간 로그 확인

---

## 🎯 다음 단계 (P1-5)

배포 완료 후:

1. ✅ Analytics 활성화
2. ✅ Performance 모니터링 설정
3. ✅ 사용자 피드백 수집
4. ✅ 추가 기능 개발 (선택)

---

## 📞 지원

문제 발생 시:
- Vercel 문서: https://vercel.com/docs
- GitHub Issues: https://github.com/longpapa82-cyber/smarttuter/issues
- DEPLOYMENT_GUIDE.md 참고

---

**배포 성공을 기원합니다! 🚀**
