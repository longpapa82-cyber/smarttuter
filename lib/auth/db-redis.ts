/**
 * Redis-Based Database for Authentication
 * Uses Upstash Redis for production-ready persistence
 * Compatible with Vercel serverless environment
 */

import { Redis } from '@upstash/redis';
import type { User, Account, Session, VerificationToken } from '@/types/auth';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Key prefixes for different data types
const KEYS = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  account: (id: string) => `account:${id}`,
  accountByProvider: (provider: string, providerAccountId: string) =>
    `account:provider:${provider}:${providerAccountId}`,
  accountsByUser: (userId: string) => `accounts:user:${userId}`,
  session: (token: string) => `session:${token}`,
  sessionsByUser: (userId: string) => `sessions:user:${userId}`,
  verificationToken: (identifier: string, token: string) =>
    `verification:${identifier}:${token}`,
} as const;

// Parse dates from Redis (stored as ISO strings)
function parseDates<T extends Record<string, any>>(obj: T | null): T | null {
  if (!obj) return null;
  const result = { ...obj };
  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      result[key] = new Date(value) as any;
    }
  }
  return result;
}

// User operations
export const dbUser = {
  async findByEmail(email: string): Promise<User | null> {
    const userId = await redis.get<string>(KEYS.userByEmail(email));
    if (!userId) return null;

    const user = await redis.get<User>(KEYS.user(userId));
    return parseDates(user);
  },

  async findById(id: string): Promise<User | null> {
    const user = await redis.get<User>(KEYS.user(id));
    return parseDates(user);
  },

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store user data
    await redis.set(KEYS.user(user.id), user);

    // Store email index
    await redis.set(KEYS.userByEmail(user.email), user.id);

    console.log(`✅ User created in Redis: ${user.email} (ID: ${user.id})`);
    return user;
  },

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await redis.get<User>(KEYS.user(id));
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };

    await redis.set(KEYS.user(id), updatedUser);

    console.log(`✅ User updated in Redis: ${updatedUser.email} (ID: ${id})`);
    return parseDates(updatedUser);
  },

  async delete(id: string): Promise<boolean> {
    const user = await redis.get<User>(KEYS.user(id));
    if (!user) return false;

    // Delete user data
    await redis.del(KEYS.user(id));

    // Delete email index
    await redis.del(KEYS.userByEmail(user.email));

    console.log(`✅ User deleted from Redis: ID ${id}`);
    return true;
  },

  async list(): Promise<User[]> {
    // Get all user keys using pattern matching
    const keys = await redis.keys('user:user_*');
    if (keys.length === 0) return [];

    // Fetch all users in parallel
    const users = await Promise.all(
      keys.map(key => redis.get<User>(key))
    );

    return users
      .filter((user): user is User => user !== null)
      .map(user => parseDates(user)!);
  },
};

// Account operations
export const dbAccount = {
  async findByProvider(provider: string, providerAccountId: string): Promise<Account | null> {
    const accountId = await redis.get<string>(
      KEYS.accountByProvider(provider, providerAccountId)
    );
    if (!accountId) return null;

    const account = await redis.get<Account>(KEYS.account(accountId));
    return account;
  },

  async findByUserId(userId: string): Promise<Account[]> {
    // Get account IDs for this user
    const accountIds = await redis.smembers(KEYS.accountsByUser(userId)) as string[];
    if (accountIds.length === 0) return [];

    // Fetch all accounts in parallel
    const accounts = await Promise.all(
      accountIds.map(id => redis.get<Account>(KEYS.account(id)))
    );

    return accounts.filter((account): account is Account => account !== null);
  },

  async create(accountData: Omit<Account, 'id'>): Promise<Account> {
    const account: Account = {
      id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...accountData,
    };

    // Store account data
    await redis.set(KEYS.account(account.id), account);

    // Store provider index
    await redis.set(
      KEYS.accountByProvider(account.provider, account.providerAccountId),
      account.id
    );

    // Add to user's account set
    await redis.sadd(KEYS.accountsByUser(account.userId), account.id);

    console.log(`✅ Account created in Redis: ${account.provider} (User: ${account.userId})`);
    return account;
  },

  async delete(id: string): Promise<boolean> {
    const account = await redis.get<Account>(KEYS.account(id));
    if (!account) return false;

    // Delete account data
    await redis.del(KEYS.account(id));

    // Delete provider index
    await redis.del(
      KEYS.accountByProvider(account.provider, account.providerAccountId)
    );

    // Remove from user's account set
    await redis.srem(KEYS.accountsByUser(account.userId), id);

    return true;
  },
};

