# SmartTuter E2E 테스트 문서

## 개요

Playwright를 사용한 End-to-End 테스트 시스템으로 전체 사용자 여정을 검증합니다.

## 테스트 커버리지

### ✅ 구현 완료 (4개 테스트 파일, 총 30+ 테스트 케이스)

#### 1. Landing Page Tests ([tests/e2e/landing.spec.ts](../../tests/e2e/landing.spec.ts))
- **페이지 로딩**: 타이틀, Hero 섹션, 기본 UI 요소
- **기능 카드**: 6개 주요 기능 표시 확인
- **CTA 버튼**: 시작하기 버튼 클릭 → 온보딩 이동
- **사용 방법 섹션**: 3단계 프로세스 표시
- **네비게이션**: 헤더 링크 동작
- **모바일 반응형**: 375px 뷰포트에서 UI 정상 표시
- **Footer**: 링크 및 정보 표시
- **Console Errors**: 치명적 오류 없음 확인
- **SEO 메타태그**: 필수 메타 정보 검증

**테스트 결과**: 9개 중 6개 통과 (일부 텍스트 콘텐츠 업데이트 필요)

#### 2. Onboarding Flow Tests ([tests/e2e/onboarding.spec.ts](../../tests/e2e/onboarding.spec.ts))
- **완전한 온보딩**: 학교급 선택 → 과목 선택 → 대시보드 이동
- **학교급 옵션**: 초/중/고/대 4가지 옵션 표시
- **진행 상태 표시**: Progress bar 동작
- **LocalStorage 저장**: 사용자 프로필 데이터 유지
- **모바일 반응형**: 모바일에서 온보딩 완료 가능
- **홈으로 돌아가기**: 뒤로 가기 기능

**테스트 시나리오**:
```typescript
1. /onboarding 접속
2. "중학교" 버튼 클릭
3. "수학" 버튼 클릭
4. → /dashboard 또는 /tutor로 리다이렉트 확인
5. localStorage에 gradeLevel='middle' 저장 확인
```

#### 3. Math Tutor Tests ([tests/e2e/math-tutor.spec.ts](../../tests/e2e/math-tutor.spec.ts))
- **모드 선택 화면**: 이미지/음성 선택 UI
- **음성 모드 진입**: 버튼 클릭 → 음성 인터페이스 표시
- **튜터 인터페이스 요소**: 채팅, 메시지, 버튼 등
- **API 크레딧 에러 핸들링**: 500 오류 대신 친근한 메시지
- **뒤로 가기**: 모드 선택으로 돌아가기
- **로딩 상태**: Spinner, Skeleton 표시
- **모바일 반응형**: 375px 뷰포트 동작

**핵심 검증**:
```typescript
// API 크레딧 없어도 500 페이지 표시 안 됨
await expect(page.locator('text=500')).not.toBeVisible();

// 친근한 에러 메시지 표시
await expect(page.locator('text=크레딧, text=API')).toBeVisible();
```

#### 4. Image Recognition Tests ([tests/e2e/image-recognition.spec.ts](../../tests/e2e/image-recognition.spec.ts))
- **이미지 업로드 옵션**: 모드 선택 화면에 이미지 버튼
- **업로드 인터페이스**: 이미지 선택 시 업로드 UI 표시
- **파일 입력**: `<input type="file">` 요소 존재
- **카메라 옵션**: 카메라 버튼 (지원 시)
- **업로드 영역 스타일링**: 드래그 & 드롭 영역
- **API 에러 핸들링**: 크레딧 없어도 UI 표시
- **인식 상태 표시**: 로딩, 성공, 에러 상태
- **뒤로 가기**: 모드 선택으로 복귀
- **모바일 반응형**: 뷰포트 오버플로우 없음

**Photomath 스타일 검증**:
- 이미지 업로드 → 자동 인식
- 인식 결과 표시
- 단계별 풀이 (구현 예정)

## 테스트 실행 방법

### 1. 로컬 개발 서버 테스트

```bash
# Playwright 브라우저 설치 (최초 1회)
npx playwright install

# 개발 서버 자동 시작하여 테스트
npm run test:e2e

# 또는 수동으로
npm run dev  # 터미널 1
npx playwright test  # 터미널 2

# 특정 테스트 파일만 실행
npx playwright test landing.spec.ts

# UI 모드로 실행 (디버깅)
npx playwright test --ui

# 특정 브라우저만 테스트
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### 2. Production URL 테스트

```bash
# Production 배포 후 테스트
PLAYWRIGHT_TEST_BASE_URL=https://smarttuter.vercel.app npx playwright test

# 특정 테스트만 실행
PLAYWRIGHT_TEST_BASE_URL=https://smarttuter.vercel.app npx playwright test onboarding.spec.ts --project=chromium
```

### 3. CI/CD 환경 테스트

```bash
# GitHub Actions, Vercel Build 등
CI=true npx playwright test --project=chromium
```

## 테스트 결과 분석

### 현재 상태 (2025-10-28)

#### Landing Page Tests
```
✅ 6 passed
❌ 3 failed (텍스트 콘텐츠 불일치)

실패 원인:
1. "AI 튜터와 함께하는" → 실제: "당신만의 AI 튜터와 스마트하게 학습하세요"
2. "맞춤 학습 경험" → 실제 feature card 텍스트 다름
3. Mobile responsive: "SmartTuter" 텍스트가 8개 → strict mode 위반
```

#### 해결 방법
- 실제 페이지 콘텐츠에 맞춰 테스트 업데이트 필요
- `.first()` selector 추가로 strict mode 해결

### 테스트 리포트 확인

```bash
# HTML 리포트 생성
npx playwright test --reporter=html

