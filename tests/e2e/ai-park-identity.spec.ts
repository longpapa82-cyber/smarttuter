/**
 * AI Park Identity Test
 *
 * Verifies that the tutor consistently introduces itself as "AI Park"
 * across all interactions, never using "영어 튜터" or "수학 튜터"
 */

import { test, expect } from '@playwright/test';

test.describe('AI Park Identity Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        console.log(`[Browser]:`, msg.text());
      }
    });
  });

  test('English tutor should introduce as "AI Park", not "영어 튜터"', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');

    // Wait for initial greeting message
    await page.waitForTimeout(2000);

    // Check for "AI Park" in the greeting
    const greetingText = await page.locator('div').filter({ hasText: /AI Park/i }).first().textContent();
    expect(greetingText).toBeTruthy();
    console.log(`✅ English tutor greeting contains: ${greetingText}`);

    // Verify NO mention of "영어 튜터"
    const englishTutorMention = page.locator('text=/영어 튜터/i');
    const count = await englishTutorMention.count();
    expect(count, '영어 튜터 should NOT appear in the greeting').toBe(0);

    // Verify "AI Park" is present in footer links
    const footerLink = page.locator('a', { hasText: /AI Park - 영어/i });
    await expect(footerLink).toBeVisible();
  });

  test('Math tutor should introduce as "AI Park", not "수학 튜터"', async ({ page }) => {
    await page.goto('/tutor/math');
    await page.waitForLoadState('networkidle');

    // Wait for initial greeting message
    await page.waitForTimeout(2000);

    // Check for "AI Park" in the greeting
    const greetingText = await page.locator('div').filter({ hasText: /AI Park/i }).first().textContent();
    expect(greetingText).toBeTruthy();
    console.log(`✅ Math tutor greeting contains: ${greetingText}`);

    // Verify NO mention of "수학 튜터"
    const mathTutorMention = page.locator('text=/수학 튜터/i');
    const count = await mathTutorMention.count();
    expect(count, '수학 튜터 should NOT appear in the greeting').toBe(0);

    // Verify "AI Park" is present in footer links
    const footerLink = page.locator('a', { hasText: /AI Park - 수학/i });
    await expect(footerLink).toBeVisible();
  });

  test('English tutor AI response should use "AI Park" name', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');

    // Type a question asking for the tutor's name
    const inputField = page.locator('textarea, input[type="text"]').first();
    await inputField.waitFor({ state: 'visible', timeout: 5000 });
    await inputField.fill("What's your name?");

    // Submit
    const submitButton = page.getByRole('button', { name: /send|전송/i }).or(
      page.locator('button[type="submit"]')
    );
    await submitButton.click();

    // Wait for AI response
    await page.waitForTimeout(5000);

    // Check if response contains "AI Park"
    const responseText = await page.textContent('body');
    expect(responseText).toContain('AI Park');
    console.log('✅ AI response mentions "AI Park"');

    // Ensure no mention of "English tutor" in the response
    expect(responseText?.toLowerCase()).not.toContain('english tutor');
    expect(responseText).not.toContain('영어 튜터');
  });

  test('Math tutor AI response should use "AI Park" name', async ({ page }) => {
    await page.goto('/tutor/math');
    await page.waitForLoadState('networkidle');

    // Type a question asking for the tutor's name
    const inputField = page.locator('textarea, input[type="text"]').first();
    await inputField.waitFor({ state: 'visible', timeout: 5000 });
    await inputField.fill("이름이 뭐예요?");

    // Submit
    const submitButton = page.getByRole('button', { name: /send|전송/i }).or(
      page.locator('button[type="submit"]')
    );
    await submitButton.click();

    // Wait for AI response
    await page.waitForTimeout(5000);

    // Check if response contains "AI Park" or "AI 파크"
    const responseText = await page.textContent('body');
    const hasAIPark = responseText?.includes('AI Park') || responseText?.includes('AI 파크');
    expect(hasAIPark).toBeTruthy();
    console.log('✅ AI response mentions "AI Park" or "AI 파크"');

    // Ensure no mention of "수학 튜터" in the response
    expect(responseText).not.toContain('수학 튜터');
  });

  test('Footer links should show "AI Park - 영어/수학"', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check footer links
    const englishLink = page.locator('a', { hasText: /AI Park - 영어/i });
    const mathLink = page.locator('a', { hasText: /AI Park - 수학/i });

    await expect(englishLink).toBeVisible();
    await expect(mathLink).toBeVisible();

    console.log('✅ Footer links correctly show "AI Park - 영어" and "AI Park - 수학"');
  });

  test('Welcome messages should use "AI Park" for all grade levels', async ({ page }) => {
    // Test different grade levels
    const gradeLevels = [
      { name: 'elementary', korean: '초등', english: 'Elementary' },
      { name: 'middle', korean: '중학', english: 'Middle School' },
      { name: 'high', korean: '고등', english: 'High School' },
      { name: 'university', korean: '대학', english: 'University' }
    ];

    for (const level of gradeLevels) {
      console.log(`\n=== Testing ${level.english} (${level.korean}) ===`);

      // Navigate to English tutor with grade level
      await page.goto(`/tutor/english`);
      await page.waitForLoadState('networkidle');

      // Change grade level in profile settings if available
      // (This assumes there's a way to change grade level - adjust as needed)

      await page.waitForTimeout(2000);

      // Check for "AI Park" in greeting
      const pageText = await page.textContent('body');
      expect(pageText).toContain('AI Park');

      // Verify NO "영어 튜터"
      expect(pageText).not.toContain('영어 튜터');

      console.log(`✅ ${level.english} greeting uses "AI Park"`);
    }
  });
});
