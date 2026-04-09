"use client";

import { useEffect, useState } from "react";
import { Package, Clock } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface TopProduct {
    productName: string;
    size: string;
    totalQuantity: number;
    timesPurchased: number;
    totalSpent: number;
}

export default function DashboardTopProducts() {
    const [data, setData] = useState<TopProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/top-products")
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(setData)
            .catch(() => console.error("Failed to fetch top products"))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm animate-pulse">
                <div className="h-6 w-56 bg-slate-100 rounded mb-6"></div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 bg-slate-50 rounded-2xl mb-3"></div>
                ))}
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-center">
                <Clock className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No sales data available yet.</p>
            </div>
        );
    }

    const maxQty = data[0].totalQuantity;

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Frequently Sold</h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Top 10 best-selling products (last 6 months)</p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                    <Package className="w-5 h-5 text-indigo-600" />
                </div>
            </div>

            <ul className="flex flex-col gap-3">
                {data.map((item, idx) => {
                    const pct = Math.round((item.totalQuantity / maxQty) * 100);
                    return (
                        <li key={idx} className="group p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-indigo-50/30 transition-all duration-200">
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    {/* Rank badge */}
                                    <span className="text-xs font-black text-slate-400 w-5 shrink-0">#{idx + 1}</span>
                                    <div className="min-w-0">
                                        <span className="font-semibold text-slate-800 text-sm truncate block" title={item.productName}>
                                            {item.productName}
                                        </span>
                                        {item.size && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200/70 text-slate-600 rounded">
                                                {item.size}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-sm text-indigo-700">
                                        {item.totalQuantity.toLocaleString()} units sold
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                        {item.timesPurchased}× transaction · {fmtCurrency(item.totalSpent)} revenue
                                    </p>
                                </div>
                            </div>
                            {/* Quantity progress bar */}
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
