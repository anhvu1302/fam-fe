// Auth Types based on Swagger API

// Request Models
export interface LoginRequest {
  identity: string; // username or email (3-255 chars)
  password: string; // 8-100 chars
  rememberMe?: boolean;
  deviceId?: string; // Device ID for tracking
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
  secret: string; // The secret returned from enable2FA
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
  avatar: string | null;
  avatarUrl?: string | null; // Keep for backward compatibility
  phoneNumber: string | null;
  phoneCountryCode?: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  twoFactorEnabled?: boolean; // New API uses this name
  preferredLanguage: string | null;
  timeZone: string | null;
  receiveNotifications?: boolean;
  receiveMarketingEmails?: boolean;
  isActive?: boolean;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  devices?: unknown[] | null;
  nodeRoles?: unknown[] | null;
  deviceId?: string | null;
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
  accessTokenExpiresAt?: string; // ISO 8601 timestamp from API
  refreshTokenExpiresAt?: string; // ISO 8601 timestamp from API
  tokenType: string | null;
  user: UserInfo | null;
  deviceId?: string | null;
  // 2FA flow
  requiresTwoFactor?: boolean;
  twoFactorSessionToken?: string | null;
  // Email verification flow
  requiresEmailVerification?: boolean;
  emailVerificationSessionToken?: string | null;
  maskedEmail?: string | null;
}

/**
 * @deprecated Use AuthResponse instead
 */
export type LoginResponse = AuthResponse;

/**
 * @deprecated Use AuthResponse instead
 */
export type VerifyTwoFactorResponse = AuthResponse;

// ==================== 2FA Enable/Confirm Responses ====================
export interface Enable2FAResult {
  secret: string | null;
  qrCodeUri: string | null;
  manualEntryKey: string | null;
}

// After unwrap, these are the actual response types returned by API methods
export type Enable2FAResponse = Enable2FAResult;

export interface Confirm2FAResult {
  backupCodes: string[];
}

export type Confirm2FAResponse = Confirm2FAResult;

export interface Disable2FAResponse {
  message?: string;
}

export interface ChangePasswordResponse {
  message?: string;
}

export interface ForgotPasswordResponse {
  message?: string;
}

export interface VerifyResetTokenResponse {
  maskedEmail: string;
}

export interface ResetPasswordResponse {
  message?: string;
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
