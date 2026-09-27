"use client";

import { useState, useEffect, useCallback } from "react";
import {
    PackageSearch,
    TrendingUp,
    CreditCard,
    ReceiptText,
    BadgeDollarSign,
    Plus,
    ShoppingCart,
    Truck,
    PackagePlus,
    ShoppingBag,
    X,
    CheckCircle2,
    XCircle,
    PackageX,
    AlertTriangle
} from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import DashboardChart from "@/app/components/DashboardChart";
import DashboardLists from "@/app/components/DashboardLists";
import DashboardExpensesChart from "@/app/components/DashboardExpensesChart";
import DashboardRecentTransactions from "@/app/components/DashboardRecentTransactions";
import DashboardTopProducts from "@/app/components/DashboardTopProducts";
import RecordSaleModal from "@/app/components/RecordSaleModal";
import RecordPurchaseModal from "@/app/components/RecordPurchaseModal";
import RecordExpenseModal from "@/app/components/RecordExpenseModal";
import AddProductModal from "@/app/components/AddProductModal";

interface DashboardStats {
    stockWorth: number;
    monthlySales: number;
    monthlyPurchases: number;
    monthlyExpenses: number;
    monthlyProfits: number;
}

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: number; type: ToastType; title: string; message: string; }

const toastConfig: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; titleColor: string }> = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", titleColor: "text-emerald-800", icon: <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} /> },
    error: { bg: "bg-red-50", border: "border-red-200", titleColor: "text-red-800", icon: <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} /> },
    warning: { bg: "bg-amber-50", border: "border-amber-200", titleColor: "text-amber-800", icon: <PackageX className="text-amber-500 shrink-0 mt-0.5" size={18} /> },
    info: { bg: "bg-blue-50", border: "border-blue-200", titleColor: "text-blue-800", icon: <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={18} /> },
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    subtext: string;
    amount: number;
    color: "indigo" | "emerald" | "rose" | "orange" | "teal";
    badgeText?: string;
    isLoading: boolean;
}

const statColorConfig = {
    indigo: {
        glow: "from-indigo-500/15 via-indigo-500/5 to-transparent",
        iconBox: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
        badge: "bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/50",
        dot: "bg-indigo-500",
        hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-indigo-500/10",
    },
    emerald: {
        glow: "from-emerald-500/15 via-emerald-500/5 to-transparent",
        iconBox: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
        badge: "bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50",
        dot: "bg-emerald-500",
        hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-500/10",
    },
    rose: {
        glow: "from-rose-500/15 via-rose-500/5 to-transparent",
        iconBox: "bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
        badge: "bg-rose-50/90 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50",
        dot: "bg-rose-500",
        hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-rose-500/10",
    },
    orange: {
        glow: "from-orange-500/15 via-orange-500/5 to-transparent",
        iconBox: "bg-orange-50 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/50",
        badge: "bg-orange-50/90 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/50",
        dot: "bg-orange-500",
        hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-orange-500/10",
    },
    teal: {
        glow: "from-teal-500/15 via-teal-500/5 to-transparent",
        iconBox: "bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50",
        badge: "bg-teal-50/90 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/50",
        dot: "bg-teal-500",
        hoverBorder: "hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-teal-500/10",
    },
};

