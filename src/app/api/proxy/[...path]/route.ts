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

    let body: string | null = null;
    const contentType = req.headers.get("content-type");

    if (req.method !== "GET" && contentType?.includes("application/json")) {
        try {
            const rawBody: unknown = await req.json();

            if (ENCRYPTION_ENABLED && isSecurePayload(rawBody)) {
                const decrypted = decryptData(rawBody);
                if (!decrypted) {
                    return NextResponse.json(
                        { error: "Invalid Signature or Data - Possible tampering" },
                        { status: 400 }
                    );
                }
                body = JSON.stringify(decrypted);
            } else {
                body = JSON.stringify(rawBody);
            }
        } catch {
            body = null;
        }
    }

    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
            headers["Authorization"] = authHeader;
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

        const responseContentType = backendRes.headers.get("content-type");

        if (responseContentType?.includes("application/json")) {
            const backendData: unknown = await backendRes.json();

            if (ENCRYPTION_ENABLED) {
                const encryptedResponse = encryptData(backendData);
                return NextResponse.json(encryptedResponse, {
                    status: backendRes.status,
                });
            } else {
                return NextResponse.json(backendData, { status: backendRes.status });
            }
        } else {
            const blob = await backendRes.blob();
            return new NextResponse(blob, {
                status: backendRes.status,
                headers: {
                    "Content-Type": responseContentType || "application/octet-stream",
                },
            });
        }
    } catch (error) {
        console.error("Proxy Error:", error);

        const errorData = {
            error: "Internal Server Error",
            message: "Failed to connect to backend service",
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
