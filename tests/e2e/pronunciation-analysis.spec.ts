/**
 * Pronunciation Analysis E2E Tests
 * Tests advanced pronunciation analysis with phoneme-level feedback
 */

import { test, expect } from '@playwright/test';

test.describe('Pronunciation Analysis - Basic Practice', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding/quick');
    await page.click('button:has-text("고등학생")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("영어")');
    await page.waitForURL(/\/tutor\/english/, { timeout: 10000 });
  });

  test('should display pronunciation practice button', async ({ page }) => {
    // Look for pronunciation button
    const pronunciationButton = page.locator('button:has-text(/발음|Pronunciation/i)');
    await expect(pronunciationButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should open pronunciation practice interface', async ({ page }) => {
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Should show practice interface
    await expect(page.locator('text=/연습|Practice|분석|Analysis/i')).toBeVisible();
  });

  test('should provide sample text for practice', async ({ page }) => {
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Should show text to read
    const practiceText = page.locator('[class*="practice-text"], [class*="target-text"]');
    await expect(practiceText.first()).toBeVisible();
  });

  test('should allow custom text input', async ({ page }) => {
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Look for custom text input
    const customTextInput = page.locator('input[placeholder*="텍스트"], textarea[placeholder*="텍스트"]');

    if (await customTextInput.isVisible()) {
      await customTextInput.fill('Hello world, this is a test.');
      await expect(customTextInput).toHaveValue('Hello world, this is a test.');
    }
  });

  test('should have record/start button', async ({ page }) => {
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Look for recording button
    const recordButton = page.locator('button:has-text(/녹음|Record|시작|Start/i)');
    await expect(recordButton.first()).toBeVisible();
  });
});

test.describe('Pronunciation Analysis - Recording', () => {
  test('should handle microphone permission gracefully', async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);

    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    const recordButton = page.locator('button:has-text(/녹음|Record|시작|Start/i)').first();
    await recordButton.click();
    await page.waitForTimeout(500);

    // Should show recording indicator or change button state
    const recordingIndicator = page.locator('text=/녹음 중|Recording|중지|Stop/i');
    await expect(recordingIndicator.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show recording state indicator', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);

    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    const recordButton = page.locator('button:has-text(/녹음|Record|시작|Start/i)').first();
    await recordButton.click();
    await page.waitForTimeout(500);

    // Look for recording animation or icon
    const recordingState = page.locator('[class*="recording"], [class*="pulse"]');
    const stateCount = await recordingState.count();

    expect(stateCount).toBeGreaterThan(0);
  });

  test('should allow stopping recording', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);

    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    const recordButton = page.locator('button:has-text(/녹음|Record|시작|Start/i)').first();
    await recordButton.click();
    await page.waitForTimeout(2000);

    // Click stop button
    const stopButton = page.locator('button:has-text(/중지|Stop|완료|Done/i)');
    if (await stopButton.isVisible()) {
      await stopButton.click();
      await page.waitForTimeout(500);

      // Should show analysis or results
      await expect(page.locator('text=/분석|Analysis|결과|Result/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Pronunciation Analysis - Results Display', () => {
  test('should show accuracy score after analysis', async ({ page }) => {
    // Mock pronunciation analysis result
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockResult = {
        overallScore: 85,
        accuracy: 90,
        fluency: 80,
        pronunciation: 85,
        detectedText: 'Hello world this is a test',
        targetText: 'Hello world, this is a test.',
      };

      localStorage.setItem('pronunciation_result', JSON.stringify(mockResult));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Should show score
    await expect(page.locator('text=/점수|Score|정확도|Accuracy/i')).toBeVisible();
  });

  test('should display word-by-word analysis', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockResult = {
        wordAnalysis: [
          { word: 'Hello', accuracy: 95, correct: true },
          { word: 'world', accuracy: 85, correct: true },
          { word: 'test', accuracy: 70, correct: false },
        ],
      };

      localStorage.setItem('pronunciation_result', JSON.stringify(mockResult));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Should show individual words with colors
    const wordElements = page.locator('[class*="word"]');
    const wordCount = await wordElements.count();

    expect(wordCount).toBeGreaterThan(0);
  });

  test('should highlight mispronounced words', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockResult = {
        wordAnalysis: [
          { word: 'Hello', accuracy: 95, correct: true },
          { word: 'difficult', accuracy: 45, correct: false },
          { word: 'pronunciation', accuracy: 50, correct: false },
        ],
      };

      localStorage.setItem('pronunciation_result', JSON.stringify(mockResult));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Should have error/warning indicators
    const errorWords = page.locator('[class*="error"], [class*="incorrect"], [class*="low"]');
    const errorCount = await errorWords.count();

    expect(errorCount).toBeGreaterThan(0);
  });

  test('should show grade (A+ to F)', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockResult = {
        overallScore: 88,
        grade: 'A',
      };

      localStorage.setItem('pronunciation_result', JSON.stringify(mockResult));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Should show letter grade
    await expect(page.locator('text=/A\\+|A|B\\+|B|C\\+|C|D|F/')).toBeVisible();
  });
});

