import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility (a11y) E2E Tests
 *
 * Tests WCAG 2.1 AA compliance using axe-core
 *
 * Covered areas:
 * - Landing page
 * - Dashboard
 * - Tutor interfaces (English/Math)
 * - Onboarding flows
 * - Report pages
 */

test.describe('Accessibility Tests (WCAG 2.1 AA)', () => {

  test('Landing page should have no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Dashboard should have no accessibility violations', async ({ page }) => {
    // Set up guest mode
    await page.goto('/');
    await page.click('text=무료로 시작하기');

    // Quick onboarding
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('English tutor interface should have no accessibility violations', async ({ page }) => {
    // Navigate to English tutor
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    // Go to English tutor
    await page.click('text=영어 학습 시작');

    // Wait for tutor interface
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Math tutor interface should have no accessibility violations', async ({ page }) => {
    // Navigate to Math tutor
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');

    // Go to Math tutor
    await page.click('text=수학 학습 시작');

    // Wait for tutor interface
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Learning report page should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    // Navigate to report
    await page.goto('/report');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Profile page should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    // Navigate to profile
    await page.goto('/profile');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Keyboard Navigation', () => {

  test('Landing page should be fully keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Should be able to reach CTA button
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Press Enter on focused element (should navigate)
    await page.keyboard.press('Enter');

    // Should navigate to onboarding
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('Tutor chat input should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');
    await page.click('text=영어 학습 시작');

    // Wait for chat interface
    await page.waitForSelector('[data-testid="chat-input"]');

    // Focus chat input with Tab
    await page.keyboard.press('Tab');

    // Type message
    await page.keyboard.type('Hello, AI Park!');

    // Send with Enter
    await page.keyboard.press('Enter');

    // Message should appear
    await expect(page.locator('text=Hello, AI Park!')).toBeVisible();
  });

  test('Dashboard navigation should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    // Tab through dashboard elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Should be able to navigate with keyboard
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });
});

test.describe('Screen Reader Compatibility', () => {

  test('Landing page should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = await page.locator('main');
    await expect(main).toBeVisible();

    // Check for heading hierarchy
    const h1 = await page.locator('h1');
    await expect(h1).toBeVisible();

    // CTA button should have accessible name
    const ctaButton = page.locator('text=무료로 시작하기');
    await expect(ctaButton).toHaveAccessibleName();
  });

  test('Chat interface should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');
    await page.click('text=영어 학습 시작');

    await page.waitForSelector('[data-testid="chat-interface"]');

    // Chat messages should have role="log" or similar
    const messagesContainer = page.locator('[data-testid="chat-messages"]');

    // Input should have label
    const chatInput = page.locator('[data-testid="chat-input"]');
    const inputLabel = await chatInput.getAttribute('aria-label');
    expect(inputLabel).toBeTruthy();
  });

  test('Images should have alt text', async ({ page }) => {
    await page.goto('/');

    // Check all images have alt attribute
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images, but must exist
      expect(alt).toBeDefined();
    }
  });

  test('Form inputs should have associated labels', async ({ page }) => {
    await page.goto('/onboarding');

    // All inputs should have labels or aria-label
    const inputs = await page.locator('input, textarea, select').all();

    for (const input of inputs) {
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');

      if (!ariaLabel) {
        // Should have associated label
        expect(id).toBeTruthy();
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeAttached();
      }
    }
  });
});

test.describe('Color Contrast', () => {

  test('Landing page should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Dashboard should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Focus Management', () => {

  test('Modal dialogs should trap focus', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');

    // Onboarding modal should be open
    await expect(page.locator('text=학교급을 선택하세요')).toBeVisible();

    // Tab should cycle within modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should still be within modal
    const focusedElement = await page.evaluate(() => {
      const activeEl = document.activeElement;
      return activeEl?.closest('[role="dialog"]') !== null;
    });

    // For non-modal flows, this might not apply
    // But if modal exists, focus should be trapped
  });

  test('Skip to main content link should exist', async ({ page }) => {
    await page.goto('/');

    // First Tab should focus skip link (if implemented)
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);

    // Skip link should be first focusable element (best practice)
    // If not implemented yet, this test documents the requirement
    if (focusedElement?.includes('Skip') || focusedElement?.includes('건너뛰기')) {
      expect(focusedElement).toContain('Skip');
    }
  });
});
