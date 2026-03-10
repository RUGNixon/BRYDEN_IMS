import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

// PATCH — update a product by id (edit form + stock changes)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Build SET clause dynamically from whatever fields are in the body
        const fieldMap: Record<string, string> = {
            name: "name",
            size: "size",
            category: "category",
            sellingPrice: "selling_price",
            purchasePrice: "purchase_price",
            quantity: "quantity",
        };

        const setClauses: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        for (const [key, col] of Object.entries(fieldMap)) {
            if (key in body) {
                setClauses.push(`${col} = $${paramIndex}`);
                values.push(body[key]);
                paramIndex++;
            }
        }

        if (setClauses.length === 0) {
            return NextResponse.json({ error: "No fields to update." }, { status: 400 });
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE products
             SET ${setClauses.join(", ")}
             WHERE id = $${paramIndex}
             RETURNING id, name, size, category,
                       selling_price AS "sellingPrice",
                       purchase_price AS "purchasePrice",
                       quantity`,
            values
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("PATCH /api/products/[id] error:", error);
        return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
    }
}
