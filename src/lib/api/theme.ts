import type { I_Return } from "@/types/api-response";

import apiClient from "../axios-client";

export interface UserTheme {
  primaryColor: string | null;
  layout: string | null;
  theme: string | null;
  locale: string | null;
  sidebar: string | null;
  [key: string]: string | null;
}

export interface UpdateUserThemeRequest {
  primaryColor?: string;
  layout?: string;
  theme?: string;
  locale?: string;
  sidebar?: string;
  [key: string]: string | undefined;
}

const THEME_ENDPOINTS = {
  GET: "/api/auth/me/theme",
  UPDATE: "/api/auth/me/theme",
} as const;

/**
 * Theme API Service
 */
export const themeApi = {
  /**
   * Get current user's theme settings
   */
  async getUserTheme(): Promise<UserTheme> {
    const response = await apiClient.get<I_Return<UserTheme>>(THEME_ENDPOINTS.GET);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get user theme");
    }

    return response.data.result || { primaryColor: null, layout: null, theme: null, locale: null, sidebar: null };
  },

  /**
   * Update user's theme settings
   */
  async updateUserTheme(data: UpdateUserThemeRequest): Promise<UserTheme> {
    const response = await apiClient.put<I_Return<UserTheme>>(
      THEME_ENDPOINTS.UPDATE,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update user theme");
    }

    return response.data.result || { primaryColor: null, layout: null, theme: null, locale: null, sidebar: null };
  },
};

export default themeApi;
