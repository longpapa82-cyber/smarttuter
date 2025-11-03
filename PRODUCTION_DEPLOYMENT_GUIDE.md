# SmartTutor 프로덕션 배포 가이드

## 배포 현황 요약

**날짜**: 2025-11-01
**프로젝트 상태**: Phase 14 완료 (100%)
**개발 서버 상태**: ✅ 정상 작동
**프로덕션 빌드 상태**: ⚠️ TypeScript 엄격 모드 오류 (해결 중)

---

## 1. 빠른 배포 (Vercel 권장)

### 1-1. Vercel로 즉시 배포

**장점**:
- Next.js에 최적화된 플랫폼
- 자동 HTTPS, CDN, 무료 티어
- 환경변수 간편 관리
- Git push 시 자동 배포

**배포 단계**:

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 배포
vercel

# 4. 프로덕션 배포
vercel --prod
```

### 1-2. 필수 환경 변수 설정

Vercel 대시보드 → Settings → Environment Variables에서 다음을 설정:

```bash
# 필수 환경 변수
GEMINI_API_KEY=your_gemini_api_key_here
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://your-domain.vercel.app

# 선택 환경 변수 (권장)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
```

**NextAuth Secret 생성**:
```bash
openssl rand -base64 32
```

---

## 2. TypeScript 빌드 오류 해결

### 현재 발생 중인 오류

프로덕션 빌드 시 다음 TypeScript 오류들이 발생:

1. **따옴표 이스케이프 오류** (일부 수정 완료):
   - `app/dashboard/english/page.tsx`
   - `app/dashboard/math/page.tsx`
   - `app/dashboard/page.tsx`

2. **타입 불일치 오류**:
   - `app/review/page.tsx`: isOverdue 함수 시그니처
   - `app/math-visualization/page.tsx`: config 속성 누락
   - `components/emotion/EmotionIndicator.tsx`: animation undefined 처리
   - `components/navigation/TopNavigation.tsx`: useAuth logout → signOut
   - `components/pronunciation/PronunciationAnalyzer.tsx`: useRef 초기값

### 임시 해결 방법 (빠른 배포용)

`next.config.mjs` 수정하여 타입 체크 완화:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 임시: 프로덕션 빌드 시 타입 체크 스킵
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ... 나머지 설정
};
```

**⚠️ 주의**: 이 설정은 임시 해결책입니다. 배포 후 타입 오류를 점진적으로 수정해야 합니다.

### 영구 해결 방법 (권장)

모든 TypeScript 오류를 수정하여 안정적인 빌드 확보:

```bash
# 1. 타입 체크 실행
npm run type-check

# 2. 오류 하나씩 수정
# 3. 빌드 재시도
npm run build
```

---

## 3. 배포 전 체크리스트

### 필수 확인사항

