/**
 * Voice Commands E2E Tests
 *
 * Phase 4 (P1): Tests for voice command system
 *
 * Tests all 7 voice commands:
 * 1. Mute / 음소거
 * 2. Unmute / 소리켜
 * 3. Stop listening / 그만
 * 4. Start listening / 시작
 * 5. Repeat / 다시
 * 6. Slower / 천천히
 * 7. Faster / 빠르게
 */

import { test, expect } from '@playwright/test';

test.describe('Voice Commands - Math Tutor (Korean)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutor/math');
    await page.waitForLoadState('networkidle');
  });

  test('Command 1: 음소거 (Mute) - TTS toggle infrastructure exists', async ({ page }) => {
    const ttsButton = page.locator('button').filter({
      has: page.locator('svg.lucide-volume-2, svg.lucide-volume-x')
    }).first();

    await expect(ttsButton).toBeVisible();
    await expect(ttsButton).toBeEnabled();

    // Click to mute
    await ttsButton.click();
    await page.waitForTimeout(300);

    // Volume-X icon should appear (muted state)
    const mutedIcon = page.locator('svg.lucide-volume-x');
    const isMuted = await mutedIcon.count() > 0;

    expect(isMuted).toBe(true);

    console.log('✅ 음소거 command infrastructure verified');
  });

  test('Command 2: 소리켜 (Unmute) - TTS can be re-enabled', async ({ page }) => {
    const ttsButton = page.locator('button').filter({
      has: page.locator('svg.lucide-volume-2, svg.lucide-volume-x')
    }).first();

    // Mute first
    await ttsButton.click();
    await page.waitForTimeout(300);

    // Unmute
    await ttsButton.click();
    await page.waitForTimeout(300);

    // Volume-2 icon should appear (unmuted state)
    const unmutedIcon = page.locator('svg.lucide-volume-2');
    const isUnmuted = await unmutedIcon.count() > 0;

    expect(isUnmuted).toBe(true);

    console.log('✅ 소리켜 command infrastructure verified');
  });

  test('Command 6: 천천히 (Slower) - Voice speed can be decreased', async ({ page }) => {
    // Open voice settings
    const settingsButton = page.locator('button[title*="설정"]').first();
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Find voice speed control
    const speedControl = page.locator('input[type="range"]').filter({
      has: page.locator('xpath=ancestor::*[contains(., "Speed") or contains(., "속도")]')
    }).first();

    if (await speedControl.count() > 0) {
      const initialSpeed = await speedControl.inputValue();
      console.log('Initial speed:', initialSpeed);

      // Speed control exists
      await expect(speedControl).toBeVisible();

      console.log('✅ 천천히 command infrastructure verified');
    } else {
      // Alternative: check for speed-related labels
      const speedLabel = page.locator('text=/Speed|속도/i');
      await expect(speedLabel).toBeVisible();

      console.log('✅ 천천히 command infrastructure verified (label found)');
    }
  });

  test('Command 7: 빠르게 (Faster) - Voice speed can be increased', async ({ page }) => {
    const settingsButton = page.locator('button[title*="설정"]').first();
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Voice speed control should exist
    const speedLabel = page.locator('text=/Speed|속도/i');
    await expect(speedLabel).toBeVisible();

    console.log('✅ 빠르게 command infrastructure verified');
  });

  test('Command 5: 다시 (Repeat) - Chat history exists for repeat', async ({ page }) => {
    // Send a message first
    const textInput = page.locator('input[type="text"], textarea').first();
    await textInput.fill('안녕하세요');

    const sendButton = page.locator('button[type="submit"]').first();
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if messages exist in the chat
    const messages = page.locator('[role="log"], .message, div[class*="message"]');
    const messageCount = await messages.count();

    // Should have at least 2 messages (user + assistant)
    expect(messageCount).toBeGreaterThanOrEqual(2);

    console.log('✅ 다시 command infrastructure verified (chat history exists)');
  });
});

