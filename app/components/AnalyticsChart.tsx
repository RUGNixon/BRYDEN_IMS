"use client";

import { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { BarChart3, Boxes, ShoppingBag, Truck } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface ChartData {
    month: string;
    sales: number;
    purchases: number;
    stockWorth: number;
    profit: number;
}

interface AnalyticsTooltipPayload {
    color?: string;
    name?: string;
    value: number;
}

interface AnalyticsTooltipProps {
    active?: boolean;
    payload?: AnalyticsTooltipPayload[];
    label?: string;
}

const SERIES = [
    {
        key: "sales",
        label: "Sales",
        color: "var(--analytics-series-sales)",
        gradient: "salesGradient",
        chipClass: "analytics-chip-sales",
    },
    {
        key: "purchases",
        label: "Purchases",
        color: "var(--analytics-series-purchases)",
        gradient: "purchasesGradient",
        chipClass: "analytics-chip-purchases",
    },
    {
        key: "stockWorth",
        label: "Stock Worth",
        color: "var(--analytics-series-stock)",
        gradient: "stockGradient",
        chipClass: "analytics-chip-stock",
    },
] as const;

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
            <section className="analytics-card analytics-state-card">
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
                    <div className="analytics-spinner" />
                    <p className="text-sm font-semibold tracking-wide text-[var(--analytics-muted)]">Loading year in review...</p>
                </div>
            </section>
        );
    }

    if (!data.length) {
        return (
            <section className="analytics-card analytics-state-card">
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center">
                    <div className="analytics-empty-icon">
                        <BarChart3 size={26} aria-hidden="true" />
                    </div>
                    <p className="font-semibold tracking-wide text-[var(--analytics-muted)]">No data available for the past year.</p>
                </div>
            </section>
        );
    }

    const totalSales = data.reduce((s, d) => s + d.sales, 0);
    const totalPurchases = data.reduce((s, d) => s + d.purchases, 0);
    const latestStockWorth = data[data.length - 1]?.stockWorth ?? 0;

    const summaryCards = [
        { label: "Total Sales", value: fmtCurrency(totalSales), icon: ShoppingBag, className: "analytics-summary-sales" },
        { label: "Total Purchases", value: fmtCurrency(totalPurchases), icon: Truck, className: "analytics-summary-purchases" },
        { label: "Current Stock Worth", value: fmtCurrency(latestStockWorth), icon: Boxes, className: "analytics-summary-stock" },
    ];

    const CustomTooltip = ({ active, payload, label }: AnalyticsTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="analytics-tooltip min-w-[220px]">
                    <span className="analytics-tooltip-title">{label}</span>
                    <div className="flex flex-col gap-2 pt-2">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-sm font-semibold text-[var(--analytics-muted)]">{entry.name}</span>
                                </div>
                                <span className="text-sm font-extrabold text-[var(--analytics-text)]">{fmtCurrency(entry.value)}</span>
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
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {summaryCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`analytics-summary-card ${card.className}`}>
                            <div className="analytics-summary-icon">
                                <Icon size={18} aria-hidden="true" />
                            </div>
                            <div>
                                <span className="analytics-summary-label">{card.label}</span>
                                <span className="analytics-summary-value">{card.value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <section className="analytics-card analytics-chart-card">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="analytics-section-icon">
                                <BarChart3 size={18} aria-hidden="true" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-[var(--analytics-text)] sm:text-2xl">Year in Review</h2>
                        </div>
                        <p className="mt-2 text-sm font-medium text-[var(--analytics-muted)]">
                            Monthly comparison across sales, purchases, and inventory value.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {SERIES.map((s) => (
                            <div key={s.key} className={`analytics-chip ${s.chipClass}`}>
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="analytics-chart-shell">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 4, bottom: 10 }}
                        >
                            <defs>
                                {SERIES.map((s) => (
                                    <linearGradient key={s.gradient} id={s.gradient} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={s.color} stopOpacity={0.22} />
                                        <stop offset="95%" stopColor={s.color} stopOpacity={0.01} />
                                    </linearGradient>
                                ))}
                            </defs>

                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--analytics-chart-grid)" />

                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--analytics-chart-axis)", fontSize: 12, fontWeight: 650 }}
                                dy={12}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--analytics-chart-axis)", fontSize: 12, fontWeight: 650 }}
                                tickFormatter={formatYAxis}
                                dx={-8}
                                width={70}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: "var(--analytics-chart-cursor)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                            />

                            {SERIES.map((s) => (
                                <Area
                                    key={s.key}
                                    type="monotone"
                                    dataKey={s.key}
                                    name={s.label}
                                    stroke={s.color}
                                    strokeWidth={3}
                                    fill={`url(#${s.gradient})`}
                                    dot={{ r: 4, fill: s.color, strokeWidth: 2, stroke: "var(--analytics-surface)" }}
                                    activeDot={{ r: 7, stroke: "var(--analytics-surface)", strokeWidth: 2, fill: s.color }}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
}
