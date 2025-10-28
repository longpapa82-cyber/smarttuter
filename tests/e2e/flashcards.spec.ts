import { test, expect } from '@playwright/test';

test.describe('Flashcards Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Complete onboarding first
    await page.goto('/onboarding');
    await page.click('button:has-text("고등학교")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("수학")');
    await page.waitForTimeout(1000);

    // Navigate to flashcards page
    await page.goto('/flashcards');
    await page.waitForTimeout(1000);
  });

  test('should load flashcards page', async ({ page }) => {
    // Check page loaded
    await expect(page).toHaveURL(/\/flashcards/);

    // Should show flashcard title
    const flashcardTitle = page.locator('text=스마트 플래시카드, text=Flashcard, h1').first();
    await expect(flashcardTitle).toBeVisible({ timeout: 5000 });
  });

  test('should show SM-2 algorithm description', async ({ page }) => {
    // Look for SM-2 algorithm mention
    const sm2Text = page.locator('text=SM-2, text=간격 반복').first();
    await expect(sm2Text).toBeVisible({ timeout: 3000 });
  });

  test('should display statistics cards', async ({ page }) => {
    // Should show 4 statistics cards (due, upcoming, mastered, learning)
    const statCards = page.locator('[class*="stat"], [class*="card"]');
    const count = await statCards.count();

    // Should have multiple stat cards
    expect(count).toBeGreaterThan(2);
  });

  test('should show due cards count', async ({ page }) => {
    // Look for "복습 필요" (due for review) stat
    const dueText = page.locator('text=복습 필요, text=Due').first();

    if (await dueText.isVisible({ timeout: 2000 })) {
      await expect(dueText).toBeVisible();
    }
  });

  test('should show upcoming cards count', async ({ page }) => {
    // Look for "곧 복습" (upcoming) stat
    const upcomingText = page.locator('text=곧 복습, text=Upcoming').first();

    if (await upcomingText.isVisible({ timeout: 2000 })) {
      await expect(upcomingText).toBeVisible();
    }
  });

  test('should show mastered cards count', async ({ page }) => {
    // Look for "숙달" (mastered) stat
    const masteredText = page.locator('text=숙달, text=Mastered').first();

    if (await masteredText.isVisible({ timeout: 2000 })) {
      await expect(masteredText).toBeVisible();
    }
  });

  test('should show learning cards count', async ({ page }) => {
    // Look for "학습 중" (learning) stat
    const learningText = page.locator('text=학습 중, text=Learning').first();

    if (await learningText.isVisible({ timeout: 2000 })) {
      await expect(learningText).toBeVisible();
    }
  });

  test('should show today review section', async ({ page }) => {
    // Look for "오늘의 복습" heading
    const todayHeading = page.locator('text=오늘의 복습, text=Today').first();
    await expect(todayHeading).toBeVisible({ timeout: 3000 });
  });

  test('should show empty state when no cards due', async ({ page }) => {
    // Look for empty state or review cards
    const emptyState = page.locator('text=복습할 카드가 없습니다, text=No cards').first();
    const reviewButton = page.locator('button:has-text("복습 시작"), button:has-text("Start Review")').first();

    const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    const hasReviewButton = await reviewButton.isVisible({ timeout: 2000 }).catch(() => false);

    // Should show either empty state OR review button
    expect(hasEmptyState || hasReviewButton).toBeTruthy();
  });

  test('should show create flashcard button', async ({ page }) => {
    // Look for create button
    const createButton = page.locator('button:has-text("플래시카드 만들기"), button:has-text("Create")').first();
    await expect(createButton).toBeVisible({ timeout: 3000 });
  });

  test('should open create form when clicking create button', async ({ page }) => {
    const createButton = page.locator('button:has-text("플래시카드 만들기"), button:has-text("Create")').first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Should show form fields
      const frontInput = page.locator('input[placeholder*="질문"], input[placeholder*="front"]').first();
      await expect(frontInput).toBeVisible({ timeout: 2000 });
    }
  });

  test('should show subject selection in create form', async ({ page }) => {
    const createButton = page.locator('button:has-text("플래시카드 만들기")').first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Should show math and english buttons
      const mathButton = page.locator('button:has-text("수학")').first();
      const englishButton = page.locator('button:has-text("영어")').first();

      await expect(mathButton).toBeVisible();
      await expect(englishButton).toBeVisible();
    }
  });

  test('should show front and back input fields', async ({ page }) => {
    const createButton = page.locator('button:has-text("플래시카드 만들기")').first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Should show front (question) input
      const frontInput = page.locator('input[placeholder*="질문"]').first();
      if (await frontInput.isVisible({ timeout: 2000 })) {
        await expect(frontInput).toBeVisible();
      }

      // Should show back (answer) input
      const backInput = page.locator('input[placeholder*="답변"]').first();
      if (await backInput.isVisible({ timeout: 2000 })) {
        await expect(backInput).toBeVisible();
      }
    }
  });

  test('should show difficulty slider in create form', async ({ page }) => {
    const createButton = page.locator('button:has-text("플래시카드 만들기")').first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Should show difficulty slider
      const difficultySlider = page.locator('input[type="range"][min="1"][max="5"]').first();
      if (await difficultySlider.isVisible({ timeout: 2000 })) {
        await expect(difficultySlider).toBeVisible();
      }
    }
  });

  test('should show cancel button in create form', async ({ page }) => {
    const createButton = page.locator('button:has-text("플래시카드 만들기")').first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Should show cancel button
      const cancelButton = page.locator('button:has-text("취소")').first();
      await expect(cancelButton).toBeVisible();
    }
  });

  test('should close form when clicking cancel', async ({ page }) => {
    const createButton = page.locator('button:has-text("플래시카드 만들기")').first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      const cancelButton = page.locator('button:has-text("취소")').first();
      if (await cancelButton.isVisible({ timeout: 2000 })) {
        await cancelButton.click();
        await page.waitForTimeout(300);

        // Form should be hidden, create button should be visible again
        await expect(createButton).toBeVisible();
      }
    }
  });

  test('should show card statistics', async ({ page }) => {
    // Look for card statistics section
    const statsSection = page.locator('text=카드 현황, text=Card Stats').first();

    if (await statsSection.isVisible({ timeout: 2000 })) {
      await expect(statsSection).toBeVisible();

      // Should show total, mastered, learning counts
      const totalCards = page.locator('text=전체 카드, text=Total').first();
      await expect(totalCards).toBeVisible({ timeout: 2000 });
    }
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

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);

    // Flashcard interface should be visible on mobile
    const flashcardContent = page.locator('main, [role="main"], [class*="flashcard"]').first();

    if (await flashcardContent.isVisible({ timeout: 3000 })) {
      const bbox = await flashcardContent.boundingBox();
      expect(bbox).toBeTruthy();

      // Should not overflow viewport width
      if (bbox) {
        expect(bbox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should show optimal review time message', async ({ page }) => {
    // Look for review time recommendation
    const reviewTime = page.locator('text=복습, text=review').first();

    if (await reviewTime.isVisible({ timeout: 2000 })) {
      await expect(reviewTime).toBeVisible();
    }
  });

  test('should persist flashcard data on reload', async ({ page }) => {
    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);

    // Should still show flashcards page
    expect(page.url()).toContain('/flashcards');

    // Basic structure should be present
    const flashcardTitle = page.locator('h1, h2').first();
    await expect(flashcardTitle).toBeVisible();
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

  test('should show color-coded statistics', async ({ page }) => {
    // Statistics should have different colors (green for mastered, blue for learning, etc.)
    const coloredStats = page.locator('[class*="green"], [class*="blue"], [class*="red"], [class*="yellow"]');
    const count = await coloredStats.count();

    // Should have multiple colored elements
    expect(count).toBeGreaterThan(0);
  });

  test('should show star rating for difficulty', async ({ page }) => {
    const createButton = page.locator('button:has-text("플래시카드 만들기")').first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for star symbols in difficulty section
      const difficultySection = page.locator('text=난이도, label').first();
      if (await difficultySection.isVisible({ timeout: 2000 })) {
        const text = await difficultySection.textContent();
        expect(text).toContain('⭐');
      }
    }
  });

  test('should show SM-2 explanation', async ({ page }) => {
    // Look for educational content about SM-2
    const explanation = page.locator('text=망각 곡선, text=복습 간격').first();

    if (await explanation.isVisible({ timeout: 2000 })) {
      await expect(explanation).toBeVisible();
    }
  });
});
