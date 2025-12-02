/**
 * Token Storage Service
 * Handles secure storage of authentication tokens using httpOnly cookies
 */

const USER_KEY = "user_info";

export const tokenStorage = {
  /**
   * Save authentication tokens in httpOnly cookies
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set",
          accessToken,
          refreshToken,
        }),
      });

      // Also store in memory for immediate access
      if (typeof window !== "undefined") {
        sessionStorage.setItem("_has_session", "true");
      }
    } catch (error) {
      console.error("Failed to set tokens:", error);
    }
  },

  /**
   * Get access token from cookies
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch("/api/session");
      const data = await response.json();
      return data.accessToken || null;
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  },

  /**
   * Get refresh token from cookies
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const response = await fetch("/api/session");
      const data = await response.json();
      return data.refreshToken || null;
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
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
   * Clear all auth data
   */
  async clear(): Promise<void> {
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });

      if (typeof window !== "undefined") {
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem("_has_session");
      }
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
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

  /**
   * Verify authentication with server
   */
  async verifyAuthentication(): Promise<boolean> {
    try {
      const response = await fetch("/api/session");
      const data = await response.json();
      const isAuth = data.isAuthenticated || false;

      if (typeof window !== "undefined") {
        if (isAuth) {
          sessionStorage.setItem("_has_session", "true");
        } else {
          sessionStorage.removeItem("_has_session");
        }
      }

      return isAuth;
    } catch (error) {
      console.error("Failed to verify authentication:", error);
      return false;
    }
  },
};

