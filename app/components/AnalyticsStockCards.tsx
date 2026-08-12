"use client";

import { useEffect, useState } from "react";

interface Product {
    name: string;
    size: string;
    quantity?: number;
}

interface StockData {
    outOfStock: Product[];
    lowStock: Product[];
}

export default function AnalyticsStockCards() {
    const [data, setData] = useState<StockData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics/stock-status")
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error("Failed to load stock status:", err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1].map(i => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 min-h-[300px] flex items-center justify-center animate-pulse">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                ))}
            </div>
        );
    }

    const outOfStock = data?.outOfStock ?? [];
    const lowStock = data?.lowStock ?? [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Out of Stock Card ── */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Out of Stock</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Products with zero inventory</p>
                    </div>
                    <span className="ml-auto text-sm font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-full">
                        {outOfStock.length}
                    </span>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto max-h-72 px-4 py-3">
                    {outOfStock.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-500">All products are in stock!</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {outOfStock.map((p, i) => (
                                <li key={i} className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-rose-50/40 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                                    <span className="font-semibold text-slate-800 text-sm flex-1">{p.name}</span>
                                    {p.size && (
                                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">
                                            {p.size}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* ── Nearly Out of Stock Card ── */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Nearly Out of Stock</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">20 units or fewer remaining</p>
                    </div>
                    <span className="ml-auto text-sm font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full">
                        {lowStock.length}
                    </span>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto max-h-72 px-4 py-3">
                    {lowStock.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-500">Stock levels look healthy!</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {lowStock.map((p, i) => (
                                <li key={i} className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-amber-50/40 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                    <span className="font-semibold text-slate-800 text-sm flex-1">{p.name}</span>
                                    {p.size && (
                                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">
                                            {p.size}
                                        </span>
                                    )}
                                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${(p.quantity ?? 0) <= 3
                                            ? 'bg-rose-100 text-rose-600'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {p.quantity} left
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

        </div>
    );
}