- [ ] `.env.local` 파일 절대 커밋하지 않기
- [ ] `GEMINI_API_KEY` 발급 완료 (https://aistudio.google.com/apikey)
- [ ] `NEXTAUTH_SECRET` 생성 완료
- [ ] `NEXTAUTH_URL`을 배포 URL로 설정
- [ ] Vercel 프로젝트 생성 완료
- [ ] Git repository 연결 완료

### 선택 확인사항 (권장)

- [ ] Upstash Redis 설정 (캐싱 성능 향상)
- [ ] Google OAuth 설정 (소셜 로그인)
- [ ] Sentry DSN 설정 (에러 모니터링)
- [ ] Google Cloud TTS API 설정 (고품질 음성)

---

## 4. 배포 후 검증

### 기능 테스트

배포 완료 후 다음 기능을 수동으로 테스트:

1. **기본 네비게이션**:
   - [ ] 홈페이지 로딩
   - [ ] 온보딩 플로우 (6단계)
   - [ ] GNB 네비게이션 (영어/수학 튜터, 대시보드)
   - [ ] 모바일 햄버거 메뉴

2. **튜터 기능**:
   - [ ] 영어 튜터 대화
   - [ ] 수학 튜터 대화
   - [ ] 음성 입력/출력
   - [ ] 메시지 전송/수신

3. **대시보드**:
   - [ ] 메인 대시보드 (요약 카드)
   - [ ] 영어 대시보드
   - [ ] 수학 대시보드
   - [ ] 애니메이션 작동 (카운터, 프로그레스 바)

4. **보조 학습**:
   - [ ] 마이크로러닝 모듈
   - [ ] 발음 연습
   - [ ] 플래시카드
   - [ ] 간격 반복 학습

### 성능 검증

```bash
# Lighthouse 감사 실행
npx lighthouse https://your-domain.vercel.app --view
```

**목표 점수**:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

---

## 5. 배포 환경별 설정

### 개발 환경 (Development)

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 스테이징 환경 (Preview)

```bash
# Vercel Preview 자동 배포
# Git PR 생성 시 자동 preview URL 생성
NEXTAUTH_URL=https://preview-xxx.vercel.app
```

### 프로덕션 환경 (Production)

```bash
# Vercel Production
NEXTAUTH_URL=https://smarttutor.vercel.app
NODE_ENV=production
```

---

## 6. 트러블슈팅

### 문제: 빌드 실패 (TypeScript 오류)

**해결책**:
1. `next.config.mjs`에서 `typescript.ignoreBuildErrors: true` 설정 (임시)
2. 개발 환경에서 타입 오류 수정 후 재배포

### 문제: 환경 변수 인식 안 됨

**해결책**:
1. Vercel 대시보드에서 환경 변수 재확인
2. Production/Preview/Development 환경별로 설정 확인
3. 재배포 트리거 (`vercel --prod --force`)

### 문제: API 키 오류

**해결책**:
1. `GEMINI_API_KEY` 유효성 확인
2. Google AI Studio에서 API 키 재생성
3. 환경 변수 업데이트 후 재배포

### 문제: 인증 오류 (NextAuth)

**해결책**:
1. `NEXTAUTH_URL`이 실제 배포 URL과 일치하는지 확인
2. `NEXTAUTH_SECRET` 재생성 및 업데이트
3. Google OAuth callback URL 설정 확인

### 문제: 페이지 로딩 느림

**해결책**:
1. Upstash Redis 캐싱 활성화
2. Vercel Analytics로 성능 병목 확인
3. 이미지 최적화 (Next.js Image 컴포넌트 사용)

---

## 7. 성능 최적화 (배포 후)

### 즉시 적용 가능

1. **Redis 캐싱**: Upstash 설정으로 AI 응답 캐시
2. **이미지 최적화**: `<img>` → `<Image>` 변환
3. **코드 스플리팅**: Dynamic imports로 번들 크기 감소

### 점진적 개선

1. **Service Worker**: 오프라인 지원 강화
2. **Web Vitals**: Core Web Vitals 모니터링
3. **CDN 활용**: Vercel Edge Network 최대 활용

---

## 8. 모니터링 및 유지보수

### Sentry 에러 모니터링

```bash
# Sentry 설정 (선택)
SENTRY_DSN=your_sentry_dsn_here
```

Sentry 대시보드에서 실시간 에러 추적.

### Vercel Analytics

Vercel 대시보드 → Analytics에서 다음을 모니터링:
- 페이지 로드 시간
- 사용자 지역 분포
- 가장 많이 방문한 페이지
- Core Web Vitals

### 로그 모니터링

```bash
# Vercel CLI로 실시간 로그 확인
vercel logs <deployment-url>
```

---

## 9. 배포 시나리오

### 시나리오 A: 즉시 배포 (임시 설정 사용)

**소요 시간**: 10-15분

1. `next.config.mjs` 수정 (타입 체크 완화)
2. Vercel CLI로 배포
3. 환경 변수 설정
4. 기능 테스트
5. 배포 완료

**장점**: 빠른 배포, 즉시 서비스 오픈
**단점**: TypeScript 오류 미해결

### 시나리오 B: 안정적 배포 (권장)

**소요 시간**: 1-2시간

1. 모든 TypeScript 오류 수정
2. 프로덕션 빌드 성공 확인
3. E2E 테스트 실행
4. Vercel 배포
5. Lighthouse 감사
6. 배포 완료

**장점**: 안정적, 유지보수 용이
**단점**: 시간 소요

### 시나리오 C: 하이브리드

**소요 시간**: 30-45분

1. 임시 설정으로 즉시 배포 (Preview 환경)
2. 백그라운드에서 TypeScript 오류 수정
3. 수정 완료 후 Production 재배포

**장점**: 빠른 데모 + 안정적 프로덕션
**단점**: 두 번의 배포 과정

---

## 10. 권장 배포 순서

### Phase 1: 즉시 배포 (Preview)

```bash
# 1. 임시 설정 적용
# next.config.mjs에 ignoreBuildErrors 추가

# 2. Vercel Preview 배포
vercel

# 3. 환경 변수 설정
# Vercel 대시보드에서 설정

# 4. Preview URL로 기능 테스트
```

### Phase 2: 안정화

```bash
# 1. TypeScript 오류 수정
npm run type-check
# 오류 하나씩 수정

# 2. 프로덕션 빌드 테스트
npm run build

# 3. Lint 정리
npm run lint
```

### Phase 3: Production 배포

```bash
# 1. 임시 설정 제거
# next.config.mjs에서 ignoreBuildErrors 삭제

# 2. Production 배포
vercel --prod

# 3. Lighthouse 감사
npx lighthouse https://smarttutor.vercel.app --view

# 4. 모니터링 설정 확인
```

---

## 11. 배포 완료 후 작업

### 즉시 (배포 당일)

- [ ] 모든 핵심 기능 수동 테스트
- [ ] 환경 변수 보안 확인
- [ ] 에러 모니터링 설정 (Sentry)
- [ ] 팀원들에게 배포 URL 공유

### 단기 (1주일 내)

- [ ] 모든 TypeScript 오류 수정
- [ ] E2E 테스트 자동화
- [ ] Lighthouse 점수 90+ 달성
- [ ] 사용자 피드백 수집

### 중기 (1개월 내)

- [ ] Performance 최적화
- [ ] 접근성 WCAG 2.1 AAA 달성
- [ ] OAuth 인증 완성
- [ ] AI 튜터 응답 품질 개선

### 장기 (분기별)

- [ ] Phase 15 기능 추가
- [ ] 사용자 분석 데이터 기반 개선
- [ ] 신규 기능 로드맵 수립

---

## 12. 리소스 및 참고자료

### 공식 문서

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

### API 키 발급

- [Google Gemini API](https://aistudio.google.com/apikey)
- [Upstash Redis](https://upstash.com)
- [Google OAuth](https://console.cloud.google.com/apis/credentials)
- [Sentry](https://sentry.io)

### 성능 도구

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/analytics)

---

## 13. 문의 및 지원

배포 관련 문제 발생 시:

1. **GitHub Issues**: 프로젝트 리포지토리에 issue 생성
2. **Vercel Support**: Vercel 대시보드에서 support 요청
3. **Next.js Discord**: Next.js 커뮤니티 지원

---

**배포 가이드 작성일**: 2025-11-01
**버전**: 1.0
**최종 업데이트**: Phase 14 완료 시점
