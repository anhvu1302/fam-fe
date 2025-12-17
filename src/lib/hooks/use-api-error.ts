/**
 * Hook for handling API errors with automatic translation
 * 
 * Usage:
 * const { formatError } = useApiError();
 * 
 * try {
 *   const result = await apiCall();
 *   if (!result.success) {
 *     const { message, code } = formatError(result);
 *     messageApi.error(message);
 *   }
 * } catch (err) {
 *   const { message } = formatError(err);
 *   messageApi.error(message);
 * }
 */

import { ApiError } from "@/lib/api-client";
import { useI18n } from "@/lib/contexts/i18n-context";
import type { I_ReturnFailure } from "@/lib/types/api";
import {
    getErrorCode as getErrorCodeFromFailure,
    getErrorTranslationKey,
} from "@/lib/utils/error-code";

export interface FormattedError {
    code?: string;
    message: string;
    type: "error" | "warning" | "info";
    details?: Record<string, unknown>;
}

export function useApiError() {
    const { t } = useI18n();

    /**
     * Format API error response with automatic translation
     */
    const formatError = (error: unknown): FormattedError => {
        // Handle I_Return failure response
        if (isI_ReturnFailure(error)) {
            const code = getErrorCodeFromFailure(error);
            const translationKey = code
                ? getErrorTranslationKey(code)
                : "errors.DEFAULT";

            const translatedMessage = t(translationKey);
            const message = translatedMessage !== translationKey
                ? translatedMessage
                : error.message || t("errors.DEFAULT");

            return {
                code,
                message,
                type: getErrorType(code),
                details: getErrorDetails(error),
            };
        }

        // Handle ApiError from axios-client
        if (error instanceof ApiError) {
            const code = extractErrorCode(error);
            const translationKey = code
                ? getErrorTranslationKey(code)
                : "errors.DEFAULT";

            const translatedMessage = t(translationKey);
            const message = translatedMessage !== translationKey
                ? translatedMessage
                : error.message || t("errors.DEFAULT");

            return {
                code,
                message,
                type: getErrorType(code),
                details: extractErrorDetails(error),
            };
        }

        // Handle generic errors
        return {
            message: error instanceof Error ? error.message : t("errors.DEFAULT"),
            type: "error",
        };
    };

    return { formatError };
}

// ==================== Helper Functions ====================

function isI_ReturnFailure(value: unknown): value is I_ReturnFailure {
    return (
        typeof value === "object" &&
        value !== null &&
        "success" in value &&
        (value as Record<string, unknown>).success === false
    );
}

function getErrorDetails(error: I_ReturnFailure): Record<string, unknown> | undefined {
    const firstError = error.errors?.[0];
    return firstError ? { ...firstError } : undefined;
}

function extractErrorCode(error: ApiError): string | undefined {
    // Try data.errors[0].code first
    if (
        error.data &&
        typeof error.data === "object" &&
        "errors" in error.data &&
        Array.isArray((error.data as Record<string, unknown>).errors)
    ) {
        const errors = (error.data as Record<string, unknown>).errors as unknown[];
        const firstError = errors[0];
        if (
            firstError &&
            typeof firstError === "object" &&
            "code" in firstError
        ) {
            return (firstError as Record<string, unknown>).code as string;
        }
    }
    // Fallback to error.code
    return error.code as string | undefined;
}

function extractErrorDetails(error: ApiError): Record<string, unknown> | undefined {
    if (
        error.data &&
        typeof error.data === "object" &&
        "errors" in error.data &&
        Array.isArray((error.data as Record<string, unknown>).errors)
    ) {
        const errors = (error.data as Record<string, unknown>).errors as unknown[];
        const firstError = errors[0];
        if (firstError && typeof firstError === "object") {
            return { ...firstError };
        }
    }
    return undefined;
}

function getErrorType(code?: string): "error" | "warning" | "info" {
    if (!code) return "error";

    // Warning for auth-related but non-fatal errors
    if (
        code.includes("AUTH_EMAIL_NOT_VERIFIED") ||
        code.includes("AUTH_ACCOUNT_INACTIVE") ||
        code.includes("AUTH_ACCOUNT_LOCKED") ||
        code.includes("AUTH_SESSION_EXPIRED")
    ) {
        return "warning";
    }

    // Info for informational errors
    if (code.includes("RATE_LIMITED")) {
        return "info";
    }

    return "error";
}
