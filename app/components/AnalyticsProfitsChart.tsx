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
import { fmtCurrency } from "@/lib/format";

interface ChartData {
    month: string;
    profit: number;
}

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
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 min-h-[400px] flex flex-col items-center justify-center animate-pulse mt-8">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium tracking-wide">Loading profit histogram...</p>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 min-h-[400px] flex flex-col items-center justify-center text-center mt-8">
                <p className="text-slate-400 font-medium tracking-wide">No profit data available for the past year.</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            const isPositive = val >= 0;
            return (
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-2 min-w-[180px]">
                    <span className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-center">{label}</span>
                    <div className="flex justify-between items-center gap-4 pt-1">
                        <span className="text-sm font-semibold text-slate-600">Net Profit</span>
                        <span className={`text-sm font-extrabold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
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
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60">
            <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Profit Output</h2>
                <p className="text-slate-500 mt-1 font-medium">Monthly Net Profits over the last 12 months</p>
            </div>

            <div style={{ width: '100%', height: 380 }}>
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
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                            tickFormatter={formatYAxis}
                            dx={-10}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: '#f1f5f9' }}
                        />
                        <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />
                        <Bar
                            dataKey="profit"
                            radius={[6, 6, 0, 0]}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'}
                                    radius={entry.profit >= 0 ? [6, 6, 0, 0] as any : [0, 0, 6, 6] as any}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
