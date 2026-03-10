import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

// GET all expenses
export async function GET() {
    try {
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
