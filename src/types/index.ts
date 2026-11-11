export interface User {
  id: string;
  email: string;
  name: string;
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

export interface AuditLog {
  id: string;
  userId?: string;
  email: string;
  action: 'SIGNUP' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'ACCOUNT_LOCKED';
  timestamp: string;
  ip: string;
  userAgent: string;
  details?: string;
}

export interface TestResult {
  id: string;
  name: string;
  category: string;
  description: string;
  passed: boolean;
  assertions: string[];
}

export interface TestSuiteResponse {
  success: boolean;
  timestamp: string;
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  results: TestResult[];
}

export interface ApkBuild {
  id: string;
  version: string;
  versionCode: number;
  variant: string;
  packageName: string;
  status: 'SUCCESS' | 'BUILDING' | 'FAILED';
  sha256: string;
  sizeBytes: number;
  createdAt: string;
  signedWith: string;
  tonConnectProtocol: string;
  triggeredBy?: string;
}

export interface TonAccountData {
  success: boolean;
  network: string;
  chain_id: number;
  address: string;
  raw_address: string;
  bounceable: string;
  non_bounceable: string;
  balance_nano: number;
  balance_ton: string;
  status: string;
  last_activity: string;
  interfaces: string[];
  security: {
    test_only_flag_enforced: boolean;
    crc16_verified: boolean;
    chain_id_match: boolean;
    tonapi_credential_isolated: boolean;
  };
}
