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

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
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

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sales</h1>
                    <p className="text-slate-500 mt-1">Record and track your product sales.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={18} /> Record Sale
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 transition-all shadow-sm" placeholder="Search by client or product..." />
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">Loading sales...</div>
                ) : filteredSales.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full mb-4"><ShoppingCart size={32} /></div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No sales recorded</h3>
                        <p className="text-slate-500 max-w-sm mb-6">You haven't recorded any sales yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-sm font-medium">
                                    <th className="p-4 pl-6">Client Name</th>
                                    <th className="p-4">Product Name</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Quantity</th>
                                    <th className="p-4">Unit Price</th>
                                    <th className="p-4">Profits</th>
                                    <th className="p-4 pr-6 text-right">Total Sales</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSales.map((sale) => {
                                    const hasContact = sale.phone || sale.email;
                                    return (
                                        <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 pl-6">
                                                <button
                                                    onClick={(e) => handleNameClick(sale, e)}
                                                    className={`flex items-center gap-1.5 font-medium text-left transition-colors ${hasContact ? "text-indigo-700 hover:text-indigo-900 cursor-pointer" : "text-slate-900 cursor-default"}`}
                                                    title={hasContact ? "Click to view contact" : undefined}
                                                >
                                                    {sale.clientName}
                                                    {hasContact && <Phone size={11} className="text-indigo-400 shrink-0" />}
                                                </button>
                                            </td>
                                            <td className="p-4 text-slate-700">{sale.productName}</td>
                                            <td className="p-4 text-slate-500">{sale.size}</td>
                                            <td className="p-4 text-slate-700 font-medium">{fmtQty(sale.quantity)}</td>
                                            <td className="p-4 text-emerald-600 font-medium">{fmtCurrency(sale.sellingPrice)}</td>
                                            <td className="p-4 text-blue-600 font-medium">{fmtCurrency(sale.profits || 0)}</td>
                                            <td className="p-4 pr-6 text-right"><span className="font-semibold text-emerald-700">{fmtCurrency(sale.quantity * sale.sellingPrice)}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Record Sale Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <h2 className="text-xl font-semibold text-slate-900">Record New Sale</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"><X size={20} /></button>
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
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Phone size={13} className="text-slate-400" />Phone <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                                        <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} type="tel" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900" placeholder="+1 555 0000" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Mail size={13} className="text-slate-400" />Email <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
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
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">{isSubmitting ? "Recording..." : `Record Sale${saleItems.length > 1 ? 's' : ''}`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
