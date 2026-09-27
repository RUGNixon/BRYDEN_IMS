"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Calculator,
    Receipt,
    TrendingUp,
    ShieldCheck,
    DollarSign,
    Calendar,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    ArrowUpRight,
    Info,
    CheckCircle2,
    Clock,
    FileText,
} from "lucide-react";
import { fmtCurrency, fmtQty } from "@/lib/format";
import TaxBreakdownModal from "@/app/components/TaxBreakdownModal";

interface TaxData {
    monthLabel: string;
    year: number;
    month: number;
    isFilteredMonth: boolean;
    summary: {
        totalTaxDue: number;
        vatTotal: number;
        citTotal: number;
        patenteTotal: number;
        payeTotal: number;
    };
    vat: {
        totalVat: number;
        totalSalesRevenue: number;
        taxableBase: number;
        transactionCount: number;
        rate: string;
        dueDate: string;
        salesList: any[];
    };
    cit: {
        amountDue: number;
        rate: string;
        grossRevenue: number;
        taxableBase: number;
        estimatedCogs: number;
        grossProfit: number;
        totalExpenses: number;
        taxableNetProfit: number;
        dueDate: string;
    };
    patente: {
        annualFee: number;
        monthlyAccrual: number;
        tier: string;
        annualTurnoverProjection: number;
        dueDate: string;
    };
    paye: {
        totalPaye: number;
        estimatedPayroll: number;
        payrollEntriesCount: number;
        dueDate: string;
    };
}

