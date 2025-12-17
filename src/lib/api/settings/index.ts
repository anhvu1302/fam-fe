/**
 * Settings API Service
 * 
 * Provides access to public application settings with caching support.
 * Settings are cached for 24 hours to reduce API calls.
 */

import apiClient from "../../api-client";
import { wrapResponse } from "../api-utils";

import type { AppSetting, AppSettingsGrouped, AppSettingsMap } from "./types";

/**
 * Settings API client with caching support
 */
class SettingsApi {
  private cache: AppSettingsGrouped | null = null;
  private cacheTimestamp: number = 0;
  private cacheDuration: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get all public settings with cache
   */
  async getAllSettings(): Promise<AppSettingsGrouped> {
    const now = Date.now();

    // Return cached data if still valid
    if (this.cache && now - this.cacheTimestamp < this.cacheDuration) {
      return this.cache;
    }

    try {
      const response = await wrapResponse<AppSetting[]>(
        apiClient.GET("/api/settings/public")
      );

      if (!response.success) {
        console.error("Failed to fetch settings:", response.message);
        // Return cached data even if expired if fetch fails
        if (this.cache) {
          return this.cache;
        }
        return {};
      }

      // Transform flat array to grouped object
      const grouped = this.groupSettingsByGroup(response.result || []);

      // Update cache
      this.cache = grouped;
      this.cacheTimestamp = now;

      return grouped;
    } catch (error) {
      console.error("Failed to fetch settings:", error);

      // Return cached data even if expired if fetch fails
      if (this.cache) {
        return this.cache;
      }

      // Return empty object if no cache available
      return {};
    }
  }

  /**
   * Get settings for specific group
   */
  async getSettingsByGroup(group: string): Promise<AppSettingsMap> {
    const allSettings = await this.getAllSettings();
    return allSettings[group] || {};
  }

  /**
   * Get specific setting value
   */
  async getSettingValue(key: string): Promise<string | null> {
    const allSettings = await this.getAllSettings();

    // Search through all groups
    for (const group of Object.values(allSettings)) {
      if (key in group) {
        return group[key];
      }
    }

    return null;
  }

  /**
   * Clear cache (useful when settings are updated)
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Transform flat array to grouped object
   */
  private groupSettingsByGroup(settings: AppSetting[]): AppSettingsGrouped {
    return settings.reduce((grouped, setting) => {
      const group = setting.group || "default";
      const key = setting.key || "";
      const value = setting.value || "";

      if (!grouped[group]) {
        grouped[group] = {};
      }
      grouped[group][key] = value;
      return grouped;
    }, {} as AppSettingsGrouped);
  }
}

export const settingsApi = new SettingsApi();
export default settingsApi;

// Re-export types for convenience
export type * from "./types";
