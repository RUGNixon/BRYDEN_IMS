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
const INITIAL_TRANSACTION_LIMIT = 15;
const TRANSACTION_INCREMENT = 20;

function StatCard({
    icon, label, count, accent,
}: { icon: React.ReactNode; label: string; count: number; accent: string }) {
    return (
        <div className="ops-metric-card">
            <div className="ops-metric-icon">
                {icon}
            </div>
            <div>
                <p className="ops-metric-value">{count}</p>
                <p className="ops-metric-label">{label}</p>
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
        <div className="ops-record-card">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="ops-strong text-sm leading-tight">{sale.clientName}</p>
                    <p className="ops-muted text-xs mt-0.5">{sale.productName} · {sale.size}</p>
                </div>
                {badges && <div className="flex gap-1 flex-wrap justify-end">{badges}</div>}
            </div>
            <div className="flex items-center justify-between gap-2">
                <div className="flex gap-3 text-xs ops-muted">
                    <span className="font-medium">Qty: <span className="ops-strong">{fmtQty(sale.quantity)}</span></span>
                    <span className="font-medium">Unit: <span className="ops-accent-text">{fmtCurrency(sale.sellingPrice)}</span></span>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                    {actionLabel && onAction && (
                        <button
                            onClick={onAction}
                            disabled={loading}
                            className="ops-secondary-button ops-record-action ops-record-action-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PackageCheck size={12} />
                            {loading ? "Updating…" : actionLabel}
                        </button>
                    )}
                    {secondActionLabel && onSecondAction && (
                        <button
                            onClick={onSecondAction}
                            disabled={secondLoading}
                            className="ops-secondary-button ops-record-action ops-record-action-warning disabled:opacity-50 disabled:cursor-not-allowed"
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
    const [visibleCounts, setVisibleCounts] = useState({
        orders: INITIAL_TRANSACTION_LIMIT,
        loans: INITIAL_TRANSACTION_LIMIT,
        both: INITIAL_TRANSACTION_LIMIT,
    });
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
    const visibleOrders = orders.slice(0, visibleCounts.orders);
    const visibleLoans = loans.slice(0, visibleCounts.loans);
    const visibleBoth = both.slice(0, visibleCounts.both);

    const showMore = (group: keyof typeof visibleCounts) => {
        setVisibleCounts(current => ({
            ...current,
            [group]: current[group] + TRANSACTION_INCREMENT,
        }));
    };

    const toastStyle: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; title: string }> = {
        success: { bg: "ops-toast-success", border: "", title: "", icon: <CheckCircle2 className="text-[var(--ops-positive)] shrink-0 mt-0.5" size={18} /> },
        error: { bg: "ops-toast-error", border: "", title: "", icon: <XCircle className="text-[var(--ops-danger)] shrink-0 mt-0.5" size={18} /> },
    };

    const SectionEmpty = ({ label }: { label: string }) => (
        <p className="ops-muted text-sm italic text-center py-6">{label}</p>
    );

    return (
        <div className="operations-page ops-accent-indigo min-h-full">
            <div className="ops-shell">

            {/* Toasts */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map(t => {
                    const s = toastStyle[t.type];
                    return (
                        <div key={t.id} className={`pointer-events-auto ops-toast ${s.bg} animate-in slide-in-from-right-8 fade-in duration-300`}>
                            {s.icon}
                            <div className="flex-1">
                                <p className="ops-strong text-sm">{t.title}</p>
                                <p className="ops-muted text-sm mt-0.5 leading-snug">{t.message}</p>
                            </div>
                    <button onClick={() => dismissToast(t.id)} className="ops-icon-button"><X size={16} /></button>
                        </div>
                    );
                })}
            </div>

            {/* Header */}
            <header className="ops-header">
                <div>
                    <div className="ops-eyebrow"><ClipboardList size={16} aria-hidden="true" /> Fulfilment</div>
                    <h1>Orders &amp; loans</h1>
                    <p>Track pending orders, active loans, and the actions needed to close them.</p>
                </div>
            </header>

            {/* Summary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard accent="border-indigo-200" count={orders.length} label="Pending Orders"
                    icon={<ClipboardList size={20} className="text-indigo-500" />} />
                <StatCard accent="border-amber-200" count={loans.length} label="Active Loans"
                    icon={<HandCoins size={20} className="text-amber-500" />} />
                <StatCard accent="border-purple-200" count={both.length} label="Order + Loan"
                    icon={<Layers size={20} className="text-purple-500" />} />
            </div>

            {/* Side-by-side: Orders | Loans */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Orders column */}
                <div className="ops-card ops-section-card">
                    <div className="ops-section-header">
                        <div className="ops-section-icon ops-section-icon-primary"><ClipboardList size={16} /></div>
                        <h2>Pending orders</h2>
                        <span className="ops-pill ml-auto">{orders.length}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {orders.length === 0
                            ? <SectionEmpty label="No pending orders" />
                            : visibleOrders.map(s => (
                                <RecordCard
                                    key={s.id} sale={s}
                                    actionLabel="Mark Fulfilled"
                                    onAction={() => handleFulfill(s)}
                                    loading={fulfilling === s.id}
                                />
                            ))
                        }
                    </div>
                    {orders.length > visibleOrders.length && <div className="ops-section-footer"><span className="ops-pagination-text">Showing {visibleOrders.length} of {orders.length}</span><button className="ops-show-more-button" onClick={() => showMore("orders")}>Show {Math.min(TRANSACTION_INCREMENT, orders.length - visibleOrders.length)} more transactions</button></div>}
                </div>

                {/* Loans column */}
                <div className="ops-card ops-section-card">
                    <div className="ops-section-header">
                        <div className="ops-section-icon ops-section-icon-warning"><HandCoins size={16} /></div>
                        <h2>Active loans</h2>
                        <span className="ops-pill ml-auto">{loans.length}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {loans.length === 0
                            ? <SectionEmpty label="No active loans" />
                            : visibleLoans.map(s => (
                                <RecordCard
                                    key={s.id} sale={s}
                                    actionLabel="Mark Settled"
                                    onAction={() => handleSettleLoan(s)}
                                    loading={settling === s.id}
                                    badges={<span className="ops-pill ops-pill-warning">Loan</span>}
                                />
                            ))
                        }
                    </div>
                    {loans.length > visibleLoans.length && <div className="ops-section-footer"><span className="ops-pagination-text">Showing {visibleLoans.length} of {loans.length}</span><button className="ops-show-more-button" onClick={() => showMore("loans")}>Show {Math.min(TRANSACTION_INCREMENT, loans.length - visibleLoans.length)} more transactions</button></div>}
                </div>
            </div>

            {/* Both: Order + Loan */}
            {(both.length > 0 || true) && (
                <div className="ops-card ops-section-card">
                    <div className="ops-section-header">
                        <div className="ops-section-icon ops-section-icon-mixed"><Layers size={16} /></div>
                        <h2>Ordered &amp; on loan</h2>
                        <span className="ops-pill ml-auto">{both.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {both.length === 0
                            ? <SectionEmpty label="No records match both conditions" />
                            : visibleBoth.map(s => (
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
                                            <span className="ops-pill">Order</span>
                                            <span className="ops-pill ops-pill-warning">Loan</span>
                                        </>
                                    }
                                />
                            ))
                        }
                    </div>
                    {both.length > visibleBoth.length && <div className="ops-section-footer"><span className="ops-pagination-text">Showing {visibleBoth.length} of {both.length}</span><button className="ops-show-more-button" onClick={() => showMore("both")}>Show {Math.min(TRANSACTION_INCREMENT, both.length - visibleBoth.length)} more transactions</button></div>}
                </div>
            )}
            </div>
        </div>
    );
}
