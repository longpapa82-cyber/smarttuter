/**
 * Roleplay Scenarios E2E Tests
 * Tests real-world conversation practice with AI character roles
 */

import { test, expect } from '@playwright/test';

test.describe('Roleplay Scenarios - Scenario Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to English tutor
    await page.goto('/onboarding/quick');
    await page.click('button:has-text("고등학생")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("영어")');
    await page.waitForURL(/\/tutor\/english/, { timeout: 10000 });
  });

  test('should display roleplay scenarios button or menu', async ({ page }) => {
    // Look for roleplay button/menu
    const roleplayButton = page.locator('button:has-text(/롤플레이|Roleplay|시나리오|Scenario/i)');
    await expect(roleplayButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show list of available scenarios', async ({ page }) => {
    // Click roleplay button
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    // Should show scenario list
    const scenarioList = page.locator('[class*="scenario"]');
    const count = await scenarioList.count();

    // Should have at least 5 scenarios
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should display scenario details (title, level, difficulty)', async ({ page }) => {
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    // Check for scenario details
    await expect(page.locator('text=/A1|A2|B1|B2|C1|C2/')).toBeVisible();
    await expect(page.locator('text=/난이도|Difficulty|Level/i')).toBeVisible();
  });

  test('should filter scenarios by CEFR level', async ({ page }) => {
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    // Look for level filter buttons
    const levelFilters = page.locator('button:has-text(/A1|A2|B1|B2|C1|C2/)');

    if (await levelFilters.first().isVisible()) {
      // Click A1 filter
      await levelFilters.first().click();
      await page.waitForTimeout(500);

      // Should show only A1 scenarios
      await expect(page.locator('text=A1')).toBeVisible();
    }
  });

  test('should show scenario categories (travel, dining, work, etc.)', async ({ page }) => {
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    // Check for category labels
    const categories = page.locator('text=/travel|dining|shopping|work|social|emergency/i');
    const categoryCount = await categories.count();

    expect(categoryCount).toBeGreaterThan(0);
  });
});

test.describe('Roleplay Scenarios - Conversation Flow', () => {
  test('should start a roleplay scenario', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    // Click first scenario
    const firstScenario = page.locator('[class*="scenario"]').first();
    await firstScenario.click();
    await page.waitForTimeout(1000);

    // Should show roleplay interface
    await expect(page.locator('text=/시작|Start|Begin/i')).toBeVisible();
  });

  test('should display scenario context (setting, roles, objective)', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    // Select scenario (e.g., coffee shop)
    const coffeeScenario = page.locator('text=/커피|Coffee|카페|Cafe/i').first();

    if (await coffeeScenario.isVisible()) {
      await coffeeScenario.click();
      await page.waitForTimeout(1000);

      // Should show context
      await expect(page.locator('text=/역할|Role|목표|Objective|상황|Setting/i')).toBeVisible();
    }
  });

  test('should show AI starting message', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    // Start first scenario
    const firstScenario = page.locator('[class*="scenario"]').first();
    await firstScenario.click();
    await page.waitForTimeout(1000);

    const startButton = page.locator('button:has-text(/시작|Start/i)');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Should show AI message
      const aiMessage = page.locator('[class*="message"][class*="assistant"]');
      await expect(aiMessage.first()).toBeVisible();
    }
  });

  test('should allow user to respond', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    const firstScenario = page.locator('[class*="scenario"]').first();
    await firstScenario.click();
    await page.waitForTimeout(1000);

    const startButton = page.locator('button:has-text(/시작|Start/i)');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Type response
      const textarea = page.locator('textarea').first();
      await textarea.fill('Hello, I would like to order a coffee please.');

      // Send message
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      // User message should appear
      const userMessage = page.locator('text=Hello, I would like to order a coffee please.');
      await expect(userMessage).toBeVisible();
    }
  });

  test('should show progress indicator (turn count)', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    const firstScenario = page.locator('[class*="scenario"]').first();
    await firstScenario.click();
    await page.waitForTimeout(1000);

    const startButton = page.locator('button:has-text(/시작|Start/i)');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Should show progress
      await expect(page.locator('text=/턴|Turn|진행|Progress/i')).toBeVisible();
    }
  });

  test('should provide hints when requested', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    const firstScenario = page.locator('[class*="scenario"]').first();
    await firstScenario.click();
    await page.waitForTimeout(1000);

    const startButton = page.locator('button:has-text(/시작|Start/i)');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Look for hint button
      const hintButton = page.locator('button:has-text(/힌트|Hint|도움말|Help/i)');

      if (await hintButton.isVisible()) {
        await hintButton.click();
        await page.waitForTimeout(500);

        // Should show hint text
        await expect(page.locator('[class*="hint"]')).toBeVisible();
      }
    }
  });
});

