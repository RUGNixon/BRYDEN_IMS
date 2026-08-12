"use client";

import { useState, useEffect } from "react";
import { Plus, X, Truck } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface RecordPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    showToast?: (type: "success" | "error" | "warning" | "info", title: string, message: string) => void;
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

export default function RecordPurchaseModal({ isOpen, onClose, onSuccess, showToast }: RecordPurchaseModalProps) {
    const [supplierName, setSupplierName] = useState("");
    const [supplierPhone, setSupplierPhone] = useState("");
    const [supplierEmail, setSupplierEmail] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [purchaseItems, setPurchaseItems] = useState<PurchaseItemData[]>([
        { id: "init", productName: "", size: "", quantity: "", purchasePrice: "", sellingPrice: "" }
    ]);

    useEffect(() => {
        if (isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

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
                    if (showToast) showToast("error", "Purchase Failed", `Failed for ${item.productName}: ` + (data.error || "An error occurred."));
                    hasErrors = true;
                } else {
                    totalSuccess++;
                    if (purchaseItems.length === 1 && showToast) {
                        showToast("success", "Purchase Recorded", `Purchased ${item.quantity} × ${item.productName} (${item.size}) from ${supplierName}.`);
                    }
                }
            }

            if (totalSuccess > 0 && purchaseItems.length > 1 && showToast) {
                showToast("success", "Purchases Recorded", `Successfully recorded ${totalSuccess} items from ${supplierName}.`);
            }

            if (!hasErrors) {
                setSupplierName(""); setSupplierPhone(""); setSupplierEmail("");
                setDate(new Date().toISOString().split('T')[0]);
                setPurchaseItems([{ id: Date.now().toString(), productName: "", size: "", quantity: "", purchasePrice: "", sellingPrice: "" }]);
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error("Error logging purchase:", error);
            if (showToast) showToast("error", "Save Failed", "An error occurred while recording the purchase.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Truck size={20} className="text-indigo-500" /> Record Supplier Purchase
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"><X size={20} /></button>
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
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">Phone <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                                <input value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} type="tel" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900" placeholder="+1 555 0000" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">Email <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
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
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">{isSubmitting ? "Processing..." : `Record Purchase${purchaseItems.length > 1 ? 's' : ''}`}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
