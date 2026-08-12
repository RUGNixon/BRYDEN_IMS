import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
        // 1. Current Stock Worth
        const stockWorthRes = await pool.query(`
            SELECT COALESCE(SUM(quantity * purchase_price), 0) as stock_worth 
            FROM products
        `);

        // Determine reference target date (current_date or max available date)
        const dateRefRes = await pool.query(`
            SELECT COALESCE(MAX(date::timestamp), current_date) as max_date FROM sales
        `);
        const maxDate = dateRefRes.rows[0].max_date;

        // 2. Monthly Sales Amount (target month or last 30 days fallback)
        let monthlySalesRes = await pool.query(`
            SELECT COALESCE(SUM(quantity * selling_price), 0) as monthly_sales 
            FROM sales 
            WHERE date::timestamp >= date_trunc('month', $1::timestamp)
              AND status = false
        `, [maxDate]);

        let monthlySales = Number(monthlySalesRes.rows[0].monthly_sales);
        if (monthlySales === 0) {
            const fallbackSales = await pool.query(`
                SELECT COALESCE(SUM(quantity * selling_price), 0) as monthly_sales 
                FROM sales 
                WHERE status = false
            `);
            monthlySales = Number(fallbackSales.rows[0].monthly_sales);
        }

        // 3. Monthly Purchases Amount
        let monthlyPurchasesRes = await pool.query(`
            SELECT COALESCE(SUM(quantity * purchase_price), 0) as monthly_purchases 
            FROM purchases 
            WHERE date::timestamp >= date_trunc('month', $1::timestamp)
        `, [maxDate]);

        let monthlyPurchases = Number(monthlyPurchasesRes.rows[0].monthly_purchases);
        if (monthlyPurchases === 0) {
            const fallbackPurchases = await pool.query(`
                SELECT COALESCE(SUM(quantity * purchase_price), 0) as monthly_purchases 
                FROM purchases
            `);
            monthlyPurchases = Number(fallbackPurchases.rows[0].monthly_purchases);
        }

        // 4. Monthly Expenses Amount
        let monthlyExpensesRes = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as monthly_expenses 
            FROM expenses 
            WHERE date::timestamp >= date_trunc('month', $1::timestamp)
        `, [maxDate]);

        let monthlyExpenses = Number(monthlyExpensesRes.rows[0].monthly_expenses);
        if (monthlyExpenses === 0) {
            const fallbackExpenses = await pool.query(`
                SELECT COALESCE(SUM(amount), 0) as monthly_expenses FROM expenses
            `);
            monthlyExpenses = Number(fallbackExpenses.rows[0].monthly_expenses);
        }

        // 5. Monthly Profits
        let monthlyProfitsRes = await pool.query(`
            SELECT COALESCE(SUM(profits), 0) as monthly_profits 
            FROM sales 
            WHERE date::timestamp >= date_trunc('month', $1::timestamp)
              AND status = false
        `, [maxDate]);

        let monthlyProfits = Number(monthlyProfitsRes.rows[0].monthly_profits);
        if (monthlyProfits === 0) {
            const fallbackProfits = await pool.query(`
                SELECT COALESCE(SUM(profits), 0) as monthly_profits FROM sales WHERE status = false
            `);
            monthlyProfits = Number(fallbackProfits.rows[0].monthly_profits);
        }

        return NextResponse.json({
            stockWorth: Number(stockWorthRes.rows[0].stock_worth),
            monthlySales,
            monthlyPurchases,
            monthlyExpenses,
            monthlyProfits,
        });

    } catch (error) {
        console.error("GET /api/dashboard/stats error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard stats." }, { status: 500 });
    }
}
