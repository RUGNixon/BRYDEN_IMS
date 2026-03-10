import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

// GET all products
export async function GET() {
    try {
        const result = await pool.query(
            `SELECT id, name, size, category,
                    selling_price AS "sellingPrice",
                    purchase_price AS "purchasePrice",
                    quantity
             FROM products
             ORDER BY name ASC`
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("GET /api/products error:", error);
        return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
    }
}

// POST new product
export async function POST(req: NextRequest) {
    try {
        const { name, size, category, sellingPrice, purchasePrice, quantity } = await req.json();
        const result = await pool.query(
            `INSERT INTO products (name, size, category, selling_price, purchase_price, quantity)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, size, category,
                       selling_price AS "sellingPrice",
                       purchase_price AS "purchasePrice",
                       quantity`,
            [name, size ?? "", category ?? "", sellingPrice ?? 0, purchasePrice ?? 0, quantity ?? 0]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("POST /api/products error:", error);
        return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
    }
}
