import { test, expect } from '@playwright/test';

/**
 * Learning Heatmap - E2E Tests
 *
 * Tests for Phase 2 Extension: Learning Heatmap visualization
 *
 * Goals:
 * - Verify heatmap displays when flashcards exist
 * - Test heatmap grid structure and cells
 * - Verify tooltip interactions
 * - Test streak display
 * - Verify responsive layout
 */

test.describe('Learning Heatmap Display', () => {
  test.beforeEach(async ({ page, context }) => {
    // Complete onboarding
    await context.clearCookies();
    await page.goto('http://localhost:3000/onboarding');

    const usernameInput = page.locator('input#username-input');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('Test User - Heatmap');
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '중학교 선택' }).click();
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '학습 시작하기' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to flashcards page
    await page.goto('http://localhost:3000/flashcards');
    await page.waitForLoadState('networkidle');
  });

  test('should display heatmap when flashcards exist', async ({ page }) => {
    // Create a flashcard first to ensure heatmap shows
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    await createButton.click();
    await page.waitForTimeout(500);

    const mathSubject = page.getByRole('button', { name: /수학/i }).first();
    await mathSubject.click();

    const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
    await frontInput.fill('테스트 질문');

    const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
    await backInput.fill('테스트 답변');

    const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
    await submitButton.click();

    // Close instant start modal
    await page.waitForTimeout(1000);
    const laterButton = page.getByRole('button', { name: /나중에/i });
    await laterButton.click();

    // Wait for page to update
    await page.waitForTimeout(1000);

    // Verify heatmap is visible
    const heatmapTitle = page.locator('text=학습 히트맵');
    await expect(heatmapTitle).toBeVisible({ timeout: 5000 });

    // Verify subtitle
    const subtitle = page.locator('text=/최근.*일간의 학습 활동/');
    await expect(subtitle).toBeVisible();
  });

  test('should display heatmap header with stats', async ({ page }) => {
    // Create a flashcard to show heatmap
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const mathSubject = page.getByRole('button', { name: /수학/i }).first();
      await mathSubject.click();

      const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
      await frontInput.fill('히트맵 테스트');

      const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
      await backInput.fill('히트맵 답변');

      const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
      await submitButton.click();

      await page.waitForTimeout(1000);
      const laterButton = page.getByRole('button', { name: /나중에/i });
      await laterButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify streak displays
    const streakLabels = page.locator('text=/현재 스트릭|최장 스트릭|활동일/');
    const count = await streakLabels.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display heatmap grid cells', async ({ page }) => {
    // Create a flashcard
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const mathSubject = page.getByRole('button', { name: /수학/i }).first();
      await mathSubject.click();

      const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
      await frontInput.fill('그리드 테스트');

      const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
      await backInput.fill('그리드 답변');

      const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
      await submitButton.click();

      await page.waitForTimeout(1000);
      const laterButton = page.getByRole('button', { name: /나중에/i });
      await laterButton.click();
      await page.waitForTimeout(1000);
    }

    // Wait for heatmap to appear
    await page.waitForSelector('text=학습 히트맵', { timeout: 5000 });

    // Check for weekday labels
    const weekdayExists = await page.locator('text=/월|화|수|목|금|토|일/').first().isVisible();
    expect(weekdayExists).toBeTruthy();
  });

  test('should display legend', async ({ page }) => {
    // Create flashcard
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const mathSubject = page.getByRole('button', { name: /수학/i }).first();
      await mathSubject.click();

      const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
      await frontInput.fill('범례 테스트');

      const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
      await backInput.fill('범례 답변');

      const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
      await submitButton.click();

      await page.waitForTimeout(1000);
      const laterButton = page.getByRole('button', { name: /나중에/i });
      await laterButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify legend text
    const legendLess = page.locator('text=적음');
    const legendMore = page.locator('text=많음');

    const hasLegend = (await legendLess.isVisible()) || (await legendMore.isVisible());
    expect(hasLegend).toBeTruthy();
  });

  test('should display additional stats cards', async ({ page }) => {
    // Create flashcard
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const mathSubject = page.getByRole('button', { name: /수학/i }).first();
      await mathSubject.click();

      const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
      await frontInput.fill('통계 테스트');

      const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
      await backInput.fill('통계 답변');

      const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
      await submitButton.click();

      await page.waitForTimeout(1000);
      const laterButton = page.getByRole('button', { name: /나중에/i });
      await laterButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify stats exist
    const statsLabels = page.locator('text=/총 복습한 카드|총 푼 퀴즈|총 획득 XP|총 학습시간/');
    const count = await statsLabels.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display motivational message', async ({ page }) => {
    // Create flashcard
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const mathSubject = page.getByRole('button', { name: /수학/i }).first();
      await mathSubject.click();

      const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
      await frontInput.fill('동기부여 테스트');

      const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
      await backInput.fill('동기부여 답변');

      const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
      await submitButton.click();

      await page.waitForTimeout(1000);
      const laterButton = page.getByRole('button', { name: /나중에/i });
      await laterButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify motivational message exists
    const motivationalKeywords = page.locator('text=/학습|스트릭|시작|발전/');
    const hasMotivation = await motivationalKeywords.first().isVisible();
    expect(hasMotivation).toBeTruthy();
  });
});

test.describe('Heatmap Responsive Behavior', () => {
  test('should handle mobile viewport', async ({ page, context }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Complete onboarding
    await context.clearCookies();
    await page.goto('http://localhost:3000/onboarding');

    const usernameInput = page.locator('input#username-input');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('Mobile Test User');
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '중학교 선택' }).click();
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '학습 시작하기' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto('http://localhost:3000/flashcards');
    await page.waitForLoadState('networkidle');

    // Create a flashcard
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const mathSubject = page.getByRole('button', { name: /수학/i }).first();
      await mathSubject.click();

      const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
      await frontInput.fill('모바일 테스트');

      const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
      await backInput.fill('모바일 답변');

      const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
      await submitButton.click();

      await page.waitForTimeout(1000);
      const laterButton = page.getByRole('button', { name: /나중에/i });
      await laterButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify heatmap is still visible on mobile
    const heatmapTitle = page.locator('text=학습 히트맵');
    const isVisible = await heatmapTitle.isVisible();
    expect(isVisible).toBeTruthy();
  });
});
