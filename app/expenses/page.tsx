"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense } from "@/lib/db";
import { Plus, X, ReceiptText, Phone, Mail } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import ContactPopup from "@/app/components/ContactPopup";

interface ContactState {
    name: string;
    phone?: string | null;
    email?: string | null;
    position: { x: number; y: number };
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [contact, setContact] = useState<ContactState | null>(null);

    // Form state
    const [personName, setPersonName] = useState("");
    const [personPhone, setPersonPhone] = useState("");
    const [personEmail, setPersonEmail] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchExpenses = useCallback(async () => {
        try {
            const res = await fetch("/api/expenses");
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setExpenses(data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personName,
                    description,
                    amount: parseFloat(amount),
                    date,
                    phone: personPhone || null,
                    email: personEmail || null,
                }),
            });
            if (!res.ok) throw new Error("Failed to record expense");
            setPersonName(""); setPersonPhone(""); setPersonEmail("");
            setDescription(""); setAmount("");
            setDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(false);
            await fetchExpenses();
        } catch (error) {
            console.error("Error logging expense:", error);
            alert("Failed to record expense. Please try again.");
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

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    return (
        <div className="p-8 max-w-7xl mx-auto">

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

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expenses</h1>
                    <p className="text-slate-500 mt-1">Record and track company payments and expenses.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">{fmtCurrency(totalExpenses)}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-red-600/20 active:scale-95 transition-all flex items-center gap-2">
                        <Plus size={18} /> Record Expense
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4"><ReceiptText size={32} /></div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No expenses recorded</h3>
                        <p className="text-slate-500 max-w-sm mb-6">You haven&apos;t added any company expenses yet.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-red-600 font-medium hover:text-red-700 transition-colors">+ Record your first expense</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-sm font-medium">
                                    <th className="p-4 pl-6">Date</th>
                                    <th className="p-4">Payee / Person Name</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 pr-6 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expenses.map((expense) => {
                                    const hasContact = expense.phone || expense.email;
                                    return (
                                        <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 pl-6 text-slate-500 font-medium whitespace-nowrap">
                                                {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={(e) => handleNameClick(expense, e)}
                                                    className={`flex items-center gap-2 transition-colors ${hasContact ? "text-indigo-700 hover:text-indigo-900 cursor-pointer" : "text-slate-900 cursor-default"}`}
                                                    title={hasContact ? "Click to view contact" : undefined}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shrink-0">{expense.personName.charAt(0)}</div>
                                                    <span className="font-medium">{expense.personName}</span>
                                                    {hasContact && <Phone size={11} className="text-indigo-400 shrink-0" />}
                                                </button>
                                            </td>
                                            <td className="p-4 text-slate-600 max-w-md truncate">{expense.description}</td>
                                            <td className="p-4 pr-6 text-right text-slate-900 font-semibold">{fmtCurrency(Number(expense.amount))}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Record Expense Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
                            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><ReceiptText size={20} className="text-red-500" />Record New Expense</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Payee Info */}
                            <div className="mb-5">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Payee Information</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Payee / Person Name <span className="text-red-400">*</span></label>
                                        <input required value={personName} onChange={(e) => setPersonName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900" placeholder="e.g. John Doe, Office Depot" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Phone size={13} className="text-slate-400" />Phone <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                                            <input value={personPhone} onChange={(e) => setPersonPhone(e.target.value)} type="tel" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900" placeholder="+1 555 0000" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Mail size={13} className="text-slate-400" />Email <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                                            <input value={personEmail} onChange={(e) => setPersonEmail(e.target.value)} type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900" placeholder="email@example.com" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expense Details */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expense Details</h3>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Date <span className="text-red-400">*</span></label>
                                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Amount ($) <span className="text-red-400">*</span></label>
                                    <input type="number" min="0" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900 text-lg font-medium" placeholder="0.00" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Description / Reason <span className="text-red-400">*</span></label>
                                    <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900 resize-none" placeholder="e.g. Monthly internet bill, office supplies..." />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-500 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-red-600/20 active:scale-95 transition-all">{isSubmitting ? "Saving..." : "Record Expense"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
