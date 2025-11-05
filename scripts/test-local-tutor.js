/**
 * Playwright test script to verify local tutor flow with Redis
 */

const { chromium } = require('playwright');

async function testLocalTutor() {
  console.log('🚀 Starting local tutor flow test with Redis...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track console logs
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`📝 Console [${type}]:`, msg.text());
    }
  });

  // Track errors
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  try {
    // Step 1: Go to home page
    console.log('Step 1: Loading homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 2: Click start button
    console.log('Step 2: Clicking start button...');
    const startButton = await page.locator('text=시작하기').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
    }

    // Step 3: Skip auth (guest mode)
    console.log('Step 3: Skipping auth (guest mode)...');
    const skipButton = await page.locator('text=건너뛰기').or(page.locator('text=Skip')).first();
    if (await skipButton.isVisible()) {
      console.log('Found skip button, clicking...');

      // Check cookies BEFORE
      const cookiesBefore = await context.cookies();
      console.log('🍪 Cookies BEFORE skip:', cookiesBefore.filter(c => c.name.includes('aipark')));

      await skipButton.click();
      await page.waitForTimeout(3000);

      // Check cookies AFTER
      const cookiesAfter = await context.cookies();
      console.log('🍪 Cookies AFTER skip:', cookiesAfter.filter(c => c.name.includes('aipark')));
    }

    // Step 4: Navigate to Math Tutor
    console.log('Step 4: Navigating to Math Tutor...');
    await page.goto('http://localhost:3000/tutor/math', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Check final URL
    const finalUrl = page.url();
    console.log('📍 Final URL:', finalUrl);

    if (finalUrl.includes('/login')) {
      console.error('❌ FAIL: Redirected to login page!');
      console.log('This means middleware is blocking guest access');
    } else if (finalUrl.includes('/tutor/math')) {
      console.log('✅ SUCCESS: On tutor page!');

      // Check for welcome message
      await page.waitForTimeout(3000);
      const pageContent = await page.textContent('body');
      if (pageContent.includes('안녕') || pageContent.includes('Hello') || pageContent.includes('Hi')) {
        console.log('✅ Welcome message found!');
      } else {
        console.log('⚠️ No welcome message visible yet, checking chat interface...');

        // Check if chat messages exist
        const messages = await page.locator('[class*="message"]').count();
        console.log(`Found ${messages} messages in chat`);
      }

      // Test user input
      console.log('\nStep 5: Testing user input...');
      const textarea = await page.locator('textarea').first();
      if (await textarea.isVisible()) {
        await textarea.fill('3*6');
        await textarea.press('Enter');
        console.log('✅ Sent message: 3*6');

        await page.waitForTimeout(5000);
        console.log('Waiting for tutor response...');
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'local-tutor-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: local-tutor-test.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
}

testLocalTutor().catch(console.error);
