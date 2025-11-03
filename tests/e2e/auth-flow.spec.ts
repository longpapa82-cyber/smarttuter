/**
 * Authentication Flow E2E Tests
 * Tests login, logout, and profile synchronization
 */

import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

const BASE_URL = 'http://localhost:3000';

// Only use chromium for faster testing
test.use({ browserName: 'chromium' });

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should show login button when logged out', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for navigation to be visible instead of networkidle
    await page.locator('nav').waitFor({ state: 'visible', timeout: 10000 });

    // Should show "시작하기" button in navigation
    const startButton = page.locator('a:has-text("시작하기")').first();
    await expect(startButton).toBeVisible({ timeout: 10000 });
  });

  test('should redirect to login when clicking start button', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.locator('nav').waitFor({ state: 'visible', timeout: 10000 });

    // Click "무료로 시작하기" button
    await page.click('a:has-text("무료로 시작하기")');

    // Should redirect to login page with callback URL
    await expect(page).toHaveURL(/\/login\?callbackUrl/, { timeout: 10000 });
  });

  test('should complete login flow successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    // Wait for form to be visible
    await page.locator('form').waitFor({ state: 'visible', timeout: 10000 });

    // Fill in login form using IDs
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect (should go to onboarding if no profile, or dashboard if profile exists)
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });

    // Should be authenticated
    const url = page.url();
    expect(url).toMatch(/\/(onboarding|dashboard)/);
  });

  test('should show profile dropdown when logged in', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('form').waitFor({ state: 'visible', timeout: 10000 });
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });

    // Navigate to home
    await page.goto('http://localhost:3000');
    await page.locator('nav').waitFor({ state: 'visible', timeout: 10000 });

    // Should show profile avatar (not "시작하기" button)
    const profileButton = page.locator('button').filter({
      has: page.locator('svg.lucide-chevron-down')
    }).first();

    await expect(profileButton).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully and redirect to home', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('form').waitFor({ state: 'visible', timeout: 10000 });
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });

    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.locator('main').waitFor({ state: 'visible', timeout: 10000 });

    // Open profile dropdown
    const profileButton = page.locator('button').filter({
      has: page.locator('svg.lucide-chevron-down')
    }).first();
    await profileButton.click();
    await page.waitForTimeout(500);

    // Click logout button
    const logoutButton = page.locator('button:has-text("로그아웃")');
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
    await logoutButton.click();

    // Should redirect to home page
    await page.waitForURL('http://localhost:3000/', { timeout: 15000 });

    // Should show "시작하기" button again (logged out state)
    const startButton = page.locator('a:has-text("시작하기")').first();
    await expect(startButton).toBeVisible({ timeout: 10000 });
  });

  test('should clear localStorage on logout', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('form').waitFor({ state: 'visible', timeout: 10000 });
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });

    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.locator('main').waitFor({ state: 'visible', timeout: 10000 });

    // Logout
    const profileButton = page.locator('button').filter({
      has: page.locator('svg.lucide-chevron-down')
    }).first();
    await profileButton.click();
    await page.waitForTimeout(500);

    const logoutButton = page.locator('button:has-text("로그아웃")');
    await logoutButton.click();

    // Wait for redirect
    await page.waitForURL('http://localhost:3000/', { timeout: 15000 });

    // Check localStorage is cleared
    const profile = await page.evaluate(() => {
      return localStorage.getItem('aipark_user_profile');
    });

    expect(profile).toBeNull();
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.locator('form').waitFor({ state: 'visible', timeout: 10000 });

    // Fill in wrong credentials
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/이메일 또는 비밀번호/i')).toBeVisible({ timeout: 10000 });
  });
});
