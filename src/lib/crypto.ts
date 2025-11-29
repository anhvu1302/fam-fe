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
        const mac = CryptoJS.HmacSHA256(ivStr + contentStr, _mk()).toString();

        return { iv: ivStr, content: contentStr, h: mac };
    } catch {
        return { iv: "", content: "", h: "" };
    }
};

// ==================== DECRYPT ====================
export const decryptData = <T>(payload: SecurePayload): T | null => {
    try {
        const { iv, content, h } = payload;
        if (!iv || !content || !h) return null;

        const currentMac = CryptoJS.HmacSHA256(iv + content, _mk()).toString();
        if (currentMac !== h) return null;

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
    return (
        typeof p.iv === "string" &&
        typeof p.content === "string" &&
        typeof p.h === "string"
    );
};
