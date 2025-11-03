/**
 * Diagnostic test for "Always Listening" auto-start issue
 *
 * This test traces the exact flow of events when a user:
 * 1. Navigates to English tutor page
 * 2. Types "Hi" and submits
 * 3. Checks if "Always Listening" mode auto-starts (SHOULD NOT)
 */

import { test, expect } from '@playwright/test';

test.describe('Voice Mode Auto-Start Diagnostic', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`[Browser ${msg.type()}]:`, msg.text());
      }
    });

    // Navigate to English tutor page
    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');
  });

  test('should NOT auto-start "Always Listening" when typing "Hi"', async ({ page }) => {
    // Step 1: Check initial state - "Always Listening" should NOT be visible or active
    console.log('\n=== STEP 1: Checking initial state ===');

    const initialAlwaysListeningButton = page.getByRole('button', { name: /always listening/i });
    const initialStartContinuousButton = page.getByRole('button', { name: /start continuous mode/i });

    // At least one of these should exist (depending on inputMode)
    const hasAnyVoiceButton = await initialAlwaysListeningButton.count() > 0 ||
                              await initialStartContinuousButton.count() > 0;

    console.log(`Has voice buttons: ${hasAnyVoiceButton}`);

    if (await initialAlwaysListeningButton.count() > 0) {
      console.log('❌ PROBLEM: "Always Listening" button is already visible on page load!');
      console.log('This means inputMode is "continuous" by default');
    }

    if (await initialStartContinuousButton.count() > 0) {
      console.log('✅ GOOD: "Start Continuous Mode" button visible (not auto-started)');
    }

    // Step 2: Type "Hi" in the input field
    console.log('\n=== STEP 2: Typing "Hi" in input field ===');

    const inputField = page.locator('textarea, input[type="text"]').first();
    await inputField.waitFor({ state: 'visible', timeout: 5000 });
    await inputField.fill('Hi');

    console.log('Typed "Hi" into input field');

    // Step 3: Submit the form
    console.log('\n=== STEP 3: Submitting the form ===');

    const submitButton = page.getByRole('button', { name: /send|전송/i }).or(
      page.locator('button[type="submit"]')
    );
    await submitButton.click();

    console.log('Clicked submit button');

    // Wait for response
    await page.waitForTimeout(2000);

    // Step 4: Check if "Always Listening" auto-started (IT SHOULD NOT)
    console.log('\n=== STEP 4: Checking if "Always Listening" auto-started ===');

    const afterSubmitAlwaysListening = page.getByRole('button', { name: /always listening/i });
    const afterSubmitStartContinuous = page.getByRole('button', { name: /start continuous mode/i });

    const alwaysListeningCount = await afterSubmitAlwaysListening.count();
    const startContinuousCount = await afterSubmitStartContinuous.count();

    console.log(`"Always Listening" buttons found: ${alwaysListeningCount}`);
    console.log(`"Start Continuous Mode" buttons found: ${startContinuousCount}`);

    // Step 5: Check for VAD initialization logs
    console.log('\n=== STEP 5: Checking browser console for auto-start evidence ===');
    console.log('Look for: "Continuous listening started", "VAD initialized", "VAD and Noise Suppression initialized"');
    console.log('These should NOT appear unless user clicks the button');

    // Step 6: Visual verification - check if LIVE indicator is present
    const liveIndicator = page.locator('text=LIVE');
    const liveIndicatorVisible = await liveIndicator.isVisible().catch(() => false);

    console.log(`\n=== STEP 6: LIVE indicator visible: ${liveIndicatorVisible} ===`);

    if (liveIndicatorVisible) {
      console.log('❌ FAILURE: LIVE indicator is visible - continuous mode auto-started!');
    } else {
      console.log('✅ SUCCESS: LIVE indicator not visible - no auto-start');
    }

    // Step 7: Check for waveform visualization (sign of active listening)
    const waveform = page.locator('div').filter({ hasText: /energy|zcr|speaking/i }).first();
    const waveformVisible = await waveform.isVisible().catch(() => false);

    console.log(`\n=== STEP 7: Waveform visualization visible: ${waveformVisible} ===`);

    if (waveformVisible) {
      console.log('❌ FAILURE: Waveform visible - VAD is active!');
    } else {
      console.log('✅ SUCCESS: Waveform not visible - VAD not active');
    }

    // Final assertion
    expect(alwaysListeningCount, '"Always Listening" should NOT be active after typing').toBe(0);
    expect(liveIndicatorVisible, 'LIVE indicator should NOT be visible').toBe(false);
    expect(waveformVisible, 'Waveform should NOT be visible').toBe(false);
  });

  test('should trace voiceSettings.inputMode value', async ({ page }) => {
    console.log('\n=== Tracing voiceSettings.inputMode ===');

    // Inject script to monitor voiceSettings changes
    await page.addInitScript(() => {
      // Hook into React DevTools or component state
      (window as any).__VOICE_SETTINGS_TRACE__ = [];

      // Log any localStorage changes
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key.includes('voice') || key.includes('settings')) {
          console.log(`localStorage.setItem("${key}", ${value})`);
          (window as any).__VOICE_SETTINGS_TRACE__.push({ type: 'localStorage', key, value });
        }
        return originalSetItem.apply(this, arguments as any);
      };
    });

    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');

    // Check if ContinuousVoiceInput component is rendered
    const continuousVoiceInput = page.locator('button', { hasText: /always listening|start continuous mode/i });
    const isRendered = await continuousVoiceInput.count() > 0;

    console.log(`\nContinuousVoiceInput component rendered: ${isRendered}`);

    if (isRendered) {
      const buttonText = await continuousVoiceInput.first().textContent();
      console.log(`Button text: "${buttonText}"`);

      if (buttonText?.includes('Always Listening')) {
        console.log('❌ inputMode is "continuous" AND already active');
      } else if (buttonText?.includes('Start Continuous')) {
        console.log('⚠️ inputMode is "continuous" but NOT active yet');
        console.log('This means the component is rendered but user must click to start');
      }
    } else {
      console.log('✅ inputMode is likely "push-to-talk" (ContinuousVoiceInput not rendered)');
    }

    // Get trace data
    const traceData = await page.evaluate(() => (window as any).__VOICE_SETTINGS_TRACE__);
    console.log('\nVoice settings trace:', JSON.stringify(traceData, null, 2));
  });

  test('should verify English tutor default inputMode', async ({ page }) => {
    console.log('\n=== Verifying English tutor default inputMode ===');

    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');

    // Open voice settings modal
    const settingsButton = page.getByRole('button', { name: /settings|설정/i });

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Check for inputMode radio buttons or dropdown
      const pushToTalkOption = page.locator('text=/push.*talk/i');
      const continuousOption = page.locator('text=/continuous|always.*on/i');

      const hasPushToTalk = await pushToTalkOption.count() > 0;
      const hasContinuous = await continuousOption.count() > 0;

      console.log(`Push-to-Talk option found: ${hasPushToTalk}`);
      console.log(`Continuous option found: ${hasContinuous}`);

      // Check which one is selected
      if (hasPushToTalk) {
        const pushToTalkChecked = await page.locator('input[type="radio"][value="push-to-talk"]').isChecked();
        console.log(`Push-to-Talk is selected: ${pushToTalkChecked}`);
      }

      if (hasContinuous) {
        const continuousChecked = await page.locator('input[type="radio"][value="continuous"]').isChecked();
        console.log(`Continuous is selected: ${continuousChecked}`);

        if (continuousChecked) {
          console.log('❌ PROBLEM CONFIRMED: English tutor defaults to "continuous" mode');
          console.log('This causes ContinuousVoiceInput component to render on page load');
        }
      }
    } else {
      console.log('Settings button not found - cannot verify inputMode');
    }
  });
});
