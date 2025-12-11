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
    const response = await apiClient.get<UserTheme>(THEME_ENDPOINTS.GET);
    return response.data;
  },

  /**
   * Update user's theme settings
   */
  async updateUserTheme(data: UpdateUserThemeRequest): Promise<UserTheme> {
    const response = await apiClient.put<UserTheme>(
      THEME_ENDPOINTS.UPDATE,
      data
    );
    return response.data;
  },
};

export default themeApi;
