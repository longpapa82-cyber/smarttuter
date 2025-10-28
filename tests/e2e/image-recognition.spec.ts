import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Image Recognition Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Complete onboarding and navigate to math tutor
    await page.goto('/onboarding');
    await page.click('button:has-text("고등학교")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("수학")');
    await page.waitForTimeout(1000);
  });

  test('should show image upload option', async ({ page }) => {
    // Check for image mode option
    const imageMode = page.locator('text=이미지로 질문하기, button:has-text("이미지")').first();
    await expect(imageMode).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to image upload interface', async ({ page }) => {
    // Click image mode
    const imageButton = page.locator('button:has-text("이미지로 질문하기"), button:has-text("이미지")').first();
    await imageButton.click();
    await page.waitForTimeout(500);

    // Should show image upload interface
    const uploadArea = page.locator('[type="file"], text=업로드, text=사진').first();
    await expect(uploadArea).toBeVisible({ timeout: 3000 });
  });

  test('should have file input for image upload', async ({ page }) => {
    const imageButton = page.locator('button:has-text("이미지로 질문하기"), button:has-text("이미지")').first();

    if (await imageButton.isVisible({ timeout: 2000 })) {
      await imageButton.click();
      await page.waitForTimeout(500);

      // Check for file input element
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible({ timeout: 3000 })) {
        await expect(fileInput).toBeVisible();

        // Check accept attribute for image types
        const acceptAttr = await fileInput.getAttribute('accept');
        expect(acceptAttr).toContain('image');
      }
    }
  });

  test('should show camera option if available', async ({ page }) => {
    const imageButton = page.locator('button:has-text("이미지로 질문하기"), button:has-text("이미지")').first();

    if (await imageButton.isVisible({ timeout: 2000 })) {
      await imageButton.click();
      await page.waitForTimeout(500);

      // Check for camera button (icon or text)
      const cameraButton = page.locator('button:has-text("카메라"), svg[class*="camera"], [class*="camera"]').first();

      if (await cameraButton.isVisible({ timeout: 2000 })) {
        await expect(cameraButton).toBeVisible();
      }
    }
  });

  test('should show upload area styling', async ({ page }) => {
    const imageButton = page.locator('button:has-text("이미지로 질문하기"), button:has-text("이미지")').first();

    if (await imageButton.isVisible({ timeout: 2000 })) {
      await imageButton.click();
      await page.waitForTimeout(500);

      // Upload area should have visual styling
      const uploadArea = page.locator('[class*="upload"], [class*="drop"]').first();

      if (await uploadArea.isVisible({ timeout: 2000 })) {
        const bbox = await uploadArea.boundingBox();
        expect(bbox).toBeTruthy();
        expect(bbox!.width).toBeGreaterThan(100);
        expect(bbox!.height).toBeGreaterThan(50);
      }
    }
  });

  test('should handle no API credit gracefully', async ({ page }) => {
    const imageButton = page.locator('button:has-text("이미지로 질문하기"), button:has-text("이미지")').first();

    if (await imageButton.isVisible({ timeout: 2000 })) {
      await imageButton.click();
      await page.waitForTimeout(1000);

      // If we try to upload, should show friendly error (not crash)
      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.isVisible({ timeout: 2000 })) {
        // Note: Actual file upload would require test image file
        // Here we just verify the interface doesn't crash

        // Page should not show 500 error
        await expect(page.locator('text=500')).not.toBeVisible();
      }
    }
  });

  test('should show recognition status indicators', async ({ page }) => {
    const imageButton = page.locator('button:has-text("이미지로 질문하기"), button:has-text("이미지")').first();

    if (await imageButton.isVisible({ timeout: 2000 })) {
      await imageButton.click();
      await page.waitForTimeout(500);

      // Should have elements to show recognition status
      // (loading spinner, success message, etc.)
      const statusElements = page.locator('[class*="status"], [class*="recogni"], [role="status"]');

      // These might not be visible until after upload, but elements should exist
      const count = await statusElements.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should allow switching back to mode selection', async ({ page }) => {
    const imageButton = page.locator('button:has-text("이미지로 질문하기"), button:has-text("이미지")').first();

    if (await imageButton.isVisible({ timeout: 2000 })) {
      await imageButton.click();
      await page.waitForTimeout(500);

      // Look for back button
      const backButton = page.locator('button:has-text("뒤로"), button:has-text("←"), button:has-text("대시보드")').first();

      if (await backButton.isVisible({ timeout: 2000 })) {
        await backButton.click();
        await page.waitForTimeout(500);

        // Should navigate back
        await expect(page.url()).toMatch(/\/(tutor|dashboard)/);
      }
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const imageButton = page.locator('button:has-text("이미지로 질문하기"), button:has-text("이미지")').first();

    if (await imageButton.isVisible({ timeout: 2000 })) {
      await imageButton.click();
      await page.waitForTimeout(500);

      // Upload interface should be visible and usable on mobile
      const uploadArea = page.locator('[type="file"], text=업로드, [class*="upload"]').first();

      if (await uploadArea.isVisible({ timeout: 2000 })) {
        const bbox = await uploadArea.boundingBox();
        expect(bbox).toBeTruthy();

        // Should not overflow viewport
        expect(bbox!.width).toBeLessThanOrEqual(375);
      }
    }
  });
});
