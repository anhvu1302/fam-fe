/**
 * Sessions API Service
 * 
 * Provides session management methods for viewing and revoking user sessions.
 */

import apiClient from "../../api-client";
import type { I_Return } from "../../types/api";
import { tokenStorage } from "../../utils/token-storage";
import { wrapResponse } from "../api-utils";

import type { UserSession } from "./types";

/**
 * Sessions API Service
 */
export const sessionsApi = {
  /**
   * Get all active sessions for current user
   */
  async getAllSessions(): Promise<I_Return<UserSession[]>> {
    return wrapResponse<UserSession[]>(
      apiClient.GET("/api/auth/me/sessions")
    );
  },

  /**
   * Delete all sessions except current device
   * Requires x-device-id header to identify current device
   */
  async deleteAllSessions(): Promise<I_Return<void>> {
    const deviceId = tokenStorage.getDeviceId();

    return wrapResponse<void>(
      apiClient.DELETE("/api/auth/me/sessions", {
        headers: deviceId
          ? {
            "x-device-id": deviceId,
          }
          : undefined,
      })
    );
  },

  /**
   * Delete specific session by ID
   */
  async deleteSession(sessionId: string): Promise<I_Return<void>> {
    const deviceId = tokenStorage.getDeviceId();

    return wrapResponse<void>(
      apiClient.DELETE("/api/auth/me/sessions/{sessionId}", {
        params: {
          path: { sessionId },
        },
        headers: deviceId
          ? {
            "x-device-id": deviceId,
          }
          : undefined,
      })
    );
  },
};

export default sessionsApi;

// Re-export types for convenience
export type * from "./types";
