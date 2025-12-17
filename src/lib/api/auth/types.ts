/**
 * Auth API Types
 * 
 * Type definitions for authentication-related API requests and responses.
 * All types are derived from the auto-generated OpenAPI schema.
 */

import type { components } from "@/modules/api-schema";

// ==================== USER TYPES ====================
export type UserInfo = components["schemas"]["UserInfoDto"];

// ==================== CLIENT-SIDE TYPES ====================
// These are client-side only types, not from API
export type AuthStep = "credentials" | "2fa" | "email-otp" | "select-method";

export interface AuthState {
  step: AuthStep;
  twoFactorSessionToken: string | null;
  rememberMe: boolean;
}

// ==================== REQUEST TYPES ====================
// Override LoginRequest to make required fields non-optional
export type LoginRequest = Required<
  Pick<components["schemas"]["LoginRequest"], "identity" | "password">
> &
  Omit<components["schemas"]["LoginRequest"], "identity" | "password">;

export type VerifyTwoFactorRequest = components["schemas"]["VerifyTwoFactorRequest"];
export type RefreshTokenRequest = components["schemas"]["RefreshTokenRequest"];
export type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];
export type Enable2FARequest = components["schemas"]["Enable2FARequest"];
export type Confirm2FARequest = components["schemas"]["Confirm2FARequest"];
export type Disable2FARequest = components["schemas"]["Disable2FARequest"];
export type DisableTwoFactorWithBackupRequest = components["schemas"]["DisableTwoFactorWithBackupRequest"];
export type ForgotPasswordRequest = components["schemas"]["ForgotPasswordRequest"];
export type VerifyResetTokenRequest = components["schemas"]["VerifyResetTokenRequest"];
export type ResetPasswordRequest = components["schemas"]["ResetPasswordRequest"];
export type SelectAuthenticationMethodRequest = components["schemas"]["SelectAuthenticationMethodRequest"];
export type VerifyEmailOtpRequest = components["schemas"]["VerifyEmailOtpRequest"];
export type VerifyRecoveryCodeRequest = components["schemas"]["VerifyRecoveryCodeRequest"];

// ==================== RESPONSE TYPES ====================
export type LoginResponse = components["schemas"]["LoginResponse"];
export type VerifyTwoFactorResponse = components["schemas"]["LoginResponse"];
export type RefreshTokenResponse = components["schemas"]["LoginResponse"];
export type VerifyEmailOtpResponse = components["schemas"]["LoginResponse"];
export type VerifyRecoveryCodeResponse = components["schemas"]["LoginResponse"];

export type Enable2FAResponse = components["schemas"]["Enable2FAResponse"];
export type Confirm2FAResponse = components["schemas"]["Confirm2FAResponse"];

export type ForgotPasswordResponse = components["schemas"]["ForgotPasswordResponse"];
export type VerifyResetTokenResponse = components["schemas"]["VerifyResetTokenResponse"];

export type AuthenticationMethodsResponse = components["schemas"]["AuthenticationMethodsResponse"];

// Empty response types
export type Disable2FAResponse = Record<string, never>;
export type ChangePasswordResponse = Record<string, never>;
export type ResetPasswordResponse = Record<string, never>;

// Logout doesn't have a schema, define inline
export type LogoutRequest = { deviceId?: string };
export type LogoutAllRequest = components["schemas"]["LogoutAllRequest"];

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
export type Enable2FAResult = Enable2FAResponse;
export type Confirm2FAResult = Confirm2FAResponse;
export type AuthResponse = LoginResponse;

// ==================== AUTHENTICATION METHODS ====================
export type AuthenticationMethod = "authenticator" | "email" | "recovery";
