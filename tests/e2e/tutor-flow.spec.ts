import { test, expect } from '@playwright/test';

test.describe('Tutor Pages', () => {
  test('Math tutor redirects to onboarding without profile', async ({ page }) => {
    // Navigate to math tutor page
    await page.goto('/tutor/math');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Check for onboarding content
    await expect(page.locator('text=환영합니다')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/이름|당신의 이름/')).toBeVisible();
  });

  test('English tutor redirects to onboarding without profile', async ({ page }) => {
    // Navigate to english tutor page
    await page.goto('/tutor/english');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Check for onboarding content
    await expect(page.locator('text=환영합니다')).toBeVisible({ timeout: 5000 });
  });

  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check for main content
    await expect(page.locator('text=SmartTuter')).toBeVisible();
    await expect(page.locator('text=/AI 튜터|스마트하게 학습/')).toBeVisible();

    // Check for CTA button
    const ctaButton = page.locator('text=/시작하기|무료로 시작/');
    await expect(ctaButton.first()).toBeVisible();
  });

  test('Onboarding page loads correctly', async ({ page }) => {
    await page.goto('/onboarding');

    // Check for onboarding elements
    await expect(page.locator('text=환영합니다')).toBeVisible();

    // Check for input field
    await expect(page.locator('input[type="text"]')).toBeVisible();

    // Check for navigation buttons
    await expect(page.locator('text=/이전|다음/')).toBeVisible();
  });

  test('No console errors on homepage', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow for some React warnings but no actual errors
    const realErrors = errors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('DevTools')
    );

    expect(realErrors.length).toBe(0);
  });
});

test.describe('Icon Resources', () => {
  test('All icon files are accessible', async ({ page }) => {
    const icons = [
      '/icon-192.png',
      '/icon-512.png',
      '/favicon.ico',
    ];

    for (const iconPath of icons) {
      const response = await page.goto(iconPath);
      expect(response?.status()).toBe(200);
    }
  });

  test('Icons are actual images, not text files', async ({ page }) => {
    const response = await page.goto('/icon-192.png');

    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('image');

    const buffer = await response?.body();
    expect(buffer?.length).toBeGreaterThan(1000); // More than 9 bytes!
  });
});
