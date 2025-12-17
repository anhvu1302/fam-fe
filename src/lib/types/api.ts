/**
 * Common API Types
 * 
 * Shared type definitions for API responses across the application.
 * These types provide a standardized way to handle success and failure cases.
 */

import type { components } from "@/modules/api-schema";

// ==================== RETURN TYPE PATTERNS ====================

/**
 * Base interface for return types with common properties.
 */
export interface I_ReturnBase {
    success: boolean;
    message?: string;
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
    errors?: components["schemas"]["ApiError"][];
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
 * async function fetchUser(id: string): Promise<I_Return<User>> {
 *   const result = await wrapResponse<User>(
 *     apiClient.GET(`/api/users/${id}`)
 *   );
 *   return result;
 * }
 * 
 * // Usage
 * const response = await fetchUser("123");
 * if (response.success) {
 *   console.log(response.result); // User type
 * } else {
 *   console.error(response.errors); // ApiError[]
 * }
 * ```
 */
export type I_Return<T = void, E = unknown> = I_ReturnSuccess<T, E> | I_ReturnFailure;
