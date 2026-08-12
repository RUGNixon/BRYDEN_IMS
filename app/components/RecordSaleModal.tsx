"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/lib/db";
import { Plus, X, ShoppingCart } from "lucide-react";

interface RecordSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialIsOrder?: boolean;
    showToast?: (type: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

interface SaleItemData {
    id: string;
    productName: string;
    size: string;
    quantity: string;
    sellingPrice: string;
}

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
                <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-slate-700">Product Name <span className="text-red-400">*</span></label>
                    <input required autoComplete="off" value={item.productName} onChange={(e) => onChange(item.id, "productName", e.target.value)} onFocus={() => item.productName.trim() && setShowSuggestions(true)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900" placeholder="Type product name..." />
                    {showSuggestions && suggestions.length > 0 && (
                        <div ref={suggestionRef} className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {suggestions.map((p) => (
                                <div key={p.id} onClick={() => handleSelectProduct(p)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex flex-col border-b border-slate-50 last:border-0">
                                    <span className="font-medium text-slate-900">{p.name}</span>
                                    <span className="text-xs text-slate-500">Size: {p.size} | Stock: {p.quantity} | ${p.sellingPrice}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Size <span className="text-red-400">*</span></label>
                    <input required value={item.size} onChange={(e) => onChange(item.id, "size", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 bg-slate-50" placeholder="Select a product..." />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Quantity Sold <span className="text-red-400">*</span></label>
                    <input type="number" min="1" required value={item.quantity} onChange={(e) => onChange(item.id, "quantity", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Selling Price / Unit ($) <span className="text-red-400">*</span></label>
                    <input type="number" min="0" step="0.01" required value={item.sellingPrice} onChange={(e) => onChange(item.id, "sellingPrice", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900" placeholder="0.00" />
                </div>
            </div>
        </div>
    );
}

export default function RecordSaleModal({ isOpen, onClose, onSuccess, initialIsOrder = false, showToast }: RecordSaleModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [isOnLoan, setIsOnLoan] = useState(false);
    const [isOrder, setIsOrder] = useState(initialIsOrder);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [saleItems, setSaleItems] = useState<SaleItemData[]>([
        { id: "init", productName: "", size: "", quantity: "", sellingPrice: "" }
    ]);

    useEffect(() => {
        if (isOpen) {
            setIsOrder(initialIsOrder);
            fetch("/api/products")
                .then(res => res.ok ? res.json() : [])
                .then(setProducts)
                .catch(() => console.error("Failed to load products for sale modal"));
        }
    }, [isOpen, initialIsOrder]);

    if (!isOpen) return null;

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
                    if (showToast) showToast("error", "Sale Failed", `Failed for ${item.productName}: ` + (data.error || "An error occurred."));
                    hasErrors = true;
                } else {
                    totalSuccess++;
                    const { newProductQuantity } = data;
                    if (newProductQuantity === 0 && showToast) {
                        showToast("warning", "Stock Depleted", `Sale recorded! ${item.productName} (${item.size}) is now out of stock.`);
                    } else if (saleItems.length === 1 && showToast) {
                        showToast("success", isOrder ? "Order Recorded" : "Sale Recorded", `${isOrder ? 'Ordered' : 'Sold'} ${item.quantity} × ${item.productName} (${item.size}) for ${clientName}. Remaining stock: ${newProductQuantity}.`);
                    }
                }
            }

            if (totalSuccess > 0 && saleItems.length > 1 && showToast) {
                showToast("success", isOrder ? "Orders Recorded" : "Sales Recorded", `Successfully recorded ${totalSuccess} items for ${clientName}.`);
            }

            if (!hasErrors) {
                setClientName(""); setClientPhone(""); setClientEmail("");
                setSaleItems([{ id: Date.now().toString(), productName: "", size: "", quantity: "", sellingPrice: "" }]);
                setIsOnLoan(false); setIsOrder(false);
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error("Error recording sale:", error);
            if (showToast) showToast("error", "Save Failed", "An error occurred while recording the sale.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <ShoppingCart size={20} className="text-emerald-500" />
                        {isOrder ? "Record New Order" : "Record New Sale"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col">
                    {/* Client Info */}
                    <div className="mb-5 shrink-0">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Client Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5 md:col-span-3">
                                <label className="text-sm font-medium text-slate-700">Client Name <span className="text-red-400">*</span></label>
                                <input required value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900" placeholder="e.g. John Doe" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">Phone <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                                <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} type="tel" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900" placeholder="+1 555 0000" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">Email <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                                <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900" placeholder="client@email.com" />
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
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all font-medium text-sm w-full justify-center"
                            >
                                <Plus size={16} /> Add Another Product
                            </button>
                        </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4 shrink-0">
                        <button type="button" onClick={() => setIsOnLoan(v => !v)} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${isOnLoan ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                            <span className="text-sm font-medium">Bought on Loan</span>
                            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${isOnLoan ? "bg-amber-400" : "bg-slate-200"}`}><div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isOnLoan ? "translate-x-4" : "translate-x-0"}`} /></div>
                        </button>
                        <button type="button" onClick={() => setIsOrder(v => !v)} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${isOrder ? "border-indigo-400 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                            <span className="text-sm font-medium">This is an Order</span>
                            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${isOrder ? "bg-indigo-400" : "bg-slate-200"}`}><div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isOrder ? "translate-x-4" : "translate-x-0"}`} /></div>
                        </button>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3 justify-end shrink-0 sticky bottom-0 bg-white shadow-[-10px_-10px_10px_-10px_rgba(0,0,0,0.05)]">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">{isSubmitting ? "Recording..." : `Record ${isOrder ? 'Order' : 'Sale'}${saleItems.length > 1 ? 's' : ''}`}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
