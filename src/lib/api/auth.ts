import type {
  AuthenticationMethodsResponse,
  AuthResponse,
  ChangePasswordRequest,
  Confirm2FARequest,
  Confirm2FAResponse,
  Disable2FARequest,
  DisableTwoFactorWithBackupRequest,
  Enable2FARequest,
  Enable2FAResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SelectAuthenticationMethodRequest,
  VerifyEmailOtpRequest,
  VerifyRecoveryCodeRequest,
  VerifyResetTokenRequest,
  VerifyResetTokenResponse,
  VerifyTwoFactorRequest,
  VerifyTwoFactorResponse,
} from "@/types/auth";

import apiClient from "../axios-client";
import { getOrCreateDeviceId as _getOrCreateDeviceId } from "../device-id";
import { tokenStorage } from "../token-storage";

const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  VERIFY_2FA: "/api/auth/verify-2fa",
  REFRESH: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
  LOGOUT_ALL: "/api/auth/logout-all",
  ME: "/api/auth/me",
  // Forgot Password
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  VERIFY_RESET_TOKEN: "/api/auth/verify-reset-token",
  RESET_PASSWORD: "/api/auth/reset-password",
  // 2FA Management
  ENABLE_2FA: "/api/auth/enable-2fa",
  CONFIRM_2FA: "/api/auth/confirm-2fa",
  DISABLE_2FA: "/api/auth/disable-2fa",
  DISABLE_2FA_WITH_BACKUP: "/api/auth/disable-2fa-with-backup",
  AUTHENTICATION_METHODS: "/api/auth/authentication-methods",
  SELECT_AUTH_METHOD: "/api/auth/select-authentication-method",
  VERIFY_EMAIL_OTP: "/api/auth/verify-email-otp",
  VERIFY_RECOVERY_CODE: "/api/auth/verify-recovery-code",
  // Password
  CHANGE_PASSWORD: "/api/auth/change-password",
} as const;

/**
 * Auth API Service
 */
