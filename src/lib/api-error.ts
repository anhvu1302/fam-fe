import { useI18n } from "@/lib/contexts/i18n-context";

export interface ApiError {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    errors?: Array<{
        code: string;
        detail?: string;
    }>;
}

/**
 * Hook để lấy localized error message từ API error
 */
export function useApiErrorTranslation() {
    const { t } = useI18n();

    const getErrorMessage = (error: unknown): string => {
        // Handle API error response
        if (error && typeof error === "object" && "errors" in error) {
            const apiError = error as ApiError;
            if (apiError.errors && apiError.errors.length > 0) {
                const firstError = apiError.errors[0];
                // Try to translate error code
                const translated = t(`errors.${firstError.code}`);
                // If no translation found, t() returns the key, so check if it's different from key
                if (translated !== `errors.${firstError.code}`) {
                    return translated;
                }
                // Fall back to detail if provided
                if (firstError.detail) {
                    return firstError.detail;
                }
            }

            // Check for title or detail in main error
            if (apiError.title) {
                const translated = t(`errors.${apiError.title.toUpperCase().replace(/\s+/g, "_")}`);
                if (translated !== `errors.${apiError.title.toUpperCase().replace(/\s+/g, "_")}`) {
                    return translated;
                }
            }
            if (apiError.detail) {
                return apiError.detail;
            }
        }

        // Handle standard Error
        if (error instanceof Error) {
            return error.message;
        }

        // Default error message
        return t("errors.DEFAULT");
    };

    return { getErrorMessage };
}

/**
 * Utility function (not a hook) để get error message nếu không có React context
 */
export function formatApiErrorCode(errorCode: string): string {
    // Format error code to key format
    // e.g., "AUTH_EMAIL_NOT_VERIFIED" -> "errors.AUTH_EMAIL_NOT_VERIFIED"
    return `errors.${errorCode}`;
}
