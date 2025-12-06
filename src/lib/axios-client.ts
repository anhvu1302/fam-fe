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
    // If there's no response, treat as network error (status 0)
    const status = error.response?.status ?? 0;
    let code = error.code || "UNKNOWN_ERROR";

    // Normalize some known network/fetch error messages
    const msgLower = (error.message || "").toLowerCase();
    if (msgLower.includes("network error") || msgLower.includes("fetch failed") || msgLower.includes("failed to fetch")) {
        code = code || "ERR_NETWORK";
    }

    // Log a concise error message for debugging (avoid dumping possibly circular objects)
    console.error(
        `[API Error] ${code} ${status} ${error.config?.method || ""} ${error.config?.url || ""} - ${error.message}`
    );
    if (error.response?.data) {
        try {
            // Log response data separately (stringify safely)
            console.error("[API Error] response data:", JSON.stringify(error.response.data));
        } catch {
            console.error("[API Error] response data (unserializable)");
        }
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

        // Ưu tiên detail từ server (API trả về detail field)
        if (typeof data.detail === 'string') {
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
