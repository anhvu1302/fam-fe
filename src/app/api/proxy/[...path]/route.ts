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

    // Special handling for auth/set-token endpoint - no forwarding to backend
    if (targetPath === "auth/set-token") {
        try {
            const { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = await req.json() as {
                accessToken?: string;
                refreshToken?: string;
                accessTokenExpiresAt?: string;
                refreshTokenExpiresAt?: string;
            };

            if (!accessToken || !refreshToken) {
                return NextResponse.json(
                    { error: "Missing tokens" },
                    { status: 400 }
                );
            }

            const response = NextResponse.json({ success: true });

            // Calculate maxAge from API timestamps
            const now = new Date().getTime();
            let accessTokenMaxAge = 15 * 60; // Default 15 minutes
            let refreshTokenMaxAge = 7 * 24 * 60 * 60; // Default 7 days

            if (accessTokenExpiresAt) {
                const expiresAt = new Date(accessTokenExpiresAt).getTime();
                accessTokenMaxAge = Math.max(0, Math.floor((expiresAt - now) / 1000));
            }

            if (refreshTokenExpiresAt) {
                const expiresAt = new Date(refreshTokenExpiresAt).getTime();
                refreshTokenMaxAge = Math.max(0, Math.floor((expiresAt - now) / 1000));
            }

            // Set cookies
            response.cookies.set("access_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: accessTokenMaxAge,
            });

            response.cookies.set("refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: refreshTokenMaxAge,
            });

            return response;
        } catch (error) {
            return NextResponse.json(
                { error: "Failed to set tokens: " + (error instanceof Error ? error.message : String(error)) },
                { status: 500 }
            );
        }
    }

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
                    return NextResponse.json(
                        { error: "Invalid Signature or Data - Possible tampering" },
                        { status: 400 }
                    );
                }

                // Special handling for /auth/refresh endpoint - inject refreshToken from cookie
                if (targetPath.includes("auth/refresh")) {
                    const cookieStore = await cookies();
                    const refreshToken = cookieStore.get("refresh_token")?.value;
                    if (refreshToken) {
                        // Inject refresh token into the decrypted payload
                        const bodyWithToken = {
                            ...decrypted,
                            refreshToken: refreshToken
                        };
                        body = JSON.stringify(bodyWithToken);
                    } else {
                        body = JSON.stringify(decrypted);
                    }
                } else {
                    body = JSON.stringify(decrypted);
                }
            } else {
                // Special handling for /auth/refresh endpoint - inject refreshToken from cookie
                if (targetPath.includes("auth/refresh")) {
                    const cookieStore = await cookies();
                    const refreshToken = cookieStore.get("refresh_token")?.value;
                    if (refreshToken) {
                        // Inject refresh token into the payload
                        const bodyWithToken = {
                            ...(rawBody as Record<string, unknown>),
                            refreshToken: refreshToken
                        };
                        body = JSON.stringify(bodyWithToken);
                    } else {
                        body = JSON.stringify(rawBody);
                    }
                } else {
                    body = JSON.stringify(rawBody);
                }
            }
        } catch (error) {
            body = null;
        }
    }

    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // Get tokens from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;

        // For /auth/refresh, we don't send Authorization header
        // The refresh token is already injected into the body by the code above
        if (!targetPath.includes("auth/refresh")) {
            if (accessToken) {
                headers["Authorization"] = `Bearer ${accessToken}`;
            } else {
                // Fallback to Authorization header if provided
                const authHeader = req.headers.get("Authorization");
                if (authHeader) {
                    headers["Authorization"] = authHeader;
                }
            }
        }

        const customHeaders = [
            "X-Request-Id",
            "X-Correlation-Id",
            "X-Device-Id",
            "Accept-Language",
            "User-Agent",
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
                return NextResponse.json(
                    { error: "Invalid JSON response from backend: " + (e instanceof Error ? e.message : String(e)) },
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
            // Handle 204 No Content - cannot have body
            if (backendRes.status === 204) {
                return new NextResponse(null, {
                    status: 204,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }

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

        // Provide helpful error messages
        let message = "Failed to connect to backend service";
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message.includes("ECONNREFUSED")) {
                message = `Backend service unavailable at ${BACKEND_URL}. Make sure the backend server is running.`;
                statusCode = 503;
            } else if (error.message.includes("fetch failed")) {
                message = `Network error connecting to backend. URL: ${BACKEND_URL}`;
                statusCode = 502;
            }
        }

        const errorData = {
            error: "Backend Error",
            message: message,
            details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined,
        };

        if (ENCRYPTION_ENABLED) {
            const encryptedError = encryptData(errorData);
            return NextResponse.json(encryptedError, { status: statusCode });
        } else {
            return NextResponse.json(errorData, { status: statusCode });
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
