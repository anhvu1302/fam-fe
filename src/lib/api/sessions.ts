import type { I_Return } from "@/types/api-response";

import apiClient from "../axios-client";
import { tokenStorage } from "../token-storage";

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
    const response = await apiClient.get<I_Return<UserSession[]>>(
      SESSIONS_ENDPOINTS.GET_ALL
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get sessions");
    }

    return response.data.result;
  },

  /**
   * Delete all sessions except current device
   * Requires x-device-id header to identify current device
   */
  async deleteAllSessions(): Promise<void> {
    const deviceId = tokenStorage.getDeviceId();

    const response = await apiClient.delete<I_Return<void> | void>(
      SESSIONS_ENDPOINTS.DELETE_ALL,
      {
        headers: deviceId ? {
          'x-device-id': deviceId,
        } : undefined,
      }
    );

    // Handle 204 No Content response (no body)
    if (response.status === 204 || !response.data) {
      return;
    }

    // Handle normal response with body
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete sessions");
      }
    }
  },

  /**
   * Delete specific session by ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    const deviceId = tokenStorage.getDeviceId();

    const response = await apiClient.delete<I_Return<void> | void>(
      SESSIONS_ENDPOINTS.DELETE_ONE(sessionId),
      {
        headers: deviceId ? {
          'x-device-id': deviceId,
        } : undefined,
      }
    );

    // Handle 204 No Content response (no body)
    if (response.status === 204 || !response.data) {
      return;
    }

    // Handle normal response with body
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete session");
      }
    }
  },
};

export default sessionsApi;
