import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
        // Fetch recent loans (status = true means loan)
        const loansRes = await pool.query(`
            SELECT 
                client_name, 
                product_name, 
                size, 
                (quantity * selling_price) as amount, 
                date 
            FROM sales 
            WHERE status = true 
            ORDER BY id DESC 
            LIMIT 10
        `);

        // Fetch recent orders ("order" = true)
        const ordersRes = await pool.query(`
            SELECT 
                client_name, 
                product_name, 
                size, 
                (quantity * selling_price) as amount, 
                date 
            FROM sales 
            WHERE "order" = true 
            ORDER BY id DESC 
            LIMIT 10
        `);

        return NextResponse.json({
            loans: loansRes.rows.map(r => ({
                clientName: r.client_name,
                productName: r.product_name,
                size: r.size,
                amount: Number(r.amount),
                date: r.date
            })),
            orders: ordersRes.rows.map(r => ({
                clientName: r.client_name,
                productName: r.product_name,
                size: r.size,
                amount: Number(r.amount),
                date: r.date
            }))
        });

    } catch (error) {
        console.error("GET /api/dashboard/lists error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard lists." }, { status: 500 });
    }
}
