"use client";

import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { fmtCurrency } from "@/lib/format";

interface ExpenseData {
    name: string;
    value: number;
}

const COLORS = [
    // Standard Vibrant Colors
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',

    // Darker / Deep Variant Colors
    '#991b1b', '#c2410c', '#b45309', '#a16207', '#4d7c0f',
    '#047857', '#0f766e', '#0e7490', '#0369a1', '#1d4ed8',
    '#4338ca', '#6d28d9', '#7e22ce', '#a21caf', '#be185d',

    // Lighter / Pastel Variant Colors
    '#fca5a5', '#fdba74', '#fcd34d', '#fde047', '#bef264',
    '#6ee7b7', '#5eead4', '#67e8f9', '#7dd3fc', '#93c5fd',
    '#a5b4fc', '#c4b5fd', '#d8b4fe', '#f0abfc', '#f9a8d4'
];

export default function DashboardExpensesChart() {
    const [data, setData] = useState<ExpenseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await fetch("/api/dashboard/expenses");
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to load dashboard expenses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 min-h-[400px] flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 min-h-[400px] flex flex-col items-center justify-center text-center">
                <p className="text-slate-400 font-medium tracking-wide">No expenses recorded for this month.</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }}></div>
                        <span className="font-semibold text-slate-700">{data.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 text-right">
                        {fmtCurrency(data.value)}
                    </span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Expenses Breakdown</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Categorized by description</p>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500, color: '#475569' }}
                            iconType="circle"
                            iconSize={8}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
