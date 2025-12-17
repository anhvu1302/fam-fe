/**
 * Device ID Management
 * Generates and persists a unique device identifier
 * This is managed in token-storage for unified access
 */

const DEVICE_ID_KEY = "device_id";

/**
 * Get or create device ID
 * This is used for the initial login request before we get one from backend
 */
export function getOrCreateDeviceId(): string {
    if (typeof window === "undefined") {
        return '';
    }

    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
        // Generate a new device ID if not exists
        deviceId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
}

/**
 * Get current device ID (prefer using tokenStorage.getDeviceId())
 */
export function getDeviceId(): string | null {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem(DEVICE_ID_KEY);
}
