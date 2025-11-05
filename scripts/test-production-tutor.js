/**
 * Playwright test script to diagnose production tutor issue
 * Tests the full flow: onboarding → skip auth → dashboard → tutor page
 */

const { chromium } = require('playwright');

async function testProductionTutor() {
  console.log('🚀 Starting production tutor flow test...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track all network requests
  const networkLogs = [];
  page.on('request', request => {
    networkLogs.push({
      type: 'request',
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
    });
  });

  page.on('response', async response => {
    networkLogs.push({
      type: 'response',
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
    });
  });

  // Track console logs
  page.on('console', msg => {
    console.log(`📝 Console [${msg.type()}]:`, msg.text());
  });

  // Track errors
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  try {
    // Step 1: Go to home page
    console.log('Step 1: Loading homepage...');
    await page.goto('https://smarttuter.vercel.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 2: Click start button to go to onboarding
    console.log('Step 2: Clicking start button...');
    const startButton = await page.locator('text=시작하기').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
    }

    // Step 3: Check if on onboarding page and skip auth
    console.log('Step 3: On onboarding page, skipping auth...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Look for skip button
    const skipButton = await page.locator('text=건너뛰기').or(page.locator('text=Skip')).first();
    if (await skipButton.isVisible()) {
      console.log('Found skip button, clicking...');

      // Check cookies BEFORE clicking skip
      const cookiesBefore = await context.cookies();
      console.log('🍪 Cookies BEFORE skip:', cookiesBefore.filter(c => c.name.includes('aipark')));

      await skipButton.click();
      await page.waitForTimeout(3000);

      // Check cookies AFTER clicking skip
      const cookiesAfter = await context.cookies();
      console.log('🍪 Cookies AFTER skip:', cookiesAfter.filter(c => c.name.includes('aipark')));
    } else {
      console.log('⚠️ Skip button not found, checking if already on dashboard...');
    }

    // Step 4: Should be on dashboard now
    console.log('Step 4: Checking dashboard access...');
    await page.waitForTimeout(2000);
    console.log('Current URL after skip:', page.url());

    // Check all cookies
    const allCookies = await context.cookies();
    console.log('🍪 All Cookies:', JSON.stringify(allCookies, null, 2));

    // Step 5: Navigate to Math Tutor
    console.log('Step 5: Navigating to Math Tutor...');
    await page.goto('https://smarttuter.vercel.app/tutor/math', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Check final URL (should be /tutor/math, not /login)
    const finalUrl = page.url();
    console.log('📍 Final URL:', finalUrl);

    if (finalUrl.includes('/login')) {
      console.error('❌ PROBLEM: Redirected to login page!');
      console.log('This means middleware is NOT accepting guest cookie');
    } else if (finalUrl.includes('/tutor/math')) {
      console.log('✅ SUCCESS: On tutor page!');

      // Check for welcome message
      await page.waitForTimeout(3000);
      const pageContent = await page.textContent('body');
      if (pageContent.includes('안녕') || pageContent.includes('Hello') || pageContent.includes('Hi')) {
        console.log('✅ Welcome message found!');
      } else {
        console.log('❌ No welcome message visible');
      }
    }

    // Step 6: Analyze network logs
    console.log('\n📊 Network Analysis:');
    const sessionRequests = networkLogs.filter(log => log.url.includes('/api/auth/session'));
    console.log(`/api/auth/session requests: ${sessionRequests.length}`);
    sessionRequests.forEach(log => {
      console.log(`  ${log.type}: ${log.status || log.method} ${log.url}`);
      if (log.status === 500) {
        console.error('  ❌ 500 ERROR on session endpoint!');
      }
    });

    const middlewareRedirects = networkLogs.filter(log =>
      log.type === 'response' && (log.status === 307 || log.status === 302)
    );
    console.log(`\nRedirects: ${middlewareRedirects.length}`);
    middlewareRedirects.forEach(log => {
      console.log(`  ${log.status} ${log.url} → ${log.headers.location || 'unknown'}`);
    });

    // Take screenshot
    await page.screenshot({ path: 'production-tutor-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: production-tutor-test.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
}

testProductionTutor().catch(console.error);
