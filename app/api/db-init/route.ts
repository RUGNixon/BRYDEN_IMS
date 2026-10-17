import { NextResponse } from "next/server";
import pool from "@/lib/postgres";
import { ensureAuthTables } from "@/lib/auth/schema";
import { hashPassword } from "@/lib/auth/password";

export async function GET() {
    try {
        // 1. Core Inventory Tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                size TEXT NOT NULL DEFAULT '',
                category TEXT NOT NULL DEFAULT '',
                selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
                purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
                quantity INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                supplier_name TEXT NOT NULL,
                product_name TEXT NOT NULL,
                size TEXT NOT NULL DEFAULT '',
                purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
                quantity INTEGER NOT NULL DEFAULT 0,
                date TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                client_name TEXT NOT NULL,
                product_name TEXT NOT NULL,
                size TEXT NOT NULL DEFAULT '',
                quantity INTEGER NOT NULL DEFAULT 0,
                selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
                profits NUMERIC(10,2) NOT NULL DEFAULT 0,
                vat NUMERIC(10,2) NOT NULL DEFAULT 0,
                status BOOLEAN NOT NULL DEFAULT FALSE,
                "order" BOOLEAN NOT NULL DEFAULT FALSE,
                date TEXT NOT NULL,
                phone TEXT,
                email TEXT
            );

            -- Ensure columns exist for older installations
            ALTER TABLE sales ADD COLUMN IF NOT EXISTS profits NUMERIC(10,2) NOT NULL DEFAULT 0;
            ALTER TABLE sales ADD COLUMN IF NOT EXISTS vat NUMERIC(10,2) NOT NULL DEFAULT 0;
            ALTER TABLE sales ADD COLUMN IF NOT EXISTS phone TEXT;
            ALTER TABLE sales ADD COLUMN IF NOT EXISTS email TEXT;

            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                person_name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                amount NUMERIC(10,2) NOT NULL DEFAULT 0,
                date TEXT NOT NULL
            );

            -- Create trigger for self-populating profits and VAT
            CREATE OR REPLACE FUNCTION calculate_sales_profit()
            RETURNS TRIGGER AS $$
            DECLARE
                product_cp NUMERIC(10,2);
            BEGIN
                -- Find the purchase price of the product
                SELECT purchase_price INTO product_cp
                FROM products
                WHERE LOWER(name) = LOWER(NEW.product_name) AND size = NEW.size
                LIMIT 1;

                -- If product found, calculate profit
                IF FOUND THEN
                    NEW.profits := (NEW.selling_price - product_cp) * NEW.quantity;
                ELSE
                    NEW.profits := 0;
                END IF;

                -- Calculate VAT: selling_price - (selling_price / (1 + 18/100)), per unit × quantity
                NEW.vat := ROUND((NEW.selling_price - (NEW.selling_price / 1.18)) * NEW.quantity, 2);

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Drop trigger if exists and recreate to ensure it's up to date
            DROP TRIGGER IF EXISTS sales_profit_trigger ON sales;
            
            CREATE TRIGGER sales_profit_trigger
            BEFORE INSERT OR UPDATE ON sales
            FOR EACH ROW
            EXECUTE FUNCTION calculate_sales_profit();

            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                reminder_date DATE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- App Settings Table
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

        // 2. Authentication Tables (users, user_sessions, auth_audit_logs)
        await ensureAuthTables();

        // 3. Ensure Default Admin exists in users table
        const adminCheck = await pool.query(
            "SELECT id FROM users WHERE role = 'admin' LIMIT 1;"
        );

        if (adminCheck.rows.length === 0) {
            const adminPasswordHash = await hashPassword("admin123");
            await pool.query(
                `
                INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
                VALUES ('System Administrator', 'admin@brydenims.com', $1, 'admin', 'active', NOW(), NOW())
                ON CONFLICT (email) DO NOTHING;
                `,
                [adminPasswordHash]
            );
        }

        return NextResponse.json({
            success: true,
            message: "Database tables created and initialized successfully.",
            defaultAdmin: "admin@brydenims.com / admin123"
        });
    } catch (error) {
        console.error("DB Init error:", error);
        return NextResponse.json({ error: "Failed to initialize database." }, { status: 500 });
    }
}
