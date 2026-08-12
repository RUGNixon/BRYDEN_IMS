import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const selectedMonth = searchParams.get("month"); // Format: "YYYY-MM" or null for current month

        const now = new Date();
        const year = selectedMonth ? parseInt(selectedMonth.split("-")[0], 10) : now.getFullYear();
        const monthIndex = selectedMonth ? parseInt(selectedMonth.split("-")[1], 10) - 1 : now.getMonth();

        // Calculate start and end of the target month
        const startOfMonth = new Date(year, monthIndex, 1, 0, 0, 0, 0).toISOString();
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).toISOString();

        // 1. Fetch sales for target month
        const salesRes = await pool.query(
            `SELECT id, client_name AS "clientName", product_name AS "productName",
                    size, quantity, selling_price AS "sellingPrice",
                    profits, vat, date, phone, email
             FROM sales
             WHERE date >= $1 AND date <= $2
             ORDER BY date DESC, id DESC`,
            [startOfMonth, endOfMonth]
        );

        // Fallback: If no sales exist for target month, fetch all sales to avoid empty dashboard if database dates differ
        let sales = salesRes.rows;
        let isFilteredMonth = true;

        if (sales.length === 0 && !selectedMonth) {
            const allSalesRes = await pool.query(
                `SELECT id, client_name AS "clientName", product_name AS "productName",
                        size, quantity, selling_price AS "sellingPrice",
                        profits, vat, date, phone, email
                 FROM sales
                 ORDER BY date DESC, id DESC`
            );
            sales = allSalesRes.rows;
            isFilteredMonth = false;
        }

        // 2. Fetch expenses for target month (or all)
        const expensesQuery = isFilteredMonth && selectedMonth
            ? `SELECT id, person_name AS "personName", description, amount, date FROM expenses WHERE date >= $1 AND date <= $2`
            : `SELECT id, person_name AS "personName", description, amount, date FROM expenses`;
        
        const expensesParams = isFilteredMonth && selectedMonth ? [startOfMonth, endOfMonth] : [];
        const expensesRes = await pool.query(expensesQuery, expensesParams);
        const expenses = expensesRes.rows;

        // ── VAT Calculations ──
        let totalSalesRevenue = 0;
        let totalVatAccumulated = 0;
        let totalProfits = 0;

        sales.forEach((s) => {
            const saleTotal = (Number(s.sellingPrice) || 0) * (Number(s.quantity) || 0);
            totalSalesRevenue += saleTotal;
            totalVatAccumulated += Number(s.vat) || 0;
            totalProfits += Number(s.profits) || 0;
        });

        const taxableBase = totalSalesRevenue - totalVatAccumulated;

        // ── CIT Calculations ──
        const totalExpensesAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        // Cost of Goods Sold = Revenue - Gross Profit
        const estimatedCogs = totalSalesRevenue - totalProfits;
        // Taxable Net Profit = Gross Profit - Operating Expenses
        const taxableNetProfit = Math.max(0, totalProfits - totalExpensesAmount);
        const citRate = 0.30; // 30% Corporate Income Tax
        const citAmountDue = taxableNetProfit * citRate;

        // ── Patente (Trading License) Calculations ──
        // Projected annual turnover based on current monthly sales
        const annualTurnoverProjection = isFilteredMonth ? totalSalesRevenue * 12 : totalSalesRevenue;
        
        let patenteFeeTier = "Tier 1";
        let patenteAnnualFee = 40; // Default min tier
        if (annualTurnoverProjection > 50000) {
            patenteFeeTier = "Tier 4 (High Turnover)";
            patenteAnnualFee = 500;
        } else if (annualTurnoverProjection > 10000) {
            patenteFeeTier = "Tier 3 (Medium Turnover)";
            patenteAnnualFee = 250;
        } else if (annualTurnoverProjection > 2000) {
            patenteFeeTier = "Tier 2 (Standard)";
            patenteAnnualFee = 100;
        }

        const patenteMonthlyAccrual = patenteAnnualFee / 12;

        // ── PAYE (Pay As You Earn) Calculations ──
        // Filter salary-related expenses if any exist, or estimate baseline employee payroll
        const payrollExpenses = expenses.filter(e => 
            e.description.toLowerCase().includes("salary") || 
            e.description.toLowerCase().includes("payroll") ||
            e.description.toLowerCase().includes("wage")
        );

        const totalPayroll = payrollExpenses.length > 0 
            ? payrollExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
            : Math.max(1500, totalExpensesAmount * 0.4); // Estimate ~40% of expenses or baseline $1,500

        // Calculate progressive PAYE
        let payeTotal = 0;
        if (totalPayroll > 0) {
            if (totalPayroll <= 600) {
                payeTotal = 0;
            } else if (totalPayroll <= 1000) {
                payeTotal = (totalPayroll - 600) * 0.20;
            } else {
                payeTotal = (400 * 0.20) + ((totalPayroll - 1000) * 0.30);
            }
        }

        const formattedMonthLabel = new Date(year, monthIndex, 1).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });

        return NextResponse.json({
            monthLabel: formattedMonthLabel,
            year,
            month: monthIndex + 1,
            isFilteredMonth,
            summary: {
                totalTaxDue: totalVatAccumulated + citAmountDue + patenteMonthlyAccrual + payeTotal,
                vatTotal: totalVatAccumulated,
                citTotal: citAmountDue,
                patenteTotal: patenteMonthlyAccrual,
                payeTotal: payeTotal,
            },
            vat: {
                totalVat: totalVatAccumulated,
                totalSalesRevenue,
                taxableBase,
                transactionCount: sales.length,
                rate: "18%",
                dueDate: "15th of next month",
                salesList: sales,
            },
            cit: {
                amountDue: citAmountDue,
                rate: "30%",
                grossRevenue: totalSalesRevenue,
                taxableBase,
                estimatedCogs,
                grossProfit: totalProfits,
                totalExpenses: totalExpensesAmount,
                taxableNetProfit,
                dueDate: "30th of following month",
            },
            patente: {
                annualFee: patenteAnnualFee,
                monthlyAccrual: patenteMonthlyAccrual,
                tier: patenteFeeTier,
                annualTurnoverProjection,
                dueDate: "January 31st (Annual)",
            },
            paye: {
                totalPaye: payeTotal,
                estimatedPayroll: totalPayroll,
                payrollEntriesCount: payrollExpenses.length,
                dueDate: "15th of next month",
            },
        });
    } catch (error) {
        console.error("GET /api/taxes error:", error);
        return NextResponse.json({ error: "Failed to fetch tax calculations." }, { status: 500 });
    }
}
