import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
        let expensesRes = await pool.query(`
            SELECT 
                description as name, 
                COALESCE(SUM(amount), 0) as value 
            FROM expenses 
            WHERE date::timestamp >= date_trunc('month', current_date)
            GROUP BY description
            ORDER BY value DESC
        `);

        if (expensesRes.rows.length === 0) {
            expensesRes = await pool.query(`
                SELECT 
                    description as name, 
                    COALESCE(SUM(amount), 0) as value 
                FROM expenses 
                GROUP BY description
                ORDER BY value DESC
                LIMIT 10
            `);
        }

        return NextResponse.json(
            expensesRes.rows.map(r => ({
                name: r.name || "General Operating Expense",
                value: Number(r.value)
            }))
        );

    } catch (error) {
        console.error("GET /api/dashboard/expenses error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard expenses data." }, { status: 500 });
    }
}