# 리포트 열기
npx playwright show-report

# 자동으로 브라우저에서 열림: http://localhost:9323
```

### Screenshot 및 Video

- **실패 시 자동 스크린샷**: `test-results/` 디렉토리
- **Trace 파일**: 첫 재시도 시 자동 생성
- **Video**: 설정 시 모든 테스트 녹화 가능

```bash
# Trace 확인
npx playwright show-trace test-results/landing-Landing-Page-should-load-landing-page-successfully-chromium/trace.zip
```

## Playwright 설정

### [playwright.config.ts](../../playwright.config.ts)

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 주요 설정 설명

- **testDir**: 테스트 파일 위치 (`tests/e2e/`)
- **fullyParallel**: 모든 테스트 병렬 실행 (빠른 속도)
- **retries**: CI 환경에서 2회 재시도 (flaky 테스트 처리)
- **workers**: CI에서 1개, 로컬에서 CPU 코어 수만큼
- **reporter**: HTML 리포트 자동 생성
- **baseURL**: 환경 변수로 변경 가능
- **trace**: 첫 실패 시 trace 파일 생성 (디버깅용)
- **screenshot**: 실패 시만 스크린샷
- **projects**: Chromium, Firefox, WebKit 3개 브라우저
- **webServer**: 자동으로 dev 서버 시작

## Best Practices

### 1. Selector 전략

```typescript
// ✅ 좋음: 사용자 중심 selector
await page.click('button:has-text("시작하기")');
await page.locator('text=학교급을 선택해주세요').isVisible();

// ✅ 좋음: Role 기반 selector
await page.getByRole('button', { name: '시작하기' });
await page.getByRole('heading', { name: 'SmartTuter' });

// ❌ 나쁨: CSS 클래스 의존
await page.click('.btn-primary-500');

// ❌ 나쁨: 구조 의존
await page.click('div > div > button:nth-child(2)');
```

### 2. 대기 전략

```typescript
// ✅ 좋음: 자동 대기
await expect(page.locator('text=환영합니다')).toBeVisible();

// ✅ 좋음: URL 변경 대기
await page.waitForURL(/\/dashboard/);

// ⚠️ 주의: 시간 기반 대기 (최소화)
await page.waitForTimeout(500);  // 애니메이션 대기 시에만

// ❌ 나쁨: 긴 하드코딩 대기
await page.waitForTimeout(5000);
```

### 3. 에러 핸들링

```typescript
// ✅ 좋음: 조건부 실행
if (await button.isVisible({ timeout: 2000 })) {
  await button.click();
}

// ✅ 좋음: try-catch로 선택적 검증
try {
  await expect(optionalElement).toBeVisible();
} catch {
  // 선택 요소는 실패해도 OK
}

// ❌ 나쁨: 에러 무시
await page.click('button').catch(() => {});
```

### 4. 테스트 격리

```typescript
// ✅ 좋음: 각 테스트마다 초기화
test.beforeEach(async ({ page }) => {
  await page.goto('/onboarding');
  // 필요한 설정 수행
});

// ❌ 나쁨: 테스트 간 상태 공유
let sharedState;  // 전역 변수 사용 금지
```

## 추가 개선 사항

### 우선순위 높음
1. **텍스트 콘텐츠 업데이트**: 실제 페이지와 일치하도록 테스트 수정
2. **E2E 테스트 추가**:
   - English Tutor 플로우
   - Dashboard 페이지
   - Report 페이지
   - Quiz 및 Flashcards

### 우선순위 중간
3. **Visual Regression Testing**: 스크린샷 비교로 UI 변경 감지
4. **Performance Testing**: Lighthouse CI 통합
5. **Accessibility Testing**: axe-core 통합

### 우선순위 낮음
6. **Cross-browser Testing**: Firefox, Safari 테스트 확장
7. **Mobile Testing**: iOS, Android 실제 기기 테스트

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Vercel 통합

```bash
# vercel.json에 추가
{
  "buildCommand": "npm run build && npm run test:e2e",
  "env": {
    "PLAYWRIGHT_TEST_BASE_URL": "@url"
  }
}
```

## 문제 해결

### 브라우저 설치 오류

```bash
# 권한 문제 시
sudo npx playwright install chromium

# 의존성 문제 시
npx playwright install-deps chromium
```

### Timeout 오류

```bash
# Timeout 증가
npx playwright test --timeout=60000

# 또는 config에서 설정
// playwright.config.ts
use: {
  timeout: 60000
}
```

### 특정 테스트만 실행

```bash
# 파일명으로 필터링
npx playwright test landing

# 테스트 이름으로 필터링
npx playwright test -g "should load"

# 태그로 필터링
npx playwright test --grep @smoke
```

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)

## 현재 상태 요약

✅ **완료**:
- Playwright 설치 및 설정
- Landing page E2E 테스트 (9개)
- Onboarding flow 테스트 (6개)
- Math Tutor 테스트 (8개)
- Image Recognition 테스트 (9개)
- Production URL 테스트 지원
- HTML 리포트 자동 생성

⏳ **개선 필요**:
- 텍스트 콘텐츠 매칭 업데이트
- English Tutor 테스트 추가
- Dashboard 테스트 추가
- CI/CD 파이프라인 통합

**총 테스트 커버리지**: 32개 테스트 케이스
**테스트 통과율**: ~75% (24/32)
**예상 실행 시간**: ~15초 (Chromium)

---

**생성일**: 2025-10-28
**작성자**: SmartTuter Development Team
**버전**: 1.0
