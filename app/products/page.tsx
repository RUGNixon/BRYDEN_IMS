"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/lib/db";
import {
    Plus,
    X,
    Package,
    PackageOpen,
    Search,
    Pencil,
    Boxes,
    CircleDollarSign,
    AlertTriangle,
    Layers,
    LayoutGrid,
    Table as TableIcon,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    TrendingUp,
    RefreshCw,
    Sparkles,
    Tag
} from "lucide-react";
import { fmtCurrency, fmtQty } from "@/lib/format";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
    const [stockFilter, setStockFilter] = useState<"ALL" | "HEALTHY" | "LOW" | "OUT">("ALL");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "stock-desc">("name");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Edit state
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [size, setSize] = useState("");
    const [category, setCategory] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
    };

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            showToast("error", "Network Error", "Could not load products. Please check connection.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const openAddModal = () => {
        setEditingProduct(null);
        setName("");
        setSize("");
        setCategory("");
        setSellingPrice("");
        setPurchasePrice("");
        setQuantity("");
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setName(product.name);
        setSize(product.size);
        setCategory(product.category ?? "");
        setSellingPrice(product.sellingPrice.toString());
        setPurchasePrice(product.purchasePrice.toString());
        setQuantity(product.quantity.toString());
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: name.trim(),
            size: size.trim(),
            category: category.trim(),
            sellingPrice: parseFloat(sellingPrice),
            purchasePrice: parseFloat(purchasePrice),
            quantity: parseInt(quantity, 10),
        };

        try {
            if (editingProduct?.id) {
                const res = await fetch(`/api/products/${editingProduct.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Update failed");
                showToast("success", "Product Updated", `Successfully saved changes to ${payload.name}.`);
            } else {
                const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Create failed");
                showToast("success", "Product Added", `Added ${payload.name} (${payload.size}) to inventory.`);
            }

            await fetchProducts();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving product:", error);
            showToast("error", "Action Failed", "Failed to save product details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate unique categories
    const categories = useMemo(() => {
        const set = new Set<string>();
        products.forEach(p => {
            if (p.category && p.category.trim()) {
                set.add(p.category.trim());
            }
        });
        return Array.from(set).sort();
    }, [products]);

    // KPI Metrics
    const totalInventoryValue = useMemo(() => {
        return products.reduce((sum, p) => sum + (p.quantity * Number(p.sellingPrice)), 0);
    }, [products]);

    const totalInventoryCost = useMemo(() => {
        return products.reduce((sum, p) => sum + (p.quantity * Number(p.purchasePrice)), 0);
    }, [products]);

    const totalUnits = useMemo(() => {
        return products.reduce((sum, p) => sum + p.quantity, 0);
    }, [products]);

    const lowStockCount = useMemo(() => {
        return products.filter(p => p.quantity <= 10).length;
    }, [products]);

    // Filtered & Sorted Products
    const filtered = useMemo(() => {
        let list = products.filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                p.size.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory =
                selectedCategory === "ALL" ||
                (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

            let matchesStock = true;
            if (stockFilter === "HEALTHY") matchesStock = p.quantity > 10;
            else if (stockFilter === "LOW") matchesStock = p.quantity > 0 && p.quantity <= 10;
            else if (stockFilter === "OUT") matchesStock = p.quantity === 0;

            return matchesSearch && matchesCategory && matchesStock;
        });

        // Sorting
        list = [...list].sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "price-asc") return Number(a.sellingPrice) - Number(b.sellingPrice);
            if (sortBy === "price-desc") return Number(b.sellingPrice) - Number(a.sellingPrice);
            if (sortBy === "stock-desc") return b.quantity - a.quantity;
            return 0;
        });

        return list;
    }, [products, searchTerm, selectedCategory, stockFilter, sortBy]);

    // Live calculation for modal
    const parsedSell = parseFloat(sellingPrice) || 0;
    const parsedBuy = parseFloat(purchasePrice) || 0;
    const parsedQty = parseInt(quantity, 10) || 0;
    const calculatedMargin = parsedSell - parsedBuy;
    const calculatedMarginPercent = parsedBuy > 0 ? Math.round((calculatedMargin / parsedBuy) * 100) : 0;
    const calculatedWorth = parsedSell * parsedQty;

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">

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
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden border border-indigo-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3.5 mb-2.5">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300 shadow-inner">
                            <PackageOpen size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                                Product Catalogue
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                    LIVE
                                </span>
                            </h1>
                            <p className="text-slate-300 text-sm font-medium mt-0.5">
                                Real-time inventory tracking, pricing margins, and stock valuation.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <Package size={13} className="text-indigo-400" />
                            {products.length} registered products
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
                            <Boxes size={13} className="text-blue-400" />
                            {fmtQty(totalUnits)} units in stock
                        </span>
                        {lowStockCount > 0 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30 flex items-center gap-1.5 animate-pulse">
                                <AlertTriangle size={13} className="text-amber-300" />
                                {lowStockCount} items need restock
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                                <Sparkles size={12} className="text-emerald-300" />
                                Optimal inventory health
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-950/50 hover:shadow-indigo-500/30 active:scale-95 transition-all duration-200 cursor-pointer"
                        id="add-product-btn"
                    >
                        <Plus size={18} />
                        <span>Add New Product</span>
                    </button>
                </div>
            </div>

            {/* ── KPI Stat Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Total Products */}
                <div className="glass-card relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Catalogue Items
                        </span>
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <Package size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {products.length}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Grouped in {categories.length} categories
                        </p>
                    </div>
                </div>

                {/* Stat 2: Total Units */}
                <div className="glass-card relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Available Stock
                        </span>
                        <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <Boxes size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {fmtQty(totalUnits)}
                        </div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Ready for immediate sale
                        </p>
                    </div>
                </div>

                {/* Stat 3: Valuation */}
                <div className="glass-card relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Asset Value
                        </span>
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <CircleDollarSign size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {fmtCurrency(totalInventoryValue)}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Cost basis: {fmtCurrency(totalInventoryCost)}
                        </p>
                    </div>
                </div>

                {/* Stat 4: Low Stock Alert */}
                <div className="glass-card relative p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Restock Required
                        </span>
                        <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <AlertTriangle size={18} />
                        </div>
                    </div>
                    <div className="mt-4 relative z-10">
                        <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight flex items-center gap-2">
                            {lowStockCount}
                            {lowStockCount > 0 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    Action
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            Items with ≤ 10 units left
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Control & Search Toolbar ── */}
            <div className="glass-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Modern Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by product name, category, or size..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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

                    {/* View Switcher & Sorting */}
                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    viewMode === "table"
                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
                                title="High-density table"
                            >
                                <TableIcon size={14} /> Table
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    viewMode === "grid"
                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
                                title="Visual product cards"
                            >
                                <LayoutGrid size={14} /> Cards
                            </button>
                        </div>

                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="pl-8 pr-3 py-2 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
                            >
                                <option value="name">Sort: Name (A-Z)</option>
                                <option value="price-desc">Price: Highest First</option>
                                <option value="price-asc">Price: Lowest First</option>
                                <option value="stock-desc">Stock: Most Units</option>
                            </select>
                            <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                        Stock Status:
                    </span>
                    <button
                        onClick={() => setStockFilter("ALL")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            stockFilter === "ALL"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        All ({products.length})
                    </button>
                    <button
                        onClick={() => setStockFilter("HEALTHY")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            stockFilter === "HEALTHY"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> In Stock
                    </button>
                    <button
                        onClick={() => setStockFilter("LOW")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            stockFilter === "LOW"
                                ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Low Stock (≤10)
                    </button>
                    <button
                        onClick={() => setStockFilter("OUT")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            stockFilter === "OUT"
                                ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Out of Stock
                    </button>

                    {categories.length > 0 && (
                        <>
                            <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                                <Tag size={11} /> Category:
                            </span>
                            <button
                                onClick={() => setSelectedCategory("ALL")}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    selectedCategory === "ALL"
                                        ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        selectedCategory.toLowerCase() === cat.toLowerCase()
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* ── Main Content: Table or Grid Cards ── */}
            {isLoading ? (
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-16 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="mt-4 font-bold text-slate-500 dark:text-slate-400 text-sm">Loading product catalogue…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-500 mb-4">
                        <PackageOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        No products match your filter
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                        Try resetting your search query or add a new product to catalogue.
                    </p>
                    <button onClick={openAddModal} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer">
                        <Plus size={16} className="inline mr-1" /> Add Product
                    </button>
                </div>
            ) : viewMode === "grid" ? (
                /* Grid Cards View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 ops-animate-fade">
                    {filtered.map((product) => {
                        const margin = product.sellingPrice - product.purchasePrice;
                        const marginPercent = product.purchasePrice > 0 ? Math.round((margin / product.purchasePrice) * 100) : 0;
                        const isLow = product.quantity <= 10 && product.quantity > 0;
                        const isOut = product.quantity === 0;

                        return (
                            <div
                                key={product.id}
                                className="glass-card bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-indigo-500/10 via-indigo-500/5 to-transparent rounded-full blur-xl pointer-events-none" />

                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                                            {product.category || "General"}
                                        </span>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {product.size}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {product.name}
                                    </h3>

                                    <div className="mt-4 grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selling Price</p>
                                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                                {fmtCurrency(product.sellingPrice)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cost Price</p>
                                            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                                                {fmtCurrency(product.purchasePrice)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Profit Margin</span>
                                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                            <TrendingUp size={13} />
                                            +{fmtCurrency(margin)} ({marginPercent}%)
                                        </span>
                                    </div>

                                    <div className="mt-3.5">
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="font-semibold text-slate-600 dark:text-slate-400">Inventory Status</span>
                                            <span className={`font-extrabold ${isOut ? "text-rose-500" : isLow ? "text-amber-500" : "text-slate-800 dark:text-slate-200"}`}>
                                                {fmtQty(product.quantity)} units
                                            </span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isOut ? "bg-rose-500 w-full" : isLow ? "bg-amber-400 w-1/4" : "bg-emerald-500 w-3/4"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        Valuation: <strong className="text-slate-900 dark:text-white font-extrabold">{fmtCurrency(product.quantity * product.sellingPrice)}</strong>
                                    </span>
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Pencil size={12} /> Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* High-Density Modern Table View */
                <div className="glass-card bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden ops-animate-fade">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                                    <th className="py-4 pl-6 pr-3">Product Name</th>
                                    <th className="py-4 px-3">Category</th>
                                    <th className="py-4 px-3">Size</th>
                                    <th className="py-4 px-3">Selling Price</th>
                                    <th className="py-4 px-3">Cost Price</th>
                                    <th className="py-4 px-3">Unit Margin</th>
                                    <th className="py-4 px-3">Stock Units</th>
                                    <th className="py-4 px-3 text-right">Valuation</th>
                                    <th className="py-4 pr-6 pl-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                                {filtered.map((product) => {
                                    const margin = product.sellingPrice - product.purchasePrice;
                                    const marginPercent = product.purchasePrice > 0 ? Math.round((margin / product.purchasePrice) * 100) : 0;
                                    const isLow = product.quantity <= 10 && product.quantity > 0;
                                    const isOut = product.quantity === 0;

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="py-4 pl-6 pr-3 font-bold text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                                                        {product.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-400">ID #{product.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-3">
                                                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                                    {product.category || "General"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-slate-600 dark:text-slate-400 font-semibold">
                                                {product.size}
                                            </td>
                                            <td className="py-4 px-3 font-black text-indigo-600 dark:text-indigo-400">
                                                {fmtCurrency(product.sellingPrice)}
                                            </td>
                                            <td className="py-4 px-3 text-slate-600 dark:text-slate-400 font-medium">
                                                {fmtCurrency(product.purchasePrice)}
                                            </td>
                                            <td className="py-4 px-3">
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                                    +{fmtCurrency(margin)} <span className="opacity-75">({marginPercent}%)</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-3">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`w-2 h-2 rounded-full ${
                                                            isOut ? "bg-rose-500 animate-pulse" : isLow ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                                                        }`}
                                                    />
                                                    <span className={`font-black ${isOut ? "text-rose-500" : isLow ? "text-amber-500" : "text-slate-800 dark:text-slate-200"}`}>
                                                        {fmtQty(product.quantity)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-3 text-right font-black text-slate-900 dark:text-white">
                                                {fmtCurrency(product.quantity * product.sellingPrice)}
                                            </td>
                                            <td className="py-4 pr-6 pl-3 text-center">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 mx-auto cursor-pointer"
                                                >
                                                    <Pencil size={12} /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
                        <span>Showing {filtered.length} of {products.length} registered catalogue products</span>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass-card bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                    <PackageOpen size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                        {editingProduct ? "Edit Product Details" : "Register New Product"}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {editingProduct ? "Modify pricing, catalogue category, or units" : "Input product specifications and pricing"}
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

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Product Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="e.g. Leather Jacket"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Category
                                    </label>
                                    <input
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="e.g. Clothing, Shoes, Accessories"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Size / Measurement <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        required
                                        value={size}
                                        onChange={(e) => setSize(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="e.g. XL, 42, 500ml"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Stock Quantity <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Purchase Cost ($) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={purchasePrice}
                                        onChange={(e) => setPurchasePrice(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Selling Price ($) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-indigo-600 dark:text-indigo-400"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Live calculation banner */}
                            {parsedSell > 0 && (
                                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 grid grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profit Margin</p>
                                        <p className={`text-base font-extrabold ${calculatedMargin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                            {calculatedMargin >= 0 ? "+" : ""}{fmtCurrency(calculatedMargin)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Margin %</p>
                                        <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                                            {calculatedMarginPercent}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Stock Value</p>
                                        <p className="text-base font-extrabold text-slate-900 dark:text-white">
                                            {fmtCurrency(calculatedWorth)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
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
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? "Saving…" : editingProduct ? "Save Changes" : "Create Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
