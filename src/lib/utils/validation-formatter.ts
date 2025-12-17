/**
 * Utility functions for formatting validation messages with i18n
 */

export interface ValidationFormatter {
    minLength: (min: number) => string;
    maxLength: (max: number) => string;
}

/**
 * Create a formatter that replaces placeholders in message templates
 */
export function createValidationFormatter(t: (key: string) => string): ValidationFormatter {
    return {
        minLength: (min: number) => {
            return t("validation.minLength").replace("{min}", String(min));
        },
        maxLength: (max: number) => {
            return t("validation.maxLength").replace("{max}", String(max));
        },
    };
}
