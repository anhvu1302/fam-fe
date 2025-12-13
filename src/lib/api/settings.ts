import apiClient from "@/lib/axios-client";
import type { I_Return } from "@/types/api-response";
import type { AppSetting, AppSettingsGrouped, AppSettingsMap } from "@/types/settings";

const SETTINGS_ENDPOINTS = {
    GET_ALL_SETTINGS: "/api/settings/public",
};

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
            const response = await apiClient.get<I_Return<AppSetting[]>>(
                SETTINGS_ENDPOINTS.GET_ALL_SETTINGS
            );

            // Check if request was successful
            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch settings");
            }

            // Extract settings array from wrapper
            const settings = response.data.result || [];

            // Transform flat array to grouped object
            const grouped = this.groupSettingsByGroup(settings);

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
        return settings.reduce(
            (grouped, setting) => {
                if (!grouped[setting.group]) {
                    grouped[setting.group] = {};
                }
                grouped[setting.group][setting.key] = setting.value;
                return grouped;
            },
            {} as AppSettingsGrouped
        );
    }
}

export const settingsApi = new SettingsApi();
export default settingsApi;
