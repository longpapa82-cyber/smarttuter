/**
 * Adaptive Learning System E2E Tests
 * Tests CEFR level detection and personalized content recommendation
 */

import { test, expect } from '@playwright/test';

test.describe('Adaptive Learning - Level Detection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to English tutor
    await page.goto('/onboarding/quick');

    // Complete quick onboarding
    await page.click('button:has-text("고등학생")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("영어")');

    // Wait for redirect to tutor
    await page.waitForURL(/\/tutor\/english/, { timeout: 10000 });
  });

  test('should show adaptive learning panel button after sufficient conversations', async ({ page }) => {
    // Simulate 5+ conversation turns
    const conversations = [
      "Hello, how are you?",
      "I want to improve my English speaking skills",
      "Can you help me with grammar?",
      "What is the difference between present perfect and past simple?",
      "Thank you for the explanation",
    ];

    for (const message of conversations) {
      // Type message
      const textarea = page.locator('textarea[placeholder*="메시지"]').first();
      await textarea.fill(message);

      // Send message
      await page.click('button[type="submit"]');

      // Wait for AI response
      await page.waitForTimeout(3000);
    }

    // Check if "실력 분석" or "Level Analysis" button appears
    const analysisButton = page.locator('button:has-text("실력 분석")');
    await expect(analysisButton).toBeVisible({ timeout: 5000 });
  });

  test('should display level analysis modal with CEFR level', async ({ page }) => {
    // Create mock chat history in localStorage
    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'Hello, I would like to discuss environmental issues.' },
        { role: 'assistant', content: 'Great! Environmental topics are important.' },
        { role: 'user', content: 'I believe climate change is one of the most pressing challenges.' },
        { role: 'assistant', content: 'Indeed, what solutions do you think are effective?' },
        { role: 'user', content: 'Renewable energy and sustainable practices seem promising.' },
        { role: 'assistant', content: 'Those are excellent points.' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    // Reload to apply localStorage
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click level analysis button
    await page.click('button:has-text("실력 분석")');

    // Wait for modal to appear
    await page.waitForTimeout(1000);

    // Check modal content
    await expect(page.locator('text=/CEFR|레벨|Level/i')).toBeVisible();
    await expect(page.locator('text=/A1|A2|B1|B2|C1|C2/')).toBeVisible();
  });

  test('should show skill breakdown (vocabulary, grammar, comprehension)', async ({ page }) => {
    // Create high-level chat history
    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'I am endeavoring to enhance my linguistic proficiency.' },
        { role: 'assistant', content: 'Excellent! What aspects would you like to focus on?' },
        { role: 'user', content: 'I wish to refine my grammatical accuracy and expand my lexicon.' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open analysis modal
    await page.click('button:has-text("실력 분석")');
    await page.waitForTimeout(1000);

    // Check skill categories
    await expect(page.locator('text=/어휘|Vocabulary/i')).toBeVisible();
    await expect(page.locator('text=/문법|Grammar/i')).toBeVisible();
    await expect(page.locator('text=/이해력|Comprehension/i')).toBeVisible();
  });

  test('should display personalized content recommendations', async ({ page }) => {
    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'Hello teacher' },
        { role: 'assistant', content: 'Hello! How can I help you?' },
        { role: 'user', content: 'I want learn English' },
        { role: 'assistant', content: 'Great! What would you like to learn?' },
        { role: 'user', content: 'Grammar please' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("실력 분석")');
    await page.waitForTimeout(1000);

    // Check recommendation sections
    await expect(page.locator('text=/추천|Recommend|지금 바로|Immediate/i')).toBeVisible();
  });
});

test.describe('Adaptive Learning - Content Recommendations', () => {
  test('should categorize recommendations (immediate, next, review, challenge)', async ({ page }) => {
    await page.goto('/tutor/english');

    // Set up B1 level chat history
    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'I can talk about familiar topics like hobbies and work.' },
        { role: 'assistant', content: 'That\'s good! Tell me about your hobbies.' },
        { role: 'user', content: 'I enjoy reading books and playing sports on weekends.' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("실력 분석")');
    await page.waitForTimeout(1000);

    // Should have multiple recommendation categories
    const recommendationSections = page.locator('[class*="recommendation"]');
    const count = await recommendationSections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show AI reasoning for recommendations', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'Can you help me with business English?' },
        { role: 'assistant', content: 'Of course! What aspect of business English?' },
        { role: 'user', content: 'I need to prepare for presentations and meetings.' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("실력 분석")');
    await page.waitForTimeout(1000);

    // Should show reasoning or explanation
    const reasoningText = page.locator('text=/이유|분석|based on|because/i');
    await expect(reasoningText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should allow starting recommended content', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi!' },
        { role: 'user', content: 'I want to learn' },
        { role: 'assistant', content: 'Great!' },
        { role: 'user', content: 'Help me' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("실력 분석")');
    await page.waitForTimeout(1000);

    // Look for "시작" or "Start" buttons in recommendations
    const startButtons = page.locator('button:has-text(/시작|Start/i)');
    const buttonCount = await startButtons.count();

    // Should have at least one start button
    expect(buttonCount).toBeGreaterThan(0);
  });
});

test.describe('Adaptive Learning - Level Progression', () => {
  test('should detect beginner level (A1-A2) for simple conversations', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
        { role: 'user', content: 'My name is Tom' },
        { role: 'assistant', content: 'Nice to meet you Tom!' },
        { role: 'user', content: 'I like cat' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("실력 분석")');
    await page.waitForTimeout(1000);

    // Should show A1 or A2 level
    await expect(page.locator('text=/A1|A2/')).toBeVisible();
  });

  test('should detect intermediate level (B1-B2) for complex conversations', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'I would like to discuss environmental sustainability.' },
        { role: 'assistant', content: 'Excellent topic! What interests you most?' },
        { role: 'user', content: 'I think renewable energy is crucial for reducing carbon emissions.' },
        { role: 'assistant', content: 'Agreed! What specific technologies do you find promising?' },
        { role: 'user', content: 'Solar and wind power seem to have the greatest potential for scalability.' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("실력 분석")');
    await page.waitForTimeout(1000);

    // Should show B1, B2, C1, or C2 level
    await expect(page.locator('text=/B1|B2|C1|C2/')).toBeVisible();
  });

  test('should re-analyze when requested', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockMessages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi!' },
        { role: 'user', content: 'How are you?' },
      ];

      localStorage.setItem('english_chat_history', JSON.stringify(mockMessages));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("실력 분석")');
    await page.waitForTimeout(1000);

    // Look for re-analysis button
    const reanalyzeButton = page.locator('button:has-text(/다시 분석|Re-analyze|Analyze Again/i)');

    if (await reanalyzeButton.isVisible()) {
      await reanalyzeButton.click();
      await page.waitForTimeout(2000);

      // Modal should still be visible with updated results
      await expect(page.locator('text=/CEFR|레벨/')).toBeVisible();
    }
  });
});
