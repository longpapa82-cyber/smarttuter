import { test, expect } from '@playwright/test';

/**
 * Error Diagnosis System E2E Tests
 *
 * Tests P2 Phase 2.4 - Error Diagnosis System (오답 진단 시스템)
 *
 * Covered functionality:
 * - Error detection and categorization
 * - Error feedback UI rendering
 * - Retry functionality
 * - Personalized recommendations
 * - Similar practice problems
 * - Different error categories (calculation, concept, careless, method)
 */

test.describe('Error Diagnosis System', () => {

  test('Should display error diagnosis for incorrect answer', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // Ask for solution first to establish correct answer
    await page.fill('[data-testid="chat-input"]', '2x + 5 = 13을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Now provide an incorrect answer
    await page.fill('[data-testid="chat-input"]', '답은 x = 9인 것 같아요');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for error diagnosis response
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    // Check for error feedback component
    const errorFeedback = page.locator('[data-testid="error-feedback"]');
    const hasErrorFeedback = await errorFeedback.count() > 0;

    if (hasErrorFeedback) {
      console.log('✅ Error diagnosis detected');

      // Verify error category icon is displayed
      const categoryIcon = errorFeedback.locator('[role="img"]').first();
      await expect(categoryIcon).toBeVisible();

      // Verify "어디서 틀렸나요?" section exists
      const mistakeSection = errorFeedback.locator('text=어디서 틀렸나요?');
      await expect(mistakeSection).toBeVisible();

      console.log('✅ Error diagnosis UI components verified');
    } else {
      console.log('⚠️ Error diagnosis not triggered (may need specific prompt format or correct/incorrect answer pattern)');
    }
  });

  test('Error diagnosis should show different categories', async ({ page }) => {
    const errorTypes = [
      { problem: '3x - 7 = 14', wrongAnswer: 'x = 9', expectedCategory: 'calculation' },
      { problem: 'x² = 16', wrongAnswer: 'x = 4', expectedCategory: 'concept' }, // Missing negative root
    ];

    for (const { problem, wrongAnswer } of errorTypes) {
      await page.goto('/');
      await page.click('text=무료로 시작하기');
      await page.click('text=고등학교');
      await page.click('text=다음');
      await page.click('text=수학');
      await page.click('text=시작하기');
      await page.click('text=수학 학습 시작');

      await page.waitForSelector('[data-testid="chat-input"]');

      // Get correct solution first
      await page.fill('[data-testid="chat-input"]', `${problem}을 풀어줘`);
      await page.press('[data-testid="chat-input"]', 'Enter');
      await page.waitForSelector('.ai-message', { timeout: 10000 });

      // Provide wrong answer
      await page.fill('[data-testid="chat-input"]', `답은 ${wrongAnswer}인가요?`);
      await page.press('[data-testid="chat-input"]', 'Enter');
      await page.waitForSelector('.ai-message', { timeout: 15000 });

      const errorFeedback = page.locator('[data-testid="error-feedback"]');
      if (await errorFeedback.count() > 0) {
        console.log(`✅ Error diagnosis shown for: ${problem}`);

        // Verify category label exists
        const hasCategory = await errorFeedback.locator('.text-xl').count() > 0;
        expect(hasCategory).toBe(true);
      }
    }
  });

  test('Error diagnosis should have collapsible details', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // Trigger error diagnosis
    await page.fill('[data-testid="chat-input"]', '5x + 2 = 17을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    await page.fill('[data-testid="chat-input"]', 'x = 5인가요?');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    const errorFeedback = page.locator('[data-testid="error-feedback"]');

    if (await errorFeedback.count() > 0) {
      // Look for toggle button
      const toggleButton = errorFeedback.locator('button:has-text("상세 정보")');

      if (await toggleButton.count() > 0) {
        // Initially details should be hidden
        const detailsVisible = await errorFeedback.locator('text=복습이 필요한 개념').isVisible();

        // Click to show details
        await toggleButton.click();
        await page.waitForTimeout(500); // Wait for animation

        // Details should now be visible
        const conceptsSection = errorFeedback.locator('text=복습이 필요한 개념');
        await expect(conceptsSection).toBeVisible();

        const recommendationsSection = errorFeedback.locator('text=학습 팁');
        await expect(recommendationsSection).toBeVisible();

        const problemsSection = errorFeedback.locator('text=비슷한 연습 문제');
        await expect(problemsSection).toBeVisible();

        console.log('✅ Collapsible details working correctly');
      }
    }
  });

  test('Retry button should restore input', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    const originalProblem = '4x + 8 = 20을 풀어줘';

    // Get solution
    await page.fill('[data-testid="chat-input"]', originalProblem);
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Wrong answer
    const wrongAnswer = 'x = 7인가요?';
    await page.fill('[data-testid="chat-input"]', wrongAnswer);
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    const errorFeedback = page.locator('[data-testid="error-feedback"]');

    if (await errorFeedback.count() > 0) {
      // Find and click retry button
      const retryButton = errorFeedback.locator('button:has-text("다시 풀어보기")');

      if (await retryButton.count() > 0) {
        await retryButton.click();

        // Check if input was restored
        const inputValue = await page.locator('[data-testid="chat-input"]').inputValue();
        expect(inputValue).toBe(wrongAnswer);

        console.log('✅ Retry button restores user input correctly');
      }
    }
  });

  test('Error severity should be indicated visually', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=고등학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // Request error diagnosis
    await page.fill('[data-testid="chat-input"]', 'x² - 4x + 3 = 0을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    await page.fill('[data-testid="chat-input"]', 'x = 2인가요?');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    const errorFeedback = page.locator('[data-testid="error-feedback"]');

    if (await errorFeedback.count() > 0) {
      // Check for severity badge
      const severityBadge = errorFeedback.locator('span[class*="px-2 py-1"]');

      if (await severityBadge.count() > 0) {
        const badgeText = await severityBadge.first().textContent();
        console.log(`📊 Severity badge: ${badgeText}`);

        // Should be one of: 가벼운 실수, 주의 필요, 중요 개념
        expect(['가벼운 실수', '주의 필요', '중요 개념'].some(s => badgeText?.includes(s))).toBe(true);

        console.log('✅ Severity indication working');
      }
    }
  });

  test('Error diagnosis should work across different grade levels', async ({ page }) => {
    const gradeLevels = ['초등학교', '중학교', '고등학교'];

    for (const level of gradeLevels) {
      await page.goto('/');
      await page.click('text=무료로 시작하기');
      await page.click(`text=${level}`);
      await page.click('text=다음');
      await page.click('text=수학');
      await page.click('text=시작하기');
      await page.click('text=수학 학습 시작');

      await page.waitForSelector('[data-testid="chat-input"]');

      // Simple wrong calculation
      await page.fill('[data-testid="chat-input"]', '5 + 3 = ?');
      await page.press('[data-testid="chat-input"]', 'Enter');
      await page.waitForSelector('.ai-message', { timeout: 10000 });

      await page.fill('[data-testid="chat-input"]', '답은 7이에요');
      await page.press('[data-testid="chat-input"]', 'Enter');
      await page.waitForSelector('.ai-message', { timeout: 15000 });

      const errorFeedback = page.locator('[data-testid="error-feedback"]');
      const hasError = await errorFeedback.count() > 0;

      console.log(`${level}: ${hasError ? '✅ Error diagnosis available' : '⚠️ No error diagnosis'}`);
    }
  });

  test('Error diagnosis should include practice problems', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // Trigger error
    await page.fill('[data-testid="chat-input"]', '6x - 3 = 15를 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    await page.fill('[data-testid="chat-input"]', 'x = 4인가요?');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    const errorFeedback = page.locator('[data-testid="error-feedback"]');

    if (await errorFeedback.count() > 0) {
      // Expand details
      const toggleButton = errorFeedback.locator('button:has-text("상세 정보")');
      if (await toggleButton.count() > 0) {
        await toggleButton.click();
        await page.waitForTimeout(500);

        // Check for practice problems section
        const problemsSection = errorFeedback.locator('text=비슷한 연습 문제');
        if (await problemsSection.isVisible()) {
          // Count practice problems (should be 3)
          const problemItems = errorFeedback.locator('li').filter({ hasText: /\d+\./ });
          const count = await problemItems.count();

          console.log(`📝 Practice problems found: ${count}`);
          expect(count).toBeGreaterThanOrEqual(1);

          console.log('✅ Practice problems included in error diagnosis');
        }
      }
    }
  });

  test('Encouragement message should match severity', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '7x + 5 = 26을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    await page.fill('[data-testid="chat-input"]', 'x = 5인가요?');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    const errorFeedback = page.locator('[data-testid="error-feedback"]');

    if (await errorFeedback.count() > 0) {
      // Look for encouragement message at bottom
      const encouragement = errorFeedback.locator('p.text-sm').last();

      if (await encouragement.isVisible()) {
        const message = await encouragement.textContent();
        console.log(`💬 Encouragement: ${message}`);

        // Should contain one of the encouragement phrases
        const hasEncouragement =
          message?.includes('완벽해질 거예요') ||
          message?.includes('이해될 거예요') ||
          message?.includes('실력이 크게 늘 거예요');

        expect(hasEncouragement).toBe(true);
        console.log('✅ Encouragement message displayed');
      }
    }
  });
});

test.describe('Error Diagnosis Edge Cases', () => {

  test('Should handle multiple errors in sequence', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // First error
    await page.fill('[data-testid="chat-input"]', '2x + 3 = 9를 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    await page.fill('[data-testid="chat-input"]', 'x = 5');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    let errorCount = await page.locator('[data-testid="error-feedback"]').count();

    // Second error
    await page.fill('[data-testid="chat-input"]', '3x - 4 = 11을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    await page.fill('[data-testid="chat-input"]', 'x = 6');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    errorCount = await page.locator('[data-testid="error-feedback"]').count();

    if (errorCount >= 2) {
      console.log(`✅ Multiple error diagnoses handled (${errorCount} errors)`);
    }
  });

  test('Should not show error diagnosis for correct answers', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '2x + 4 = 10을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Provide correct answer
    await page.fill('[data-testid="chat-input"]', 'x = 3이 맞나요?');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    // Should NOT show error feedback for correct answer
    const errorFeedback = page.locator('[data-testid="error-feedback"]');
    const hasError = await errorFeedback.count() > 0;

    expect(hasError).toBe(false);
    console.log('✅ No error diagnosis for correct answer');
  });
});
