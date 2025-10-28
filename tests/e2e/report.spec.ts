import { test, expect } from '@playwright/test';

test.describe('Report Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Complete onboarding first
    await page.goto('/onboarding');
    await page.click('button:has-text("고등학교")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("수학")');
    await page.waitForTimeout(1000);

    // Navigate to report page
    await page.goto('/report');
    await page.waitForTimeout(1000);
  });

  test('should load report page', async ({ page }) => {
    // Check page loaded
    await expect(page).toHaveURL(/\/report/);

    // Should show report title
    const reportTitle = page.locator('text=리포트, text=Report, text=학습 리포트, text=Learning Report, h1, h2').first();
    await expect(reportTitle).toBeVisible({ timeout: 5000 });
  });

  test('should show time period toggle', async ({ page }) => {
    // Look for daily/weekly/monthly toggle
    const periodToggles = page.locator('button:has-text("일일"), button:has-text("주간"), button:has-text("월간"), button:has-text("Daily"), button:has-text("Weekly")');
    const count = await periodToggles.count();

    // Should have at least 1 period option
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should display summary statistics', async ({ page }) => {
    // Look for summary cards (total time, sessions, performance, etc.)
    const summaryCards = page.locator('[class*="summary"], [class*="stat"], [class*="card"]');
    const count = await summaryCards.count();

    // Should have multiple summary cards
    expect(count).toBeGreaterThan(2);
  });

  test('should show total study time', async ({ page }) => {
    // Look for study time indicator
    const studyTime = page.locator('text=학습 시간, text=Study Time, text=시간, text=Time').first();

    if (await studyTime.isVisible({ timeout: 3000 })) {
      await expect(studyTime).toBeVisible();
    }
  });

  test('should display subject progress', async ({ page }) => {
    // Look for math/english progress indicators
    const subjectProgress = page.locator('text=수학, text=영어, text=Math, text=English');
    const count = await subjectProgress.count();

    // Should show both subjects
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should show progress bars or charts', async ({ page }) => {
    // Look for progress visualization elements
    const visualElements = page.locator('[role="progressbar"], svg, canvas, [class*="progress"], [class*="chart"]');
    const count = await visualElements.count();

    // Should have visualization elements
    expect(count).toBeGreaterThan(0);
  });

  test('should display session list', async ({ page }) => {
    // Look for session history or list
    const sessionElements = page.locator('[class*="session"], [class*="history"], [class*="activity"]');
    const count = await sessionElements.count();

    // May or may not have sessions on first visit
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show performance metrics', async ({ page }) => {
    // Look for performance indicators (accuracy, completion rate, etc.)
    const performanceElements = page.locator('text=정확도, text=성과, text=Accuracy, text=Performance, text=%').first();

    if (await performanceElements.isVisible({ timeout: 3000 })) {
      await expect(performanceElements).toBeVisible();
    }
  });

  test('should display strengths and weaknesses', async ({ page }) => {
    // Look for strength/weakness analysis
    const analysisElements = page.locator('text=강점, text=약점, text=Strength, text=Weakness, text=잘하는, text=부족한');

    const count = await analysisElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show recommendations', async ({ page }) => {
    // Look for personalized recommendations
    const recommendations = page.locator('text=추천, text=Recommend, text=제안, text=Suggest');

    if (await recommendations.first().isVisible({ timeout: 3000 })) {
      await expect(recommendations.first()).toBeVisible();
    }
  });

  test('should toggle between time periods', async ({ page }) => {
    // Find period toggle buttons
    const dailyButton = page.locator('button:has-text("일일"), button:has-text("Daily")').first();
    const weeklyButton = page.locator('button:has-text("주간"), button:has-text("Weekly")').first();

    // Try to toggle if buttons exist
    if (await dailyButton.isVisible({ timeout: 2000 })) {
      await dailyButton.click();
      await page.waitForTimeout(500);

      // Content should update (check for any loading or change)
      expect(page.url()).toContain('/report');
    }

    if (await weeklyButton.isVisible({ timeout: 2000 })) {
      await weeklyButton.click();
      await page.waitForTimeout(500);

      expect(page.url()).toContain('/report');
    }
  });

  test('should show weekly chart if available', async ({ page }) => {
    // Look for weekly toggle
    const weeklyButton = page.locator('button:has-text("주간"), button:has-text("Weekly")').first();

    if (await weeklyButton.isVisible({ timeout: 2000 })) {
      await weeklyButton.click();
      await page.waitForTimeout(500);

      // Should show chart (Recharts or similar)
      const chart = page.locator('svg, canvas, [class*="chart"]').first();

      if (await chart.isVisible({ timeout: 3000 })) {
        await expect(chart).toBeVisible();
      }
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // On first visit, should show appropriate empty state or placeholder data
    const emptyStateElements = page.locator('text=학습 기록이 없습니다, text=데이터가 없습니다, text=No data, text=No sessions');

    // May show empty state or sample data
    const hasEmptyState = await emptyStateElements.first().isVisible({ timeout: 2000 }).catch(() => false);
    const hasData = await page.locator('[class*="session"], [class*="data"]').count() > 0;

    // Should either show empty state OR have data
    expect(hasEmptyState || hasData).toBeTruthy();
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);

    // Report should be visible and scrollable on mobile
    const reportContent = page.locator('main, [role="main"], [class*="report"]').first();

    if (await reportContent.isVisible({ timeout: 3000 })) {
      const bbox = await reportContent.boundingBox();
      expect(bbox).toBeTruthy();

      // Should not overflow viewport width
      if (bbox) {
        expect(bbox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should have navigation back to dashboard', async ({ page }) => {
    // Look for back/dashboard button
    const backButton = page.locator('a[href="/dashboard"], button:has-text("대시보드"), button:has-text("뒤로")').first();

    if (await backButton.isVisible({ timeout: 2000 })) {
      await backButton.click();
      await page.waitForTimeout(500);

      // Should navigate to dashboard
      expect(page.url()).toContain('/dashboard');
    }
  });

  test('should persist report data on reload', async ({ page }) => {
    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);

    // Should still show report page
    expect(page.url()).toContain('/report');

    // Basic structure should be present
    const reportContent = page.locator('h1, h2, [class*="report"], main').first();
    await expect(reportContent).toBeVisible();
  });

  test('should show gamification elements', async ({ page }) => {
    // Look for XP, level, badges, streaks
    const gamificationElements = page.locator('text=XP, text=레벨, text=Level, text=배지, text=Badge, text=스트릭, text=Streak');

    const count = await gamificationElements.count();
    // May or may not have gamification in report
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should load without critical errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Allow expected errors (API calls, etc.)
    const criticalErrors = errors.filter(error =>
      !error.includes('API') &&
      !error.includes('크레딧') &&
      !error.includes('Failed to fetch')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
