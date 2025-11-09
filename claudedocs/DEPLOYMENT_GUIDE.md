# 🚀 SmartTutor (AI Park) 배포 가이드

최종 업데이트: 2025-11-09

---

## ✅ 배포 준비 상태: 100%

**모든 필수 작업 완료**:
- ✅ 프로덕션 빌드 성공 (0 errors, 1 non-blocking warning)
- ✅ TypeScript 에러 0개
- ✅ React Hook 경고 수정 완료
- ✅ 접근성 개선 (main 태그 추가)
- ✅ 환경 변수 검증 완료
- ✅ Beta 배지 구현 완료 (8개 페이지)
- ✅ 음성 설정 완료 (5개 과목)

---

## 📋 배포 전 체크리스트

### 1. 필수 환경 변수 준비

아래 환경 변수를 Vercel에 설정해야 합니다:

#### 🔴 필수 변수 (7개)

```bash
# AI 튜터 핵심 기능
GEMINI_API_KEY=your_gemini_api_key_here

# 인증 시스템
NEXTAUTH_SECRET=your_nextauth_secret_here  # openssl rand -base64 32로 생성
NEXTAUTH_URL=https://YOUR_VERCEL_DOMAIN.vercel.app

# 데이터 저장소 (Redis)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here

# 앱 공개 URL
NEXT_PUBLIC_APP_URL=https://YOUR_VERCEL_DOMAIN.vercel.app
```

#### 🟡 권장 변수 (OAuth 소셜 로그인)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
```

**⚠️ 중요**: OAuth Redirect URI를 업데이트해야 합니다!
- Google: `https://YOUR_DOMAIN.vercel.app/api/auth/callback/google`
- Kakao: `https://YOUR_DOMAIN.vercel.app/api/auth/callback/kakao`

#### 🟢 선택 변수 (고급 기능)

```bash
# Google Vertex AI (고급 AI 기능)
ENABLE_VERTEX_AI=true
GCP_PROJECT_ID=your_gcp_project_id
GCP_LOCATION=asia-northeast3
GOOGLE_APPLICATION_CREDENTIALS=your_service_account_json

# 비용 관리
BUDGET_EXCEEDED_ACTION=warn
DAILY_BUDGET=10
MONTHLY_BUDGET=300

# 성능 최적화
ENABLE_PROMPT_CACHING=true
ENABLE_MULTI_MODEL_VERIFICATION=false

# OCR (수학 필기 인식)
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=your_google_vision_api_key
```

---

## 🚀 Vercel 배포 단계별 가이드

### Step 1: GitHub 저장소 준비

```bash
# 최종 변경사항 커밋
git add .
git commit -m "chore: Final deployment preparation

- Fix React Hook warnings with useCallback
- Add main landmark tag for accessibility
- Update .env.example with cost management
- Production build successful (0 errors)
- Beta badges implemented for all subject pages
- Voice settings configured for all tutors

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHub에 푸시
git push origin main
```

### Step 2: Vercel 프로젝트 생성

1. **Vercel 대시보드 접속**: https://vercel.com
2. **New Project** 클릭
3. **Import Git Repository** 선택
4. GitHub 저장소 연결 및 선택
5. **Project Name** 설정 (예: `smarttutor` 또는 `aipark`)

### Step 3: 환경 변수 설정

**Vercel 대시보드 → Settings → Environment Variables**

#### 필수 변수 입력:

