/**
 * File-Based Database for Authentication
 *
 * Uses JSON file storage for persistence across server restarts
 * This is suitable for development and small-scale production use
 */

import type { User, Account, Session, VerificationToken } from '@/types/auth';
import fs from 'fs';
import path from 'path';

// Database file path
const DB_DIR = path.join(process.cwd(), 'lib', 'db');
const DB_FILE = path.join(DB_DIR, 'auth-data.json');

// Database structure
interface Database {
  users: Record<string, User>;
  accounts: Record<string, Account>;
  sessions: Record<string, Session>;
  verificationTokens: Record<string, VerificationToken>;
}

// In-memory cache
let dbCache: Database | null = null;

// Ensure database directory exists
function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// Load database from file
function loadDatabase(): Database {
  if (dbCache) return dbCache;

  ensureDbDir();

  if (!fs.existsSync(DB_FILE)) {
    const emptyDb: Database = {
      users: {},
      accounts: {},
      sessions: {},
      verificationTokens: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb, null, 2), 'utf-8');
    dbCache = emptyDb;
    return emptyDb;
  }

  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    dbCache = JSON.parse(data);
    return dbCache!;
  } catch (error) {
    console.error('Error loading database:', error);
    const emptyDb: Database = {
      users: {},
      accounts: {},
      sessions: {},
      verificationTokens: {},
    };
    dbCache = emptyDb;
    return emptyDb;
  }
}

// Save database to file
function saveDatabase(db: Database) {
  ensureDbDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  dbCache = db;
}

// Parse dates when loading from JSON
function parseDates<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      // Check if it looks like a date string
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        result[key] = new Date(value) as any;
      }
    }
  }
  return result;
}

// User operations
export const dbUser = {
  async findByEmail(email: string): Promise<User | null> {
    const db = loadDatabase();
    const user = Object.values(db.users).find(u => u.email === email);
    return user ? parseDates(user) : null;
  },

  async findById(id: string): Promise<User | null> {
    const db = loadDatabase();
    const user = db.users[id];
    return user ? parseDates(user) : null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = loadDatabase();
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.users[user.id] = user;
    saveDatabase(db);
    console.log(`✅ User created: ${user.email} (ID: ${user.id})`);
    return user;
  },

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const db = loadDatabase();
    const user = db.users[id];
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    db.users[id] = updatedUser;
    saveDatabase(db);
    console.log(`✅ User updated: ${updatedUser.email} (ID: ${id})`);
    return parseDates(updatedUser);
  },

  async delete(id: string): Promise<boolean> {
    const db = loadDatabase();
    if (!db.users[id]) return false;
    delete db.users[id];
    saveDatabase(db);
    console.log(`✅ User deleted: ID ${id}`);
    return true;
  },

  async list(): Promise<User[]> {
    const db = loadDatabase();
    return Object.values(db.users).map(parseDates);
  },
};

// Account operations
export const dbAccount = {
  async findByProvider(provider: string, providerAccountId: string): Promise<Account | null> {
    const db = loadDatabase();
    const account = Object.values(db.accounts).find(
      a => a.provider === provider && a.providerAccountId === providerAccountId
    );
    return account || null;
  },

  async findByUserId(userId: string): Promise<Account[]> {
    const db = loadDatabase();
    return Object.values(db.accounts).filter(a => a.userId === userId);
  },

  async create(accountData: Omit<Account, 'id'>): Promise<Account> {
    const db = loadDatabase();
    const account: Account = {
      id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...accountData,
    };
    db.accounts[account.id] = account;
    saveDatabase(db);
    console.log(`✅ Account created: ${account.provider} (User: ${account.userId})`);
    return account;
  },

  async delete(id: string): Promise<boolean> {
    const db = loadDatabase();
    if (!db.accounts[id]) return false;
    delete db.accounts[id];
    saveDatabase(db);
    return true;
  },
};

// Session operations
export const dbSession = {
  async findByToken(sessionToken: string): Promise<Session | null> {
    const db = loadDatabase();
    const session = Object.values(db.sessions).find(s => s.sessionToken === sessionToken);
    if (!session) return null;

    const parsedSession = parseDates(session);
    // Check if expired
    if (parsedSession.expires < new Date()) {
      delete db.sessions[session.id];
      saveDatabase(db);
      return null;
    }
    return parsedSession;
  },

  async create(sessionData: Omit<Session, 'id'>): Promise<Session> {
    const db = loadDatabase();
    const session: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...sessionData,
    };
    db.sessions[session.id] = session;
    saveDatabase(db);
    return session;
  },

  async update(sessionToken: string, data: Partial<Session>): Promise<Session | null> {
    const db = loadDatabase();
    const session = Object.values(db.sessions).find(s => s.sessionToken === sessionToken);
    if (!session) return null;

    const updatedSession = { ...session, ...data };
    db.sessions[session.id] = updatedSession;
    saveDatabase(db);
    return parseDates(updatedSession);
  },

  async delete(sessionToken: string): Promise<boolean> {
    const db = loadDatabase();
    const session = Object.values(db.sessions).find(s => s.sessionToken === sessionToken);
    if (!session) return false;

    delete db.sessions[session.id];
    saveDatabase(db);
    return true;
  },

  async deleteByUserId(userId: string): Promise<void> {
    const db = loadDatabase();
    const sessionsToDelete = Object.values(db.sessions).filter(s => s.userId === userId);
    sessionsToDelete.forEach(s => delete db.sessions[s.id]);
    if (sessionsToDelete.length > 0) {
      saveDatabase(db);
    }
  },

  // Clean up expired sessions
  async cleanup(): Promise<void> {
    const db = loadDatabase();
    const now = new Date();
    let changed = false;

    for (const [id, session] of Object.entries(db.sessions)) {
      const parsedSession = parseDates(session);
      if (parsedSession.expires < now) {
        delete db.sessions[id];
        changed = true;
      }
    }

    if (changed) {
      saveDatabase(db);
    }
  },
};

// Verification token operations
export const dbVerificationToken = {
  async findByIdentifier(identifier: string): Promise<VerificationToken | null> {
    const db = loadDatabase();
    const token = Object.values(db.verificationTokens).find(t => t.identifier === identifier);
    if (!token) return null;

    const parsedToken = parseDates(token);
    // Check if expired
    if (parsedToken.expires < new Date()) {
      const key = `${identifier}_${token.token}`;
      delete db.verificationTokens[key];
      saveDatabase(db);
      return null;
    }
    return parsedToken;
  },

  async create(tokenData: VerificationToken): Promise<VerificationToken> {
    const db = loadDatabase();
    const key = `${tokenData.identifier}_${tokenData.token}`;
    db.verificationTokens[key] = tokenData;
    saveDatabase(db);
    return tokenData;
  },

  async delete(identifier: string, token: string): Promise<boolean> {
    const db = loadDatabase();
    const key = `${identifier}_${token}`;
    if (!db.verificationTokens[key]) return false;
    delete db.verificationTokens[key];
    saveDatabase(db);
    return true;
  },
};

// Initialize database on module load
loadDatabase();
console.log('📁 File-based authentication database initialized');
