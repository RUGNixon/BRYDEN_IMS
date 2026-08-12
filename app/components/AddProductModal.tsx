"use client";

import { useState } from "react";
import { X, PackagePlus } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    showToast?: (type: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess, showToast }: AddProductModalProps) {
    const [name, setName] = useState("");
    const [size, setSize] = useState("");
    const [category, setCategory] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

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
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Create failed");

            setName(""); setSize(""); setCategory("");
            setSellingPrice(""); setPurchasePrice(""); setQuantity("");

            if (showToast) showToast("success", "Product Added", `Successfully added ${name} (${size}) to inventory.`);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error saving product:", error);
            if (showToast) showToast("error", "Save Failed", "Failed to add product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <PackagePlus size={20} className="text-purple-500" /> Add New Product
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-slate-700">Product Name <span className="text-red-400">*</span></label>
                            <input
                                id="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-900"
                                placeholder="e.g. Leather Jacket"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
                            <input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-900"
                                placeholder="e.g. Clothing"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="size" className="text-sm font-medium text-slate-700">Size <span className="text-red-400">*</span></label>
                            <input
                                id="size"
                                required
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-900"
                                placeholder="e.g. XL, One Size, 500ml"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="quantity" className="text-sm font-medium text-slate-700">Stock Quantity <span className="text-red-400">*</span></label>
                            <input
                                id="quantity"
                                type="number"
                                min="0"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-900"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="purchasePrice" className="text-sm font-medium text-slate-700">Purchase Price ($) <span className="text-red-400">*</span></label>
                            <input
                                id="purchasePrice"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-900"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="sellingPrice" className="text-sm font-medium text-slate-700">Selling Price ($) <span className="text-red-400">*</span></label>
                            <input
                                id="sellingPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={sellingPrice}
                                onChange={(e) => setSellingPrice(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-900"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {sellingPrice && quantity && (
                        <div className="mt-5 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl text-sm text-slate-700">
                            <span className="font-medium text-purple-700">Total Stock Worth: </span>
                            {fmtCurrency(parseFloat(sellingPrice) * parseInt(quantity || "0", 10))}
                        </div>
                    )}

                    <div className="mt-8 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
                        >
                            {isSubmitting ? "Saving..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
