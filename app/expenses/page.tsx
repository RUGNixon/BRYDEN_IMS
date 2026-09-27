"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Expense } from "@/lib/db";
import {
    Plus,
    X,
    ReceiptText,
    Phone,
    Mail,
    Search,
    Calendar,
    CircleDollarSign,
    FileSpreadsheet,
    PieChart,
    ArrowUpRight,
    TrendingDown,
    Building,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Wallet,
    Tag,
    Filter,
    Layers
} from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import ContactPopup from "@/app/components/ContactPopup";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message: string;
}

interface ContactState {
    name: string;
    phone?: string | null;
    email?: string | null;
    position: { x: number; y: number };
}

const INITIAL_TRANSACTION_LIMIT = 15;
const TRANSACTION_INCREMENT = 20;

const QUICK_TAGS = [
    "Utilities",
    "Office Supplies",
    "Rent & Facilities",
    "Logistics / Fuel",
    "Equipment & Tools",
    "Wages / Labor",
    "Marketing",
    "Maintenance"
];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<"latest" | "amount-high" | "amount-low">("latest");
    const [visibleCount, setVisibleCount] = useState(INITIAL_TRANSACTION_LIMIT);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [contact, setContact] = useState<ContactState | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Form state
    const [personName, setPersonName] = useState("");
    const [personPhone, setPersonPhone] = useState("");
    const [personEmail, setPersonEmail] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const fetchExpenses = useCallback(async () => {
        try {
            const res = await fetch("/api/expenses");
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setExpenses(data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            showToast("error", "Error", "Failed to retrieve expense ledger.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    useEffect(() => {
        setVisibleCount(INITIAL_TRANSACTION_LIMIT);
    }, [searchTerm, selectedTag, sortBy]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personName: personName.trim(),
                    description: description.trim(),
                    amount: parseFloat(amount),
                    date,
                    phone: personPhone ? personPhone.trim() : null,
                    email: personEmail ? personEmail.trim() : null,
                }),
            });
            if (!res.ok) throw new Error("Failed to record expense");

            showToast("success", "Expense Logged", `Recorded ${fmtCurrency(parseFloat(amount))} disbursement to ${personName.trim()}.`);
            setPersonName("");
            setPersonPhone("");
            setPersonEmail("");
            setDescription("");
            setAmount("");
            setDate(new Date().toISOString().split("T")[0]);
            setIsModalOpen(false);
            await fetchExpenses();
        } catch (error) {
            console.error("Error logging expense:", error);
            showToast("error", "Save Failed", "Failed to record expense. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNameClick = (expense: Expense, e: React.MouseEvent) => {
        if (!expense.phone && !expense.email) return;
        e.stopPropagation();
        setContact({
            name: expense.personName,
            phone: expense.phone,
            email: expense.email,
            position: { x: e.clientX, y: e.clientY },
        });
    };

    // KPI Metrics calculation
    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    }, [expenses]);

    const avgExpense = useMemo(() => {
        if (expenses.length === 0) return 0;
        return totalExpenses / expenses.length;
    }, [totalExpenses, expenses]);

    const maxExpense = useMemo(() => {
        if (expenses.length === 0) return { amount: 0, payee: "None" };
        let max = expenses[0];
        for (const e of expenses) {
            if (Number(e.amount) > Number(max.amount)) {
                max = e;
            }
        }
        return { amount: Number(max.amount), payee: max.personName };
    }, [expenses]);

    // Filtering & Sorting
    const filteredExpenses = useMemo(() => {
        let list = expenses.filter(exp => {
            const matchesSearch =
                exp.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (exp.phone && exp.phone.includes(searchTerm));

            const matchesTag =
                selectedTag === "ALL" ||
                exp.description.toLowerCase().includes(selectedTag.toLowerCase());

            return matchesSearch && matchesTag;
        });

        if (sortBy === "amount-high") {
            list = [...list].sort((a, b) => Number(b.amount) - Number(a.amount));
        } else if (sortBy === "amount-low") {
            list = [...list].sort((a, b) => Number(a.amount) - Number(b.amount));
        } else {
            list = [...list].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        }

        return list;
    }, [expenses, searchTerm, selectedTag, sortBy]);

    const visibleExpenses = filteredExpenses.slice(0, visibleCount);
    const remainingExpenses = Math.max(filteredExpenses.length - visibleExpenses.length, 0);
    const nextExpensesCount = Math.min(TRANSACTION_INCREMENT, remainingExpenses);

    const handleAddQuickTag = (tag: string) => {
        if (!description.includes(tag)) {
            setDescription(prev => (prev ? `${prev} - ${tag}` : tag));
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">

            {/* Contact Popup */}
            {contact && (
                <ContactPopup
                    name={contact.name}
                    phone={contact.phone}
                    email={contact.email}
                    position={contact.position}
                    onClose={() => setContact(null)}
                />
            )}

            {/* Toast Notifications */}
            <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => {
                    const isSuccess = toast.type === "success";
                    const isError = toast.type === "error";
                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
                                isSuccess
                                    ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100"
                                    : isError
                                    ? "bg-rose-950/90 border-rose-500/40 text-rose-100"
                                    : "bg-slate-900/95 border-slate-700 text-white"
                            } ops-animate-fade`}
                        >
                            {isSuccess ? (
                                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                            ) : isError ? (
                                <XCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                            ) : (
                                <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold">{toast.title}</p>
                                <p className="text-xs opacity-85 mt-0.5 leading-snug">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="opacity-60 hover:opacity-100 shrink-0 mt-0.5 cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* ── Executive Hero Header Banner (Notes Inspired) ── */}
            <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden border border-rose-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3.5 mb-2.5">
                        <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-400/30 text-rose-300 shadow-inner">
                            <ReceiptText size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                                Expense Ledger
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30">
                                    OUTFLOWS
                                </span>
                            </h1>
                            <p className="text-slate-300 text-sm font-medium mt-0.5">
                                Track operational disbursements, vendor payments, recurring overhead, and company costs.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <TrendingDown size={13} className="text-rose-400" />
                            {fmtCurrency(totalExpenses)} total spend
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <FileSpreadsheet size={13} className="text-indigo-300" />
                            {expenses.length} expense vouchers
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <PieChart size={13} className="text-amber-300" />
                            {fmtCurrency(avgExpense)} avg ticket
                        </span>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-rose-950/50 hover:shadow-rose-500/30 active:scale-95 transition-all duration-200 cursor-pointer"
                        id="record-expense-btn"
                    >
                        <Plus size={18} />
                        <span>Record Expense</span>
                    </button>
                </div>
            </div>

            {/* ── KPI Stat Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Total Operating Expenses */}
                <div className="glass-card relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Operating Expenses
                        </span>
                        <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                            <ReceiptText size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                            {fmtCurrency(totalExpenses)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Across {expenses.length} recorded payments
                        </p>
                    </div>
                </div>

                {/* Stat 2: Total Disbursements Count */}
                <div className="glass-card relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Expense Vouchers
                        </span>
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {expenses.length} <span className="text-sm font-bold text-slate-400">entries</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Logged in audit registry
                        </p>
                    </div>
                </div>

                {/* Stat 3: Average Ticket Size */}
                <div className="glass-card relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Average Ticket Size
                        </span>
                        <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <PieChart size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                            {fmtCurrency(avgExpense)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Mean cost per disbursement
                        </p>
                    </div>
                </div>

                {/* Stat 4: Peak Outflow Entry */}
                <div className="glass-card relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Peak Outflow Entry
                        </span>
                        <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <ArrowUpRight size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {fmtCurrency(maxExpense.amount)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[200px]">
                            Payee: {maxExpense.payee}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Toolbar: Search & Quick Tag Pills & Sorting ── */}
            <div className="glass-card p-4 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by payee, note, or contact..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Clear search"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* Sorting */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sort:</span>
                        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70">
                            <button
                                onClick={() => setSortBy("latest")}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    sortBy === "latest"
                                        ? "bg-rose-600 text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                Latest
                            </button>
                            <button
                                onClick={() => setSortBy("amount-high")}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    sortBy === "amount-high"
                                        ? "bg-rose-600 text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                Highest
                            </button>
                            <button
                                onClick={() => setSortBy("amount-low")}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    sortBy === "amount-low"
                                        ? "bg-rose-600 text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                Lowest
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Tag Filter Bar */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
                        <Filter size={11} /> Filter:
                    </span>
                    <button
                        onClick={() => setSelectedTag("ALL")}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            selectedTag === "ALL"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        All Categories ({expenses.length})
                    </button>
                    {QUICK_TAGS.map((tag) => {
                        const count = expenses.filter(e => e.description.toLowerCase().includes(tag.toLowerCase())).length;
                        return (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    selectedTag === tag
                                        ? "bg-rose-600 text-white shadow-xs"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }`}
                            >
                                {tag} {count > 0 && <span className="opacity-75">({count})</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Table Container ── */}
            <div className="glass-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center min-h-[320px]">
                        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                        <p className="mt-4 font-bold text-slate-500 dark:text-slate-400 text-sm">Loading expense ledger...</p>
                    </div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center min-h-[340px]">
                        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 text-rose-500 flex items-center justify-center mb-3">
                            <ReceiptText size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            No expenses found
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                            {searchTerm || selectedTag !== "ALL"
                                ? "No expense vouchers match your active filters."
                                : "Log office rent, utilities, supplies, or employee wages to begin tracking company overhead."}
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-sm shadow-md cursor-pointer hover:opacity-95"
                        >
                            <Plus size={16} /> Record First Expense
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <th className="pl-6 py-4">Date</th>
                                        <th className="py-4">Payee / Recipient</th>
                                        <th className="py-4">Category / Note</th>
                                        <th className="text-right pr-6 py-4">Amount Disbursed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                                    {visibleExpenses.map((expense) => {
                                        const hasContact = expense.phone || expense.email;
                                        // Check if note matches any tag
                                        const matchedTag = QUICK_TAGS.find(t => expense.description.toLowerCase().includes(t.toLowerCase()));

                                        return (
                                            <tr
                                                key={expense.id}
                                                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <td className="pl-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={13} className="text-slate-400" />
                                                        <span>{expense.date ? new Date(expense.date).toLocaleDateString() : "N/A"}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <button
                                                        onClick={(e) => handleNameClick(expense, e)}
                                                        className={`flex items-center gap-2.5 font-bold text-left transition-all ${
                                                            hasContact
                                                                ? "text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                                                : "text-slate-900 dark:text-white cursor-default"
                                                        }`}
                                                        title={hasContact ? "Click to view payee contact" : undefined}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                                                            {expense.personName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="block truncate max-w-[180px] font-bold">{expense.personName}</span>
                                                            {hasContact && (
                                                                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                                                                    <Phone size={9} /> Contact available
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                </td>
                                                <td className="py-4 max-w-md">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {matchedTag && (
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 shrink-0">
                                                                {matchedTag}
                                                            </span>
                                                        )}
                                                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                                                            {expense.description}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-right pr-6 py-4">
                                                    <span className="text-base font-black text-rose-600 dark:text-rose-400 tracking-tight">
                                                        -{fmtCurrency(Number(expense.amount))}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Showing {visibleExpenses.length} of {filteredExpenses.length} expenses
                            </p>
                            {remainingExpenses > 0 && (
                                <button
                                    onClick={() => setVisibleCount(c => c + TRANSACTION_INCREMENT)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-xs"
                                >
                                    Show {nextExpensesCount} more records
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── Record Expense Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                                    <ReceiptText size={22} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                        Record Operating Expense
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Log payment disbursement to vendor or service provider
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Payee Info Box */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Building size={13} /> Payee Information
                                </h3>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Payee Name / Company <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        required
                                        value={personName}
                                        onChange={(e) => setPersonName(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                                        placeholder="e.g. Electric Power Co, Office Depot, Landlord"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            <Phone size={11} className="text-slate-400" /> Phone
                                        </label>
                                        <input
                                            value={personPhone}
                                            onChange={(e) => setPersonPhone(e.target.value)}
                                            type="tel"
                                            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                                            placeholder="+1 555 3302"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            <Mail size={11} className="text-slate-400" /> Email
                                        </label>
                                        <input
                                            value={personEmail}
                                            onChange={(e) => setPersonEmail(e.target.value)}
                                            type="email"
                                            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                                            placeholder="payee@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Details: Date & Amount */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Disbursement Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Amount Paid ($) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-base font-black text-rose-600 dark:text-rose-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Description with Quick Tags */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Description / Reason <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                                    placeholder="e.g. Monthly high-speed internet subscription..."
                                />

                                {/* Quick category chips */}
                                <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Tag size={10} /> Quick Tags:
                                    </span>
                                    {QUICK_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleAddQuickTag(tag)}
                                            className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                        >
                                            +{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    {isSubmitting ? "Saving..." : `Record Outflow (${amount ? fmtCurrency(parseFloat(amount) || 0) : "$0.00"})`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
