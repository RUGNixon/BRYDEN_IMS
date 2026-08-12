import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

// "Nearly out of stock" threshold
const LOW_STOCK_THRESHOLD = 20;

export async function GET() {
    try {
        const outOfStockRes = await pool.query(`
            SELECT name, size
            FROM products
            WHERE quantity = 0
            ORDER BY name ASC, size ASC
        `);

        const lowStockRes = await pool.query(`
            SELECT name, size, quantity
            FROM products
            WHERE quantity > 0 AND quantity <= $1
            ORDER BY quantity ASC, name ASC
        `, [LOW_STOCK_THRESHOLD]);

        return NextResponse.json({
            outOfStock: outOfStockRes.rows,
            lowStock: lowStockRes.rows,
        });

    } catch (error) {
        console.error("GET /api/analytics/stock-status error:", error);
        return NextResponse.json({ error: "Failed to fetch stock status." }, { status: 500 });
    }
}
