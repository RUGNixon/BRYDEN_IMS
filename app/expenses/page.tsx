"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense } from "@/lib/db";
import { Plus, X, ReceiptText, Phone, Mail, Search } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import ContactPopup from "@/app/components/ContactPopup";

interface ContactState {
    name: string;
    phone?: string | null;
    email?: string | null;
    position: { x: number; y: number };
}

const INITIAL_TRANSACTION_LIMIT = 15;
const TRANSACTION_INCREMENT = 20;

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [visibleCount, setVisibleCount] = useState(INITIAL_TRANSACTION_LIMIT);
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

    useEffect(() => {
        setVisibleCount(INITIAL_TRANSACTION_LIMIT);
    }, [searchTerm]);

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
    const filteredExpenses = expenses.filter(exp =>
        exp.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const visibleExpenses = filteredExpenses.slice(0, visibleCount);
    const remainingExpenses = Math.max(filteredExpenses.length - visibleExpenses.length, 0);
    const nextExpensesCount = Math.min(TRANSACTION_INCREMENT, remainingExpenses);

    return (
        <div className="operations-page ops-accent-rose min-h-full">
            <div className="ops-shell">

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

            <div className="ops-header">
                <div>
                    <div className="ops-eyebrow"><ReceiptText size={16} aria-hidden="true" /> Expenses</div>
                    <h1 className="ops-title">Expense ledger</h1>
                    <p className="ops-subtitle">Record and track company payments, payees, and operating costs.</p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="ops-metric-chip">
                        <div>
                            <span>Total Expenses</span>
                            <strong>{fmtCurrency(totalExpenses)}</strong>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="ops-action-button">
                        <Plus size={18} /> Record Expense
                    </button>
                </div>
            </div>

            <div className="ops-toolbar">
                <div className="ops-search">
                    <div className="ops-search-icon"><Search className="h-5 w-5" /></div>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ops-input text-sm" placeholder="Search by payee or description..." />
                </div>
                <p className="text-sm font-bold text-[var(--ops-subtle)]">{filteredExpenses.length} expenses found</p>
            </div>

            {/* Table */}
            <div className="ops-card">
                {isLoading ? (
                    <div className="ops-state"><div className="ops-spinner" /><p className="mt-4 font-semibold">Loading expenses...</p></div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="ops-state">
                        <div className="ops-state-icon"><ReceiptText size={32} /></div>
                        <h3 className="text-lg font-bold text-[var(--ops-text)] mb-1">No expenses recorded</h3>
                        <p className="max-w-sm mb-6">You haven&apos;t added any company expenses yet.</p>
                        <button onClick={() => setIsModalOpen(true)} className="ops-ghost-link">+ Record your first expense</button>
                    </div>
                ) : (
                    <>
                    <div className="overflow-x-auto">
                        <table className="ops-table">
                            <thead>
                                <tr>
                                    <th className="p-4 pl-6">Date</th>
                                    <th className="p-4">Payee / Person Name</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 pr-6 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleExpenses.map((expense) => {
                                    const hasContact = expense.phone || expense.email;
                                    return (
                                        <tr key={expense.id}>
                                            <td className="p-4 pl-6 ops-muted whitespace-nowrap">
                                                {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={(e) => handleNameClick(expense, e)}
                                                    className={`flex items-center gap-2 transition-colors ${hasContact ? "text-[var(--ops-accent-text)] hover:text-[var(--ops-accent-hover)] cursor-pointer" : "text-[var(--ops-text)] cursor-default"}`}
                                                    title={hasContact ? "Click to view contact" : undefined}
                                                >
                                                    <div className="ops-avatar">{expense.personName.charAt(0)}</div>
                                                    <span className="font-bold">{expense.personName}</span>
                                                    {hasContact && <Phone size={11} className="text-indigo-400 shrink-0" />}
                                                </button>
                                            </td>
                                            <td className="p-4 ops-muted max-w-md truncate">{expense.description}</td>
                                            <td className="p-4 pr-6 text-right ops-danger-text">{fmtCurrency(Number(expense.amount))}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="ops-pagination">
                        <p className="ops-pagination-text">Showing {visibleExpenses.length} of {filteredExpenses.length} expenses</p>
                        {remainingExpenses > 0 && (
                            <button className="ops-show-more-button" onClick={() => setVisibleCount(count => count + TRANSACTION_INCREMENT)}>
                                Show {nextExpensesCount} more transactions
                            </button>
                        )}
                    </div>
                    </>
                )}
            </div>

            {/* Record Expense Modal */}
            {isModalOpen && (
                <div className="ops-modal-backdrop">
                    <div className="ops-modal-card max-w-lg animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
                        <div className="ops-modal-header sticky top-0 z-10">
                            <h2 className="ops-modal-title"><ReceiptText size={20} className="text-[var(--ops-accent)]" />Record New Expense</h2>
                            <button onClick={() => setIsModalOpen(false)} className="ops-icon-button"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="ops-modal-body">
                            {/* Payee Info */}
                            <div className="mb-5">
                                <h3 className="ops-form-section-title mb-3">Payee Information</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="ops-label">Payee / Person Name <span className="text-[var(--ops-danger)]">*</span></label>
                                        <input required value={personName} onChange={(e) => setPersonName(e.target.value)} className="ops-input" placeholder="e.g. John Doe, Office Depot" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="ops-label"><Phone size={13} className="text-[var(--ops-subtle)]" />Phone <span className="text-xs font-normal text-[var(--ops-subtle)]">(optional)</span></label>
                                            <input value={personPhone} onChange={(e) => setPersonPhone(e.target.value)} type="tel" className="ops-input" placeholder="+1 555 0000" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="ops-label"><Mail size={13} className="text-[var(--ops-subtle)]" />Email <span className="text-xs font-normal text-[var(--ops-subtle)]">(optional)</span></label>
                                            <input value={personEmail} onChange={(e) => setPersonEmail(e.target.value)} type="email" className="ops-input" placeholder="email@example.com" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expense Details */}
                            <div className="pt-4 border-t border-[var(--ops-border-soft)] space-y-4">
                                <h3 className="ops-form-section-title">Expense Details</h3>
                                <div className="space-y-1.5">
                                    <label className="ops-label">Date <span className="text-[var(--ops-danger)]">*</span></label>
                                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="ops-input" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="ops-label">Amount ($) <span className="text-[var(--ops-danger)]">*</span></label>
                                    <input type="number" min="0" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="ops-input text-lg font-bold" placeholder="0.00" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="ops-label">Description / Reason <span className="text-[var(--ops-danger)]">*</span></label>
                                    <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="ops-textarea" placeholder="e.g. Monthly internet bill, office supplies..." />
                                </div>
                            </div>

                            <div className="ops-modal-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="ops-secondary-button">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="ops-action-button disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? "Saving..." : "Record Expense"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
