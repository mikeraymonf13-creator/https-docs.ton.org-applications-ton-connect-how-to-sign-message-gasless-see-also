import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // Scrypt hash in hex
  salt: string; // 32 bytes hex
  role: 'developer' | 'engineer' | 'auditor' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockoutUntil?: string | null;
  tonTestnetAddress?: string;
  settings: {
    twoFactorSimulation: boolean;
    emailNotifications: boolean;
    strictTestnetVerification: boolean;
  };
}

export type SafeUser = Omit<UserRecord, 'passwordHash' | 'salt'>;

export interface SessionRecord {
  token: string;
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  userAgent?: string;
  ip?: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string;
  email: string;
  action: 'SIGNUP' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'ACCOUNT_LOCKED';
  timestamp: string;
  ip: string;
  userAgent: string;
  details?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJsonFileAtomic<T>(filePath: string, data: T): void {
  const tmpFile = `${filePath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, filePath);
  } catch (err) {
    console.error(`Atomic write failed for ${filePath}:`, err);
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
    // Fallback direct write
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// In-memory caches backed by disk
let usersCache: UserRecord[] = readJsonFile<UserRecord[]>(USERS_FILE, []);
let sessionsCache: SessionRecord[] = readJsonFile<SessionRecord[]>(SESSIONS_FILE, []);
let auditCache: AuditLogRecord[] = readJsonFile<AuditLogRecord[]>(AUDIT_FILE, []);

// Seed initial demo admin user if completely empty for quick onboarding
if (usersCache.length === 0) {
  const demoSalt = crypto.randomBytes(32).toString('hex');
  const demoHash = crypto.scryptSync('ApkBuilder2026!Secure', demoSalt, 64).toString('hex');
  const demoUser: UserRecord = {
    id: crypto.randomUUID(),
    email: 'admin@apkbuilder.internal',
    name: 'ApkBuilder Security Lead',
    passwordHash: demoHash,
    salt: demoSalt,
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    failedLoginAttempts: 0,
    lockoutUntil: null,
    tonTestnetAddress: 'kQCOfXzJb2h9l9Q3E0mD9wKqFj3y3U8fE0cBaZ8gT1bZ2rTest',
    settings: {
      twoFactorSimulation: true,
      emailNotifications: true,
      strictTestnetVerification: true,
    },
  };
  usersCache.push(demoUser);
  writeJsonFileAtomic(USERS_FILE, usersCache);
}

export function sanitizeUser(user: UserRecord): SafeUser {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

export const dbService = {
  // Users
  getUsers(): UserRecord[] {
    return [...usersCache];
  },

  findUserByEmail(email: string): UserRecord | undefined {
    return usersCache.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  findUserById(id: string): UserRecord | undefined {
    return usersCache.find(u => u.id === id);
  },

  createUser(user: UserRecord): void {
    usersCache.push(user);
    writeJsonFileAtomic(USERS_FILE, usersCache);
  },

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const idx = usersCache.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    const updated = {
      ...usersCache[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    usersCache[idx] = updated;
    writeJsonFileAtomic(USERS_FILE, usersCache);
    return updated;
  },

  // Sessions
  createSession(session: SessionRecord): void {
    // Purge expired sessions
    const now = new Date().toISOString();
    sessionsCache = sessionsCache.filter(s => s.expiresAt > now);
    sessionsCache.push(session);
    writeJsonFileAtomic(SESSIONS_FILE, sessionsCache);
  },

  findSession(token: string): SessionRecord | undefined {
    const now = new Date().toISOString();
    const session = sessionsCache.find(s => s.token === token);
    if (!session) return undefined;
    if (session.expiresAt <= now) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  },

  deleteSession(token: string): void {
    sessionsCache = sessionsCache.filter(s => s.token !== token);
    writeJsonFileAtomic(SESSIONS_FILE, sessionsCache);
  },

  deleteUserSessions(userId: string): void {
    sessionsCache = sessionsCache.filter(s => s.userId !== userId);
    writeJsonFileAtomic(SESSIONS_FILE, sessionsCache);
  },

  // Audit Logs
  logAudit(record: Omit<AuditLogRecord, 'id' | 'timestamp'>): void {
    const log: AuditLogRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...record,
    };
    auditCache.unshift(log);
    // Keep max 200 recent logs
    if (auditCache.length > 200) {
      auditCache = auditCache.slice(0, 200);
    }
    writeJsonFileAtomic(AUDIT_FILE, auditCache);
  },

  getAuditLogs(userId?: string): AuditLogRecord[] {
    if (userId) {
      return auditCache.filter(l => l.userId === userId);
    }
    return [...auditCache];
  },
};

// Password security helpers
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const stored = Buffer.from(hash, 'hex');
    if (derived.length !== stored.length) return false;
    return crypto.timingSafeEqual(derived, stored);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}
