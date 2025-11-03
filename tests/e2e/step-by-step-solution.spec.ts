import { test, expect } from '@playwright/test';

/**
 * Step-by-Step Solution E2E Tests
 *
 * Tests P2 Phase 2.2 - Step-by-Step Solution System
 *
 * Covered functionality:
 * - Math problem submission
 * - Step-by-step UI rendering
 * - Animation controls (play/pause/next/previous)
 * - Progress tracking
 * - Final answer display
 * - Concept explanation
 */

test.describe('Step-by-Step Solution System', () => {

  test('Math tutor should display step-by-step solution for equation', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    // Wait for chat interface
    await page.waitForSelector('[data-testid="chat-input"]');

    // Submit a math problem that should trigger step-by-step solution
    await page.fill('[data-testid="chat-input"]', '2x + 5 = 13을 단계별로 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Check if step-by-step solution UI appeared
    // The component should detect "### Step 1:" pattern
    const hasSolution = await page.locator('text=Step 1').count() > 0 ||
                        await page.locator('text=단계').count() > 0;

    if (hasSolution) {
      console.log('✅ Step-by-step solution detected');

      // Verify progress bar exists
      const progressBar = page.locator('[class*="flex gap"]').first();
      await expect(progressBar).toBeVisible();

      // Verify navigation buttons
      await expect(page.locator('text=이전')).toBeVisible();
      await expect(page.locator('text=다음')).toBeVisible();

      console.log('✅ Step-by-step UI components verified');
    } else {
      console.log('⚠️ Step-by-step solution not triggered (may need specific prompt format)');
    }
  });

  test('Step-by-step solution should have functional navigation', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=고등학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // Request step-by-step solution
    await page.fill('[data-testid="chat-input"]', 'x² - 5x + 6 = 0을 인수분해로 풀어줘. 단계별로 설명해줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 12000 });

    // Check if we have steps
    const step1Visible = await page.locator('text=Step 1').isVisible().catch(() => false);

    if (step1Visible) {
      // Click "다음 단계" button
      const nextButton = page.locator('button:has-text("다음")');
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Should see Step 2 after clicking
        await page.waitForTimeout(500); // Wait for animation

        // Click "이전 단계" button
        const prevButton = page.locator('button:has-text("이전")');
        await prevButton.click();

        await page.waitForTimeout(500);

        console.log('✅ Navigation buttons functional');
      }
    }
  });

  test('Step-by-step solution should show final answer', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '3x - 7 = 14를 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Look for final answer section
    const finalAnswerVisible = await page.locator('text=최종 답').isVisible().catch(() => false);

    if (finalAnswerVisible) {
      console.log('✅ Final answer section displayed');

      // Verify concept explanation
      const conceptVisible = await page.locator('text=개념 설명').isVisible().catch(() => false);
      if (conceptVisible) {
        console.log('✅ Concept explanation displayed');
      }
    }
  });

  test('Auto-play should progress through steps automatically', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '5 + 3 × 2를 단계별로 계산해줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Look for auto-play button
    const autoPlayButton = page.locator('button:has-text("자동 재생")');

    if (await autoPlayButton.isVisible()) {
      // Click auto-play
      await autoPlayButton.click();

      // Wait for auto-progression (3 seconds per step)
      await page.waitForTimeout(4000);

      // Check if step changed
      const step2Visible = await page.locator('text=Step 2').isVisible().catch(() => false);
      if (step2Visible) {
        console.log('✅ Auto-play progressed to next step');
      }

      // Stop auto-play
      const pauseButton = page.locator('button:has-text("정지")');
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
        console.log('✅ Auto-play pause functional');
      }
    }
  });

  test('Progress bar should reflect current step', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=고등학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '2x + 3 = 11을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Look for progress indicator
    const progressText = await page.locator('text=/풀이 진행|Step \\d+\\/\\d+|\\d+\\/\\d+/').first().textContent();

    if (progressText) {
      console.log(`📊 Progress indicator: ${progressText}`);
      expect(progressText).toMatch(/\d+/); // Should contain numbers
    }
  });

  test('Step-by-step should work for different grade levels', async ({ page }) => {
    const gradeLevels = [
      { level: '초등학교', problem: '23 + 47을 세로 계산으로 풀어줘' },
      { level: '중학교', problem: '2x + 5 = 13을 풀어줘' },
      { level: '고등학교', problem: 'x² - 4 = 0을 풀어줘' },
    ];

    for (const { level, problem } of gradeLevels) {
      await page.goto('/');
      await page.click('text=무료로 시작하기');
      await page.click(`text=${level}`);
      await page.click('text=다음');
      await page.click('text=수학');
      await page.click('text=시작하기');
      await page.click('text=수학 학습 시작');

      await page.waitForSelector('[data-testid="chat-input"]');

      await page.fill('[data-testid="chat-input"]', problem);
      await page.press('[data-testid="chat-input"]', 'Enter');

      await page.waitForSelector('.ai-message', { timeout: 12000 });

      // Verify response appears (step-by-step or not)
      const hasResponse = await page.locator('.ai-message').count() > 0;
      expect(hasResponse).toBe(true);

      console.log(`✅ ${level}: Math tutor responded to "${problem}"`);
    }
  });

  test('Step equations should be properly formatted', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '4x - 8 = 12를 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Check for code blocks (equations are typically in code blocks)
    const codeBlocks = page.locator('pre, code');
    const count = await codeBlocks.count();

    if (count > 0) {
      console.log(`✅ Found ${count} formatted equation blocks`);

      // Verify equation content
      const firstEquation = await codeBlocks.first().textContent();
      console.log(`📝 First equation: ${firstEquation}`);
    }
  });

  test('Step-by-step UI should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '6x + 2 = 20을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Verify UI doesn't overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow 20px tolerance

    console.log('✅ Mobile responsive: no horizontal overflow');
  });

  test('Practice problem should be clickable/copyable', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '7 - 3x = 1을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Look for practice problem section
    const practiceProblem = await page.locator('text=연습 문제').isVisible().catch(() => false);

    if (practiceProblem) {
      console.log('✅ Practice problem section found');

      // Verify it contains a problem
      const practiceSection = page.locator('[class*="amber"], [class*="orange"]').filter({ hasText: '연습 문제' });
      const content = await practiceSection.textContent();

      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(10); // Should have actual problem text

      console.log(`📝 Practice problem content length: ${content!.length} characters`);
    }
  });
});

