# E2E Test Debugging Session - 2025-11-01

## Session Summary

Investigated E2E test failures in the onboarding flow. Identified root causes and implemented partial fixes.

## Initial Problem

E2E tests for onboarding flow failing with timeout errors:
- 17 failed tests, 1 passed
- Tests couldn't find expected elements ("학교급을 선택해주세요")
- All tests timing out or showing wrong page content

## Investigation Process

### 1. Authentication Bypass Verification

**Hypothesis**: Middleware blocking E2E tests despite bypass headers

**Testing**:
- Added logging to middleware.ts (lines 16-25)
- Confirmed bypass IS working correctly
- Logs show: `[Middleware] Bypassing auth for E2E test`

**Conclusion**: ✅ Authentication bypass working correctly

### 2. Page Content Analysis

**Hypothesis**: `/onboarding` redirecting to home page

**Testing**:
```bash
# Server logs showed
GET /onboarding 200 in 2508ms  # Success, not redirected

# Debug test showed
H1 text: SmartTutor에오신 것을 환영합니다!  # This is the Welcome page
Body contains "학교급": true  # Grade level text exists somewhere
```

**Findings**:
- `/onboarding` route works correctly
- Page renders the WelcomeStep component (Step 0)
- Tests expect GradeLevelStep (Step 2) immediately
- No redirect happening - tests had wrong expectations

**Conclusion**: ✅ Onboarding page rendering correctly, tests need updating

### 3. Onboarding Flow Structure

**Actual Flow** ([app/onboarding/page.tsx](../app/onboarding/page.tsx)):
```
Step 0: WelcomeStep ("SmartTutor에 오신 것을 환영합니다!")
  ↓ Click "시작하기 →"
Step 1: ExperienceStep (optional, can skip)
  ↓ Skip or Continue
Step 2: GradeLevelStep ("학교급을 선택해주세요")
  ↓ Select grade
Step 3: SubjectStep ("과목을 선택해주세요")
  ↓ Select subject
Step 4: NicknameStep
  ↓ Enter nickname
Step 5: AuthStep
  ↓ Complete
→ Redirect to /dashboard
```

**Test Expectations** (incorrect):
```
Visit /onboarding
  ↓ EXPECTED Step 2 immediately
Fail: "학교급을 선택해주세요" not visible
```

**Conclusion**: ⚠️ Tests skipped Steps 0-1, need to navigate through welcome flow

### 4. Page Transition Issue

**Hypothesis**: After clicking "시작하기", page should advance to Step 1

**Testing**:
```javascript
// Debug test results
=== STEP 0: Initial Page ===
H1: SmartTutor에오신 것을 환영합니다!
Start button visible: true

=== Clicking 시작하기 button ===
After click - URL: http://localhost:3000/onboarding
// TIMEOUT: Waiting for H1 element (30s exceeded)
```

**Findings**:
- Button click happens successfully
- URL doesn't change (correct - client-side state)
- Page hangs after click
- Cannot retrieve H1 text (element not found or page frozen)

**Possible Causes**:
1. Framer Motion `AnimatePresence` transition delay/hang
2. `useEffect` infinite loop in onboarding state management
3. Client-side routing/state issue
4. React hydration mismatch

**Conclusion**: ❌ Page hang after first button click - needs component-level debugging

## Changes Made

### 1. Middleware Logging (Temporary)

[middleware.ts](../middleware.ts:16-25):
```typescript
// Debug logging
console.log('[Middleware]', {
  pathname,
  bypassAuth,
  isE2ETest,
  headers: {
    'x-e2e-test': request.headers.get('x-e2e-test'),
    'user-agent': request.headers.get('user-agent')?.substring(0, 50),
  }
});

if (bypassAuth || isE2ETest) {
  console.log('[Middleware] Bypassing auth for E2E test');
  return NextResponse.next()
}
```

**Purpose**: Verify bypass headers reaching middleware
**Status**: ✅ Confirmed working, can be removed

### 2. Test Updates

[tests/e2e/onboarding.spec.ts](../tests/e2e/onboarding.spec.ts):

Added welcome screen navigation to all tests:
```typescript
// Navigate past welcome screen
await page.click('button:has-text("시작하기")');
await page.waitForTimeout(500);

// Skip Experience step if present
const skipButton = page.locator('button:has-text("Skip"), button:has-text("건너뛰기")');
if (await skipButton.isVisible()) {
  await skipButton.click();
  await page.waitForTimeout(500);
}

// Now at Step 2 (Grade Level Selection)
await expect(page.locator('text=학교급을 선택해주세요')).toBeVisible();
```

**Purpose**: Match actual onboarding flow
**Status**: ⚠️ Implemented but blocked by page hang issue

### 3. Debug Test Created

[tests/e2e/debug-onboarding.spec.ts](../tests/e2e/debug-onboarding.spec.ts):

