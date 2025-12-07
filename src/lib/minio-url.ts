import { envConfig } from "@/lib/env-config";
import type { UserInfo } from "@/types/auth";

/**
 * Utility function để tạo full MinIO/S3 URL từ file path
 * @param filePath - Đường dẫn tệp từ API (ví dụ: /bucket/path/file.jpg)
 * @returns Full URL hoặc undefined nếu không có filePath
 */
export function getMinioUrl(filePath: string | null | undefined): string | undefined {
    if (!filePath) {
        return undefined;
    }

    // Nếu filePath đã là full URL, trả về luôn
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        return filePath;
    }

    // Nếu có MinIO URL configured, ghép nó lại
    if (envConfig.NEXT_PUBLIC_MINIO_URL) {
        // Loại bỏ trailing slash từ MinIO URL
        const baseUrl = envConfig.NEXT_PUBLIC_MINIO_URL.replace(/\/$/, "");
        // Loại bỏ leading slash từ filePath nếu có
        const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
        return `${baseUrl}${path}`;
    }

    // Fallback: trả về file path như cũ
    return filePath;
}

/**
 * Get avatar URL from user object, handling both old (avatarUrl) and new (avatar) field names
 * @param user - User object
 * @returns Avatar URL or undefined
 */
export function getUserAvatarUrl(user: UserInfo | null | undefined): string | undefined {
    if (!user) {
        return undefined;
    }

    // Prefer new 'avatar' field, fallback to old 'avatarUrl' field
    const avatarPath = user.avatar || user.avatarUrl;
    return getMinioUrl(avatarPath);
}

/**
 * Kiểm tra xem URL có hợp lệ không
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
    if (!url) {
        return false;
    }

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
