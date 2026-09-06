"use client";

import { useEffect, useState } from "react";
import { Package, Clock, Flame, Award, ChevronRight } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import Link from "next/link";

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
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setData)
            .catch(() => console.error("Failed to fetch top products"))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm animate-pulse transition-colors">
                <div className="h-6 w-56 bg-slate-100 dark:bg-slate-800 rounded mb-6"></div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-50 dark:bg-slate-950/40 rounded-2xl mb-3"></div>
                ))}
            </div>
        );
    }

    const maxQty = data.length > 0 ? Math.max(...data.map((d) => d.totalQuantity)) : 1;

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col h-full transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Frequently Sold
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center gap-1">
                            <Flame size={12} /> Hot Items
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Top-performing inventory items ranked by sales volume
                    </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0 self-start sm:self-auto">
                    <Award size={20} />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[380px] pr-1.5 custom-scrollbar">
                {!data.length ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-3">
                            <Package className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No sales recorded yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Best-selling products will appear here as transactions occur.
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-2.5">
                        {data.map((item, idx) => {
                            const pct = Math.round((item.totalQuantity / maxQty) * 100);

                            // Podium Rank Styling
                            let rankStyle = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                            if (idx === 0) {
                                rankStyle = "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-xs shadow-amber-500/30 border-amber-400";
                            } else if (idx === 1) {
                                rankStyle = "bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 font-black shadow-xs border-slate-300";
                            } else if (idx === 2) {
                                rankStyle = "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black shadow-xs border-amber-600";
                            }

                            return (
                                <li
                                    key={idx}
                                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-indigo-200/80 dark:hover:border-indigo-800/80 transition-all duration-200 group"
                                >
                                    <div className="flex items-center justify-between gap-3 mb-2.5">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Rank Badge */}
                                            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs shrink-0 ${rankStyle}`}>
                                                {idx + 1}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                                                        title={item.productName}
                                                    >
                                                        {item.productName}
                                                    </span>
                                                    {item.size && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded shrink-0">
                                                            {item.size}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 block">
                                                    {item.timesPurchased} {item.timesPurchased === 1 ? "order" : "orders"} &bull; {fmtCurrency(item.totalSpent)} revenue
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block tracking-tight">
                                                {item.totalQuantity.toLocaleString()} units
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                {pct}% of top
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-blue-500 h-1.5 rounded-full transition-all duration-500 shadow-xs"
                                            style={{ width: `${Math.max(pct, 5)}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Footer Quick Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Explore full stock in Products
                </span>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
                >
                    <span>View Inventory</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
