import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

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
    const status = error.response?.status || 500;
    const code = error.code || "UNKNOWN_ERROR";

    // Map status code to user-friendly message
    const messageMap: Record<number, string> = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        408: "Request Timeout",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
    };

    const message = messageMap[status] || "Request Failed";

    // Chỉ trả về data từ response nếu đã được giải mã
    let safeData: unknown = undefined;
    if (error.response?.data) {
        // Nếu data là object có error/message thì giữ lại
        const data = error.response.data as Record<string, unknown>;
        if (data.error || data.message) {
            safeData = {
                error: data.error,
                message: data.message,
            };
        }
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
});

// Request Interceptor: Mã hóa body trước khi gửi đi
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
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

// Response Interceptor: Giải mã data khi nhận về
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
        return response;
    },
    (error: AxiosError) => {
        // Xử lý lỗi response đã mã hóa
        if (ENCRYPTION_ENABLED && error.response?.data) {
            if (isSecurePayload(error.response.data)) {
                const originalError = decryptData(error.response.data);
                if (originalError) {
                    error.response.data = originalError;
                }
            }
        }
        // Trả về lỗi đã được sanitize
        return Promise.reject(sanitizeError(error));
    }
); export default apiClient;
