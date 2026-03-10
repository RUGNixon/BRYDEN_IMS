"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/lib/db";
import { Plus, X, PackageOpen, Search, Pencil } from "lucide-react";
import { fmtCurrency, fmtQty } from "@/lib/format";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const openAddModal = () => {
        setEditingProduct(null);
        setName(""); setSize(""); setCategory("");
        setSellingPrice(""); setPurchasePrice(""); setQuantity("");
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
            name,
            size,
            category,
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
            } else {
                const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Create failed");
            }

            await fetchProducts();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Products</h1>
                    <p className="text-slate-500 mt-1">Manage your inventory products and stock levels.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 transition-all shadow-sm"
                    placeholder="Search products by name..."
                />
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">Loading products...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="bg-indigo-50 text-indigo-500 p-4 rounded-full mb-4">
                            <PackageOpen size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No products found</h3>
                        <p className="text-slate-500 max-w-sm mb-6">Your inventory is currently empty. Click the button above to add your first product.</p>
                        <button onClick={openAddModal} className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                            + Add your first product
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-sm font-medium">
                                    <th className="p-4 pl-6">Product Name</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Sell Price</th>
                                    <th className="p-4">Buy Price</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4 text-right">Stock Worth</th>
                                    <th className="p-4 pr-6 text-center">Edit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6 text-slate-900 font-medium">{product.name}</td>
                                        <td className="p-4 text-slate-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500">{product.size}</td>
                                        <td className="p-4 text-emerald-600 font-medium">{fmtCurrency(product.sellingPrice)}</td>
                                        <td className="p-4 text-slate-500">{fmtCurrency(product.purchasePrice)}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${product.quantity > 10 ? 'bg-emerald-500' : product.quantity > 0 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                <span className="text-slate-700 font-medium">{fmtQty(product.quantity)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-semibold text-indigo-700">
                                                {fmtCurrency(product.quantity * product.sellingPrice)}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent hover:border-indigo-200 active:scale-95 transition-all"
                                            >
                                                <Pencil size={12} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingProduct ? "Edit Product" : "Add New Product"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Product Name</label>
                                    <input
                                        id="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                                        placeholder="e.g. Leather Jacket"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
                                    <input
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                                        placeholder="e.g. Clothing"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="size" className="text-sm font-medium text-slate-700">Size</label>
                                    <input
                                        id="size"
                                        required
                                        value={size}
                                        onChange={(e) => setSize(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                                        placeholder="e.g. XL, One Size, 500ml"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="quantity" className="text-sm font-medium text-slate-700">Stock Quantity</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="0"
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="purchasePrice" className="text-sm font-medium text-slate-700">Purchase Price ($)</label>
                                    <input
                                        id="purchasePrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={purchasePrice}
                                        onChange={(e) => setPurchasePrice(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="sellingPrice" className="text-sm font-medium text-slate-700">Selling Price ($)</label>
                                    <input
                                        id="sellingPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {sellingPrice && quantity && (
                                <div className="mt-5 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-slate-700">
                                    <span className="font-medium text-indigo-700">Total Stock Worth: </span>
                                    {fmtCurrency(parseFloat(sellingPrice) * parseInt(quantity || "0", 10))}
                                </div>
                            )}

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                                >
                                    {isSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
