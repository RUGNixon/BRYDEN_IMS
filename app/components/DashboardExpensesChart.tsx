"use client";

import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Sector,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import { fmtCurrency } from "@/lib/format";
import { Receipt, TrendingDown } from "lucide-react";

interface CategoryExpense {
    name: string;
    value: number;
}

interface DailyExpensePoint {
    date: string;
    fullDate: string;
    expenses: number;
}

const PALETTE = [
    '#f97316', '#6366f1', '#10b981', '#e11d48', '#f59e0b',
    '#14b8a6', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899',
    '#3b82f6', '#a855f7', '#ef4444', '#eab308', '#0ea5e9',
];

const renderActiveShape = (props: any) => {
    const {
        cx, cy, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value
    } = props;

    return (
        <g>
            <text
                x={cx}
                y={cy - 12}
                textAnchor="middle"
                fill="#64748b"
                style={{ fontSize: 11, fontWeight: 600 }}
            >
                {payload.name.length > 16 ? payload.name.slice(0, 16) + '…' : payload.name}
            </text>
            <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                fill="#f97316"
                style={{ fontSize: 16, fontWeight: 800 }}
            >
                {fmtCurrency(value)}
            </text>
            <text
                x={cx}
                y={cy + 25}
                textAnchor="middle"
                fill="#94a3b8"
                style={{ fontSize: 11, fontWeight: 500 }}
            >
                {(percent * 100).toFixed(1)}%
            </text>
            <Sector
                cx={cx} cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx} cy={cy}
                innerRadius={outerRadius + 11}
                outerRadius={outerRadius + 14}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
        </g>
    );
};

export default function DashboardExpensesChart() {
    const [categories, setCategories] = useState<CategoryExpense[]>([]);
    const [dailyData, setDailyData] = useState<DailyExpensePoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchAllExpensesData = async () => {
            try {
                // 1. Fetch category expenses for the pie chart (this month)
                const piePromise = fetch("/api/dashboard/expenses").then(r => r.ok ? r.json() : []);
                // 2. Fetch 31-day daily expenses from the chart API
                const chartPromise = fetch("/api/dashboard/chart").then(r => r.ok ? r.json() : []);

                const [pieResult, chartResult] = await Promise.all([piePromise, chartPromise]);

                if (Array.isArray(pieResult)) {
                    setCategories(pieResult);
                }
                if (Array.isArray(chartResult)) {
                    setDailyData(chartResult.map((d: any) => ({
                        date: d.date,
                        fullDate: d.fullDate,
                        expenses: Number(d.expenses || 0),
                    })));
                }
            } catch (error) {
                console.error("Failed to load dashboard expenses data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllExpensesData();
    }, []);

    const monthTotal = categories.reduce((sum, d) => sum + d.value, 0);
    const total31Days = dailyData.reduce((sum, d) => sum + d.expenses, 0);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 min-h-[400px] flex items-center justify-center transition-colors">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-200 dark:border-orange-900 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium text-sm">Loading expense analytics...</p>
                </div>
            </div>
        );
    }

    // Tooltip for 31-day daily expenses area chart
    const DailyExpenseTooltip = ({ active, payload }: any) => {
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
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs">
                    <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                        {displayDate}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">Daily Expenses</span>
                        </div>
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                            {fmtCurrency(item.expenses)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 transition-colors">
            {/* Header with dual statistics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Expenses Breakdown &amp; 31-Day Trend
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Category distribution for this month alongside daily spending trajectory
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            This Month
                        </p>
                        <p className="text-base font-extrabold text-orange-600 dark:text-orange-400 mt-0.5">
                            {fmtCurrency(monthTotal)}
                        </p>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Past 31 Days
                        </p>
                        <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                            {fmtCurrency(total31Days)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Split layout: Left = Pie Chart & Categories, Right = 31-Day Expenses Area Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* ═════════════════════════════════════════════════════════ */}
                {/* LEFT SIDE: Pie Chart for Expenses This Month             */}
                {/* ═════════════════════════════════════════════════════════ */}
                <div className="xl:col-span-6 flex flex-col gap-4 border-b xl:border-b-0 xl:border-r border-slate-100 dark:border-slate-800/80 pb-6 xl:pb-0 xl:pr-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Category Breakdown (This Month)
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">
                            {categories.length} {categories.length === 1 ? "category" : "categories"}
                        </span>
                    </div>

                    {!categories.length ? (
                        <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-sm font-semibold text-slate-500">No expense records for this month</p>
                            <p className="text-xs text-slate-400 mt-1">Expenses recorded this month will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Donut Pie Chart */}
                            <div className="w-full md:w-56 h-56 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            {...({ activeIndex, activeShape: renderActiveShape } as any)}
                                            data={categories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                            stroke="none"
                                            onMouseEnter={(_, index) => setActiveIndex(index)}
                                        >
                                            {categories.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={PALETTE[index % PALETTE.length]}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Category Legend List */}
                            <div className="flex-1 w-full max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
                                {categories.map((entry, index) => {
                                    const color = PALETTE[index % PALETTE.length];
                                    const pct = monthTotal > 0 ? ((entry.value / monthTotal) * 100).toFixed(1) : "0.0";
                                    const isActive = index === activeIndex;

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onMouseEnter={() => setActiveIndex(index)}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 w-full group cursor-pointer ${
                                                isActive
                                                    ? "bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/60 shadow-xs"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
                                            }`}
                                        >
                                            <div
                                                className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-1 transition-all"
                                                style={{
                                                    backgroundColor: color,
                                                    ...(isActive ? { boxShadow: `0 0 0 2px white, 0 0 0 4px ${color}` } : {})
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-xs font-semibold truncate ${isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                                                        {entry.name}
                                                    </p>
                                                    <span className="text-xs font-bold shrink-0" style={{ color }}>
                                                        {fmtCurrency(entry.value)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═════════════════════════════════════════════════════════ */}
                {/* RIGHT SIDE: 31-Day Expenses Area Graph                   */}
                {/* ═════════════════════════════════════════════════════════ */}
                <div className="xl:col-span-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingDown size={18} className="text-orange-500" />
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Daily Expenses (Past 31 Days)
                            </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
                            <div className="w-5 h-0.5 bg-orange-500 rounded-full"></div>
                            Daily Spending
                        </div>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="fillExpenses31" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                    dy={8}
                                    interval={3}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                    tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                                    dx={-4}
                                />
                                <Tooltip
                                    content={<DailyExpenseTooltip />}
                                    cursor={{ stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Daily Expenses"
                                    stroke="#f97316"
                                    strokeWidth={2.5}
                                    fill="url(#fillExpenses31)"
                                    fillOpacity={1}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 0, fill: '#ea580c' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
