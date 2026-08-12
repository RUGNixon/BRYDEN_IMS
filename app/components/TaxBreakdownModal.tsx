"use client";

import { useState } from "react";
import { X, Search, Download, Printer, FileText, CheckCircle2, TrendingUp, DollarSign, Calendar, Info, Layers, Receipt, ShieldCheck } from "lucide-react";
import { fmtCurrency, fmtQty } from "@/lib/format";

interface SaleItem {
    id: number;
    clientName: string;
    productName: string;
    size: string;
    quantity: number;
    sellingPrice: number;
    profits: number;
    vat: number;
    date: string;
}

interface TaxData {
    monthLabel: string;
    year: number;
    month: number;
    vat: {
        totalVat: number;
        totalSalesRevenue: number;
        taxableBase: number;
        transactionCount: number;
        rate: string;
        dueDate: string;
        salesList: SaleItem[];
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

interface TaxBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    taxType: "vat" | "cit" | "patente" | "paye" | null;
    data: TaxData | null;
}

export default function TaxBreakdownModal({
    isOpen,
    onClose,
    taxType,
    data,
}: TaxBreakdownModalProps) {
    const [searchTerm, setSearchTerm] = useState("");

    if (!isOpen || !taxType || !data) return null;

    const formattedDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    // Filter sales for VAT table
    const filteredSales = data.vat.salesList.filter((s) =>
        s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.size.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportCSV = () => {
        if (taxType !== "vat" || !data.vat.salesList.length) return;
        const headers = ["Sale ID", "Date", "Client Name", "Product", "Size", "Quantity", "Selling Price", "Total Amount", "VAT (18%)"];
        const rows = data.vat.salesList.map(s => [
            s.id,
            s.date,
            `"${s.clientName.replace(/"/g, '""')}"`,
            `"${s.productName.replace(/"/g, '""')}"`,
            s.size,
            s.quantity,
            s.sellingPrice,
            (s.sellingPrice * s.quantity).toFixed(2),
            s.vat,
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `VAT_Accumulation_Report_${data.monthLabel.replace(/\s+/g, "_")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">

                {/* ── Modal Header ── */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                            {taxType === "vat" && <Receipt size={24} />}
                            {taxType === "cit" && <TrendingUp size={24} />}
                            {taxType === "patente" && <ShieldCheck size={24} />}
                            {taxType === "paye" && <DollarSign size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-white">
                                    {taxType === "vat" && "Value Added Tax (VAT) Accumulation Report"}
                                    {taxType === "cit" && "Corporate Income Tax (CIT) Breakdown"}
                                    {taxType === "patente" && "Trading Licence (Patente) Breakdown"}
                                    {taxType === "paye" && "Pay As You Earn (PAYE) Breakdown"}
                                </h2>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                    {data.monthLabel}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">
                                {taxType === "vat" && "Detailed itemized sales ledger showing VAT accumulation for this month."}
                                {taxType === "cit" && "P&L tax reconciliation and estimated corporate liability calculation."}
                                {taxType === "patente" && "Annual business licence fee schedule based on projected turnover."}
                                {taxType === "paye" && "Progressive employee payroll tax deduction estimate breakdown."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Modal Body Content ── */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* VAT BREAKDOWN REPORT                                     */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {taxType === "vat" && (
                        <>
                            {/* KPI Metrics Strip */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col">
                                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total VAT Due (18%)</span>
                                    <span className="text-2xl font-extrabold text-indigo-900 mt-1">{fmtCurrency(data.vat.totalVat)}</span>
                                    <span className="text-xs text-indigo-600/80 mt-1">Output VAT Collected</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales Revenue</span>
                                    <span className="text-xl font-bold text-slate-900 mt-1">{fmtCurrency(data.vat.totalSalesRevenue)}</span>
                                    <span className="text-xs text-slate-400 mt-1">Total Sales Inc. VAT</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Taxable Base</span>
                                    <span className="text-xl font-bold text-slate-900 mt-1">{fmtCurrency(data.vat.taxableBase)}</span>
                                    <span className="text-xs text-slate-400 mt-1">Excl. 18% VAT</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales Transactions</span>
                                    <span className="text-xl font-bold text-slate-900 mt-1">{fmtQty(data.vat.transactionCount)}</span>
                                    <span className="text-xs text-slate-400 mt-1">Taxable Records</span>
                                </div>
                            </div>

                            {/* Search and Action Toolbar */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search client, product, or size..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={handleExportCSV}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors border border-indigo-200/60"
                                    >
                                        <Download size={15} /> Export CSV
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
                                    >
                                        <Printer size={15} /> Print
                                    </button>
                                </div>
                            </div>

                            {/* Itemized Sales Table */}
                            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Client Name</th>
                                                <th className="py-3 px-4">Product & Size</th>
                                                <th className="py-3 px-4 text-center">Qty</th>
                                                <th className="py-3 px-4 text-right">Selling Price</th>
                                                <th className="py-3 px-4 text-right">Total Amount</th>
                                                <th className="py-3 px-4 text-right bg-indigo-50/50 text-indigo-900">VAT (18%)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {filteredSales.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                                        No sales transactions found for this period.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredSales.map((sale) => {
                                                    const totalVal = sale.sellingPrice * sale.quantity;
                                                    return (
                                                        <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                                                            <td className="py-3 px-4 text-slate-500 font-medium text-xs whitespace-nowrap">
                                                                {formattedDate(sale.date)}
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-slate-900">
                                                                {sale.clientName}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className="font-medium text-slate-800">{sale.productName}</span>
                                                                {sale.size && (
                                                                    <span className="ml-2 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                                                        {sale.size}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-medium text-slate-700">
                                                                {fmtQty(sale.quantity)}
                                                            </td>
                                                            <td className="py-3 px-4 text-right text-slate-600">
                                                                {fmtCurrency(sale.sellingPrice)}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-semibold text-slate-900">
                                                                {fmtCurrency(totalVal)}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-bold text-indigo-700 bg-indigo-50/30">
                                                                {fmtCurrency(sale.vat || 0)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                        {filteredSales.length > 0 && (
                                            <tfoot>
                                                <tr className="bg-slate-900 text-white font-bold text-sm">
                                                    <td colSpan={3} className="py-3 px-4">Summary Total ({filteredSales.length} records)</td>
                                                    <td className="py-3 px-4 text-center">
                                                        {fmtQty(filteredSales.reduce((sum, s) => sum + s.quantity, 0))}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">-</td>
                                                    <td className="py-3 px-4 text-right">
                                                        {fmtCurrency(filteredSales.reduce((sum, s) => sum + (s.sellingPrice * s.quantity), 0))}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-indigo-300 bg-indigo-950/80">
                                                        {fmtCurrency(filteredSales.reduce((sum, s) => sum + (s.vat || 0), 0))}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* CIT BREAKDOWN REPORT                                     */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {taxType === "cit" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col">
                                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Estimated CIT Payable (30%)</span>
                                    <span className="text-2xl font-black text-emerald-950 mt-1">{fmtCurrency(data.cit.amountDue)}</span>
                                    <span className="text-xs text-emerald-600 mt-1">Based on Net Taxable Income</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Operating Profit</span>
                                    <span className="text-xl font-bold text-slate-900 mt-1">{fmtCurrency(data.cit.grossProfit)}</span>
                                    <span className="text-xs text-slate-400 mt-1">Sales Revenue minus COGS</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Operating Expenses</span>
                                    <span className="text-xl font-bold text-slate-900 mt-1">{fmtCurrency(data.cit.totalExpenses)}</span>
                                    <span className="text-xs text-slate-400 mt-1">Deductible Business Costs</span>
                                </div>
                            </div>

                            {/* P&L Tax Reconciliation Step-by-Step */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Layers size={18} className="text-emerald-600" /> CIT Tax Calculation Reconciliation
                                </h3>
                                <div className="space-y-3 font-mono text-sm">
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-600 font-sans">1. Gross Sales Revenue</span>
                                        <span className="font-semibold text-slate-900">{fmtCurrency(data.cit.grossRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 text-slate-500">
                                        <span className="font-sans">2. Less: Output VAT (18%)</span>
                                        <span>- {fmtCurrency(data.vat.totalVat)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                                        <span className="font-sans text-slate-800">3. Net Turnover (Taxable Revenue Base)</span>
                                        <span className="text-slate-900">{fmtCurrency(data.cit.taxableBase)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 text-slate-500">
                                        <span className="font-sans">4. Less: Cost of Goods Sold (COGS)</span>
                                        <span>- {fmtCurrency(data.cit.estimatedCogs)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 font-semibold text-emerald-900">
                                        <span className="font-sans">5. Gross Profit Margin</span>
                                        <span>{fmtCurrency(data.cit.grossProfit)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 text-slate-500">
                                        <span className="font-sans">6. Less: Allowed Operating Expenses</span>
                                        <span>- {fmtCurrency(data.cit.totalExpenses)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b-2 border-slate-300 font-bold text-base bg-slate-50 px-3 rounded-xl">
                                        <span className="font-sans text-slate-900">7. Net Taxable Income</span>
                                        <span className="text-slate-900">{fmtCurrency(data.cit.taxableNetProfit)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 font-bold text-base bg-emerald-100/70 text-emerald-950 px-3 rounded-xl border border-emerald-300">
                                        <span className="font-sans">8. CIT Payable (30% × Net Taxable Income)</span>
                                        <span>{fmtCurrency(data.cit.amountDue)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* PATENTE BREAKDOWN REPORT                                 */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {taxType === "patente" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col">
                                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Annual Licence Fee</span>
                                    <span className="text-2xl font-black text-amber-950 mt-1">{fmtCurrency(data.patente.annualFee)}</span>
                                    <span className="text-xs text-amber-700 mt-1">Due Annually by Jan 31</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Accrued Provision</span>
                                    <span className="text-xl font-bold text-slate-900 mt-1">{fmtCurrency(data.patente.monthlyAccrual)}</span>
                                    <span className="text-xs text-slate-400 mt-1">Monthly Reserve (1/12th)</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Turnover Bracket Tier</span>
                                    <span className="text-lg font-bold text-slate-900 mt-1">{data.patente.tier}</span>
                                    <span className="text-xs text-slate-400 mt-1">Run-rate: {fmtCurrency(data.patente.annualTurnoverProjection)}/yr</span>
                                </div>
                            </div>

                            {/* Turnover Bracket Table */}
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-amber-600" /> Trading Licence (Patente) Fee Scale
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                                                <th className="py-3 px-4">Licence Tier</th>
                                                <th className="py-3 px-4">Annual Business Turnover Range</th>
                                                <th className="py-3 px-4 text-right">Fixed Annual Fee</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr className={data.patente.annualFee === 40 ? "bg-amber-50/70 font-semibold text-amber-950" : ""}>
                                                <td className="py-3 px-4">Tier 1 (Micro)</td>
                                                <td className="py-3 px-4">Up to $2,000 / year</td>
                                                <td className="py-3 px-4 text-right">$40.00</td>
                                                <td className="py-3 px-4 text-center">
                                                    {data.patente.annualFee === 40 && <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-bold">Active Tier</span>}
                                                </td>
                                            </tr>
                                            <tr className={data.patente.annualFee === 100 ? "bg-amber-50/70 font-semibold text-amber-950" : ""}>
                                                <td className="py-3 px-4">Tier 2 (Standard)</td>
                                                <td className="py-3 px-4">$2,001 – $10,000 / year</td>
                                                <td className="py-3 px-4 text-right">$100.00</td>
                                                <td className="py-3 px-4 text-center">
                                                    {data.patente.annualFee === 100 && <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-bold">Active Tier</span>}
                                                </td>
                                            </tr>
                                            <tr className={data.patente.annualFee === 250 ? "bg-amber-50/70 font-semibold text-amber-950" : ""}>
                                                <td className="py-3 px-4">Tier 3 (Medium)</td>
                                                <td className="py-3 px-4">$10,001 – $50,000 / year</td>
                                                <td className="py-3 px-4 text-right">$250.00</td>
                                                <td className="py-3 px-4 text-center">
                                                    {data.patente.annualFee === 250 && <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-bold">Active Tier</span>}
                                                </td>
                                            </tr>
                                            <tr className={data.patente.annualFee === 500 ? "bg-amber-50/70 font-semibold text-amber-950" : ""}>
                                                <td className="py-3 px-4">Tier 4 (Large)</td>
                                                <td className="py-3 px-4">Above $50,000 / year</td>
                                                <td className="py-3 px-4 text-right">$500.00</td>
                                                <td className="py-3 px-4 text-center">
                                                    {data.patente.annualFee === 500 && <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-bold">Active Tier</span>}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* PAYE BREAKDOWN REPORT                                    */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {taxType === "paye" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl bg-cyan-50/80 border border-cyan-200 flex flex-col">
                                    <span className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">Total Monthly PAYE Due</span>
                                    <span className="text-2xl font-black text-cyan-950 mt-1">{fmtCurrency(data.paye.totalPaye)}</span>
                                    <span className="text-xs text-cyan-700 mt-1">Due by 15th of next month</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Monthly Payroll</span>
                                    <span className="text-xl font-bold text-slate-900 mt-1">{fmtCurrency(data.paye.estimatedPayroll)}</span>
                                    <span className="text-xs text-slate-400 mt-1">Gross Salary Basis</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payroll Entries Tracked</span>
                                    <span className="text-xl font-bold text-slate-900 mt-1">{data.paye.payrollEntriesCount} entries</span>
                                    <span className="text-xs text-slate-400 mt-1">Salary Expenses</span>
                                </div>
                            </div>

                            {/* Progressive PAYE Tax Scale */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <DollarSign size={18} className="text-cyan-600" /> PAYE Progressive Income Tax Scale
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                                                <th className="py-3 px-4">Tax Band</th>
                                                <th className="py-3 px-4">Monthly Income Bracket</th>
                                                <th className="py-3 px-4 text-right">Tax Rate</th>
                                                <th className="py-3 px-4 text-right">Estimated Tax Component</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            <tr>
                                                <td className="py-3 px-4">Band 1 (Tax Free)</td>
                                                <td className="py-3 px-4">Up to $600.00</td>
                                                <td className="py-3 px-4 text-right text-emerald-600 font-bold">0%</td>
                                                <td className="py-3 px-4 text-right text-slate-500">$0.00</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4">Band 2 (Standard)</td>
                                                <td className="py-3 px-4">$600.01 – $1,000.00</td>
                                                <td className="py-3 px-4 text-right text-cyan-600 font-bold">20%</td>
                                                <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                                                    {fmtCurrency(data.paye.estimatedPayroll > 600 ? Math.min(400, data.paye.estimatedPayroll - 600) * 0.20 : 0)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4">Band 3 (Upper)</td>
                                                <td className="py-3 px-4">Above $1,000.00</td>
                                                <td className="py-3 px-4 text-right text-blue-600 font-bold">30%</td>
                                                <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                                                    {fmtCurrency(data.paye.estimatedPayroll > 1000 ? (data.paye.estimatedPayroll - 1000) * 0.30 : 0)}
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-900 text-white font-bold">
                                                <td colSpan={3} className="py-3 px-4">Total Calculated PAYE</td>
                                                <td className="py-3 px-4 text-right text-cyan-300">{fmtCurrency(data.paye.totalPaye)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* ── Modal Footer ── */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                        <Info size={14} className="text-slate-400" /> Due Date: <strong className="text-slate-800 font-semibold">{data[taxType].dueDate}</strong>
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                    >
                        Close Breakdown
                    </button>
                </div>

            </div>
        </div>
    );
}
