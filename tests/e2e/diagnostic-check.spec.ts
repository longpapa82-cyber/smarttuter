import { test, expect } from '@playwright/test';

/**
 * Diagnostic Test - 전체 시스템 점검
 *
 * 현재 오류 상태 확인:
 * 1. 대시보드 페이지 로딩
 * 2. StreakWidget 렌더링
 * 3. 튜터 페이지 접근
 */

test.describe('System Diagnostic', () => {
  test('Dashboard should load without errors', async ({ page }) => {
    // 콘솔 에러 캡처
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // 대시보드 페이지 이동
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 에러 출력
    if (consoleErrors.length > 0) {
      console.log('❌ Console Errors:', consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.log('❌ Page Errors:', pageErrors);
    }

    // 페이지 스크린샷
    await page.screenshot({ path: 'test-results/dashboard-diagnostic.png', fullPage: true });

    // 기본 요소 확인
    const bodyText = await page.textContent('body');
    console.log('📄 Page contains "500"?', bodyText?.includes('500'));
    console.log('📄 Page contains "Error"?', bodyText?.includes('Error'));
    console.log('📄 Page contains "전체 대시보드"?', bodyText?.includes('전체 대시보드'));

    // StreakWidget 확인
    const streakWidget = page.locator('[class*="from-orange-500"]');
    const streakCount = await streakWidget.count();
    console.log('🔥 StreakWidget found:', streakCount);

    // 에러가 없어야 함
    expect(pageErrors.length).toBe(0);
  });

  test('English Tutor should load', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 영어 튜터 버튼 찾기
    const englishButton = page.locator('text=영어 튜터').first();
    const isVisible = await englishButton.isVisible({ timeout: 5000 }).catch(() => false);

    console.log('📚 English Tutor button visible:', isVisible);

    if (isVisible) {
      await englishButton.click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'test-results/english-tutor-diagnostic.png', fullPage: true });

      const bodyText = await page.textContent('body');
      console.log('📄 English Tutor loaded:', bodyText?.includes('튜터') || bodyText?.includes('Tutor'));
    }

    expect(pageErrors.length).toBe(0);
  });

  test('Math Tutor should load', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 수학 튜터 버튼 찾기
    const mathButton = page.locator('text=수학 튜터').first();
    const isVisible = await mathButton.isVisible({ timeout: 5000 }).catch(() => false);

    console.log('🔢 Math Tutor button visible:', isVisible);

    if (isVisible) {
      await mathButton.click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'test-results/math-tutor-diagnostic.png', fullPage: true });

      const bodyText = await page.textContent('body');
      console.log('📄 Math Tutor loaded:', bodyText?.includes('튜터') || bodyText?.includes('Tutor'));
    }

    expect(pageErrors.length).toBe(0);
  });

  test('Check StreakWidget props', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // LocalStorage 확인
    const localStorage = await page.evaluate(() => {
      const storage: Record<string, any> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          try {
            storage[key] = JSON.parse(window.localStorage.getItem(key) || '');
          } catch {
            storage[key] = window.localStorage.getItem(key);
          }
        }
      }
      return storage;
    });

    console.log('💾 LocalStorage keys:', Object.keys(localStorage));

    // Zustand store 확인
    const userStore = localStorage['user-store'];
    if (userStore && userStore.state && userStore.state.profile) {
      const profile = userStore.state.profile;
      console.log('👤 Profile exists:', !!profile);
      console.log('🔥 Streak data:', profile.streak);
      console.log('📊 Streak milestones:', profile.streak?.streakMilestones);
      console.log('📊 Streak milestones type:', typeof profile.streak?.streakMilestones);
      console.log('📊 Streak milestones is array?', Array.isArray(profile.streak?.streakMilestones));
    } else {
      console.log('⚠️ No profile in store');
    }
  });
});
