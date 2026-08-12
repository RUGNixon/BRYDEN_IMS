import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

/**
 * DELETE /api/notes/[id]
 * Permanently removes a note (acknowledge action).
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const noteId = parseInt(id, 10);

        if (isNaN(noteId)) {
            return NextResponse.json({ error: "Invalid note ID." }, { status: 400 });
        }

        const note = await pool.query(
            `SELECT
                id,
                (reminder_date IS NULL OR CURRENT_DATE >= reminder_date - INTERVAL '2 days') AS "canAcknowledge",
                (reminder_date - INTERVAL '2 days')::date AS "acknowledgeFrom"
             FROM notes
             WHERE id = $1`,
            [noteId]
        );

        if (note.rowCount === 0) {
            return NextResponse.json({ error: "Note not found." }, { status: 404 });
        }

        if (!note.rows[0].canAcknowledge) {
            const acknowledgeFrom = new Date(note.rows[0].acknowledgeFrom).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

            return NextResponse.json(
                { error: `This note can be acknowledged from ${acknowledgeFrom}.` },
                { status: 409 }
            );
        }

        await pool.query(`DELETE FROM notes WHERE id = $1`, [noteId]);

        return NextResponse.json({ success: true, deletedId: noteId });
    } catch (error) {
        console.error("DELETE /api/notes/[id] error:", error);
        return NextResponse.json({ error: "Failed to delete note." }, { status: 500 });
    }
}
