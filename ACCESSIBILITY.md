# Accessibility Guide - AI Park

This document outlines the accessibility features implemented in AI Park and provides guidelines for maintaining and improving accessibility.

## Overview

AI Park is committed to providing an accessible learning experience for all users, including those with disabilities. We follow WCAG 2.1 Level AA guidelines.

## Implemented Accessibility Features

### 1. Keyboard Navigation

#### Global Navigation
- **Tab Navigation**: All interactive elements are keyboard accessible
- **Skip Links**: Skip to main content functionality
- **Focus Indicators**: Clear visual focus indicators on all interactive elements
- **Logical Tab Order**: Tab order follows visual layout

#### Keyboard Shortcuts
- `Tab`: Navigate forward
- `Shift + Tab`: Navigate backward
- `Enter`: Activate buttons and links
- `Space`: Toggle checkboxes and select options
- `Escape`: Close modals and dropdowns
- `Arrow Keys`: Navigate within menus and lists

### 2. Screen Reader Support

#### ARIA Labels
All interactive elements have appropriate ARIA labels:

```tsx
// Example: Button with aria-label
<button
  aria-label="로그아웃"
  onClick={handleLogout}
>
  <LogOut />
</button>

// Example: Navigation with aria-label
<nav aria-label="주요 메뉴">
  {/* navigation items */}
</nav>

// Example: Form input with aria-describedby
<input
  id="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
<div id="email-error" role="alert">{error}</div>
```

#### Semantic HTML
- Use of semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, `<section>`, etc.)
- Proper heading hierarchy (h1 → h2 → h3)
- Descriptive link text

#### Live Regions
```tsx
// Example: Alert for dynamic content
<div role="alert" aria-live="polite">
  프로필이 업데이트되었습니다.
</div>

// Example: Status updates
<div role="status" aria-live="polite">
  Loading...
</div>
```

### 3. Visual Accessibility

#### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio for normal text
- **Large Text**: Minimum 3:1 contrast ratio for large text (18pt+)
- **UI Components**: Minimum 3:1 contrast ratio for interactive elements

#### Color Independence
- Information is not conveyed by color alone
- Icons and text labels accompany color-coded information
- Error states include icons and text, not just red color

#### Text Sizing
- Base font size: 16px
- All text is resizable up to 200% without loss of functionality
- Relative units (rem, em) used for font sizes

#### Focus Indicators
```css
/* Clear focus indicators */
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

button:focus-visible {
  ring: 2px solid var(--primary-500);
  ring-offset: 2px;
}
```

### 4. Form Accessibility

#### Labels and Descriptions
```tsx
// Example: Accessible form field
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    이메일
    <span className="text-red-500" aria-label="필수">*</span>
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-hint email-error"
  />
  <p id="email-hint" className="text-sm text-gray-600">
    유효한 이메일 주소를 입력하세요
  </p>
  {error && (
    <p id="email-error" className="text-sm text-red-600" role="alert">
      {error}
    </p>
  )}
</div>
```

#### Error Handling
- Clear error messages
- Error messages associated with form fields using `aria-describedby`
- Error summary at top of form for multiple errors
- `aria-invalid` attribute on fields with errors

### 5. Loading States

#### Loading Indicators
```tsx
// Example: Accessible loading spinner
<div
  role="status"
  aria-label="Loading"
  className="animate-spin"
>
  <span className="sr-only">Loading...</span>
</div>

// Example: Progress indicator
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Upload progress"
>
  {progress}%
</div>
```

#### Skeleton Screens
- Skeleton screens provide visual loading feedback
- Screen readers announce loading state
- Content appears progressively as it loads

### 6. Modal Accessibility

#### Dialog Implementation
```tsx
// Example: Accessible modal
<dialog
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  aria-modal="true"
>
  <h2 id="dialog-title">확인</h2>
  <p id="dialog-description">정말로 삭제하시겠습니까?</p>
  <button onClick={handleConfirm}>확인</button>
  <button onClick={handleCancel}>취소</button>
</dialog>
```

