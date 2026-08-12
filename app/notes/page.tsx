"use client";

import { useState, useEffect, useCallback } from "react";
import {
    NotebookPen,
    Plus,
    CalendarClock,
    StickyNote,
    CheckCircle2,
    XCircle,
    X,
    AlertTriangle,
    Calendar,
    Clock,
    RefreshCw,
} from "lucide-react";

interface Note {
    id: number;
    title: string;
    content: string;
    reminderDate: string | null;
    createdAt: string;
}

type ToastType = "success" | "error";

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

const NOTES_REFRESH_MS = 10000;

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
    error: <XCircle size={16} className="text-red-500 shrink-0" />,
};

const TOAST_COLORS: Record<ToastType, string> = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
};

function formatDate(dateStr: string) {
    const d = parseDateOnly(dateStr);
    return formatDisplayDate(d);
}

function formatDisplayDate(d: Date) {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function getDueBadge(reminderDate: string | null) {
    if (!reminderDate) return null;
    const today = getToday();
    const due = parseDateOnly(reminderDate);

    if (due < today) {
        return { label: "Overdue", color: "bg-red-100 text-red-700 border-red-200" };
    }
    if (due.getTime() === today.getTime()) {
        return { label: "Due Today", color: "bg-orange-100 text-orange-700 border-orange-200" };
    }
    return { label: `Due ${formatDate(reminderDate)}`, color: "bg-blue-50 text-blue-700 border-blue-200" };
}

function parseDateOnly(dateStr: string) {
    const [datePart] = dateStr.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function getAcknowledgeStatus(reminderDate: string | null) {
    if (!reminderDate) {
        return { canAcknowledge: true, availableOn: null };
    }

    const due = parseDateOnly(reminderDate);
    const availableOn = new Date(due);
    availableOn.setDate(due.getDate() - 2);

    return {
        canAcknowledge: getToday() >= availableOn,
        availableOn,
    };
}

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [showForm, setShowForm] = useState(false);

    // Confirm dialog state
    const [confirmNote, setConfirmNote] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (type: ToastType, message: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };

    const fetchNotes = useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true);
        try {
            const res = await fetch("/api/notes", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
                setLastSyncedAt(new Date());
            }
        } catch (e) {
            console.error("Failed to fetch notes", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes(true);

        const interval = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchNotes();
            }
        }, NOTES_REFRESH_MS);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchNotes();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchNotes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    reminderDate: reminderDate || undefined,
                }),
            });
            if (!res.ok) throw new Error("Failed to save note");
            const newNote: Note = await res.json();
            setNotes((prev) => [newNote, ...prev]);
            setLastSyncedAt(new Date());
            setTitle("");
            setContent("");
            setReminderDate("");
            setShowForm(false);
            showToast("success", "Note saved successfully.");
        } catch {
            showToast("error", "Could not save note. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAcknowledgeClick = (note: Note) => {
        const status = getAcknowledgeStatus(note.reminderDate);
        if (!status.canAcknowledge && status.availableOn) {
            showToast("error", `This note can be acknowledged from ${formatDisplayDate(status.availableOn)}.`);
            return;
        }
        setConfirmNote(note);
    };

    const handleConfirmDelete = async () => {
        if (!confirmNote) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/notes/${confirmNote.id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "Failed to delete note");
            }
            setNotes((prev) => prev.filter((n) => n.id !== confirmNote.id));
            setLastSyncedAt(new Date());
            setConfirmNote(null);
            showToast("success", "Note acknowledged and removed.");
        } catch (error) {
            showToast("error", error instanceof Error ? error.message : "Could not delete note. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    const dueNotes = notes.filter((n) => {
        if (!n.reminderDate) return false;
        return parseDateOnly(n.reminderDate) <= getToday();
    });
    const upcomingNotes = notes.filter((n) => {
        if (!n.reminderDate) return false;
        return parseDateOnly(n.reminderDate) > getToday();
    });
    const noDateNotes = notes.filter((n) => !n.reminderDate);

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* ── Toast Notifications ── */}
            <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 w-full max-w-xs pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in slide-in-from-right-6 fade-in duration-300 ${TOAST_COLORS[t.type]}`}
                    >
                        {TOAST_ICONS[t.type]}
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>

            {/* ── Confirm Delete Dialog ── */}
            {confirmNote && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle size={28} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">Acknowledge Note?</h3>
                                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                                    This will permanently remove{" "}
                                    <span className="font-semibold text-slate-800">&ldquo;{confirmNote.title}&rdquo;</span>{" "}
                                    from the system. This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setConfirmNote(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? "Acknowledging..." : "Acknowledge"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Page Header ── */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-orange-500/20 rounded-2xl border border-orange-400/30">
                            <NotebookPen size={24} className="text-orange-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Notes</h1>
                            <p className="text-slate-400 text-sm">Keep track of important reminders and ideas.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 border border-white/10">
                            {notes.length} total note{notes.length !== 1 ? "s" : ""}
                        </span>
                        {dueNotes.length > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-400/30 animate-pulse">
                                {dueNotes.length} overdue / due today
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-200 border border-emerald-400/20">
                            <RefreshCw size={12} />
                            Live database view
                        </span>
                    </div>
                    {lastSyncedAt && (
                        <p className="text-slate-500 text-xs mt-2">
                            Last updated {lastSyncedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </p>
                    )}
                </div>
                <div className="relative z-10">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm shadow-lg shadow-orange-900/30 hover:shadow-orange-500/40 active:scale-95 transition-all duration-200"
                    >
                        <Plus size={18} />
                        <span>New Note</span>
                    </button>
                </div>
            </div>

            {/* ── New Note Form ── */}
            {showForm && (
                <div className="bg-white rounded-3xl border border-orange-200 shadow-lg overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-orange-50/50">
                        <div className="flex items-center gap-2">
                            <StickyNote size={18} className="text-orange-500" />
                            <h2 className="font-bold text-slate-800 text-sm">New Note</h2>
                        </div>
                        <button
                            onClick={() => { setShowForm(false); setTitle(""); setContent(""); setReminderDate(""); }}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter note title…"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 text-sm placeholder:text-slate-400 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your note here…"
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 text-sm placeholder:text-slate-400 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <CalendarClock size={13} />
                                    Reminder Date (optional)
                                </span>
                            </label>
                            <input
                                type="date"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                                min={today}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 text-sm transition-all"
                            />
                            <p className="text-xs text-slate-400 mt-1.5">
                                If set, this note will appear in the notification bell on and after the chosen date.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setTitle(""); setContent(""); setReminderDate(""); }}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !title.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-md shadow-orange-200 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Plus size={16} />
                                {isSubmitting ? "Saving…" : "Save Note"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Notes List ── */}
            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : notes.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center shadow-sm">
                    <StickyNote size={48} className="text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-500">No notes yet</h3>
                    <p className="text-slate-400 text-sm mt-1">Click &ldquo;New Note&rdquo; to get started.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Due / Overdue */}
                    {dueNotes.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} /> Overdue / Due Today
                            </h2>
                            <div className="flex flex-col gap-3">
                                {dueNotes.map((note) => <NoteCard key={note.id} note={note} onAcknowledge={handleAcknowledgeClick} />)}
                            </div>
                        </section>
                    )}

                    {/* Upcoming */}
                    {upcomingNotes.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Calendar size={14} /> Upcoming Reminders
                            </h2>
                            <div className="flex flex-col gap-3">
                                {upcomingNotes.map((note) => <NoteCard key={note.id} note={note} onAcknowledge={handleAcknowledgeClick} />)}
                            </div>
                        </section>
                    )}

                    {/* No date */}
                    {noDateNotes.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Clock size={14} /> General Notes
                            </h2>
                            <div className="flex flex-col gap-3">
                                {noDateNotes.map((note) => <NoteCard key={note.id} note={note} onAcknowledge={handleAcknowledgeClick} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Note Card ──────────────────────────────────────────────────────────────────
function NoteCard({ note, onAcknowledge }: { note: Note; onAcknowledge: (note: Note) => void }) {
    const badge = getDueBadge(note.reminderDate);
    const isUrgent = badge?.label === "Due Today" || badge?.label === "Overdue";
    const acknowledgeStatus = getAcknowledgeStatus(note.reminderDate);
    const lockedMessage =
        !acknowledgeStatus.canAcknowledge && acknowledgeStatus.availableOn
            ? `Can acknowledge from ${formatDisplayDate(acknowledgeStatus.availableOn)}`
            : null;

    return (
        <div
            className={`group bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                isUrgent ? "border-red-200 hover:border-red-300" : "border-slate-200 hover:border-orange-200"
            }`}
        >
            <div className="p-5 flex items-start gap-4">
                <div className={`mt-0.5 p-2.5 rounded-xl shrink-0 ${isUrgent ? "bg-red-100 text-red-500" : "bg-orange-100 text-orange-500"}`}>
                    <NotebookPen size={18} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base leading-tight">{note.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                            {badge && (
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                                    {badge.label}
                                </span>
                            )}
                        </div>
                    </div>

                    {note.content && (
                        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                            {note.content}
                        </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        <p className="flex items-center gap-1">
                            <Clock size={11} />
                            Created {formatDateTime(note.createdAt)}
                        </p>
                        {lockedMessage && (
                            <p className="font-semibold text-blue-500">
                                {lockedMessage}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => onAcknowledge(note)}
                    disabled={!acknowledgeStatus.canAcknowledge}
                    title="Acknowledge & delete this note"
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs border active:scale-95 transition-all duration-200 ${
                        acknowledgeStatus.canAcknowledge
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100 hover:border-emerald-200"
                            : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                    }`}
                >
                    <CheckCircle2 size={14} />
                    Acknowledge
                </button>
            </div>
        </div>
    );
}
