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
                <header className="neo-header-bar">
                    <div className="flex items-center gap-3">
                        <span className="neo-header-brand-pill text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider hidden sm:inline-block">
                            {t("systemName")} &bull; {t("tagline")}
                        </span>
                        {user && (
                            <span className="hidden md:inline-flex items-center gap-1.5 neo-header-user-pill">
                                {user.role === "admin" ? (
                                    <ShieldCheck size={13} className="text-blue-600 dark:text-indigo-400 drop-shadow-[0_1px_2px_rgba(37,99,235,0.35)]" />
                                ) : (
                                    <Briefcase size={13} className="text-emerald-600 dark:text-emerald-400 drop-shadow-[0_1px_2px_rgba(16,185,129,0.35)]" />
                                )}
                                <span>{user.name}</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Quick Language Toggle */}
                        <div className="neo-header-lang-tray">
                            <Globe size={14} className="text-slate-500 dark:text-slate-400 ml-1.5 mr-1" />
                            {(["en", "fr", "rw"] as LanguageCode[]).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`neo-header-lang-btn ${
                                        language === lang
                                            ? "neo-header-lang-btn-active"
                                            : "neo-header-lang-btn-inactive"
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
                            className="neo-header-action-btn"
                            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        >
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />}
                        </button>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* Quick Settings Icon */}
                        <Link
                            href="/settings"
                            className="neo-header-action-btn group"
                            title={t("navSettings")}
                        >
                            <SettingsIcon size={18} className="group-hover:rotate-45 transition-transform duration-300" />
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
