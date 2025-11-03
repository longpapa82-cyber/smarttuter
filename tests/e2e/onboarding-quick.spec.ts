/**
 * Quick Onboarding Flow E2E Tests
 * Tests the 2-step quick onboarding process and profile creation
 */

import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

test.describe('Quick Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and login
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Login first
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should show progress indicator (1/2 then 2/2)', async ({ page }) => {
    await page.goto('http://localhost:3001/onboarding/quick');

    // Check initial progress: 빠른 시작 1/2
    await expect(page.locator('text=빠른 시작 1/2')).toBeVisible();
  });

  test('should display all grade level options', async ({ page }) => {
    await page.goto('http://localhost:3001/onboarding/quick');

    // Check all grade levels are visible
    await expect(page.locator('button:has-text("초등학생")')).toBeVisible();
    await expect(page.locator('button:has-text("중학생")')).toBeVisible();
    await expect(page.locator('button:has-text("고등학생")')).toBeVisible();
    await expect(page.locator('button:has-text("대학생/성인")')).toBeVisible();
  });

  test('should navigate to subject selection after grade selection', async ({ page }) => {
    await page.goto('http://localhost:3001/onboarding/quick');

    // Select grade level
    await page.click('button:has-text("중학생")');

    // Wait for animation
    await page.waitForTimeout(500);

    // Should show subject selection
    await expect(page.locator('text=어떤 과목을 시작할까요?')).toBeVisible();
    await expect(page.locator('text=빠른 시작 2/2')).toBeVisible();
  });

  test('should display both subject options', async ({ page }) => {
    await page.goto('http://localhost:3001/onboarding/quick');

    // Select grade level
    await page.click('button:has-text("고등학생")');
    await page.waitForTimeout(500);

    // Check both subjects are visible
    await expect(page.locator('button:has-text("영어")')).toBeVisible();
    await expect(page.locator('button:has-text("수학")')).toBeVisible();
  });

  test('should save profile to server and localStorage', async ({ page }) => {
    await page.goto('http://localhost:3001/onboarding/quick');

    // Complete onboarding
    await page.click('button:has-text("초등학생")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("수학")');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Check localStorage has profile
    const profile = await page.evaluate(() => {
      const data = localStorage.getItem('aipark_user_profile');
      return data ? JSON.parse(data) : null;
    });

    expect(profile).toBeTruthy();
    expect(profile.gradeLevel).toBe('elementary');
    expect(profile.preferredSubjects).toContain('math');
  });

  test('should redirect to dashboard after onboarding', async ({ page }) => {
    await page.goto('http://localhost:3001/onboarding/quick');

    // Complete onboarding
    await page.click('button:has-text("대학생/성인")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("영어")');

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/onboarding/quick');

    // All grade options should be visible
    await expect(page.locator('text=어떤 학습자이신가요?')).toBeVisible();
    await expect(page.locator('button:has-text("초등학생")')).toBeVisible();

    // Should complete successfully
    await page.click('button:has-text("초등학생")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=어떤 과목을 시작할까요?')).toBeVisible();
  });
});

test.describe('Profile Persistence', () => {
  test('should persist profile across page reloads', async ({ page }) => {
    // Clear storage and login
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Login
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Complete onboarding
    await page.goto('http://localhost:3001/onboarding/quick');
    await page.click('button:has-text("중학생")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("영어")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Get profile before reload
    const profileBefore = await page.evaluate(() => {
      const data = localStorage.getItem('aipark_user_profile');
      return data ? JSON.parse(data) : null;
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Get profile after reload
    const profileAfter = await page.evaluate(() => {
      const data = localStorage.getItem('aipark_user_profile');
      return data ? JSON.parse(data) : null;
    });

    // Profile should persist
    expect(profileAfter).toBeTruthy();
    expect(profileAfter.gradeLevel).toBe(profileBefore.gradeLevel);
    expect(profileAfter.preferredSubjects).toEqual(profileBefore.preferredSubjects);
  });

  test('should sync profile from server on re-login', async ({ page }) => {
    // Clear storage
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // First login and onboarding
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto('http://localhost:3001/onboarding/quick');
    await page.click('button:has-text("고등학생")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("수학")');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Logout
    await page.goto('http://localhost:3001/dashboard');
    const profileButton = page.locator('button').filter({
      has: page.locator('svg.lucide-chevron-down')
    }).first();
    await profileButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("로그아웃")');
    await page.waitForURL('http://localhost:3001/', { timeout: 10000 });

    // Clear localStorage manually to simulate clean browser
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Login again
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for profile sync
    await page.waitForTimeout(3000);

    // Check if profile was synced from server
    const syncedProfile = await page.evaluate(() => {
      const data = localStorage.getItem('aipark_user_profile');
      return data ? JSON.parse(data) : null;
    });

    // Profile should be restored from server
    expect(syncedProfile).toBeTruthy();
    expect(syncedProfile.gradeLevel).toBe('high');
    expect(syncedProfile.preferredSubjects).toContain('math');
  });
});
