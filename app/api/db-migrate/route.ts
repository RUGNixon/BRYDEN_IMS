import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

/**
 * GET /api/db-migrate
 * Adds optional contact columns (phone, email) to sales, purchases, and expenses.
 * Also adds selling_price column to purchases.
 * Adds vat column to sales and updates the profit/VAT trigger.
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

            -- VAT column for sales
            ALTER TABLE sales
                ADD COLUMN IF NOT EXISTS vat NUMERIC(10,2) NOT NULL DEFAULT 0;

            -- Update trigger to also calculate VAT = selling_price - (selling_price / 1.18)
            CREATE OR REPLACE FUNCTION calculate_sales_profit()
            RETURNS TRIGGER AS $$
            DECLARE
                product_cp NUMERIC(10,2);
            BEGIN
                SELECT purchase_price INTO product_cp
                FROM products
                WHERE LOWER(name) = LOWER(NEW.product_name) AND size = NEW.size
                LIMIT 1;

                IF FOUND THEN
                    NEW.profits := (NEW.selling_price - product_cp) * NEW.quantity;
                ELSE
                    NEW.profits := 0;
                END IF;

                -- VAT: selling_price - (selling_price / (1 + 18/100)), per unit x quantity
                NEW.vat := ROUND((NEW.selling_price - (NEW.selling_price / 1.18)) * NEW.quantity, 2);

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS sales_profit_trigger ON sales;
            CREATE TRIGGER sales_profit_trigger
            BEFORE INSERT OR UPDATE ON sales
            FOR EACH ROW
            EXECUTE FUNCTION calculate_sales_profit();
        `);

        return NextResponse.json({ message: "Migration applied successfully." });
    } catch (error) {
        console.error("DB Migrate error:", error);
        return NextResponse.json({ error: "Migration failed." }, { status: 500 });
    }
}
