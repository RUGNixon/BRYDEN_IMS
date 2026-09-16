"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sale, Product } from "@/lib/db";
import { Plus, X, ShoppingCart, Search, CheckCircle2, AlertTriangle, XCircle, PackageX, Phone, Mail } from "lucide-react";
import { fmtCurrency, fmtQty } from "@/lib/format";
import ContactPopup from "@/app/components/ContactPopup";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: number; type: ToastType; title: string; message: string; }

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
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const suggestionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (item.productName.trim()) {
            const matches = products.filter(p => p.name.toLowerCase().includes(item.productName.toLowerCase()));
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [item.productName, products]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectProduct = (product: Product) => {
        onChange(item.id, "productName", product.name);
        onChange(item.id, "sellingPrice", product.sellingPrice.toString());
        onChange(item.id, "size", product.size);
        setShowSuggestions(false);
    };

    return (
        <div className="relative mt-4 border-t border-[var(--ops-border-soft)] pt-5">
            <div className="flex justify-between items-center mb-3">
                <h3 className="ops-form-section-title">Product {index + 1}</h3>
                {canRemove && (
                    <button type="button" onClick={() => onRemove(item.id)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[var(--ops-danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--ops-danger)_10%,transparent)]">
                        <X size={14} /> Remove
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 relative">
                    <label className="ops-label">Product Name <span className="text-[var(--ops-danger)]">*</span></label>
                    <input required autoComplete="off" value={item.productName} onChange={(e) => onChange(item.id, "productName", e.target.value)} onFocus={() => item.productName.trim() && setShowSuggestions(true)} className="ops-input" placeholder="Type product name..." />
                    {showSuggestions && suggestions.length > 0 && (
                        <div ref={suggestionRef} className="ops-suggestion-panel absolute z-10 mt-1 max-h-48 w-full overflow-y-auto">
                            {suggestions.map((p) => (
                                <div key={p.id} onClick={() => handleSelectProduct(p)} className="ops-suggestion-item flex flex-col">
                                    <span className="ops-strong">{p.name}</span>
                                    <span className="text-xs text-[var(--ops-subtle)]">Size: {p.size} | Stock: {p.quantity} | ${p.sellingPrice}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="space-y-1.5">
                    <label className="ops-label">Size <span className="text-[var(--ops-danger)]">*</span></label>
                    <input required value={item.size} onChange={(e) => onChange(item.id, "size", e.target.value)} className="ops-input bg-[var(--ops-surface-muted)]" placeholder="Select a product..." />
                </div>
                <div className="space-y-1.5">
                    <label className="ops-label">Quantity Sold <span className="text-[var(--ops-danger)]">*</span></label>
                    <input type="number" min="1" required value={item.quantity} onChange={(e) => onChange(item.id, "quantity", e.target.value)} className="ops-input" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                    <label className="ops-label">Selling Price / Unit ($) <span className="text-[var(--ops-danger)]">*</span></label>
                    <input type="number" min="0" step="0.01" required value={item.sellingPrice} onChange={(e) => onChange(item.id, "sellingPrice", e.target.value)} className="ops-input" placeholder="0.00" />
                </div>
            </div>
        </div>
    );
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
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
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        setVisibleCount(INITIAL_TRANSACTION_LIMIT);
    }, [searchTerm]);

    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const handleItemChange = (id: string, field: keyof SaleItemData, value: string) => {
        setSaleItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addSaleItem = () => {
        setSaleItems(prev => [...prev, { id: Date.now().toString() + Math.random(), productName: "", size: "", quantity: "", sellingPrice: "" }]);
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
                        clientName,
                        productName: item.productName,
                        size: item.size,
                        quantity: parseInt(item.quantity, 10),
                        sellingPrice: parseFloat(item.sellingPrice),
                        status: isOnLoan,
                        order: isOrder,
                        phone: clientPhone || null,
                        email: clientEmail || null,
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
                        showToast("warning", "Stock Depleted", `Sale recorded! ${item.productName} (${item.size}) is now out of stock.`);
                    } else if (saleItems.length === 1) {
                        showToast("success", "Sale Recorded", `Sold ${item.quantity} × ${item.productName} (${item.size}) to ${clientName}. Remaining stock: ${newProductQuantity}.`);
                    }
                }
            }

            if (totalSuccess > 0 && saleItems.length > 1) {
                showToast("success", "Sales Recorded", `Successfully recorded ${totalSuccess} items to ${clientName}.`);
            }

            if (!hasErrors) {
                setClientName(""); setClientPhone(""); setClientEmail("");
                setSaleItems([{ id: Date.now().toString(), productName: "", size: "", quantity: "", sellingPrice: "" }]);
                setIsOnLoan(false); setIsOrder(false);
                setIsModalOpen(false);
            }

            // Always fetch data if at least one succeeded to refresh table
            if (totalSuccess > 0) {
                await fetchData();
            }
        } catch (error) {
            console.error("Error recording sale:", error);
            showToast("error", "Save Failed", "An error occurred while recording the sale.");
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

    const filteredSales = sales
        .filter(s => !s.order)
        .filter(s =>
            s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    const visibleSales = filteredSales.slice(0, visibleCount);
    const remainingSales = Math.max(filteredSales.length - visibleSales.length, 0);
    const nextSalesCount = Math.min(TRANSACTION_INCREMENT, remainingSales);

    const toastConfig: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; titleColor: string }> = {
        success: { bg: "bg-emerald-50", border: "border-emerald-200", titleColor: "text-emerald-800", icon: <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} /> },
        error: { bg: "bg-red-50", border: "border-red-200", titleColor: "text-red-800", icon: <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} /> },
        warning: { bg: "bg-amber-50", border: "border-amber-200", titleColor: "text-amber-800", icon: <PackageX className="text-amber-500 shrink-0 mt-0.5" size={18} /> },
        info: { bg: "bg-blue-50", border: "border-blue-200", titleColor: "text-blue-800", icon: <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={18} /> },
    };

    return (
        <div className="operations-page ops-accent-emerald min-h-full">
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

            <div className="ops-header">
                <div>
                    <div className="ops-eyebrow"><ShoppingCart size={16} aria-hidden="true" /> Sales</div>
                    <h1 className="ops-title">Sales ledger</h1>
                    <p className="ops-subtitle">Record and track product sales with profit, VAT, and customer contact context.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="ops-action-button">
                    <Plus size={18} /> Record Sale
                </button>
            </div>

            {/* Search */}
            <div className="ops-toolbar">
                <div className="ops-search">
                    <div className="ops-search-icon"><Search className="h-5 w-5" /></div>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ops-input text-sm" placeholder="Search by client or product..." />
                </div>
                <p className="text-sm font-bold text-[var(--ops-subtle)]">{filteredSales.length} sales found</p>
            </div>

            {/* Sales Table */}
            <div className="ops-card">
                {isLoading ? (
                    <div className="ops-state"><div className="ops-spinner" /><p className="mt-4 font-semibold">Loading sales...</p></div>
                ) : filteredSales.length === 0 ? (
                    <div className="ops-state">
                        <div className="ops-state-icon"><ShoppingCart size={32} /></div>
                        <h3 className="text-lg font-bold text-[var(--ops-text)] mb-1">No sales recorded</h3>
                        <p className="max-w-sm">You haven&apos;t recorded any sales yet.</p>
                    </div>
                ) : (
                    <>
                    <div className="overflow-x-auto">
                        <table className="ops-table">
                            <thead>
                                <tr>
                                    <th className="p-4 pl-6">Client Name</th>
                                    <th className="p-4">Product Name</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Quantity</th>
                                    <th className="p-4">Unit Price</th>
                                    <th className="p-4">Profits</th>
                                    <th className="p-4">VAT (18%)</th>
                                    <th className="p-4 pr-6 text-right">Total Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleSales.map((sale) => {
                                    const hasContact = sale.phone || sale.email;
                                    return (
                                        <tr key={sale.id}>
                                            <td className="p-4 pl-6">
                                                <button
                                                    onClick={(e) => handleNameClick(sale, e)}
                                                    className={`flex items-center gap-1.5 font-bold text-left transition-colors ${hasContact ? "text-[var(--ops-accent-text)] hover:text-[var(--ops-accent-hover)] cursor-pointer" : "text-[var(--ops-text)] cursor-default"}`}
                                                    title={hasContact ? "Click to view contact" : undefined}
                                                >
                                                    {sale.clientName}
                                                    {hasContact && <Phone size={11} className="text-indigo-400 shrink-0" />}
                                                </button>
                                            </td>
                                            <td className="p-4 ops-strong">{sale.productName}</td>
                                            <td className="p-4 ops-muted">{sale.size}</td>
                                            <td className="p-4"><span className="ops-pill">{fmtQty(sale.quantity)}</span></td>
                                            <td className="p-4 ops-positive-text">{fmtCurrency(sale.sellingPrice)}</td>
                                            <td className="p-4 ops-accent-text">{fmtCurrency(sale.profits || 0)}</td>
                                            <td className="p-4 text-[var(--ops-warning)] font-extrabold">{fmtCurrency(sale.vat || 0)}</td>
                                            <td className="p-4 pr-6 text-right"><span className="ops-positive-text">{fmtCurrency(sale.quantity * sale.sellingPrice)}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="ops-pagination">
                        <p className="ops-pagination-text">Showing {visibleSales.length} of {filteredSales.length} sales</p>
                        {remainingSales > 0 && (
                            <button className="ops-show-more-button" onClick={() => setVisibleCount(count => count + TRANSACTION_INCREMENT)}>
                                Show {nextSalesCount} more transactions
                            </button>
                        )}
                    </div>
                    </>
                )}
            </div>

            {/* Record Sale Modal */}
            {isModalOpen && (
                <div className="ops-modal-backdrop">
                    <div className="ops-modal-card max-w-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="ops-modal-header shrink-0">
                            <h2 className="ops-modal-title"><ShoppingCart size={20} className="text-[var(--ops-accent)]" /> Record New Sale</h2>
                            <button onClick={() => setIsModalOpen(false)} className="ops-icon-button"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="ops-modal-body flex-1 overflow-y-auto flex flex-col">
                            {/* Client Info */}
                            <div className="mb-5 shrink-0">
                                <h3 className="ops-form-section-title mb-3">Client Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 md:col-span-3">
                                        <label className="ops-label">Client Name <span className="text-[var(--ops-danger)]">*</span></label>
                                        <input required value={clientName} onChange={(e) => setClientName(e.target.value)} className="ops-input" placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="ops-label"><Phone size={13} className="text-[var(--ops-subtle)]" />Phone <span className="text-xs font-normal text-[var(--ops-subtle)]">(optional)</span></label>
                                        <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} type="tel" className="ops-input" placeholder="+1 555 0000" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="ops-label"><Mail size={13} className="text-[var(--ops-subtle)]" />Email <span className="text-xs font-normal text-[var(--ops-subtle)]">(optional)</span></label>
                                        <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" className="ops-input" placeholder="client@email.com" />
                                    </div>
                                </div>
                            </div>

                            {/* Sale Details (Dynamic List) */}
                            <div className="shrink-0">
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

                                <div className="mt-4 pt-4 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={addSaleItem}
                                    className="ops-secondary-button w-full border-dashed"
                                    >
                                        <Plus size={16} /> Add Another Product
                                    </button>
                                </div>
                            </div>

                            {/* Status Toggles */}
                            <div className="mt-6 pt-5 border-t border-[var(--ops-border-soft)] grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                                <button type="button" onClick={() => setIsOnLoan(v => !v)} className={`ops-toggle ${isOnLoan ? "ops-toggle-active" : ""}`}>
                                    <span className="text-sm font-bold">Bought on Loan</span>
                                    <div className="ops-toggle-track"><div className="ops-toggle-thumb" /></div>
                                </button>
                                <button type="button" onClick={() => setIsOrder(v => !v)} className={`ops-toggle ${isOrder ? "ops-toggle-active" : ""}`}>
                                    <span className="text-sm font-bold">This is an Order</span>
                                    <div className="ops-toggle-track"><div className="ops-toggle-thumb" /></div>
                                </button>
                            </div>

                            <div className="ops-modal-footer shrink-0">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="ops-secondary-button">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="ops-action-button disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? "Recording..." : `Record Sale${saleItems.length > 1 ? 's' : ''}`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
