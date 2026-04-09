import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
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
                status BOOLEAN NOT NULL DEFAULT FALSE,
                "order" BOOLEAN NOT NULL DEFAULT FALSE,
                date TEXT NOT NULL,
                phone TEXT,
                email TEXT
            );

            -- Ensure columns exist for older installations
            ALTER TABLE sales ADD COLUMN IF NOT EXISTS profits NUMERIC(10,2) NOT NULL DEFAULT 0;
            ALTER TABLE sales ADD COLUMN IF NOT EXISTS phone TEXT;
            ALTER TABLE sales ADD COLUMN IF NOT EXISTS email TEXT;

            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                person_name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                amount NUMERIC(10,2) NOT NULL DEFAULT 0,
                date TEXT NOT NULL
            );

            -- Create trigger for self-populating profits
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

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Drop trigger if exists and recreate to ensure it's up to date
            DROP TRIGGER IF EXISTS sales_profit_trigger ON sales;
            
            CREATE TRIGGER sales_profit_trigger
            BEFORE INSERT OR UPDATE ON sales
            FOR EACH ROW
            EXECUTE FUNCTION calculate_sales_profit();


        `);

        return NextResponse.json({ message: "Database tables created successfully." });
    } catch (error) {
        console.error("DB Init error:", error);
        return NextResponse.json({ error: "Failed to initialize database." }, { status: 500 });
    }
}
