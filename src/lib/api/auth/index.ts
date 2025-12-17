/**
 * Auth API Service
 * 
 * Provides authentication-related API methods including:
 * - Login/Logout
 * - 2FA (Two-Factor Authentication)
 * - Password management
 * - Email verification
 * - Token refresh
 */

import apiClient, { ApiError } from "../../api-client";
import type { I_Return } from "../../types/api";
import { getOrCreateDeviceId as _getOrCreateDeviceId } from "../../utils/device-id";
import { tokenStorage } from "../../utils/token-storage";
import { wrapResponse } from "../api-utils";

import type {
  AuthenticationMethodsResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  Confirm2FARequest,
  Confirm2FAResponse,
  Disable2FARequest,
  Disable2FAResponse,
  DisableTwoFactorWithBackupRequest,
  Enable2FARequest,
  Enable2FAResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutAllRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SelectAuthenticationMethodRequest,
  UserInfo,
  VerifyEmailOtpRequest,
  VerifyEmailOtpResponse,
  VerifyRecoveryCodeRequest,
  VerifyRecoveryCodeResponse,
  VerifyResetTokenRequest,
  VerifyResetTokenResponse,
  VerifyTwoFactorRequest,
  VerifyTwoFactorResponse,
} from "./types";
/**
 * Auth API Service
 */
export const authApi = {
  // ==================== LOGIN/LOGOUT ====================

  /**
   * Login with credentials
   * Returns requiresTwoFactor: true if 2FA is enabled
   * Returns requiresEmailVerification: true if email not verified
   */
  async login(args: LoginRequest): Promise<I_Return<LoginResponse>> {
    return wrapResponse<LoginResponse>(
      apiClient.POST("/api/auth/login", { body: args })
    );
  },

  /**
   * Verify 2FA code after login
   */
  async verify2FA(args: VerifyTwoFactorRequest): Promise<I_Return<VerifyTwoFactorResponse>> {
    return wrapResponse<VerifyTwoFactorResponse>(
      apiClient.POST("/api/auth/verify-2fa", { body: args })
    );
  },

  /**
   * Refresh access token using refresh token
   * Used by API client middleware to automatically refresh expired tokens
   */
  async refreshToken(refreshTokenValue: string): Promise<I_Return<RefreshTokenResponse>> {
    return wrapResponse<RefreshTokenResponse>(
      apiClient.POST("/api/auth/refresh", {
        body: { refreshToken: refreshTokenValue } as RefreshTokenRequest,
      })
    );
  },

  /**
   * Logout current session
   * Only clears tokens after successful logout
   */
  async logout(): Promise<I_Return<void>> {
    const deviceId = tokenStorage.getDeviceId();
    const headers: Record<string, string> = {};

    if (deviceId) {
      headers["X-Device-Id"] = deviceId;
    }

    return wrapResponse<void>(
      apiClient.POST("/api/auth/logout", { headers })
    );
  },

  /**
   * Logout all devices
   */
  async logoutAll(exceptCurrentDevice = false): Promise<I_Return<void>> {
    return wrapResponse<void>(
      apiClient.POST("/api/auth/logout-all", {
        body: { exceptCurrentDevice } as LogoutAllRequest,
      })
    );
  },

  /**
   * Get current user info
   */
  async me(): Promise<I_Return<UserInfo>> {
    return wrapResponse<UserInfo>(apiClient.GET("/api/auth/me"));
  },

  // ==================== PASSWORD ====================

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<I_Return<ForgotPasswordResponse>> {
    return wrapResponse<ForgotPasswordResponse>(
      apiClient.POST("/api/auth/forgot-password", { body: data })
    );
  },

  /**
   * Verify reset token from email
   */
  async verifyResetToken(data: VerifyResetTokenRequest): Promise<I_Return<VerifyResetTokenResponse>> {
    return wrapResponse<VerifyResetTokenResponse>(
      apiClient.POST("/api/auth/verify-reset-token", { body: data })
    );
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<I_Return<ResetPasswordResponse>> {
    return wrapResponse<ResetPasswordResponse>(
      apiClient.POST("/api/auth/reset-password", { body: data })
    );
  },

  /**
   * Change password (when logged in)
   */
  async changePassword(data: ChangePasswordRequest): Promise<I_Return<ChangePasswordResponse>> {
    return wrapResponse<ChangePasswordResponse>(
      apiClient.POST("/api/auth/change-password", { body: data })
    );
  },

  // ==================== TWO-FACTOR AUTHENTICATION ====================

  /**
   * Enable 2FA - get QR code and backup codes
   */
  async enable2FA(data: Enable2FARequest): Promise<I_Return<Enable2FAResponse>> {
    return wrapResponse<Enable2FAResponse>(
      apiClient.POST("/api/auth/enable-2fa", { body: data })
    );
  },

  /**
   * Confirm 2FA setup with verification code
   */
  async confirm2FA(data: Confirm2FARequest): Promise<I_Return<Confirm2FAResponse>> {
    return wrapResponse<Confirm2FAResponse>(
      apiClient.POST("/api/auth/confirm-2fa", { body: data })
    );
  },

  /**
   * Disable 2FA with current password
   */
  async disable2FA(data: Disable2FARequest): Promise<I_Return<Disable2FAResponse>> {
    return wrapResponse<Disable2FAResponse>(
      apiClient.POST("/api/auth/disable-2fa", { body: data })
    );
  },

  /**
   * Disable 2FA with backup code
   */
  async disable2FAWithBackup(data: DisableTwoFactorWithBackupRequest): Promise<I_Return<Disable2FAResponse>> {
    return wrapResponse<Disable2FAResponse>(
      apiClient.POST("/api/auth/disable-2fa-with-backup", { body: data })
    );
  },

  // ==================== AUTHENTICATION METHODS ====================

  /**
   * Get available authentication methods during login
   */
  async getAuthenticationMethods(): Promise<I_Return<AuthenticationMethodsResponse>> {
    return wrapResponse<AuthenticationMethodsResponse>(
      apiClient.GET("/api/auth/authentication-methods")
    );
  },

  /**
   * Select authentication method during login
   */
  async selectAuthMethod(data: SelectAuthenticationMethodRequest): Promise<I_Return<void>> {
    return wrapResponse<void>(
      apiClient.POST("/api/auth/select-authentication-method", { body: data })
    );
  },

  /**
   * Verify email OTP during authentication
   */
  async verifyEmailOtp(data: VerifyEmailOtpRequest): Promise<I_Return<VerifyEmailOtpResponse>> {
    return wrapResponse<VerifyEmailOtpResponse>(
      apiClient.POST("/api/auth/verify-email-otp", { body: data })
    );
  },

  /**
   * Verify recovery code during 2FA
   */
  async verifyRecoveryCode(data: VerifyRecoveryCodeRequest): Promise<I_Return<VerifyRecoveryCodeResponse>> {
    return wrapResponse<VerifyRecoveryCodeResponse>(
      apiClient.POST("/api/auth/verify-recovery-code", { body: data })
    );
  },
};

export default authApi;

// Re-export types for convenience
export type * from "./types";
export { ApiError };