| Key | Value | Environment |
|-----|-------|-------------|
| `GEMINI_API_KEY` | (Google AI Studio에서 발급) | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 결과 | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://YOUR-PROJECT.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://YOUR-PROJECT-*.vercel.app` | Preview |
| `UPSTASH_REDIS_REST_URL` | (Upstash에서 복사) | Production, Preview, Development |
| `UPSTASH_REDIS_REST_TOKEN` | (Upstash에서 복사) | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` | Production |

#### OAuth 변수 (선택, 권장):

| Key | Value | Environment |
|-----|-------|-------------|
| `GOOGLE_CLIENT_ID` | (Google Cloud Console) | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | (Google Cloud Console) | Production, Preview |
| `KAKAO_CLIENT_ID` | (Kakao Developers) | Production, Preview |
| `KAKAO_CLIENT_SECRET` | (Kakao Developers) | Production, Preview |

### Step 4: 빌드 설정 확인

**Build & Development Settings**:
- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 5: 배포 실행

1. **Deploy** 버튼 클릭
2. 빌드 로그 모니터링 (약 2-3분 소요)
3. 빌드 성공 확인

**예상 빌드 시간**:
- 첫 배포: 2-3분
- 이후 배포: 1-2분

---

## 🔧 OAuth Redirect URI 설정

### Google OAuth 설정

1. **Google Cloud Console** 접속: https://console.cloud.google.com
2. **APIs & Services → Credentials** 이동
3. OAuth 2.0 Client ID 선택
4. **Authorized redirect URIs** 추가:
   - Production: `https://YOUR-PROJECT.vercel.app/api/auth/callback/google`
   - Preview: `https://YOUR-PROJECT-*.vercel.app/api/auth/callback/google`
5. **Save** 클릭

### Kakao OAuth 설정

1. **Kakao Developers** 접속: https://developers.kakao.com
2. **내 애플리케이션** 선택
3. **앱 설정 → 플랫폼 → Web** 이동
4. **Redirect URI** 추가:
   - `https://YOUR-PROJECT.vercel.app/api/auth/callback/kakao`
5. **저장** 클릭

---

## ✅ 배포 후 검증

### 1. 기본 기능 확인

```bash
# 홈페이지 접속
https://YOUR-PROJECT.vercel.app

# 확인사항:
✅ 페이지 정상 로딩
✅ Hero 비디오 재생
✅ Features 섹션 표시
✅ Footer 표시
```

### 2. Beta 배지 확인

**Dashboard 페이지**:
- `/dashboard/english` - 우측 상단 Beta 배지
- `/dashboard/math` - 우측 상단 Beta 배지
- `/dashboard/science` - 우측 상단 Beta 배지
- `/dashboard/social` - 우측 상단 Beta 배지

**Tutor 페이지** (로그인 후):
- `/tutor/english` - 헤더 compact Beta 배지
- `/tutor/math` - 헤더 compact Beta 배지
- `/tutor/science` - 헤더 compact Beta 배지
- `/tutor/social` - 헤더 compact Beta 배지

### 3. 인증 플로우 테스트

```bash
# 1. 회원가입
/signup → 정보 입력 → 프로필 생성

# 2. 로그인
/login → 이메일/비밀번호 입력 → 대시보드 이동

# 3. OAuth 로그인 (선택)
/login → Google 버튼 → OAuth 인증 → 대시보드

# 4. 로그아웃
Dashboard → 로그아웃 버튼 → 홈페이지
```

### 4. 튜터 기능 테스트

```bash
# 1. 영어 튜터
/tutor/english → 음성 입력(영어) → AI 응답 확인

# 2. 수학 튜터
/tutor/math → 이미지 업로드 → OCR 인식 → AI 응답

# 3. 과학/사회 튜터
/tutor/science, /tutor/social → 채팅 기능 확인
```

### 5. 반응형 확인

**Chrome DevTools (F12)**:
- 320px (iPhone SE) - 모바일 레이아웃
- 768px (iPad) - 태블릿 레이아웃
- 1440px (Desktop) - 데스크톱 레이아웃

---

## 📊 Lighthouse 성능 측정

배포 후 권장:

```bash
# Desktop
npx lighthouse https://YOUR-PROJECT.vercel.app --view --form-factor=desktop

# Mobile
npx lighthouse https://YOUR-PROJECT.vercel.app --view --form-factor=mobile
```

**목표 점수**:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

---

## 🐛 배포 후 문제 해결

### 문제 1: "GEMINI_API_KEY is not defined" 에러

**해결**:
1. Vercel Dashboard → Settings → Environment Variables
2. `GEMINI_API_KEY` 추가
3. Redeploy 실행

### 문제 2: Redis 연결 실패

**해결**:
1. Upstash Dashboard에서 URL/Token 재확인
2. Vercel 환경 변수 업데이트
3. Redeploy 실행

### 문제 3: OAuth 로그인 실패

