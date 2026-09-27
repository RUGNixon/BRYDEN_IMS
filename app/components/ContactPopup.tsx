"use client";

import { Phone, Mail, X, User } from "lucide-react";

interface ContactPopupProps {
    name: string;
    phone?: string | null;
    email?: string | null;
    onClose: () => void;
    /** Position the popup near the anchor element (x/y screen coords) */
    position: { x: number; y: number };
}

export default function ContactPopup({ name, phone, email, onClose, position }: ContactPopupProps) {
    const hasContacts = phone || email;

    // Keep popup within viewport
    const left = Math.min(position.x, window.innerWidth - 280);
    const top = position.y + 10;

    return (
        <>
            {/* Invisible backdrop to catch outside clicks */}
            <div
                className="fixed inset-0 z-[200] bg-slate-950/20 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            {/* Popup card */}
            <div
                className="fixed z-[201] w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors"
                style={{ left, top }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header strip */}
                <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 px-4 py-3 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-indigo-100 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer"
                        aria-label="Close contact details"
                    >
                        <X size={15} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/30 shadow-sm shrink-0">
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 pr-6">
                            <p className="text-white font-bold text-sm truncate">{name}</p>
                            <p className="text-indigo-200 text-xs">Direct Contact</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-3.5 space-y-2.5">
                    {hasContacts ? (
                        <div className="space-y-2">
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
                                >
                                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Phone size={13} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Phone</p>
                                        <p className="text-xs text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-semibold truncate">
                                            {phone}
                                        </p>
                                    </div>
                                </a>
                            )}
                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
                                >
                                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Mail size={13} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Email</p>
                                        <p className="text-xs text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-semibold truncate">
                                            {email}
                                        </p>
                                    </div>
                                </a>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-2">No phone or email recorded</p>
                    )}
                </div>
            </div>
        </>
    );
}
