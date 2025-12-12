import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = await req.json();

        if (!accessToken || !refreshToken) {
            return NextResponse.json(
                { error: "Missing tokens" },
                { status: 400 }
            );
        }

        const response = NextResponse.json({ success: true });
        const _cookieStore = await cookies();

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

        // Set access token cookie
        response.cookies.set("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: accessTokenMaxAge,
        });

        // Set refresh token cookie
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
