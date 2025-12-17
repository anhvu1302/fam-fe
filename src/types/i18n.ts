/**
 * Internationalization (i18n) Types
 * 
 * Type definitions for language and translation management.
 */

/**
 * Supported language codes
 */
export type LanguageCode = "en" | "vi";

/**
 * Translation key-value pairs
 */
export interface TranslationResource {
  [key: string]: string | TranslationResource;
}

/**
 * Translation resources by language
 */
export interface TranslationResources {
  [language: string]: TranslationResource;
}
