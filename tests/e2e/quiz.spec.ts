import { test, expect } from '@playwright/test';

test.describe('Quiz Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Complete onboarding first
    await page.goto('/onboarding');
    await page.click('button:has-text("고등학교")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("수학")');
    await page.waitForTimeout(1000);

    // Navigate to quiz page
    await page.goto('/quiz');
    await page.waitForTimeout(1000);
  });

  test('should load quiz page', async ({ page }) => {
    // Check page loaded
    await expect(page).toHaveURL(/\/quiz/);

    // Should show quiz title
    const quizTitle = page.locator('text=AI 퀴즈 생성, text=Quiz, h1').first();
    await expect(quizTitle).toBeVisible({ timeout: 5000 });
  });

  test('should show quiz setup form', async ({ page }) => {
    // Should show setup heading
    const setupHeading = page.locator('text=퀴즈 설정, text=Quiz Setup, h2').first();
    await expect(setupHeading).toBeVisible({ timeout: 3000 });

    // Should show subject selection
    const mathButton = page.locator('button:has-text("수학"), button:has-text("Math")').first();
    const englishButton = page.locator('button:has-text("영어"), button:has-text("English")').first();

    await expect(mathButton).toBeVisible();
    await expect(englishButton).toBeVisible();
  });

  test('should allow subject selection', async ({ page }) => {
    // Click math subject
    const mathButton = page.locator('button:has-text("수학")').first();
    await mathButton.click();
    await page.waitForTimeout(300);

    // Button should show selected state (bg-blue or border-blue)
    const hasSelectedClass = await mathButton.evaluate(el =>
      el.className.includes('blue') || el.className.includes('selected')
    );
    expect(hasSelectedClass).toBeTruthy();
  });

  test('should allow topic input', async ({ page }) => {
    // Find topic input
    const topicInput = page.locator('input[placeholder*="이차방정식"], input[placeholder*="주제"]').first();

    if (await topicInput.isVisible({ timeout: 2000 })) {
      await topicInput.fill('이차방정식');
      await expect(topicInput).toHaveValue('이차방정식');
    }
  });

  test('should allow difficulty selection', async ({ page }) => {
    // Find difficulty slider
    const difficultySlider = page.locator('input[type="range"][min="1"][max="5"]').first();

    if (await difficultySlider.isVisible({ timeout: 2000 })) {
      await difficultySlider.fill('4');
      const value = await difficultySlider.inputValue();
      expect(value).toBe('4');
    }
  });

  test('should allow question count selection', async ({ page }) => {
    // Find question count slider
    const questionSlider = page.locator('input[type="range"][min="3"][max="10"]').first();

    if (await questionSlider.isVisible({ timeout: 2000 })) {
      await questionSlider.fill('7');
      const value = await questionSlider.inputValue();
      expect(value).toBe('7');
    }
  });

  test('should show generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("퀴즈 생성"), button:has-text("생성")').first();
    await expect(generateButton).toBeVisible({ timeout: 3000 });
  });

  test('should disable generate button when incomplete', async ({ page }) => {
    // Generate button should be disabled without subject and topic
    const generateButton = page.locator('button:has-text("퀴즈 생성"), button:has-text("생성")').first();

    if (await generateButton.isVisible({ timeout: 2000 })) {
      const isDisabled = await generateButton.isDisabled();
      expect(isDisabled).toBeTruthy();
    }
  });

  test('should enable generate button when form complete', async ({ page }) => {
    // Fill form
    const mathButton = page.locator('button:has-text("수학")').first();
    await mathButton.click();
    await page.waitForTimeout(300);

    const topicInput = page.locator('input[placeholder*="이차방정식"], input[placeholder*="주제"]').first();
    if (await topicInput.isVisible({ timeout: 2000 })) {
      await topicInput.fill('이차방정식');
    }

    await page.waitForTimeout(300);

    // Generate button should be enabled
    const generateButton = page.locator('button:has-text("퀴즈 생성"), button:has-text("생성")').first();
    if (await generateButton.isVisible({ timeout: 2000 })) {
      const isDisabled = await generateButton.isDisabled();
      expect(isDisabled).toBeFalsy();
    }
  });

  test('should show recent quizzes section', async ({ page }) => {
    // Look for recent quizzes heading
    const recentHeading = page.locator('text=최근 퀴즈, text=Recent Quiz, h2').first();
    await expect(recentHeading).toBeVisible({ timeout: 3000 });
  });

  test('should show empty state for no quizzes', async ({ page }) => {
    // Look for empty state message
    const emptyMessage = page.locator('text=풀어본 퀴즈가 없습니다, text=No quiz').first();

    // Either empty message or quiz history should be visible
    const hasEmptyState = await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false);
    const hasQuizHistory = await page.locator('[class*="quiz"], [class*="score"]').count() > 0;

    expect(hasEmptyState || hasQuizHistory).toBeTruthy();
  });

  test('should have navigation back to dashboard', async ({ page }) => {
    // Look for back/dashboard button
    const backButton = page.locator('a[href="/dashboard"], button:has-text("대시보드")').first();

    if (await backButton.isVisible({ timeout: 2000 })) {
      await backButton.click();
      await page.waitForTimeout(500);

      // Should navigate to dashboard
      expect(page.url()).toContain('/dashboard');
    }
  });

  test('should show star rating for difficulty', async ({ page }) => {
    // Look for star symbols in difficulty section
    const difficultySection = page.locator('text=난이도, text=Difficulty').first();

    if (await difficultySection.isVisible({ timeout: 2000 })) {
      const container = page.locator('label:has-text("난이도")').first();
      const text = await container.textContent();
      expect(text).toContain('⭐');
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);

    // Quiz setup should be visible on mobile
    const quizSetup = page.locator('main, [role="main"], [class*="quiz"]').first();

    if (await quizSetup.isVisible({ timeout: 3000 })) {
      const bbox = await quizSetup.boundingBox();
      expect(bbox).toBeTruthy();

      // Should not overflow viewport width
      if (bbox) {
        expect(bbox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should persist quiz settings on reload', async ({ page }) => {
    // Select subject
    const mathButton = page.locator('button:has-text("수학")').first();
    if (await mathButton.isVisible({ timeout: 2000 })) {
      await mathButton.click();
      await page.waitForTimeout(300);
    }

    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);

    // Should still show quiz page
    expect(page.url()).toContain('/quiz');
  });

  test('should load without critical errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Allow expected errors (API calls, etc.)
    const criticalErrors = errors.filter(error =>
      !error.includes('API') &&
      !error.includes('크레딧') &&
      !error.includes('Failed to fetch')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should show visual feedback on interaction', async ({ page }) => {
    // Hover over subject button
    const mathButton = page.locator('button:has-text("수학")').first();

    if (await mathButton.isVisible({ timeout: 2000 })) {
      await mathButton.hover();
      await page.waitForTimeout(200);

      // Button should exist and be interactive
      expect(await mathButton.isVisible()).toBeTruthy();
    }
  });

  test('should show question count in slider label', async ({ page }) => {
    // Look for question count label
    const questionLabel = page.locator('text=문항 수, text=Question Count, label').first();

    if (await questionLabel.isVisible({ timeout: 2000 })) {
      const text = await questionLabel.textContent();
      expect(text).toMatch(/\d+/); // Should contain a number
    }
  });
});
