"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Purchase } from "@/lib/db";
import {
    Plus,
    X,
    Truck,
    Search,
    Phone,
    Mail,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    PackageX,
    Building2,
    Boxes,
    BadgeDollarSign,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    PackageCheck,
    Receipt,
    Sparkles
} from "lucide-react";
import { fmtCurrency, fmtQty } from "@/lib/format";
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

interface PurchaseItemData {
    id: string;
    productName: string;
    size: string;
    quantity: string;
    purchasePrice: string;
    sellingPrice: string;
}

const INITIAL_TRANSACTION_LIMIT = 15;
const TRANSACTION_INCREMENT = 20;

function PurchaseItemRow({
    item,
    index,
    onChange,
    onRemove,
    canRemove
}: {
    item: PurchaseItemData;
    index: number;
    onChange: (id: string, field: keyof PurchaseItemData, value: string) => void;
    onRemove: (id: string) => void;
    canRemove: boolean;
}) {
    const buyPrice = parseFloat(item.purchasePrice) || 0;
    const sellPrice = parseFloat(item.sellingPrice) || 0;
    const qty = parseInt(item.quantity, 10) || 0;
    const margin = sellPrice > 0 ? sellPrice - buyPrice : 0;
    const marginPct = buyPrice > 0 && sellPrice > 0 ? Math.round((margin / buyPrice) * 100) : 0;
    const rowTotal = buyPrice * qty;

    return (
        <div className="relative mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 ops-animate-fade">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-black text-[11px] flex items-center justify-center">
                        {index + 1}
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Inbound Item #{index + 1}
                    </h3>
                </div>
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    >
                        <X size={13} /> Remove
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                        required
                        value={item.productName}
                        onChange={(e) => onChange(item.id, "productName", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        placeholder="e.g. Canvas Sneakers, USB-C Cable"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Size / Measurement <span className="text-rose-500">*</span>
                    </label>
                    <input
                        required
                        value={item.size}
                        onChange={(e) => onChange(item.id, "size", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        placeholder="e.g. 42, XL, 500ml"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Quantity Purchased <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => onChange(item.id, "quantity", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        placeholder="1"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Purchase Cost / Unit ($) <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.purchasePrice}
                        onChange={(e) => onChange(item.id, "purchasePrice", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold text-sky-600 dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        placeholder="0.00"
                    />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Target Selling Price / Unit ($) <span className="text-xs font-normal text-slate-400">(optional - auto updates catalogue)</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.sellingPrice}
                        onChange={(e) => onChange(item.id, "sellingPrice", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Live calculation banner */}
            {(rowTotal > 0 || sellPrice > 0) && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                    {sellPrice > 0 && (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            <TrendingUp size={13} />
                            <span>Margin: +{fmtCurrency(margin)}/unit ({marginPct}%)</span>
                        </div>
                    )}
                    {rowTotal > 0 && (
                        <div className="ml-auto text-slate-700 dark:text-slate-300 font-semibold">
                            Row Investment: <strong className="text-sky-600 dark:text-sky-400 font-black text-sm">{fmtCurrency(rowTotal)}</strong>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PurchasePage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState<string>("ALL");
    const [visibleCount, setVisibleCount] = useState(INITIAL_TRANSACTION_LIMIT);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [contact, setContact] = useState<ContactState | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Form state
    const [supplierName, setSupplierName] = useState("");
    const [supplierPhone, setSupplierPhone] = useState("");
    const [supplierEmail, setSupplierEmail] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [purchaseItems, setPurchaseItems] = useState<PurchaseItemData[]>([
        { id: "init", productName: "", size: "", quantity: "", purchasePrice: "", sellingPrice: "" }
    ]);

    const fetchPurchases = useCallback(async () => {
        try {
            const res = await fetch("/api/purchases");
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setPurchases(data);
        } catch (error) {
            console.error("Error fetching purchases:", error);
            showToast("error", "Error", "Failed to retrieve purchases records.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);

    useEffect(() => {
        setVisibleCount(INITIAL_TRANSACTION_LIMIT);
    }, [searchTerm, selectedSupplier]);

    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const handleItemChange = (id: string, field: keyof PurchaseItemData, value: string) => {
        setPurchaseItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addPurchaseItem = () => {
        setPurchaseItems(prev => [
            ...prev,
            { id: Date.now().toString() + Math.random(), productName: "", size: "", quantity: "", purchasePrice: "", sellingPrice: "" }
        ]);
    };

    const removePurchaseItem = (id: string) => {
        if (purchaseItems.length > 1) {
            setPurchaseItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let hasErrors = false;
            let totalSuccess = 0;

            for (const item of purchaseItems) {
                const res = await fetch("/api/purchases", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        supplierName: supplierName.trim(),
                        productName: item.productName.trim(),
                        size: item.size.trim(),
                        purchasePrice: parseFloat(item.purchasePrice),
                        sellingPrice: item.sellingPrice ? parseFloat(item.sellingPrice) : null,
                        quantity: parseInt(item.quantity, 10),
                        date,
                        phone: supplierPhone ? supplierPhone.trim() : null,
                        email: supplierEmail ? supplierEmail.trim() : null,
                    }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    showToast("error", "Purchase Failed", `Failed for ${item.productName}: ` + (data.error || "An error occurred."));
                    hasErrors = true;
                } else {
                    totalSuccess++;
                }
            }

            if (totalSuccess > 0) {
                showToast(
                    "success",
                    "Purchase Logged",
                    `Successfully recorded ${totalSuccess} item${totalSuccess > 1 ? "s" : ""} from ${supplierName}. Stock updated!`
                );
            }

            if (!hasErrors) {
                setSupplierName("");
                setSupplierPhone("");
                setSupplierEmail("");
                setDate(new Date().toISOString().split("T")[0]);
                setPurchaseItems([{ id: Date.now().toString(), productName: "", size: "", quantity: "", purchasePrice: "", sellingPrice: "" }]);
                setIsModalOpen(false);
            }

            if (totalSuccess > 0) {
                await fetchPurchases();
            }
        } catch (error) {
            console.error("Error logging purchase:", error);
            showToast("error", "Save Failed", "An error occurred while recording the purchase.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNameClick = (purchase: Purchase, e: React.MouseEvent) => {
        if (!purchase.phone && !purchase.email) return;
        e.stopPropagation();
        setContact({
            name: purchase.supplierName,
            phone: purchase.phone,
            email: purchase.email,
            position: { x: e.clientX, y: e.clientY },
        });
    };

    // Calculate unique suppliers
    const uniqueSuppliers = useMemo(() => {
        const set = new Set<string>();
        purchases.forEach(p => {
            if (p.supplierName && p.supplierName.trim()) {
                set.add(p.supplierName.trim());
            }
        });
        return Array.from(set).sort();
    }, [purchases]);

    // KPI Metrics calculation
    const totalProcurementSpend = useMemo(() => {
        return purchases.reduce((sum, p) => sum + (p.quantity * Number(p.purchasePrice)), 0);
    }, [purchases]);

    const totalUnitsProcured = useMemo(() => {
        return purchases.reduce((sum, p) => sum + p.quantity, 0);
    }, [purchases]);

    const avgPurchaseUnitCost = useMemo(() => {
        if (totalUnitsProcured === 0) return 0;
        return totalProcurementSpend / totalUnitsProcured;
    }, [totalProcurementSpend, totalUnitsProcured]);

    // Filtering
    const filteredPurchases = useMemo(() => {
        return purchases.filter(p => {
            const matchesSearch =
                p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.phone && p.phone.includes(searchTerm));

            const matchesSupplier =
                selectedSupplier === "ALL" ||
                p.supplierName.toLowerCase() === selectedSupplier.toLowerCase();

            return matchesSearch && matchesSupplier;
        });
    }, [purchases, searchTerm, selectedSupplier]);

    const visiblePurchases = filteredPurchases.slice(0, visibleCount);
    const remainingPurchases = Math.max(filteredPurchases.length - visiblePurchases.length, 0);
    const nextPurchasesCount = Math.min(TRANSACTION_INCREMENT, remainingPurchases);

    // Live Total in Modal
    const modalTotalSpend = useMemo(() => {
        return purchaseItems.reduce((sum, item) => {
            const buy = parseFloat(item.purchasePrice) || 0;
            const q = parseInt(item.quantity, 10) || 0;
            return sum + (buy * q);
        }, 0);
    }, [purchaseItems]);

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
            <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden border border-sky-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3.5 mb-2.5">
                        <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-400/30 text-sky-300 shadow-inner">
                            <Truck size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                                Supplier Procurement
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/30">
                                    INFLOW
                                </span>
                            </h1>
                            <p className="text-slate-300 text-sm font-medium mt-0.5">
                                Log incoming inventory orders, record vendor shipments, and update stock counts.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <TrendingUp size={13} className="text-sky-400" />
                            {fmtCurrency(totalProcurementSpend)} total spend
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <PackageCheck size={13} className="text-indigo-300" />
                            {fmtQty(totalUnitsProcured)} units received
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <Building2 size={13} className="text-cyan-300" />
                            {uniqueSuppliers.length} active suppliers
                        </span>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-sky-950/50 hover:shadow-sky-500/30 active:scale-95 transition-all duration-200 cursor-pointer"
                        id="record-purchase-btn"
                    >
                        <Plus size={18} />
                        <span>Record Supplier Purchase</span>
                    </button>
                </div>
            </div>

            {/* ── KPI Stat Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Total Spend */}
                <div className="relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Procurement Outflow
                        </span>
                        <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/70 border border-sky-100 dark:border-sky-900/50 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                            <Truck size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-sky-600 dark:text-sky-400 tracking-tight">
                            {fmtCurrency(totalProcurementSpend)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Inbound restocking investments
                        </p>
                    </div>
                </div>

                {/* Stat 2: Units Received */}
                <div className="relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Units Inflow
                        </span>
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <PackageCheck size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {fmtQty(totalUnitsProcured)} <span className="text-sm font-bold text-slate-400">units</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Inventory replenished
                        </p>
                    </div>
                </div>

                {/* Stat 3: Active Suppliers */}
                <div className="relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Active Suppliers
                        </span>
                        <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-100 dark:border-cyan-900/50 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                            <Building2 size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {uniqueSuppliers.length}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Partners supplying inventory
                        </p>
                    </div>
                </div>

                {/* Stat 4: Average Unit Cost */}
                <div className="relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Weighted Avg Unit Cost
                        </span>
                        <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-900/50 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                            <BadgeDollarSign size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
                            {fmtCurrency(avgPurchaseUnitCost)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Average acquisition cost
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Control & Search Toolbar ── */}
            <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Modern Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by supplier name, product, or phone..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Supplier Filter Tabs */}
                    {uniqueSuppliers.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                                Supplier:
                            </span>
                            <button
                                onClick={() => setSelectedSupplier("ALL")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedSupplier === "ALL"
                                        ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }`}
                            >
                                All ({purchases.length})
                            </button>
                            {uniqueSuppliers.slice(0, 4).map(sup => (
                                <button
                                    key={sup}
                                    onClick={() => setSelectedSupplier(sup)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedSupplier.toLowerCase() === sup.toLowerCase()
                                            ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    {sup}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Purchases Table ── */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden ops-animate-fade">
                {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-sky-200 dark:border-sky-900 border-t-sky-600 rounded-full animate-spin" />
                        <p className="mt-4 font-bold text-slate-500 dark:text-slate-400 text-sm">Loading supplier purchase logs…</p>
                    </div>
                ) : filteredPurchases.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/70 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center text-sky-500 mb-4">
                            <Truck size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            No purchases recorded
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                            {searchTerm ? "No records matched your search query." : "Record your first supplier purchase to automatically increment inventory stock."}
                        </p>
                        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer">
                            <Plus size={16} className="inline mr-1" /> Record Purchase
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                                        <th className="py-4 pl-6 pr-3">Invoice Date</th>
                                        <th className="py-4 px-3">Supplier / Vendor</th>
                                        <th className="py-4 px-3">Product Name</th>
                                        <th className="py-4 px-3">Size</th>
                                        <th className="py-4 px-3">Quantity</th>
                                        <th className="py-4 px-3">Unit Cost</th>
                                        <th className="py-4 pr-6 pl-3 text-right">Total Purchase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                                    {visiblePurchases.map((purchase) => {
                                        const hasContact = purchase.phone || purchase.email;
                                        return (
                                            <tr key={purchase.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="py-4 pl-6 pr-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs font-bold">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-slate-400" />
                                                        {purchase.date ? new Date(purchase.date).toLocaleDateString() : "N/A"}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3">
                                                    <button
                                                        onClick={(e) => handleNameClick(purchase, e)}
                                                        className={`flex items-center gap-2.5 font-bold text-left transition-all ${
                                                            hasContact
                                                                ? "text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                                                                : "text-slate-900 dark:text-white cursor-default"
                                                        }`}
                                                        title={hasContact ? "Click to view supplier contact" : undefined}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                                                            {purchase.supplierName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="block truncate max-w-[150px]">{purchase.supplierName}</span>
                                                            {hasContact && (
                                                                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                                                                    <Phone size={9} /> Contact saved
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                </td>
                                                <td className="py-4 px-3 font-bold text-slate-800 dark:text-slate-200">
                                                    {purchase.productName}
                                                </td>
                                                <td className="py-4 px-3 text-slate-600 dark:text-slate-400 font-semibold">
                                                    {purchase.size}
                                                </td>
                                                <td className="py-4 px-3">
                                                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                                        {fmtQty(purchase.quantity)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                                    {fmtCurrency(Number(purchase.purchasePrice))}
                                                </td>
                                                <td className="py-4 pr-6 pl-3 text-right font-black text-sky-600 dark:text-sky-400 text-base">
                                                    {fmtCurrency(purchase.quantity * Number(purchase.purchasePrice))}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-bold">
                            <p>Showing {visiblePurchases.length} of {filteredPurchases.length} supplier invoices</p>
                            {remainingPurchases > 0 && (
                                <button
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer font-bold"
                                    onClick={() => setVisibleCount(count => count + TRANSACTION_INCREMENT)}
                                >
                                    Show {nextPurchasesCount} more records
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── Record Purchase Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                        Record Supplier Purchase
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Log incoming inventory and automatically update warehouse stock
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
                            {/* Supplier Info */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Building2 size={13} /> Supplier Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1.5 md:col-span-3">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Supplier Name / Vendor <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            required
                                            value={supplierName}
                                            onChange={(e) => setSupplierName(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                            placeholder="e.g. Acme Corp, Global Textiles"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Phone (optional)
                                        </label>
                                        <input
                                            value={supplierPhone}
                                            onChange={(e) => setSupplierPhone(e.target.value)}
                                            type="tel"
                                            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                            placeholder="+1 555 4910"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Email (optional)
                                        </label>
                                        <input
                                            value={supplierEmail}
                                            onChange={(e) => setSupplierEmail(e.target.value)}
                                            type="email"
                                            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                            placeholder="supplier@company.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Invoice Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Items */}
                            <div className="space-y-3">
                                {purchaseItems.map((item, i) => (
                                    <PurchaseItemRow
                                        key={item.id}
                                        item={item}
                                        index={i}
                                        onChange={handleItemChange}
                                        onRemove={removePurchaseItem}
                                        canRemove={purchaseItems.length > 1}
                                    />
                                ))}

                                <button
                                    type="button"
                                    onClick={addPurchaseItem}
                                    className="w-full py-2.5 rounded-2xl border border-dashed border-sky-300 dark:border-sky-700/60 bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all cursor-pointer"
                                >
                                    <Plus size={15} /> Add Another Product
                                </button>
                            </div>

                            {modalTotalSpend > 0 && (
                                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-600 dark:text-slate-300">
                                        Total Order Inflow Investment:
                                    </span>
                                    <span className="text-lg font-black text-sky-600 dark:text-sky-400">
                                        {fmtCurrency(modalTotalSpend)}
                                    </span>
                                </div>
                            )}

                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                                <Receipt size={13} className="text-sky-500 shrink-0" />
                                <span>Stock balances will be automatically replenished in warehouse inventory.</span>
                            </p>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? "Processing…" : `Confirm Purchase (${fmtCurrency(modalTotalSpend)})`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
