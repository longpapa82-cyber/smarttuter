# Avatar Swap Issue - Root Cause Analysis

## User Report
"튜터의 아이콘 이미지와 사용자의 아이콘 이미지가 바뀌어 보이고 있어요."
(The tutor's icon image and user's icon image are appearing swapped)

## Current Implementation

### SimpleChatInterface.tsx (Lines 821-832)
```typescript
className={`flex gap-3 items-start ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
>
  {/* Avatar */}
  {showAvatar ? (
    <Avatar
      type={message.role === 'user' ? 'user' : 'tutor'}
      subject={subject}
      src={message.role === 'user' ? USER_PROFILE_IMAGE : undefined}
      alt={message.role === 'user' ? '사용자' : 'AI 튜터'}
      size="md"
      showOnline={message.role === 'assistant'}
    />
```

### Avatar.tsx (Lines 52-62 - Fallback Icons)
```typescript
<div className={`... ${
  type === 'tutor'
    ? 'bg-gradient-to-br from-purple-500 to-blue-500'  // Purple-Blue for tutor
    : 'bg-gradient-to-br from-blue-500 to-cyan-500'    // Blue-Cyan for user
}`}>
  {type === 'tutor' ? (
    <GraduationCap className="w-5 h-5 text-white" />  // Tutor icon
  ) : (
    <User className="w-5 h-5 text-white" />           // User icon
  )}
</div>
```

## Analysis

### Expected Behavior
1. **User messages** (`role === 'user'`):
   - Position: RIGHT side (`flex-row-reverse`)
   - Avatar type: `'user'`
   - Avatar icon: `User` icon with blue-cyan gradient
   - Avatar ring: `ring-blue-200`
   - No green online dot

2. **Tutor messages** (`role === 'assistant'`):
   - Position: LEFT side (normal flex)
   - Avatar type: `'tutor'`
   - Avatar icon: `GraduationCap` icon with purple-blue gradient
   - Avatar ring: `ring-purple-200`
   - Green online dot

### Potential Root Causes

#### 1. Message Role Mismatch
The code assumes tutor messages have `role === 'assistant'`, but checks:
- `type={message.role === 'user' ? 'user' : 'tutor'}` ← Assumes anything not 'user' is tutor
- `showOnline={message.role === 'assistant'}` ← Explicitly checks for 'assistant'

**If `message.role` has a different value** (e.g., 'system', 'bot', 'ai'), the logic would break.

#### 2. Flex-Row-Reverse Affecting Perception
When `flex-row-reverse` is applied to user messages:
- The entire flex container reverses
- Avatar moves to right side ✓
- But the avatar component doesn't know it's reversed

This is actually correct behavior, but visually might be confusing if styling is wrong.

#### 3. Missing Image Files Showing Wrong Fallbacks
Since avatar image files return 404:
- `/avatars/tutor-math.png` → 404 → Shows fallback icon
- `/avatars/user-profile.jpg` → 404 → Shows fallback icon

If the fallback logic is broken, wrong icons could display.

## Hypothesis

Most likely issue: **The avatar component styling is correct, but the visual appearance is confusing because:**

1. **Both avatars show fallback icons** (no real images)
2. **The gradient colors might look similar** (purple-blue vs blue-cyan)
3. **The icons are small** (20px = w-5 h-5) and hard to distinguish

## Verification Steps

1. Check actual `message.role` values in messages array
2. Verify Avatar component receives correct `type` prop
3. Confirm `flex-row-reverse` positions correctly
4. Test with actual avatar images to see if issue persists

## Proposed Fixes

### Fix 1: Make Fallback Icons More Distinct
Increase icon size and make colors more distinct:

```typescript
// Avatar.tsx
{type === 'tutor' ? (
  <GraduationCap className="w-6 h-6 text-white" />  // Increased from w-5 h-5
) : (
  <User className="w-6 h-6 text-white" />
)}
```

### Fix 2: Make Gradient Colors More Distinct
```typescript
type === 'tutor'
  ? 'bg-gradient-to-br from-purple-600 to-indigo-600'  // Stronger purple
  : 'bg-gradient-to-br from-blue-400 to-sky-400'       // Lighter blue
```

### Fix 3: Add Debug Logging
Temporarily add console.log to verify role values:
```typescript
console.log('Message role:', message.role, 'Avatar type:', message.role === 'user' ? 'user' : 'tutor');
```

### Fix 4: Ensure Consistent Role Naming
Verify all messages use either 'user' or 'assistant', not other values.

## Status
**NEEDS VERIFICATION**: Awaiting actual screenshot or browser console logs to confirm exact issue.

---

**Created**: 2025-11-06
**Issue**: Tutor and user avatars appearing swapped
**Current Server Status**: Running successfully at http://localhost:3000
**Image Files**: All avatar images returning 404 (fallback icons displaying)
