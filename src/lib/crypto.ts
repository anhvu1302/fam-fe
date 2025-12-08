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
    iv: string;
    content: string;
    h: string;
    ts?: number;      // timestamp (milliseconds)
    nonce?: string;   // unique request identifier
}

// ==================== ENCRYPT ====================
export const encryptData = <T>(data: T): SecurePayload => {
    try {
        const jsonString = JSON.stringify(data);
        const iv = CryptoJS.lib.WordArray.random(16);

        const encrypted = CryptoJS.AES.encrypt(
            jsonString,
            CryptoJS.enc.Hex.parse(_ek()),
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            }
        );

        const contentStr = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
        const ivStr = iv.toString(CryptoJS.enc.Base64);

        // Thêm timestamp và nonce để chống replay attack
        const timestamp = Date.now();
        const nonce = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64);

        // HMAC bao gồm timestamp và nonce
        const mac = CryptoJS.HmacSHA256(
            ivStr + contentStr + timestamp + nonce,
            _mk()
        ).toString();

        return {
            iv: ivStr,
            content: contentStr,
            h: mac,
            ts: timestamp,
            nonce: nonce
        };
    } catch {
        return { iv: "", content: "", h: "" };
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
        const { iv, content, h, ts, nonce } = payload;
        if (!iv || !content || !h) return null;

        // Validate timestamp nếu có
        if (ts !== undefined) {
            const now = Date.now();
            const age = now - ts;

            // Reject nếu request quá cũ hoặc timestamp trong tương lai (clock skew)
            if (age > MAX_REQUEST_AGE || age < -60000) {
                console.warn(
                    `[CRYPTO] Request timestamp invalid. Age: ${age}ms, Max: ${MAX_REQUEST_AGE}ms`
                );
                return null;
            }
        }

        // Validate HMAC (bao gồm timestamp và nonce nếu có)
        const macInput = ts !== undefined && nonce !== undefined
            ? iv + content + ts + nonce
            : iv + content;

        const currentMac = CryptoJS.HmacSHA256(macInput, _mk()).toString();
        if (currentMac !== h) {
            console.warn('[CRYPTO] HMAC validation failed');
            return null;
        }

        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(content),
        });

        const decrypted = CryptoJS.AES.decrypt(
            cipherParams,
            CryptoJS.enc.Hex.parse(_ek()),
            {
                iv: CryptoJS.enc.Base64.parse(iv),
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
        typeof p.iv === "string" &&
        typeof p.content === "string" &&
        typeof p.h === "string";

    if (!hasBasicFields) return false;

    // Validate timestamp và nonce nếu có
    if (p.ts !== undefined && typeof p.ts !== "number") return false;
    if (p.nonce !== undefined && typeof p.nonce !== "string") return false;

    return true;
};
