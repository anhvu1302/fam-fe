import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
    decryptData,
    encryptData,
    ENCRYPTION_ENABLED,
    isSecurePayload,
} from "@/lib/crypto";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

interface ProxyParams {
    params: Promise<{ path: string[] }>;
}

async function handler(req: NextRequest, { params }: ProxyParams) {
    const { path } = await params;
    const targetPath = path.join("/");
    const url = `${BACKEND_URL}/${targetPath}${req.nextUrl.search}`;

    console.log(`[PROXY] ${req.method} ${url}`);
    console.log(`[PROXY] ENCRYPTION_ENABLED: ${ENCRYPTION_ENABLED}`);

    let body: string | null = null;
    const contentType = req.headers.get("content-type");

    if (req.method !== "GET" && contentType?.includes("application/json")) {
        try {
            const rawBody: unknown = await req.json();
            console.log(`[PROXY] Raw body received:`, rawBody);

            if (ENCRYPTION_ENABLED && isSecurePayload(rawBody)) {
                console.log(`[PROXY] Decrypting payload...`);
                const decrypted = decryptData(rawBody);
                if (!decrypted) {
                    console.error(`[PROXY] Decryption failed!`);
                    return NextResponse.json(
                        { error: "Invalid Signature or Data - Possible tampering" },
                        { status: 400 }
                    );
                }
                console.log(`[PROXY] Decrypted data:`, decrypted);
                body = JSON.stringify(decrypted);
            } else {
                console.log(`[PROXY] Sending unencrypted body`);
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
            console.log(`[PROXY] Using access token from cookie`);
        } else {
            // Fallback to Authorization header if provided
            const authHeader = req.headers.get("Authorization");
            if (authHeader) {
                headers["Authorization"] = authHeader;
                console.log(`[PROXY] Using Authorization header`);
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

        console.log(`[PROXY] Response status: ${backendRes.status}`);

        // Log response body for debugging
        const responseText = await backendRes.text();
        console.log(`[PROXY] Response body:`, responseText.substring(0, 200));

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
