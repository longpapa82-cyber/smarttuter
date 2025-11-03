import { test, expect } from '@playwright/test';

test.describe('로그아웃 디버깅', () => {
  test('로그아웃 버튼 클릭 후 동작 확인', async ({ page }) => {
    // 콘솔 로그 수집
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // 네트워크 요청 모니터링
    const networkRequests: string[] = [];
    page.on('request', request => {
      networkRequests.push(`${request.method()} ${request.url()}`);
    });

    // 1. 로그인 상태로 시작
    await page.goto('http://localhost:3001/login');

    // 로그인 폼 작성
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 로그인 완료 대기
    await page.waitForURL(/dashboard|onboarding/, { timeout: 10000 });

    console.log('✅ 로그인 성공');

    // 대시보드로 이동
    if (!page.url().includes('dashboard')) {
      await page.goto('http://localhost:3001/dashboard');
      await page.waitForLoadState('networkidle');
    }

    console.log('✅ 대시보드 접속');

    // 2. 프로필 드롭다운 찾기
    const profileButton = page.locator('button').filter({
      has: page.locator('svg.lucide-chevron-down')
    }).first();

    await expect(profileButton).toBeVisible();
    console.log('✅ 프로필 버튼 발견');

    // 3. 프로필 드롭다운 열기
    await profileButton.click();
    await page.waitForTimeout(500); // 드롭다운 애니메이션 대기

    console.log('✅ 프로필 드롭다운 열림');

    // 4. 로그아웃 버튼 찾기
    const logoutButton = page.locator('button', {
      has: page.locator('text=로그아웃')
    });

    await expect(logoutButton).toBeVisible();
    console.log('✅ 로그아웃 버튼 발견');

    // 로그아웃 버튼 HTML 확인
    const buttonHTML = await logoutButton.innerHTML();
    console.log('로그아웃 버튼 HTML:', buttonHTML);

    // 5. 현재 URL 저장
    const urlBeforeLogout = page.url();
    console.log('로그아웃 전 URL:', urlBeforeLogout);

    // 6. 로그아웃 버튼 클릭
    console.log('🔄 로그아웃 버튼 클릭 중...');
    await logoutButton.click();

    // 7. 로그아웃 후 변화 관찰 (5초 대기)
    await page.waitForTimeout(5000);

    const urlAfterLogout = page.url();
    console.log('로그아웃 후 URL:', urlAfterLogout);

    // 8. 세션 확인
    const sessionResponse = await page.goto('http://localhost:3001/api/auth/session');
    const sessionData = await sessionResponse?.json();
    console.log('세션 상태:', sessionData);

    // 9. 결과 출력
    console.log('\n=== 네트워크 요청 (로그아웃 관련) ===');
    networkRequests
      .filter(req => req.includes('signout') || req.includes('session'))
      .forEach(req => console.log(req));

    console.log('\n=== 콘솔 로그 ===');
    consoleMessages.forEach(msg => console.log(msg));

    // 10. 검증
    console.log('\n=== 검증 결과 ===');
    console.log('URL 변경됨?', urlBeforeLogout !== urlAfterLogout);
    console.log('홈페이지로 리다이렉트됨?', urlAfterLogout.includes('localhost:3001/') && !urlAfterLogout.includes('dashboard'));
    console.log('세션 해제됨?', !sessionData || Object.keys(sessionData).length === 0);
  });
});
