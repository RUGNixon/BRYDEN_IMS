"use client";

import { useState, useEffect } from "react";
import { X, ReceiptText, Phone, Mail } from "lucide-react";

interface RecordExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    showToast?: (type: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

export default function RecordExpenseModal({ isOpen, onClose, onSuccess, showToast }: RecordExpenseModalProps) {
    const [personName, setPersonName] = useState("");
    const [personPhone, setPersonPhone] = useState("");
    const [personEmail, setPersonEmail] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

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
            
            if (showToast) showToast("success", "Expense Recorded", `Successfully recorded expense of $${parseFloat(amount).toFixed(2)} to ${personName}.`);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error logging expense:", error);
            if (showToast) showToast("error", "Save Failed", "Failed to record expense. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><ReceiptText size={20} className="text-red-500" />Record New Expense</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"><X size={20} /></button>
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
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-500 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-red-600/20 active:scale-95 transition-all">{isSubmitting ? "Saving..." : "Record Expense"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
