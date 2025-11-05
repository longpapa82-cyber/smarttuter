/**
 * NextAuth Configuration
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import { dbUser, dbSession, dbAccount } from './db-redis';
import { verifyPassword } from './password';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Kakao OAuth
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    }),

    // Email/Password Credentials
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        // Find user by email
        const user = await dbUser.findByEmail(credentials.email);
        if (!user) {
          throw new Error('등록되지 않은 이메일입니다.');
        }

        // Verify password
        if (!user.password) {
          throw new Error('소셜 로그인으로 가입된 계정입니다.');
        }

        const isValidPassword = await verifyPassword(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-request',
    newUser: '/onboarding',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, create user if doesn't exist
      if (account && account.provider !== 'credentials' && user.email) {
        const existingUser = await dbUser.findByEmail(user.email);

        if (!existingUser) {
          // Create new user for OAuth
          const newUser = await dbUser.create({
            email: user.email,
            name: user.name || null,
            image: user.image || null,
            password: null, // No password for OAuth users
            emailVerified: new Date(), // OAuth emails are verified
            gradeLevel: null, // Will be set during onboarding
            gradeDetail: null, // Will be set during onboarding
            preferredSubjects: null, // Will be set during onboarding
          });

          // Create account link
          await dbAccount.create({
            userId: newUser.id,
            type: account.type as 'oauth' | 'email',
            provider: account.provider as 'google' | 'apple' | 'kakao' | 'credentials',
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token ?? null,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
            session_state: account.session_state ?? null,
          });

          // Update user id to match database
          user.id = newUser.id;
        } else {
          // Update existing user's OAuth info if needed
          user.id = existingUser.id;

          // Check if account link exists
          const existingAccount = await dbAccount.findByProvider(
            account.provider,
            account.providerAccountId
          );

          if (!existingAccount) {
            // Link OAuth provider to existing account
            await dbAccount.create({
              userId: existingUser.id,
              type: account.type as 'oauth' | 'email',
              provider: account.provider as 'google' | 'apple' | 'kakao' | 'credentials',
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token ?? null,
              access_token: account.access_token ?? null,
              expires_at: account.expires_at ?? null,
              token_type: account.token_type ?? null,
              scope: account.scope ?? null,
              id_token: account.id_token ?? null,
              session_state: account.session_state ?? null,
            });
          }
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',

  debug: process.env.NODE_ENV === 'development',
};
