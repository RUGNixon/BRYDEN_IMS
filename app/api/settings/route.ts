import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

// Ensure app_settings table exists and has a default record
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

        -- Insert default settings row if table is empty
        INSERT INTO app_settings (id, language, tax_payment_schedule, theme, admin_email, admin_password_hash)
        VALUES (1, 'en', 'monthly', 'light', 'admin@brydenims.com', 'admin123')
        ON CONFLICT (id) DO NOTHING;
    `);
}

/**
 * GET /api/settings
 * Retrieves the current system settings and admin email (never exposes password)
 */
export async function GET() {
    try {
        await ensureSettingsTable();

        const result = await pool.query(`
            SELECT id, language, tax_payment_schedule, theme, admin_email, updated_at
            FROM app_settings
            WHERE id = 1
            LIMIT 1;
        `);

        if (result.rows.length === 0) {
            return NextResponse.json({
                language: "en",
                taxPaymentSchedule: "monthly",
                theme: "light",
                email: "admin@brydenims.com",
            });
        }

        const row = result.rows[0];
        return NextResponse.json({
            language: row.language || "en",
            taxPaymentSchedule: row.tax_payment_schedule || "monthly",
            theme: row.theme || "light",
            email: row.admin_email || "admin@brydenims.com",
            updatedAt: row.updated_at,
        });
    } catch (error) {
        console.error("GET /api/settings error:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings." },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/settings
 * Updates general settings: language, tax payment schedule, and theme
 */
export async function PUT(req: Request) {
    try {
        await ensureSettingsTable();

        const body = await req.json();
        const { language, taxPaymentSchedule, theme } = body;

        // Validation
        const validLanguages = ["en", "fr", "rw"];
        const validSchedules = ["monthly", "quarterly"];
        const validThemes = ["light", "dark"];

        const targetLanguage = validLanguages.includes(language) ? language : "en";
        const targetSchedule = validSchedules.includes(taxPaymentSchedule) ? taxPaymentSchedule : "monthly";
        const targetTheme = validThemes.includes(theme) ? theme : "light";

        const result = await pool.query(
            `
            UPDATE app_settings
            SET 
                language = COALESCE($1, language),
                tax_payment_schedule = COALESCE($2, tax_payment_schedule),
                theme = COALESCE($3, theme),
                updated_at = NOW()
            WHERE id = 1
            RETURNING language, tax_payment_schedule, theme, admin_email, updated_at;
            `,
            [targetLanguage, targetSchedule, targetTheme]
        );

        const row = result.rows[0];
        return NextResponse.json({
            success: true,
            message: "Settings updated successfully.",
            settings: {
                language: row.language,
                taxPaymentSchedule: row.tax_payment_schedule,
                theme: row.theme,
                email: row.admin_email,
                updatedAt: row.updated_at,
            },
        });
    } catch (error) {
        console.error("PUT /api/settings error:", error);
        return NextResponse.json(
            { error: "Failed to update settings." },
            { status: 500 }
        );
    }
}
