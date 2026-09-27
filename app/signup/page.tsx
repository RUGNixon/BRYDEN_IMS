"use client";

import React, { Suspense } from "react";
import AuthCard from "@/app/components/auth/AuthCard";
import { useTheme } from "@/app/context/ThemeContext";
import { useLanguage, LanguageCode } from "@/app/context/LanguageContext";
import {
    Sun,
    Moon,
    Globe,
    TrendingUp,
    Shield,
    Boxes,
    Receipt,
    CheckCircle2,
    Lock,
} from "lucide-react";

export default function SignUpPage() {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const langLabels: Record<LanguageCode, string> = {
        en: "EN",
        fr: "FR",
        rw: "RW",
    };

    return (
        <div className="min-h-screen w-full flex flex-col app-page-background text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
            {/* Top Navigation Bar: Theme & Language Quick Switchers */}
            <header className="w-full h-16 px-6 sm:px-12 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                        <Lock size={16} strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                        Bryden IMS
                    </span>
                    <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2 border-l border-slate-200 dark:border-slate-800">
                        Onboarding
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs">
                        <Globe size={14} className="text-slate-400 dark:text-slate-500 ml-1.5 mr-1" />
                        {(["en", "fr", "rw"] as LanguageCode[]).map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => setLanguage(lang)}
                                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    language === lang
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                                title={lang === "en" ? "English" : lang === "fr" ? "Français" : "Ikinyarwanda"}
                            >
                                {langLabels[lang]}
                            </button>
                        ))}
                    </div>

                    {/* Theme Toggle (Light / Dark) */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-xs transition-all cursor-pointer"
                        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        aria-label="Toggle color theme"
                    >
                        {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
                    </button>
                </div>
            </header>

            {/* Main Split-Screen Container */}
            <div className="flex-1 flex flex-col lg:flex-row items-stretch w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 gap-8 lg:gap-12 relative z-20">
                {/* LEFT SHOWCASE PANEL (Desktop & Tablet) */}
                <div className="hidden lg:flex flex-1 flex-col justify-between p-8 xl:p-12 rounded-3xl bg-gradient-to-br from-indigo-950/20 via-slate-900/30 to-indigo-900/10 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
                            <Shield size={14} />
                            <span>Role-Based Permissions &bull; Admin & Manager</span>
                        </div>

                        <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                            Start Managing Your Inventory with Enterprise Rigor.
                        </h2>

                        <p className="text-sm xl:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                            Register an authorized profile to coordinate purchase orders, log product sales, track loan statuses, and ensure financial accountability across your team.
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
                                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                        Administrator Access
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Manage tax frequencies, system language, user credentials, and full audits.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
                                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                                    <Boxes size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                        Inventory Manager
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Record inventory additions, sales, client loan repayments, and operational expenses.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            Strict Role Separation (Admin & Manager)
                        </span>
                        <span>Bryden IMS &copy; 2026</span>
                    </div>
                </div>

                {/* RIGHT AUTH CARD PANEL */}
                <div className="flex-1 flex items-center justify-center">
                    <Suspense fallback={<div className="text-center text-sm py-12">Loading registration portal...</div>}>
                        <AuthCard initialMode="signup" />
                    </Suspense>
                </div>
            </div>

            {/* Bottom Subtle Footer for Mobile */}
            <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600 lg:hidden">
                Bryden IMS &bull; Modern Inventory Management System &copy; 2026
            </footer>
        </div>
    );
}
