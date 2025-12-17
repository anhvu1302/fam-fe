import CryptoJS from "crypto-js";

// ==================== CONFIG ====================
// Obfuscate key - tránh lộ plain text trong source
const _k = () => {
    const p = process.env.NEXT_PUBLIC_CRYPTO_KEY;
    if (!p) return "ZmFtLXN1cGVyLXNlY3JldC1rZXktMjAyNA==";
    return btoa(p);
};
const _s = atob(_k());

// Toggle mã hóa
export const ENCRYPTION_ENABLED =
    process.env.NEXT_PUBLIC_ENABLE_ENCRYPTION !== "false";

// Derived keys - computed at runtime
const _ek = () => CryptoJS.SHA256(_s + "ENC").toString();
const _mk = () => CryptoJS.SHA256(_s + "MAC").toString();

// ==================== TYPES ====================
export interface SecurePayload {
    i: string;        // IV
    d: string;        // encrypted data
    h: string;        // HMAC
    t?: number;       // timestamp
}

// ==================== ENCRYPT ====================
export const encryptData = <T>(data: T): SecurePayload => {
    try {
        const jsonString = JSON.stringify(data);
        const iv = CryptoJS.lib.WordArray.random(16);
        const timestamp = Date.now();

        const encrypted = CryptoJS.AES.encrypt(
            jsonString,
            CryptoJS.enc.Hex.parse(_ek()),
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            }
        );

        // Base64 encoding for safe JSON transport
        const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
        const ivStr = iv.toString(CryptoJS.enc.Base64);

        // Lightweight HMAC using SHA256 (can be optimized to SHA1 if needed)
        const mac = CryptoJS.HmacSHA256(
            ivStr + ciphertext + timestamp,
            _mk()
        ).toString();

        return {
            i: ivStr,
            d: ciphertext,
            h: mac,
            t: timestamp,
        };
    } catch {
        return { i: "", d: "", h: "" };
    }
};

// ==================== DECRYPT ====================
// Thời gian tối đa cho phép request (5 phút = 300000ms)
const MAX_REQUEST_AGE = parseInt(
    process.env.NEXT_PUBLIC_MAX_REQUEST_AGE || "300000",
    10
);

export const decryptData = <T>(payload: SecurePayload): T | null => {
    try {
        const { i, d, h, t } = payload;
        if (!i || !d || !h) return null;

        // Validate timestamp (chống replay attack)
        if (t !== undefined) {
            const now = Date.now();
            const age = now - t;

            if (age > MAX_REQUEST_AGE || age < -60000) {
                return null;
            }
        }

        // Validate HMAC
        const expectedMac = CryptoJS.HmacSHA256(i + d + t, _mk()).toString();
        if (expectedMac !== h) {
            return null;
        }

        // Decrypt using Base64 decoding
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(d),
        });

        const decrypted = CryptoJS.AES.decrypt(
            cipherParams,
            CryptoJS.enc.Hex.parse(_ek()),
            {
                iv: CryptoJS.enc.Base64.parse(i),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            }
        );

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return null;

        return JSON.parse(decryptedString) as T;
    } catch {
        return null;
    }
};

// ==================== HELPERS ====================
export const isSecurePayload = (data: unknown): data is SecurePayload => {
    if (!data || typeof data !== "object") return false;
    const p = data as Record<string, unknown>;
    const hasBasicFields =
        typeof p.i === "string" &&
        typeof p.d === "string" &&
        typeof p.h === "string";

    if (!hasBasicFields) return false;

    if (p.t !== undefined && typeof p.t !== "number") return false;
    return true;
};