import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
        // Query for Out of Stock Products
        const outOfStockRes = await pool.query(`
            SELECT id, name, size, quantity 
            FROM products 
            WHERE quantity = 0
            ORDER BY name ASC
        `);

        // Query for Low Stock Products (quantity > 0 and <= 20)
        const lowStockRes = await pool.query(`
            SELECT id, name, size, quantity 
            FROM products 
            WHERE quantity > 0 AND quantity <= 20
            ORDER BY quantity ASC, name ASC
        `);

        // Query for Overdue Loans (status = true, NOT an order, date older than 30 days)
        // Ensure "order" = false (or correctly filtered based on how we treat loans)
        const overdueLoansRes = await pool.query(`
            SELECT id, client_name AS "clientName", product_name AS "productName", size, quantity, date 
            FROM sales 
            WHERE status = true 
              AND "order" = false
              AND date::timestamp < NOW() - INTERVAL '30 days'
            ORDER BY date ASC
        `);

        return NextResponse.json({
            outOfStock: outOfStockRes.rows,
            lowStock: lowStockRes.rows,
            overdueLoans: overdueLoansRes.rows,
            totalNotifications: (outOfStockRes.rowCount || 0) + (lowStockRes.rowCount || 0) + (overdueLoansRes.rowCount || 0)
        });

    } catch (error) {
        console.error("GET /api/notifications error:", error);
        return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
    }
}
