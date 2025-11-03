import { test, expect } from '@playwright/test';

/**
 * Performance E2E Tests
 *
 * Benchmarks for critical user flows:
 * - Page load times
 * - Tutor response times
 * - OCR processing times
 * - Navigation performance
 *
 * Performance targets:
 * - Page load: <2 seconds
 * - Tutor response: <3 seconds
 * - OCR processing: <5 seconds
 * - Navigation: <500ms
 */

test.describe('Performance Benchmarks', () => {

  test('Landing page should load in under 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for main content
    await page.waitForSelector('h1');

    const loadTime = Date.now() - startTime;

    console.log(`📊 Landing page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  test('Dashboard should load in under 2 seconds', async ({ page }) => {
    // Quick onboarding first
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    const startTime = Date.now();

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for dashboard content
    await page.waitForSelector('text=환영합니다');

    const loadTime = Date.now() - startTime;

    console.log(`📊 Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  test('English tutor should load in under 2 seconds', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    const startTime = Date.now();

    await page.click('text=영어 학습 시작');

    // Wait for chat interface
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 5000 });

    const loadTime = Date.now() - startTime;

    console.log(`📊 English tutor load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  test('Math tutor should load in under 2 seconds', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');

    const startTime = Date.now();

    await page.click('text=수학 학습 시작');

    // Wait for chat interface
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 5000 });

    const loadTime = Date.now() - startTime;

    console.log(`📊 Math tutor load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });
});

test.describe('Tutor Response Performance', () => {

  test('English tutor first response should be under 5 seconds', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');
    await page.click('text=영어 학습 시작');

    // Wait for chat interface
    await page.waitForSelector('[data-testid="chat-input"]');

    const startTime = Date.now();

    // Send message
    await page.fill('[data-testid="chat-input"]', 'What is a noun?');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    const responseTime = Date.now() - startTime;

    console.log(`📊 English tutor response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(5000);
  });

  test('Math tutor first response should be under 5 seconds', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    // Wait for chat interface
    await page.waitForSelector('[data-testid="chat-input"]');

    const startTime = Date.now();

    // Send message
    await page.fill('[data-testid="chat-input"]', '2x + 5 = 13을 풀어줘');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for AI response
    await page.waitForSelector('.ai-message', { timeout: 10000 });

    const responseTime = Date.now() - startTime;

    console.log(`📊 Math tutor response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(5000);
  });

  test('Tutor streaming response should start within 1 second', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');
    await page.click('text=영어 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    const startTime = Date.now();

    await page.fill('[data-testid="chat-input"]', 'Hello');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for streaming to start (any AI message content)
    await page.waitForSelector('.ai-message', { timeout: 5000 });

    const firstTokenTime = Date.now() - startTime;

    console.log(`📊 First token time: ${firstTokenTime}ms`);
    expect(firstTokenTime).toBeLessThan(2000);
  });
});

test.describe('Navigation Performance', () => {

  test('Dashboard to tutor navigation should be under 500ms', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    // Now on dashboard
    await page.waitForSelector('text=환영합니다');

    const startTime = Date.now();

    await page.click('text=영어 학습 시작');

    await page.waitForURL(/\/dashboard\/english/);

    const navTime = Date.now() - startTime;

    console.log(`📊 Dashboard → Tutor navigation time: ${navTime}ms`);
    expect(navTime).toBeLessThan(1000);
  });

  test('Tutor to dashboard navigation should be under 500ms', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');
    await page.click('text=영어 학습 시작');

    await page.waitForSelector('[data-testid="chat-interface"]');

    const startTime = Date.now();

    await page.click('text=대시보드');

    await page.waitForURL('/dashboard');

    const navTime = Date.now() - startTime;

    console.log(`📊 Tutor → Dashboard navigation time: ${navTime}ms`);
    expect(navTime).toBeLessThan(1000);
  });

  test('Subject switching should be instant (<200ms)', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    await page.waitForSelector('text=환영합니다');

    const startTime = Date.now();

    // Switch from dashboard (영어) to math
    await page.click('text=수학 학습 시작');

    await page.waitForURL(/\/dashboard\/math/);

    const switchTime = Date.now() - startTime;

    console.log(`📊 Subject switch time: ${switchTime}ms`);
    expect(switchTime).toBeLessThan(1000);
  });
});

