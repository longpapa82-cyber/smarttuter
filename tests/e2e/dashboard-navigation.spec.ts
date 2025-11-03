import { test, expect } from '@playwright/test';

test.describe('Phase 14 Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // 온보딩 완료 상태 시뮬레이션 (localStorage 설정)
    await page.goto('/');

    // Set onboarding completion and user profile in localStorage
    await page.evaluate(() => {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('user_profile', JSON.stringify({
        username: '테스트유저',
        avatar: 'T',
        schoolLevel: 'middle-school',
        gradeLevel: '중2',
        preferredSubjects: ['english']
      }));
    });

    // 대시보드로 직접 이동
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('GNB - 영어 튜터 1-click 접근', async ({ page }) => {
    // GNB에서 영어 튜터 버튼 확인
    const englishButton = page.locator('nav a:has-text("영어 튜터")');
    await expect(englishButton).toBeVisible();

    // 클릭하여 영어 튜터로 이동
    await englishButton.click();
    await page.waitForURL('/tutor/english');

    // 영어 튜터 페이지 로드 확인
    await expect(page.locator('text=English Tutor')).toBeVisible({ timeout: 10000 });
  });

  test('GNB - 수학 튜터 1-click 접근', async ({ page }) => {
    // GNB에서 수학 튜터 버튼 확인
    const mathButton = page.locator('nav a:has-text("수학 튜터")');
    await expect(mathButton).toBeVisible();

    // 클릭하여 수학 튜터로 이동
    await mathButton.click();
    await page.waitForURL('/tutor/math');

    // 수학 튜터 페이지 로드 확인
    await expect(page.locator('text=Math Tutor')).toBeVisible({ timeout: 10000 });
  });

  test('GNB - 대시보드 드롭다운', async ({ page }) => {
    // 대시보드 드롭다운 버튼 클릭
    const dashboardDropdown = page.locator('nav button:has-text("대시보드")');
    await dashboardDropdown.click();

    // 드롭다운 메뉴 항목 확인
    await expect(page.locator('text=전체 대시보드')).toBeVisible();
    await expect(page.locator('text=영어 대시보드')).toBeVisible();
    await expect(page.locator('text=수학 대시보드')).toBeVisible();

    // 영어 대시보드로 이동
    await page.click('text=영어 대시보드');
    await page.waitForURL('/dashboard/english');
    await expect(page.locator('h1:has-text("영어 학습 허브")')).toBeVisible();
  });

  test('메인 대시보드 - 영어/수학 요약 카드', async ({ page }) => {
    // 영어 요약 카드 확인
    const englishCard = page.locator('text=영어 학습').first();
    await expect(englishCard).toBeVisible();
    await expect(page.locator('text=CEFR Level')).toBeVisible();
    await expect(page.locator('text=Listening')).toBeVisible();

    // 수학 요약 카드 확인
    const mathCard = page.locator('text=수학 학습').first();
    await expect(mathCard).toBeVisible();
    await expect(page.locator('text=Grade Level')).toBeVisible();
    await expect(page.locator('text=완료한 단원')).toBeVisible();

    // 영어 카드 클릭하여 영어 대시보드로 이동
    await englishCard.click();
    await page.waitForURL('/dashboard/english');
  });

  test('메인 대시보드 - 빠른 시작 섹션', async ({ page }) => {
    // 빠른 시작 섹션 확인
    await expect(page.locator('h2:has-text("빠른 시작")')).toBeVisible();

    // 영어 튜터 계속하기 버튼
    const continueEnglish = page.locator('text=영어 튜터 계속하기');
    await expect(continueEnglish).toBeVisible();
    await expect(page.locator('text=마지막 주제')).toBeVisible();

    // 수학 튜터 계속하기 버튼
    const continueMath = page.locator('text=수학 튜터 계속하기');
    await expect(continueMath).toBeVisible();

    // 영어 튜터로 이동
    await continueEnglish.click();
    await page.waitForURL('/tutor/english');
  });

  test('메인 대시보드 - 보조 학습 활동', async ({ page }) => {
    // 보조 학습 활동 섹션 스크롤
    await page.locator('h2:has-text("보조 학습 활동")').scrollIntoViewIfNeeded();

    // 6개 활동 카드 확인
    await expect(page.locator('text=마이크로러닝')).toBeVisible();
    await expect(page.locator('text=AI 퀴즈')).toBeVisible();
    await expect(page.locator('text=플래시카드')).toBeVisible();
    await expect(page.locator('text=간격 반복')).toBeVisible();
    await expect(page.locator('text=발음 연습')).toBeVisible();
    await expect(page.locator('text=수학 시각화')).toBeVisible();

    // Phase 10 뱃지 확인
    const phase10Badges = page.locator('text=Phase 10');
    await expect(phase10Badges).toHaveCount(2); // 발음 연습, 수학 시각화
  });

  test('메인 대시보드 - 학습 분석 및 리포트', async ({ page }) => {
    // 분석 리포트 섹션 스크롤
    await page.locator('h2:has-text("학습 분석 및 리포트")').scrollIntoViewIfNeeded();

    // 3개 리포트 카드 확인
    await expect(page.locator('text=학습 리포트')).toBeVisible();
    await expect(page.locator('text=학습 분석')).toBeVisible();
    await expect(page.locator('text=감정 분석')).toBeVisible();

    // Phase 뱃지 확인
    await expect(page.locator('text=Phase 8.5')).toBeVisible();
    await expect(page.locator('text=Phase 8')).toBeVisible();
    await expect(page.locator('text=Phase 12')).toBeVisible();
  });

  test('영어 대시보드 - 전체 레이아웃', async ({ page }) => {
    await page.goto('/dashboard/english');
    await page.waitForLoadState('networkidle');

    // 헤더 확인
    await expect(page.locator('h1:has-text("영어 학습 허브")')).toBeVisible();

    // 메인 CTA 확인
    const mainCTA = page.locator('text=영어 튜터 계속하기').first();
    await expect(mainCTA).toBeVisible();

    // 진행도 섹션 확인
    await expect(page.locator('text=영어 학습 진행도')).toBeVisible();
    await expect(page.locator('text=이번 주 학습 시간')).toBeVisible();

    // 마스터리 섹션 확인
    await expect(page.locator('text=영어 마스터리')).toBeVisible();
    await expect(page.locator('text=Listening')).toBeVisible();
    await expect(page.locator('text=Speaking')).toBeVisible();
    await expect(page.locator('text=Reading')).toBeVisible();
    await expect(page.locator('text=Writing')).toBeVisible();

    // 보조 학습 섹션 확인
    await page.locator('text=보조 학습 (영어)').scrollIntoViewIfNeeded();
    await expect(page.locator('text=발음 연습').first()).toBeVisible();
    await expect(page.locator('text=단어장')).toBeVisible();
    await expect(page.locator('text=문법 퀴즈')).toBeVisible();
    await expect(page.locator('text=작문 연습')).toBeVisible();
  });

  test('수학 대시보드 - 전체 레이아웃', async ({ page }) => {
    await page.goto('/dashboard/math');
    await page.waitForLoadState('networkidle');

    // 헤더 확인
    await expect(page.locator('h1:has-text("수학 학습 허브")')).toBeVisible();

    // 메인 CTA 확인
    const mainCTA = page.locator('text=수학 튜터 계속하기').first();
    await expect(mainCTA).toBeVisible();

    // 진행도 섹션 확인
    await expect(page.locator('text=수학 학습 진행도')).toBeVisible();
    await expect(page.locator('text=단원별 진행 상황')).toBeVisible();

    // 단원 목록 확인
    await expect(page.locator('text=일차방정식')).toBeVisible();
    await expect(page.locator('text=일차함수')).toBeVisible();
    await expect(page.locator('text=이차방정식')).toBeVisible();

    // 보조 학습 섹션 확인
    await page.locator('text=보조 학습 (수학)').scrollIntoViewIfNeeded();
    await expect(page.locator('text=그래프 시각화')).toBeVisible();
    await expect(page.locator('text=문제 풀이')).toBeVisible();
    await expect(page.locator('text=공식 플래시카드')).toBeVisible();
    await expect(page.locator('text=응용 문제')).toBeVisible();
  });

  test('모바일 - 햄버거 메뉴', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 햄버거 메뉴 버튼 확인
    const hamburgerButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(hamburgerButton).toBeVisible();

    // 햄버거 메뉴 클릭
    await hamburgerButton.click();

    // 모바일 사이드바 확인
    await expect(page.locator('text=영어 튜터')).toBeVisible();
    await expect(page.locator('text=수학 튜터')).toBeVisible();
    await expect(page.locator('text=전체 대시보드')).toBeVisible();
  });

  test('애니메이션 - 카운터 작동', async ({ page }) => {
    // 영어 요약 카드의 학습 시간 카운터 확인
    const timeCounter = page.locator('text=12시간').first();

    // 카운터가 표시될 때까지 대기 (애니메이션 완료)
    await expect(timeCounter).toBeVisible({ timeout: 3000 });

    // 숫자가 표시되는지 확인
    const counterText = await timeCounter.textContent();
    expect(counterText).toContain('12');
  });

  test('반응형 - 데스크톱에서 태블릿으로', async ({ page }) => {
    // 데스크톱 뷰
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    // 영어/수학 요약 카드가 2-column으로 표시되는지 확인
    const cards = page.locator('text=영어 학습, text=수학 학습');
    await expect(cards.first()).toBeVisible();

    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // 레이아웃 재조정 대기

    // 카드가 여전히 표시되는지 확인
    await expect(cards.first()).toBeVisible();
  });
});
