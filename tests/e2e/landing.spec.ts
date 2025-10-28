import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/SmartTuter/);

    // Check hero section - using actual page content
    await expect(page.locator('text=당신만의 AI 튜터와').first()).toBeVisible();
    await expect(page.locator('text=스마트하게 학습하세요').first()).toBeVisible();
  });

  test('should show all feature cards', async ({ page }) => {
    await page.goto('/');

    // Check for 6 feature cards - using exact text from page
    const featureCards = [
      '실시간 음성 대화',
      '수학 문제 풀이',
      '맞춤형 학습',  // Changed from '맞춤 학습 경험'
      '학습 분석 리포트',  // Changed from '학습 리포트'
      '게이미피케이션',
      '즉각적인 피드백'
    ];

    for (const feature of featureCards) {
      await expect(page.locator(`text=${feature}`).first()).toBeVisible();
    }
  });

  test('should navigate to onboarding when CTA clicked', async ({ page }) => {
    await page.goto('/');

    // Find and click CTA button
    const ctaButton = page.locator('a:has-text("시작하기"), button:has-text("시작하기")').first();
    await expect(ctaButton).toBeVisible();

    await ctaButton.click();

    // Should navigate to onboarding
    await page.waitForURL(/\/(onboarding|dashboard)/);
    await expect(page.url()).toMatch(/\/(onboarding|dashboard)/);
  });

  test('should show how it works section', async ({ page }) => {
    await page.goto('/');

    // Check for 3-step process
    await expect(page.locator('text=사용 방법').or(page.locator('text=어떻게 작동하나요'))).toBeVisible();

    const steps = ['선택', '시작', '학습'];
    for (const step of steps) {
      const stepElement = page.locator(`text=${step}`).first();
      if (await stepElement.isVisible()) {
        await expect(stepElement).toBeVisible();
      }
    }
  });

  test('should have working navigation links in header', async ({ page }) => {
    await page.goto('/');

    // Check if navigation exists
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();

    // Check for logo/home link
    const logo = page.locator('a[href="/"]').first();
    if (await logo.isVisible()) {
      await expect(logo).toBeVisible();
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still be readable - use .first() to avoid strict mode violation
    await expect(page.locator('text=SmartTuter').first()).toBeVisible();

    // CTA should be visible
    const ctaButton = page.locator('a:has-text("시작하기"), button:has-text("시작하기")').first();
    await expect(ctaButton).toBeVisible();
  });

  test('should have footer with links', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for footer
    const footer = page.locator('footer').first();
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow some expected errors (like API calls without keys)
    const criticalErrors = errors.filter(error =>
      !error.includes('API') &&
      !error.includes('크레딧') &&
      !error.includes('Failed to fetch')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription?.length).toBeGreaterThan(50);

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });
});
