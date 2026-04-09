"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, TrendingUp, ReceiptText, Clock } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface Transaction {
    type: "sale" | "purchase" | "expense";
    party: string;
    description: string;
    size: string;
    amount: number;
    isLoan: boolean;
    isOrder: boolean;
    date: string;
}

const TYPE_CONFIG = {
    sale: {
        icon: <TrendingUp className="w-4 h-4" />,
        bg: "bg-emerald-50 border-emerald-100",
        iconBg: "bg-emerald-100 text-emerald-600",
        label: "Sale",
        labelColor: "bg-emerald-100 text-emerald-700",
        amountColor: "text-emerald-700",
    },
    purchase: {
        icon: <ShoppingCart className="w-4 h-4" />,
        bg: "bg-rose-50 border-rose-100",
        iconBg: "bg-rose-100 text-rose-600",
        label: "Purchase",
        labelColor: "bg-rose-100 text-rose-700",
        amountColor: "text-rose-700",
    },
    expense: {
        icon: <ReceiptText className="w-4 h-4" />,
        bg: "bg-orange-50 border-orange-100",
        iconBg: "bg-orange-100 text-orange-600",
        label: "Expense",
        labelColor: "bg-orange-100 text-orange-700",
        amountColor: "text-orange-700",
    },
};

export default function DashboardRecentTransactions() {
    const [data, setData] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/transactions")
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(setData)
            .catch(() => console.error("Failed to fetch recent transactions"))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm animate-pulse">
                <div className="h-6 w-48 bg-slate-100 rounded mb-6"></div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-50 rounded-2xl mb-3"></div>
                ))}
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-center">
                <Clock className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No transactions recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recent Transactions</h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Latest 10 operations across all categories</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full">
                    {data.length} Records
                </span>
            </div>

            <ul className="flex flex-col gap-3">
                {data.map((txn, idx) => {
                    const cfg = TYPE_CONFIG[txn.type];
                    return (
                        <li
                            key={idx}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-sm hover:bg-white ${cfg.bg}`}
                        >
                            {/* Type Icon */}
                            <div className={`p-2.5 rounded-xl shrink-0 ${cfg.iconBg}`}>
                                {cfg.icon}
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                                        {txn.party}
                                    </span>

                                    {/* Type badge */}
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.labelColor}`}>
                                        {cfg.label}
                                    </span>

                                    {/* Loan badge */}
                                    {txn.isLoan && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                            LOAN
                                        </span>
                                    )}

                                    {/* Order badge */}
                                    {txn.isOrder && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                                            ORDER
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-slate-500 font-medium truncate">
                                    {txn.description}
                                    {txn.size ? ` · ${txn.size}` : ""}
                                </p>
                            </div>

                            {/* Amount + Date */}
                            <div className="text-right shrink-0">
                                <p className={`font-bold text-sm ${cfg.amountColor}`}>
                                    {fmtCurrency(txn.amount)}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">
                                    {new Date(txn.date).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
