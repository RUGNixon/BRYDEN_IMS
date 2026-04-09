"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
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
                console.error("Failed to load chart data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 min-h-[400px] flex items-center justify-center animate-pulse">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium tracking-wide">Loading chart data...</p>
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 min-h-[400px] flex items-center justify-center">
                <p className="text-slate-400 font-medium">No chart data available for this month.</p>
            </div>
        );
    }

    // Custom Tooltip Formatter
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-rose-500"></div>
                    <p className="font-semibold text-slate-700 mb-2 border-b border-slate-100 pb-2">
                        {new Date(payload[0].payload.fullDate).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                    <div className="flex flex-col gap-1.5">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-6 text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    <span className="text-slate-600 font-medium">{entry.name}</span>
                                </span>
                                <span className="font-bold text-slate-900" style={{ color: entry.color }}>
                                    {fmtCurrency(entry.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Monthly Financial Overview</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Comparing metrics for the current month</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100/80 text-slate-600 rounded-full w-fit">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Live Data
                </div>
            </div>
            
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                            tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} />
                        <Legend 
                            wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }}
                            iconType="circle"
                            iconSize={10}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="stockWorth" 
                            name="Stock Worth" 
                            stroke="#818cf8" 
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#818cf8' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="sales" 
                            name="Monthly Sales" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="purchases" 
                            name="Monthly Purchases" 
                            stroke="#e11d48" 
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#e11d48' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="expenses" 
                            name="Expenses (Cumulative)" 
                            stroke="#f97316" 
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
