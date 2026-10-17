import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

// Ensure expenses table and all columns exist
async function ensureExpensesTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            person_name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            amount NUMERIC(10,2) NOT NULL DEFAULT 0,
            date TEXT NOT NULL
        );
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS phone TEXT;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS email TEXT;
    `);
}

// GET all expenses
export async function GET() {
    try {
        await ensureExpensesTable();
        const result = await pool.query(
            `SELECT id, person_name AS "personName", description, amount, date, phone, email
             FROM expenses
             ORDER BY date DESC, id DESC`
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("GET /api/expenses error:", error);
        return NextResponse.json({ error: "Failed to fetch expenses." }, { status: 500 });
    }
}

// POST new expense
export async function POST(req: NextRequest) {
    try {
        await ensureExpensesTable();
        const { personName, description, amount, date, phone, email } = await req.json();
        const result = await pool.query(
            `INSERT INTO expenses (person_name, description, amount, date, phone, email)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, person_name AS "personName", description, amount, date, phone, email`,
            [personName, description ?? "", amount, date, phone || null, email || null]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("POST /api/expenses error:", error);
        return NextResponse.json({ error: "Failed to record expense." }, { status: 500 });
    }
}
