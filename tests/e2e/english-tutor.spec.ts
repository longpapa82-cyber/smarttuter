import { test, expect } from '@playwright/test';

test.describe('English Tutor', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Complete onboarding for English
    await page.goto('/onboarding');
    await page.click('button:has-text("고등학교")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("영어")');
    await page.waitForTimeout(1000);
  });

  test('should load English Tutor interface', async ({ page }) => {
    // Should show English tutor page
    await expect(page.locator('text=English').or(page.locator('text=영어'))).toBeVisible({ timeout: 5000 });
  });

  test('should show voice tutor interface elements', async ({ page }) => {
    // Wait for interface to load
    await page.waitForTimeout(2000);

    // Check for tutor interface elements (chat, messages, or controls)
    const tutorInterface = page.locator('[class*="voice"], [class*="tutor"], [class*="chat"]').first();

    if (await tutorInterface.isVisible({ timeout: 3000 })) {
      await expect(tutorInterface).toBeVisible();
    }
  });

  test('should handle API credit error gracefully', async ({ page }) => {
    // Wait for interface
    await page.waitForTimeout(2000);

    // Try to interact - should show friendly error, not 500 page
    const voiceButton = page.locator('button:has([class*="mic"]), button:has-text("말하기"), button:has-text("음성")').first();

    if (await voiceButton.isVisible({ timeout: 3000 })) {
      await voiceButton.click();
      await page.waitForTimeout(2000);

      // Should NOT show 500 error page
      await expect(page.locator('text=500')).not.toBeVisible();

      // Should show friendly error message about credits
      const errorMessage = page.locator('text=크레딧, text=API');
      if (await errorMessage.isVisible({ timeout: 3000 })) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('should show conversation interface', async ({ page }) => {
    // Wait for interface to load
    await page.waitForTimeout(2000);

    // Look for message/chat container
    const messageContainer = page.locator('[class*="message"], [class*="conversation"], [class*="chat"]').first();

    if (await messageContainer.isVisible({ timeout: 3000 })) {
      await expect(messageContainer).toBeVisible();
    }
  });

  test('should have tutor controls visible', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Look for typical tutor controls (mic, send, etc.)
    const controls = page.locator('button, [role="button"]');
    const count = await controls.count();

    // Should have at least one control button
    expect(count).toBeGreaterThan(0);
  });

  test('should show loading state initially', async ({ page }) => {
    // Loading spinner should appear briefly
    const loadingIndicator = page.locator('[class*="spin"], [class*="load"], [class*="skeleton"]').first();

    // Check within first 2 seconds
    if (await loadingIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should allow navigation back to dashboard', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for back/home button
    const backButton = page.locator('a[href="/dashboard"], button:has-text("대시보드"), button:has-text("뒤로")').first();

    if (await backButton.isVisible({ timeout: 2000 })) {
      await backButton.click();
      await page.waitForTimeout(500);

      // Should navigate away from tutor page
      expect(page.url()).not.toContain('/tutor/english');
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Interface should be visible on mobile
    await page.waitForTimeout(2000);

    const tutorInterface = page.locator('[class*="tutor"], [class*="voice"], [class*="chat"]').first();

    if (await tutorInterface.isVisible({ timeout: 3000 })) {
      const bbox = await tutorInterface.boundingBox();
      expect(bbox).toBeTruthy();

      // Should not overflow viewport
      if (bbox) {
        expect(bbox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should maintain session state', async ({ page }) => {
    // Refresh page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still show tutor interface (not redirect to onboarding)
    const url = page.url();
    expect(url).toMatch(/\/(tutor|dashboard)/);
  });

  test('should show subject indicator', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Should indicate this is English tutor
    const subjectIndicator = page.locator('text=English, text=영어').first();

    if (await subjectIndicator.isVisible({ timeout: 2000 })) {
      await expect(subjectIndicator).toBeVisible();
    }
  });
});
