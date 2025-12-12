import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

import type { ApiSuccessResponse } from "@/types/api-response";

import { generateAppSignature } from "./app-signature";
import {
    decryptData,
    encryptData,
    ENCRYPTION_ENABLED,
    isSecurePayload,
    SecurePayload,
} from "./crypto";

// ==================== CUSTOM API ERROR ====================
/**
 * Custom API Error - ẩn thông tin nhạy cảm
 */
export class ApiError extends Error {
    status: number;
    code: string;
    data: unknown;

    constructor(message: string, status: number, code: string, data?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.data = data;
        // Không lưu stack trace chi tiết trong production
        if (process.env.NODE_ENV === "production") {
            this.stack = undefined;
        }
    }
}

/**
 * Chuyển đổi AxiosError thành ApiError an toàn
 */
const sanitizeError = (error: AxiosError): ApiError => {
    // If there's no response, treat as network error (status 0)
    const status = error.response?.status ?? 0;
    let code = error.code || "UNKNOWN_ERROR";

    // Normalize some known network/fetch error messages
    const msgLower = (error.message || "").toLowerCase();
    if (msgLower.includes("network error") || msgLower.includes("fetch failed") || msgLower.includes("failed to fetch")) {
        code = code || "ERR_NETWORK";
    }

    // Only log network/client errors in development
    // In production, do not log errors to console to prevent information leakage
    if (process.env.NODE_ENV === "development" && (status === 0 || error.code === "ERR_NETWORK")) {
        console.error(
            `[API Error] ${code} ${status} ${error.config?.method || ""} ${error.config?.url || ""} - ${error.message}`
        );
    }

    // Map status code to user-friendly message
    const messageMap: Record<number, string> = {
        400: "Dữ liệu không hợp lệ",
        401: "Chưa đăng nhập hoặc phiên đăng nhập hết hạn",
        403: "Không có quyền truy cập",
        404: "Không tìm thấy",
        408: "Yêu cầu quá thời gian",
        429: "Quá nhiều yêu cầu",
        500: "Lỗi máy chủ",
        502: "Lỗi kết nối",
        503: "Dịch vụ không khả dụng",
        504: "Timeout",
    };

    let message = messageMap[status] || "Yêu cầu thất bại";

    // Chỉ trả về data từ response nếu đã được giải mã
    let safeData: unknown = undefined;
    if (error.response?.data) {
        // Nếu data là object có error/message/detail thì giữ lại
        const data = error.response.data as Record<string, unknown>;

        // Handle new API error format: {success: false, message: "...", errors: [{message: "...", code: "..."}]}
        if (data.success === false) {
            // Ưu tiên message từ response
            if (typeof data.message === 'string') {
                message = data.message;
            }
            // Nếu có errors array, lấy message từ lỗi đầu tiên
            else if (Array.isArray(data.errors) && data.errors.length > 0) {
                const firstError = data.errors[0] as Record<string, unknown>;
                if (typeof firstError.message === 'string') {
                    message = firstError.message;
                }
            }
        }
        // Handle old error format
        else if (typeof data.detail === 'string') {
            message = data.detail;
        } else if (typeof data.message === 'string') {
            message = data.message;
        } else if (typeof data.error === 'string') {
            message = data.error;
        }

        // Giữ lại full response data để parse error code từ errors array
        if (data.errors || data.error || data.message || data.detail) {
            safeData = data;
        }
    }

    // Xử lý network / fetch errors
    if (code === "ERR_NETWORK" || code === "ECONNREFUSED" || msgLower.includes("fetch failed") || msgLower.includes("failed to fetch") || msgLower.includes("network error")) {
        message = "Không thể kết nối tới máy chủ";
    }

    return new ApiError(message, status, code, safeData);
};

// ==================== AXIOS CLIENT ====================
// Base URL trỏ về Next.js Proxy, không trỏ về Backend thật
const apiClient = axios.create({
    baseURL: "/api/proxy",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds
    withCredentials: true, // Important: send cookies with requests
});

// Request Interceptor: Mã hóa body trước khi gửi đi
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Token is automatically sent via httpOnly cookies
        // No need to manually add Authorization header

        // Thêm app signature headers để authenticate request
        // Cần tính signature từ full pathname (baseURL + url)
        const fullPathname = (config.baseURL || "") + (config.url || "");
        const signatureHeaders = generateAppSignature(fullPathname);
        config.headers.set("x-app-signature", signatureHeaders["x-app-signature"]);
        config.headers.set("x-app-timestamp", signatureHeaders["x-app-timestamp"]);

        // Chỉ mã hóa nếu có data (POST, PUT, PATCH) và encryption được bật
        if (config.data && ENCRYPTION_ENABLED) {
            // encryptData trả về SecurePayload { iv, content, h }
            const securePayload: SecurePayload = encryptData(config.data);
            config.data = securePayload;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(sanitizeError(error));
    }
);

// Flag to prevent multiple refresh attempts (Lock/Mutex pattern)
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

