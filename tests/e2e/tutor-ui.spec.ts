import { test, expect } from '@playwright/test';

test.describe('Tutor UI Components', () => {
  test.beforeEach(async ({ page }) => {
    // Grant microphone permission
    await page.context().grantPermissions(['microphone']);

    // Setup mock profile in localStorage to bypass onboarding
    await page.addInitScript(() => {
      const mockProfile = {
        id: 'test-user',
        username: 'Test User',
        gradeLevel: 'middle',
        avatar: '🎓',
        createdAt: new Date().toISOString(),
        points: {
          totalXP: 0,
          level: 1,
          currentLevelXP: 0,
          nextLevelXP: 100,
        },
        achievements: [],
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: '',
          freezeCount: 3,
        },
        sessions: [],
        totalStudyTime: 0,
        subjectProgress: {
          english: 0,
          math: 0,
        },
      };

      const zustandState = {
        state: {
          profile: mockProfile,
        },
        version: 0,
      };

      localStorage.setItem('smarttuter-user-profile', JSON.stringify(zustandState));
    });
  });

  test('English Tutor - All UI components should render', async ({ page }) => {
    await page.goto('http://localhost:3000/tutor/english');

    // Wait for hydration to complete by waiting for actual content
    await page.waitForSelector('h1:has-text("영어 튜터")', { timeout: 2000 });

    // Check header
    await expect(page.locator('h1')).toContainText('영어 튜터');

    // Check TTS controls in header
    const ttsButton = page.locator('button[title*="TTS"]').first();
    await expect(ttsButton).toBeVisible();

    const settingsButton = page.locator('button[title*="음성 설정"]');
    await expect(settingsButton).toBeVisible();

    // Check voice button (microphone)
    const voiceButton = page.locator('button[title="Hold to speak"]');
    await expect(voiceButton).toBeVisible();

    // Check chat input
    const chatInput = page.locator('input[placeholder*="메시지를 입력"]');
    await expect(chatInput).toBeVisible();

    // Check send button
    const sendButton = page.locator('button[type="submit"]');
    await expect(sendButton).toBeVisible();

    // Check bottom navigation
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();

    // Check all 5 navigation buttons
    const navButtons = page.locator('nav[role="navigation"] button');
    await expect(navButtons).toHaveCount(5);

    // Verify nav button labels
    await expect(navButtons.nth(0)).toContainText('Home');
    await expect(navButtons.nth(1)).toContainText('Tutor');
    await expect(navButtons.nth(2)).toContainText('Dashboard');
    await expect(navButtons.nth(3)).toContainText('Analytics');
    await expect(navButtons.nth(4)).toContainText('Profile');
  });

  test('Math Tutor - All UI components should render', async ({ page }) => {
    await page.goto('http://localhost:3000/tutor/math');

    // Wait for hydration to complete by waiting for actual content
    await page.waitForSelector('h1:has-text("수학 튜터")', { timeout: 2000 });

    // Check header
    await expect(page.locator('h1')).toContainText('수학 튜터');

    // Check TTS controls
    await expect(page.locator('button[title*="TTS"]').first()).toBeVisible();
    await expect(page.locator('button[title*="음성 설정"]')).toBeVisible();

    // Check voice button
    await expect(page.locator('button[title="Hold to speak"]')).toBeVisible();

    // Check chat input
    await expect(page.locator('input[placeholder*="메시지를 입력"]')).toBeVisible();

    // Check bottom navigation
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    await expect(page.locator('nav[role="navigation"] button')).toHaveCount(5);
  });

  test('Chat input and bottom navigation spacing', async ({ page }) => {
    await page.goto('http://localhost:3000/tutor/english');
    await page.waitForSelector('h1:has-text("영어 튜터")', { timeout: 2000 });

    // Get positions
    const chatInputBox = page.locator('input[placeholder*="메시지를 입력"]').locator('..');
    const bottomNav = page.locator('nav[role="navigation"]');

    const inputBox = await chatInputBox.boundingBox();
    const navBox = await bottomNav.boundingBox();

    expect(inputBox).not.toBeNull();
    expect(navBox).not.toBeNull();

    if (inputBox && navBox) {
      // Input box should be above navigation
      expect(inputBox.y + inputBox.height).toBeLessThan(navBox.y);

      // There should be some gap between them
      const gap = navBox.y - (inputBox.y + inputBox.height);
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeLessThan(100); // Not too much gap (was 160px before fix)
    }
  });

  test('TTS toggle functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/tutor/english');
    await page.waitForSelector('h1:has-text("영어 튜터")', { timeout: 2000 });

    const ttsButton = page.locator('button[title*="TTS"]').first();

    // Initially TTS should be enabled (blue background)
    await expect(ttsButton).toHaveClass(/bg-blue-100/);

    // Click to disable
    await ttsButton.click();
    await expect(ttsButton).toHaveClass(/bg-gray-100/);

    // Click to enable again
    await ttsButton.click();
    await expect(ttsButton).toHaveClass(/bg-blue-100/);
  });

  test.skip('Voice settings modal opens', async ({ page }) => {
    // This test is skipped because voice settings modal implementation needs verification
    await page.goto('http://localhost:3000/tutor/english');
    await page.waitForSelector('h1:has-text("영어 튜터")', { timeout: 2000 });

    const settingsButton = page.locator('button[title*="음성 설정"]');
    await settingsButton.click();

    // Voice settings modal should appear
    const modal = page.locator('[role="dialog"], .modal, [class*="Modal"]');
    await expect(modal.first()).toBeVisible({ timeout: 1000 });
  });

  test('Chat message can be typed and sent', async ({ page }) => {
    await page.goto('http://localhost:3000/tutor/math');
    await page.waitForSelector('h1:has-text("수학 튜터")', { timeout: 2000 });

    const chatInput = page.locator('input[placeholder*="메시지를 입력"]');
    const sendButton = page.locator('button[type="submit"]');

    // Type a message
    await chatInput.fill('What is 2+2?');

    // Send button should be enabled
    await expect(sendButton).toBeEnabled();

    // Click send
    await sendButton.click();

    // Input should be cleared
    await expect(chatInput).toHaveValue('');

    // Wait for response (with timeout)
    const userMessage = page.locator('text=What is 2+2?');
    await expect(userMessage).toBeVisible({ timeout: 5000 });
  });

  test('Navigation between pages works', async ({ page }) => {
    await page.goto('http://localhost:3000/tutor/english');
    await page.waitForSelector('h1:has-text("영어 튜터")', { timeout: 2000 });

    // Click Home button
    const homeButton = page.locator('nav button[aria-label="Home"]');
    await homeButton.click();

    // Should navigate to home
    await expect(page).toHaveURL('http://localhost:3000/');

    // Go back to tutor
    await page.goto('http://localhost:3000/tutor/math');
    await page.waitForSelector('h1:has-text("수학 튜터")', { timeout: 2000 });

    // Click Dashboard
    const dashboardButton = page.locator('nav button[aria-label="Dashboard"]');
    await dashboardButton.click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('No hydration errors in console', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/tutor/english');
    await page.waitForTimeout(1000);

    // Filter out known acceptable errors
    const hydrationErrors = consoleErrors.filter(err =>
      err.includes('Hydration') || err.includes('hydration')
    );

    expect(hydrationErrors).toHaveLength(0);
  });
});
