import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

// GET all purchases
export async function GET() {
    try {
        const result = await pool.query(
            `SELECT id, supplier_name AS "supplierName", product_name AS "productName",
                    size, purchase_price AS "purchasePrice",
                    selling_price AS "sellingPrice",
                    quantity, date, phone, email
             FROM purchases
             ORDER BY date DESC, id DESC`
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("GET /api/purchases error:", error);
        return NextResponse.json({ error: "Failed to fetch purchases." }, { status: 500 });
    }
}

// POST new purchase — upserts product inventory + sets selling price
export async function POST(req: NextRequest) {
    const client = await pool.connect();
    try {
        const { supplierName, productName, size, purchasePrice, sellingPrice, quantity, date, phone, email } =
            await req.json();

        await client.query("BEGIN");

        // 1. Record the purchase
        await client.query(
            `INSERT INTO purchases (supplier_name, product_name, size, purchase_price, selling_price, quantity, date, phone, email)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [supplierName, productName, size ?? "", purchasePrice, sellingPrice ?? null, quantity, date, phone || null, email || null]
        );

        // 2. Check if product exists (match by name + size)
        const existing = await client.query(
            `SELECT id, quantity FROM products
             WHERE LOWER(name) = LOWER($1) AND size = $2
             LIMIT 1`,
            [productName, size]
        );

        if (existing.rowCount && existing.rowCount > 0) {
            // Product exists — update quantity, purchase_price. Also update selling_price if provided.
            const product = existing.rows[0];
            if (sellingPrice != null && sellingPrice > 0) {
                await client.query(
                    `UPDATE products
                     SET quantity = $1, purchase_price = $2, selling_price = $3
                     WHERE id = $4`,
                    [product.quantity + quantity, purchasePrice, sellingPrice, product.id]
                );
            } else {
                await client.query(
                    `UPDATE products
                     SET quantity = $1, purchase_price = $2
                     WHERE id = $3`,
                    [product.quantity + quantity, purchasePrice, product.id]
                );
            }
        } else {
            // Product doesn't exist — create it with provided selling price
            await client.query(
                `INSERT INTO products (name, size, category, selling_price, purchase_price, quantity)
                 VALUES ($1, $2, 'General', $3, $4, $5)`,
                [productName, size ?? "", sellingPrice ?? 0, purchasePrice, quantity]
            );
        }

        await client.query("COMMIT");

        return NextResponse.json({ message: "Purchase recorded successfully." }, { status: 201 });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("POST /api/purchases error:", error);
        return NextResponse.json({ error: "Failed to record purchase." }, { status: 500 });
    } finally {
        client.release();
    }
}
