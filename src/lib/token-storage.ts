/**
 * Token Storage Service
 * Tokens are stored in httpOnly cookies managed by the proxy
 * This service handles user info, device ID, and authentication state
 * User info is kept in sync via /auth/me endpoint calls
 */

import { getDeviceId as _clearDeviceId } from "./device-id";

const USER_KEY = "user_info";
const DEVICE_ID_KEY = "device_id";
const _AUTH_STATE_KEY = "_auth_state"; // Timestamp of last auth refresh

export const tokenStorage = {
  /**
   * Save authentication tokens in httpOnly cookies
   * Calls backend endpoint to set the cookies securely
   */
  async setTokens(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresAt?: string,
    refreshTokenExpiresAt?: string
  ): Promise<void> {
    try {
      const { generateAppSignature } = await import("./app-signature");

      // Call the proxy endpoint to store tokens in httpOnly cookies
      // This goes through the same proxy security as all other API calls
      const signaturePath = '/api/proxy/auth/set-token';
      const response = await fetch(signaturePath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...generateAppSignature(signaturePath),
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        }),
      });


      if (response.ok) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("_has_session", "true");
        }
      }
    } catch (error) {
      console.error("Failed to set tokens:", error);
    }
  },

  /**
   * Save user info in localStorage (not sensitive data)
   */
  setUser(user: unknown): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Get user info
   */
  getUser(): unknown | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /**
   * Save device ID from login response
   */
  setDeviceId(deviceId: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
  },

  /**
   * Get device ID
   */
  getDeviceId(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(DEVICE_ID_KEY);
    }
    return null;
  },

  /**
   * Clear all auth data - clears user info and device ID from localStorage
   * Tokens in httpOnly cookies will be cleared by backend logout
   */
  clear(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(DEVICE_ID_KEY);
      localStorage.removeItem(_AUTH_STATE_KEY);
      sessionStorage.removeItem("_has_session");
    }
  },

  /**
   * Update auth state timestamp (called when auth is refreshed)
   */
  updateAuthState(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(_AUTH_STATE_KEY, new Date().toISOString());
    }
  },

  /**
   * Get last auth refresh timestamp
   */
  getLastAuthRefresh(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(_AUTH_STATE_KEY);
    }
    return null;
  },

  /**
   * Check if user is authenticated (sync check from sessionStorage)
   */
  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("_has_session") === "true";
    }
    return false;
  },
};

