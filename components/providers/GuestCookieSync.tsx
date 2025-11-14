'use client';

/**
 * GuestCookieSync - Disabled to prevent automatic guest mode activation
 *
 * Guest mode should ONLY be activated when user explicitly clicks "무료 체험하기" button
 * This prevents unauthorized access to protected routes (dashboard, tutor pages)
 *
 * To enable guest mode: Call createGuestProfile() explicitly in the trial signup flow
 */
export function GuestCookieSync() {
  // Disabled: Do not automatically sync guest cookies
  // Guest mode should only be activated through explicit user action ("무료 체험하기" button)

  return null; // This component renders nothing
}