**해결**:
1. Redirect URI가 Vercel URL과 정확히 일치하는지 확인
2. Google/Kakao Developer Console에서 Redirect URI 재설정
3. `NEXTAUTH_URL` 환경 변수 확인

### 문제 4: 빌드 실패

**로그 확인**:
```bash
# Vercel Dashboard → Deployments → 실패한 배포 클릭 → View Build Logs
```

**일반적 원인**:
- TypeScript 에러
- 환경 변수 누락
- 의존성 문제

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 수정 후 재배포
git add .
git commit -m "fix: Build error resolution"
git push origin main
```

---

## 🔄 재배포 (업데이트) 방법

### 코드 변경 시

```bash
# 1. 변경사항 커밋
git add .
git commit -m "feat: Add new feature"
git push origin main

# 2. Vercel 자동 배포
# GitHub에 푸시하면 자동으로 Vercel이 배포를 시작합니다.

# 3. 배포 상태 확인
# Vercel Dashboard → Deployments에서 진행 상황 확인
```

### 환경 변수만 변경 시

1. Vercel Dashboard → Settings → Environment Variables
2. 변수 수정 또는 추가
3. **Redeploy** 버튼 클릭 (코드 변경 없이 재배포)

---

## 📈 배포 후 모니터링

### Vercel Analytics 활성화

1. Vercel Dashboard → Project 선택
2. **Analytics** 탭 클릭
3. **Enable Analytics** 클릭

### 성능 모니터링

**Vercel에서 제공하는 메트릭**:
- Real Experience Score (RES)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

### 에러 모니터링

**권장 도구**:
- Sentry (이미 프로젝트에 설정됨)
- Vercel Logs

---

## 🎯 최적화 권장사항

### 배포 직후

1. **Lighthouse 측정** - 성능 점수 확인
2. **실사용자 테스트** - 주요 기능 동작 확인
3. **에러 로그 확인** - Vercel/Sentry에서 에러 모니터링

### 1주일 후

1. **Analytics 분석** - 사용자 행동 패턴 파악
2. **성능 최적화** - 느린 페이지 개선
3. **A/B 테스트** - 핵심 기능 개선

### 장기 운영

1. **정기적인 의존성 업데이트**
2. **보안 패치 적용**
3. **사용자 피드백 반영**
4. **성능 벤치마킹**

---

## 📝 환경별 URL 정리

### Production

```
홈페이지: https://YOUR-PROJECT.vercel.app
대시보드: https://YOUR-PROJECT.vercel.app/dashboard
영어 튜터: https://YOUR-PROJECT.vercel.app/tutor/english
```

### Preview (PR 생성 시 자동 생성)

```
Preview URL: https://YOUR-PROJECT-git-BRANCH-NAME.vercel.app
```

### Local Development

```
로컬 개발: http://localhost:3000
```

---

## ✅ 최종 체크리스트

배포 전 마지막 확인:

- [ ] GitHub 저장소에 최신 코드 푸시 완료
- [ ] Vercel 프로젝트 생성 완료
- [ ] 모든 필수 환경 변수 설정 완료
- [ ] OAuth Redirect URI 설정 완료
- [ ] 빌드 설정 확인 완료
- [ ] 첫 배포 성공 확인
- [ ] 홈페이지 접속 확인
- [ ] Beta 배지 표시 확인
- [ ] 로그인/회원가입 기능 확인
- [ ] 튜터 페이지 기능 확인
- [ ] 반응형 디자인 확인
- [ ] Lighthouse 성능 측정 완료

---

## 🎉 배포 완료!

축하합니다! SmartTutor (AI Park) 프로젝트가 성공적으로 배포되었습니다.

**다음 단계**:
1. ✅ 실사용자 피드백 수집
2. ✅ 성능 모니터링 및 최적화
3. ✅ 새로운 기능 개발 (Priority 2)

**지원 문서**:
- [로컬 테스트 체크리스트](LOCAL_TESTING_CHECKLIST.md)
- [환경 변수 검증 리포트](ENV_VALIDATION_REPORT.md)
- [Priority 1 최종 보고서](PRIORITY1_FINAL_REPORT.md)

---

**작성자**: Claude (SuperClaude Framework)
**작성일**: 2025-11-09
**버전**: 1.0.0
