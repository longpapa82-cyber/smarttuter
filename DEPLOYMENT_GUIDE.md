# Vercel 배포 오류 해결 가이드

## 방법 1: Vercel Dashboard에서 환경 변수 올바르게 설정

### 1-1. 환경 변수 적용 범위 확인
Vercel Dashboard → Settings → Environment Variables에서:

**중요:** 환경 변수를 추가/수정할 때 **반드시 3가지 모두 체크**해야 합니다:
- ✅ Production
- ✅ Preview  
- ✅ Development

만약 Production만 체크했다면, Preview나 Development 배포에서 환경 변수를 찾지 못합니다.

### 1-2. 필수 환경 변수 목록
```
NEXTAUTH_URL=https://aipark.vercel.app
NEXTAUTH_SECRET=(기존 값 유지)
GOOGLE_CLIENT_ID=(기존 값 유지)
GOOGLE_CLIENT_SECRET=(기존 값 유지)
KAKAO_CLIENT_ID=(기존 값 유지)
KAKAO_CLIENT_SECRET=(기존 값 유지)
REDIS_URL=(기존 값 유지)
GEMINI_API_KEY=(기존 값 유지)
```

### 1-3. 빌드 캐시 클리어 후 재배포
1. Vercel Dashboard → Deployments
2. 최신 배포의 "..." 메뉴 클릭
3. **"Redeploy"** 클릭
4. ✅ **"Clear Build Cache & Deploy"** 체크
5. "Redeploy" 버튼 클릭

---

## 방법 2: Git을 통한 강제 재배포

Vercel은 Git push를 감지하여 자동 배포합니다.

### 2-1. 더미 커밋으로 재배포 트리거
```bash
# 빈 커밋 생성
git commit --allow-empty -m "chore: trigger Vercel redeploy"

# 원격 저장소에 푸시
git push origin main
```

### 2-2. Vercel Dashboard에서 배포 진행 확인
1. https://vercel.com 접속
2. 프로젝트 선택
3. Deployments 탭에서 새 배포 진행 상황 확인
4. 로그에서 에러 메시지 확인

---

## 방법 3: 환경 변수를 코드에 하드코딩 (임시 방법)

**⚠️ 주의: 이 방법은 임시 테스트용입니다. 프로덕션에서는 사용하지 마세요.**

lib/auth/config.ts 파일에서:
```typescript
export const authOptions: NextAuthOptions = {
  // ...
  callbacks: {
    async redirect({ url, baseUrl }) {
      const productionUrl = 'https://aipark.vercel.app';
      
      if (process.env.NODE_ENV === 'production') {
        if (url.startsWith('/')) return `${productionUrl}${url}`;
        else if (new URL(url).origin === productionUrl) return url;
        return productionUrl;
      }
      
      // 개발 환경
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
```

---

## 방법 4: Vercel CLI를 통한 수동 배포

### 4-1. Vercel CLI 설치 및 로그인
```bash
# Vercel CLI 설치 (이미 설치됨)
npm install -g vercel

# Vercel 로그인
vercel login
```

### 4-2. 환경 변수 CLI로 설정
```bash
# Production 환경 변수 설정
vercel env add NEXTAUTH_URL production
# 프롬프트에 https://aipark.vercel.app 입력

# Preview 환경 변수 설정
vercel env add NEXTAUTH_URL preview
# 프롬프트에 https://aipark.vercel.app 입력

# Development 환경 변수 설정
vercel env add NEXTAUTH_URL development
# 프롬프트에 http://localhost:3000 입력
```

### 4-3. CLI로 배포
```bash
# Production 배포
vercel --prod
```

---

## 방법 5: 다른 플랫폼으로 배포 (대안)

### 5-1. Netlify
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# Netlify 로그인
netlify login

# 빌드
npm run build

# 배포
netlify deploy --prod --dir=.next
```

### 5-2. Cloudflare Pages
```bash
# 빌드
npm run build

# Wrangler CLI 설치
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# Pages 배포
wrangler pages deploy .next
```

### 5-3. Railway
1. https://railway.app 접속
2. GitHub 연결
3. 프로젝트 선택
4. 환경 변수 설정
5. 자동 배포

---

## 배포 오류 로그 확인 방법

### Vercel Dashboard에서 로그 확인
1. https://vercel.com → 프로젝트 선택
2. Deployments → 실패한 배포 클릭
3. "Building" 섹션에서 에러 로그 확인
4. 에러 메시지를 복사하여 분석

일반적인 에러:
- **"Build exceeded maximum duration"** → 빌드 시간 초과 (무료 플랜: 45초)
- **"Cannot find module"** → 의존성 설치 실패
- **"Type error"** → TypeScript 타입 에러
- **"Environment variable not found"** → 환경 변수 누락

---

## 추천 해결 순서

1. **방법 1 (1-3)**: 빌드 캐시 클리어 후 재배포
2. **방법 2**: Git 더미 커밋으로 강제 재배포
3. **방법 4**: Vercel CLI로 환경 변수 재설정 및 배포
4. **방법 5**: 다른 플랫폼으로 임시 배포 (Netlify 추천)

