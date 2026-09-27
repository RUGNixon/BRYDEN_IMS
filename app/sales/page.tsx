"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Sale, Product } from "@/lib/db";
import {
    Plus,
    X,
    ShoppingCart,
    Search,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    PackageX,
    Phone,
    Mail,
    TrendingUp,
    ShoppingBag,
    CreditCard,
    Sparkles,
    User,
    Calendar,
    ChevronDown,
    DollarSign,
    RefreshCw
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

interface SaleItemData {
    id: string;
    productName: string;
    size: string;
    quantity: string;
    sellingPrice: string;
}

const INITIAL_TRANSACTION_LIMIT = 15;
const TRANSACTION_INCREMENT = 20;

function SaleItemRow({
    item,
    index,
    products,
    onChange,
    onRemove,
    canRemove
}: {
    item: SaleItemData;
    index: number;
    products: Product[];
    onChange: (id: string, field: keyof SaleItemData, value: string) => void;
    onRemove: (id: string) => void;
    canRemove: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // React 19: Suggestions computed synchronously during render
    const suggestions = useMemo(() => {
        if (!item.productName.trim()) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(item.productName.toLowerCase())
        );
    }, [item.productName, products]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectProduct = (product: Product) => {
        onChange(item.id, "productName", product.name);
        onChange(item.id, "sellingPrice", product.sellingPrice.toString());
        onChange(item.id, "size", product.size);
        setIsOpen(false);
    };

    const subtotal = (parseFloat(item.sellingPrice) || 0) * (parseInt(item.quantity, 10) || 0);

    return (
        <div className="relative mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 ops-animate-fade">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-[11px] flex items-center justify-center">
                        {index + 1}
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Order Line #{index + 1}
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
                {/* Product Name Autocomplete */}
                <div className="space-y-1.5 relative" ref={containerRef}>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                        required
                        autoComplete="off"
                        value={item.productName}
                        onChange={(e) => {
                            onChange(item.id, "productName", e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="Type to search catalogue…"
                    />

                    {isOpen && suggestions.length > 0 && (
                        <div className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            {suggestions.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => handleSelectProduct(p)}
                                    className="flex items-center justify-between p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                                >
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</p>
                                        <p className="text-xs text-slate-400">Size: {p.size} &bull; Category: {p.category || "General"}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">${p.sellingPrice}</span>
                                        <span className={`text-[10px] font-bold ${p.quantity <= 5 ? "text-amber-500" : "text-slate-400"}`}>
                                            Stock: {p.quantity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Size */}
                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Size / Measurement <span className="text-rose-500">*</span>
                    </label>
                    <input
                        required
                        value={item.size}
                        onChange={(e) => onChange(item.id, "size", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="e.g. XL, 42, 500ml"
                    />
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Units Sold <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => onChange(item.id, "quantity", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="1"
                    />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Selling Price / Unit ($) <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.sellingPrice}
                        onChange={(e) => onChange(item.id, "sellingPrice", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {subtotal > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Row Subtotal:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{fmtCurrency(subtotal)}</span>
                </div>
            )}
        </div>
    );
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "LOAN" | "ORDER">("ALL");
    const [visibleCount, setVisibleCount] = useState(INITIAL_TRANSACTION_LIMIT);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [isOnLoan, setIsOnLoan] = useState(false);
    const [isOrder, setIsOrder] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [saleItems, setSaleItems] = useState<SaleItemData[]>([
        { id: "init", productName: "", size: "", quantity: "", sellingPrice: "" }
    ]);

    const [toasts, setToasts] = useState<Toast[]>([]);
    const [contact, setContact] = useState<ContactState | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [salesRes, productsRes] = await Promise.all([
                fetch("/api/sales"),
                fetch("/api/products"),
            ]);
            if (!salesRes.ok || !productsRes.ok) throw new Error("Fetch failed");
            const [salesData, productsData] = await Promise.all([salesRes.json(), productsRes.json()]);
            setSales(salesData);
            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching sales data:", error);
            showToast("error", "Error", "Failed to retrieve sales records.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setVisibleCount(INITIAL_TRANSACTION_LIMIT);
    }, [searchTerm, statusFilter]);

    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const handleItemChange = (id: string, field: keyof SaleItemData, value: string) => {
        setSaleItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addSaleItem = () => {
        setSaleItems(prev => [
            ...prev,
            { id: Date.now().toString() + Math.random(), productName: "", size: "", quantity: "", sellingPrice: "" }
        ]);
    };

    const removeSaleItem = (id: string) => {
        if (saleItems.length > 1) {
            setSaleItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let hasErrors = false;
            let totalSuccess = 0;

            for (const item of saleItems) {
                const res = await fetch("/api/sales", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        clientName: clientName.trim(),
                        productName: item.productName.trim(),
                        size: item.size.trim(),
                        quantity: parseInt(item.quantity, 10),
                        sellingPrice: parseFloat(item.sellingPrice),
                        status: isOnLoan,
                        order: isOrder,
                        phone: clientPhone ? clientPhone.trim() : null,
                        email: clientEmail ? clientEmail.trim() : null,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    showToast("error", "Sale Failed", `Failed for ${item.productName}: ` + (data.error || "An error occurred."));
                    hasErrors = true;
                } else {
                    totalSuccess++;
                    const { newProductQuantity } = data;
                    if (newProductQuantity === 0) {
                        showToast("warning", "Stock Depleted", `${item.productName} (${item.size}) is now out of stock.`);
                    }
                }
            }

            if (totalSuccess > 0) {
                showToast(
                    "success",
                    "Sale Recorded",
                    `Successfully recorded ${totalSuccess} item${totalSuccess > 1 ? "s" : ""} for ${clientName}.`
                );
            }

            if (!hasErrors) {
                setClientName("");
                setClientPhone("");
                setClientEmail("");
                setSaleItems([{ id: Date.now().toString(), productName: "", size: "", quantity: "", sellingPrice: "" }]);
                setIsOnLoan(false);
                setIsOrder(false);
                setIsModalOpen(false);
            }

            if (totalSuccess > 0) {
                await fetchData();
            }
        } catch (error) {
            console.error("Error recording sale:", error);
            showToast("error", "Save Failed", "An unexpected error occurred while saving.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNameClick = (sale: Sale, e: React.MouseEvent) => {
        if (!sale.phone && !sale.email) return;
        e.stopPropagation();
        setContact({
            name: sale.clientName,
            phone: sale.phone,
            email: sale.email,
            position: { x: e.clientX, y: e.clientY },
        });
    };

    // KPI Metrics calculation
    const totalRevenue = useMemo(() => {
        return sales
            .filter(s => !s.order)
            .reduce((sum, s) => sum + (s.quantity * Number(s.sellingPrice)), 0);
    }, [sales]);

    const totalProfits = useMemo(() => {
        return sales
            .filter(s => !s.order)
            .reduce((sum, s) => sum + Number(s.profits || 0), 0);
    }, [sales]);

    const totalUnitsSold = useMemo(() => {
        return sales
            .filter(s => !s.order)
            .reduce((sum, s) => sum + s.quantity, 0);
    }, [sales]);

    const loanCount = useMemo(() => {
        return sales.filter(s => !s.order && s.status).length;
    }, [sales]);

    const loanTotal = useMemo(() => {
        return sales
            .filter(s => !s.order && s.status)
            .reduce((sum, s) => sum + (s.quantity * Number(s.sellingPrice)), 0);
    }, [sales]);

    // Filtering
    const filteredSales = useMemo(() => {
        return sales
            .filter(s => {
                if (statusFilter === "LOAN") return s.status && !s.order;
                if (statusFilter === "PAID") return !s.status && !s.order;
                if (statusFilter === "ORDER") return s.order;
                return !s.order;
            })
            .filter(s =>
                s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.phone && s.phone.includes(searchTerm))
            );
    }, [sales, statusFilter, searchTerm]);

    const visibleSales = filteredSales.slice(0, visibleCount);
    const remainingSales = Math.max(filteredSales.length - visibleSales.length, 0);
    const nextSalesCount = Math.min(TRANSACTION_INCREMENT, remainingSales);

    // Live Cart Total in Modal
    const cartSummary = useMemo(() => {
        let total = 0;
        let qty = 0;
        saleItems.forEach(item => {
            const price = parseFloat(item.sellingPrice) || 0;
            const q = parseInt(item.quantity, 10) || 0;
            total += price * q;
            qty += q;
        });
        const vat = total * 0.18;
        return { total, qty, vat };
    }, [saleItems]);

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
                    const isWarning = toast.type === "warning";
                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
                                isSuccess
                                    ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100"
                                    : isError
                                    ? "bg-rose-950/90 border-rose-500/40 text-rose-100"
                                    : isWarning
                                    ? "bg-amber-950/90 border-amber-500/40 text-amber-100"
                                    : "bg-slate-900/95 border-slate-700 text-white"
                            } ops-animate-fade`}
                        >
                            {isSuccess ? (
                                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                            ) : isError ? (
                                <XCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                            ) : (
                                <PackageX className="text-amber-400 shrink-0 mt-0.5" size={18} />
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
            <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden border border-emerald-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3.5 mb-2.5">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300 shadow-inner">
                            <ShoppingCart size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                                Sales Ledger
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                                    LIVE REVENUE
                                </span>
                            </h1>
                            <p className="text-slate-300 text-sm font-medium mt-0.5">
                                Log client transactions, track real-time gross profits, VAT (18%), and customer accounts.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <TrendingUp size={13} className="text-emerald-400" />
                            {fmtCurrency(totalRevenue)} gross revenue
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <Sparkles size={13} className="text-teal-300" />
                            {fmtCurrency(totalProfits)} net profit
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <ShoppingBag size={13} className="text-blue-300" />
                            {fmtQty(totalUnitsSold)} units sold
                        </span>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/50 hover:shadow-emerald-500/30 active:scale-95 transition-all duration-200 cursor-pointer"
                        id="record-sale-btn"
                    >
                        <Plus size={18} />
                        <span>Record New Sale</span>
                    </button>
                </div>
            </div>

            {/* ── KPI Stat Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Revenue */}
                <div className="relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Revenue
                        </span>
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {fmtCurrency(totalRevenue)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Gross intake from orders
                        </p>
                    </div>
                </div>

                {/* Stat 2: Gross Profit */}
                <div className="relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Net Gross Margin
                        </span>
                        <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-900/50 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                            <Sparkles size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
                            {fmtCurrency(totalProfits)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Realized profit after product costs
                        </p>
                    </div>
                </div>

                {/* Stat 3: Units Sold */}
                <div className="relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Units Delivered
                        </span>
                        <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {fmtQty(totalUnitsSold)} <span className="text-sm font-bold text-slate-400">units</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Delivered to customers
                        </p>
                    </div>
                </div>

                {/* Stat 4: Loan Receivables */}
                <div className="relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Loan Receivables
                        </span>
                        <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <CreditCard size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                            {fmtCurrency(loanTotal)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            {loanCount} credit sale{loanCount === 1 ? "" : "s"} outstanding
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
                            placeholder="Search client, product, or phone number..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === "ALL"
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            All Sales
                        </button>
                        <button
                            onClick={() => setStatusFilter("PAID")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === "PAID"
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Paid in Full
                        </button>
                        <button
                            onClick={() => setStatusFilter("LOAN")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === "LOAN"
                                    ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            On Loan ({loanCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter("ORDER")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === "ORDER"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Pre-Orders
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Sales Ledger Table ── */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden ops-animate-fade">
                {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="mt-4 font-bold text-slate-500 dark:text-slate-400 text-sm">Loading sales ledger…</p>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-500 mb-4">
                            <ShoppingCart size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            No sales transactions found
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                            {searchTerm ? "No orders matched your search criteria." : "Start recording product sales to monitor cashflow."}
                        </p>
                        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer">
                            <Plus size={16} className="inline mr-1" /> Record First Sale
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                                        <th className="py-4 pl-6 pr-3">Client / Buyer</th>
                                        <th className="py-4 px-3">Product Name</th>
                                        <th className="py-4 px-3">Size</th>
                                        <th className="py-4 px-3">Qty</th>
                                        <th className="py-4 px-3">Unit Price</th>
                                        <th className="py-4 px-3">Gross Profit</th>
                                        <th className="py-4 px-3">VAT (18%)</th>
                                        <th className="py-4 px-3">Status</th>
                                        <th className="py-4 pr-6 pl-3 text-right">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                                    {visibleSales.map((sale) => {
                                        const hasContact = sale.phone || sale.email;
                                        return (
                                            <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="py-4 pl-6 pr-3">
                                                    <button
                                                        onClick={(e) => handleNameClick(sale, e)}
                                                        className={`flex items-center gap-2.5 font-bold text-left transition-all ${
                                                            hasContact
                                                                ? "text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                                                                : "text-slate-900 dark:text-white cursor-default"
                                                        }`}
                                                        title={hasContact ? "Click to view contact info" : undefined}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                                                            {sale.clientName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="block truncate max-w-[150px]">{sale.clientName}</span>
                                                            {hasContact && (
                                                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                                                    <Phone size={9} /> Contact available
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                </td>
                                                <td className="py-4 px-3 font-bold text-slate-800 dark:text-slate-200">
                                                    {sale.productName}
                                                </td>
                                                <td className="py-4 px-3 text-slate-600 dark:text-slate-400 font-semibold">
                                                    {sale.size}
                                                </td>
                                                <td className="py-4 px-3">
                                                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                                        {fmtQty(sale.quantity)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                                    {fmtCurrency(sale.sellingPrice)}
                                                </td>
                                                <td className="py-4 px-3">
                                                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                                                        <TrendingUp size={12} />
                                                        {fmtCurrency(sale.profits || 0)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3 text-xs font-bold text-amber-600 dark:text-amber-400">
                                                    {fmtCurrency(sale.vat || 0)}
                                                </td>
                                                <td className="py-4 px-3">
                                                    {sale.status ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            On Loan
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            Paid
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 pr-6 pl-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-base">
                                                    {fmtCurrency(sale.quantity * sale.sellingPrice)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-bold">
                            <p>Showing {visibleSales.length} of {filteredSales.length} transaction entries</p>
                            {remainingSales > 0 && (
                                <button
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer font-bold"
                                    onClick={() => setVisibleCount(count => count + TRANSACTION_INCREMENT)}
                                >
                                    Show {nextSalesCount} more records
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── Record Sale Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                                    <ShoppingCart size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                        Record New Sale
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Input buyer info, add items, and select payment settlement terms
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
                            {/* Client Info */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <User size={13} /> Buyer Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1.5 md:col-span-3">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Client Full Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            required
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            placeholder="e.g. John Doe, Alpha Corp"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Phone (optional)
                                        </label>
                                        <input
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            type="tel"
                                            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            placeholder="+1 555 0192"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Email (optional)
                                        </label>
                                        <input
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            type="email"
                                            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            placeholder="client@company.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Products Cart */}
                            <div className="space-y-3">
                                {saleItems.map((item, i) => (
                                    <SaleItemRow
                                        key={item.id}
                                        item={item}
                                        index={i}
                                        products={products}
                                        onChange={handleItemChange}
                                        onRemove={removeSaleItem}
                                        canRemove={saleItems.length > 1}
                                    />
                                ))}

                                <button
                                    type="button"
                                    onClick={addSaleItem}
                                    className="w-full py-2.5 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer"
                                >
                                    <Plus size={15} /> Add Another Product
                                </button>
                            </div>

                            {/* Terms Toggles */}
                            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOnLoan(v => !v)}
                                    className={`ops-toggle cursor-pointer ${isOnLoan ? "ops-toggle-active" : ""}`}
                                >
                                    <div>
                                        <span className="text-sm font-bold block">Bought on Loan</span>
                                        <span className="text-[11px] text-slate-400">Mark as unpaid credit receivable</span>
                                    </div>
                                    <div className="ops-toggle-track">
                                        <div className="ops-toggle-thumb" />
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsOrder(v => !v)}
                                    className={`ops-toggle cursor-pointer ${isOrder ? "ops-toggle-active" : ""}`}
                                >
                                    <div>
                                        <span className="text-sm font-bold block">Pre-Order Status</span>
                                        <span className="text-[11px] text-slate-400">Queue in special orders</span>
                                    </div>
                                    <div className="ops-toggle-track">
                                        <div className="ops-toggle-thumb" />
                                    </div>
                                </button>
                            </div>

                            {/* Live summary */}
                            {cartSummary.total > 0 && (
                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-bold text-slate-600 dark:text-slate-300">
                                            {cartSummary.qty} unit{cartSummary.qty === 1 ? "" : "s"} &bull; VAT (18%): {fmtCurrency(cartSummary.vat)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Sale</span>
                                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                            {fmtCurrency(cartSummary.total)}
                                        </span>
                                    </div>
                                </div>
                            )}

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
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? "Recording…" : `Confirm Sale (${fmtCurrency(cartSummary.total)})`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
