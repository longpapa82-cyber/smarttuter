/**
 * Authentication Types
 * User, Account, Session types for NextAuth integration
 */

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  password: string | null; // bcrypt hashed, null for OAuth users
  gradeLevel: string | null; // 'elementary' | 'middle' | 'high' | 'university'
  gradeDetail: string | null; // '3-4', '5-6', '1', '2', '3', etc.
  preferredSubjects: string[] | null; // ['english', 'math']
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: 'oauth' | 'email';
  provider: 'google' | 'github' | 'apple' | 'kakao' | 'credentials';
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationToken {
  identifier: string; // email
  token: string;
  expires: Date;
}

// Sign up form data
export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

// Sign in form data
export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Password requirements
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

// Password strength levels
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
}
