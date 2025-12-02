import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accessToken, refreshToken, action } = body;

        if (action === "set" && accessToken && refreshToken) {
            // Set tokens as httpOnly cookies
            const response = NextResponse.json({ success: true });

            response.cookies.set("access_token", accessToken, {
                ...COOKIE_OPTIONS,
                maxAge: ACCESS_TOKEN_MAX_AGE,
            });

            response.cookies.set("refresh_token", refreshToken, {
                ...COOKIE_OPTIONS,
                maxAge: REFRESH_TOKEN_MAX_AGE,
            });

            return response;
        }

        if (action === "clear") {
            // Clear all auth cookies
            const response = NextResponse.json({ success: true });

            response.cookies.delete("access_token");
            response.cookies.delete("refresh_token");

            return response;
        }

        if (action === "get") {
            // Get tokens from cookies
            const cookieStore = await cookies();
            const accessToken = cookieStore.get("access_token")?.value;
            const refreshToken = cookieStore.get("refresh_token")?.value;

            return NextResponse.json({
                accessToken: accessToken || null,
                refreshToken: refreshToken || null,
            });
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("[Session API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;
        const refreshToken = cookieStore.get("refresh_token")?.value;

        return NextResponse.json({
            accessToken: accessToken || null,
            refreshToken: refreshToken || null,
            isAuthenticated: !!accessToken,
        });
    } catch (error) {
        console.error("[Session API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
