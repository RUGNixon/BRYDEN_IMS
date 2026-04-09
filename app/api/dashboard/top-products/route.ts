import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT 
                product_name,
                size,
                SUM(quantity) AS total_quantity,
                COUNT(*) AS times_sold,
                SUM(quantity * selling_price) AS total_revenue
            FROM sales
            WHERE status = false
              AND date::timestamp >= current_date - INTERVAL '6 months'
            GROUP BY product_name, size
            ORDER BY total_quantity DESC
            LIMIT 10
        `);

        return NextResponse.json(
            result.rows.map(r => ({
                productName: r.product_name,
                size: r.size,
                totalQuantity: Number(r.total_quantity),
                timesPurchased: Number(r.times_sold),
                totalSpent: Number(r.total_revenue),
            }))
        );

    } catch (error) {
        console.error("GET /api/dashboard/top-products error:", error);
        return NextResponse.json({ error: "Failed to fetch top products." }, { status: 500 });
    }
}
