/**
 * Token Storage Service
 * Tokens are stored in httpOnly cookies managed by the proxy
 * This service handles user info, device ID, and authentication state
 * User info is kept in sync via /auth/me endpoint calls
 */

import { getDeviceId as _clearDeviceId } from "./device-id";

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
      const signaturePath = '/proxy/auth/set-token';
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
          // Use localStorage instead of sessionStorage for cross-tab sync
          const oldValue = localStorage.getItem("_has_session");
          localStorage.setItem("_has_session", "true");
          localStorage.setItem("_auth_timestamp", Date.now().toString());

          // Dispatch storage event manually (for other tabs to detect)
          window.dispatchEvent(new StorageEvent('storage', {
            key: '_has_session',
            oldValue: oldValue,
            newValue: 'true',
            url: window.location.href,
            storageArea: localStorage
          }));
        }
      }
    } catch (error) {
      console.error("Failed to set tokens:", error);
    }
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
      localStorage.removeItem(DEVICE_ID_KEY);
      localStorage.removeItem(_AUTH_STATE_KEY);

      // Manually trigger storage event for cross-tab sync
      const oldValue = localStorage.getItem("_has_session");
      localStorage.removeItem("_has_session");
      localStorage.removeItem("_auth_timestamp");

      // Dispatch storage event manually (for other tabs to detect)
      window.dispatchEvent(new StorageEvent('storage', {
        key: '_has_session',
        oldValue: oldValue,
        newValue: null,
        url: window.location.href,
        storageArea: localStorage
      }));
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
   * Check if user is authenticated (sync check from localStorage)
   * Using localStorage allows auth state to be shared across tabs
   */
  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return localStorage.getItem("_has_session") === "true";
    }
    return false;
  },
};

