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
                status BOOLEAN NOT NULL DEFAULT FALSE,
                "order" BOOLEAN NOT NULL DEFAULT FALSE,
                date TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                person_name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                amount NUMERIC(10,2) NOT NULL DEFAULT 0,
                date TEXT NOT NULL
            );
        `);

        return NextResponse.json({ message: "Database tables created successfully." });
    } catch (error) {
        console.error("DB Init error:", error);
        return NextResponse.json({ error: "Failed to initialize database." }, { status: 500 });
    }
}
