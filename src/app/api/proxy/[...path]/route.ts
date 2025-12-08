import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import CryptoJS from "crypto-js";

import {
    decryptData,
    encryptData,
    ENCRYPTION_ENABLED,
    isSecurePayload,
} from "@/lib/crypto";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";
const APP_SIGNATURE_KEY = process.env.NEXT_PUBLIC_APP_SIGNATURE_KEY || "default-signature-key";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:8001,http://localhost:3000").split(",");

// ==================== SECURITY VALIDATION ====================
/**
 * Validate request từ app chính thức (chặn external calls)
 */
function validateAppRequest(req: NextRequest): { valid: boolean; reason?: string } {
    // 1. Check App Signature Header (custom header chỉ app biết) - PRIORITY CHECK
    const appSignature = req.headers.get("x-app-signature");
    const timestamp = req.headers.get("x-app-timestamp");

    if (!appSignature || !timestamp) {
        return {
            valid: false,
            reason: "Missing app signature - Request must include authentication headers"
        };
    }

    // 2. Validate timestamp (chống replay)
    const requestTime = parseInt(timestamp, 10);
    const now = Date.now();
    const age = now - requestTime;

    if (isNaN(requestTime) || age > 60000 || age < -10000) {
        return {
            valid: false,
            reason: "Invalid or expired timestamp"
        };
    }

    // 3. Validate signature
    // Extract pathname từ URL (bỏ protocol, host, query params)
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;

    const expectedSignature = CryptoJS.HmacSHA256(
        timestamp + pathname,
        APP_SIGNATURE_KEY
    ).toString();

    if (appSignature !== expectedSignature) {
        console.warn('[PROXY] Signature mismatch:', {
            received: appSignature,
            expected: expectedSignature,
            timestamp,
            pathname,
            fullUrl: req.url
        });
        return {
            valid: false,
            reason: "Invalid signature - Request authentication failed"
        };
    }    // 4. Optional: Check Origin/Referer (chỉ warning, không block)
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    const hasValidOrigin = origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
    const hasValidReferer = referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed));

    if (!hasValidOrigin && !hasValidReferer) {
        console.warn('[PROXY] Origin/Referer warning:', { origin, referer });
        // Không block vì signature đã valid
    }

    return { valid: true };
}

// ==================== NONCE TRACKING ====================
// In-memory store để track nonce (phòng replay attack)
// Production nên dùng Redis hoặc database
const nonceStore = new Map<string, number>();
const NONCE_CLEANUP_INTERVAL = 300000; // 5 phút
const MAX_NONCE_AGE = 300000; // 5 phút

// Cleanup expired nonces định kỳ
setInterval(() => {
    const now = Date.now();
    for (const [nonce, timestamp] of nonceStore.entries()) {
        if (now - timestamp > MAX_NONCE_AGE) {
            nonceStore.delete(nonce);
        }
    }
}, NONCE_CLEANUP_INTERVAL);

/**
 * Kiểm tra và lưu nonce để chống replay attack
 * @returns true nếu nonce hợp lệ (chưa được dùng), false nếu đã bị replay
 */
function validateAndStoreNonce(nonce: string | undefined, timestamp: number | undefined): boolean {
    if (!nonce || !timestamp) {
        // Nếu không có nonce/timestamp, cho phép (backward compatibility)
        return true;
    }

    // Check nonce đã tồn tại chưa
    if (nonceStore.has(nonce)) {
        console.warn(`[PROXY] Replay attack detected! Nonce already used: ${nonce}`);
        return false;
    }

    // Lưu nonce với timestamp
    nonceStore.set(nonce, timestamp);
    return true;
}

interface ProxyParams {
    params: Promise<{ path: string[] }>;
}

async function handler(req: NextRequest, { params }: ProxyParams) {
    // ==================== SECURITY CHECK ====================
    // Validate request từ app (chặn external calls)
    const securityCheck = validateAppRequest(req);
    if (!securityCheck.valid) {
        console.warn(`[PROXY] Security check failed: ${securityCheck.reason}`);
        return NextResponse.json(
            {
                error: "Forbidden",
                message: "Direct API access is not allowed"
            },
            { status: 403 }
        );
    }

    const { path } = await params;
    const targetPath = path.join("/");
    const url = `${BACKEND_URL}/${targetPath}${req.nextUrl.search}`;

    let body: string | null = null;
    const contentType = req.headers.get("content-type");

    if (req.method !== "GET" && contentType?.includes("application/json")) {
        try {
            const rawBody: unknown = await req.json();

            if (ENCRYPTION_ENABLED && isSecurePayload(rawBody)) {
                // Validate nonce trước khi decrypt để chống replay attack
                const payload = rawBody as { nonce?: string; ts?: number };
                if (!validateAndStoreNonce(payload.nonce, payload.ts)) {
                    console.error(`[PROXY] Replay attack blocked!`);
                    return NextResponse.json(
                        {
                            error: "Replay Attack Detected",
                            message: "This request has already been processed"
                        },
                        { status: 403 }
                    );
                }

                const decrypted = decryptData(rawBody);
                if (!decrypted) {
                    console.error(`[PROXY] Decryption failed!`);
                    return NextResponse.json(
                        { error: "Invalid Signature or Data - Possible tampering" },
                        { status: 400 }
                    );
                }
                body = JSON.stringify(decrypted);
            } else {
                body = JSON.stringify(rawBody);
            }
        } catch (error) {
            console.error(`[PROXY] Error parsing body:`, error);
            body = null;
        }
    }

    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // Get token from cookies instead of Authorization header
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        } else {
            // Fallback to Authorization header if provided
            const authHeader = req.headers.get("Authorization");
            if (authHeader) {
                headers["Authorization"] = authHeader;
            }
        }

        const customHeaders = [
            "X-Request-Id",
            "X-Correlation-Id",
            "Accept-Language",
        ];
        customHeaders.forEach((headerName) => {
            const value = req.headers.get(headerName);
            if (value) {
                headers[headerName] = value;
            }
        });

        const backendRes = await fetch(url, {
            method: req.method,
            headers,
            body: body,
        });


        const responseText = await backendRes.text();
        const responseContentType = backendRes.headers.get("content-type");

        if (responseContentType?.includes("application/json")) {
            let backendData: unknown;
            try {
                backendData = JSON.parse(responseText);
            } catch (e) {
                console.error(`[PROXY] Failed to parse response JSON:`, e);
                return NextResponse.json(
                    { error: "Invalid JSON response from backend" },
                    { status: 502 }
                );
            }

            if (ENCRYPTION_ENABLED) {
                const encryptedResponse = encryptData(backendData);
                return NextResponse.json(encryptedResponse, {
                    status: backendRes.status,
                });
            } else {
                return NextResponse.json(backendData, { status: backendRes.status });
            }
        } else {
            return new NextResponse(responseText, {
                status: backendRes.status,
                headers: {
                    "Content-Type": responseContentType || "application/octet-stream",
                },
            });
        }
    } catch (error) {
        console.error("[PROXY] Error:", error);
        console.error("[PROXY] URL:", url);
        console.error("[PROXY] Method:", req.method);

        const errorData = {
            error: "Internal Server Error",
            message: error instanceof Error ? error.message : "Failed to connect to backend service",
        };

        if (ENCRYPTION_ENABLED) {
            const encryptedError = encryptData(errorData);
            return NextResponse.json(encryptedError, { status: 500 });
        } else {
            return NextResponse.json(errorData, { status: 500 });
        }
    }
}

export {
    handler as DELETE,
    handler as GET,
    handler as PATCH,
    handler as POST,
    handler as PUT,
};