#### Focus Management
- Focus trapped within modal when open
- Focus returns to trigger element when closed
- `Escape` key closes modal

### 7. Image Accessibility

#### Alt Text
```tsx
// Decorative images
<img src="/decoration.svg" alt="" role="presentation" />

// Informative images
<img src="/chart.png" alt="2024년 1월 학습 진행도 차트" />

// Complex images with long description
<img
  src="/diagram.png"
  alt="학습 프로세스 다이어그램"
  aria-describedby="diagram-description"
/>
<div id="diagram-description" className="sr-only">
  {/* Detailed description */}
</div>
```

### 8. Responsive Design

#### Mobile Accessibility
- Touch targets minimum 44x44 pixels
- Sufficient spacing between interactive elements
- Mobile-friendly navigation
- Responsive text sizing

#### Zoom and Magnification
- Layout works at 200% zoom
- No horizontal scrolling required
- Text reflows properly

## Testing Guidelines

### Automated Testing
- **axe DevTools**: Run automated accessibility checks
- **Lighthouse**: Test accessibility score (target: 90+)
- **WAVE**: Identify accessibility and WCAG errors

### Manual Testing

#### Keyboard Navigation Test
1. Navigate entire app using only keyboard
2. Verify all interactive elements are reachable
3. Check focus indicators are visible
4. Test keyboard shortcuts

#### Screen Reader Test
- **macOS**: VoiceOver
- **Windows**: NVDA or JAWS
- **Mobile**: TalkBack (Android) / VoiceOver (iOS)

Test checklist:
- [ ] All images have appropriate alt text
- [ ] Form fields have labels
- [ ] Error messages are announced
- [ ] Page title updates on navigation
- [ ] Live regions announce dynamic content
- [ ] Headings create logical structure

#### Color Contrast Test
- Use browser DevTools color picker
- Verify contrast ratios meet WCAG standards
- Test with color blindness simulators

#### Zoom Test
- Test at 200% browser zoom
- Verify layout remains functional
- Check text doesn't overlap

## Common Patterns

### Accessible Button
```tsx
<button
  type="button"
  aria-label="메뉴 열기"
  onClick={handleClick}
  className="focus:ring-2 focus:ring-primary-500"
>
  <Menu className="w-6 h-6" aria-hidden="true" />
</button>
```

### Accessible Link
```tsx
<Link
  href="/dashboard"
  className="focus:outline-none focus:ring-2 focus:ring-primary-500"
>
  대시보드로 이동
</Link>
```

### Accessible Form
```tsx
<form onSubmit={handleSubmit} aria-labelledby="form-title">
  <h2 id="form-title">로그인</h2>

  <div>
    <label htmlFor="email">이메일</label>
    <input
      id="email"
      type="email"
      aria-required="true"
      aria-invalid={emailError ? 'true' : 'false'}
      aria-describedby={emailError ? 'email-error' : undefined}
    />
    {emailError && (
      <p id="email-error" role="alert">{emailError}</p>
    )}
  </div>

  <button type="submit">로그인</button>
</form>
```

### Accessible Loading State
```tsx
{isLoading ? (
  <div role="status" aria-live="polite">
    <LoadingSpinner aria-label="로딩 중" />
    <span className="sr-only">데이터를 불러오는 중입니다...</span>
  </div>
) : (
  <Content />
)}
```

## Future Improvements

### Planned Features
- [ ] High contrast mode toggle
- [ ] Font size adjustment controls
- [ ] Reduced motion preference detection
- [ ] Voice control support
- [ ] Additional language support (English, etc.)

### Continuous Improvement
- Regular accessibility audits
- User testing with assistive technologies
- Stay updated with WCAG guidelines
- Collect user feedback on accessibility

## Resources

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Testing
- [WebAIM Screen Reader User Survey](https://webaim.org/projects/screenreadersurvey9/)
- [Assistive Technology Compatibility Tests](https://a11ysupport.io/)

## Contact

For accessibility concerns or suggestions, please contact:
- Email: accessibility@aipark.com
- GitHub Issues: [Report accessibility issue](https://github.com/aipark/issues)
