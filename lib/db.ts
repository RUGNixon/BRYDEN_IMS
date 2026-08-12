// TypeScript interfaces for the Bryden IMS data models.
// Shared between frontend pages and API routes.

export interface User {
    id?: string;
    username: string;
    email: string;
}

export interface Product {
    id?: string | number;
    name: string;
    size: string;
    sellingPrice: number;
    purchasePrice: number;
    category: string;
    quantity: number;
}

export interface Purchase {
    id?: string | number;
    supplierName: string;
    productName: string;
    size: string;
    purchasePrice: number;
    sellingPrice?: number;      // optional selling price set at purchase time
    quantity: number;
    date: string;
    phone?: string | null;      // optional supplier contact
    email?: string | null;
}

export interface Sale {
    id?: string | number;
    clientName: string;
    productName: string;
    size: string;
    quantity: number;
    sellingPrice: number;
    profits?: number;           // added self-populating profits column
    vat?: number;               // value added tax: selling_price - (selling_price / (1 + 18/100))
    status: boolean;            // true = bought on loan
    order: boolean;             // true = is an order
    date?: string;
    phone?: string | null;      // optional client contact
    email?: string | null;
}

export interface Expense {
    id?: string | number;
    personName: string;
    description: string;
    amount: number;
    date: string;
    phone?: string | null;      // optional payee contact
    email?: string | null;
}
