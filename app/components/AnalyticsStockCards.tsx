"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[0, 1].map(i => (
                    <div key={i} className="analytics-card flex min-h-[300px] items-center justify-center p-6">
                        <div className="analytics-spinner" />
                    </div>
                ))}
            </div>
        );
    }

    const outOfStock = data?.outOfStock ?? [];
    const lowStock = data?.lowStock ?? [];

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <section className="analytics-card analytics-stock-card analytics-stock-danger">
                <div className="analytics-stock-header">
                    <div className="analytics-stock-icon">
                        <XCircle size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-[var(--analytics-text)]">Out of Stock</h2>
                        <p className="mt-0.5 text-xs font-semibold text-[var(--analytics-subtle)]">Products with zero inventory</p>
                    </div>
                    <span className="analytics-stock-count">
                        {outOfStock.length}
                    </span>
                </div>

                <div className="analytics-stock-body">
                    {outOfStock.length === 0 ? (
                        <div className="analytics-stock-empty">
                            <div className="analytics-stock-empty-icon">
                                <CheckCircle2 size={24} aria-hidden="true" />
                            </div>
                            <p>All products are in stock.</p>
                        </div>
                    ) : (
                        <ul className="analytics-stock-list">
                            {outOfStock.map((p, i) => (
                                <li key={i} className="analytics-stock-row">
                                    <div className="analytics-stock-dot" />
                                    <span className="flex-1 text-sm font-bold text-[var(--analytics-text)]">{p.name}</span>
                                    {p.size && (
                                        <span className="analytics-stock-pill">
                                            {p.size}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className="analytics-card analytics-stock-card analytics-stock-warning">
                <div className="analytics-stock-header">
                    <div className="analytics-stock-icon">
                        <AlertTriangle size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-[var(--analytics-text)]">Nearly Out of Stock</h2>
                        <p className="mt-0.5 text-xs font-semibold text-[var(--analytics-subtle)]">20 units or fewer remaining</p>
                    </div>
                    <span className="analytics-stock-count">
                        {lowStock.length}
                    </span>
                </div>

                <div className="analytics-stock-body">
                    {lowStock.length === 0 ? (
                        <div className="analytics-stock-empty">
                            <div className="analytics-stock-empty-icon">
                                <CheckCircle2 size={24} aria-hidden="true" />
                            </div>
                            <p>Stock levels look healthy.</p>
                        </div>
                    ) : (
                        <ul className="analytics-stock-list">
                            {lowStock.map((p, i) => (
                                <li key={i} className="analytics-stock-row">
                                    <div className="analytics-stock-dot" />
                                    <span className="flex-1 text-sm font-bold text-[var(--analytics-text)]">{p.name}</span>
                                    {p.size && (
                                        <span className="analytics-stock-pill">
                                            {p.size}
                                        </span>
                                    )}
                                    <span className={`analytics-stock-quantity ${(p.quantity ?? 0) <= 3
                                            ? "analytics-stock-critical"
                                            : "analytics-stock-caution"
                                        }`}>
                                        {p.quantity} left
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

        </div>
    );
}
