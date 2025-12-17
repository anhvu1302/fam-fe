/**
 * Theme API Service
 * 
 * Provides methods for managing user theme preferences.
 */

import apiClient from "../../api-client";
import type { I_Return } from "../../types/api";
import { wrapResponse } from "../api-utils";

import type { UpdateThemeRequest, UpdateUserThemeRequest, UserTheme } from "./types";

/**
 * Theme API Service
 */
export const themeApi = {
  /**
   * Get current user's theme settings
   */
  async getUserTheme(): Promise<I_Return<UserTheme>> {
    return wrapResponse<UserTheme>(
      apiClient.GET("/api/auth/me/theme")
    );
  },

  /**
   * Update user's theme settings
   */
  async updateUserTheme(theme: UpdateUserThemeRequest): Promise<I_Return<UserTheme>> {
    return wrapResponse<UserTheme>(
      apiClient.PUT("/api/auth/me/theme", {
        body: theme as UpdateThemeRequest,
      })
    );
  },
};

export default themeApi;

// Re-export types for convenience
export type * from "./types";
