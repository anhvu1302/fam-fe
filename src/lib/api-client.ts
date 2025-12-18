import createClient, { type Middleware } from "openapi-fetch";

import type { paths } from "@/modules/api-schema";

import { generateAppSignature } from "./utils/app-signature";
import {
    decryptData,
    encryptData,
    ENCRYPTION_ENABLED,
    isSecurePayload,
    SecurePayload,
} from "./utils/crypto";
import { getDeviceId } from "./utils/device-id";

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

// ==================== TOKEN REFRESH LOGIC ====================
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
 */
const performTokenRefresh = async (): Promise<void> => {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = (async () => {
        try {
            let deviceId: string | null = null;
            if (typeof window !== 'undefined') {
                deviceId = localStorage.getItem('device_id');
            }

            let refreshPayload: Record<string, unknown> | SecurePayload = deviceId ? { deviceId } : {};

            if (ENCRYPTION_ENABLED) {
                refreshPayload = encryptData(refreshPayload);
            }

            const signaturePath = '/proxy/api/auth/refresh';

            const response = await fetch(signaturePath, {
                method: 'POST',
                credentials: 'include',
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
                    const setTokenPath = '/proxy/auth/set-token';
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

                    processQueue();
                    return;
                }

                throw new Error('Missing tokens in refresh response');
            }

            throw new Error(`Token refresh failed with status: ${response.status}`);
        } catch (error) {
            processQueue(error);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('_has_session');
                localStorage.removeItem('_auth_timestamp');
                window.location.href = '/login';
            }
            throw error;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

// ==================== MIDDLEWARE ====================

/**
 * Request Middleware: Encrypt body and add app signature
 */
const requestMiddleware: Middleware = {
    async onRequest({ request }) {
        const url = new URL(request.url);
        const fullPathname = url.pathname;

        // Add app signature headers
        const signatureHeaders = generateAppSignature(fullPathname);
        request.headers.set("x-app-signature", signatureHeaders["x-app-signature"]);
        request.headers.set("x-app-timestamp", signatureHeaders["x-app-timestamp"]);

        // Add device ID header
        const deviceId = getDeviceId();
        if (deviceId) {
            request.headers.set("x-device-id", deviceId);
        }

        // Encrypt body if enabled and body exists
        if (ENCRYPTION_ENABLED && request.body) {
            try {
                const bodyText = await new Response(request.body).text();
                const bodyData = JSON.parse(bodyText);
                const securePayload: SecurePayload = encryptData(bodyData);

                return new Request(request.url, {
                    ...request,
                    body: JSON.stringify(securePayload),
                });
            } catch {
                // If body can't be parsed, leave it as is
            }
        }

        return request;
    },

    async onResponse({ response, request }) {
        // Clone response để có thể đọc body nhiều lần
        const clonedResponse = response.clone();

        try {
            const responseData = await clonedResponse.json();

            // Decrypt if encrypted
            if (ENCRYPTION_ENABLED && isSecurePayload(responseData)) {
                const originalData = decryptData(responseData);

                if (originalData === null) {
                    throw new ApiError("Data Integrity Check Failed", 400, "INTEGRITY_ERROR");
                }

                // Return new response with decrypted data
                return new Response(JSON.stringify(originalData), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            }

            // Handle 401 - Token refresh logic
            if (response.status === 401) {
                const url = new URL(request.url);
                const AUTH_ENDPOINTS = [
                    '/auth/login',
                    '/auth/refresh',
                    '/auth/logout',
                    '/auth/verify-reset-token',
                    '/auth/forgot-password',
                    '/auth/disable-2fa',
                    '/auth/verify-2fa',
                    '/auth/change-password',
                ];

                // Skip refresh for auth endpoints
                const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));
                const hasRetryHeader = request.headers.get('X-Retry-After-Refresh') === 'true';

                if (!isAuthEndpoint && !hasRetryHeader) {
                    // If already refreshing, queue this request
                    if (isRefreshing) {
                        await new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        });

                        // Retry request
                        const retryRequest = new Request(request.url, {
                            ...request,
                            headers: {
                                ...Object.fromEntries(request.headers.entries()),
                                'X-Retry-After-Refresh': 'true',
                            },
                        });

                        return fetch(retryRequest);
                    }

                    // Start refresh process
                    try {
                        await performTokenRefresh();

                        // Retry original request
                        const retryRequest = new Request(request.url, {
                            ...request,
                            headers: {
                                ...Object.fromEntries(request.headers.entries()),
                                'X-Retry-After-Refresh': 'true',
                            },
                        });

                        return fetch(retryRequest);
                    } catch {
                        // Refresh failed, return original 401 response
                        // Don't throw, let client code handle it via success flag
                        return response;
                    }
                }
            }

            // Return response as-is, don't throw exception
            // Backend returns {success: true/false, message, result, errors}
            // Client code will check the success flag
            return response;
        } catch {
            // If response is not JSON, return as-is
            return response;
        }
    },
};

// ==================== API CLIENT ====================
const apiClient = createClient<paths>({
    baseUrl: "/proxy",
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
    },
});

// Register middleware
apiClient.use(requestMiddleware);

export default apiClient;
