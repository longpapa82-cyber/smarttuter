/**
 * Password Utilities
 * Password hashing, validation, and strength checking
 */

import bcrypt from 'bcryptjs';
import { PASSWORD_REQUIREMENTS, type PasswordStrength, type PasswordStrengthResult } from '@/types/auth';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validate password against requirements
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`비밀번호는 최소 ${PASSWORD_REQUIREMENTS.minLength}자 이상이어야 합니다.`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('비밀번호에 대문자가 포함되어야 합니다.');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('비밀번호에 소문자가 포함되어야 합니다.');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('비밀번호에 숫자가 포함되어야 합니다.');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('비밀번호에 특수문자가 포함되어야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength
 * Returns a score from 0-100 and strength level
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const feedback: string[] = [];

  // Length scoring (0-30 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  else if (password.length < 8) feedback.push('비밀번호가 너무 짧습니다');

  // Character variety (0-40 points)
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('소문자를 추가하세요');

  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('대문자를 추가하세요');

  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('숫자를 추가하세요');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
  else feedback.push('특수문자를 추가하세요');

  // Pattern checks (0-30 points)
  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('반복되는 문자를 피하세요');
  }

  if (/^[0-9]+$/.test(password)) {
    score -= 20;
    feedback.push('숫자만으로는 약합니다');
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    score -= 10;
    feedback.push('문자만으로는 약합니다');
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|123|234|345|456|567|678|789|890)/i.test(password)) {
    score -= 10;
    feedback.push('연속된 문자/숫자를 피하세요');
  }

  // Bonus for mixed case and special chars together
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 20;
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine strength level
  let strength: PasswordStrength;
  if (score < 40) {
    strength = 'weak';
  } else if (score < 60) {
    strength = 'fair';
  } else if (score < 80) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    strength,
    score,
    feedback,
  };
}

/**
 * Check if email is valid format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email domain is disposable (temporary email)
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
    'fakeinbox.com',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}
