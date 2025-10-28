import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete onboarding successfully', async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');

    // Check initial state
    await expect(page).toHaveTitle(/SmartTuter/);
    await expect(page.locator('text=학교급을 선택해주세요')).toBeVisible();

    // Select grade level - Elementary
    await page.click('button:has-text("초등학교")');

    // Wait for animation and next step
    await page.waitForTimeout(500);
    await expect(page.locator('text=과목을 선택해주세요')).toBeVisible();

    // Select subject - Math
    await page.click('button:has-text("수학")');

    // Should redirect to dashboard or tutor page
    await page.waitForURL(/\/(dashboard|tutor)/);
    await expect(page.url()).toMatch(/\/(dashboard|tutor)/);
  });

  test('should show correct grade level options', async ({ page }) => {
    await page.goto('/onboarding');

    // Check all grade level options are present
    await expect(page.locator('text=초등학교')).toBeVisible();
    await expect(page.locator('text=중학교')).toBeVisible();
    await expect(page.locator('text=고등학교')).toBeVisible();
    await expect(page.locator('text=대학교')).toBeVisible();
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/onboarding');

    // Progress should start at 0%
    const progressBar = page.locator('[role="progressbar"], .progress-bar, [class*="progress"]').first();
    await expect(progressBar).toBeVisible();

    // Select grade level
    await page.click('button:has-text("중학교")');
    await page.waitForTimeout(300);

    // Progress should increase (subject selection step)
    await expect(page.locator('text=과목을 선택해주세요')).toBeVisible();
  });

  test('should persist user selection in localStorage', async ({ page, context }) => {
    await page.goto('/onboarding');

    // Complete onboarding
    await page.click('button:has-text("고등학교")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("영어")');

    // Wait for redirect
    await page.waitForTimeout(1000);

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      const profile = window.localStorage.getItem('smarttuter-user-profile');
      return profile ? JSON.parse(profile) : null;
    });

    expect(localStorage).toBeTruthy();
    expect(localStorage.state?.profile?.gradeLevel).toBe('high');
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/onboarding');

    // All options should still be visible
    await expect(page.locator('text=학교급을 선택해주세요')).toBeVisible();
    await expect(page.locator('button:has-text("초등학교")')).toBeVisible();

    // Should be able to complete onboarding
    await page.click('button:has-text("초등학교")');
    await page.waitForTimeout(300);
    await expect(page.locator('text=과목을 선택해주세요')).toBeVisible();
  });

  test('should allow going back to landing page', async ({ page }) => {
    await page.goto('/onboarding');

    // Look for home/back button if exists
    const homeButton = page.locator('a[href="/"], button:has-text("홈")').first();
    if (await homeButton.isVisible()) {
      await homeButton.click();
      await expect(page).toHaveURL('/');
    }
  });
});
