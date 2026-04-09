import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET() {
    try {
        // 1. Current Stock Worth
        const stockWorthRes = await pool.query(`
            SELECT COALESCE(SUM(quantity * purchase_price), 0) as stock_worth 
            FROM products
        `);
        const currentStockWorth = Number(stockWorthRes.rows[0].stock_worth);

        // 2. Daily Sales (Revenue)
        const salesRes = await pool.query(`
            SELECT DATE(date::timestamp) as day, COALESCE(SUM(quantity * selling_price), 0) as amount 
            FROM sales 
            WHERE date::timestamp >= date_trunc('month', current_date)
              AND status = false
            GROUP BY DATE(date::timestamp)
        `);

        // 2b. Daily COGS (Cost of Goods Sold) for Sales
        const cogsRes = await pool.query(`
            SELECT DATE(s.date::timestamp) as day, COALESCE(SUM(s.quantity * p.purchase_price), 0) as amount 
            FROM sales s
            LEFT JOIN products p ON s.product_name = p.name AND s.size = p.size
            WHERE s.date::timestamp >= date_trunc('month', current_date)
              AND s.status = false
            GROUP BY DATE(s.date::timestamp)
        `);

        // 3. Daily Purchases
        const purchasesRes = await pool.query(`
            SELECT DATE(date::timestamp) as day, COALESCE(SUM(quantity * purchase_price), 0) as amount 
            FROM purchases 
            WHERE date::timestamp >= date_trunc('month', current_date)
            GROUP BY DATE(date::timestamp)
        `);

        // 4. Daily Expenses
        const expensesRes = await pool.query(`
            SELECT DATE(date::timestamp) as day, COALESCE(SUM(amount), 0) as amount 
            FROM expenses 
            WHERE date::timestamp >= date_trunc('month', current_date)
            GROUP BY DATE(date::timestamp)
        `);

        // Map results by date string
        const salesMap = new Map<string, number>();
        salesRes.rows.forEach(r => salesMap.set(new Date(r.day).toISOString().split('T')[0], Number(r.amount)));

        const cogsMap = new Map<string, number>();
        cogsRes.rows.forEach(r => cogsMap.set(new Date(r.day).toISOString().split('T')[0], Number(r.amount)));

        const purchasesMap = new Map<string, number>();
        purchasesRes.rows.forEach(r => purchasesMap.set(new Date(r.day).toISOString().split('T')[0], Number(r.amount)));

        const expensesMap = new Map<string, number>();
        expensesRes.rows.forEach(r => expensesMap.set(new Date(r.day).toISOString().split('T')[0], Number(r.amount)));

        // Generate Dates and Historical Stock Worth
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const todayDay = today.getDate();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const stockWorthMap = new Map<string, number>();
        
        // For future days of the month, stock remains constant (since no purchases/sales yet)
        for (let i = daysInMonth; i > todayDay; i--) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            stockWorthMap.set(dateStr, currentStockWorth);
        }

        // For today and past days, iterate backwards and calculate
        let rollingStock = currentStockWorth;
        for (let i = todayDay; i >= 1; i--) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            // Set for current day (at the end of day i)
            stockWorthMap.set(dateStr, rollingStock);
            
            // Calculate stock at the end of day i-1
            const p = purchasesMap.get(dateStr) || 0;
            const c = cogsMap.get(dateStr) || 0;
            rollingStock = rollingStock - p + c;
        }

        // Build Final Array (expenses are cumulative running total; others are daily)
        const chartData = [];
        let runningExpenses = 0;
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            // Only accumulate up to today; future days keep the last known total
            if (i <= todayDay) {
                runningExpenses += expensesMap.get(dateStr) || 0;
            }
            chartData.push({
                date: String(i),
                fullDate: dateStr,
                stockWorth: stockWorthMap.get(dateStr) || 0,
                sales: salesMap.get(dateStr) || 0,
                purchases: purchasesMap.get(dateStr) || 0,
                expenses: runningExpenses,
            });
        }

        return NextResponse.json(chartData);

    } catch (error) {
        console.error("GET /api/dashboard/chart error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard chart data." }, { status: 500 });
    }
}
