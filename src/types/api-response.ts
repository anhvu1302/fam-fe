/**
 * API Response wrapper types based on new API structure
 */

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    message: string;
    result: T;
}

export interface ApiErrorDetail {
    message: string;
    code: string;
}

export interface ApiErrorResponse {
    success: false;
    message?: string;
    errors?: ApiErrorDetail[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
