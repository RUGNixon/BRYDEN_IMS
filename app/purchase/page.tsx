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
        <div className="pt-5 mt-4 border-t border-slate-100 relative">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product {index + 1}</h3>
                {canRemove && (
                    <button type="button" onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold">
                        <X size={14} /> Remove
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Product Name <span className="text-red-400">*</span></label>
                    <input required value={item.productName} onChange={(e) => onChange(item.id, "productName", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="e.g. Canvas Sneakers" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Size <span className="text-red-400">*</span></label>
                    <input required value={item.size} onChange={(e) => onChange(item.id, "size", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="e.g. Size 10" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Quantity <span className="text-red-400">*</span></label>
                    <input type="number" min="1" required value={item.quantity} onChange={(e) => onChange(item.id, "quantity", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Purchase Price / Unit ($) <span className="text-red-400">*</span></label>
                    <input type="number" min="0" step="0.01" required value={item.purchasePrice} onChange={(e) => onChange(item.id, "purchasePrice", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="0.00" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Selling Price / Unit ($) <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                    <input type="number" min="0" step="0.01" value={item.sellingPrice} onChange={(e) => onChange(item.id, "sellingPrice", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="0.00" />
                </div>

                {item.purchasePrice && item.sellingPrice && (
                    <div className="mt-1 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm md:col-span-2">
                        <span className="font-medium text-indigo-700">Margin per unit: </span>
                        <span className="text-slate-700">{fmtCurrency(parseFloat(item.sellingPrice) - parseFloat(item.purchasePrice))} ({item.purchasePrice && item.sellingPrice ? Math.round(((parseFloat(item.sellingPrice) - parseFloat(item.purchasePrice)) / parseFloat(item.purchasePrice)) * 100) : 0}%)</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PurchasePage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
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

    const toastConfig: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; titleColor: string }> = {
        success: { bg: "bg-emerald-50", border: "border-emerald-200", titleColor: "text-emerald-800", icon: <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} /> },
        error: { bg: "bg-red-50", border: "border-red-200", titleColor: "text-red-800", icon: <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} /> },
        warning: { bg: "bg-amber-50", border: "border-amber-200", titleColor: "text-amber-800", icon: <PackageX className="text-amber-500 shrink-0 mt-0.5" size={18} /> },
        info: { bg: "bg-blue-50", border: "border-blue-200", titleColor: "text-blue-800", icon: <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={18} /> },
    };

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

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Purchases</h1>
                    <p className="text-slate-500 mt-1">Record supplier purchases and automatically update product stock.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={18} /> Record Purchase
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 transition-all shadow-sm" placeholder="Search by supplier or product..." />
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">Loading purchases...</div>
                ) : filteredPurchases.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="bg-indigo-50 text-indigo-500 p-4 rounded-full mb-4"><Truck size={32} /></div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No purchases found</h3>
                        <p className="text-slate-500 max-w-sm mb-6">You haven't recorded any supplier purchases yet.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">+ Record your first purchase</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-sm font-medium">
                                    <th className="p-4 pl-6">Date</th>
                                    <th className="p-4">Supplier Name</th>
                                    <th className="p-4">Product Name</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Qty</th>
                                    <th className="p-4 text-right">Unit Price</th>
                                    <th className="p-4 pr-6 text-right">Total Purchase</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPurchases.map((purchase) => {
                                    const hasContact = purchase.phone || purchase.email;
                                    return (
                                        <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 pl-6 text-slate-500 font-medium whitespace-nowrap">{purchase.date ? new Date(purchase.date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={(e) => handleNameClick(purchase, e)}
                                                    className={`flex items-center gap-2 transition-colors ${hasContact ? "text-indigo-700 hover:text-indigo-900 cursor-pointer" : "text-slate-900 cursor-default"}`}
                                                    title={hasContact ? "Click to view contact" : undefined}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shrink-0">{purchase.supplierName.charAt(0)}</div>
                                                    <span className="font-medium">{purchase.supplierName}</span>
                                                    {hasContact && <Phone size={11} className="text-indigo-400 shrink-0" />}
                                                </button>
                                            </td>
                                            <td className="p-4 text-slate-900 font-medium">{purchase.productName}</td>
                                            <td className="p-4 text-slate-500">{purchase.size}</td>
                                            <td className="p-4"><span className="inline-flex items-center font-medium px-2 py-0.5 rounded-full text-sm text-slate-700 bg-slate-100">{fmtQty(purchase.quantity)}</span></td>
                                            <td className="p-4 text-right text-slate-900 font-semibold">{fmtCurrency(Number(purchase.purchasePrice))}</td>
                                            <td className="p-4 pr-6 text-right"><span className="font-semibold text-indigo-700">{fmtCurrency(purchase.quantity * Number(purchase.purchasePrice))}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Record Purchase Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><Truck size={20} className="text-indigo-500" /> Record Supplier Purchase</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col">
                            {/* Supplier Info */}
                            <div className="mb-5 shrink-0">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Supplier Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 md:col-span-3">
                                        <label className="text-sm font-medium text-slate-700">Supplier Name <span className="text-red-400">*</span></label>
                                        <input required value={supplierName} onChange={(e) => setSupplierName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="e.g. Acme Corp" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Phone size={13} className="text-slate-400" />Phone <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                                        <input value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} type="tel" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="+1 555 0000" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Mail size={13} className="text-slate-400" />Email <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                                        <input value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="supplier@email.com" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-3 mt-2">
                                        <label className="text-sm font-medium text-slate-700">Date <span className="text-red-400">*</span></label>
                                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" />
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
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all font-medium text-sm w-full justify-center"
                                    >
                                        <Plus size={16} /> Add Another Product
                                    </button>
                                </div>
                            </div>

                            <p className="mt-6 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
                                <strong>Note:</strong> This purchase will automatically update inventory stock. If a selling price is provided, it will be set on the product.
                            </p>

                            <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3 justify-end shrink-0 sticky bottom-0 bg-white shadow-[-10px_-10px_10px_-10px_rgba(0,0,0,0.05)]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">{isSubmitting ? "Processing..." : `Record Purchase${purchaseItems.length > 1 ? 's' : ''}`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