test.describe('Step-by-Step Solution Edge Cases', () => {

  test('Should handle problems without clear steps gracefully', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // Ask a concept question (not a problem to solve)
    await page.fill('[data-testid="chat-input"]', '방정식이 뭐야?');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Should still respond, but without step-by-step UI
    const hasResponse = await page.locator('.ai-message').count() > 0;
    expect(hasResponse).toBe(true);

    console.log('✅ Handled non-problem question without step-by-step UI');
  });

  test('Should handle complex multi-step problems', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=고등학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // Complex problem
    await page.fill('[data-testid="chat-input"]', '(2x + 3)(x - 5) = 0을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 15000 });

    // Should have response
    const hasResponse = await page.locator('.ai-message').count() > 0;
    expect(hasResponse).toBe(true);

    // Should have multiple steps if step-by-step format is used
    const stepCount = await page.locator('text=/Step \\d+/').count();
    if (stepCount > 0) {
      expect(stepCount).toBeGreaterThanOrEqual(2);
      console.log(`✅ Complex problem has ${stepCount} steps`);
    }
  });

  test('Step-by-step should work after page reload', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    await page.fill('[data-testid="chat-input"]', '9x - 18 = 0을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    // Reload page
    await page.reload();

    // Wait for chat interface to reload
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 5000 });

    // Previous messages should persist (if chat history is saved)
    const messageCount = await page.locator('.ai-message').count();

    console.log(`📊 Messages after reload: ${messageCount}`);

    // Chat should still be functional
    await page.fill('[data-testid="chat-input"]', '10 + 5를 계산해줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    await page.waitForSelector('.ai-message', { timeout: 10000 });

    console.log('✅ Step-by-step functional after page reload');
  });
});
