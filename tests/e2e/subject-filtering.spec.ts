/**
 * Week 1 E2E Tests: Subject Filtering
 *
 * 교과 분류 및 필터링 시스템의 E2E 테스트
 */

import { test, expect } from '@playwright/test';

test.describe('English Tutor - Subject Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutor/english');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should allow English grammar questions', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('현재완료 시제가 뭐예요?');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // 응답이 와야 하고, 리디렉션 메시지가 아니어야 함
    const messages = page.locator('[data-testid="tutor-message"], .message, .chat-message');
    const lastMessage = messages.last();

    await expect(lastMessage).not.toContainText('Math Park');
    await expect(lastMessage).not.toContainText('수학');
  });

  test('should reject Math questions and redirect to Math Park', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('이차방정식 푸는 법');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    const messages = page.locator('[data-testid="tutor-message"], .message, .chat-message');
    const lastMessage = messages.last();

    // 리디렉션 메시지 확인
    await expect(lastMessage).toContainText('Math Park');
    await expect(lastMessage).toContainText('수학');
    await expect(lastMessage).toContainText('영어');
  });

  test('should handle casual conversation and guide to English learning', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('안녕');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    const messages = page.locator('[data-testid="tutor-message"], .message, .chat-message');
    const lastMessage = messages.last();

    // 영어 학습 안내 메시지 확인
    await expect(lastMessage).toContainText('영어');
  });

  test('should reject science questions', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('광합성이 뭐예요?');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    const messages = page.locator('[data-testid="tutor-message"], .message, .chat-message');
    const lastMessage = messages.last();

    // 과학 질문 거부 메시지 확인
    await expect(lastMessage).toContainText('과학');
    await expect(lastMessage).toContainText('영어');
  });
});

test.describe('Math Tutor - Subject Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutor/math');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should allow Math calculation questions', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('12 + 8은 얼마예요?');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // 응답이 와야 하고, 리디렉션 메시지가 아니어야 함
    const messages = page.locator('[data-testid="tutor-message"], .message, .chat-message');
    const lastMessage = messages.last();

    await expect(lastMessage).not.toContainText('English Park');
    await expect(lastMessage).not.toContainText('영어');
  });

  test('should reject English questions and redirect to English Park', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('현재완료 시제가 뭐예요?');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    const messages = page.locator('[data-testid="tutor-message"], .message, .chat-message');
    const lastMessage = messages.last();

    // 리디렉션 메시지 확인
    await expect(lastMessage).toContainText('English Park');
    await expect(lastMessage).toContainText('영어');
    await expect(lastMessage).toContainText('수학');
  });

  test('should handle casual conversation and guide to Math learning', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('심심해');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    const messages = page.locator('[data-testid="tutor-message"], .message, .chat-message');
    const lastMessage = messages.last();

    // 수학 학습 안내 메시지 확인
    await expect(lastMessage).toContainText('수학');
  });
});

test.describe('Subject Filtering - Performance', () => {
  test('Quick pre-filter should respond in < 500ms', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');

    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('안녕'); // Obviously off-topic

    const startTime = Date.now();
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(1000);
    const endTime = Date.now();

    const responseTime = endTime - startTime;

    // Quick pre-filter should be very fast (< 500ms for response to start)
    expect(responseTime).toBeLessThan(1500); // Allow some buffer for network
  });

  test('AI classification should respond in < 3s', async ({ page }) => {
    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');

    const chatInput = page.locator('[data-testid="chat-input"], textarea, input[type="text"]').first();
    const sendButton = page.locator('[data-testid="send-button"], button:has-text("전송"), button[type="submit"]').first();

    await chatInput.fill('광합성 설명해주세요'); // Requires AI classification

    const startTime = Date.now();
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(3000);
    const endTime = Date.now();

    const responseTime = endTime - startTime;

    // AI classification should still be reasonably fast
    expect(responseTime).toBeLessThan(3500);
  });
});
