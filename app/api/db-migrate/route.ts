import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

/**
 * GET /api/db-migrate
 * Adds optional contact columns (phone, email) to sales, purchases, and expenses.
 * Also adds selling_price column to purchases.
 * Safe to run multiple times — uses ADD COLUMN IF NOT EXISTS.
 */
export async function GET() {
    try {
        await pool.query(`
            -- Contacts for sales (client)
            ALTER TABLE sales
                ADD COLUMN IF NOT EXISTS phone TEXT,
                ADD COLUMN IF NOT EXISTS email TEXT;

            -- Contacts for purchases (supplier)
            ALTER TABLE purchases
                ADD COLUMN IF NOT EXISTS phone TEXT,
                ADD COLUMN IF NOT EXISTS email TEXT,
                ADD COLUMN IF NOT EXISTS selling_price NUMERIC(10,2);

            -- Contacts for expenses (payee / company)
            ALTER TABLE expenses
                ADD COLUMN IF NOT EXISTS phone TEXT,
                ADD COLUMN IF NOT EXISTS email TEXT;
        `);

        return NextResponse.json({ message: "Migration applied successfully." });
    } catch (error) {
        console.error("DB Migrate error:", error);
        return NextResponse.json({ error: "Migration failed." }, { status: 500 });
    }
}
