/**
 * Theme API Types
 * 
 * Type definitions for user theme preferences management.
 * All types are derived from the auto-generated OpenAPI schema.
 */

import type { components } from "@/modules/api-schema";

// ==================== THEME TYPES ====================

/**
 * Update theme request from schema
 */
export type UpdateThemeRequest = components["schemas"]["UpdateUserThemeRequest"];

/**
 * Theme response from schema
 */
export type UserThemeResponse = components["schemas"]["UserThemeResponse"];

/**
 * User theme settings with dynamic properties
 */
export interface UserTheme {
  primaryColor: string | null;
  layout: string | null;
  theme: string | null;
  locale: string | null;
  sidebar: string | null;
  [key: string]: string | null;
}

/**
 * Request body for updating user theme
 */
export type UpdateUserThemeRequest = UpdateThemeRequest;
