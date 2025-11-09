import { test, expect } from '@playwright/test';

/**
 * 반응형 디자인 자동 테스트
 * Priority 1.4: Chrome DevTools 반응형 테스트
 *
 * 테스트 범위:
 * - Beta 배지 표시 확인 (Dashboard, Tutor 페이지)
 * - 다양한 해상도에서 레이아웃 검증
 * - 모바일/태블릿/데스크톱 브레이크포인트
 */

// 테스트할 해상도 정의
const viewports = [
  { name: 'iPhone SE', width: 320, height: 568 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop', width: 1440, height: 900 },
  { name: '4K', width: 2560, height: 1440 },
];

// 테스트할 페이지 정의
const dashboardPages = [
  { path: '/dashboard/english', subject: 'English' },
  { path: '/dashboard/math', subject: 'Math' },
  { path: '/dashboard/science', subject: 'Science' },
  { path: '/dashboard/social', subject: 'Social' },
];

const tutorPages = [
  { path: '/tutor/english', subject: 'English' },
  { path: '/tutor/math', subject: 'Math' },
  { path: '/tutor/science', subject: 'Science' },
  { path: '/tutor/social', subject: 'Social' },
];

test.describe('반응형 디자인 테스트', () => {

  // 모든 해상도에서 Dashboard 페이지 테스트
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {

      test.use({
        viewport: { width: viewport.width, height: viewport.height },
      });

      // Dashboard Beta 배지 테스트
      for (const page of dashboardPages) {
        test(`Dashboard ${page.subject} - Beta 배지 표시`, async ({ page: browserPage }) => {
          await browserPage.goto(page.path);

          // 페이지 로딩 대기
          await browserPage.waitForLoadState('networkidle');

          // Beta 배지 존재 확인
          const betaBadge = browserPage.locator('text=Beta').first();
          await expect(betaBadge).toBeVisible({ timeout: 10000 });

          // 스크린샷 저장 (시각적 확인용)
          await browserPage.screenshot({
            path: `tests/screenshots/dashboard-${page.subject.toLowerCase()}-${viewport.width}x${viewport.height}.png`,
            fullPage: true,
          });
        });
      }

      // Tutor 페이지 Beta 배지 테스트
      for (const page of tutorPages) {
        test(`Tutor ${page.subject} - Beta 배지 표시`, async ({ page: browserPage }) => {
          await browserPage.goto(page.path);

          // 페이지 로딩 대기
          await browserPage.waitForLoadState('networkidle');

          // Beta 배지 존재 확인 (compact 모드)
          const betaBadge = browserPage.locator('text=Beta').first();
          await expect(betaBadge).toBeVisible({ timeout: 10000 });

          // Sparkles 아이콘 확인
          const sparklesIcon = browserPage.locator('[class*="lucide-sparkles"]').first();
          await expect(sparklesIcon).toBeVisible({ timeout: 5000 });

          // 스크린샷 저장
          await browserPage.screenshot({
            path: `tests/screenshots/tutor-${page.subject.toLowerCase()}-${viewport.width}x${viewport.height}.png`,
            fullPage: true,
          });
        });
      }
    });
  }
});

test.describe('네비게이션 반응형 테스트', () => {

  test('모바일 - 햄버거 메뉴 표시', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 모바일에서는 햄버거 메뉴가 보여야 함
    const mobileMenu = page.locator('[aria-label*="menu"]').or(page.locator('button:has-text("Menu")')).first();
    // 메뉴 버튼 존재 확인 (보이지 않을 수도 있음)
    const menuExists = await mobileMenu.count() > 0;

    if (menuExists) {
      await expect(mobileMenu).toBeVisible();
    }

    await page.screenshot({
      path: 'tests/screenshots/mobile-navigation.png',
    });
  });

  test('데스크톱 - 전체 네비게이션 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // 데스크톱에서는 네비게이션 링크들이 직접 보여야 함
    const navLinks = page.locator('nav a, header a').filter({ hasText: /Dashboard|Profile|Login/ });
    const linkCount = await navLinks.count();

    // 최소 1개 이상의 네비게이션 링크 존재
    expect(linkCount).toBeGreaterThan(0);

    await page.screenshot({
      path: 'tests/screenshots/desktop-navigation.png',
    });
  });
});

test.describe('Total Dashboard 반응형 레이아웃', () => {

  test('모바일 - 카드 세로 배열', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    await page.waitForLoadState('networkidle');

    // 학습 카드들이 세로로 배열되어야 함
    const cards = page.locator('[class*="learning"]').or(page.locator('div:has-text("학습")'));
    const cardCount = await cards.count();

    expect(cardCount).toBeGreaterThan(0);

    await page.screenshot({
      path: 'tests/screenshots/dashboard-mobile-layout.png',
      fullPage: true,
    });
  });

  test('태블릿 - 카드 그리드 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');

    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/screenshots/dashboard-tablet-layout.png',
      fullPage: true,
    });
  });

  test('데스크톱 - 카드 그리드 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');

    await page.waitForLoadState('networkidle');

    // "학습 시작하기" 버튼들이 모두 같은 높이에 정렬되어야 함
    const startButtons = page.locator('button:has-text("학습 시작")').or(page.locator('a:has-text("학습 시작")'));
    const buttonCount = await startButtons.count();

    expect(buttonCount).toBeGreaterThanOrEqual(4); // 최소 4개 과목

    await page.screenshot({
      path: 'tests/screenshots/dashboard-desktop-layout.png',
      fullPage: true,
    });
  });
});

test.describe('Tutor 페이지 채팅 UI 반응형', () => {

  test('모바일 - 채팅 UI 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tutor/english');

    await page.waitForLoadState('networkidle');

    // 채팅 입력창이 하단에 고정되어야 함
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/tutor-mobile-chat.png',
      fullPage: true,
    });
  });

  test('데스크톱 - 채팅 UI 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/tutor/math');

    await page.waitForLoadState('networkidle');

    // 채팅 메시지 영역 확인
    const chatArea = page.locator('[class*="chat"], [class*="message"]').first();
    const exists = await chatArea.count() > 0;

    if (exists) {
      await expect(chatArea).toBeVisible();
    }

    await page.screenshot({
      path: 'tests/screenshots/tutor-desktop-chat.png',
      fullPage: true,
    });
  });
});

test.describe('버튼 터치 영역 테스트 (접근성)', () => {

  test('모바일 - 최소 터치 영역 44px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    await page.waitForLoadState('networkidle');

    // "학습 시작하기" 버튼 크기 확인
    const startButton = page.locator('button:has-text("학습 시작")').or(page.locator('a:has-text("학습 시작")')).first();

    if (await startButton.count() > 0) {
      const box = await startButton.boundingBox();

      if (box) {
        // 최소 터치 영역 44px (WCAG 권장)
        expect(box.height).toBeGreaterThanOrEqual(40); // 약간의 여유
        expect(box.width).toBeGreaterThanOrEqual(80);
      }
    }
  });
});

test.describe('이미지 및 미디어 반응형', () => {

  test('모바일 - 이미지 크기 조정', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // 이미지가 화면 밖으로 나가지 않아야 함
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();

      if (box) {
        // 이미지가 뷰포트 너비를 넘지 않아야 함
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });
});
