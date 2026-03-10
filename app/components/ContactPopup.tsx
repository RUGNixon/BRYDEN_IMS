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
                className="fixed inset-0 z-[200]"
                onClick={onClose}
            />

            {/* Popup card */}
            <div
                className="fixed z-[201] w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                style={{ left, top }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header strip */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 px-4 py-3 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-indigo-200 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                    >
                        <X size={14} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                        {name.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Body */}
                <div className="px-4 pb-4 pt-3">
                    {/* Name badge */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-3 py-2 mb-3">
                        <div className="flex items-center gap-2">
                            <User size={13} className="text-indigo-400 shrink-0" />
                            <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
                        </div>
                    </div>

                    {hasContacts ? (
                        <div className="space-y-2">
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group"
                                >
                                    <Phone size={13} className="text-indigo-500 shrink-0" />
                                    <span className="text-sm text-slate-700 group-hover:text-indigo-700 font-medium truncate">
                                        {phone}
                                    </span>
                                </a>
                            )}
                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group"
                                >
                                    <Mail size={13} className="text-indigo-500 shrink-0" />
                                    <span className="text-sm text-slate-700 group-hover:text-indigo-700 font-medium truncate">
                                        {email}
                                    </span>
                                </a>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic text-center py-1">No contact info saved</p>
                    )}
                </div>
            </div>
        </>
    );
}
