"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import React from "react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import { useTheme } from "@/app/context/ThemeContext";
import { useLanguage, LanguageCode } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { Sun, Moon, Globe, Settings as SettingsIcon, ShieldCheck, Briefcase } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login" || pathname === "/signup" || pathname === "/register" || pathname === "/";
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();

    if (isLoginPage) {
        return <main className="min-h-screen app-page-background text-slate-900 dark:text-slate-100">{children}</main>;
    }

    const langLabels: Record<LanguageCode, string> = {
        en: "EN",
        fr: "FR",
        rw: "RW",
    };

    return (
        <div className="flex app-page-background text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 shrink-0 z-40 bg-[#e2ecfc]/85 dark:bg-slate-950/70 backdrop-blur-md dark:backdrop-blur-xl border-b border-[rgba(163,185,230,0.4)] dark:border-white/10 shadow-[0_4px_16px_rgba(163,185,230,0.2)] dark:shadow-none transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                            {t("systemName")} &bull; {t("tagline")}
                        </span>
                        {user && (
                            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e2ecfc] dark:bg-slate-900/60 dark:backdrop-blur-md border border-white/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-[3px_3px_8px_rgba(163,185,230,0.45),-3px_-3px_8px_rgba(255,255,255,0.9)]">
                                {user.role === "admin" ? (
                                    <ShieldCheck size={13} className="text-blue-600 dark:text-indigo-500" />
                                ) : (
                                    <Briefcase size={13} className="text-emerald-600 dark:text-emerald-500" />
                                )}
                                <span>{user.name}</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Quick Language Toggle */}
                        <div className="flex items-center bg-[#dce8ff] dark:bg-slate-900/60 dark:backdrop-blur-md border border-[rgba(163,185,230,0.45)] dark:border-white/10 rounded-xl p-1 shadow-[inset_2px_2px_5px_rgba(163,185,230,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.85)]">
                            <Globe size={14} className="text-slate-500 dark:text-slate-400 ml-1.5 mr-1" />
                            {(["en", "fr", "rw"] as LanguageCode[]).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        language === lang
                                            ? "bg-blue-600 text-white shadow-[2px_2px_6px_rgba(37,99,235,0.35)]"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                    title={lang === "en" ? "English" : lang === "fr" ? "Français" : "Ikinyarwanda"}
                                >
                                    {langLabels[lang]}
                                </button>
                            ))}
                        </div>

                        {/* Quick Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-[#e2ecfc] dark:bg-slate-900/60 dark:backdrop-blur-md border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-400 hover:border-blue-200 dark:hover:border-indigo-800/50 shadow-[3px_3px_8px_rgba(163,185,230,0.45),-3px_-3px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,185,230,0.5)] transition-all cursor-pointer"
                            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        >
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
                        </button>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* Quick Settings Icon */}
                        <Link
                            href="/settings"
                            className="p-2 rounded-xl bg-[#e2ecfc] dark:bg-slate-900/60 dark:backdrop-blur-md border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-400 hover:border-blue-200 dark:hover:border-indigo-800/50 shadow-[3px_3px_8px_rgba(163,185,230,0.45),-3px_-3px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,185,230,0.5)] transition-all"
                            title={t("navSettings")}
                        >
                            <SettingsIcon size={18} />
                        </Link>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto w-full bg-transparent transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