test.describe('Roleplay Scenarios - Evaluation', () => {
  test('should complete scenario after expected turns', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    const firstScenario = page.locator('[class*="scenario"]').first();
    await firstScenario.click();
    await page.waitForTimeout(1000);

    const startButton = page.locator('button:has-text(/시작|Start/i)');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Simulate conversation turns
      const responses = [
        "Hello, I'd like to order a coffee.",
        "Medium latte, please.",
        "To go, thank you.",
        "Here you are.",
        "Thank you, have a nice day!",
      ];

      for (const response of responses) {
        const textarea = page.locator('textarea').first();
        await textarea.fill(response);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000); // Wait for AI response
      }

      // Should show completion or evaluation
      await expect(page.locator('text=/완료|Complete|평가|Evaluation/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display evaluation scores (overall, completion, accuracy)', async ({ page }) => {
    // Create completed roleplay session in localStorage
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockSession = {
        id: 'test-session',
        scenario: {
          id: 'coffee-shop-a1',
          title: 'Coffee Shop Order',
          level: 'A1',
        },
        messages: [
          { role: 'assistant', content: 'Hello! Welcome to our coffee shop. What can I get for you?' },
          { role: 'user', content: 'Hi, I would like a coffee please.' },
          { role: 'assistant', content: 'Sure! What size would you like?' },
          { role: 'user', content: 'Medium, please.' },
          { role: 'assistant', content: 'Great! Anything else?' },
          { role: 'user', content: 'No, thank you.' },
        ],
        turnCount: 3,
        completionStatus: 'completed',
      };

      localStorage.setItem('current_roleplay_session', JSON.stringify(mockSession));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Trigger evaluation display
    await page.click('button:has-text(/평가|Evaluation|결과|Results/i)');
    await page.waitForTimeout(1000);

    // Should show scores
    await expect(page.locator('text=/점수|Score|등급|Grade/i')).toBeVisible();
  });

  test('should show strengths and areas for improvement', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockEvaluation = {
        overallScore: 75,
        grade: 'B',
        strengths: ['Good vocabulary', 'Clear pronunciation'],
        improvements: ['Use more varied expressions', 'Practice politeness forms'],
        nextSteps: ['Try B1 level scenarios', 'Practice business conversations'],
      };

      localStorage.setItem('roleplay_evaluation', JSON.stringify(mockEvaluation));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text(/평가|Evaluation/i)');
    await page.waitForTimeout(1000);

    // Should show feedback sections
    await expect(page.locator('text=/강점|Strength|잘한 점/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/개선|Improvement|부족한 점/i')).toBeVisible({ timeout: 5000 });
  });

  test('should suggest next scenario based on performance', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockEvaluation = {
        overallScore: 85,
        grade: 'A',
        nextSteps: [
          'Try Airport Check-in (A2)',
          'Practice Restaurant Reservation (B1)',
        ],
      };

      localStorage.setItem('roleplay_evaluation', JSON.stringify(mockEvaluation));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text(/평가|Evaluation/i)');
    await page.waitForTimeout(1000);

    // Should show next steps or recommendations
    await expect(page.locator('text=/다음|Next|추천|Recommend/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow retrying the same scenario', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockSession = {
        id: 'test-session',
        scenario: {
          id: 'coffee-shop-a1',
          title: 'Coffee Shop Order',
        },
        completionStatus: 'completed',
      };

      localStorage.setItem('current_roleplay_session', JSON.stringify(mockSession));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text(/평가|Evaluation/i)');
    await page.waitForTimeout(1000);

    // Look for retry button
    const retryButton = page.locator('button:has-text(/다시|Retry|재시도|Again/i)');

    if (await retryButton.isVisible()) {
      await retryButton.click();
      await page.waitForTimeout(1000);

      // Should restart the scenario
      await expect(page.locator('text=/시작|Start/i')).toBeVisible();
    }
  });
});

test.describe('Roleplay Scenarios - Specific Scenarios', () => {
  const scenarios = [
    { name: 'Coffee Shop', level: 'A1', keywords: ['커피|coffee', '주문|order'] },
    { name: 'Airport Check-in', level: 'A2', keywords: ['공항|airport', '체크인|check-in'] },
    { name: 'Restaurant Reservation', level: 'B1', keywords: ['레스토랑|restaurant', '예약|reservation'] },
    { name: 'Job Interview', level: 'B2', keywords: ['면접|interview', '직장|job'] },
  ];

  for (const scenario of scenarios) {
    test(`should support ${scenario.name} (${scenario.level}) scenario`, async ({ page }) => {
      await page.goto('/tutor/english');
      await page.click('button:has-text(/롤플레이|Roleplay/i)');
      await page.waitForTimeout(1000);

      // Look for scenario by keywords
      const scenarioElement = page.locator(`text=/${scenario.keywords.join('|')}/i`).first();

      if (await scenarioElement.isVisible()) {
        await scenarioElement.click();
        await page.waitForTimeout(1000);

        // Should show level
        await expect(page.locator(`text=${scenario.level}`)).toBeVisible();

        // Should be able to start
        const startButton = page.locator('button:has-text(/시작|Start/i)');
        await expect(startButton).toBeVisible();
      }
    });
  }

  test('should maintain AI character role throughout conversation', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/롤플레이|Roleplay/i)');
    await page.waitForTimeout(1000);

    const firstScenario = page.locator('[class*="scenario"]').first();
    await firstScenario.click();
    await page.waitForTimeout(1000);

    const startButton = page.locator('button:has-text(/시작|Start/i)');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Send multiple messages
      const messages = [
        "Hello!",
        "How are you today?",
        "Can you help me?",
      ];

      for (const msg of messages) {
        const textarea = page.locator('textarea').first();
        await textarea.fill(msg);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
      }

      // All AI responses should be visible
      const aiMessages = page.locator('[class*="message"][class*="assistant"]');
      const messageCount = await aiMessages.count();

      expect(messageCount).toBeGreaterThanOrEqual(3);
    }
  });
});
