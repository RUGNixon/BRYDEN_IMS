"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HandCoins, ShoppingBag, Clock, ArrowRight, UserCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface ListItem {
    clientName: string;
    productName: string;
    size: string;
    amount: number;
    date: string;
}

interface ListsData {
    loans: ListItem[];
    orders: ListItem[];
}

interface ListCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    items: ListItem[];
    type: "loan" | "order";
    emptyMsg: string;
    viewAllHref: string;
}

function ListCard({ title, subtitle, icon, items, type, emptyMsg, viewAllHref }: ListCardProps) {
    const isLoan = type === "loan";
    const totalSum = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const theme = isLoan
        ? {
            iconBox: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/70 dark:border-amber-900/50",
            badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60",
            dot: "bg-amber-500",
            hoverItem: "hover:border-amber-300/80 dark:hover:border-amber-800/80 hover:bg-amber-50/20 dark:hover:bg-amber-950/20",
            amountColor: "text-amber-600 dark:text-amber-400",
            avatarBg: "from-amber-400 to-orange-500",
            tag: "Active Loan",
            tagBg: "bg-amber-100/80 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50",
        }
        : {
            iconBox: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200/70 dark:border-sky-900/50",
            badge: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60",
            dot: "bg-sky-500",
            hoverItem: "hover:border-sky-300/80 dark:hover:border-sky-800/80 hover:bg-sky-50/20 dark:hover:bg-sky-950/20",
            amountColor: "text-sky-600 dark:text-sky-400",
            avatarBg: "from-sky-400 to-indigo-500",
            tag: "Pending Order",
            tagBg: "bg-sky-100/80 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/50",
        };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/70 dark:border-slate-800 flex flex-col h-full transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border shadow-xs shrink-0 ${theme.iconBox}`}>
                        {icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                {title}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 ${theme.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-pulse`}></span>
                                {items.length} {items.length === 1 ? "Record" : "Records"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            Total Outstanding
                        </span>
                        <span className={`text-base font-black tracking-tight ${theme.amountColor}`}>
                            {fmtCurrency(totalSum)}
                        </span>
                    </div>
                )}
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto max-h-[380px] pr-1.5 space-y-3 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{emptyMsg}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                            {isLoan ? "All customer credit accounts are settled." : "No customer orders waiting for dispatch."}
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-2.5">
                        {items.map((item, idx) => {
                            const initial = item.clientName ? item.clientName.charAt(0).toUpperCase() : "?";
                            let formattedDate = item.date;
                            try {
                                formattedDate = new Date(item.date).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });
                            } catch {}

                            return (
                                <li
                                    key={idx}
                                    className={`group p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/40 transition-all duration-200 flex items-center justify-between gap-3.5 ${theme.hoverItem}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Client Initial Avatar */}
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0`}>
                                            {initial}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors" title={item.clientName}>
                                                    {item.clientName}
                                                </p>
                                                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border shrink-0 hidden sm:inline-block ${theme.tagBg}`}>
                                                    {theme.tag}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="font-medium truncate max-w-[140px] sm:max-w-[180px]" title={item.productName}>
                                                    {item.productName}
                                                </span>
                                                {item.size && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded shrink-0">
                                                        {item.size}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount & Date */}
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-sm text-slate-900 dark:text-white">
                                            {fmtCurrency(item.amount)}
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

            {/* Footer Quick Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Manage full records in Orders &amp; Loans
                </span>
                <Link
                    href={viewAllHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
                >
                    <span>View Details</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

export default function DashboardLists() {
    const [data, setData] = useState<ListsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const res = await fetch("/api/dashboard/lists");
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to load dashboard lists:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLists();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 h-[400px]"></div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 h-[400px]"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ListCard
                title="Active Loans"
                subtitle="Customers with outstanding balances"
                icon={<HandCoins className="w-5 h-5" />}
                items={data.loans}
                type="loan"
                emptyMsg="No active loans found"
                viewAllHref="/orders"
            />
            <ListCard
                title="Pending Orders"
                subtitle="Reserved customer orders awaiting delivery"
                icon={<ShoppingBag className="w-5 h-5" />}
                items={data.orders}
                type="order"
                emptyMsg="No pending orders right now"
                viewAllHref="/orders"
            />
        </div>
    );
}
