import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

// GET all sales
export async function GET() {
    try {
        const result = await pool.query(
            `SELECT id, client_name AS "clientName", product_name AS "productName",
                    size, quantity,
                    selling_price AS "sellingPrice",
                    profits,
                    vat,
                    status, "order", date, phone, email
             FROM sales
             ORDER BY id DESC`
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("GET /api/sales error:", error);
        return NextResponse.json({ error: "Failed to fetch sales." }, { status: 500 });
    }
}

// POST new sale — also decrements product stock in a transaction
export async function POST(req: NextRequest) {
    const client = await pool.connect();
    try {
        const { clientName, productName, size, quantity, sellingPrice, status, order, phone, email } =
            await req.json();

        await client.query("BEGIN");

        // 1. Fetch current stock and purchase price
        const productRes = await client.query(
            `SELECT id, quantity, purchase_price FROM products
             WHERE LOWER(name) = LOWER($1) AND size = $2
             LIMIT 1`,
            [productName, size]
        );

        if (productRes.rowCount === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { error: `Product "${productName}" (Size: ${size}) not found.` },
                { status: 404 }
            );
        }

        const product = productRes.rows[0];
        if (product.quantity < quantity) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { error: `Insufficient stock. Requested: ${quantity}, Available: ${product.quantity}.` },
                { status: 400 }
            );
        }

        // 2. Insert sale
        const saleRes = await client.query(
            `INSERT INTO sales (client_name, product_name, size, quantity, selling_price, status, "order", date, phone, email)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, client_name AS "clientName", product_name AS "productName",
                       size, quantity, selling_price AS "sellingPrice",
                       profits,
                       vat,
                       status, "order", date, phone, email`,
            [
                clientName,
                productName,
                size,
                quantity,
                sellingPrice,
                status ?? false,
                order ?? false,
                new Date().toISOString(),
                phone || null,
                email || null,
            ]
        );

        // 3. Decrement stock
        const newQuantity = product.quantity - quantity;
        await client.query(`UPDATE products SET quantity = $1 WHERE id = $2`, [
            newQuantity,
            product.id,
        ]);

        await client.query("COMMIT");

        return NextResponse.json(
            { sale: saleRes.rows[0], newProductQuantity: newQuantity },
            { status: 201 }
        );
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("POST /api/sales error:", error);
        return NextResponse.json({ error: "Failed to record sale." }, { status: 500 });
    } finally {
        client.release();
    }
}
