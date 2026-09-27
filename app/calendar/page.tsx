"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Circle,
    NotebookPen,
    Receipt,
    TrendingUp,
    ShieldCheck,
    DollarSign,
} from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────
type EventType = "vat" | "paye" | "cit" | "patente" | "note";

interface CalendarEvent {
    date: string; // YYYY-MM-DD
    type: EventType;
    label: string;
    color: string;
    noteId?: number;
}

// ── Color & style config ───────────────────────────────────────────────────────
const EVENT_CONFIG: Record<
    EventType,
    {
        dot: string;
        badge: string;
        bg: string;
        border: string;
        text: string;
        icon: React.ReactNode;
        legend: string;
    }
> = {
    vat: {
        dot: "bg-indigo-500",
        badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        icon: <Receipt size={14} />,
        legend: "VAT Filing Due",
    },
    paye: {
        dot: "bg-emerald-500",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        icon: <DollarSign size={14} />,
        legend: "PAYE Declaration Due",
    },
    cit: {
        dot: "bg-cyan-500",
        badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        text: "text-cyan-700",
        icon: <TrendingUp size={14} />,
        legend: "CIT Provision Reminder",
    },
    patente: {
        dot: "bg-amber-500",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: <ShieldCheck size={14} />,
        legend: "Trading Licence (Patente) Due",
    },
    note: {
        dot: "bg-orange-500",
        badge: "bg-orange-100 text-orange-700 border-orange-200",
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        icon: <NotebookPen size={14} />,
        legend: "Note Reminder",
    },
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function toYYYYMM(year: number, month: number) {
    return `${year}-${String(month).padStart(2, "0")}`;
}

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    return `${d} ${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEvents = useCallback(async (y: number, m: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/calendar?month=${toYYYYMM(y, m)}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (e) {
            console.error("Failed to fetch calendar events", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents(year, month);
    }, [year, month, fetchEvents]);

    const handlePrev = () => {
        if (month === 1) { setYear(y => y - 1); setMonth(12); }
        else setMonth(m => m - 1);
    };

    const handleNext = () => {
        if (month === 12) { setYear(y => y + 1); setMonth(1); }
        else setMonth(m => m + 1);
    };

    // Build the calendar grid
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

    // Group events by date
    const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
        if (!acc[ev.date]) acc[ev.date] = [];
        acc[ev.date].push(ev);
        return acc;
    }, {});

    // Build cells (prev month overflow, current month, next month overflow)
    const cells: { dateStr: string; day: number; isCurrentMonth: boolean }[] = [];

    // Prev month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        cells.push({
            dateStr: `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
            day: d,
            isCurrentMonth: false,
        });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({
            dateStr: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
            day: d,
            isCurrentMonth: true,
        });
    }

    // Next month leading days
    const remaining = 42 - cells.length; // always 6 rows × 7 cols = 42
    for (let d = 1; d <= remaining; d++) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        cells.push({
            dateStr: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
            day: d,
            isCurrentMonth: false,
        });
    }

    const today = todayStr();

    // Upcoming events (sorted)
    const upcomingEvents = [...events]
        .filter((e) => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 8);

    // Legend types present in this month
    const presentTypes = Array.from(new Set(events.map((e) => e.type)));

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* ── Page Header ── */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
                            <CalendarDays size={24} className="text-indigo-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Calendar</h1>
                            <p className="text-slate-400 text-sm">Tax deadlines, note reminders and key dates at a glance.</p>
                        </div>
                    </div>
                </div>

                {/* Month Navigator */}
                <div className="relative z-10 flex items-center gap-3 self-start xl:self-auto">
                    <div className="flex items-center bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden">
                        <button
                            onClick={handlePrev}
                            className="p-3 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                            title="Previous Month"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="px-5 font-bold text-sm text-white whitespace-nowrap">
                            {MONTH_NAMES[month - 1]} {year}
                        </span>
                        <button
                            onClick={handleNext}
                            className="p-3 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                            title="Next Month"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => fetchEvents(year, month)}
                        disabled={isLoading}
                        className="p-3 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 rounded-2xl transition-all disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* ── Calendar Grid ─────────────────────────────────────── */}
                <div className="glass-card xl:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        {DAYS_OF_WEEK.map((d) => (
                            <div
                                key={d}
                                className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar cells */}
                    {isLoading ? (
                        <div className="grid grid-cols-7">
                            {Array.from({ length: 42 }).map((_, i) => (
                                <div key={i} className="h-20 border-b border-r border-slate-50 p-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-100 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7">
                            {cells.map((cell, idx) => {
                                const cellEvents = eventsByDate[cell.dateStr] || [];
                                const isToday = cell.dateStr === today;
                                const isLastCol = (idx + 1) % 7 === 0;
                                const isLastRow = idx >= 35;

                                return (
                                    <div
                                        key={idx}
                                        className={`min-h-[90px] p-2 flex flex-col gap-1 ${!isLastCol ? "border-r" : ""} ${!isLastRow ? "border-b" : ""} border-slate-100 dark:border-slate-800/80 ${
                                            !cell.isCurrentMonth ? "bg-slate-50/60 dark:bg-slate-950/40" : "bg-white dark:bg-slate-900/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/30"
                                        } transition-colors`}
                                    >
                                        {/* Day number */}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                                    isToday
                                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                        : cell.isCurrentMonth
                                                        ? "text-slate-700 dark:text-slate-200"
                                                        : "text-slate-300 dark:text-slate-600"
                                                }`}
                                            >
                                                {cell.day}
                                            </span>
                                        </div>

                                        {/* Event pills */}
                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                            {cellEvents.slice(0, 3).map((ev, evIdx) => {
                                                const cfg = EVENT_CONFIG[ev.type];
                                                return (
                                                    <div
                                                        key={evIdx}
                                                        title={ev.label}
                                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border truncate ${cfg.badge} ${cfg.border}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                                                        <span className="truncate">{ev.label}</span>
                                                    </div>
                                                );
                                            })}
                                            {cellEvents.length > 3 && (
                                                <span className="text-[10px] text-slate-400 font-medium px-1">
                                                    +{cellEvents.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Right Sidebar ─────────────────────────────────────── */}
                <div className="xl:col-span-1 flex flex-col gap-5">
                    {/* Legend */}
                    <div className="glass-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Legend</h2>
                        <div className="flex flex-col gap-2.5">
                            {(Object.entries(EVENT_CONFIG) as [EventType, typeof EVENT_CONFIG[EventType]][]).map(
                                ([type, cfg]) => (
                                    <div key={type} className="flex items-center gap-3">
                                        <span className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            <span className={cfg.text}>{cfg.icon}</span>
                                            <span>{cfg.legend}</span>
                                        </div>
                                        {!presentTypes.includes(type) && (
                                            <span className="ml-auto text-[10px] text-slate-300 dark:text-slate-600 font-medium">
                                                —
                                            </span>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                            Tax due dates are displayed based on the current viewed month. Patente only appears in January.
                        </p>
                    </div>

                    {/* Upcoming Events */}
                    <div className="glass-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            Upcoming This Month
                        </h2>
                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : upcomingEvents.length === 0 ? (
                            <div className="text-center py-6">
                                <Circle size={28} className="text-slate-200 mx-auto mb-2" />
                                <p className="text-xs text-slate-400 font-medium">No upcoming events</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {upcomingEvents.map((ev, idx) => {
                                    const cfg = EVENT_CONFIG[ev.type];
                                    const isNoteType = ev.type === "note";
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                                        >
                                            <div className={`mt-0.5 shrink-0 ${cfg.text}`}>{cfg.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold truncate ${cfg.text}`}>
                                                    {ev.label}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {formatDisplayDate(ev.date)}
                                                </p>
                                            </div>
                                            {isNoteType && (
                                                <Link
                                                    href="/notes"
                                                    className={`shrink-0 self-center text-[10px] font-bold underline underline-offset-2 ${cfg.text} hover:opacity-70 transition-opacity`}
                                                >
                                                    View
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick links */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Links</h2>
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/notes"
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs border border-orange-100 transition-colors"
                            >
                                <NotebookPen size={14} />
                                Manage Notes
                            </Link>
                            <Link
                                href="/taxes"
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-100 transition-colors"
                            >
                                <Receipt size={14} />
                                Tax Obligations
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
