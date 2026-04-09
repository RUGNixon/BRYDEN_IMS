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

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-11

        // Build the past 12 months array for display
        const displayMonths = [];
        for (let i = 12; i >= 1; i--) {
            const d = new Date(year, month - i, 1);
            displayMonths.push({
                label: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear())}`,
                m: d.getMonth() + 1,
                y: d.getFullYear(),
            });
        }

        const firstDisplayMonth = displayMonths[0];
        const startDateStr = `${firstDisplayMonth.y}-${String(firstDisplayMonth.m).padStart(2, '0')}-01 00:00:00`;

        // Fetch Sales revenue
        const salesRes = await pool.query(`
            SELECT 
              EXTRACT(YEAR FROM date::timestamp) as year,
              EXTRACT(MONTH FROM date::timestamp) as month,
              COALESCE(SUM(quantity * selling_price), 0) as amount
            FROM sales 
            WHERE date::timestamp >= $1::timestamp
              AND status = false
            GROUP BY year, month
        `, [startDateStr]);

        // Fetch COGS — dynamic join to get purchase price per product
        const cogsRes = await pool.query(`
            SELECT 
              EXTRACT(YEAR FROM s.date::timestamp) as year,
              EXTRACT(MONTH FROM s.date::timestamp) as month,
              COALESCE(SUM(s.quantity * p.purchase_price), 0) as amount
            FROM sales s
            LEFT JOIN products p ON LOWER(s.product_name) = LOWER(p.name) AND s.size = p.size
            WHERE s.date::timestamp >= $1::timestamp
              AND s.status = false
            GROUP BY year, month
        `, [startDateStr]);

        // Fetch Purchases
        const purchasesRes = await pool.query(`
            SELECT 
              EXTRACT(YEAR FROM date::timestamp) as year,
              EXTRACT(MONTH FROM date::timestamp) as month,
              COALESCE(SUM(quantity * purchase_price), 0) as amount
            FROM purchases 
            WHERE date::timestamp >= $1::timestamp
            GROUP BY year, month
        `, [startDateStr]);

        const buildKey = (y: any, m: any) => `${Number(y)}-${Number(m)}`;

        const salesMap = new Map<string, number>();
        const cogsMap = new Map<string, number>();
        const purchasesMap = new Map<string, number>();

        salesRes.rows.forEach(r => salesMap.set(buildKey(r.year, r.month), Number(r.amount)));
        cogsRes.rows.forEach(r => cogsMap.set(buildKey(r.year, r.month), Number(r.amount)));
        purchasesRes.rows.forEach(r => purchasesMap.set(buildKey(r.year, r.month), Number(r.amount)));

        // Walk backward to calculate historical stock worth
        let rollingStock = currentStockWorth;
        const stockWorthMap = new Map<string, number>();

        for (let i = 0; i <= 12; i++) {
            const d = new Date(year, month - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const key = buildKey(y, m);

            if (i === 0) {
                stockWorthMap.set(key, rollingStock);
            } else {
                const nextD = new Date(year, month - (i - 1), 1);
                const nextKey = buildKey(nextD.getFullYear(), nextD.getMonth() + 1);

                const p = purchasesMap.get(nextKey) || 0;
                const c = cogsMap.get(nextKey) || 0;

                rollingStock = rollingStock - p + c;
                stockWorthMap.set(key, rollingStock);
            }
        }

        // Build output — profit = sales revenue - COGS (gross profit)
        const chartData = displayMonths.map(dm => {
            const key = buildKey(dm.y, dm.m);
            const sales = salesMap.get(key) || 0;
            const cogs = cogsMap.get(key) || 0;
            const profit = sales - cogs;

            return {
                month: dm.label,
                sales,
                purchases: purchasesMap.get(key) || 0,
                stockWorth: stockWorthMap.get(key) || 0,
                profit,
            };
        });

        return NextResponse.json(chartData);

    } catch (error) {
        console.error("GET /api/analytics/chart error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics chart data." }, { status: 500 });
    }
}