Comprehensive logging test to trace page state through flow:
- Logs URL at each step
- Checks button visibility
- Takes screenshots
- Lists visible elements

**Purpose**: Diagnose transition issues
**Status**: ✅ Identified page hang after first click

## Current Status

### ✅ Working
- [x] Middleware authentication bypass (confirmed via logs)
- [x] `/onboarding` route rendering (200 status)
- [x] WelcomeStep component displaying correctly
- [x] Test infrastructure updated (header bypass, navigation flow)

### ❌ Broken
- [ ] Page transition after clicking "시작하기" (timeout/hang)
- [ ] E2E tests passing (5 failed, 1 passed)
- [ ] Onboarding flow progression

### ⏳ Next Steps Required

#### Immediate (Fix page hang)
1. **Investigate Onboarding Component**
   - Check [components/onboarding/WelcomeStep.tsx](../components/onboarding/WelcomeStep.tsx)
   - Verify `onNext` callback implementation
   - Review Framer Motion `AnimatePresence` configuration
   - Check for `useEffect` infinite loops

2. **Test Button Handler**
   ```typescript
   // In onboarding/page.tsx:50
   const handleWelcome = () => {
     handleNextStep(); // Does this update state correctly?
   };
   ```

3. **Check State Management**
   ```typescript
   // onboarding/page.tsx:39-41
   const handleNextStep = () => {
     advanceOnboardingStep();  // localStorage update
     setCurrentStep((prev) => Math.min(prev + 1, 5));  // React state
   };
   ```
   - Verify `advanceOnboardingStep()` doesn't cause re-render loop
   - Check if state update triggers properly

#### Short-term (After fix)
4. **Remove Temporary Code**
   - Remove middleware console.log statements
   - Delete debug-onboarding.spec.ts
   - Clean up test-results screenshots

5. **Verify All Tests Pass**
   ```bash
   npm run test:e2e
   ```

6. **Increase Test Timeouts** (if still needed)
   - playwright.config.ts timeout: 30000 → 60000ms
   - Individual test timeouts if specific steps are slow

## Test Results

### Before Fixes
```
Running 6 tests using 5 workers
❌ 17 failed, 1 passed
Error: expect(locator).toBeVisible() failed
Locator: locator('text=학교급을 선택해주세요')
Expected: visible
Timeout: 5000ms
```

### After Partial Fixes
```
Running 6 tests using 5 workers
❌ 5 failed, 1 passed
Error: Test timeout of 30000ms exceeded
After clicking 시작하기, page hangs
```

### Target (After Complete Fix)
```
Running 6 tests using 5 workers
✅ 6 passed
```

## Root Cause Analysis

### Why Tests Failed Initially

**Misconception**: Tests assumed `/onboarding` would show grade level selection immediately

**Reality**: Onboarding has a multi-step flow starting with Welcome screen

**Why This Happened**: Tests likely written before onboarding flow was expanded, or written against outdated flow

### Why Tests Still Fail

**Page Hang**: After clicking "시작하기", page becomes unresponsive
- Cannot read H1 text (timeout)
- Cannot proceed to next step
- URL doesn't change (expected)
- No error messages in console

**Likely Cause**: Framer Motion `AnimatePresence` or state management issue in onboarding component

## Recommendations

### For Development
1. **Add Error Boundaries** to onboarding flow for better debugging
2. **Add console logging** in handleWelcome/handleNextStep
3. **Test animations** with reduced motion for faster E2E tests
4. **Simplify transitions** if Framer Motion causing issues

### For Testing
1. **Wait Strategies**: Use `waitForSelector` instead of `waitForTimeout`
2. **Increase Timeouts**: If animations are genuinely slow
3. **Add Retry Logic**: For flaky animation-dependent tests
4. **Screenshot on Failure**: Already implemented ✅

### For Deployment
1. **Fix page hang** before deploying - critical UX issue
2. **Remove debug logging** from middleware
3. **Verify flow works** in production build:
   ```bash
   npm run build
   npm start
   # Manually test /onboarding flow
   ```

## Files Modified

1. [middleware.ts](../middleware.ts) - Added temporary debug logging
2. [tests/e2e/onboarding.spec.ts](../tests/e2e/onboarding.spec.ts) - Updated all tests
3. [tests/e2e/debug-onboarding.spec.ts](../tests/e2e/debug-onboarding.spec.ts) - Created debug test

## Cleanup Checklist

Before completing this work:
- [ ] Fix page hang in onboarding component
- [ ] Remove middleware console.log statements
- [ ] Delete debug-onboarding.spec.ts
- [ ] Verify all 6 tests pass
- [ ] Remove test-results screenshots from git (if tracked)

---

**Session Date**: 2025-11-01
**Duration**: ~2 hours
**Status**: Debugging incomplete - page transition issue remains
**Next Owner**: Needs component-level debugging of WelcomeStep/onboarding page

🤖 Generated with [Claude Code](https://claude.com/claude-code)
