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
        return <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">{children}</main>;
    }

    const langLabels: Record<LanguageCode, string> = {
        en: "EN",
        fr: "FR",
        rw: "RW",
    };

    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 shrink-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline-block">
                            {t("systemName")} &bull; {t("tagline")}
                        </span>
                        {user && (
                            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {user.role === "admin" ? (
                                    <ShieldCheck size={13} className="text-indigo-500" />
                                ) : (
                                    <Briefcase size={13} className="text-emerald-500" />
                                )}
                                <span>{user.name}</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Quick Language Toggle */}
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs">
                            <Globe size={14} className="text-slate-400 dark:text-slate-500 ml-1.5 mr-1" />
                            {(["en", "fr", "rw"] as LanguageCode[]).map((lang) => (
                                <button
                                    key={lang}
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

                        {/* Quick Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800/50 shadow-xs transition-all cursor-pointer"
                            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        >
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
                        </button>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* Quick Settings Icon */}
                        <Link
                            href="/settings"
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800/50 shadow-xs transition-all"
                            title={t("navSettings")}
                        >
                            <SettingsIcon size={18} />
                        </Link>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto w-full bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
