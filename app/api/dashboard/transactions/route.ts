import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT * FROM (
                -- Sales
                SELECT
                    'sale' AS type,
                    id,
                    client_name AS party,
                    product_name AS description,
                    size,
                    ROUND(quantity * selling_price, 2) AS amount,
                    status AS is_loan,
                    "order" AS is_order,
                    date
                FROM sales

                UNION ALL

                -- Purchases
                SELECT
                    'purchase' AS type,
                    id,
                    supplier_name AS party,
                    product_name AS description,
                    size,
                    ROUND(quantity * purchase_price, 2) AS amount,
                    false AS is_loan,
                    false AS is_order,
                    date
                FROM purchases

                UNION ALL

                -- Expenses
                SELECT
                    'expense' AS type,
                    id,
                    person_name AS party,
                    description,
                    '' AS size,
                    amount,
                    false AS is_loan,
                    false AS is_order,
                    date
                FROM expenses
            ) all_txns
            ORDER BY date::timestamp DESC
            LIMIT 10
        `);

        return NextResponse.json(
            result.rows.map(r => ({
                type: r.type,
                party: r.party,
                description: r.description,
                size: r.size,
                amount: Number(r.amount),
                isLoan: r.is_loan,
                isOrder: r.is_order,
                date: r.date,
            }))
        );

    } catch (error) {
        console.error("GET /api/dashboard/transactions error:", error);
        return NextResponse.json({ error: "Failed to fetch recent transactions." }, { status: 500 });
    }
}
