import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

// PATCH — update a sale field (e.g. order: false when fulfilled, status: false when settled)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const allowedFields: Record<string, string> = {
            status: "status",
            order: '"order"',
            clientName: "client_name",
            productName: "product_name",
            size: "size",
            quantity: "quantity",
            sellingPrice: "selling_price",
        };

        const setClauses: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        for (const [key, col] of Object.entries(allowedFields)) {
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
            `UPDATE sales
             SET ${setClauses.join(", ")}
             WHERE id = $${paramIndex}
             RETURNING id, client_name AS "clientName", product_name AS "productName",
                       size, quantity, selling_price AS "sellingPrice",
                       status, "order", date`,
            values
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Sale not found." }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("PATCH /api/sales/[id] error:", error);
        return NextResponse.json({ error: "Failed to update sale." }, { status: 500 });
    }
}
