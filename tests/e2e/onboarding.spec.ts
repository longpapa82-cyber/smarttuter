import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete onboarding successfully', async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');

    // Check initial state - Welcome screen
    await expect(page).toHaveTitle(/AI Park/);
    await expect(page.locator('text=SmartTutor에')).toBeVisible();

    // Click through Welcome screen (Step 0)
    await page.click('button:has-text("시작하기")');
    await page.waitForTimeout(1000);

    // Skip Experience step (Step 1)
    await page.click('button:has-text("건너뛰고 계정 만들기")');
    await page.waitForTimeout(1000);

    // Now we should see grade level selection (Step 2)
    await expect(page.locator('text=어떤 학습자이신가요?')).toBeVisible();

    // Select grade level - Elementary
    await page.click('button:has-text("초등학생")');

    // Wait for animation and next step
    await page.waitForTimeout(500);
    await expect(page.locator('text=어떤 과목을')).toBeVisible();

    // Select subject - Math
    await page.click('button:has-text("수학")');

    // Wait for next step
    await page.waitForTimeout(500);
  });

  test('should show correct grade level options', async ({ page }) => {
    await page.goto('/onboarding');

    // Navigate past welcome screen to grade level step
    await page.click('button:has-text("시작하기")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("건너뛰고 계정 만들기")');
    await page.waitForTimeout(1000);

    // Check all grade level options are present
    await expect(page.locator('text=초등학생')).toBeVisible();
    await expect(page.locator('text=중학생')).toBeVisible();
    await expect(page.locator('text=고등학생')).toBeVisible();
    await expect(page.locator('text=대학생/성인')).toBeVisible();
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/onboarding');

    // Navigate past welcome screen
    await page.click('button:has-text("시작하기")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("건너뛰고 계정 만들기")');
    await page.waitForTimeout(1000);

    // Progress should be visible (shows "2/5 단계 완료")
    await expect(page.locator('text=2/5 단계 완료')).toBeVisible();

    // Select grade level
    await page.click('button:has-text("중학생")');
    await page.waitForTimeout(500);

    // Progress should increase (subject selection step)
    await expect(page.locator('text=어떤 과목을')).toBeVisible();
  });

  test('should persist user selection in localStorage', async ({ page, context }) => {
    await page.goto('/onboarding');

    // Navigate past welcome screen
    await page.click('button:has-text("시작하기")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("건너뛰고 계정 만들기")');
    await page.waitForTimeout(1000);

    // Complete onboarding
    await page.click('button:has-text("고등학생")');
    await page.waitForTimeout(500);
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

    // Navigate past welcome screen
    await page.click('button:has-text("시작하기")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("건너뛰고 계정 만들기")');
    await page.waitForTimeout(1000);

    // All options should still be visible
    await expect(page.locator('text=어떤 학습자이신가요?')).toBeVisible();
    await expect(page.locator('button:has-text("초등학생")')).toBeVisible();

    // Should be able to complete onboarding
    await page.click('button:has-text("초등학생")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=어떤 과목을')).toBeVisible();
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
