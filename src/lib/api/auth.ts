import type { I_Return } from "@/types/api-response";
import type {
  AuthenticationMethodsResponse,
  AuthResponse,
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
    const response = await apiClient.post<I_Return<AuthResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Login failed");
    }

    const authData = response.data.result;

    // Save tokens if login successful without 2FA or email verification
    if (
      authData.accessToken &&
      authData.refreshToken &&
      !authData.requiresTwoFactor &&
      !authData.requiresEmailVerification
    ) {

      await tokenStorage.setTokens(
        authData.accessToken,
        authData.refreshToken,
        authData.accessTokenExpiresAt,
        authData.refreshTokenExpiresAt
      );
      // Save device ID if provided
      if (authData.deviceId) {
        tokenStorage.setDeviceId(authData.deviceId);
      }
    }

    return authData;
  },

  /**
   * Verify 2FA code after login
   */
  async verify2FA(data: VerifyTwoFactorRequest): Promise<AuthResponse> {
    const response = await apiClient.post<I_Return<AuthResponse>>(
      AUTH_ENDPOINTS.VERIFY_2FA,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "2FA verification failed");
    }

    const authData = response.data.result;

    // Save tokens after successful 2FA
    if (authData.accessToken && authData.refreshToken) {
      await tokenStorage.setTokens(
        authData.accessToken,
        authData.refreshToken,
        authData.accessTokenExpiresAt,
        authData.refreshTokenExpiresAt
      );
      // Save device ID if provided
      if (authData.deviceId) {
        tokenStorage.setDeviceId(authData.deviceId);
      }
    }

    return authData;
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await apiClient.post<I_Return<AuthResponse>>(
      AUTH_ENDPOINTS.REFRESH,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Token refresh failed");
    }

    const authData = response.data.result;

    // Update tokens
    if (authData.accessToken && authData.refreshToken) {
      await tokenStorage.setTokens(
        authData.accessToken,
        authData.refreshToken,
        authData.accessTokenExpiresAt,
        authData.refreshTokenExpiresAt
      );
    }

    return authData;
  },

  /**
   * Logout current session
   * Only clears tokens after successful logout
   */
  async logout(): Promise<void> {
    try {
      const deviceId = tokenStorage.getDeviceId();

      // Send device ID in both body and header for logout tracking
      const payload: { deviceId?: string } = {};
      const config: { headers: Record<string, string> } = {
        headers: {}
      };

      if (deviceId) {
        payload.deviceId = deviceId;
        config.headers["X-Device-Id"] = deviceId;
      }

      // Logout requires authentication - Authorization header will be added by axios interceptor
      const response = await apiClient.post<I_Return<void>>(
        AUTH_ENDPOINTS.LOGOUT,
        payload,
        config
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Logout failed");
      }

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
      const response = await apiClient.post<I_Return<void>>(
        AUTH_ENDPOINTS.LOGOUT_ALL,
        { exceptCurrentDevice }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Logout all failed");
      }
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

    const response = await apiClient.get<I_Return<unknown>>(
      AUTH_ENDPOINTS.ME,
      config
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get user info");
    }

    return response.data.result;
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
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<I_Return<ForgotPasswordResponse>>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to send password reset email");
    }

    return response.data.result;
  },

  /**
   * Verify reset token is valid
   */
  async verifyResetToken(data: VerifyResetTokenRequest): Promise<VerifyResetTokenResponse> {
    const response = await apiClient.post<I_Return<VerifyResetTokenResponse>>(AUTH_ENDPOINTS.VERIFY_RESET_TOKEN, data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to verify reset token");
    }

    return response.data.result;
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<I_Return<ResetPasswordResponse>>(AUTH_ENDPOINTS.RESET_PASSWORD, data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to reset password");
    }

    return response.data.result;
  },

  // ==================== 2FA MANAGEMENT ====================

  /**
   * Enable 2FA - Step 1: Get QR code and secret
   */
  async enable2FA(data: Enable2FARequest): Promise<Enable2FAResponse> {
    const response = await apiClient.post<I_Return<Enable2FAResponse>>(
      AUTH_ENDPOINTS.ENABLE_2FA,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to enable 2FA");
    }

    return response.data.result;
  },

  /**
   * Enable 2FA - Step 2: Confirm with TOTP code
   */
  async confirm2FA(data: Confirm2FARequest): Promise<Confirm2FAResponse> {
    const response = await apiClient.post<I_Return<Confirm2FAResponse>>(
      AUTH_ENDPOINTS.CONFIRM_2FA,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to confirm 2FA");
    }

    return response.data.result;
  },

  /**
   * Disable 2FA with password
   */
  async disable2FA(data: Disable2FARequest): Promise<Disable2FAResponse> {
    const response = await apiClient.post<I_Return<Disable2FAResponse>>(AUTH_ENDPOINTS.DISABLE_2FA, data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to disable 2FA");
    }

    return response.data.result;
  },

  /**
   * Disable 2FA with backup code (for locked out users)
   */
  async disable2FAWithBackup(data: DisableTwoFactorWithBackupRequest): Promise<Disable2FAResponse> {
    const response = await apiClient.post<I_Return<Disable2FAResponse>>(AUTH_ENDPOINTS.DISABLE_2FA_WITH_BACKUP, data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to disable 2FA with backup code");
    }

    return response.data.result;
  },

  /**
   * Get available authentication methods for 2FA
   */
  async getAuthenticationMethods(): Promise<AuthenticationMethodsResponse> {
    const response = await apiClient.get<I_Return<AuthenticationMethodsResponse>>(
      AUTH_ENDPOINTS.AUTHENTICATION_METHODS
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get authentication methods");
    }

    return response.data.result;
  },

  /**
   * Select authentication method for 2FA
   */
  async selectAuthenticationMethod(data: SelectAuthenticationMethodRequest): Promise<void> {
    const response = await apiClient.post<I_Return<void>>(
      AUTH_ENDPOINTS.SELECT_AUTH_METHOD,
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to select authentication method");
    }
  },

  /**
   * Verify Email OTP during login
   */
  async verifyEmailOtp(data: VerifyEmailOtpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<I_Return<AuthResponse>>(
      AUTH_ENDPOINTS.VERIFY_EMAIL_OTP,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Email OTP verification failed");
    }

    const authData = response.data.result;

    if (authData.accessToken && authData.refreshToken) {
      tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    }

    return authData;
  },

  /**
   * Verify recovery code during 2FA
   */
  async verifyRecoveryCode(data: VerifyRecoveryCodeRequest): Promise<VerifyTwoFactorResponse> {
    const response = await apiClient.post<I_Return<VerifyTwoFactorResponse>>(
      AUTH_ENDPOINTS.VERIFY_RECOVERY_CODE,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Recovery code verification failed");
    }

    const authData = response.data.result;

    if (authData.accessToken && authData.refreshToken) {
      tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    }

    return authData;
  },

  // ==================== PASSWORD ====================

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await apiClient.post<I_Return<ChangePasswordResponse>>(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to change password");
    }

    return response.data.result;
  },
};

export default authApi;
