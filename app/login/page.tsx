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

export default function LoginPage() {
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
                        Portal
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
                    {/* Decorative Background Mesh */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
                            <Shield size={14} />
                            <span>Enterprise Inventory Security &bull; v2.0</span>
                        </div>

                        <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                            Smart, Real-Time Inventory Control & Compliance.
                        </h2>

                        <p className="text-sm xl:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                            Track multi-warehouse stock, automate sales profitability, monitor Rwanda VAT (18%) declarations, and secure operations with role-based access control.
                        </p>

                        {/* Interactive Feature Highlights */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                    <Boxes size={18} />
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Live Stock
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Instant low-stock alerts and unit size categorization.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <Receipt size={18} />
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        VAT & Profits
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Automated 18% tax deduction & self-populating profits.
                                </p>
                            </div>
                        </div>

                        {/* Floating Metric Preview Card */}
                        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-slate-800/5 to-emerald-500/10 border border-indigo-500/20 backdrop-blur-md flex items-center justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        System Status
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        All Modules Online &bull; 99.9% Uptime
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                Active
                            </span>
                        </div>
                    </div>

                    {/* Bottom Security Footer */}
                    <div className="relative z-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            256-bit Scrypt & SHA-256 Encryption
                        </span>
                        <span>Bryden IMS &copy; 2026</span>
                    </div>
                </div>

                {/* RIGHT AUTH CARD PANEL */}
                <div className="flex-1 flex items-center justify-center">
                    <Suspense fallback={<div className="text-center text-sm py-12">Loading authentication portal...</div>}>
                        <AuthCard initialMode="signin" />
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
