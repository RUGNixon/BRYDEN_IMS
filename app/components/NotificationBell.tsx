"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, PackageX, AlertTriangle, HandCoins, NotebookPen, X } from "lucide-react";

interface DueNote {
    id: number;
    title: string;
    content: string;
    reminderDate: string;
    createdAt: string;
}

interface NotificationData {
    outOfStock: any[];
    lowStock: any[];
    overdueLoans: any[];
    dueNotes: DueNote[];
    totalNotifications: number;
}

export default function NotificationBell() {
    const [data, setData] = useState<NotificationData | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const popupRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Close popup on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const totalCount = data?.totalNotifications || 0;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const isOverdue = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
    };

    return (
        <div className="relative" ref={popupRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-amber-50 text-amber-500 ring-1 ring-amber-200 transition-colors hover:bg-amber-100 hover:text-amber-600 group"
                aria-label="Notifications"
            >
                <Bell size={20} className="group-hover:animate-pulse" />
                {totalCount > 0 && !isLoading && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-400 rounded-full border-2 border-slate-200 translate-x-1/4 -translate-y-1/4">
                        {totalCount > 99 ? "99+" : totalCount}
                    </span>
                )}
            </button>

            {/* Popup Window */}
            {isOpen && (
                <div className="absolute top-12 left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 origin-top-left sm:origin-top-right">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Loading notifications...</div>
                        ) : totalCount === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                <Bell size={32} className="text-slate-200 mb-3" />
                                <p className="text-slate-500 text-sm font-medium">All caught up!</p>
                                <p className="text-slate-400 text-xs mt-1">Check back later for updates.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {/* ── Due Notes ── */}
                                {data?.dueNotes && data.dueNotes.length > 0 && (
                                    <div className="mb-1">
                                        <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                                            Note Reminders
                                        </p>
                                        {data.dueNotes.map((note) => (
                                            <div
                                                key={`note-${note.id}`}
                                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors"
                                            >
                                                <div className="mt-0.5 p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
                                                    <NotebookPen size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                                        {note.title}
                                                    </p>
                                                    {note.content && (
                                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                            {note.content}
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] font-semibold mt-1.5">
                                                        {isOverdue(note.reminderDate) ? (
                                                            <span className="text-red-500">
                                                                Overdue · {formatDate(note.reminderDate)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-orange-500">
                                                                Due Today · {formatDate(note.reminderDate)}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <Link
                                                    href="/notes"
                                                    onClick={() => setIsOpen(false)}
                                                    className="shrink-0 self-center text-[10px] font-bold text-orange-600 hover:text-orange-800 underline underline-offset-2 transition-colors"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Out of Stock ── */}
                                {data?.outOfStock && data.outOfStock.length > 0 && (
                                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="mt-0.5 p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                                            <PackageX size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 mb-1">Out of Stock</p>
                                            <ol className="flex flex-col gap-0.5">
                                                {data.outOfStock.map((item, idx) => (
                                                    <li key={`oos-${item.id}`} className="text-xs text-slate-700">
                                                        <span className="text-slate-400 font-semibold mr-1">{idx + 1}.</span>
                                                        <span className="font-medium text-slate-900">{item.name}</span>
                                                        {item.size && <span className="text-slate-500"> ({item.size})</span>}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                )}

                                {/* ── Low Stock ── */}
                                {data?.lowStock && data.lowStock.length > 0 && (
                                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="mt-0.5 p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 mb-1">Low Stock Alert</p>
                                            <ol className="flex flex-col gap-0.5">
                                                {data.lowStock.map((item, idx) => (
                                                    <li key={`low-${item.id}`} className="text-xs text-slate-700">
                                                        <span className="text-slate-400 font-semibold mr-1">{idx + 1}.</span>
                                                        <span className="font-medium text-slate-900">{item.name}</span>
                                                        {item.size && <span className="text-slate-500"> ({item.size})</span>}
                                                        <span> only has </span>
                                                        <span className="font-bold text-amber-600">{item.quantity}</span>
                                                        <span> left.</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                )}

                                {/* ── Overdue Loans ── */}
                                {data?.overdueLoans.map((item) => {
                                    const daysOverdue = Math.floor(
                                        (new Date().getTime() - new Date(item.date).getTime()) / (1000 * 3600 * 24)
                                    );
                                    return (
                                        <div
                                            key={`loan-${item.id}`}
                                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="mt-0.5 p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                                                <HandCoins size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Overdue Loan</p>
                                                <p className="text-xs text-slate-600 mt-0.5">
                                                    Loan to{" "}
                                                    <span className="font-medium text-slate-900">{item.clientName}</span> is{" "}
                                                    <span className="font-bold text-indigo-600">{daysOverdue} days</span> overdue.
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                                                    {item.productName} ({item.quantity})
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
