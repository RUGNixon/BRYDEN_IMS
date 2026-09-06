"use client";

import { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { fmtCurrency } from "@/lib/format";

interface ChartData {
    date: string;
    fullDate: string;
    stockWorth: number;
    sales: number;
    purchases: number;
    expenses: number;
}

export default function DashboardChart() {
    const [data, setData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const res = await fetch("/api/dashboard/chart");
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to load 31-day chart data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 min-h-[420px] flex items-center justify-center animate-pulse transition-colors">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium tracking-wide">Loading 31-day financial metrics...</p>
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 min-h-[420px] flex items-center justify-center transition-colors">
                <p className="text-slate-400 font-medium">No financial data available for the past 31 days.</p>
            </div>
        );
    }

    // Comprehensive custom tooltip for Stock Worth, Sales, and Purchases
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            let displayDate = item.fullDate;
            try {
                displayDate = new Date(item.fullDate).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            } catch {}

            return (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl min-w-[240px] text-slate-900 dark:text-slate-100">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>{displayDate}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                            Day {item.date}
                        </span>
                    </div>

                    <div className="space-y-2 text-sm">
                        {/* Stock Worth */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-xs"></div>
                                <span className="text-slate-600 dark:text-slate-300 font-medium">Stock Worth</span>
                            </div>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {fmtCurrency(item.stockWorth)}
                            </span>
                        </div>

                        {/* Sales */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></div>
                                <span className="text-slate-600 dark:text-slate-300 font-medium">Daily Sales</span>
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {fmtCurrency(item.sales)}
                            </span>
                        </div>

                        {/* Purchases */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs"></div>
                                <span className="text-slate-600 dark:text-slate-300 font-medium">Daily Purchases</span>
                            </div>
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                {fmtCurrency(item.purchases)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 transition-colors">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        31-Day Financial Overview
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Continuous 31-day trajectory of Stock Worth, Daily Sales, and Purchases up to today
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full w-fit border border-indigo-100 dark:border-indigo-900/40">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    Past 31 Days &bull; Live Progression
                </div>
            </div>

            {/* Single Full-Width Unified Area Chart */}
            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                        <defs>
                            {/* Stock Worth Gradient (Indigo) */}
                            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                            </linearGradient>

                            {/* Sales Gradient (Emerald) */}
                            <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                            </linearGradient>

                            {/* Purchases Gradient (Rose) */}
                            <linearGradient id="fillPurchases" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.22} />
                                <stop offset="95%" stopColor="#e11d48" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />

                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            dy={10}
                            interval={2}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                            dx={-4}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                        />

                        <Legend
                            wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600 }}
                            iconType="circle"
                            iconSize={9}
                        />

                        {/* Stock Worth Area */}
                        <Area
                            type="monotone"
                            dataKey="stockWorth"
                            name="Stock Worth"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorStock)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#4f46e5' }}
                        />

                        {/* Sales Area */}
                        <Area
                            type="monotone"
                            dataKey="sales"
                            name="Sales"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#fillSales)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
                        />

                        {/* Purchases Area */}
                        <Area
                            type="monotone"
                            dataKey="purchases"
                            name="Purchases"
                            stroke="#e11d48"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#fillPurchases)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#e11d48' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
