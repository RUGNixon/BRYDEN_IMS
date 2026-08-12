import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgres";

/**
 * GET /api/calendar?month=YYYY-MM
 *
 * Returns calendar events for the requested month:
 *   - Tax due dates (VAT 15th, PAYE 15th, CIT 30th of following month, Patente Jan 31)
 *   - Notes with reminder_date in the requested month
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const monthParam = searchParams.get("month"); // YYYY-MM

        const now = new Date();
        const year = monthParam ? parseInt(monthParam.split("-")[0], 10) : now.getFullYear();
        const month = monthParam ? parseInt(monthParam.split("-")[1], 10) : now.getMonth() + 1; // 1-based

        const events: {
            date: string; // YYYY-MM-DD
            type: "vat" | "paye" | "cit" | "patente" | "note";
            label: string;
            color: string;
            noteId?: number;
        }[] = [];

        // ── Tax due dates ──────────────────────────────────────────────

        // VAT: due on the 15th of the following month (i.e. for the PREVIOUS month's sales)
        // We show it as "VAT Filing Due" on the 15th of the CURRENT viewed month
        const vatDate = `${year}-${String(month).padStart(2, "0")}-15`;
        events.push({
            date: vatDate,
            type: "vat",
            label: "VAT Filing Due",
            color: "indigo",
        });

        // PAYE: also due on 15th of the following month
        events.push({
            date: vatDate, // same date as VAT
            type: "paye",
            label: "PAYE Declaration Due",
            color: "emerald",
        });

        // CIT: due 30th of the following month (show in the NEXT month from view perspective)
        // Display it on the 30th of the current viewed month as a provision reminder
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const citDay = Math.min(30, lastDayOfMonth);
        const citDate = `${year}-${String(month).padStart(2, "0")}-${String(citDay).padStart(2, "0")}`;
        events.push({
            date: citDate,
            type: "cit",
            label: "CIT Provision Reminder",
            color: "cyan",
        });

        // Patente: January 31st — only show in January
        if (month === 1) {
            events.push({
                date: `${year}-01-31`,
                type: "patente",
                label: "Trading Licence (Patente) Due",
                color: "amber",
            });
        }

        // ── Notes with reminder_date in the viewed month ───────────────
        const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
        const endOfMonth = `${year}-${String(month).padStart(2, "0")}-${String(lastDayOfMonth).padStart(2, "0")}`;

        const notesRes = await pool.query(
            `SELECT id, title, content, reminder_date AS "reminderDate"
             FROM notes
             WHERE reminder_date >= $1 AND reminder_date <= $2
             ORDER BY reminder_date ASC`,
            [startOfMonth, endOfMonth]
        );

        for (const note of notesRes.rows) {
            const d = new Date(note.reminderDate);
            const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
            events.push({
                date: dateStr,
                type: "note",
                label: note.title,
                color: "orange",
                noteId: note.id,
            });
        }

        return NextResponse.json({ year, month, events });
    } catch (error) {
        console.error("GET /api/calendar error:", error);
        return NextResponse.json({ error: "Failed to fetch calendar events." }, { status: 500 });
    }
}
