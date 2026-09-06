import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

// Helper to format date keys consistently as YYYY-MM-DD
function formatDateKey(val: any): string {
    if (!val) return "";
    if (typeof val === "string") return val.split("T")[0];
    const d = new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export async function GET() {
    try {
        // 1. Current Stock Worth
        const stockWorthRes = await pool.query(`
            SELECT COALESCE(SUM(quantity * purchase_price), 0) as stock_worth 
            FROM products
        `);
        const currentStockWorth = Number(stockWorthRes.rows[0].stock_worth);

        // 2. Daily Sales (past 30 days + today = 31 days)
        const salesRes = await pool.query(`
            SELECT DATE(date::timestamp) as day, COALESCE(SUM(quantity * selling_price), 0) as amount 
            FROM sales 
            WHERE date::timestamp >= current_date - INTERVAL '30 days'
              AND status = false
            GROUP BY DATE(date::timestamp)
        `);

        // 2b. Daily COGS (Cost of Goods Sold) for Sales
        const cogsRes = await pool.query(`
            SELECT DATE(s.date::timestamp) as day, COALESCE(SUM(s.quantity * p.purchase_price), 0) as amount 
            FROM sales s
            LEFT JOIN products p ON s.product_name = p.name AND s.size = p.size
            WHERE s.date::timestamp >= current_date - INTERVAL '30 days'
              AND s.status = false
            GROUP BY DATE(s.date::timestamp)
        `);

        // 3. Daily Purchases
        const purchasesRes = await pool.query(`
            SELECT DATE(date::timestamp) as day, COALESCE(SUM(quantity * purchase_price), 0) as amount 
            FROM purchases 
            WHERE date::timestamp >= current_date - INTERVAL '30 days'
            GROUP BY DATE(date::timestamp)
        `);

        // 4. Daily Expenses
        const expensesRes = await pool.query(`
            SELECT DATE(date::timestamp) as day, COALESCE(SUM(amount), 0) as amount 
            FROM expenses 
            WHERE date::timestamp >= current_date - INTERVAL '30 days'
            GROUP BY DATE(date::timestamp)
        `);

        // Map results by date string YYYY-MM-DD
        const salesMap = new Map<string, number>();
        salesRes.rows.forEach(r => salesMap.set(formatDateKey(r.day), Number(r.amount)));

        const cogsMap = new Map<string, number>();
        cogsRes.rows.forEach(r => cogsMap.set(formatDateKey(r.day), Number(r.amount)));

        const purchasesMap = new Map<string, number>();
        purchasesRes.rows.forEach(r => purchasesMap.set(formatDateKey(r.day), Number(r.amount)));

        const expensesMap = new Map<string, number>();
        expensesRes.rows.forEach(r => expensesMap.set(formatDateKey(r.day), Number(r.amount)));

        // Generate exactly 31 days ending today (today - 30 days ... today)
        const today = new Date();
        const daysList: { dateStr: string; displayDate: string }[] = [];
        for (let i = 30; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const dateStr = `${y}-${m}-${day}`;
            const displayDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            daysList.push({ dateStr, displayDate });
        }

        // Calculate rolling stock backwards from today (index 30) down to index 0
        const stockWorthMap = new Map<string, number>();
        let rollingStock = currentStockWorth;

        for (let i = daysList.length - 1; i >= 0; i--) {
            const dateStr = daysList[i].dateStr;
            stockWorthMap.set(dateStr, rollingStock);

            const p = purchasesMap.get(dateStr) || 0;
            const c = cogsMap.get(dateStr) || 0;
            // stock at end of previous day = stock at end of today - purchases today + cogs sold today
            rollingStock = Math.max(0, rollingStock - p + c);
        }

        // Build 31-day result array
        const chartData = daysList.map(({ dateStr, displayDate }) => ({
            date: displayDate,
            fullDate: dateStr,
            stockWorth: stockWorthMap.get(dateStr) || 0,
            sales: salesMap.get(dateStr) || 0,
            purchases: purchasesMap.get(dateStr) || 0,
            expenses: expensesMap.get(dateStr) || 0,
        }));

        return NextResponse.json(chartData);
    } catch (error) {
        console.error("GET /api/dashboard/chart error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard chart data." }, { status: 500 });
    }
}