export const authApi = {
  /**
   * Login with credentials
   * Returns requiresTwoFactor: true if 2FA is enabled
   * Returns requiresEmailVerification: true if email not verified
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      data
    );

    // Save tokens if login successful without 2FA or email verification
    if (
      response.data.accessToken &&
      response.data.refreshToken &&
      !response.data.requiresTwoFactor &&
      !response.data.requiresEmailVerification
    ) {

      await tokenStorage.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.accessTokenExpiresAt,
        response.data.refreshTokenExpiresAt
      );
      if (response.data.user) {
        tokenStorage.setUser(response.data.user);
      }
      // Save device ID if provided
      if (response.data.deviceId) {
        tokenStorage.setDeviceId(response.data.deviceId);
      }
    }

    return response.data;
  },

  /**
   * Verify 2FA code after login
   */
  async verify2FA(data: VerifyTwoFactorRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.VERIFY_2FA,
      data
    );

    // Save tokens after successful 2FA
    if (response.data.accessToken && response.data.refreshToken) {
      await tokenStorage.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.accessTokenExpiresAt,
        response.data.refreshTokenExpiresAt
      );
      if (response.data.user) {
        tokenStorage.setUser(response.data.user);
      }
      // Save device ID if provided
      if (response.data.deviceId) {
        tokenStorage.setDeviceId(response.data.deviceId);
      }
    }

    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.REFRESH,
      data
    );

    // Update tokens
    if (response.data.accessToken && response.data.refreshToken) {
      await tokenStorage.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.accessTokenExpiresAt,
        response.data.refreshTokenExpiresAt
      );
    }

    return response.data;
  },

  /**
   * Logout current session
   * Only clears tokens after successful logout
   */
  async logout(): Promise<void> {
    try {
      const deviceId = tokenStorage.getDeviceId();
      const config: { headers: Record<string, string> } = {
        headers: {}
      };

      // Send device ID in header for logout tracking
      if (deviceId) {
        config.headers["X-Device-Id"] = deviceId;
      }

      // Logout requires authentication - Authorization header will be added by axios interceptor
      // The empty object as second parameter ensures axios includes all interceptors
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}, config);

      // Only clear tokens if logout was successful
      tokenStorage.clear();
    } catch (error) {
      // Re-throw so caller can handle it
      throw error;
    }
  },

  /**
   * Logout all devices
   */
  async logoutAll(exceptCurrentDevice = false): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT_ALL, { exceptCurrentDevice });
    } finally {
      // Clear tokens even if request fails
      tokenStorage.clear();
    }
  },

  /**
   * Get current user info
   * API returns: { success, message, result: UserInfo }
   * Sends device ID in X-Device-Id header
   */
  async getCurrentUser(): Promise<unknown> {
    const deviceId = tokenStorage.getDeviceId();
    const config: { headers: Record<string, string> } = {
      headers: {}
    };

    // Send device ID in header
    if (deviceId) {
      config.headers["X-Device-Id"] = deviceId;
    }

    const response = await apiClient.get<{ success: boolean; message: string; result: unknown }>(
      AUTH_ENDPOINTS.ME,
      config
    );
    // Extract user data from result field if present
    const userData = response.data.result || response.data;
    if (userData) {
      tokenStorage.setUser(userData);
    }
    return userData;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated();
  },

  // ==================== FORGOT PASSWORD ====================

  /**
   * Request password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
  },

  /**
   * Verify reset token is valid
   */
  async verifyResetToken(data: VerifyResetTokenRequest): Promise<VerifyResetTokenResponse> {
    const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_RESET_TOKEN, data);
    // If API returns 200 but isValid is false, treat as error
    if (response.data?.isValid === false) {
      throw new Error(response.data?.message || "Invalid or expired reset token.");
    }
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
    // If API returns 200 but success is false, treat as error
    if (response.data?.success === false) {
      throw new Error(response.data?.message || "Failed to reset password.");
    }
    return response.data;
  },

  // ==================== 2FA MANAGEMENT ====================

  /**
   * Enable 2FA - Step 1: Get QR code and secret
   */
  async enable2FA(data: Enable2FARequest): Promise<Enable2FAResponse> {
    const response = await apiClient.post<Enable2FAResponse>(
      AUTH_ENDPOINTS.ENABLE_2FA,
      data
    );
    return response.data;
  },

  /**
   * Enable 2FA - Step 2: Confirm with TOTP code
   */
  async confirm2FA(data: Confirm2FARequest): Promise<Confirm2FAResponse> {
    const response = await apiClient.post<Confirm2FAResponse>(
      AUTH_ENDPOINTS.CONFIRM_2FA,
      data
    );
    return response.data;
  },

  /**
   * Disable 2FA with password
   */
  async disable2FA(data: Disable2FARequest): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.DISABLE_2FA, data);
  },

  /**
   * Disable 2FA with backup code (for locked out users)
   */
  async disable2FAWithBackup(data: DisableTwoFactorWithBackupRequest): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.DISABLE_2FA_WITH_BACKUP, data);
  },

  /**
   * Get available authentication methods for 2FA
   */
  async getAuthenticationMethods(): Promise<AuthenticationMethodsResponse> {
    const response = await apiClient.get<AuthenticationMethodsResponse>(
      AUTH_ENDPOINTS.AUTHENTICATION_METHODS
    );
    return response.data;
  },

  /**
   * Select authentication method for 2FA
   */
  async selectAuthenticationMethod(data: SelectAuthenticationMethodRequest): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.SELECT_AUTH_METHOD, data);
  },

  /**
   * Verify Email OTP during login
   */
  async verifyEmailOtp(data: VerifyEmailOtpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.VERIFY_EMAIL_OTP,
      data
    );

    if (response.data.accessToken && response.data.refreshToken) {
      tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      if (response.data.user) {
        tokenStorage.setUser(response.data.user);
      }
    }

    return response.data;
  },

  /**
   * Verify recovery code during 2FA
   */
  async verifyRecoveryCode(data: VerifyRecoveryCodeRequest): Promise<VerifyTwoFactorResponse> {
    const response = await apiClient.post<VerifyTwoFactorResponse>(
      AUTH_ENDPOINTS.VERIFY_RECOVERY_CODE,
      data
    );

    if (response.data.accessToken && response.data.refreshToken) {
      tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      if (response.data.user) {
        tokenStorage.setUser(response.data.user);
      }
    }

    return response.data;
  },

  // ==================== PASSWORD ====================

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
  },
};

export default authApi;
