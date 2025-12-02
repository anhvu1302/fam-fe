// Auth Types based on Swagger API

// Request Models
export interface LoginRequest {
  identity: string; // username or email (3-255 chars)
  password: string; // 8-100 chars
  rememberMe?: boolean;
}

export interface VerifyTwoFactorRequest {
  twoFactorCode: string; // 6 digits
  twoFactorSessionToken: string;
  rememberMe?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string; // 8-100 chars
  logoutAllDevices?: boolean;
}

export interface Enable2FARequest {
  password: string;
}

export interface Confirm2FARequest {
  code: string; // 6 digits, pattern: ^\d{6}$
}

export interface Disable2FARequest {
  password: string;
}

export interface DisableTwoFactorWithBackupRequest {
  username: string;
  password: string;
  backupCode: string;
}

export interface LogoutAllRequest {
  exceptCurrentDevice?: boolean;
}

// Response Models
export interface UserInfo {
  id: number;
  username: string | null;
  email: string | null;
  fullName: string | null;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
}

export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number;
  tokenType: string | null;
  user: UserInfo | null;
  requiresTwoFactor: boolean;
  twoFactorSessionToken: string | null;
}

export interface VerifyTwoFactorResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number;
  tokenType: string | null;
  user: UserInfo | null;
}

export interface Enable2FAResponse {
  secret: string | null;
  qrCodeUri: string | null;
  manualEntryKey: string | null;
}

export interface Confirm2FAResponse {
  success: boolean;
  backupCodes: string[] | null;
  message: string | null;
}

// Auth State
export type AuthStep = "credentials" | "2fa";

export interface AuthState {
  step: AuthStep;
  twoFactorSessionToken: string | null;
  rememberMe: boolean;
}
