/**
 * API Response wrapper types based on new API structure
 */

/**
 * Base interface for return types with common properties.
 */
export interface I_ReturnBase {
    success: boolean;
    message?: string;
    code?: number | string;
}

/**
 * Success return type with result data.
 * @template T - The main result type
 * @template E - Additional properties to merge with the result (defaults to unknown)
 */
export interface I_ReturnSuccess<T, E = unknown> extends I_ReturnBase {
    success: true;
    result: T & E;
}

/**
 * Failure return type with error information.
 */
export interface I_ReturnFailure extends I_ReturnBase {
    success: false;
    message: string;
    code?: number | string;
    errors?: ApiErrorDetail[];
}

/**
 * Discriminated union type for function return values.
 * Provides type-safe handling of success and failure cases.
 *
 * @template T - The success result type (defaults to void)
 * @template E - Additional properties to merge with the result (defaults to unknown)
 *
 * @example
 * ```typescript
 * function fetchUser(id: string): I_Return<User> {
 *   try {
 *     const user = await getUser(id);
 *     return { success: true, result: user };
 *   } catch (error) {
 *     return { success: false, message: error.message, code: 'USER_NOT_FOUND' };
 *   }
 * }
 * ```
 */
export type I_Return<T = void, E = unknown> = I_ReturnSuccess<T, E> | I_ReturnFailure;

// ==================== Legacy Types (for backward compatibility) ====================

export interface ApiErrorDetail {
    message: string;
    code: string;
}

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    message: string;
    result: T;
}

export interface ApiErrorResponse {
    success: false;
    message?: string;
    errors?: ApiErrorDetail[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
