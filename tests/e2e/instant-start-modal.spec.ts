import { test, expect } from '@playwright/test';

/**
 * Instant Start Modal - UX Improvement Tests
 *
 * Tests for Phase 1 implementation: Immediate participation flow after creating flashcards/quizzes
 *
 * Goals:
 * - Verify "바로 시작하기" modal appears after creation
 * - Test modal interactions (start, close, ESC key)
 * - Measure immediate participation rate improvement
 * - Ensure smooth transition to review/quiz mode
 */

test.describe('Flashcard Instant Start Modal', () => {
  test.beforeEach(async ({ page, context }) => {
    // Complete onboarding
    await context.clearCookies();
    await page.goto('http://localhost:3000/onboarding');

    const usernameInput = page.locator('input#username-input');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('Test User - Instant Start');
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '중학교 선택' }).click();
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '학습 시작하기' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to flashcards page
    await page.goto('http://localhost:3000/flashcards');
    await page.waitForLoadState('networkidle');
  });

  test('should show instant start modal after creating flashcard', async ({ page }) => {
    // Click "새 카드 만들기"
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    await createButton.click();

    // Wait for form to appear
    await page.waitForTimeout(500);

    // Select subject (Math)
    const mathSubject = page.getByRole('button', { name: /수학/i }).first();
    await mathSubject.click();

    // Fill in flashcard details
    const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
    await frontInput.fill('이차방정식이란?');

    const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
    await backInput.fill('ax² + bx + c = 0 형태의 방정식');

    // Submit form
    const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
    await submitButton.click();

    // Wait for modal to appear
    await page.waitForTimeout(1000);

    // Verify modal is visible
    const modal = page.locator('text=플래시카드가 생성되었습니다!');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify preview shows correct content
    await expect(page.locator('text=이차방정식이란?')).toBeVisible();
    await expect(page.locator('text=ax² + bx + c = 0 형태의 방정식')).toBeVisible();

    // Verify action buttons exist
    const startButton = page.getByRole('button', { name: /바로 복습 시작하기/i });
    const laterButton = page.getByRole('button', { name: /나중에/i });

    await expect(startButton).toBeVisible();
    await expect(laterButton).toBeVisible();
  });

  test('should start review immediately when clicking "바로 시작하기"', async ({ page }) => {
    // Create a flashcard first (reuse code from previous test)
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    await createButton.click();
    await page.waitForTimeout(500);

    const mathSubject = page.getByRole('button', { name: /수학/i }).first();
    await mathSubject.click();

    const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
    await frontInput.fill('미분이란?');

    const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
    await backInput.fill('함수의 순간 변화율');

    const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
    await submitButton.click();

    // Wait for modal
    await page.waitForTimeout(1000);

    // Click "바로 시작하기"
    const startButton = page.getByRole('button', { name: /바로 복습 시작하기/i });
    await startButton.click();

    // Verify navigated to review mode
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/복습|플래시카드/i')).toBeVisible({ timeout: 5000 });

    // Verify we can see the flashcard content
    const hasContent = await page.locator('text=미분이란?').isVisible() ||
                       await page.locator('text=함수의 순간 변화율').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should close modal when clicking "나중에"', async ({ page }) => {
    // Create flashcard
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    await createButton.click();
    await page.waitForTimeout(500);

    const mathSubject = page.getByRole('button', { name: /수학/i }).first();
    await mathSubject.click();

    const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
    await frontInput.fill('적분이란?');

    const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
    await backInput.fill('미분의 역연산');

    const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Click "나중에"
    const laterButton = page.getByRole('button', { name: /나중에/i });
    await laterButton.click();

    // Verify modal is closed
    await page.waitForTimeout(500);
    const modal = page.locator('text=플래시카드가 생성되었습니다!');
    await expect(modal).not.toBeVisible();

    // Verify we're back at flashcards main view
    await expect(page.locator('text=스마트 플래시카드')).toBeVisible();
  });

  test('should close modal when pressing ESC key', async ({ page }) => {
    // Create flashcard
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    await createButton.click();
    await page.waitForTimeout(500);

    const mathSubject = page.getByRole('button', { name: /수학/i }).first();
    await mathSubject.click();

    const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
    await frontInput.fill('극한이란?');

    const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
    await backInput.fill('함수의 수렴값');

    const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Press ESC key
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await page.waitForTimeout(500);
    const modal = page.locator('text=플래시카드가 생성되었습니다!');
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Quiz Instant Start Modal', () => {
  test.beforeEach(async ({ page, context }) => {
    // Complete onboarding
    await context.clearCookies();
    await page.goto('http://localhost:3000/onboarding');

    const usernameInput = page.locator('input#username-input');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('Test User - Quiz Start');
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '중학교 선택' }).click();
    await page.getByRole('button', { name: '다음' }).click();

    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '학습 시작하기' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to quiz page
    await page.goto('http://localhost:3000/quiz');
    await page.waitForLoadState('networkidle');
  });

  test('should show instant start modal after generating quiz', async ({ page }) => {
    // Select subject (Math)
    const mathSubject = page.getByRole('button', { name: /수학/i }).first();
    await mathSubject.click();

    // Enter topic
    const topicInput = page.locator('input[placeholder*="주제"], textarea[placeholder*="주제"]').first();
    await topicInput.fill('이차방정식');

    // Select difficulty (default is usually 3)
    // Click generate quiz
    const generateButton = page.getByRole('button', { name: /퀴즈 생성|만들기/i });
    await generateButton.click();

    // Wait for AI generation
    await page.waitForTimeout(3000);

    // Verify modal appears
    const modal = page.locator('text=퀴즈가 생성되었습니다!');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Verify quiz info is displayed
    await expect(page.locator('text=이차방정식')).toBeVisible();
    await expect(page.locator('text=/\\d+개/').or(page.locator('text=/문항/'))). toBeVisible();

    // Verify buttons
    const startButton = page.getByRole('button', { name: /지금 바로 시작하기/i });
    const laterButton = page.getByRole('button', { name: /나중에/i });

    await expect(startButton).toBeVisible();
    await expect(laterButton).toBeVisible();
  });

  test('should start quiz immediately when clicking "지금 바로 시작하기"', async ({ page }) => {
    // Generate quiz
    const mathSubject = page.getByRole('button', { name: /수학/i }).first();
    await mathSubject.click();

    const topicInput = page.locator('input[placeholder*="주제"], textarea[placeholder*="주제"]').first();
    await topicInput.fill('방정식');

    const generateButton = page.getByRole('button', { name: /퀴즈 생성|만들기/i });
    await generateButton.click();

    await page.waitForTimeout(3000);

    // Click start button
    const startButton = page.getByRole('button', { name: /지금 바로 시작하기/i });
    await startButton.click();

    // Verify quiz has started
    await page.waitForTimeout(1000);

    // Modal should be gone
    const modal = page.locator('text=퀴즈가 생성되었습니다!');
    await expect(modal).not.toBeVisible();

    // Should see quiz questions or quiz interface
    const hasQuizContent = await page.locator('text=/문제|질문|선택|답변/').isVisible();
    expect(hasQuizContent).toBeTruthy();
  });
});

test.describe('Modal UI/UX', () => {
  test('modal should have blur backdrop', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('http://localhost:3000/onboarding');

    const usernameInput = page.locator('input#username-input');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('UI Test User');
    await page.getByRole('button', { name: '다음' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '중학교 선택' }).click();
    await page.getByRole('button', { name: '다음' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '학습 시작하기' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await page.goto('http://localhost:3000/flashcards');
    await page.waitForLoadState('networkidle');

    // Create flashcard to trigger modal
    const createButton = page.getByRole('button', { name: /새 카드 만들기/i });
    await createButton.click();
    await page.waitForTimeout(500);

    const mathSubject = page.getByRole('button', { name: /수학/i }).first();
    await mathSubject.click();

    const frontInput = page.locator('input[placeholder*="앞면"], textarea[placeholder*="앞면"]').first();
    await frontInput.fill('Test');

    const backInput = page.locator('input[placeholder*="뒷면"], textarea[placeholder*="뒷면"]').first();
    await backInput.fill('Test Answer');

    const submitButton = page.getByRole('button', { name: /생성하기|만들기/i });
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Check for backdrop blur class
    const backdrop = page.locator('[class*="backdrop-blur"]').first();
    await expect(backdrop).toBeVisible();
  });
});