function StatCard({ icon, label, subtext, amount, color, badgeText, isLoading }: StatCardProps) {
    const c = statColorConfig[color];

    return (
        <div className={`glass-card relative p-5 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group ${c.hoverBorder}`}>
            {/* Ambient Background Gradient Glow */}
            <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${c.glow} rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-125`}></div>

            {/* Top Row: Icon & Status Badge */}
            <div className="flex items-center justify-between gap-2 relative z-10">
                <div className={`p-2.5 rounded-2xl border shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0 ${c.iconBox}`}>
                    {icon}
                </div>
                {badgeText && (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${c.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`}></span>
                        {badgeText}
                    </span>
                )}
            </div>

            {/* Content: Label & Main Stat Value */}
            <div className="mt-4 relative z-10">
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                    {label}
                </h3>
                <div className="mt-1">
                    {isLoading ? (
                        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-3/4"></div>
                    ) : (
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                            {fmtCurrency(amount)}
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom Subtext / Status Line */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 relative z-10 font-medium">
                <span className="truncate">{subtext}</span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Modal Visibility States
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

    // Toasts State
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/dashboard/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats, refreshKey]);

    const handleActionSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Toast Notifications */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => {
                    const cfg = toastConfig[toast.type];
                    return (
                        <div key={toast.id} className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg ${cfg.bg} ${cfg.border} animate-in slide-in-from-right-8 fade-in duration-300`}>
                            {cfg.icon}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${cfg.titleColor}`}>{toast.title}</p>
                                <p className="text-sm text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
                            </div>
                            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-slate-400 hover:text-slate-600 shrink-0 mt-0.5"><X size={16} /></button>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                            Daily Quick Actions
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-lg">
                        Record daily sales, purchases, and expenses directly from your dashboard.
                    </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsSaleModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 hover:shadow-emerald-600/40 active:scale-95 transition-all duration-200"
                        title="Record a new sale"
                    >
                        <Plus size={16} className="shrink-0" />
                        <ShoppingCart size={16} className="shrink-0" />
                        <span>Record Sale</span>
                    </button>

                    <button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-900/30 hover:shadow-indigo-600/40 active:scale-95 transition-all duration-200"
                        title="Record a supplier purchase"
                    >
                        <Plus size={16} className="shrink-0" />
                        <Truck size={16} className="shrink-0" />
                        <span>Record Purchase</span>
                    </button>

                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-900/30 hover:shadow-rose-600/40 active:scale-95 transition-all duration-200"
                        title="Record a business expense"
                    >
                        <Plus size={16} className="shrink-0" />
                        <ReceiptText size={16} className="shrink-0" />
                        <span>Record Expense</span>
                    </button>

                    <button
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 hover:shadow-purple-600/40 active:scale-95 transition-all duration-200"
                        title="Add new product to inventory"
                    >
                        <Plus size={16} className="shrink-0" />
                        <PackagePlus size={16} className="shrink-0" />
                        <span>Add Product</span>
                    </button>

                    <button
                        onClick={() => setIsOrderModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-900/30 hover:shadow-amber-600/40 active:scale-95 transition-all duration-200"
                        title="Record a new customer order"
                    >
                        <Plus size={16} className="shrink-0" />
                        <ShoppingBag size={16} className="shrink-0" />
                        <span>Record Order</span>
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5">
                <StatCard
                    icon={<PackageSearch size={20} />}
                    label="Current Stock Worth"
                    subtext="Real-time inventory valuation"
                    amount={stats?.stockWorth || 0}
                    color="indigo"
                    badgeText="Live Assets"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={<TrendingUp size={20} />}
                    label="Monthly Sales"
                    subtext="Gross sales revenue"
                    amount={stats?.monthlySales || 0}
                    color="emerald"
                    badgeText="This Month"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={<CreditCard size={20} />}
                    label="Monthly Purchases"
                    subtext="Stock acquisitions cost"
                    amount={stats?.monthlyPurchases || 0}
                    color="rose"
                    badgeText="Restock"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={<ReceiptText size={20} />}
                    label="Monthly Expenses"
                    subtext="Total operating expenses"
                    amount={stats?.monthlyExpenses || 0}
                    color="orange"
                    badgeText="Operating"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={<BadgeDollarSign size={20} />}
                    label="Monthly Profits"
                    subtext="Net business gain"
                    amount={stats?.monthlyProfits || 0}
                    color="teal"
                    badgeText="Net Margin"
                    isLoading={isLoading}
                />
            </div>

            {/* Main Monthly Trends Chart spans full width */}
            <div className="w-full">
                <DashboardChart key={`chart-${refreshKey}`} />
            </div>

            {/* Expenses Donut Chart below it */}
            <div className="w-full">
                <DashboardExpensesChart key={`expenses-${refreshKey}`} />
            </div>

            {/* Recent Loans & Orders */}
            <DashboardLists key={`lists-${refreshKey}`} />

            {/* Recent Transactions + Frequently Bought — side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardRecentTransactions key={`transactions-${refreshKey}`} />
                <DashboardTopProducts key={`top-${refreshKey}`} />
            </div>

            {/* Modal Dialog Components */}
            <RecordSaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSuccess={handleActionSuccess}
                initialIsOrder={false}
                showToast={showToast}
            />

            <RecordSaleModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                onSuccess={handleActionSuccess}
                initialIsOrder={true}
                showToast={showToast}
            />

            <RecordPurchaseModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                onSuccess={handleActionSuccess}
                showToast={showToast}
            />

            <RecordExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSuccess={handleActionSuccess}
                showToast={showToast}
            />

            <AddProductModal
                isOpen={isAddProductModalOpen}
                onClose={() => setIsAddProductModalOpen(false)}
                onSuccess={handleActionSuccess}
                showToast={showToast}
            />
        </div>
    );
}
