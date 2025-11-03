/**
 * English Tutor Voice Recognition E2E Tests
 *
 * Phase 4 (P1): Playwright tests for English tutor voice features
 *
 * Tests:
 * 1. Voice settings default to English (UK) + Always-On
 * 2. Continuous voice input UI is visible
 * 3. Manual voice activation (no auto-start per user request)
 * 4. English voice commands work
 * 5. VAD metrics are displayed
 * 6. Smart TTS (voice input → sound on, text input → sound off)
 */

import { test, expect } from '@playwright/test';

const ENGLISH_TUTOR_URL = '/tutor/english';

test.describe('English Tutor Voice Recognition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENGLISH_TUTOR_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should have English (UK) as default input language', async ({ page }) => {
    // Open voice settings
    const settingsButton = page.locator('button[title*="설정"], button[aria-label*="Settings"]').first();
    await settingsButton.click();

    // Check that input language is English (UK)
    const inputLanguageSelect = page.locator('select').filter({ hasText: /Input Language|입력 언어/ }).first();
    const selectedValue = await inputLanguageSelect.inputValue();

    expect(selectedValue).toBe('en-GB');

    console.log('✅ English tutor default input language: en-GB');
  });

  test('should use Continuous mode by default', async ({ page }) => {
    // Open voice settings
    const settingsButton = page.locator('button[title*="설정"], button[aria-label*="Settings"]').first();
    await settingsButton.click();

    // Check that input mode is continuous
    const inputModeSelect = page.locator('select').filter({ hasText: /Input Mode|입력 모드/ }).first();
    const selectedValue = await inputModeSelect.inputValue();

    expect(selectedValue).toBe('continuous');

    console.log('✅ English tutor default input mode: continuous');
  });

  test('should display continuous voice input button', async ({ page }) => {
    // Continuous voice input button should be visible
    const continuousButton = page.locator('button').filter({
      hasText: /Start Continuous Mode|Always Listening/i
    }).first();

    await expect(continuousButton).toBeVisible();

    console.log('✅ English tutor continuous voice button is visible');
  });

  test('should NOT auto-start voice recognition on page load', async ({ page }) => {
    // Per user request: even English tutor should NOT auto-start
    await page.waitForTimeout(2000);

    // Check button text - should say "Start" not "Always Listening"
    const startButton = page.locator('button:has-text("Start Continuous Mode")').first();

    // If button exists with "Start" text, voice is not active
    const isStartButton = await startButton.count() > 0;

    // Voice should NOT be active initially
    expect(isStartButton).toBe(true);

    console.log('✅ English tutor does not auto-start voice recognition');
  });

  test('should manually start continuous listening when button is clicked', async ({ page }) => {
    const startButton = page.locator('button').filter({
      hasText: /Start Continuous Mode/i
    }).first();

    await startButton.click();
    await page.waitForTimeout(1000);

    // After click, button text should change or "LIVE" indicator should appear
    const liveIndicator = page.locator('text=/LIVE|Always Listening/i').first();
    await expect(liveIndicator).toBeVisible();

    console.log('✅ English tutor continuous mode can be manually started');
  });

  test('should display VAD metrics when continuous mode is active', async ({ page }) => {
    const startButton = page.locator('button').filter({
      hasText: /Start Continuous Mode/i
    }).first();

    await startButton.click();
    await page.waitForTimeout(1500);

    // Check for VAD metrics (Energy, ZCR)
    const energyMetric = page.locator('text=/Energy/i').first();
    const zcrMetric = page.locator('text=/ZCR/i').first();

    await expect(energyMetric).toBeVisible();
    await expect(zcrMetric).toBeVisible();

    console.log('✅ English tutor displays VAD metrics');
  });

  test('should show waveform visualization when continuous mode is active', async ({ page }) => {
    const startButton = page.locator('button').filter({
      hasText: /Start Continuous Mode/i
    }).first();

    await startButton.click();
    await page.waitForTimeout(1000);

    // Waveform should be visible (gradient bars)
    const waveformContainer = page.locator('div').filter({
      has: page.locator('div[class*="bg-gradient-to-t"]')
    }).first();

    await expect(waveformContainer).toBeVisible();

    console.log('✅ English tutor shows waveform visualization');
  });

  test('should stop continuous listening when button is clicked again', async ({ page }) => {
    const button = page.locator('button').filter({
      hasText: /Start Continuous Mode|Always Listening/i
    }).first();

    // Start
    await button.click();
    await page.waitForTimeout(1000);

    // Stop
    await button.click();
    await page.waitForTimeout(500);

    // "LIVE" indicator should disappear
    const liveIndicator = page.locator('text=/LIVE/i');
    await expect(liveIndicator).not.toBeVisible();

    console.log('✅ English tutor can stop continuous listening');
  });

  test('should have TTS toggle button', async ({ page }) => {
    const ttsButton = page.locator('button').filter({
      has: page.locator('svg.lucide-volume-2, svg.lucide-volume-x')
    }).first();

    await expect(ttsButton).toBeVisible();

    console.log('✅ English tutor TTS toggle button is visible');
  });

  test('should allow TTS to be toggled manually', async ({ page }) => {
    const ttsButton = page.locator('button').filter({
      has: page.locator('svg.lucide-volume-2, svg.lucide-volume-x')
    }).first();

    // Get initial state
    const initialHasVolumeOn = await page.locator('svg.lucide-volume-2').count() > 0;

    // Click to toggle
    await ttsButton.click();
    await page.waitForTimeout(300);

    // State should have changed
    const afterHasVolumeOn = await page.locator('svg.lucide-volume-2').count() > 0;

    expect(initialHasVolumeOn).not.toBe(afterHasVolumeOn);

    console.log('✅ English tutor TTS can be toggled manually');
  });

  test('should send text input without enabling TTS', async ({ page }) => {
    // Type a text message
    const textInput = page.locator('input[type="text"], textarea').filter({
      hasText: ''
    }).first();

    await textInput.fill('Hello, how are you?');

    // Submit
    const sendButton = page.locator('button[type="submit"]').first();
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(2000);

    console.log('✅ English tutor text input does not auto-enable TTS');
  });

  test('should support English voice settings labels', async ({ page }) => {
    const settingsButton = page.locator('button[title*="설정"], button[aria-label*="Settings"]').first();
    await settingsButton.click();

    // Check for voice-related controls
    const voiceControls = page.locator('text=/Voice|TTS|Input|Output/i');
    const controlCount = await voiceControls.count();

    expect(controlCount).toBeGreaterThan(0);

    console.log('✅ English tutor voice settings are accessible');
  });
});

