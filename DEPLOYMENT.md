# SmartTuter 배포 가이드

## 🚀 Vercel 배포 (추천)

Vercel은 Next.js를 만든 회사의 호스팅 플랫폼으로, 가장 쉽고 빠른 배포 방법입니다.

### 1단계: Vercel 계정 생성

1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. 무료 플랜 선택

### 2단계: 프로젝트 연결

#### 옵션 A: GitHub 연동 (권장)

```bash
# Git 저장소 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub에 저장소 생성 후
git remote add origin https://github.com/yourusername/smarttuter.git
git branch -M main
git push -u origin main
```

Vercel 대시보드에서:
1. "Add New Project" 클릭
2. GitHub 저장소 연결
3. smarttuter 프로젝트 선택
4. "Import" 클릭

#### 옵션 B: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

### 3단계: 환경 변수 설정

Vercel 대시보드에서:
1. 프로젝트 선택
2. Settings → Environment Variables
3. 다음 변수 추가:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

또는 CLI로:

```bash
vercel env add ANTHROPIC_API_KEY
# API 키 입력 후 Enter
# Production, Preview, Development 모두 선택

vercel env add NEXT_PUBLIC_APP_URL
# URL 입력 (예: https://smarttuter.vercel.app)
```

### 4단계: 재배포

환경 변수를 추가한 후:

```bash
vercel --prod
```

또는 GitHub에 push하면 자동으로 배포됩니다.

---

## 🌐 커스텀 도메인 설정

### Vercel에서 도메인 추가

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Domains
3. "Add Domain" 클릭
4. 도메인 입력 (예: smarttuter.com)

### DNS 설정

도메인 등록 업체(Namecheap, GoDaddy 등)에서:

#### A 레코드 방식
```
Type: A
Name: @
Value: 76.76.21.21
```

#### CNAME 방식
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다. (무료)

---

## 📦 기타 배포 옵션

### Netlify

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 빌드
npm run build

# 배포
netlify deploy --prod
```

환경 변수는 Netlify 대시보드에서 설정하세요.

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

빌드 및 실행:

```bash
docker build -t smarttuter .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your-key smarttuter
```

---

## ✅ 배포 전 체크리스트

### 필수 확인사항

- [ ] 환경 변수 설정 완료
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] 빌드 테스트 성공
  ```bash
  npm run build
  npm start
  ```
- [ ] 모든 페이지 정상 작동 확인
  - [ ] 랜딩 페이지 (/)
  - [ ] 온보딩 (/onboarding)
  - [ ] 수학 튜터 (/tutor/math)
  - [ ] 영어 튜터 (/tutor/english)
  - [ ] 학습 리포트 (/report)
- [ ] API 엔드포인트 테스트
  - [ ] /api/chat/math
  - [ ] /api/chat/english
- [ ] 에러 페이지 확인
  - [ ] 404 페이지
  - [ ] 500 페이지

### 최적화 확인

- [ ] 이미지 최적화 (Next.js Image 사용)
- [ ] 폰트 최적화 (Google Fonts)
- [ ] 메타 태그 설정
- [ ] sitemap.xml 생성
- [ ] robots.txt 생성
- [ ] manifest.json 설정

### SEO 확인

- [ ] 페이지 타이틀 설정
- [ ] 메타 디스크립션 작성
- [ ] Open Graph 이미지 추가
- [ ] 구조화된 데이터 (Schema.org)

---

## 🔧 배포 후 설정

### Analytics 연동

#### Vercel Analytics (무료)

1. Vercel 대시보드 → Analytics 탭
2. "Enable Analytics" 클릭
3. 코드 추가 불필요 (자동 연동)

#### Google Analytics

```tsx
// app/layout.tsx에 추가
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

### 에러 모니터링

#### Sentry 설정

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

환경 변수 추가:
```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## 🚨 트러블슈팅

### 빌드 오류

**오류**: `Module not found`
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

**오류**: `Type errors in TypeScript`
```bash
# 타입 체크
npm run build
# 오류 확인 후 수정
```

### 환경 변수 문제

**증상**: API 키가 작동하지 않음

**해결**:
1. Vercel 대시보드에서 환경 변수 확인
2. Production, Preview, Development 모두 설정 확인
3. 재배포 실행

### 이미지 로딩 오류

**증상**: 이미지가 표시되지 않음

**해결**:
```js
// next.config.ts
module.exports = {
  images: {
    domains: ['your-domain.com'],
  },
}
```

---

## 📊 성능 모니터링

### Lighthouse 점수 확인

Chrome DevTools → Lighthouse 실행

**목표 점수**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 🎉 배포 완료!

배포가 완료되면:

1. **URL 확인**: https://your-project.vercel.app
2. **기능 테스트**: 모든 페이지 동작 확인
3. **성능 확인**: Lighthouse 점수 확인
4. **공유**: 사용자에게 URL 전달!

---

## 📞 지원

문제가 발생하면:
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- GitHub Issues 생성

**축하합니다! SmartTuter가 전 세계에 공개되었습니다! 🚀**
