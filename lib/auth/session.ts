import crypto from "crypto";
import pool from "@/lib/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "bryden_auth_session";
export const SESSION_EXPIRY_DAYS_DEFAULT = 7;
export const SESSION_EXPIRY_DAYS_REMEMBER = 30;

export interface SessionUser {
    id: number;
    name: string;
    email: string;
    role: "admin" | "manager";
    status: "active" | "suspended" | "pending";
    phone?: string | null;
    avatarUrl?: string | null;
    lastLoginAt?: string | null;
    createdAt: string;
}

/**
 * Generates a high-entropy 256-bit cryptographic token.
 */
export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes SHA-256 hash of a session token for secure database storage.
 */
export function hashSessionToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates and stores a new user session in PostgreSQL.
 */
export async function createSession(
    userId: number,
    options: {
        rememberMe?: boolean;
        ipAddress?: string | null;
        userAgent?: string | null;
    } = {}
): Promise<{ token: string; expiresAt: Date }> {
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);

    const days = options.rememberMe ? SESSION_EXPIRY_DAYS_REMEMBER : SESSION_EXPIRY_DAYS_DEFAULT;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await pool.query(
        `
        INSERT INTO user_sessions (id, user_id, expires_at, ip_address, user_agent, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW());
        `,
        [tokenHash, userId, expiresAt.toISOString(), options.ipAddress || null, options.userAgent || null]
    );

    return { token, expiresAt };
}

/**
 * Validates a session token, checks expiration, and retrieves the associated user.
 */
export async function validateSession(token: string): Promise<SessionUser | null> {
    if (!token || typeof token !== "string" || token.length < 32) {
        return null;
    }

    const tokenHash = hashSessionToken(token);

    const result = await pool.query(
        `
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.role, 
            u.status, 
            u.phone, 
            u.avatar_url, 
            u.last_login_at, 
            u.created_at,
            s.expires_at
        FROM user_sessions s
        INNER JOIN users u ON u.id = s.user_id
        WHERE s.id = $1
        LIMIT 1;
        `,
        [tokenHash]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    const expiresAt = new Date(row.expires_at);

    // Check expiration
    if (expiresAt.getTime() <= Date.now()) {
        await pool.query("DELETE FROM user_sessions WHERE id = $1;", [tokenHash]);
        return null;
    }

    // Check account status
    if (row.status !== "active") {
        return null;
    }

    return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role as "admin" | "manager",
        status: row.status,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
        createdAt: new Date(row.created_at).toISOString(),
    };
}

/**
 * Revokes an active session.
 */
export async function revokeSession(token: string): Promise<void> {
    if (!token) return;
    const tokenHash = hashSessionToken(token);
    await pool.query("DELETE FROM user_sessions WHERE id = $1;", [tokenHash]);
}

/**
 * Revokes all active sessions for a user (e.g. on password reset or account security event).
 */
export async function revokeAllUserSessions(userId: number): Promise<void> {
    await pool.query("DELETE FROM user_sessions WHERE user_id = $1;", [userId]);
}

/**
 * Sets secure HTTP-only session cookie on a NextResponse.
 */
export function setSessionCookie(res: NextResponse, token: string, expiresAt: Date): void {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });
}

/**
 * Clears the session cookie on a NextResponse.
 */
export function clearSessionCookie(res: NextResponse): void {
    res.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
    });
}

/**
 * Server-side helper to get current user from cookies in Next.js Server Components and API handlers.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return null;
        return await validateSession(token);
    } catch {
        return null;
    }
}
