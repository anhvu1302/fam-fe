/**
 * API Utility Functions
 * 
 * Generic wrapper functions for standardizing API responses across the application.
 * Provides type-safe error handling and response transformation.
 */

import type { I_Return, I_ReturnFailure, I_ReturnSuccess } from "../types/api";

interface ApiClientResponse<T = unknown> {
    data?: T;
    error?: {
        message?: string;
        code?: string | number;
        errors?: Array<{ code?: string; message?: string; details?: Record<string, unknown> }>;
        [key: string]: unknown;
    };
}

/**
 * Wrapper function to convert apiClient response to standardized I_Return type.
 * 
 * Handles:
 * - API errors from backend (4xx, 5xx)
 * - Missing or invalid data
 * - Successful responses
 * 
 * @template T - The success result type
 * @param promise - Promise from apiClient.POST/GET/etc
 * @returns Standardized I_Return<T> response
 * 
 * @example
 * ```typescript
 * const result = await wrapResponse<LoginResponse>(
 *   apiClient.POST("/api/auth/login", { body: args })
 * );
 * 
 * if (result.success) {
 *   const loginData = result.result;
 * } else {
 *   console.error(result.message, result.code);
 * }
 * ```
 */
export async function wrapResponse<T>(
    promise: Promise<ApiClientResponse<unknown>>
): Promise<I_Return<T>> {
    try {
        const { data, error } = await promise;

        // 1. Handle backend error (4xx, 5xx responses)
        if (error) {
            return {
                success: false,
                message: error.message || "An error occurred",
                errors: error.errors,
            } as I_ReturnFailure;
        }

        // 2. Handle case when data is empty or success is explicitly false
        if (!data || (typeof data === "object" && "success" in data && data.success === false)) {
            const responseData = data as { success?: boolean; message?: string };
            return {
                success: false,
                message: responseData?.message || "Request failed",
            } as I_ReturnFailure;
        }

        // 3. Return successful response
        const responseData = data as { result?: T; message?: string };
        return {
            success: true,
            result: responseData.result as T,
            message: responseData.message,
        } as I_ReturnSuccess<T>;
    } catch (err) {
        // Handle unexpected errors
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        return {
            success: false,
            message,
        } as I_ReturnFailure;
    }
}

/**
 * Helper function to extract result from I_Return if successful.
 * Throws error if response was not successful.
 * 
 * Useful for when you want to use try-catch pattern instead of checking .success
 * 
 * @template T - The result type
 * @param response - I_Return response
 * @returns The result if successful
 * @throws Error if not successful
 */
export function unwrapResult<T>(response: I_Return<T>): T {
    if (!response.success) {
        throw new Error(response.message || "Operation failed");
    }
    return response.result;
}

/**
 * Type guard to check if I_Return is successful
 * 
 * @example
 * ```typescript
 * const response = await wrapResponse<User>(promise);
 * if (isSuccess(response)) {
 *   console.log(response.result); // TypeScript knows this is I_ReturnSuccess<User>
 * }
 * ```
 */
export function isSuccess<T>(response: I_Return<T>): response is I_ReturnSuccess<T> {
    return response.success === true;
}

/**
 * Type guard to check if I_Return is a failure
 */
export function isFailure<T>(response: I_Return<T>): response is I_ReturnFailure {
    return response.success === false;
}
