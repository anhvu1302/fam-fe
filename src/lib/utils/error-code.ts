/**
 * Error Code Utilities
 * 
 * Helper functions for handling and translating error codes from API
 */

import type { I_ReturnFailure } from "../types/api";

/**
 * Extract error code from I_ReturnFailure response
 */
export function getErrorCode(error: I_ReturnFailure): string | undefined {
    return error.errors?.[0]?.code;
}

/**
 * Extract error message from I_ReturnFailure response
 */
export function getErrorMessage(error: I_ReturnFailure): string {
    const firstError = error.errors?.[0];
    return firstError?.message || error.message || "An error occurred";
}

/**
 * Get translation key for error code
 * Returns the translation key in format "errors.ERROR_CODE"
 */
export function getErrorTranslationKey(errorCode: string): string {
    return `errors.${errorCode}`;
}

/**
 * Format error for display
 * Useful for showing errors to users
 */
export function formatErrorForDisplay(error: I_ReturnFailure): {
    code?: string;
    message: string;
    translationKey?: string;
} {
    const code = getErrorCode(error);
    const message = getErrorMessage(error);

    return {
        code,
        message,
        translationKey: code ? getErrorTranslationKey(code) : undefined,
    };
}

/**
 * Check if error is a specific error code
 */
export function isErrorCode(error: I_ReturnFailure, errorCode: string): boolean {
    return getErrorCode(error) === errorCode;
}

/**
 * Check if error is one of multiple error codes
 */
export function isOneOfErrorCodes(error: I_ReturnFailure, errorCodes: string[]): boolean {
    const code = getErrorCode(error);
    return code ? errorCodes.includes(code) : false;
}