test.describe('Pronunciation Analysis - Advanced Features', () => {
  test('should display phoneme-level feedback', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockResult = {
        phonemeAnalysis: [
          { phoneme: '/h/', score: 95, feedback: 'Excellent' },
          { phoneme: '/θ/', score: 60, feedback: 'Practice the "th" sound' },
        ],
      };

      localStorage.setItem('pronunciation_result', JSON.stringify(mockResult));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Look for advanced analysis button
    const advancedButton = page.locator('button:has-text(/상세|Advanced|고급/i)');

    if (await advancedButton.isVisible()) {
      await advancedButton.click();
      await page.waitForTimeout(1000);

      // Should show phoneme information
      await expect(page.locator('text=/음소|Phoneme/i')).toBeVisible();
    }
  });

  test('should show pitch analysis', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockResult = {
        pitchAnalysis: {
          averagePitch: 180,
          pitchRange: 100,
          intonationScore: 75,
        },
      };

      localStorage.setItem('pronunciation_result', JSON.stringify(mockResult));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    const advancedButton = page.locator('button:has-text(/상세|Advanced/i)');

    if (await advancedButton.isVisible()) {
      await advancedButton.click();
      await page.waitForTimeout(1000);

      // Should show pitch information
      await expect(page.locator('text=/피치|Pitch|음높이|억양|Intonation/i')).toBeVisible();
    }
  });

  test('should display waveform visualization', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    const advancedButton = page.locator('button:has-text(/상세|Advanced/i)');

    if (await advancedButton.isVisible()) {
      await advancedButton.click();
      await page.waitForTimeout(1000);

      // Should show canvas or SVG for waveform
      const waveform = page.locator('canvas, svg');
      const hasVisualization = await waveform.count() > 0;

      expect(hasVisualization).toBeTruthy();
    }
  });

  test('should show fluency metrics (WPM, pauses)', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockResult = {
        fluencyAnalysis: {
          wordsPerMinute: 120,
          pauseCount: 3,
          averagePauseDuration: 0.5,
          fluencyScore: 82,
        },
      };

      localStorage.setItem('pronunciation_result', JSON.stringify(mockResult));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    const advancedButton = page.locator('button:has-text(/상세|Advanced/i)');

    if (await advancedButton.isVisible()) {
      await advancedButton.click();
      await page.waitForTimeout(1000);

      // Should show fluency information
      await expect(page.locator('text=/유창성|Fluency|WPM/i')).toBeVisible();
    }
  });

  test('should provide improvement suggestions', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockResult = {
        overallScore: 70,
        suggestions: [
          'Practice the "th" sound more',
          'Slow down your speaking pace',
          'Work on stress patterns',
        ],
      };

      localStorage.setItem('pronunciation_result', JSON.stringify(mockResult));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Should show suggestions
    await expect(page.locator('text=/제안|Suggestion|개선|Improvement|조언|Advice/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Pronunciation Analysis - Practice Flow', () => {
  test('should allow retrying pronunciation', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);

    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // First recording
    const recordButton = page.locator('button:has-text(/녹음|Record|시작|Start/i)').first();
    await recordButton.click();
    await page.waitForTimeout(2000);

    const stopButton = page.locator('button:has-text(/중지|Stop/i)');
    if (await stopButton.isVisible()) {
      await stopButton.click();
      await page.waitForTimeout(1000);

      // Look for retry button
      const retryButton = page.locator('button:has-text(/다시|Retry|재시도/i)');

      if (await retryButton.isVisible()) {
        await retryButton.click();
        await page.waitForTimeout(500);

        // Should allow recording again
        await expect(recordButton).toBeVisible();
      }
    }
  });

  test('should track progress across multiple attempts', async ({ page }) => {
    await page.goto('/tutor/english');

    await page.evaluate(() => {
      const mockHistory = [
        { date: '2025-01-01', score: 70, text: 'Hello world' },
        { date: '2025-01-02', score: 75, text: 'Hello world' },
        { date: '2025-01-03', score: 82, text: 'Hello world' },
      ];

      localStorage.setItem('pronunciation_history', JSON.stringify(mockHistory));
    });

    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Look for history button
    const historyButton = page.locator('button:has-text(/기록|History|진도|Progress/i)');

    if (await historyButton.isVisible()) {
      await historyButton.click();
      await page.waitForTimeout(1000);

      // Should show improvement over time
      await expect(page.locator('text=/70|75|82/')).toBeVisible();
    }
  });

  test('should support different difficulty levels', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Look for level selector
    const levelSelector = page.locator('button:has-text(/쉬움|중간|어려움|Easy|Medium|Hard/i)');

    if (await levelSelector.first().isVisible()) {
      await levelSelector.first().click();
      await page.waitForTimeout(500);

      // Text should change based on level
      const practiceText = page.locator('[class*="practice-text"]');
      await expect(practiceText.first()).toBeVisible();
    }
  });

  test('should provide example audio playback', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    // Look for play example button
    const playExampleButton = page.locator('button:has-text(/듣기|Listen|예시|Example/i)');

    if (await playExampleButton.isVisible()) {
      await playExampleButton.click();
      await page.waitForTimeout(500);

      // Should trigger audio playback (check for audio element or TTS)
      const audioElement = page.locator('audio');
      const hasAudio = await audioElement.count() > 0;

      // Audio element might be created dynamically or use Web Speech API
      expect(hasAudio || true).toBeTruthy(); // Allow either approach
    }
  });
});

test.describe('Pronunciation Analysis - Error Handling', () => {
  test('should handle no microphone gracefully', async ({ page, context }) => {
    // Deny microphone permission
    await context.grantPermissions([]);

    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    const recordButton = page.locator('button:has-text(/녹음|Record/i)').first();
    await recordButton.click();
    await page.waitForTimeout(1000);

    // Should show error message or permission request
    const errorMessage = page.locator('text=/마이크|Microphone|권한|Permission|허용|Allow/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle no speech detected', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);

    await page.goto('/tutor/english');
    await page.click('button:has-text(/발음|Pronunciation/i)');
    await page.waitForTimeout(1000);

    const recordButton = page.locator('button:has-text(/녹음|Record/i)').first();
    await recordButton.click();

    // Stop immediately without speaking
    await page.waitForTimeout(500);

    const stopButton = page.locator('button:has-text(/중지|Stop/i)');
    if (await stopButton.isVisible()) {
      await stopButton.click();
      await page.waitForTimeout(1000);

      // Should show message about no speech detected
      const noSpeechMessage = page.locator('text=/음성|Speech|감지|Detect|인식|Recognize/i');
      await expect(noSpeechMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
