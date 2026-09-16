import { NextResponse } from "next/server";
import pool from "@/lib/postgres";
import { ensureAuthTables } from "@/lib/auth/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
    try {
        await ensureAuthTables();

        // Rate limiting by client IP (30 per 15 min window for office environments)
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
        const rateCheck = checkRateLimit(`register:${ip}`, 30, 15 * 60 * 1000);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many registration attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.` },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { name, email, password, role = "manager", phone, rememberMe } = body;

        // 1. Validate Name
        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Full name must be at least 2 characters long." },
                { status: 400 }
            );
        }

        // 2. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const normalizedEmail = (email || "").toLowerCase().trim();
        if (!email || !emailRegex.test(normalizedEmail)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        // 3. Validate Role - STRICTLY 'admin' or 'manager'
        if (role !== "admin" && role !== "manager") {
            return NextResponse.json(
                { error: "Role must be either 'admin' or 'manager'." },
                { status: 400 }
            );
        }

        // 4. Validate Password Complexity
        if (!password || typeof password !== "string" || password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long." },
                { status: 400 }
            );
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);

        if (!hasUpper || !hasLower || !hasDigit) {
            return NextResponse.json(
                { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number." },
                { status: 400 }
            );
        }

        // 5. Check if user already exists
        const existing = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1;",
            [normalizedEmail]
        );

        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: "An account with this email address already exists. Please sign in instead." },
                { status: 409 }
            );
        }

        // 6. Hash password with cryptographic scrypt
        const hashedPassword = await hashPassword(password);

        // 7. Insert new user
        const result = await pool.query(
            `
            INSERT INTO users (name, email, password_hash, role, status, phone, created_at, updated_at, last_login_at)
            VALUES ($1, $2, $3, $4, 'active', $5, NOW(), NOW(), NOW())
            RETURNING id, name, email, role, status, phone, created_at;
            `,
            [name.trim(), normalizedEmail, hashedPassword, role, phone ? phone.trim() : null]
        );

        const newUser = result.rows[0];

        // 8. Create session
        const userAgent = req.headers.get("user-agent");
        const { token, expiresAt } = await createSession(newUser.id, {
            rememberMe: !!rememberMe,
            ipAddress: ip,
            userAgent,
        });

        // 9. Audit log
        await pool.query(
            `
            INSERT INTO auth_audit_logs (user_id, email, action, ip_address, details, created_at)
            VALUES ($1, $2, 'register', $3, $4, NOW());
            `,
            [newUser.id, normalizedEmail, ip, `Registered with role: ${role}`]
        );

        // 10. Prepare response with session cookie
        const response = NextResponse.json({
            success: true,
            message: "Account registered successfully!",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
                phone: newUser.phone,
                createdAt: newUser.created_at,
            },
        });

        setSessionCookie(response, token, expiresAt);
        return response;
    } catch (error) {
        console.error("POST /api/auth/register error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred during account registration. Please try again." },
            { status: 500 }
        );
    }
}
