import apiClient from "../axios-client";

export interface UserSession {
  id: string;
  deviceId: string;
  deviceName: string | null;
  deviceType: string;
  ipAddress: string | null;
  location: string | null;
  browser: string | null;
  operatingSystem: string | null;
  lastLoginAt: string;
  lastActivityAt: string;
  isActive: boolean;
  isTrusted: boolean;
  isCurrentDevice: boolean;
}


const SESSIONS_ENDPOINTS = {
  GET_ALL: "/api/auth/me/sessions",
  DELETE_ALL: "/api/auth/me/sessions",
  DELETE_ONE: (sessionId: string) => `/api/auth/me/sessions/${sessionId}`,
} as const;

/**
 * Sessions API Service
 */
export const sessionsApi = {
  /**
   * Get all active sessions for current user
   */
  async getAllSessions(): Promise<UserSession[]> {
    const response = await apiClient.get<UserSession[]>(
      SESSIONS_ENDPOINTS.GET_ALL
    );
    const sessions = response.data;
    return sessions;
  },

  /**
   * Delete all sessions except current (optional)
   */
  async deleteAllSessions(exceptCurrent: boolean = true): Promise<void> {
    await apiClient.delete(SESSIONS_ENDPOINTS.DELETE_ALL, {
      params: { exceptCurrent },
    });
  },

  /**
   * Delete specific session by ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(SESSIONS_ENDPOINTS.DELETE_ONE(sessionId));
  },
};

export default sessionsApi;
