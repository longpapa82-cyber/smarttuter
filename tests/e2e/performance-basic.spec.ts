import { test, expect } from '@playwright/test';

/**
 * 기본 성능 테스트
 * Priority 1.5: Lighthouse 성능 테스트 (간소화 버전)
 *
 * Lighthouse CLI로 별도 실행 권장:
 * npx lighthouse http://localhost:3000 --view
 */

test.describe('기본 성능 메트릭', () => {

  test('Home - 로드 시간 3초 이내', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`✅ Home page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('Total Dashboard - 로드 시간 3초 이내', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`✅ Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('English Dashboard - 로드 시간 3초 이내', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard/english');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`✅ English Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('English Tutor - 로드 시간 4초 이내', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`✅ English Tutor load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(4000);
  });

  test('이미지 최적화 (Next.js Image)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Next.js Image 컴포넌트 사용 확인
    const images = page.locator('img');
    const imageCount = await images.count();

    let optimizedCount = 0;

    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');

      // Next.js 최적화 이미지는 /_next/image로 시작
      if (src?.startsWith('/_next/image') || src?.startsWith('data:image')) {
        optimizedCount++;
      }
    }

    console.log(`✅ Optimized images: ${optimizedCount}/${Math.min(imageCount, 10)}`);

    // 최소 30% 이상의 이미지가 최적화되어야 함
    if (imageCount > 0) {
      const optimizationRate = optimizedCount / Math.min(imageCount, 10);
      expect(optimizationRate).toBeGreaterThanOrEqual(0.3);
    }
  });

  test('콘솔 에러 없음', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 심각한 에러만 체크 (일부 경고는 허용)
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('manifest') &&
      !err.includes('DevTools') &&
      !err.includes('Failed to load resource')
    );

    console.log(`✅ Console errors found: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      console.log('⚠️  Errors:', criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
  });

  test('SEO 메타 태그', async ({ page }) => {
    await page.goto('/');

    // 필수 메타 태그 확인
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    console.log('✅ SEO Meta tags:');
    console.log(`   Title: ${title}`);
    console.log(`   Description: ${description?.substring(0, 80)}...`);
    console.log(`   Viewport: ${viewport}`);
  });
});

test.describe('접근성 기본 체크', () => {

  test('메인 랜드마크 존재', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('main');
    await expect(main).toBeVisible();

    console.log('✅ Main landmark found');
  });

  test('모든 이미지에 alt 속성', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    let withAlt = 0;

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      if (alt !== null) {
        withAlt++;
      }
    }

    console.log(`✅ Images with alt: ${withAlt}/${imageCount}`);

    // 최소 80% 이미지에 alt 속성
    if (imageCount > 0) {
      const altRate = withAlt / imageCount;
      expect(altRate).toBeGreaterThanOrEqual(0.8);
    }
  });
});
