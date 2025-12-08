import CryptoJS from "crypto-js";

const APP_SIGNATURE_KEY = process.env.NEXT_PUBLIC_APP_SIGNATURE_KEY || "default-signature-key";

/**
 * Generate app signature headers để authenticate request
 * Chỉ app chính thức mới có thể generate signature này
 */
export function generateAppSignature(url: string): {
    "x-app-signature": string;
    "x-app-timestamp": string;
} {
    const timestamp = Date.now().toString();
    const signature = CryptoJS.HmacSHA256(
        timestamp + url,
        APP_SIGNATURE_KEY
    ).toString();

    return {
        "x-app-signature": signature,
        "x-app-timestamp": timestamp,
    };
}

/**
 * Add app signature headers vào fetch options
 */
export function withAppSignature(
    url: string,
    options: RequestInit = {}
): RequestInit {
    const signatureHeaders = generateAppSignature(url);

    return {
        ...options,
        headers: {
            ...options.headers,
            ...signatureHeaders,
        },
    };
}
