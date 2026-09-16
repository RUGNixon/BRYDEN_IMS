"use client";

import { useState, useEffect, useCallback } from "react";
import { Purchase } from "@/lib/db";
import { Plus, X, Truck, Search, Phone, Mail, CheckCircle2, AlertTriangle, XCircle, PackageX } from "lucide-react";
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
                <div className="space-y-1.5">
                    <label className="ops-label">Product Name <span className="text-[var(--ops-danger)]">*</span></label>
                    <input required value={item.productName} onChange={(e) => onChange(item.id, "productName", e.target.value)} className="ops-input" placeholder="e.g. Canvas Sneakers" />
                </div>
                <div className="space-y-1.5">
                    <label className="ops-label">Size <span className="text-[var(--ops-danger)]">*</span></label>
                    <input required value={item.size} onChange={(e) => onChange(item.id, "size", e.target.value)} className="ops-input" placeholder="e.g. Size 10" />
                </div>
                <div className="space-y-1.5">
                    <label className="ops-label">Quantity <span className="text-[var(--ops-danger)]">*</span></label>
                    <input type="number" min="1" required value={item.quantity} onChange={(e) => onChange(item.id, "quantity", e.target.value)} className="ops-input" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                    <label className="ops-label">Purchase Price / Unit ($) <span className="text-[var(--ops-danger)]">*</span></label>
                    <input type="number" min="0" step="0.01" required value={item.purchasePrice} onChange={(e) => onChange(item.id, "purchasePrice", e.target.value)} className="ops-input" placeholder="0.00" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="ops-label">Selling Price / Unit ($) <span className="text-xs font-normal text-[var(--ops-subtle)]">(optional)</span></label>
                    <input type="number" min="0" step="0.01" value={item.sellingPrice} onChange={(e) => onChange(item.id, "sellingPrice", e.target.value)} className="ops-input" placeholder="0.00" />
                </div>

                {item.purchasePrice && item.sellingPrice && (
                    <div className="ops-note mt-1 text-sm md:col-span-2">
                        <span className="font-bold text-[var(--ops-accent-text)]">Margin per unit: </span>
                        <span>{fmtCurrency(parseFloat(item.sellingPrice) - parseFloat(item.purchasePrice))} ({item.purchasePrice && item.sellingPrice ? Math.round(((parseFloat(item.sellingPrice) - parseFloat(item.purchasePrice)) / parseFloat(item.purchasePrice)) * 100) : 0}%)</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PurchasePage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [visibleCount, setVisibleCount] = useState(INITIAL_TRANSACTION_LIMIT);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [contact, setContact] = useState<ContactState | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Form state
    const [supplierName, setSupplierName] = useState("");
    const [supplierPhone, setSupplierPhone] = useState("");
    const [supplierEmail, setSupplierEmail] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
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
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

    useEffect(() => {
        setVisibleCount(INITIAL_TRANSACTION_LIMIT);
    }, [searchTerm]);

    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const handleItemChange = (id: string, field: keyof PurchaseItemData, value: string) => {
        setPurchaseItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addPurchaseItem = () => {
        setPurchaseItems(prev => [...prev, { id: Date.now().toString() + Math.random(), productName: "", size: "", quantity: "", purchasePrice: "", sellingPrice: "" }]);
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
                        supplierName,
                        productName: item.productName,
                        size: item.size,
                        purchasePrice: parseFloat(item.purchasePrice),
                        sellingPrice: item.sellingPrice ? parseFloat(item.sellingPrice) : null,
                        quantity: parseInt(item.quantity, 10),
                        date,
                        phone: supplierPhone || null,
                        email: supplierEmail || null,
                    }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    showToast("error", "Purchase Failed", `Failed for ${item.productName}: ` + (data.error || "An error occurred."));
                    hasErrors = true;
                } else {
                    totalSuccess++;
                    if (purchaseItems.length === 1) {
                        showToast("success", "Purchase Recorded", `Purchased ${item.quantity} × ${item.productName} (${item.size}) from ${supplierName}.`);
                    }
                }
            }

            if (totalSuccess > 0 && purchaseItems.length > 1) {
                showToast("success", "Purchases Recorded", `Successfully recorded ${totalSuccess} items from ${supplierName}.`);
            }

            if (!hasErrors) {
                setSupplierName(""); setSupplierPhone(""); setSupplierEmail("");
                setDate(new Date().toISOString().split('T')[0]);
                setPurchaseItems([{ id: Date.now().toString(), productName: "", size: "", quantity: "", purchasePrice: "", sellingPrice: "" }]);
                setIsModalOpen(false);
            }

            // Always fetch data if at least one succeeded to refresh table
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

    const filteredPurchases = purchases.filter(p =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const visiblePurchases = filteredPurchases.slice(0, visibleCount);
    const remainingPurchases = Math.max(filteredPurchases.length - visiblePurchases.length, 0);
    const nextPurchasesCount = Math.min(TRANSACTION_INCREMENT, remainingPurchases);

    const toastConfig: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; titleColor: string }> = {
        success: { bg: "bg-emerald-50", border: "border-emerald-200", titleColor: "text-emerald-800", icon: <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} /> },
        error: { bg: "bg-red-50", border: "border-red-200", titleColor: "text-red-800", icon: <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} /> },
        warning: { bg: "bg-amber-50", border: "border-amber-200", titleColor: "text-amber-800", icon: <PackageX className="text-amber-500 shrink-0 mt-0.5" size={18} /> },
        info: { bg: "bg-blue-50", border: "border-blue-200", titleColor: "text-blue-800", icon: <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={18} /> },
    };

    return (
        <div className="operations-page ops-accent-indigo min-h-full">
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
                    <div className="ops-eyebrow"><Truck size={16} aria-hidden="true" /> Purchases</div>
                    <h1 className="ops-title">Supplier purchases</h1>
                    <p className="ops-subtitle">Record supplier purchases and automatically update product stock.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="ops-action-button">
                    <Plus size={18} /> Record Purchase
                </button>
            </div>

            {/* Search */}
            <div className="ops-toolbar">
                <div className="ops-search">
                    <div className="ops-search-icon"><Search className="h-5 w-5" /></div>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ops-input text-sm" placeholder="Search by supplier or product..." />
                </div>
                <p className="text-sm font-bold text-[var(--ops-subtle)]">{filteredPurchases.length} purchases found</p>
            </div>

            {/* Table */}
            <div className="ops-card">
                {isLoading ? (
                    <div className="ops-state"><div className="ops-spinner" /><p className="mt-4 font-semibold">Loading purchases...</p></div>
                ) : filteredPurchases.length === 0 ? (
                    <div className="ops-state">
                        <div className="ops-state-icon"><Truck size={32} /></div>
                        <h3 className="text-lg font-bold text-[var(--ops-text)] mb-1">No purchases found</h3>
                        <p className="max-w-sm mb-6">You haven&apos;t recorded any supplier purchases yet.</p>
                        <button onClick={() => setIsModalOpen(true)} className="ops-ghost-link">+ Record your first purchase</button>
                    </div>
                ) : (
                    <>
                    <div className="overflow-x-auto">
                        <table className="ops-table">
                            <thead>
                                <tr>
                                    <th className="p-4 pl-6">Date</th>
                                    <th className="p-4">Supplier Name</th>
                                    <th className="p-4">Product Name</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Qty</th>
                                    <th className="p-4 text-right">Unit Price</th>
                                    <th className="p-4 pr-6 text-right">Total Purchase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visiblePurchases.map((purchase) => {
                                    const hasContact = purchase.phone || purchase.email;
                                    return (
                                        <tr key={purchase.id}>
                                            <td className="p-4 pl-6 ops-muted whitespace-nowrap">{purchase.date ? new Date(purchase.date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={(e) => handleNameClick(purchase, e)}
                                                    className={`flex items-center gap-2 transition-colors ${hasContact ? "text-[var(--ops-accent-text)] hover:text-[var(--ops-accent-hover)] cursor-pointer" : "text-[var(--ops-text)] cursor-default"}`}
                                                    title={hasContact ? "Click to view contact" : undefined}
                                                >
                                                    <div className="ops-avatar">{purchase.supplierName.charAt(0)}</div>
                                                    <span className="font-bold">{purchase.supplierName}</span>
                                                    {hasContact && <Phone size={11} className="text-indigo-400 shrink-0" />}
                                                </button>
                                            </td>
                                            <td className="p-4 ops-strong">{purchase.productName}</td>
                                            <td className="p-4 ops-muted">{purchase.size}</td>
                                            <td className="p-4"><span className="ops-pill">{fmtQty(purchase.quantity)}</span></td>
                                            <td className="p-4 text-right ops-strong">{fmtCurrency(Number(purchase.purchasePrice))}</td>
                                            <td className="p-4 pr-6 text-right"><span className="ops-accent-text">{fmtCurrency(purchase.quantity * Number(purchase.purchasePrice))}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="ops-pagination">
                        <p className="ops-pagination-text">Showing {visiblePurchases.length} of {filteredPurchases.length} purchases</p>
                        {remainingPurchases > 0 && (
                            <button className="ops-show-more-button" onClick={() => setVisibleCount(count => count + TRANSACTION_INCREMENT)}>
                                Show {nextPurchasesCount} more transactions
                            </button>
                        )}
                    </div>
                    </>
                )}
            </div>

            {/* Record Purchase Modal */}
            {isModalOpen && (
                <div className="ops-modal-backdrop">
                    <div className="ops-modal-card max-w-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="ops-modal-header shrink-0">
                            <h2 className="ops-modal-title"><Truck size={20} className="text-[var(--ops-accent)]" /> Record Supplier Purchase</h2>
                            <button onClick={() => setIsModalOpen(false)} className="ops-icon-button"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="ops-modal-body flex-1 overflow-y-auto flex flex-col">
                            {/* Supplier Info */}
                            <div className="mb-5 shrink-0">
                                <h3 className="ops-form-section-title mb-3">Supplier Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 md:col-span-3">
                                        <label className="ops-label">Supplier Name <span className="text-[var(--ops-danger)]">*</span></label>
                                        <input required value={supplierName} onChange={(e) => setSupplierName(e.target.value)} className="ops-input" placeholder="e.g. Acme Corp" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="ops-label"><Phone size={13} className="text-[var(--ops-subtle)]" />Phone <span className="text-xs font-normal text-[var(--ops-subtle)]">(optional)</span></label>
                                        <input value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} type="tel" className="ops-input" placeholder="+1 555 0000" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="ops-label"><Mail size={13} className="text-[var(--ops-subtle)]" />Email <span className="text-xs font-normal text-[var(--ops-subtle)]">(optional)</span></label>
                                        <input value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} type="email" className="ops-input" placeholder="supplier@email.com" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-3 mt-2">
                                        <label className="ops-label">Date <span className="text-[var(--ops-danger)]">*</span></label>
                                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="ops-input" />
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Details (Dynamic List) */}
                            <div className="shrink-0">
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

                                <div className="mt-4 pt-4 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={addPurchaseItem}
                                        className="ops-secondary-button w-full border-dashed"
                                    >
                                        <Plus size={16} /> Add Another Product
                                    </button>
                                </div>
                            </div>

                            <p className="ops-note mt-6 shrink-0">
                                <strong>Note:</strong> This purchase will automatically update inventory stock. If a selling price is provided, it will be set on the product.
                            </p>

                            <div className="ops-modal-footer shrink-0">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="ops-secondary-button">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="ops-action-button disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? "Processing..." : `Record Purchase${purchaseItems.length > 1 ? 's' : ''}`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
