"use client";

import { useState, useEffect, useCallback } from "react";
import { Sale } from "@/lib/db";
import {
    ClipboardList, HandCoins, PackageCheck,
    X, CheckCircle2, XCircle, Layers
} from "lucide-react";
import { fmtCurrency, fmtQty } from "@/lib/format";

type ToastType = "success" | "error";
interface Toast { id: number; type: ToastType; title: string; message: string; }

function StatCard({
    icon, label, count, accent,
}: { icon: React.ReactNode; label: string; count: number; accent: string }) {
    return (
        <div className={`flex items-center gap-4 p-5 rounded-2xl border ${accent} bg-white shadow-sm`}>
            <div className={`p-3 rounded-xl ${accent.replace("border-", "bg-").replace("-200", "-50")} flex-shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-sm text-slate-500">{label}</p>
            </div>
        </div>
    );
}

interface RecordCardProps {
    sale: Sale;
    actionLabel?: string;
    onAction?: () => void;
    loading?: boolean;
    secondActionLabel?: string;
    onSecondAction?: () => void;
    secondLoading?: boolean;
    badges?: React.ReactNode;
}

function RecordCard({ sale, actionLabel, onAction, loading, secondActionLabel, onSecondAction, secondLoading, badges }: RecordCardProps) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-semibold text-slate-900 text-sm leading-tight">{sale.clientName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sale.productName} · {sale.size}</p>
                </div>
                {badges && <div className="flex gap-1 flex-wrap justify-end">{badges}</div>}
            </div>
            <div className="flex items-center justify-between gap-2">
                <div className="flex gap-3 text-xs text-slate-600">
                    <span className="font-medium">Qty: <span className="text-slate-800">{fmtQty(sale.quantity)}</span></span>
                    <span className="font-medium">Unit: <span className="text-emerald-600">{fmtCurrency(sale.sellingPrice)}</span></span>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                    {actionLabel && onAction && (
                        <button
                            onClick={onAction}
                            disabled={loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PackageCheck size={12} />
                            {loading ? "Updating…" : actionLabel}
                        </button>
                    )}
                    {secondActionLabel && onSecondAction && (
                        <button
                            onClick={onSecondAction}
                            disabled={secondLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <HandCoins size={12} />
                            {secondLoading ? "Updating…" : secondActionLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function OrdersLoansPage() {
    const [allRecords, setAllRecords] = useState<Sale[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [fulfilling, setFulfilling] = useState<string | number | null>(null);
    const [settling, setSettling] = useState<string | number | null>(null);

    const fetchSales = useCallback(async () => {
        try {
            const res = await fetch("/api/sales");
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setAllRecords(data);
        } catch (error) {
            console.error("Error fetching sales:", error);
        }
    }, []);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const handleFulfill = async (sale: Sale) => {
        if (!sale.id) return;
        setFulfilling(sale.id);
        try {
            const res = await fetch(`/api/sales/${sale.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: false }),
            });
            if (!res.ok) throw new Error("Update failed");
            showToast("success", "Order Fulfilled",
                `Order for ${sale.clientName} (${sale.productName} × ${sale.quantity}) has been marked as fulfilled and moved to sales.`);
            await fetchSales();
        } catch {
            showToast("error", "Update Failed", "Could not update the order. Please try again.");
        } finally {
            setFulfilling(null);
        }
    };

    const handleSettleLoan = async (sale: Sale) => {
        if (!sale.id) return;
        setSettling(sale.id);
        try {
            const res = await fetch(`/api/sales/${sale.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: false }),
            });
            if (!res.ok) throw new Error("Update failed");
            showToast("success", "Loan Settled",
                `The loan for ${sale.clientName} (${sale.productName} × ${sale.quantity}) has been marked as settled.`);
            await fetchSales();
        } catch {
            showToast("error", "Update Failed", "Could not update the loan. Please try again.");
        } finally {
            setSettling(null);
        }
    };

    // Segment data
    const orders = allRecords.filter(s => s.order && !s.status);
    const loans = allRecords.filter(s => s.status && !s.order);
    const both = allRecords.filter(s => s.order && s.status);

    const toastStyle: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; title: string }> = {
        success: { bg: "bg-emerald-50", border: "border-emerald-200", title: "text-emerald-800", icon: <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} /> },
        error: { bg: "bg-red-50", border: "border-red-200", title: "text-red-800", icon: <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} /> },
    };

    const SectionEmpty = ({ label }: { label: string }) => (
        <p className="text-sm text-slate-400 italic text-center py-6">{label}</p>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">

            {/* Toasts */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map(t => {
                    const s = toastStyle[t.type];
                    return (
                        <div key={t.id} className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg ${s.bg} ${s.border} animate-in slide-in-from-right-8 fade-in duration-300`}>
                            {s.icon}
                            <div className="flex-1">
                                <p className={`text-sm font-semibold ${s.title}`}>{t.title}</p>
                                <p className="text-sm text-slate-600 mt-0.5 leading-snug">{t.message}</p>
                            </div>
                            <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                        </div>
                    );
                })}
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders &amp; Loans</h1>
                <p className="text-slate-500 mt-1">Track pending orders and products given on loan.</p>
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <StatCard accent="border-indigo-200" count={orders.length} label="Pending Orders"
                    icon={<ClipboardList size={20} className="text-indigo-500" />} />
                <StatCard accent="border-amber-200" count={loans.length} label="Active Loans"
                    icon={<HandCoins size={20} className="text-amber-500" />} />
                <StatCard accent="border-purple-200" count={both.length} label="Order + Loan"
                    icon={<Layers size={20} className="text-purple-500" />} />
            </div>

            {/* Side-by-side: Orders | Loans */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

                {/* Orders column */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl"><ClipboardList size={16} /></div>
                        <h2 className="font-semibold text-slate-800 text-base">Pending Orders</h2>
                        <span className="ml-auto text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{orders.length}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {orders.length === 0
                            ? <SectionEmpty label="No pending orders" />
                            : orders.map(s => (
                                <RecordCard
                                    key={s.id} sale={s}
                                    actionLabel="Mark Fulfilled"
                                    onAction={() => handleFulfill(s)}
                                    loading={fulfilling === s.id}
                                />
                            ))
                        }
                    </div>
                </div>

                {/* Loans column */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-amber-100 text-amber-600 p-2 rounded-xl"><HandCoins size={16} /></div>
                        <h2 className="font-semibold text-slate-800 text-base">Active Loans</h2>
                        <span className="ml-auto text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{loans.length}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {loans.length === 0
                            ? <SectionEmpty label="No active loans" />
                            : loans.map(s => (
                                <RecordCard
                                    key={s.id} sale={s}
                                    actionLabel="Mark Settled"
                                    onAction={() => handleSettleLoan(s)}
                                    loading={settling === s.id}
                                    badges={<span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Loan</span>}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Both: Order + Loan */}
            {(both.length > 0 || true) && (
                <div className="bg-slate-50 border border-slate-200/70 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-xl"><Layers size={16} /></div>
                        <h2 className="font-semibold text-slate-800 text-base">Ordered &amp; On Loan</h2>
                        <span className="ml-auto text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{both.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {both.length === 0
                            ? <SectionEmpty label="No records match both conditions" />
                            : both.map(s => (
                                <RecordCard
                                    key={s.id} sale={s}
                                    actionLabel="Mark Fulfilled"
                                    onAction={() => handleFulfill(s)}
                                    loading={fulfilling === s.id}
                                    secondActionLabel="Mark Settled"
                                    onSecondAction={() => handleSettleLoan(s)}
                                    secondLoading={settling === s.id}
                                    badges={
                                        <>
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Order</span>
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Loan</span>
                                        </>
                                    }
                                />
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
