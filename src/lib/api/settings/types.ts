/**
 * Settings API Types
 * 
 * Type definitions for application settings management.
 * All types are derived from the auto-generated OpenAPI schema.
 */

import type { components } from "@/modules/api-schema";

// ==================== SETTINGS TYPES ====================

/**
 * Public setting from API
 */
export type AppSetting = components["schemas"]["PublicSettingDto"];

/**
 * Map of setting key-value pairs within a group
 */
export interface AppSettingsMap {
  [key: string]: string;
}

/**
 * Settings grouped by category
 */
export interface AppSettingsGrouped {
  [group: string]: AppSettingsMap;
}
