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
        const overdueLoansRes = await pool.query(`
            SELECT id, client_name AS "clientName", product_name AS "productName", size, quantity, date 
            FROM sales 
            WHERE status = true 
              AND "order" = false
              AND date::timestamp < NOW() - INTERVAL '30 days'
            ORDER BY date ASC
        `);

        // Query for Due Notes (reminder_date is today or in the past)
        const dueNotesRes = await pool.query(`
            SELECT id, title, content, reminder_date AS "reminderDate", created_at AS "createdAt"
            FROM notes
            WHERE reminder_date IS NOT NULL
              AND reminder_date <= CURRENT_DATE
            ORDER BY reminder_date ASC, created_at DESC
        `);

        return NextResponse.json({
            outOfStock: outOfStockRes.rows,
            lowStock: lowStockRes.rows,
            overdueLoans: overdueLoansRes.rows,
            dueNotes: dueNotesRes.rows,
            totalNotifications:
                (outOfStockRes.rowCount || 0) +
                (lowStockRes.rowCount || 0) +
                (overdueLoansRes.rowCount || 0) +
                (dueNotesRes.rowCount || 0),
        });

    } catch (error) {
        console.error("GET /api/notifications error:", error);
        return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
    }
}
