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

// Forgot Password Request Models
export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetTokenRequest {
  email: string;
  resetToken: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// 2FA Request Models
export interface SelectAuthenticationMethodRequest {
  twoFactorSessionToken: string;
  selectedMethod: string; // "authenticator" | "email" | "recovery"
}

export interface VerifyEmailOtpRequest {
  email: string;
  emailOtp: string;
  emailVerificationSessionToken?: string;
  twoFactorSessionToken?: string;
}

export interface VerifyRecoveryCodeRequest {
  twoFactorSessionToken: string;
  recoveryCode: string;
}

// Response Models
export interface UserInfo {
  id: number;
  username: string | null;
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
}

/**
 * Shared auth response type used by:
 * - POST /api/auth/login
 * - POST /api/auth/verify-2fa
 * - POST /api/auth/verify-email-otp
 */
export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number;
  tokenType: string | null;
  user: UserInfo | null;
  // 2FA flow
  requiresTwoFactor?: boolean;
  twoFactorSessionToken?: string | null;
  // Email verification flow
  requiresEmailVerification?: boolean;
  emailVerificationSessionToken?: string | null;
  maskedEmail?: string;
}

/**
 * @deprecated Use AuthResponse instead
 */
export type LoginResponse = AuthResponse;

/**
 * @deprecated Use AuthResponse instead
 */
export type VerifyTwoFactorResponse = AuthResponse;

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

export interface VerifyResetTokenResponse {
  isValid: boolean;
  message: string | null;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string | null;
}

// Device/Session Models
export interface UserDeviceResponse {
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  deviceType: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  ipAddress: string | null;
  location: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
  isOnline: boolean;
}

// Auth State
export type AuthStep = "credentials" | "2fa" | "email-otp" | "select-method";

export interface AuthState {
  step: AuthStep;
  twoFactorSessionToken: string | null;
  rememberMe: boolean;
}

// Authentication Methods
export type AuthenticationMethod = "authenticator" | "email" | "recovery";

export interface AuthenticationMethodsResponse {
  methods: AuthenticationMethod[];
  defaultMethod: AuthenticationMethod;
}
