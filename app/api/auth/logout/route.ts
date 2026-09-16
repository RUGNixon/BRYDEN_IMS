import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/postgres";
import { SESSION_COOKIE_NAME, revokeSession, clearSessionCookie } from "@/lib/auth/session";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

        if (token) {
            await revokeSession(token);
        }

        const response = NextResponse.json({
            success: true,
            message: "Signed out successfully.",
        });

        clearSessionCookie(response);
        return response;
    } catch (error) {
        console.error("POST /api/auth/logout error:", error);
        const response = NextResponse.json(
            { error: "Failed to cleanly logout session." },
            { status: 500 }
        );
        clearSessionCookie(response);
        return response;
    }
}
