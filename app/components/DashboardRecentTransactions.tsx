"use client";

import { useEffect, useState, useMemo } from "react";
import { ShoppingCart, TrendingUp, ReceiptText, Clock, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";
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

type FilterType = "all" | "sale" | "purchase" | "expense";

const TYPE_CONFIG = {
    sale: {
        icon: <ArrowUpRight className="w-4 h-4" />,
        badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
        iconBox: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
        label: "Sale",
        amountPrefix: "+",
        amountColor: "text-emerald-600 dark:text-emerald-400",
    },
    purchase: {
        icon: <ArrowDownLeft className="w-4 h-4" />,
        badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60",
        iconBox: "bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
        label: "Purchase",
        amountPrefix: "-",
        amountColor: "text-rose-600 dark:text-rose-400",
    },
    expense: {
        icon: <ReceiptText className="w-4 h-4" />,
        badge: "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60",
        iconBox: "bg-orange-50 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/50",
        label: "Expense",
        amountPrefix: "-",
        amountColor: "text-orange-600 dark:text-orange-400",
    },
};

export default function DashboardRecentTransactions() {
    const [data, setData] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    useEffect(() => {
        fetch("/api/dashboard/transactions")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setData)
            .catch(() => console.error("Failed to fetch recent transactions"))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredTransactions = useMemo(() => {
        if (activeFilter === "all") return data;
        return data.filter((txn) => txn.type === activeFilter);
    }, [data, activeFilter]);

    if (isLoading) {
        return (
        <div className="glass-card bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm animate-pulse transition-colors">
                <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded mb-6"></div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-50 dark:bg-slate-950/40 rounded-2xl mb-3"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="glass-card bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col h-full transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Recent Transactions
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Latest ledger activity across sales, restocks, and operational costs
                    </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 self-start sm:self-auto">
                    {(["all", "sale", "purchase", "expense"] as FilterType[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveFilter(tab)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                                activeFilter === tab
                                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                            {tab === "all" ? "All" : `${tab}s`}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[380px] pr-1.5 custom-scrollbar">
                {!filteredTransactions.length ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-3">
                            <Clock className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No transactions recorded</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {activeFilter === "all"
                                ? "Transactions will appear once recorded in the system."
                                : `No ${activeFilter} transactions found.`}
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-2.5">
                        {filteredTransactions.map((txn, idx) => {
                            const cfg = TYPE_CONFIG[txn.type] || TYPE_CONFIG.sale;
                            let formattedDate = txn.date;
                            try {
                                formattedDate = new Date(txn.date).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });
                            } catch {}

                            return (
                                <li
                                    key={idx}
                                    className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-200/80 dark:hover:border-slate-700/80 transition-all duration-200 group"
                                >
                                    {/* Type Icon */}
                                    <div className={`p-2.5 rounded-xl border shadow-xs shrink-0 ${cfg.iconBox}`}>
                                        {cfg.icon}
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[160px] sm:max-w-[220px]" title={txn.party}>
                                                {txn.party}
                                            </span>

                                            {/* Type Badge */}
                                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider ${cfg.badge}`}>
                                                {cfg.label}
                                            </span>

                                            {/* Loan / Order Special Pills */}
                                            {txn.isLoan && (
                                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60 uppercase tracking-wider">
                                                    LOAN
                                                </span>
                                            )}
                                            {txn.isOrder && (
                                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded border bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60 uppercase tracking-wider">
                                                    ORDER
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="truncate max-w-[200px]" title={txn.description}>
                                                {txn.description}
                                            </span>
                                            {txn.size && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded shrink-0">
                                                    {txn.size}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount + Date */}
                                    <div className="text-right shrink-0">
                                        <p className={`font-black text-sm tracking-tight ${cfg.amountColor}`}>
                                            {cfg.amountPrefix} {fmtCurrency(txn.amount)}
                                        </p>
                                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                                            {formattedDate}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