// Session operations
export const dbSession = {
  async findByToken(sessionToken: string): Promise<Session | null> {
    const session = await redis.get<Session>(KEYS.session(sessionToken));
    if (!session) return null;

    const parsedSession = parseDates(session);
    if (!parsedSession) return null;

    // Check if expired
    if (parsedSession.expires < new Date()) {
      await redis.del(KEYS.session(sessionToken));
      return null;
    }

    return parsedSession;
  },

  async create(sessionData: Omit<Session, 'id'>): Promise<Session> {
    const session: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...sessionData,
    };

    // Calculate TTL in seconds
    const ttlSeconds = Math.max(
      1,
      Math.floor((new Date(session.expires).getTime() - Date.now()) / 1000)
    );

    // Store with expiry
    await redis.set(KEYS.session(session.sessionToken), session, {
      ex: ttlSeconds,
    });

    // Add to user's session set
    await redis.sadd(KEYS.sessionsByUser(session.userId), session.sessionToken);

    console.log(`✅ Session created in Redis: ${session.sessionToken} (TTL: ${ttlSeconds}s)`);
    return session;
  },

  async update(sessionToken: string, data: Partial<Session>): Promise<Session | null> {
    const session = await redis.get<Session>(KEYS.session(sessionToken));
    if (!session) return null;

    const updatedSession = { ...session, ...data };

    // Calculate TTL in seconds
    const ttlSeconds = Math.max(
      1,
      Math.floor((new Date(updatedSession.expires).getTime() - Date.now()) / 1000)
    );

    // Update with expiry
    await redis.set(KEYS.session(sessionToken), updatedSession, {
      ex: ttlSeconds,
    });

    return parseDates(updatedSession);
  },

  async delete(sessionToken: string): Promise<boolean> {
    const session = await redis.get<Session>(KEYS.session(sessionToken));
    if (!session) return false;

    // Delete session
    await redis.del(KEYS.session(sessionToken));

    // Remove from user's session set
    await redis.srem(KEYS.sessionsByUser(session.userId), sessionToken);

    return true;
  },

  async deleteByUserId(userId: string): Promise<void> {
    // Get all session tokens for this user
    const sessionTokens = await redis.smembers(KEYS.sessionsByUser(userId)) as string[];
    if (sessionTokens.length === 0) return;

    // Delete all sessions
    await Promise.all(
      sessionTokens.map(token => redis.del(KEYS.session(token)))
    );

    // Clear user's session set
    await redis.del(KEYS.sessionsByUser(userId));

    console.log(`✅ Deleted ${sessionTokens.length} sessions for user ${userId}`);
  },

  // Cleanup is automatic with TTL in Redis
  async cleanup(): Promise<void> {
    console.log('✅ Session cleanup: automatic with Redis TTL');
  },
};

// Verification token operations
export const dbVerificationToken = {
  async findByIdentifier(identifier: string): Promise<VerificationToken | null> {
    // Find all tokens for this identifier using pattern matching
    const keys = await redis.keys(`verification:${identifier}:*`);
    if (keys.length === 0) return null;

    // Return the first valid (non-expired) token
    for (const key of keys) {
      const token = await redis.get<VerificationToken>(key);
      if (!token) continue;

      const parsedToken = parseDates(token);
      if (!parsedToken) continue;

      // Check if expired
      if (parsedToken.expires < new Date()) {
        await redis.del(key);
        continue;
      }

      return parsedToken;
    }

    return null;
  },

  async create(tokenData: VerificationToken): Promise<VerificationToken> {
    // Calculate TTL in seconds
    const ttlSeconds = Math.max(
      1,
      Math.floor((new Date(tokenData.expires).getTime() - Date.now()) / 1000)
    );

    // Store with expiry
    await redis.set(
      KEYS.verificationToken(tokenData.identifier, tokenData.token),
      tokenData,
      { ex: ttlSeconds }
    );

    console.log(`✅ Verification token created in Redis (TTL: ${ttlSeconds}s)`);
    return tokenData;
  },

  async delete(identifier: string, token: string): Promise<boolean> {
    const result = await redis.del(
      KEYS.verificationToken(identifier, token)
    );
    return result > 0;
  },
};

// Export Redis client for direct access (e.g., learning data storage)
export async function getAuthDb() {
  return redis;
}

console.log('✅ Redis-based authentication database initialized');