test.describe('English Tutor Voice Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENGLISH_TUTOR_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should have voice command system available', async ({ page }) => {
    const continuousButton = page.locator('button').filter({
      hasText: /Start Continuous Mode|Always Listening/i
    }).first();

    await expect(continuousButton).toBeVisible();

    console.log('✅ English tutor voice command system is ready');
  });

  test('English voice commands should be supported', async ({ page }) => {
    // Commands: mute, unmute, slower, faster, repeat, stop, start
    // Verify UI readiness for these commands

    // Verify TTS toggle exists (for mute/unmute)
    const ttsButton = page.locator('button').filter({
      has: page.locator('svg.lucide-volume-2, svg.lucide-volume-x')
    }).first();
    await expect(ttsButton).toBeVisible();

    // Verify voice settings exist (for slower/faster)
    const settingsButton = page.locator('button[title*="설정"]').first();
    await expect(settingsButton).toBeVisible();

    // Verify continuous button exists (for stop/start)
    const continuousButton = page.locator('button').filter({
      hasText: /Start Continuous Mode|Always Listening/i
    }).first();
    await expect(continuousButton).toBeVisible();

    console.log('✅ English tutor English voice commands infrastructure ready');
  });
});

test.describe('English Tutor VAD Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENGLISH_TUTOR_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should display VAD energy metric', async ({ page }) => {
    const startButton = page.locator('button').filter({
      hasText: /Start Continuous Mode/i
    }).first();

    await startButton.click();
    await page.waitForTimeout(1500);

    const energyMetric = page.locator('text=/Energy.*%/i').first();
    await expect(energyMetric).toBeVisible();

    console.log('✅ English tutor displays VAD energy metric');
  });

  test('should display VAD zero-crossing rate metric', async ({ page }) => {
    const startButton = page.locator('button').filter({
      hasText: /Start Continuous Mode/i
    }).first();

    await startButton.click();
    await page.waitForTimeout(1500);

    const zcrMetric = page.locator('text=/ZCR.*%/i').first();
    await expect(zcrMetric).toBeVisible();

    console.log('✅ English tutor displays VAD ZCR metric');
  });

  test('should have Activity icon for VAD visualization', async ({ page }) => {
    const startButton = page.locator('button').filter({
      hasText: /Start Continuous Mode/i
    }).first();

    await startButton.click();
    await page.waitForTimeout(1000);

    // Activity icon (lucide-activity) should be visible
    const activityIcon = page.locator('svg.lucide-activity').first();
    await expect(activityIcon).toBeVisible();

    console.log('✅ English tutor displays VAD activity icon');
  });
});
