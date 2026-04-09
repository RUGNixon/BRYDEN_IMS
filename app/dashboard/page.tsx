"use client";

import { useState, useEffect } from "react";
import { PackageSearch, TrendingUp, CreditCard, ReceiptText } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import DashboardChart from "@/app/components/DashboardChart";
import DashboardLists from "@/app/components/DashboardLists";
import DashboardExpensesChart from "@/app/components/DashboardExpensesChart";
import DashboardRecentTransactions from "@/app/components/DashboardRecentTransactions";
import DashboardTopProducts from "@/app/components/DashboardTopProducts";

interface DashboardStats {
    stockWorth: number;
    monthlySales: number;
    monthlyPurchases: number;
    monthlyExpenses: number;
}

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

    useEffect(() => {
        const fetchStats = async () => {
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
        };

        fetchStats();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Key metrics and statistics for the current month.</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>

            {/* Layout Grid for complex UI below the cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Monthly Trends Chart spans 2 columns */}
                <div className="lg:col-span-2">
                    <DashboardChart />
                </div>

                {/* Expenses Donut Chart spans 1 column */}
                <div className="lg:col-span-1">
                    <DashboardExpensesChart />
                </div>
            </div>

            {/* Recent Loans & Orders */}
            <DashboardLists />

            {/* Recent Transactions + Frequently Bought — side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardRecentTransactions />
                <DashboardTopProducts />
            </div>
        </div>
    );
}