export default function TaxationPage() {
    const [taxData, setTaxData] = useState<TaxData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${yyyy}-${mm}`;
    });

    const [activeModalTax, setActiveModalTax] = useState<"vat" | "cit" | "patente" | "paye" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTaxes = useCallback(async (monthStr: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/taxes?month=${monthStr}`);
            if (!res.ok) throw new Error("Failed to load taxes data");
            const data = await res.json();
            setTaxData(data);
        } catch (err) {
            console.error("Tax fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTaxes(selectedMonth);
    }, [selectedMonth, fetchTaxes]);

    const handleOpenModal = (taxType: "vat" | "cit" | "patente" | "paye") => {
        setActiveModalTax(taxType);
        setIsModalOpen(true);
    };

    const handleMonthChange = (offset: number) => {
        const [yearStr, monthStr] = selectedMonth.split("-");
        const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + offset, 1);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        setSelectedMonth(`${yyyy}-${mm}`);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            {/* ── Page Header & Navigation ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Calculator size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Tax Obligations & Calculation Hub
                            </h1>
                            <p className="text-slate-500 text-sm mt-0.5 font-medium">
                                Automated business tax tracking, real-time calculations, and itemized accumulation reports.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Period Selector & Recalculate */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                    <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
                        <button
                            onClick={() => handleMonthChange(-1)}
                            className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-none hover:shadow-sm"
                            title="Previous Month"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="px-4 font-bold text-sm text-slate-800 flex items-center gap-2">
                            <Calendar size={16} className="text-indigo-600" />
                            <span>{taxData?.monthLabel || selectedMonth}</span>
                        </div>
                        <button
                            onClick={() => handleMonthChange(1)}
                            className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-none hover:shadow-sm"
                            title="Next Month"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => fetchTaxes(selectedMonth)}
                        disabled={isLoading}
                        className="p-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        title="Refresh Tax Data"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin text-indigo-600" : ""} />
                    </button>
                </div>
            </div>

            {/* ── Aggregate Tax Summary Banner ── */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
                            <Clock size={14} /> Total Estimated Tax Due ({taxData?.monthLabel || "This Month"})
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            {isLoading ? (
                                <span className="inline-block w-48 h-10 bg-white/10 rounded-xl animate-pulse" />
                            ) : (
                                fmtCurrency(taxData?.summary.totalTaxDue || 0)
                            )}
                        </h2>
                        <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-xl">
                            Combined total of calculated VAT, Corporate Income Tax provision, Trading License accrual, and PAYE deductions for the current period.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="text-center p-2">
                            <span className="text-[11px] font-bold text-indigo-300 uppercase block">VAT (18%)</span>
                            <span className="text-sm md:text-base font-extrabold text-white mt-0.5 block">
                                {fmtCurrency(taxData?.summary.vatTotal || 0)}
                            </span>
                        </div>
                        <div className="text-center p-2 border-l border-white/10">
                            <span className="text-[11px] font-bold text-emerald-300 uppercase block">CIT (30%)</span>
                            <span className="text-sm md:text-base font-extrabold text-white mt-0.5 block">
                                {fmtCurrency(taxData?.summary.citTotal || 0)}
                            </span>
                        </div>
                        <div className="text-center p-2 border-l border-white/10">
                            <span className="text-[11px] font-bold text-amber-300 uppercase block">Patente</span>
                            <span className="text-sm md:text-base font-extrabold text-white mt-0.5 block">
                                {fmtCurrency(taxData?.summary.patenteTotal || 0)}
                            </span>
                        </div>
                        <div className="text-center p-2 border-l border-white/10">
                            <span className="text-[11px] font-bold text-cyan-300 uppercase block">PAYE</span>
                            <span className="text-sm md:text-base font-extrabold text-white mt-0.5 block">
                                {fmtCurrency(taxData?.summary.payeTotal || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 4 Primary Tax Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 1. VAT CARD (Value Added Tax)                             */}
                {/* ═════════════════════════════════════════════════════════ */}
                <div
                    onClick={() => handleOpenModal("vat")}
                    className="glass-card group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                    <div className="p-6 md:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 group-hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-all flex items-center justify-center shadow-sm">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        Value Added Tax (VAT)
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-400">Sales Consumption Tax</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                                18% Standard Rate
                            </span>
                        </div>

                        <div className="my-6">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Due Tax As Far As This Month</span>
                            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                {isLoading ? (
                                    <div className="w-36 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                                ) : (
                                    fmtCurrency(taxData?.vat.totalVat || 0)
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium">Accumulating From</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                    {taxData?.vat.transactionCount || 0} Sales Transactions
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Filing Deadline</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                                    {taxData?.vat.dueDate || "15th of next month"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3.5 bg-indigo-50/50 dark:bg-indigo-950/40 group-hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 group-hover:text-white font-bold text-xs flex items-center justify-between border-t border-indigo-100/60 dark:border-indigo-900/40 transition-all">
                        <span>Click to view VAT Accumulation Report & Itemized Sales</span>
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </div>

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 2. CIT CARD (Corporate Income Tax)                        */}
                {/* ═════════════════════════════════════════════════════════ */}
                <div
                    onClick={() => handleOpenModal("cit")}
                    className="glass-card group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                    <div className="p-6 md:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 group-hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-all flex items-center justify-center shadow-sm">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        Corporate Income Tax (CIT)
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-400">Net Profit Business Tax</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                                30% Profit Rate
                            </span>
                        </div>

                        <div className="my-6">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Estimated Tax Due This Month</span>
                            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                {isLoading ? (
                                    <div className="w-36 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                                ) : (
                                    fmtCurrency(taxData?.cit.amountDue || 0)
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium">Taxable Net Profit Basis</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                    {fmtCurrency(taxData?.cit.taxableNetProfit || 0)}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Filing Schedule</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                    Quarterly / Annual
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3.5 bg-emerald-50/50 dark:bg-emerald-950/40 group-hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 group-hover:text-white font-bold text-xs flex items-center justify-between border-t border-emerald-100/60 dark:border-emerald-900/40 transition-all">
                        <span>Click to view P&L Tax Reconciliation Breakdown</span>
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </div>

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 3. PATENTE CARD (Trading License)                        */}
                {/* ═════════════════════════════════════════════════════════ */}
                <div
                    onClick={() => handleOpenModal("patente")}
                    className="glass-card group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                    <div className="p-6 md:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 group-hover:bg-amber-600 text-amber-600 dark:text-amber-400 group-hover:text-white transition-all flex items-center justify-center shadow-sm">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        Trading Licence (Patente)
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-400">Annual Business License Fee</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-full border border-amber-200/60 dark:border-amber-800/60">
                                {taxData?.patente.tier || "Turnover Based"}
                            </span>
                        </div>

                        <div className="my-6">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Monthly Accrued Provision</span>
                            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                {isLoading ? (
                                    <div className="w-36 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                                ) : (
                                    fmtCurrency(taxData?.patente.monthlyAccrual || 0)
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium">Annual License Obligation</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                    {fmtCurrency(taxData?.patente.annualFee || 0)} / yr
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Due Date</span>
                                <span className="font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                                    January 31st
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3.5 bg-amber-50/50 dark:bg-amber-950/40 group-hover:bg-amber-600 text-amber-700 dark:text-amber-300 group-hover:text-white font-bold text-xs flex items-center justify-between border-t border-amber-100/60 dark:border-indigo-900/40 transition-all">
                        <span>Click to view Turnover Bracket & Fee Schedule</span>
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </div>

                {/* ═════════════════════════════════════════════════════════ */}
                {/* 4. PAYE CARD (Pay As You Earn)                            */}
                {/* ═════════════════════════════════════════════════════════ */}
                <div
                    onClick={() => handleOpenModal("paye")}
                    className="glass-card group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                    <div className="p-6 md:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/70 group-hover:bg-cyan-600 text-cyan-600 dark:text-cyan-400 group-hover:text-white transition-all flex items-center justify-center shadow-sm">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                        Pay As You Earn (PAYE)
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-400">Employee Payroll Tax Deduction</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold text-xs rounded-full border border-cyan-200/60 dark:border-cyan-800/60">
                                Progressive Scale
                            </span>
                        </div>

                        <div className="my-6">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Estimated Monthly PAYE Due</span>
                            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                {isLoading ? (
                                    <div className="w-36 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                                ) : (
                                    fmtCurrency(taxData?.paye.totalPaye || 0)
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium">Payroll Gross Basis</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                    {fmtCurrency(taxData?.paye.estimatedPayroll || 0)}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Declaration Due</span>
                                <span className="font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 block">
                                    15th of next month
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3.5 bg-cyan-50/50 dark:bg-cyan-950/40 group-hover:bg-cyan-600 text-cyan-700 dark:text-cyan-300 group-hover:text-white font-bold text-xs flex items-center justify-between border-t border-cyan-100/60 dark:border-cyan-900/40 transition-all">
                        <span>Click to view Employee Payroll Tax Bracket Scale</span>
                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </div>

            </div>

            {/* ── Tax Accumulation & Compliance Modal ── */}
            <TaxBreakdownModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                taxType={activeModalTax}
                data={taxData}
            />
        </div>
    );
}
