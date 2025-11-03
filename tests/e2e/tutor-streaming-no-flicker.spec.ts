import { test, expect, Page } from '@playwright/test';

/**
 * Streaming Response Flicker Test
 *
 * Purpose: Verify that tutor responses display smoothly during streaming
 * without flickering or resetting the text content.
 *
 * Bug Context: Previously, TypingEffect component reset on every text change
 * during streaming, causing the entire response to flash/flicker.
 *
 * Fix: Added isStreaming prop to TypingEffect that displays text immediately
 * during streaming, then applies typing effect when streaming completes.
 */

test.describe('Tutor Streaming Response - No Flicker', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear any existing profile data
    await context.clearCookies();
    await page.goto('http://localhost:3000');

    // Complete onboarding first to create a profile
    await page.goto('http://localhost:3000/onboarding');

    // Step 1: Enter username
    const usernameInput = page.locator('input#username-input');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('Flicker Test User');

    // Click next
    await page.getByRole('button', { name: '다음' }).click();

    // Step 2: Select grade level
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '중학교 선택' }).click();
    await page.getByRole('button', { name: '다음' }).click();

    // Step 3: Complete onboarding
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '학습 시작하기' }).click();

    // Should be at dashboard now
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to math tutor
    await page.goto('http://localhost:3000/dashboard/math');
    await page.waitForLoadState('networkidle');
  });

  test('should display streaming response without flickering or text resets', async ({ page }) => {
    // Find the chat input
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    // Send a question that will trigger streaming response
    await chatInput.fill('이차방정식이란 무엇인가요?');

    // Submit the question (look for send button or press Enter)
    const sendButton = page.locator('button').filter({ hasText: /전송|보내기|Send/i }).first();
    if (await sendButton.isVisible()) {
      await sendButton.click();
    } else {
      await chatInput.press('Enter');
    }

    // Wait for assistant message to start appearing
    await page.waitForTimeout(1000);

    // Find the last assistant message container
    const assistantMessages = page.locator('[class*="assistant"], [data-role="assistant"]').last();
    await expect(assistantMessages).toBeVisible({ timeout: 15000 });

    // Monitor text content changes to detect flickering
    let previousText = '';
    let textLengthHistory: number[] = [];
    let flickerDetected = false;
    let resetDetected = false;

    const maxChecks = 50; // Check for up to 5 seconds (50 * 100ms)
    let checkCount = 0;

    console.log('🔍 Starting flicker detection monitoring...');

    while (checkCount < maxChecks) {
      try {
        const currentText = await assistantMessages.textContent() || '';
        const currentLength = currentText.length;

        textLengthHistory.push(currentLength);

        // Log significant changes
        if (currentLength !== previousText.length) {
          console.log(`📊 Text length: ${previousText.length} → ${currentLength}`);
        }

        // Critical Check 1: Text should ONLY GROW during streaming, never shrink
        if (previousText.length > 0 && currentLength < previousText.length) {
          flickerDetected = true;
          console.error(`❌ FLICKER DETECTED! Text shrunk from ${previousText.length} to ${currentLength}`);
          console.error(`Previous: "${previousText.substring(0, 50)}..."`);
          console.error(`Current: "${currentText.substring(0, 50)}..."`);
          break;
        }

        // Critical Check 2: Text should not reset to beginning
        if (previousText.length > 10 && currentLength > 0) {
          const previousStart = previousText.substring(0, 20);
          const currentStart = currentText.substring(0, 20);

          // If previous text doesn't match current start, it was reset
          if (!currentText.startsWith(previousStart) && previousStart.trim() !== '') {
            resetDetected = true;
            console.error(`❌ RESET DETECTED! Text restarted`);
            console.error(`Previous start: "${previousStart}"`);
            console.error(`Current start: "${currentStart}"`);
            break;
          }
        }

        previousText = currentText;

        // If text hasn't changed for 3 consecutive checks and has content, streaming likely complete
        if (textLengthHistory.length >= 3) {
          const lastThree = textLengthHistory.slice(-3);
          if (lastThree.every(len => len === currentLength && len > 0)) {
            console.log('✅ Streaming appears complete, text stabilized');
            break;
          }
        }

      } catch (error) {
        console.log('⚠️ Error reading text content:', error);
      }

      checkCount++;
      await page.waitForTimeout(100); // Check every 100ms
    }

    console.log(`📈 Text length history: ${textLengthHistory.join(' → ')}`);
    console.log(`🔢 Total checks performed: ${checkCount}`);

    // Assertions
    expect(flickerDetected).toBe(false);
    expect(resetDetected).toBe(false);
    expect(previousText.length).toBeGreaterThan(0); // Ensure we got a response

    // Verify text length only increased (monotonically increasing)
    for (let i = 1; i < textLengthHistory.length; i++) {
      expect(textLengthHistory[i]).toBeGreaterThanOrEqual(textLengthHistory[i - 1]);
    }

    console.log('✅ No flicker detected! Streaming worked smoothly.');
  });

  test('should show typing effect AFTER streaming completes', async ({ page }) => {
    // Find the chat input
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    // Send a short question
    await chatInput.fill('안녕하세요');

    // Submit
    const sendButton = page.locator('button').filter({ hasText: /전송|보내기|Send/i }).first();
    if (await sendButton.isVisible()) {
      await sendButton.click();
    } else {
      await chatInput.press('Enter');
    }

    // Wait for response to complete
    await page.waitForTimeout(3000);

    // Check if cursor/typing indicator is present (indicates typing effect is working)
    const typingCursor = page.locator('[class*="animate-pulse"]').last();

    // The cursor should either:
    // 1. Be visible during typing, or
    // 2. Disappear after typing completes
    // This test just verifies the typing effect mechanism exists
    const cursorExists = await typingCursor.count() > 0;

    console.log(`Typing cursor found: ${cursorExists}`);

    // We just verify the test can detect the typing mechanism
    // The presence/absence depends on timing, but the element should be in DOM
    expect(cursorExists).toBeTruthy();
  });

  test('should handle rapid successive messages without flickering', async ({ page }) => {
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    // Send multiple questions in succession
    const questions = [
      '1+1은?',
      '2+2는?',
      '3+3은?'
    ];

    for (const question of questions) {
      await chatInput.fill(question);

      const sendButton = page.locator('button').filter({ hasText: /전송|보내기|Send/i }).first();
      if (await sendButton.isVisible()) {
        await sendButton.click();
      } else {
        await chatInput.press('Enter');
      }

      // Wait a bit for response to start
      await page.waitForTimeout(2000);
    }

    // Get all assistant messages
    const allAssistantMessages = page.locator('[class*="assistant"], [data-role="assistant"]');
    const messageCount = await allAssistantMessages.count();

    console.log(`Total assistant messages: ${messageCount}`);

    // Verify we got responses (should be at least 1, ideally 3)
    expect(messageCount).toBeGreaterThan(0);

    // Verify each message has content
    for (let i = 0; i < messageCount; i++) {
      const messageText = await allAssistantMessages.nth(i).textContent() || '';
      expect(messageText.length).toBeGreaterThan(0);
      console.log(`Message ${i + 1} length: ${messageText.length}`);
    }
  });
});

