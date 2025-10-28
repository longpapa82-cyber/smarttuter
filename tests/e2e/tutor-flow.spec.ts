import { test, expect } from '@playwright/test';

test.describe('Tutor Pages', () => {
  test('Math tutor redirects to onboarding without profile', async ({ page }) => {
    // Navigate to math tutor page
    await page.goto('/tutor/math');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });

    // Check for onboarding content (use first() to avoid strict mode violation)
    await expect(page.locator('text=환영합니다')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=이름 입력').first()).toBeVisible();
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

    // Check for main content (use first() to handle multiple matches)
    await expect(page.locator('text=SmartTuter').first()).toBeVisible();
    await expect(page.locator('text=/AI 튜터|스마트하게 학습/').first()).toBeVisible();

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

    // Check for navigation buttons (use first() to avoid strict mode violation)
    await expect(page.getByRole('button', { name: '다음' })).toBeVisible();
  });

  test('Complete onboarding flow with auto-save', async ({ page, context }) => {
    // Clear localStorage before starting
    await context.clearCookies();
    await page.goto('/onboarding');

    // Step 1: Enter username
    const usernameInput = page.locator('input#username-input');
    await usernameInput.fill('테스트 사용자');

    // Check validation feedback appears
    await expect(page.locator('text=이름이 입력되었습니다')).toBeVisible({ timeout: 2000 });

    // Check progress percentage
    await expect(page.locator('text=/33% 완료|34% 완료/')).toBeVisible();

    // Click next
    await page.getByRole('button', { name: '다음' }).click();

    // Step 2: Select grade level
    await expect(page.locator('text=학교급을 선택해주세요')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=/66% 완료|67% 완료/')).toBeVisible();

    // Select middle school
    await page.getByRole('button', { name: '중학교 선택' }).click();

    // Verify selection (checkmark should appear)
    await expect(page.locator('text=중학교').locator('..').locator('text=✓')).toBeVisible({ timeout: 2000 });

    // Click next to final step
    await page.getByRole('button', { name: '다음' }).click();

    // Step 3: Ready to start
    await expect(page.locator('text=준비 완료!')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=/100% 완료/')).toBeVisible();

    // Verify summary information
    await expect(page.locator('text=테스트 사용자')).toBeVisible();
    await expect(page.locator('text=중학교')).toBeVisible();

    // Click start learning button
    await page.getByRole('button', { name: '학습 시작하기' }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('Onboarding progress persists across page reloads', async ({ page }) => {
    await page.goto('/onboarding');

    // Enter username
    await page.locator('input#username-input').fill('진행중 사용자');
    await page.getByRole('button', { name: '다음' }).click();

    // Wait for step 2
    await expect(page.locator('text=학교급을 선택해주세요')).toBeVisible({ timeout: 3000 });

    // Reload page
    await page.reload();

    // Should restore to step 2 with username preserved
    await expect(page.locator('text=학교급을 선택해주세요')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=/66% 완료|67% 완료/')).toBeVisible();

    // Username should be preserved in localStorage (we can't check directly but verify by going back)
    await page.getByRole('button', { name: '이전' }).click();

    const input = page.locator('input#username-input');
    await expect(input).toHaveValue('진행중 사용자');
  });

  test('Keyboard navigation works in onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    // Enter username and press Enter
    const input = page.locator('input#username-input');
    await input.fill('키보드 사용자');
    await input.press('Enter');

    // Should move to step 2
    await expect(page.locator('text=학교급을 선택해주세요')).toBeVisible({ timeout: 3000 });

    // Tab to first grade option and activate with Space
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');

    // Should select the grade (verify checkmark appears)
    await page.waitForTimeout(500); // Brief wait for animation

    // Press Tab until we reach the next button, then Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should reach step 3
    await expect(page.locator('text=준비 완료!')).toBeVisible({ timeout: 3000 });
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
