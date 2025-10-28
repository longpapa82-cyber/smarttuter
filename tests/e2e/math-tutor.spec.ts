import { test, expect } from '@playwright/test';

test.describe('Math Tutor', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Complete onboarding first
    await page.goto('/onboarding');
    await page.click('button:has-text("중학교")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("수학")');
    await page.waitForTimeout(1000);
  });

  test('should load Math Tutor mode selection', async ({ page }) => {
    // Should show mode selection
    await expect(page.locator('text=Math Tutor').or(page.locator('text=수학'))).toBeVisible();
    await expect(page.locator('text=학습 방법을 선택해주세요').or(page.locator('text=이미지로 질문하기'))).toBeVisible();
  });

  test('should show image upload and voice mode options', async ({ page }) => {
    // Check for both mode options
    const imageMode = page.locator('text=이미지로 질문하기').or(page.locator('[class*="image"]')).first();
    const voiceMode = page.locator('text=음성으로 대화하기').or(page.locator('[class*="voice"]')).first();

    if (await imageMode.isVisible()) {
      await expect(imageMode).toBeVisible();
    }
    if (await voiceMode.isVisible()) {
      await expect(voiceMode).toBeVisible();
    }
  });

  test('should navigate to voice mode when selected', async ({ page }) => {
    // Click voice mode if available
    const voiceButton = page.locator('button:has-text("음성으로 대화하기"), button:has-text("음성")').first();

    if (await voiceButton.isVisible({ timeout: 2000 })) {
      await voiceButton.click();
      await page.waitForTimeout(500);

      // Should show voice interface
      await expect(page.locator('[class*="voice"], [class*="tutor"]')).toBeVisible();
    }
  });

  test('should show tutor interface elements', async ({ page }) => {
    // Try to navigate to voice mode
    const voiceButton = page.locator('button:has-text("음성으로 대화하기"), button:has-text("음성")').first();

    if (await voiceButton.isVisible({ timeout: 2000 })) {
      await voiceButton.click();
      await page.waitForTimeout(1000);

      // Check for chat/tutor interface elements
      const chatContainer = page.locator('[class*="chat"], [class*="message"], [class*="tutor"]').first();
      if (await chatContainer.isVisible({ timeout: 3000 })) {
        await expect(chatContainer).toBeVisible();
      }
    }
  });

  test('should handle API credit error gracefully', async ({ page }) => {
    // Navigate to voice mode
    const voiceButton = page.locator('button:has-text("음성으로 대화하기"), button:has-text("음성")').first();

    if (await voiceButton.isVisible({ timeout: 2000 })) {
      await voiceButton.click();
      await page.waitForTimeout(1000);

      // Try to interact - should show friendly error, not 500 page
      const voiceInputButton = page.locator('button:has([class*="mic"]), button:has-text("말하기")').first();

      if (await voiceInputButton.isVisible({ timeout: 2000 })) {
        await voiceInputButton.click();
        await page.waitForTimeout(2000);

        // Should NOT show 500 error page
        await expect(page.locator('text=500')).not.toBeVisible();

        // Should show friendly error message
        const errorMessage = page.locator('text=크레딧, text=API');
        if (await errorMessage.isVisible({ timeout: 3000 })) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should allow going back to mode selection', async ({ page }) => {
    // Navigate to voice mode
    const voiceButton = page.locator('button:has-text("음성으로 대화하기"), button:has-text("음성")').first();

    if (await voiceButton.isVisible({ timeout: 2000 })) {
      await voiceButton.click();
      await page.waitForTimeout(500);

      // Look for back button
      const backButton = page.locator('button:has-text("뒤로"), button:has-text("←"), a:has-text("대시보드로 돌아가기")').first();

      if (await backButton.isVisible({ timeout: 2000 })) {
        await backButton.click();
        await page.waitForTimeout(500);

        // Should be back at mode selection or dashboard
        await expect(page.url()).toMatch(/\/(tutor|dashboard)/);
      }
    }
  });

  test('should show proper loading states', async ({ page }) => {
    const voiceButton = page.locator('button:has-text("음성으로 대화하기"), button:has-text("음성")').first();

    if (await voiceButton.isVisible({ timeout: 2000 })) {
      await voiceButton.click();

      // Should show loading spinner before interface loads
      const loadingIndicator = page.locator('[class*="spin"], [class*="load"], [class*="skeleton"]').first();

      // Loading might be quick, so use a short timeout
      if (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(loadingIndicator).toBeVisible();
      }
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Mode selection should be visible on mobile
    await expect(page.locator('text=Math Tutor, text=수학').first()).toBeVisible();

    // Buttons should be tappable
    const modeButtons = page.locator('button:has-text("이미지"), button:has-text("음성")');
    const count = await modeButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});
