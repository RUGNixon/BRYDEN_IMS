import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

export const dynamic = "force-dynamic";

/**
 * GET /api/notes
 * Returns all notes, due-today notes first, then by reminder_date ASC, then by created_at DESC.
 */
export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                content,
                reminder_date AS "reminderDate",
                created_at   AS "createdAt"
            FROM notes
            ORDER BY
                reminder_date ASC NULLS LAST,
                created_at DESC
        `);
        return NextResponse.json(result.rows, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("GET /api/notes error:", error);
        return NextResponse.json({ error: "Failed to fetch notes." }, { status: 500 });
    }
}

/**
 * POST /api/notes
 * Body: { title: string, content?: string, reminderDate?: string (YYYY-MM-DD) }
 */
export async function POST(req: NextRequest) {
    try {
        const { title, content = "", reminderDate } = await req.json();

        if (!title || typeof title !== "string" || title.trim() === "") {
            return NextResponse.json({ error: "Title is required." }, { status: 400 });
        }

        const result = await pool.query(
            `INSERT INTO notes (title, content, reminder_date)
             VALUES ($1, $2, $3)
             RETURNING
                id,
                title,
                content,
                reminder_date AS "reminderDate",
                created_at    AS "createdAt"`,
            [title.trim(), content, reminderDate || null]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("POST /api/notes error:", error);
        return NextResponse.json({ error: "Failed to create note." }, { status: 500 });
    }
}
