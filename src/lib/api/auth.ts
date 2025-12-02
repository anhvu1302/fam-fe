import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  VerifyTwoFactorRequest,
  VerifyTwoFactorResponse,
} from "@/types/auth";

import apiClient from "../axios-client";
import { tokenStorage } from "../token-storage";

const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  VERIFY_2FA: "/api/auth/verify-2fa",
  REFRESH: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
  LOGOUT_ALL: "/api/auth/logout-all",
  ME: "/api/auth/me",
} as const;

/**
 * Auth API Service
 */
export const authApi = {
  /**
   * Login with credentials
   * Returns requiresTwoFactor: true if 2FA is enabled
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      data
    );

    // Save tokens if login successful without 2FA
    if (response.data.accessToken && response.data.refreshToken && !response.data.requiresTwoFactor) {
      tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      if (response.data.user) {
        tokenStorage.setUser(response.data.user);
      }
    }

    return response.data;
  },

  /**
   * Verify 2FA code after login
   */
  async verify2FA(data: VerifyTwoFactorRequest): Promise<VerifyTwoFactorResponse> {
    const response = await apiClient.post<VerifyTwoFactorResponse>(
      AUTH_ENDPOINTS.VERIFY_2FA,
      data
    );

    // Save tokens after successful 2FA
    if (response.data.accessToken && response.data.refreshToken) {
      tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      if (response.data.user) {
        tokenStorage.setUser(response.data.user);
      }
    }

    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      AUTH_ENDPOINTS.REFRESH,
      data
    );

    // Update tokens
    if (response.data.accessToken && response.data.refreshToken) {
      tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } finally {
      // Clear tokens even if request fails
      tokenStorage.clear();
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
   */
  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<unknown> {
    const response = await apiClient.get(AUTH_ENDPOINTS.ME);
    if (response.data) {
      tokenStorage.setUser(response.data);
    }
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated();
  },
};

export default authApi;
