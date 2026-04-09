import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
        // 1. Current Stock Worth
        const stockWorthRes = await pool.query(`
            SELECT COALESCE(SUM(quantity * purchase_price), 0) as stock_worth 
            FROM products
        `);

        // 2. Current Monthly Sales Amount
        // Sales date format from DB init: TEXT NOT NULL (ISO String typically used)
        const monthlySalesRes = await pool.query(`
            SELECT COALESCE(SUM(quantity * selling_price), 0) as monthly_sales 
            FROM sales 
            WHERE date::timestamp >= date_trunc('month', current_date)
              AND status = false -- Assuming status=true means loan, so standard sales are status=false
        `);

        // 3. Current Monthly Purchases Amount
        const monthlyPurchasesRes = await pool.query(`
            SELECT COALESCE(SUM(quantity * purchase_price), 0) as monthly_purchases 
            FROM purchases 
            WHERE date::timestamp >= date_trunc('month', current_date)
        `);

        // 4. Current Monthly Expenses Amount
        const monthlyExpensesRes = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as monthly_expenses 
            FROM expenses 
            WHERE date::timestamp >= date_trunc('month', current_date)
        `);

        return NextResponse.json({
            stockWorth: Number(stockWorthRes.rows[0].stock_worth),
            monthlySales: Number(monthlySalesRes.rows[0].monthly_sales),
            monthlyPurchases: Number(monthlyPurchasesRes.rows[0].monthly_purchases),
            monthlyExpenses: Number(monthlyExpensesRes.rows[0].monthly_expenses)
        });

    } catch (error) {
        console.error("GET /api/dashboard/stats error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard stats." }, { status: 500 });
    }
}