/**
 * Perform token refresh with lock mechanism
 * Returns promise that resolves when refresh is complete
 * Implements the standard refresh flow with mutex to prevent race conditions
 */
const performTokenRefresh = async (): Promise<void> => {
    // If already refreshing, return the existing promise (Key for avoiding race conditions!)
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    // Set lock
    isRefreshing = true;

    refreshPromise = (async () => {
        try {

            // Get stored device ID for refresh request
            let deviceId: string | null = null;
            if (typeof window !== 'undefined') {
                deviceId = localStorage.getItem('device_id');
            }

            // Prepare refresh payload
            let refreshPayload: Record<string, unknown> | SecurePayload = deviceId ? { deviceId } : {};

            // Encrypt payload if encryption is enabled
            if (ENCRYPTION_ENABLED) {
                refreshPayload = encryptData(refreshPayload);
            }

            const signaturePath = '/api/proxy/api/auth/refresh';

            const response = await fetch(signaturePath, {
                method: 'POST',
                credentials: 'include', // Important: Send cookies including refresh_token
                headers: {
                    'Content-Type': 'application/json',
                    ...generateAppSignature(signaturePath),
                },
                body: JSON.stringify(refreshPayload),
            });

            if (response.ok) {
                const responseData = await response.json();

                let data = responseData;
                if (ENCRYPTION_ENABLED && isSecurePayload(responseData)) {
                    data = decryptData(responseData);
                }

                if (data && typeof data === 'object' && 'success' in data && data.success === true && 'result' in data) {
                    data = data.result;
                }

                if (data.accessToken && data.refreshToken) {
                    const setTokenPath = '/api/proxy/auth/set-token';
                    const setTokenResponse = await fetch(setTokenPath, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            ...generateAppSignature(setTokenPath),
                        },
                        body: JSON.stringify({
                            accessToken: data.accessToken,
                            refreshToken: data.refreshToken,
                            accessTokenExpiresAt: data.accessTokenExpiresAt,
                            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
                        }),
                    });

                    if (!setTokenResponse.ok) {
                        throw new Error('Failed to save refreshed tokens');
                    }

                    if (data.deviceId && typeof window !== 'undefined') {
                        localStorage.setItem('device_id', data.deviceId);
                    }

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('_has_session', 'true');
                        localStorage.setItem('_last_token_refresh', Date.now().toString());
                        localStorage.setItem('_auth_timestamp', Date.now().toString());
                    }

                    // Process all queued requests
                    processQueue();
                    return;
                }

                throw new Error('Missing tokens in refresh response');
            }

            throw new Error(`Token refresh failed with status: ${response.status}`);
        } catch (error) {
            // Reject all queued requests
            processQueue(error);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('_has_session');
                localStorage.removeItem('_auth_timestamp');
                window.location.href = '/login';
            }
            throw error;
        } finally {
            // Release lock
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

// Response Interceptor: Giải mã data khi nhận về và unwrap API response
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Kiểm tra nếu response có đủ 3 trường iv, content, h
        if (ENCRYPTION_ENABLED && isSecurePayload(response.data)) {
            const originalData = decryptData(response.data);

            // Nếu giải mã thất bại (do bị sửa đổi), reject
            if (originalData === null) {
                return Promise.reject(
                    new ApiError(
                        "Data Integrity Check Failed",
                        400,
                        "INTEGRITY_ERROR"
                    )
                );
            }

            response.data = originalData;
        }

        // Unwrap API response if it follows the new format {success, message, result}
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            const apiResponse = response.data as ApiSuccessResponse<unknown>;
            if (apiResponse.success === true && 'result' in apiResponse) {
                // Unwrap the result field
                response.data = apiResponse.result;
            }
        }

        return response;
    },
    async (error: AxiosError) => {
        // Xử lý lỗi response đã mã hóa
        if (ENCRYPTION_ENABLED && error.response?.data) {
            if (isSecurePayload(error.response.data)) {
                const originalError = decryptData(error.response.data);
                if (originalError) {
                    error.response.data = originalError;
                }
            }
        }

        const originalRequest = error.config;

        // Handle 401 Unauthorized - attempt token refresh (Reactive Approach)
        if (error.response?.status === 401 && originalRequest && !originalRequest.headers?.['X-Retry-After-Refresh']) {
            // Skip refresh for auth endpoints to prevent infinite loops
            if (originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/refresh') ||
                originalRequest.url?.includes('/auth/logout')) {
                return Promise.reject(sanitizeError(error));
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        // Retry the original request after token refresh
                        originalRequest.headers['X-Retry-After-Refresh'] = 'true';
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // This is the first 401 - start refresh process
            return performTokenRefresh()
                .then(() => {
                    // Retry the original request
                    originalRequest.headers['X-Retry-After-Refresh'] = 'true';
                    return apiClient(originalRequest);
                })
                .catch(() => {
                    return Promise.reject(sanitizeError(error));
                });
        }

        // Trả về lỗi đã được sanitize
        return Promise.reject(sanitizeError(error));
    }
); export default apiClient;
