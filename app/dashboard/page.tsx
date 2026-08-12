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

function StatCard({ icon, label, amount, accentColor, isLoading }: { icon: React.ReactNode, label: string, amount: number, accentColor: string, isLoading: boolean }) {
    return (
        <div className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${accentColor}`}>
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-white shadow-sm border ${accentColor.replace("border-", "text-").replace("-200", "-500")} shrink-0`}>
                    {icon}
                </div>
                <h3 className="font-semibold text-slate-600 text-sm tracking-wide uppercase">{label}</h3>
            </div>

            <div className="mt-2">
                {isLoading ? (
                    <div className="h-8 bg-slate-100 rounded animate-pulse w-3/4"></div>
                ) : (
                    <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        {fmtCurrency(amount)}
                    </p>
                )}
            </div>

            {/* Subtle background glow effect */}
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 bg-current pointer-events-none ${accentColor.replace('border-', 'text-').replace('-200', '-500')}`}></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard
                    icon={<PackageSearch size={24} className="text-indigo-600" />}
                    label="Current Stock Worth"
                    amount={stats?.stockWorth || 0}
                    accentColor="border-indigo-100 hover:border-indigo-300"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={<TrendingUp size={24} className="text-emerald-600" />}
                    label="Monthly Sales"
                    amount={stats?.monthlySales || 0}
                    accentColor="border-emerald-100 hover:border-emerald-300"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={<CreditCard size={24} className="text-rose-600" />}
                    label="Monthly Purchases"
                    amount={stats?.monthlyPurchases || 0}
                    accentColor="border-rose-100 hover:border-rose-300"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={<ReceiptText size={24} className="text-orange-600" />}
                    label="Monthly Expenses"
                    amount={stats?.monthlyExpenses || 0}
                    accentColor="border-orange-100 hover:border-orange-300"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={<BadgeDollarSign size={24} className="text-teal-600" />}
                    label="Monthly Profits"
                    amount={stats?.monthlyProfits || 0}
                    accentColor="border-teal-100 hover:border-teal-300"
                    isLoading={isLoading}
                />
            </div>

            {/* Layout Grid for complex UI below the cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Monthly Trends Chart spans 2 columns */}
                <div className="lg:col-span-2">
                    <DashboardChart key={`chart-${refreshKey}`} />
                </div>

                {/* Expenses Donut Chart spans 1 column */}
                <div className="lg:col-span-1">
                    <DashboardExpensesChart key={`expenses-${refreshKey}`} />
                </div>
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
