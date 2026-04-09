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
    ResponsiveContainer,
} from "recharts";
import { fmtCurrency } from "@/lib/format";

interface ChartData {
    month: string;
    sales: number;
    purchases: number;
    stockWorth: number;
    profit: number;
}

const SERIES = [
    {
        key: "sales",
        label: "Sales",
        color: "#6366f1",
        gradient: "salesGradient",
    },
    {
        key: "purchases",
        label: "Purchases",
        color: "#10b981",
        gradient: "purchasesGradient",
    },
    {
        key: "stockWorth",
        label: "Stock Worth",
        color: "#f59e0b",
        gradient: "stockGradient",
    },
];

export default function AnalyticsChart() {
    const [data, setData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const res = await fetch("/api/analytics/chart");
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to load analytics chart data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChartData();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8" style={{ minHeight: 520 }}>
                <div className="h-full flex flex-col items-center justify-center gap-4" style={{ minHeight: 420 }}>
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium tracking-wide text-sm">Loading year in review…</p>
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8" style={{ minHeight: 520 }}>
                <div className="h-full flex flex-col items-center justify-center gap-2" style={{ minHeight: 420 }}>
                    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-slate-400 font-medium tracking-wide">No data available for the past year.</p>
                </div>
            </div>
        );
    }

    // --- Summary Cards ---
    const totalSales = data.reduce((s, d) => s + d.sales, 0);
    const totalPurchases = data.reduce((s, d) => s + d.purchases, 0);
    const latestStockWorth = data[data.length - 1]?.stockWorth ?? 0;

    const summaryCards = [
        { label: "Total Sales", value: fmtCurrency(totalSales), color: "#6366f1", bg: "#eef2ff" },
        { label: "Total Purchases", value: fmtCurrency(totalPurchases), color: "#10b981", bg: "#ecfdf5" },
        { label: "Current Stock Worth", value: fmtCurrency(latestStockWorth), color: "#f59e0b", bg: "#fffbeb" },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-2" style={{ minWidth: 220 }}>
                    <span className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-center text-sm">{label}</span>
                    <div className="flex flex-col gap-2 pt-1">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-sm font-semibold text-slate-600">{entry.name}</span>
                                </div>
                                <span className="text-sm font-extrabold text-slate-900">{fmtCurrency(entry.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const formatYAxis = (value: number) => {
        if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
        return `$${value}`;
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Year in Review</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">
                        Monthly comparison · past 12 months
                    </p>
                </div>

                {/* Legend pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {SERIES.map(s => (
                        <div key={s.key} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: s.color + "18", color: s.color }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {summaryCards.map(card => (
                    <div key={card.label} className="rounded-2xl p-4 flex flex-col gap-1" style={{ backgroundColor: card.bg }}>
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: card.color }}>{card.label}</span>
                        <span className="text-xl font-extrabold text-slate-900">{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Chart — explicit height so ResponsiveContainer always has a valid dimension */}
            <div style={{ width: "100%", height: 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                        <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />

                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                            dy={12}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                            tickFormatter={formatYAxis}
                            dx={-8}
                            width={70}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                        />
                        {/* No legend here — using custom pills above */}

                        {SERIES.map(s => (
                            <Area
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stroke={s.color}
                                strokeWidth={3}
                                fill={`url(#${s.gradient})`}
                                dot={{ r: 4, fill: s.color, strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2, fill: s.color }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
