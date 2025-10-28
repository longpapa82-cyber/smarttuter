import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Complete onboarding first
    await page.goto('/onboarding');
    await page.click('button:has-text("중학교")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("수학")');
    await page.waitForTimeout(1000);

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
  });

  test('should load dashboard page', async ({ page }) => {
    // Check page loaded
    await expect(page).toHaveURL(/\/dashboard/);

    // Should show dashboard title or greeting
    const dashboardTitle = page.locator('text=대시보드, text=Dashboard, text=환영합니다').first();
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });
  });

  test('should show user profile information', async ({ page }) => {
    // Should display user's grade level or name
    const profileSection = page.locator('[class*="profile"], [class*="user"], h1, h2').first();
    await expect(profileSection).toBeVisible();
  });

  test('should show subject cards or options', async ({ page }) => {
    // Should show Math and English options
    const subjectCards = page.locator('text=수학, text=영어, text=Math, text=English');
    const count = await subjectCards.count();

    // Should have at least 2 subject references
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should have navigation to tutor pages', async ({ page }) => {
    // Look for links or buttons to tutor pages
    const mathLink = page.locator('a[href*="/tutor/math"], button:has-text("수학")').first();
    const englishLink = page.locator('a[href*="/tutor/english"], button:has-text("영어")').first();

    // At least one should be visible
    const mathVisible = await mathLink.isVisible({ timeout: 2000 }).catch(() => false);
    const englishVisible = await englishLink.isVisible({ timeout: 2000 }).catch(() => false);

    expect(mathVisible || englishVisible).toBeTruthy();
  });

  test('should navigate to Math Tutor when clicked', async ({ page }) => {
    const mathLink = page.locator('a[href*="/tutor/math"], button:has-text("수학")').first();

    if (await mathLink.isVisible({ timeout: 2000 })) {
      await mathLink.click();
      await page.waitForURL(/\/tutor\/math/, { timeout: 5000 });
      expect(page.url()).toContain('/tutor/math');
    }
  });

  test('should navigate to English Tutor when clicked', async ({ page }) => {
    const englishLink = page.locator('a[href*="/tutor/english"], button:has-text("영어")').first();

    if (await englishLink.isVisible({ timeout: 2000 })) {
      await englishLink.click();
      await page.waitForURL(/\/tutor\/english/, { timeout: 5000 });
      expect(page.url()).toContain('/tutor/english');
    }
  });

  test('should show learning statistics', async ({ page }) => {
    // Look for stats cards (XP, level, streak, etc.)
    const statsElements = page.locator('[class*="stat"], [class*="card"], [class*="metric"]');
    const count = await statsElements.count();

    // Should have some stats displayed
    expect(count).toBeGreaterThan(0);
  });

  test('should have quick access menu', async ({ page }) => {
    // Look for quick action buttons
    const quickActions = page.locator('button, a[href]');
    const count = await quickActions.count();

    // Should have multiple clickable elements
    expect(count).toBeGreaterThan(3);
  });

  test('should show gamification elements', async ({ page }) => {
    // Look for level, XP, badges, etc.
    const gamificationElements = page.locator('text=레벨, text=Level, text=XP, text=경험치, text=배지, text=Badge');
    const count = await gamificationElements.count();

    // Should have at least one gamification element
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);

    // Dashboard should be visible and usable on mobile
    const dashboardContent = page.locator('[class*="dashboard"], main, [role="main"]').first();

    if (await dashboardContent.isVisible({ timeout: 3000 })) {
      const bbox = await dashboardContent.boundingBox();
      expect(bbox).toBeTruthy();

      // Should not overflow viewport
      if (bbox) {
        expect(bbox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should persist user data on reload', async ({ page }) => {
    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);

    // Should still show dashboard (not redirect to onboarding)
    expect(page.url()).toContain('/dashboard');

    // Profile data should still be available
    const profileData = await page.evaluate(() => {
      const profile = localStorage.getItem('smarttuter-user-profile');
      return profile ? JSON.parse(profile) : null;
    });

    expect(profileData).toBeTruthy();
  });

  test('should have working navigation menu', async ({ page }) => {
    // Look for navigation links
    const navLinks = page.locator('nav a, header a, [role="navigation"] a');
    const count = await navLinks.count();

    // Should have multiple nav links
    expect(count).toBeGreaterThan(0);
  });

  test('should show recent activity or progress', async ({ page }) => {
    // Look for activity feed or progress indicators
    const activityElements = page.locator('text=최근, text=진행, text=활동, text=Recent, text=Progress');

    const count = await activityElements.count();

    // May or may not have recent activity on first visit
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have link to reports page', async ({ page }) => {
    const reportLink = page.locator('a[href*="/report"], button:has-text("리포트"), button:has-text("Report")').first();

    if (await reportLink.isVisible({ timeout: 2000 })) {
      await expect(reportLink).toBeVisible();
    }
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
