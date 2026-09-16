"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import { ChartColumnIncreasing, CircleDollarSign, Gauge, TrendingUp } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface ChartData {
    month: string;
    profit: number;
}

interface ProfitTooltipPayload {
    value: number;
}

interface ProfitTooltipProps {
    active?: boolean;
    payload?: ProfitTooltipPayload[];
    label?: string;
}

const POSITIVE_BAR_RADIUS = [8, 8, 0, 0] as const;
const NEGATIVE_BAR_RADIUS = [0, 0, 8, 8] as const;
const getBarRadius = (profit: number) =>
    (profit >= 0 ? POSITIVE_BAR_RADIUS : NEGATIVE_BAR_RADIUS) as unknown as number;

export default function AnalyticsProfitsChart() {
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
                <div className="analytics-spinner" />
                <p className="mt-4 font-semibold tracking-wide text-[var(--analytics-muted)]">Loading profit histogram...</p>
            </section>
        );
    }

    if (!data.length) {
        return (
            <section className="analytics-card analytics-state-card text-center">
                <div className="analytics-empty-icon">
                    <ChartColumnIncreasing size={26} aria-hidden="true" />
                </div>
                <p className="mt-3 font-semibold tracking-wide text-[var(--analytics-muted)]">No profit data available for the past year.</p>
            </section>
        );
    }

    const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
    const averageProfit = totalProfit / data.length;
    const profitableMonths = data.filter((item) => item.profit >= 0).length;

    const profitStats = [
        { label: "Net Profit", value: fmtCurrency(totalProfit), icon: CircleDollarSign },
        { label: "Monthly Average", value: fmtCurrency(averageProfit), icon: Gauge },
        { label: "Profitable Months", value: `${profitableMonths}/${data.length}`, icon: TrendingUp },
    ];

    const CustomTooltip = ({ active, payload, label }: ProfitTooltipProps) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            const isPositive = val >= 0;
            return (
                <div className="analytics-tooltip min-w-[180px]">
                    <span className="analytics-tooltip-title">{label}</span>
                    <div className="flex justify-between items-center gap-4 pt-1">
                        <span className="text-sm font-semibold text-[var(--analytics-muted)]">Net Profit</span>
                        <span className={`text-sm font-extrabold ${isPositive ? "text-[var(--analytics-positive)]" : "text-[var(--analytics-negative)]"}`}>
                            {fmtCurrency(val)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const formatYAxis = (value: number) => {
        const absValue = Math.abs(value);
        let formatted = `$${absValue}`;
        if (absValue >= 1000000) {
            formatted = `$${(absValue / 1000000).toFixed(1)}M`;
        } else if (absValue >= 1000) {
            formatted = `$${(absValue / 1000).toFixed(0)}k`;
        }
        return value < 0 ? `-${formatted}` : formatted;
    };

    return (
        <section className="analytics-card analytics-chart-card">
            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="analytics-section-icon analytics-section-icon-profit">
                            <ChartColumnIncreasing size={18} aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-[var(--analytics-text)] sm:text-2xl">Profit Momentum</h2>
                    </div>
                    <p className="mt-2 text-sm font-medium text-[var(--analytics-muted)]">
                        Monthly net profit distribution over the last 12 months.
                    </p>
                </div>

                <div className="analytics-inline-stats">
                    {profitStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="analytics-inline-stat">
                                <Icon size={16} aria-hidden="true" />
                                <span>{stat.label}</span>
                                <strong>{stat.value}</strong>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="analytics-chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 10,
                            left: 10,
                            bottom: 10,
                        }}
                        barSize={32}
                    >
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--analytics-chart-grid)" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--analytics-chart-axis)", fontSize: 12, fontWeight: 650 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--analytics-chart-axis)", fontSize: 12, fontWeight: 650 }}
                            tickFormatter={formatYAxis}
                            dx={-10}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "var(--analytics-chart-hover)" }}
                        />
                        <ReferenceLine y={0} stroke="var(--analytics-chart-cursor)" strokeWidth={2} />
                        <Bar
                            dataKey="profit"
                            radius={[8, 8, 0, 0]}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.profit >= 0 ? "var(--analytics-positive)" : "var(--analytics-negative)"}
                                    radius={getBarRadius(entry.profit)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
