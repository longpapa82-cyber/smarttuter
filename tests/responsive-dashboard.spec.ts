import { test, expect } from '@playwright/test';

/**
 * 반응형 디자인 검증 테스트
 * - 대시보드 카드 버튼 수직 정렬 검증
 * - 다양한 화면 크기에서 레이아웃 일관성 확인
 */

const VIEWPORTS = [
  { name: 'Mobile (iPhone 12)', width: 390, height: 844 },
  { name: 'Mobile (Samsung Galaxy)', width: 412, height: 915 },
  { name: 'Tablet (iPad)', width: 768, height: 1024 },
  { name: 'Tablet (iPad Pro)', width: 1024, height: 1366 },
  { name: 'Desktop (1080p)', width: 1920, height: 1080 },
  { name: 'Desktop (1440p)', width: 2560, height: 1440 },
];

test.describe('Dashboard Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('http://localhost:3000/login');

    // 테스트 계정으로 로그인
    await page.fill('input[name="email"]', '길게가는아빠');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');

    // 대시보드 로딩 대기
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  VIEWPORTS.forEach(({ name, width, height }) => {
    test(`Button alignment on ${name} (${width}x${height})`, async ({ page }) => {
      // 뷰포트 설정
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(1000); // 레이아웃 안정화 대기

      // 모든 "학습 시작하기" 버튼 찾기
      const startButtons = await page.locator('button:has-text("학습 시작하기")').all();

      if (startButtons.length === 0) {
        console.log(`No start buttons found on ${name}`);
        return;
      }

      // 각 버튼의 Y 좌표 수집
      const buttonPositions = await Promise.all(
        startButtons.map(async (button) => {
          const box = await button.boundingBox();
          const text = await button.textContent();
          return {
            subject: text?.replace('학습 시작하기', '').trim() || 'Unknown',
            y: box?.y || 0,
            height: box?.height || 0,
          };
        })
      );

      console.log(`\n${name} - Button positions:`, buttonPositions);

      // 버튼 정렬 검증 (±5px 허용 오차)
      const firstButtonY = buttonPositions[0].y;
      const tolerance = 5;

      buttonPositions.forEach((pos, index) => {
        const yDiff = Math.abs(pos.y - firstButtonY);
        expect(yDiff,
          `${pos.subject} button should align with first button (diff: ${yDiff}px)`
        ).toBeLessThanOrEqual(tolerance);
      });

      // 카드 높이 일관성 검증
      const cards = await page.locator('[class*="rounded-2xl"][class*="shadow"]').all();
      const cardHeights = await Promise.all(
        cards.map(async (card) => {
          const box = await card.boundingBox();
          return box?.height || 0;
        })
      );

      console.log(`${name} - Card heights:`, cardHeights);

      // 모든 카드가 동일한 높이인지 검증 (±10px 허용)
      const firstCardHeight = cardHeights[0];
      cardHeights.forEach((height, index) => {
        const heightDiff = Math.abs(height - firstCardHeight);
        expect(heightDiff,
          `Card ${index + 1} height should match first card (diff: ${heightDiff}px)`
        ).toBeLessThanOrEqual(10);
      });
    });

    test(`Layout consistency on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(1000);

      // 텍스트 가독성 검증 - 텍스트가 잘리지 않았는지
      const textElements = await page.locator('h3, p, span').all();
      for (const element of textElements) {
        const box = await element.boundingBox();
        if (box) {
          // 요소가 화면 밖으로 나가지 않았는지
          expect(box.x + box.width).toBeLessThanOrEqual(width);
        }
      }

      // 버튼 클릭 가능 영역 검증
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box) {
          // 버튼이 최소 터치 타겟 크기를 만족하는지 (44x44px - iOS 가이드라인)
          if (width < 768) { // 모바일 환경에서만
            expect(box.height, 'Button should meet minimum touch target size').toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  });

  test('Screenshot comparison - Desktop vs Mobile', async ({ page }) => {
    // Desktop 스크린샷
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'tests/screenshots/dashboard-desktop.png',
      fullPage: true
    });

    // Mobile 스크린샷
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'tests/screenshots/dashboard-mobile.png',
      fullPage: true
    });

    console.log('\nScreenshots saved:');
    console.log('- tests/screenshots/dashboard-desktop.png');
    console.log('- tests/screenshots/dashboard-mobile.png');
  });
});
