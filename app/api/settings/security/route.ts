import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

// Helper to ensure settings table exists
async function ensureSettingsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS app_settings (
            id SERIAL PRIMARY KEY,
            language VARCHAR(10) NOT NULL DEFAULT 'en',
            tax_payment_schedule VARCHAR(20) NOT NULL DEFAULT 'monthly',
            theme VARCHAR(10) NOT NULL DEFAULT 'light',
            admin_email VARCHAR(255) NOT NULL DEFAULT 'admin@brydenims.com',
            admin_password_hash VARCHAR(255) NOT NULL DEFAULT 'admin123',
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        INSERT INTO app_settings (id, language, tax_payment_schedule, theme, admin_email, admin_password_hash)
        VALUES (1, 'en', 'monthly', 'light', 'admin@brydenims.com', 'admin123')
        ON CONFLICT (id) DO NOTHING;
    `);
}

/**
 * POST /api/settings/security
 * Handles password updates and email updates
 */
export async function POST(req: Request) {
    try {
        await ensureSettingsTable();

        const body = await req.json();
        const { action } = body;

        // Fetch current credentials
        const currentRes = await pool.query(
            "SELECT admin_email, admin_password_hash FROM app_settings WHERE id = 1 LIMIT 1;"
        );

        if (currentRes.rows.length === 0) {
            return NextResponse.json({ error: "System settings record not found." }, { status: 404 });
        }

        const currentPassword = currentRes.rows[0].admin_password_hash;

        if (action === "update_password") {
            const { currentPasswordInput, newPassword, confirmPassword } = body;

            if (!currentPasswordInput || !newPassword || !confirmPassword) {
                return NextResponse.json(
                    { error: "All password fields are required." },
                    { status: 400 }
                );
            }

            // Verify current password
            if (currentPasswordInput !== currentPassword) {
                return NextResponse.json(
                    { error: "Incorrect current password. Please try again." },
                    { status: 400 }
                );
            }

            // Validate new password
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: "New password must be at least 6 characters long." },
                    { status: 400 }
                );
            }

            if (newPassword !== confirmPassword) {
                return NextResponse.json(
                    { error: "New password and confirmation do not match." },
                    { status: 400 }
                );
            }

            if (newPassword === currentPassword) {
                return NextResponse.json(
                    { error: "New password cannot be the same as the current password." },
                    { status: 400 }
                );
            }

            // Save new password
            await pool.query(
                "UPDATE app_settings SET admin_password_hash = $1, updated_at = NOW() WHERE id = 1;",
                [newPassword]
            );

            return NextResponse.json({
                success: true,
                message: "Password updated successfully.",
            });
        }

        if (action === "update_email") {
            const { newEmail, passwordConfirm } = body;

            if (!newEmail || !passwordConfirm) {
                return NextResponse.json(
                    { error: "New email and current password confirmation are required." },
                    { status: 400 }
                );
            }

            // Simple email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return NextResponse.json(
                    { error: "Please provide a valid email address." },
                    { status: 400 }
                );
            }

            // Verify password
            if (passwordConfirm !== currentPassword) {
                return NextResponse.json(
                    { error: "Incorrect password confirmation. Email was not changed." },
                    { status: 400 }
                );
            }

            // Update email
            await pool.query(
                "UPDATE app_settings SET admin_email = $1, updated_at = NOW() WHERE id = 1;",
                [newEmail.toLowerCase().trim()]
            );

            return NextResponse.json({
                success: true,
                message: "Email address updated successfully.",
                email: newEmail.toLowerCase().trim(),
            });
        }

        return NextResponse.json(
            { error: "Invalid action requested." },
            { status: 400 }
        );
    } catch (error) {
        console.error("POST /api/settings/security error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred while updating credentials." },
            { status: 500 }
        );
    }
}
