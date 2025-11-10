# NextAuth.js Kakao Provider - Comprehensive Best Practices Guide

**Generated:** 2025-11-10
**Purpose:** Complete documentation for NextAuth.js Kakao OAuth integration with error handling, best practices, and serverless deployment considerations

---

## Table of Contents
1. [Overview](#overview)
2. [Required Environment Variables](#required-environment-variables)
3. [Kakao Provider Configuration](#kakao-provider-configuration)
4. [Callback URL Setup](#callback-url-setup)
5. [SignIn Callback Best Practices](#signin-callback-best-practices)
6. [Common OAuth Callback Errors](#common-oauth-callback-errors)
7. [Serverless Environment Considerations](#serverless-environment-considerations)
8. [Production Deployment Checklist](#production-deployment-checklist)
9. [Known Issues and Solutions](#known-issues-and-solutions)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

NextAuth.js provides built-in support for Kakao OAuth through the `KakaoProvider`. This guide covers:
- Proper configuration for both development and production
- Error handling and debugging strategies
- Serverless-specific considerations (Vercel, AWS Lambda, etc.)
- Common pitfalls and their solutions

### Key Resources
- **NextAuth v4 Kakao Docs:** https://next-auth.js.org/providers/kakao
- **Auth.js v5 Kakao Docs:** https://authjs.dev/getting-started/providers/kakao
- **Kakao Developer Console:** https://developers.kakao.com/console/app
- **Kakao Login Docs:** https://developers.kakao.com/docs/latest/en/kakaologin/common

---

## Required Environment Variables

### NextAuth.js v4
```bash
# Kakao OAuth Credentials
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com  # CRITICAL: Must match actual deployment URL
NEXTAUTH_SECRET=your_secure_random_string  # Generate with: openssl rand -base64 32
```

### Auth.js v5
```bash
# Kakao OAuth Credentials
AUTH_KAKAO_ID=your_kakao_rest_api_key
AUTH_KAKAO_SECRET=your_kakao_client_secret

# Auth.js Configuration
AUTH_URL=https://your-domain.com
AUTH_SECRET=your_secure_random_string
```

### Finding Kakao Credentials in Kakao Console

1. **Client ID (REST API Key)**
   - Location: **My Application > App Settings > Summary** tab
   - Field: **App Keys Field** → "REST API 키"
   - Note: This is NOT the JavaScript key

2. **Client Secret**
   - Location: **My Application > Product Settings > Kakao Login > Security** tab
   - Field: **Client Secret**
   - Note: Written as "보안" (Security) in Korean interface
   - Action: Must generate/activate if not already created

---

## Kakao Provider Configuration

### Basic Configuration (NextAuth v4)

```typescript
// lib/auth/config.ts
import KakaoProvider from 'next-auth/providers/kakao';

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    }),
  ],
};
```

### Advanced Configuration with Email Scope

```typescript
KakaoProvider({
  clientId: process.env.KAKAO_CLIENT_ID || '',
  clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  authorization: {
    params: {
      // Request email permission (requires Kakao Business verification)
      scope: 'account_email profile_nickname',
    },
  },
  profile(profile) {
    return {
      id: profile.id.toString(),
      name: profile.kakao_account?.profile?.nickname ||
            profile.properties?.nickname ||
            'Kakao User',
      email: profile.kakao_account?.email ||
             `kakao_${profile.id}@kakao.temp`,  // Fallback for denied email
      image: profile.kakao_account?.profile?.profile_image_url ||
             profile.properties?.profile_image ||
             null,
    };
  },
}),
```

### Profile Callback Explanation

**Why needed:**
- Kakao's default profile response structure differs from NextAuth's expected format
- Email may not be provided unless user grants permission
- Multiple possible locations for profile data (kakao_account vs properties)

**Fallback Strategy:**
```typescript
// Primary email source
profile.kakao_account?.email

// Fallback if user denies email permission
`kakao_${profile.id}@kakao.temp`  // Creates unique identifier like: kakao_4532076824@kakao.temp
```

---

## Callback URL Setup

### URL Format Requirements

**Next.js (App Router & Pages Router):**
```
https://your-domain.com/api/auth/callback/kakao
```

**Development:**
```
http://localhost:3000/api/auth/callback/kakao
```

**SvelteKit:**
```
https://your-domain.com/auth/callback/kakao
```

### CRITICAL Rules for Callback URLs

1. **Exact Match Required**
   - Kakao Console redirect URI must EXACTLY match the actual callback URL
   - No trailing slashes: `/kakao/` ❌ → `/kakao` ✅
   - Protocol must match: `http://` vs `https://`
   - Port numbers must match if specified

2. **All Deployment URLs Must Be Registered**
   ```
   # Production
   https://aipark.vercel.app/api/auth/callback/kakao
   https://smarttuter.vercel.app/api/auth/callback/kakao

   # Preview/Staging (if needed)
   https://aipark-preview-xyz.vercel.app/api/auth/callback/kakao

   # Development
   http://localhost:3000/api/auth/callback/kakao
   ```

3. **Domain Changes Require Updates**
   - If you change your domain, update Kakao Console IMMEDIATELY
   - If using multiple Vercel deployment URLs, register ALL of them
   - Each branch preview URL needs its own registration for testing

### Configuring Redirect URIs in Kakao Console

**Step-by-Step:**

1. Go to https://developers.kakao.com/console/app
2. Select your application
3. Navigate to: **제품 설정 (Product Settings) → 카카오 로그인 (Kakao Login)**
4. Under **Redirect URI 등록 (Redirect URI Registration)**:
   - Click **등록 (Register)**
   - Paste EXACT callback URL
   - Click **저장 (Save)**
   - Repeat for each deployment environment

5. **Activate Web App** (if not already done):
   - Under **활성화 설정 (Activation Settings)**
   - Enable **Web** toggle
   - Save changes

---

## SignIn Callback Best Practices

### Why SignIn Callbacks Matter in Serverless

In serverless environments (Vercel, AWS Lambda, etc.), the signIn callback is critical for:
- Creating user records on first login
- Persisting OAuth access tokens
- Handling provider-specific data formats
- Managing stateless authentication

### Recommended Pattern for Serverless OAuth

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    try {
      console.log('🔐 OAuth signIn callback started:', {
        provider: account?.provider,
        userId: user.id,
        userEmail: user.email
      });

      // 1. Only process OAuth providers (skip credentials)
      if (account && account.provider !== 'credentials') {

        // 2. Handle email fallback for Kakao
        const userEmail = user.email ||
          `${account.provider}_${account.providerAccountId}@temp.user`;

        console.log('📧 Looking up user by email:', userEmail);
        const existingUser = await dbUser.findByEmail(userEmail);

        if (!existingUser) {
          console.log('👤 Creating new OAuth user:', userEmail);

          // 3. Create new user for OAuth (SERVERLESS: DB write in callback)
          const newUser = await dbUser.create({
            email: userEmail,
            name: user.name || null,
            image: user.image || null,
            password: null, // No password for OAuth users
            emailVerified: new Date(), // OAuth emails are verified
          });

          console.log('✅ New user created with ID:', newUser.id);

          // 4. Create account link (CRITICAL for OAuth)
          await dbAccount.create({
            userId: newUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token ?? null,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
            session_state: account.session_state ?? null,
          });

          // 5. Update user id to match database
          user.id = newUser.id;

        } else {
          console.log('✅ Existing user found:', existingUser.id);
          user.id = existingUser.id;

          // 6. Check if this OAuth provider is already linked
          const existingAccount = await dbAccount.findByProvider(
            account.provider,
            account.providerAccountId
          );

          if (!existingAccount) {
            // Link new OAuth provider to existing account
            await dbAccount.create({
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
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

      console.log('✅ OAuth signIn callback completed successfully');
      return true;  // Allow sign in

    } catch (error) {
      console.error('❌ OAuth signIn callback error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      // CRITICAL: Return false to prevent sign in and show error
      return false;
    }
  },

  async jwt({ token, user, account }) {
    // SERVERLESS: Persist OAuth access token in JWT (first sign in only)
    if (account && user) {
      token.id = user.id;
      token.email = user.email;
      token.accessToken = account.access_token;  // Optional: for API calls
    }
    return token;
  },

  async session({ session, token }) {
    // SERVERLESS: Attach user data to session
    if (token && session.user) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
    }
    return session;
  },
},

session: {
  strategy: 'jwt',  // CRITICAL for serverless (no database session storage)
  maxAge: 24 * 60 * 60, // 24 hours
},
```

### Key Serverless Best Practices

1. **Use JWT Strategy**
   ```typescript
   session: {
     strategy: 'jwt',  // Stateless, scales horizontally
   }
   ```
   - Avoids database lookups on every request
   - Works with serverless function cold starts
   - No session storage infrastructure needed

2. **Check Parameter Existence**
   ```typescript
   if (account && user) {
     // First sign in - account object is populated
     // Save data now, won't be available later
   }
   ```
   - `account` object only exists on first sign in
   - Must persist critical data in JWT callback immediately

3. **Persist OAuth Access Tokens**
   ```typescript
   token.accessToken = account.access_token;
   ```
   - Allows making API calls to OAuth provider later
   - Must save in JWT callback (not available in session callback)

4. **Error Handling**
   ```typescript
   return false;  // Prevent sign in on error
   ```
   - Returning `false` shows error page to user
   - Prevents partial authentication state
   - Logs errors for debugging

5. **Comprehensive Logging**
   ```typescript
   console.log('🔐 OAuth signIn callback started:', {
     provider: account?.provider,
     userId: user.id,
   });
   ```
   - Essential for debugging in production
   - Helps identify where failures occur
   - Use emoji prefixes for visual scanning

---

## Common OAuth Callback Errors

### 1. OAuthCallback Error

**Symptoms:**
- Redirect to `/login?error=OAuthCallback` after Kakao authentication
- User completes Kakao login but returns to login page
- Works in development but fails in production

**Root Causes:**

#### a) NEXTAUTH_URL Mismatch
```bash
# WRONG: Old deployment URL or localhost
NEXTAUTH_URL=http://localhost:3000

# RIGHT: Actual production URL
NEXTAUTH_URL=https://aipark.vercel.app
```

**How it happens:**
1. User clicks "Login with Kakao" on `aipark.vercel.app`
2. Redirects to Kakao for authentication
3. User authenticates successfully
4. Kakao redirects to: `aipark.vercel.app/api/auth/callback/kakao`
5. NextAuth checks `NEXTAUTH_URL` environment variable
6. Finds `http://localhost:3000` (wrong!)
7. Rejects callback as domain mismatch
8. Redirects to `/login?error=OAuthCallback`

**Solution:**
```bash
# Update Vercel environment variable
vercel env add NEXTAUTH_URL production
# Value: https://aipark.vercel.app

# Redeploy to apply new environment variable
vercel --prod --yes
```

#### b) Redirect URI Not Registered

**Error in browser console:**
```
KOE006: redirect_uri does not match
```

**Solution:**
- Go to Kakao Console → Kakao Login → Redirect URI
- Add EXACT callback URL including protocol and path
- Save and retry

#### c) State Parameter Mismatch

**Symptoms:**
- Error: "checks.state argument is missing"
- Happens in production but not locally

**Causes:**
- Cookie not being set/read properly across domains
- Proxy or CDN interference with OAuth flow
- SameSite cookie restrictions

**Solutions:**
```typescript
// In authOptions
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',  // Changed from 'strict'
      path: '/',
      secure: true,  // HTTPS only in production
    },
  },
},
```

### 2. oauth_get_access_token_error

**Symptoms:**
- Error during token exchange phase
- Happens after successful user authentication
- "Invalid client: client is invalid"

**Root Causes:**

#### a) Incorrect Client Secret
```bash
# Verify in Kakao Console → Security tab
KAKAO_CLIENT_SECRET=wrong_secret  # ❌

# Copy exact value from Kakao Console
KAKAO_CLIENT_SECRET=V4pYxA4vn67ib4iYn0r4900Ct4wCwUd9  # ✅
```

#### b) Client Secret Not Activated
- Some Kakao apps require manual activation of Client Secret
- Go to: Kakao Console → Kakao Login → Security
- Click "Activate" or "Generate" if needed

#### c) Whitespace in Environment Variable
```bash
# WRONG: Trailing newline or whitespace
KAKAO_CLIENT_SECRET="V4pYxA4vn67ib4iYn0r4900Ct4wCwUd9\n"

# RIGHT: Clean value
KAKAO_CLIENT_SECRET="V4pYxA4vn67ib4iYn0r4900Ct4wCwUd9"
```

**Debugging:**
```bash
# Check for whitespace issues
node -e "console.log(JSON.stringify(process.env.KAKAO_CLIENT_SECRET))"

# Should output: "V4pYxA4vn67ib4iYn0r4900Ct4wCwUd9"
# NOT: "V4pYxA4vn67ib4iYn0r4900Ct4wCwUd9\n"
```

### 3. Profile/Email Not Available

**Symptoms:**
- User object has no email after Kakao login
- `profile.kakao_account.email` is undefined
- Session lacks critical user data

**Root Causes:**

#### a) Missing Email Scope
```typescript
// WRONG: No scope specified
KakaoProvider({
  clientId: process.env.KAKAO_CLIENT_ID || '',
  clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
}),

// RIGHT: Request email scope
KakaoProvider({
  clientId: process.env.KAKAO_CLIENT_ID || '',
  clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  authorization: {
    params: {
      scope: 'account_email profile_nickname',
    },
  },
}),
```

#### b) User Denied Email Permission
- Even with scope requested, users can deny email access
- Must implement fallback strategy

**Solution:**
```typescript
profile(profile) {
  return {
    id: profile.id.toString(),
    email: profile.kakao_account?.email || `kakao_${profile.id}@kakao.temp`,
    // Falls back to unique ID-based email if permission denied
  };
}
```

#### c) Email Not Configured in Kakao Console

**Check Consent Items:**
1. Kakao Console → Product Settings → Kakao Login
2. Under **동의 항목 (Consent Items)**
3. Verify these are set:
   - `profile_nickname` - Required (필수)
   - `account_email` - Optional (선택) or Required (requires Business verification)

---

## Serverless Environment Considerations

### Vercel-Specific Issues

#### 1. Environment Variables Not Applied

**Problem:**
- Environment variables updated in Vercel dashboard
- But deployed app still uses old values

**Root Cause:**
- Vercel injects environment variables at BUILD time, not RUNTIME
- Existing deployments use variables from their build time

**Solution:**
```bash
# After updating environment variables, MUST redeploy
vercel --prod --yes

# Or use Vercel dashboard: Deployments → Redeploy
```

#### 2. Preview Deployment URLs

**Problem:**
- Each preview deployment gets unique URL
- Kakao OAuth fails on preview URLs

**Solutions:**

**Option A: Register All Preview URLs**
```
https://aipark-abc123.vercel.app/api/auth/callback/kakao
https://aipark-def456.vercel.app/api/auth/callback/kakao
```
- Not practical for many previews

**Option B: Use Wildcard (Not Supported by Kakao)**
- Kakao doesn't support wildcard redirect URIs

**Option C: Test OAuth Only on Production**
- Use credential login for preview testing
- Reserve OAuth testing for production URL

#### 3. Vercel Deployment Limits

**Free Tier:**
- 100 deployments per day
- Queued deployments may delay environment variable updates

**Solution:**
- Use dashboard "Redeploy" instead of CLI for immediate deployment
- Upgrade to Pro tier if hitting limits frequently

### AWS Lambda / Other Serverless

#### Cold Start Considerations

```typescript
// Keep connection pools warm
let cachedDb = null;

async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }
  cachedDb = await connectToDatabase();
  return cachedDb;
}
```

#### Timeout Settings

```typescript
// In vercel.json or serverless.yml
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 10  // Increase for OAuth callbacks
    }
  }
}
```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] **Kakao Console Setup**
  - [ ] Application created at https://developers.kakao.com/console/app
  - [ ] Web platform activated
  - [ ] Redirect URIs registered for ALL deployment URLs
  - [ ] Client Secret generated and activated
  - [ ] Consent items configured (nickname required, email optional)

- [ ] **Environment Variables**
  - [ ] `KAKAO_CLIENT_ID` set in production environment
  - [ ] `KAKAO_CLIENT_SECRET` set (no whitespace!)
  - [ ] `NEXTAUTH_URL` set to actual production URL
  - [ ] `NEXTAUTH_SECRET` set (32+ character random string)

- [ ] **Code Configuration**
  - [ ] KakaoProvider configured with email scope
  - [ ] Profile callback with fallback email strategy
  - [ ] SignIn callback handles user creation
  - [ ] JWT strategy enabled for serverless
  - [ ] Error logging comprehensive

### Post-Deployment

- [ ] **Deployment Verification**
  - [ ] Environment variables applied (check build logs)
  - [ ] New deployment is "Ready" status
  - [ ] No build errors or warnings

- [ ] **Functional Testing**
  - [ ] Open incognito/private browser window
  - [ ] Navigate to production login page
  - [ ] Click "Login with Kakao" button
  - [ ] Complete Kakao authentication
  - [ ] Verify redirect to dashboard (not back to login)
  - [ ] Check session persistence (refresh page)
  - [ ] Test logout functionality

- [ ] **Error Monitoring**
  - [ ] Check Vercel function logs for errors
  - [ ] Monitor OAuth callback success rate
  - [ ] Set up alerts for authentication failures

---

## Known Issues and Solutions

### Issue 1: Infinite Redirect Loop

**Symptoms:**
```
/login → Kakao Auth → /api/auth/callback/kakao → /login?error=OAuthCallback → loop
```

**Root Cause:**
- `NEXTAUTH_URL` doesn't match actual deployment domain
- Built with old environment variable value

**Solution:**
```bash
# 1. Update environment variable
vercel env add NEXTAUTH_URL production
# Enter: https://your-actual-domain.vercel.app

# 2. MUST redeploy to apply
vercel --prod --yes

# 3. Verify in build logs
vercel logs --follow
# Check: "NEXTAUTH_URL=https://your-actual-domain.vercel.app"
```

### Issue 2: Works Locally, Fails in Production

**Common Causes:**

1. **Environment Variables**
   ```bash
   # Local (.env.local)
   NEXTAUTH_URL=http://localhost:3000  ✅

   # Production (Vercel)
   NEXTAUTH_URL=http://localhost:3000  ❌ WRONG!
   NEXTAUTH_URL=https://aipark.vercel.app  ✅ RIGHT!
   ```

2. **Redirect URI Registration**
   ```
   Registered in Kakao:
   ✅ http://localhost:3000/api/auth/callback/kakao
   ❌ Missing: https://aipark.vercel.app/api/auth/callback/kakao
   ```

3. **HTTPS vs HTTP**
   - Development: `http://localhost:3000` ✅
   - Production: `http://aipark.vercel.app` ❌ (Vercel enforces HTTPS)
   - Production: `https://aipark.vercel.app` ✅

### Issue 3: Email Permission Denied by User

**Scenario:**
- User clicks Kakao login
- Kakao asks for email permission
- User clicks "Deny"
- Login fails or email is null

**Solution:**
```typescript
// ALWAYS implement fallback
profile(profile) {
  return {
    email: profile.kakao_account?.email ||  // Primary source
           `kakao_${profile.id}@kakao.temp`,  // Fallback
  };
}

// In signIn callback
const userEmail = user.email ||
  `${account.provider}_${account.providerAccountId}@temp.user`;
```

**Additional Handling:**
```typescript
// Detect temporary email and prompt user
if (session.user.email.includes('@kakao.temp')) {
  // Show UI to complete email
  return <CompleteProfilePrompt />;
}
```

---

## Troubleshooting Guide

### Step 1: Verify Environment Variables

```bash
# Check Vercel environment variables
vercel env ls production

# Should show:
# KAKAO_CLIENT_ID
# KAKAO_CLIENT_SECRET
# NEXTAUTH_URL (matching your domain!)
# NEXTAUTH_SECRET
```

**Validation Script:**
```javascript
// scripts/verify-kakao-oauth.js
const requiredVars = [
  'KAKAO_CLIENT_ID',
  'KAKAO_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ Missing: ${varName}`);
  } else if (value.includes('\n') || value.includes(' ')) {
    console.warn(`⚠️ Whitespace detected in: ${varName}`);
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  }
});

// Check NEXTAUTH_URL format
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl && !nextAuthUrl.match(/^https?:\/\/.+/)) {
  console.error(`❌ Invalid NEXTAUTH_URL format: ${nextAuthUrl}`);
}
```

### Step 2: Check Kakao Console Configuration

1. **Redirect URIs:**
   ```
   Kakao Console → 제품 설정 → 카카오 로그인 → Redirect URI

   Expected:
   ✅ https://aipark.vercel.app/api/auth/callback/kakao
   ✅ http://localhost:3000/api/auth/callback/kakao
   ```

2. **Web Platform Status:**
   ```
   Kakao Console → 플랫폼 → Web

   Status: 활성화 ON (Activated)
   ```

3. **Client Secret:**
   ```
   Kakao Console → 카카오 로그인 → 보안

   Client Secret 상태: 사용함 (In Use)
   ```

### Step 3: Browser DevTools Network Analysis

1. Open DevTools (F12) → Network tab
2. Filter: `kakao`
3. Click "Login with Kakao"
4. Observe network requests:

**Expected Flow:**
```
1. /api/auth/signin/kakao
   → Status: 302 Redirect

2. kauth.kakao.com/oauth/authorize
   → Status: 200
   → Parameters: client_id, redirect_uri, response_type, state

3. kauth.kakao.com/oauth/authorize (POST)
   → User authenticates

4. /api/auth/callback/kakao?code=xxx&state=yyy
   → Status: 302 Redirect to dashboard
   → OR 302 Redirect to /login?error=OAuthCallback (ERROR!)
```

**If error occurs, check:**
```javascript
// In request to /api/auth/callback/kakao
// Query parameters:
code: "abc123..."  // ✅ Should be present
state: "xyz789..."  // ✅ Should be present
error: undefined  // ✅ Should NOT be present

// If error parameter exists:
error: "OAuthCallback"  // ❌ Check NEXTAUTH_URL and redirect URI
```

### Step 4: Server Logs Analysis

**Vercel:**
```bash
# Real-time logs
vercel logs --follow

# Filter for OAuth
vercel logs --follow | grep -i "oauth\|kakao"
```

**Look for:**
```
✅ Good signs:
🔐 OAuth signIn callback started: { provider: 'kakao', ... }
👤 Creating new OAuth user: kakao_123@kakao.temp
✅ OAuth signIn callback completed successfully

❌ Bad signs:
❌ OAuth signIn callback error: ...
Error: Invalid redirect_uri
Error: State parameter mismatch
```

### Step 5: Test with Incognito Mode

**Why:**
- Clears cookies and cache
- Tests clean authentication flow
- Avoids session conflicts

**Steps:**
1. Open incognito/private browser window
2. Navigate to production URL
3. Click "Login with Kakao"
4. Complete authentication
5. Verify successful redirect

### Step 6: Verify Deployment Timing

**Issue:**
- Environment variables updated
- But app still uses old values

**Check:**
```bash
# View recent deployments
vercel ls

# Expected:
# Latest deployment should be AFTER env variable update
# Status should be "Ready" not "Queued"
```

**If deployment is old:**
```bash
# Trigger new deployment
vercel --prod --yes

# Or use dashboard:
# Deployments → Click latest → Redeploy
```

---

## Quick Reference

### Essential Commands

```bash
# Check environment variables
vercel env ls production

# Update environment variable
vercel env add NEXTAUTH_URL production
# Value: https://your-domain.vercel.app

# Redeploy with new environment variables
vercel --prod --yes

# View logs
vercel logs --follow

# Verify environment in production
curl https://your-domain.vercel.app/api/health
```

### Required Kakao Console Settings

| Setting | Location | Value |
|---------|----------|-------|
| Web Platform | 플랫폼 → Web | 활성화 ON |
| Redirect URI | 카카오 로그인 → Redirect URI | `https://domain.com/api/auth/callback/kakao` |
| Client Secret | 카카오 로그인 → 보안 | 사용함 (Generated) |
| Consent Items | 카카오 로그인 → 동의 항목 | profile_nickname (필수) |

### Critical Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-domain.com` |
| `KAKAO_CLIENT_ID` | Same | Same |
| `KAKAO_CLIENT_SECRET` | Same | Same |
| `NEXTAUTH_SECRET` | Random 32+ chars | Random 32+ chars (different!) |

---

## Additional Resources

### Official Documentation
- **NextAuth.js Kakao Provider:** https://next-auth.js.org/providers/kakao
- **Auth.js Kakao Provider:** https://authjs.dev/getting-started/providers/kakao
- **Kakao Login Guide:** https://developers.kakao.com/docs/latest/en/kakaologin/common
- **NextAuth Callbacks:** https://next-auth.js.org/configuration/callbacks

### Troubleshooting Resources
- **NextAuth Errors:** https://next-auth.js.org/errors
- **OAuth Debugging:** https://next-auth.js.org/tutorials/debugging
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

### Community Resources
- **NextAuth GitHub Issues:** https://github.com/nextauthjs/next-auth/issues
- **NextAuth Discord:** https://discord.gg/nextauth
- **Stack Overflow:** Search "nextauth kakao" for common issues

---

## Summary: Most Common Issues

1. **NEXTAUTH_URL Mismatch** (70% of cases)
   - Solution: Set to actual production domain, redeploy

2. **Redirect URI Not Registered** (20% of cases)
   - Solution: Add exact callback URL to Kakao Console

3. **Environment Variables Not Applied** (5% of cases)
   - Solution: Redeploy after updating variables

4. **Client Secret Issues** (3% of cases)
   - Solution: Verify activation, check for whitespace

5. **Email Permission Denied** (2% of cases)
   - Solution: Implement fallback email strategy

---

**Last Updated:** 2025-11-10
**Maintained By:** AI Park Development Team
**Version:** 1.0.0
