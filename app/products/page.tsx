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
        <div className="operations-page ops-accent-indigo min-h-full">
            <div className="ops-shell">
                <header className="ops-header">
                    <div>
                        <div className="ops-eyebrow"><PackageOpen size={16} aria-hidden="true" /> Inventory</div>
                        <h1>Product inventory</h1>
                        <p>Manage product pricing, stock levels, and catalogue details.</p>
                    </div>
                    <button onClick={openAddModal} className="ops-action-button">
                        <Plus size={18} aria-hidden="true" />
                        Add product
                    </button>
                </header>

                <div className="ops-toolbar">
                    <div className="ops-search">
                        <Search className="ops-search-icon" aria-hidden="true" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="ops-input"
                            placeholder="Search products by name..."
                        />
                    </div>
                    <span className="ops-toolbar-count">{filtered.length} {filtered.length === 1 ? "product" : "products"}</span>
                </div>

                <div className="ops-card">
                    {isLoading ? (
                        <div className="ops-state"><div className="ops-spinner" /><p className="mt-4 font-semibold">Loading products...</p></div>
                    ) : filtered.length === 0 ? (
                        <div className="ops-state">
                            <div className="ops-state-icon"><PackageOpen size={32} /></div>
                            <h3>No products found</h3>
                            <p>Your inventory is currently empty. Add a product to start tracking stock.</p>
                            <button onClick={openAddModal} className="ops-ghost-link">Add your first product</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="ops-table">
                                <thead>
                                    <tr>
                                        <th>Product name</th>
                                        <th>Category</th>
                                        <th>Size</th>
                                        <th>Sell price</th>
                                        <th>Buy price</th>
                                        <th>Stock</th>
                                        <th className="text-right">Stock worth</th>
                                        <th className="text-center">Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((product) => (
                                        <tr key={product.id}>
                                            <td className="ops-strong">{product.name}</td>
                                            <td><span className="ops-pill">{product.category || "Uncategorised"}</span></td>
                                            <td className="ops-muted">{product.size}</td>
                                            <td className="ops-accent-text">{fmtCurrency(product.sellingPrice)}</td>
                                            <td className="ops-muted">{fmtCurrency(product.purchasePrice)}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className={`ops-status-dot ${product.quantity > 10 ? "ops-status-dot-positive" : product.quantity > 0 ? "ops-status-dot-warning" : "ops-status-dot-danger"}`} />
                                                    <span className="ops-strong">{fmtQty(product.quantity)}</span>
                                                </div>
                                            </td>
                                            <td className="text-right ops-accent-text ops-strong">{fmtCurrency(product.quantity * product.sellingPrice)}</td>
                                            <td className="text-center">
                                                <button onClick={() => openEditModal(product)} className="ops-secondary-button ops-table-action">
                                                    <Pencil size={13} aria-hidden="true" /> Edit
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
                    <div className="ops-modal-backdrop">
                        <div className="ops-modal-card max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="ops-modal-header">
                                <h2 className="ops-modal-title"><PackageOpen size={20} className="text-[var(--ops-accent)]" /> {editingProduct ? "Edit product" : "Add new product"}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="ops-icon-button" aria-label="Close product form"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="ops-modal-body">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div><label htmlFor="name" className="ops-label">Product name</label><input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="ops-input" placeholder="e.g. Leather Jacket" /></div>
                                    <div><label htmlFor="category" className="ops-label">Category</label><input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="ops-input" placeholder="e.g. Clothing" /></div>
                                    <div><label htmlFor="size" className="ops-label">Size</label><input id="size" required value={size} onChange={(e) => setSize(e.target.value)} className="ops-input" placeholder="e.g. XL, One Size, 500ml" /></div>
                                    <div><label htmlFor="quantity" className="ops-label">Stock quantity</label><input id="quantity" type="number" min="0" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="ops-input" placeholder="0" /></div>
                                    <div><label htmlFor="purchasePrice" className="ops-label">Purchase price ($)</label><input id="purchasePrice" type="number" min="0" step="0.01" required value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="ops-input" placeholder="0.00" /></div>
                                    <div><label htmlFor="sellingPrice" className="ops-label">Selling price ($)</label><input id="sellingPrice" type="number" min="0" step="0.01" required value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="ops-input" placeholder="0.00" /></div>
                                </div>

                                {sellingPrice && quantity && <div className="ops-note mt-5"><span className="font-semibold">Total stock worth:</span> {fmtCurrency(parseFloat(sellingPrice) * parseInt(quantity || "0", 10))}</div>}

                                <div className="ops-modal-footer mt-8 px-0 pb-0">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="ops-secondary-button">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="ops-action-button disabled:opacity-70 disabled:cursor-not-allowed">{isSubmitting ? "Saving..." : editingProduct ? "Save changes" : "Save product"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
