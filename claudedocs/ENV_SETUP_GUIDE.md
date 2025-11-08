# 환경 변수 설정 가이드

AI Park 프로젝트의 환경 변수 설정 방법을 단계별로 안내합니다.

## 📋 목차

1. [필수 환경 변수 설정](#필수-환경-변수-설정)
2. [선택 환경 변수 설정](#선택-환경-변수-설정)
3. [Vercel 배포 환경 변수](#vercel-배포-환경-변수)
4. [문제 해결](#문제-해결)

---

## 필수 환경 변수 설정

최소한의 기능을 사용하기 위해 반드시 설정해야 하는 변수들입니다.

### 1단계: .env.local 파일 생성

```bash
# 프로젝트 루트 디렉토리에서
cp .env.example .env.local
```

### 2단계: Google Gemini API 키 발급

**AI 튜터의 핵심 기능**입니다. 수학/영어/과학/사회 튜터가 모두 Gemini API를 사용합니다.

**발급 절차**:

1. [Google AI Studio](https://aistudio.google.com/apikey) 접속
2. Google 계정으로 로그인
3. **"Get API Key"** 버튼 클릭
4. **"Create API key"** 선택
5. API 키 복사

**무료 사용량**:
- 분당 15 요청
- 분당 1백만 토큰
- 일당 1,500 요청

**.env.local에 추가**:
```bash
GEMINI_API_KEY=AIzaSy...your_actual_key_here
GOOGLE_GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### 3단계: NextAuth 시크릿 생성

**사용자 인증 시스템**의 암호화 키입니다.

**생성 방법**:

```bash
openssl rand -base64 32
```

**출력 예시**:
```
Xk7Jm9P2qR5vW8zC3nB6tY0uH4gF1dA5sE8wQ9rT6yU=
```

**.env.local에 추가**:
```bash
NEXTAUTH_SECRET=Xk7Jm9P2qR5vW8zC3nB6tY0uH4gF1dA5sE8wQ9rT6yU=
```

### 4단계: NextAuth URL 설정

**로컬 개발 환경**:
```bash
NEXTAUTH_URL=http://localhost:3000
```

**프로덕션 환경** (.env.local은 프로덕션에서 사용 안 함, Vercel 환경 변수에서 설정):
```bash
NEXTAUTH_URL=https://aipark.vercel.app
```

### 5단계: Upstash Redis 설정

**학습 데이터 저장소**입니다. 학습 세션, 리포트, 사용자 프로필을 저장합니다.

**발급 절차**:

1. [Upstash 회원가입](https://upstash.com) (GitHub/Google 계정으로 간편 가입)
2. **"Create Database"** 클릭
3. 데이터베이스 이름 입력 (예: `aipark-db`)
4. 리전 선택: **"Asia Pacific (Tokyo)"** 또는 **"Seoul"** 권장
5. **"Create"** 클릭
6. 데이터베이스 상세 페이지에서:
   - **"REST API"** 탭 선택
   - `UPSTASH_REDIS_REST_URL` 복사
   - `UPSTASH_REDIS_REST_TOKEN` 복사

**무료 사용량**:
- 일당 10,000 명령어
- 256MB 저장 공간
- 무제한 데이터베이스 개수

**.env.local에 추가**:
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=AY...your_token_here
```

### ✅ 필수 설정 완료 확인

`.env.local` 파일이 다음과 같이 설정되었는지 확인:

```bash
# 필수 변수 (5개)
GEMINI_API_KEY=AIzaSy...
GOOGLE_GEMINI_API_KEY=AIzaSy...
NEXTAUTH_SECRET=Xk7Jm9P2qR...
NEXTAUTH_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=AY...
```

**개발 서버 실행**:
```bash
npm run dev
```

http://localhost:3000 접속하여 정상 작동 확인

---

## 선택 환경 변수 설정

기능 향상을 위한 추가 설정입니다. 필수는 아니지만 권장됩니다.

### 1. Mathpix OCR (수학 필기 인식 99% 정확도)

**사용처**: 수학 문제 사진을 업로드하면 텍스트로 변환

**발급 절차**:

1. [Mathpix 회원가입](https://mathpix.com/ocr)
2. **"Get API Keys"** 클릭
3. `app_id`와 `app_key` 복사

**무료 사용량**:
- 월 1,000 요청
- 추가 사용 시 요청당 $0.004 (매우 저렴)

**.env.local에 추가**:
```bash
NEXT_PUBLIC_MATHPIX_APP_ID=your_app_id_here
NEXT_PUBLIC_MATHPIX_APP_KEY=your_app_key_here
```

### 2. Google Vision API (OCR 백업)

Mathpix가 없을 때 사용하는 대체 OCR입니다.

**발급 절차**:

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 (또는 기존 프로젝트 선택)
3. **"APIs & Services"** → **"Library"** 이동
4. **"Cloud Vision API"** 검색 후 활성화
5. **"Credentials"** → **"Create Credentials"** → **"API Key"**
6. API 키 복사

**무료 사용량**:
- 월 1,000 유닛

**.env.local에 추가**:
```bash
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=AIzaSy...
```

### 3. Google OAuth (Google 계정 로그인)

**사용처**: "Google로 로그인" 기능

**발급 절차**:

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Application type: **"Web application"**
4. **Authorized redirect URIs** 추가:
   - `http://localhost:3000/api/auth/callback/google` (개발)
   - `https://aipark.vercel.app/api/auth/callback/google` (프로덕션)
5. Client ID와 Client Secret 복사

**.env.local에 추가**:
```bash
GOOGLE_CLIENT_ID=1234567890-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

### 4. Kakao OAuth (카카오 계정 로그인)

**사용처**: "카카오로 로그인" 기능

**발급 절차**:

1. [Kakao Developers](https://developers.kakao.com/console/app) 접속
2. **"애플리케이션 추가하기"**
3. 앱 이름 입력 후 생성
4. **"플랫폼"** 탭 → **"Web 플랫폼 등록"**
   - 사이트 도메인: `http://localhost:3000`
5. **"카카오 로그인"** 활성화
6. **Redirect URI** 설정:
   - `http://localhost:3000/api/auth/callback/kakao`
7. **"앱 키"**에서 REST API 키 복사
8. **"보안"** 탭에서 Client Secret 생성 및 복사

**.env.local에 추가**:
```bash
KAKAO_CLIENT_ID=your_rest_api_key
KAKAO_CLIENT_SECRET=your_client_secret
```

---

## Vercel 배포 환경 변수

Vercel에 배포할 때는 `.env.local` 파일이 아닌 Vercel 대시보드에서 환경 변수를 설정해야 합니다.

### 방법 1: Vercel 대시보드에서 설정 (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. `aipark` 프로젝트 선택
3. **Settings** → **Environment Variables** 이동
4. 각 변수를 추가:

| 변수 이름 | 값 | 환경 |
|----------|-----|-----|
| `GEMINI_API_KEY` | `AIzaSy...` | Production, Preview, Development |
| `GOOGLE_GEMINI_API_KEY` | `AIzaSy...` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `Xk7Jm9P2qR...` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://aipark.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://aipark-git-*.vercel.app` | Preview |
| `UPSTASH_REDIS_REST_URL` | `https://...` | Production, Preview, Development |
| `UPSTASH_REDIS_REST_TOKEN` | `AY...` | Production, Preview, Development |

5. **Save** 클릭
6. **Redeploy** 필요 (환경 변수 변경 후 반드시 재배포)

### 방법 2: Vercel CLI로 설정

```bash
# Production 환경 변수 설정
vercel env add GEMINI_API_KEY production
# 프롬프트에서 값 입력

# Preview 환경 변수 설정
vercel env add GEMINI_API_KEY preview

# Development 환경 변수 설정
vercel env add GEMINI_API_KEY development
```

### 환경별 차이점

| 환경 | 용도 | NEXTAUTH_URL 예시 |
|-----|------|------------------|
| **Production** | 메인 배포 (main 브랜치) | `https://aipark.vercel.app` |
| **Preview** | PR 미리보기 | `https://aipark-git-*.vercel.app` |
| **Development** | 로컬 개발 | `http://localhost:3000` |

### 배포 후 환경 변수 확인

```bash
# Vercel 로그 확인
vercel logs https://aipark.vercel.app --since 5m

# 환경 변수 목록 확인
vercel env ls
```

---

## 문제 해결

### Q1: "GEMINI_API_KEY is not defined" 에러

**증상**: 튜터 페이지 접속 시 500 에러

**해결**:
1. `.env.local` 파일에 `GEMINI_API_KEY` 설정 확인
2. 개발 서버 재시작: `npm run dev` (기존 서버 종료 후)
3. Vercel 배포 시: Vercel 대시보드에서 환경 변수 설정 후 재배포

### Q2: Redis 연결 오류 (ECONNREFUSED)

**증상**:
```
Error: connect ECONNREFUSED to Upstash Redis
```

**해결**:
1. Upstash 대시보드에서 URL/Token 재확인
2. `.env.local`에 정확히 복사했는지 확인
3. URL이 `https://`로 시작하는지 확인
4. Token에 공백이나 줄바꿈이 없는지 확인

### Q3: NextAuth 로그인 무한 리다이렉트

**증상**: 로그인 시도 시 무한 새로고침

**해결**:
1. `NEXTAUTH_URL`이 현재 도메인과 일치하는지 확인
   - 로컬: `http://localhost:3000` (https 아님!)
   - Vercel: `https://aipark.vercel.app`
2. `NEXTAUTH_SECRET`이 설정되었는지 확인
3. 브라우저 쿠키 삭제 후 재시도

### Q4: 수학 OCR 작동 안 함

**증상**: 수학 문제 사진 업로드 시 인식 실패

**해결**:
1. Mathpix API 키 확인:
   ```bash
   NEXT_PUBLIC_MATHPIX_APP_ID=...
   NEXT_PUBLIC_MATHPIX_APP_KEY=...
   ```
2. Mathpix 무료 한도(1,000 req/month) 확인
3. 대체로 Google Vision API 사용:
   ```bash
   NEXT_PUBLIC_GOOGLE_VISION_API_KEY=...
   ```

### Q5: Vercel 배포 후 환경 변수 적용 안 됨

**증상**: 로컬에서는 작동하지만 Vercel에서는 에러

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables 확인
2. **Production** 환경에 변수가 설정되었는지 확인
3. 환경 변수 변경 후 **반드시 재배포** 필요:
   ```bash
   vercel --prod
   ```
4. 배포 로그 확인:
   ```bash
   vercel logs https://aipark.vercel.app --since 10m
   ```

### Q6: "Missing environment variable" 경고

**증상**: 콘솔에 환경 변수 누락 경고

**해결**:
- **필수 변수**: 반드시 설정 (위 가이드 참고)
- **선택 변수**: 해당 기능을 사용하지 않으면 무시 가능
- 경고 무시하고 싶으면 `.env.example`에서 해당 변수 제거

---

## 환경 변수 체크리스트

### 로컬 개발 (최소 필수)

```bash
✅ GEMINI_API_KEY
✅ GOOGLE_GEMINI_API_KEY
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL (http://localhost:3000)
✅ UPSTASH_REDIS_REST_URL
✅ UPSTASH_REDIS_REST_TOKEN
```

### Vercel 프로덕션 (최소 필수)

```bash
✅ GEMINI_API_KEY (Production)
✅ GOOGLE_GEMINI_API_KEY (Production)
✅ NEXTAUTH_SECRET (Production)
✅ NEXTAUTH_URL (https://aipark.vercel.app)
✅ UPSTASH_REDIS_REST_URL (Production)
✅ UPSTASH_REDIS_REST_TOKEN (Production)
```

### 권장 추가 설정

```bash
⭐ NEXT_PUBLIC_MATHPIX_APP_ID (수학 OCR)
⭐ NEXT_PUBLIC_MATHPIX_APP_KEY (수학 OCR)
⭐ GOOGLE_CLIENT_ID (Google 로그인)
⭐ GOOGLE_CLIENT_SECRET (Google 로그인)
```

---

## 추가 리소스

- **Gemini API 문서**: https://ai.google.dev/tutorials/setup
- **Upstash Redis 문서**: https://docs.upstash.com/redis
- **NextAuth.js 문서**: https://next-auth.js.org/configuration/options
- **Mathpix API 문서**: https://docs.mathpix.com
- **Vercel 환경 변수 가이드**: https://vercel.com/docs/environment-variables

---

**문서 작성일**: 2025-01-08
**최종 수정**: 2025-01-08
**담당**: Claude Code Agent