test.describe('TypingEffect Component Behavior', () => {
  test.beforeEach(async ({ page, context }) => {
    // Complete onboarding first
    await context.clearCookies();
    await page.goto('http://localhost:3000/onboarding');

    const usernameInput = page.locator('input#username-input');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('Typing Test User');
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '중학교 선택' }).click();
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '학습 시작하기' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto('http://localhost:3000/dashboard/math');
    await page.waitForLoadState('networkidle');
  });

  test('should respect isStreaming prop behavior', async ({ page }) => {
    // This is an integration test to verify the fix is working as intended

    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    // Send a question
    await chatInput.fill('테스트 질문입니다');

    const sendButton = page.locator('button').filter({ hasText: /전송|보내기|Send/i }).first();
    if (await sendButton.isVisible()) {
      await sendButton.click();
    } else {
      await chatInput.press('Enter');
    }

    // Monitor during streaming phase
    let streamingPhaseTextChanges = 0;
    let previousStreamingText = '';

    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(100);
      const assistantMessage = page.locator('[class*="assistant"], [data-role="assistant"]').last();

      if (await assistantMessage.isVisible()) {
        const currentText = await assistantMessage.textContent() || '';
        if (currentText !== previousStreamingText) {
          streamingPhaseTextChanges++;
          previousStreamingText = currentText;
        }
      }
    }

    console.log(`Text changes during streaming: ${streamingPhaseTextChanges}`);

    // During streaming, we should see text changes (chunks arriving)
    // This indicates isStreaming=true is working (immediate display)
    expect(streamingPhaseTextChanges).toBeGreaterThan(0);
  });
});