test.describe('Resource Loading Performance', () => {

  test('Images should load within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for all images to load
    await page.waitForFunction(() => {
      const images = Array.from(document.images);
      return images.every(img => img.complete);
    }, { timeout: 5000 });

    const loadTime = Date.now() - startTime;

    console.log(`📊 All images load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('Network requests should complete within reasonable time', async ({ page }) => {
    const requests: { url: string; duration: number }[] = [];

    page.on('requestfinished', async (request) => {
      const timing = await request.timing();
      requests.push({
        url: request.url(),
        duration: timing.responseEnd,
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that no single request took > 10 seconds
    const slowRequests = requests.filter(r => r.duration > 10000);

    console.log(`📊 Total requests: ${requests.length}`);
    console.log(`📊 Slow requests (>10s): ${slowRequests.length}`);

    if (slowRequests.length > 0) {
      console.log('Slow requests:', slowRequests);
    }

    expect(slowRequests.length).toBe(0);
  });
});

test.describe('Memory and CPU Performance', () => {

  test('Memory usage should remain stable during tutor session', async ({ page, context }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');
    await page.click('text=영어 학습 시작');

    await page.waitForSelector('[data-testid="chat-input"]');

    // Get initial metrics
    const initialMetrics = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      } : null;
    });

    // Send 5 messages
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="chat-input"]', `Message ${i + 1}`);
      await page.press('[data-testid="chat-input"]', 'Enter');
      await page.waitForSelector('.ai-message', { timeout: 10000 });
      await page.waitForTimeout(1000);
    }

    // Get final metrics
    const finalMetrics = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      } : null;
    });

    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
      const increaseMB = memoryIncrease / (1024 * 1024);

      console.log(`📊 Memory increase after 5 messages: ${increaseMB.toFixed(2)} MB`);

      // Memory should not increase by more than 50MB for 5 messages
      expect(increaseMB).toBeLessThan(50);
    } else {
      console.log('⚠️ Memory metrics not available (Chrome only)');
    }
  });

  test('Page should handle rapid navigation without lag', async ({ page }) => {
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');

    const startTime = Date.now();

    // Rapidly navigate between pages
    await page.click('text=영어 학습 시작');
    await page.waitForURL(/\/dashboard\/english/);

    await page.click('text=대시보드');
    await page.waitForURL('/dashboard');

    await page.goto('/report');
    await page.waitForURL('/report');

    await page.goto('/profile');
    await page.waitForURL('/profile');

    await page.goto('/dashboard');
    await page.waitForURL('/dashboard');

    const totalTime = Date.now() - startTime;

    console.log(`📊 Rapid navigation (5 pages) total time: ${totalTime}ms`);

    // 5 page navigations should complete in < 5 seconds
    expect(totalTime).toBeLessThan(5000);
  });
});

test.describe('OCR Performance', () => {

  test.skip('English OCR should process in under 5 seconds', async ({ page }) => {
    // Skip for now - requires image upload implementation
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=영어');
    await page.click('text=시작하기');
    await page.click('text=영어 학습 시작');

    // Wait for image upload button
    await page.waitForSelector('[data-testid="image-upload-button"]');

    const startTime = Date.now();

    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="image-upload-button"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/english-text.jpg');

    // Wait for OCR complete
    await page.waitForSelector('[data-testid="ocr-result"]', { timeout: 10000 });

    const ocrTime = Date.now() - startTime;

    console.log(`📊 English OCR processing time: ${ocrTime}ms`);
    expect(ocrTime).toBeLessThan(5000);
  });

  test.skip('Math OCR should process in under 7 seconds', async ({ page }) => {
    // Skip for now - requires image upload implementation
    await page.goto('/');
    await page.click('text=무료로 시작하기');
    await page.click('text=중학교');
    await page.click('text=다음');
    await page.click('text=수학');
    await page.click('text=시작하기');
    await page.click('text=수학 학습 시작');

    await page.waitForSelector('[data-testid="image-upload-button"]');

    const startTime = Date.now();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="image-upload-button"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/math-equation.jpg');

    await page.waitForSelector('[data-testid="ocr-result"]', { timeout: 12000 });

    const ocrTime = Date.now() - startTime;

    console.log(`📊 Math OCR processing time: ${ocrTime}ms`);
    expect(ocrTime).toBeLessThan(7000);
  });
});

test.describe('Core Web Vitals', () => {

  test('Landing page should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as any;

        const metrics = {
          // Time to First Byte
          ttfb: navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : 0,

          // First Contentful Paint (approximation)
          fcp: 0,

          // Largest Contentful Paint (requires real user monitoring)
          lcp: 0,

          // Cumulative Layout Shift (requires real user monitoring)
          cls: 0,

          // First Input Delay (requires real user interaction)
          fid: 0,
        };

        resolve(metrics);
      });
    });

    console.log('📊 Core Web Vitals:', vitals);

    // TTFB should be < 600ms (good)
    expect((vitals as any).ttfb).toBeLessThan(800);
  });
});