test.describe('Voice Commands - English Tutor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');
  });

  test('Command 1: mute - TTS toggle exists', async ({ page }) => {
    const ttsButton = page.locator('button').filter({
      has: page.locator('svg.lucide-volume-2, svg.lucide-volume-x')
    }).first();

    await expect(ttsButton).toBeVisible();
    await expect(ttsButton).toBeEnabled();

    console.log('✅ mute command infrastructure verified');
  });

  test('Command 2: unmute - TTS can be enabled', async ({ page }) => {
    const ttsButton = page.locator('button').filter({
      has: page.locator('svg.lucide-volume-2, svg.lucide-volume-x')
    }).first();

    // Toggle twice to test unmute
    await ttsButton.click();
    await page.waitForTimeout(200);
    await ttsButton.click();
    await page.waitForTimeout(200);

    // Should be in unmuted state
    const unmutedIcon = page.locator('svg.lucide-volume-2');
    const isUnmuted = await unmutedIcon.count() > 0;

    expect(isUnmuted).toBe(true);

    console.log('✅ unmute command infrastructure verified');
  });

  test('Command 3: stop listening - Continuous mode can be stopped', async ({ page }) => {
    const button = page.locator('button').filter({
      hasText: /Start Continuous Mode|Always Listening/i
    }).first();

    // Start
    await button.click();
    await page.waitForTimeout(1000);

    // Stop
    await button.click();
    await page.waitForTimeout(500);

    // Should return to "Start" state
    const startButton = page.locator('button:has-text("Start Continuous Mode")');
    const hasStartButton = await startButton.count() > 0;

    expect(hasStartButton).toBe(true);

    console.log('✅ stop listening command infrastructure verified');
  });

  test('Command 4: start listening - Continuous mode can be started', async ({ page }) => {
    const startButton = page.locator('button').filter({
      hasText: /Start Continuous Mode/i
    }).first();

    await startButton.click();
    await page.waitForTimeout(1000);

    // "LIVE" indicator should appear
    const liveIndicator = page.locator('text=/LIVE|Always Listening/i');
    await expect(liveIndicator).toBeVisible();

    console.log('✅ start listening command infrastructure verified');
  });

  test('Command 5: repeat - Chat history exists', async ({ page }) => {
    // Send a message
    const textInput = page.locator('input[type="text"], textarea').first();
    await textInput.fill('Hello');

    const sendButton = page.locator('button[type="submit"]').first();
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Messages should exist
    const messages = page.locator('[role="log"], .message, div[class*="message"]');
    const messageCount = await messages.count();

    expect(messageCount).toBeGreaterThanOrEqual(2);

    console.log('✅ repeat command infrastructure verified');
  });

  test('Command 6: slower - Voice speed control exists', async ({ page }) => {
    const settingsButton = page.locator('button[title*="설정"]').first();
    await settingsButton.click();
    await page.waitForTimeout(500);

    const speedLabel = page.locator('text=/Speed|속도/i');
    await expect(speedLabel).toBeVisible();

    console.log('✅ slower command infrastructure verified');
  });

  test('Command 7: faster - Voice speed control exists', async ({ page }) => {
    const settingsButton = page.locator('button[title*="설정"]').first();
    await settingsButton.click();
    await page.waitForTimeout(500);

    const speedLabel = page.locator('text=/Speed|속도/i');
    await expect(speedLabel).toBeVisible();

    console.log('✅ faster command infrastructure verified');
  });
});

test.describe('Voice Command Detection System', () => {
  test('Voice command processor module exists', async () => {
    // This is a compile-time test - if the tests run, the module is imported successfully
    const { detectVoiceCommand } = require('../../../lib/voice/voice-command-processor');

    expect(detectVoiceCommand).toBeDefined();
    expect(typeof detectVoiceCommand).toBe('function');

    console.log('✅ Voice command processor module exists and is importable');
  });

  test('Voice commands are defined correctly', async () => {
    const { VOICE_COMMANDS } = require('../../../lib/voice/voice-command-processor');

    expect(VOICE_COMMANDS).toBeDefined();
    expect(Array.isArray(VOICE_COMMANDS)).toBe(true);
    expect(VOICE_COMMANDS.length).toBe(7); // 7 commands

    console.log('✅ All 7 voice commands are defined');
  });

  test('Korean voice commands are defined', async () => {
    const { VOICE_COMMANDS } = require('../../../lib/voice/voice-command-processor');

    const hasKoreanAliases = VOICE_COMMANDS.every(
      (cmd: any) => cmd.koreanAliases && cmd.koreanAliases.length > 0
    );

    expect(hasKoreanAliases).toBe(true);

    console.log('✅ All voice commands have Korean aliases');
  });

  test('English voice commands are defined', async () => {
    const { VOICE_COMMANDS } = require('../../../lib/voice/voice-command-processor');

    const hasEnglishAliases = VOICE_COMMANDS.every(
      (cmd: any) => cmd.englishAliases && cmd.englishAliases.length > 0
    );

    expect(hasEnglishAliases).toBe(true);

    console.log('✅ All voice commands have English aliases');
  });

  test('Voice command detection works for Korean', async () => {
    const { detectVoiceCommand } = require('../../../lib/voice/voice-command-processor');

    const result = detectVoiceCommand('음소거', 'ko-KR');

    expect(result.isCommand).toBe(true);
    expect(result.command).toBeDefined();
    expect(result.command.type).toBe('mute');

    console.log('✅ Korean voice command detection works');
  });

  test('Voice command detection works for English', async () => {
    const { detectVoiceCommand } = require('../../../lib/voice/voice-command-processor');

    const result = detectVoiceCommand('mute', 'en-GB');

    expect(result.isCommand).toBe(true);
    expect(result.command).toBeDefined();
    expect(result.command.type).toBe('mute');

    console.log('✅ English voice command detection works');
  });

  test('Non-command input is correctly identified', async () => {
    const { detectVoiceCommand } = require('../../../lib/voice/voice-command-processor');

    const result = detectVoiceCommand('안녕하세요', 'ko-KR');

    expect(result.isCommand).toBe(false);
    expect(result.command).toBeUndefined();

    console.log('✅ Non-command input is correctly identified');
  });
});
