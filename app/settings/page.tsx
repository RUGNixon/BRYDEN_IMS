"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Languages,
    Calculator,
    Moon,
    Sun,
    Lock,
    Mail,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    ShieldCheck,
    CalendarClock,
    Sparkles,
    Check,
    RefreshCw,
    Save
} from "lucide-react";
import { useLanguage, LanguageCode } from "@/app/context/LanguageContext";
import { useTheme, ThemeMode } from "@/app/context/ThemeContext";

interface ToastMessage {
    type: "success" | "error" | "info";
    title: string;
    description: string;
}

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();

    // Tax schedule state: "monthly" | "quarterly"
    const [taxSchedule, setTaxSchedule] = useState<"monthly" | "quarterly">("monthly");
    const [email, setEmail] = useState<string>("admin@brydenims.com");

    // Loading & status states
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isSavingTax, setIsSavingTax] = useState(false);
    const [toast, setToast] = useState<ToastMessage | null>(null);

    // Password Update Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    // Email Update Form State
    const [newEmail, setNewEmail] = useState("");
    const [emailPasswordConfirm, setEmailPasswordConfirm] = useState("");
    const [showEmailPass, setShowEmailPass] = useState(false);
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [emailError, setEmailError] = useState("");

    // Fetch existing settings on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.taxPaymentSchedule) {
                        setTaxSchedule(data.taxPaymentSchedule);
                    }
                    if (data.email) {
                        setEmail(data.email);
                    }
                    if (data.language && (data.language === "en" || data.language === "fr" || data.language === "rw")) {
                        setLanguage(data.language);
                    }
                    if (data.theme && (data.theme === "light" || data.theme === "dark")) {
                        setTheme(data.theme);
                    }
                }
            } catch (err) {
                console.error("Error loading settings:", err);
            } finally {
                setIsLoadingInitial(false);
            }
        }
        loadSettings();
    }, [setLanguage, setTheme]);

    // Toast auto-dismiss
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Handle Language Change
    const handleLanguageSelect = async (lang: LanguageCode) => {
        setLanguage(lang);
        try {
            await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language: lang, taxPaymentSchedule: taxSchedule, theme }),
            });
            setToast({
                type: "success",
                title: lang === "en" ? "Language Updated" : lang === "fr" ? "Langue Modifiée" : "Ururimi Rwahinduwe",
                description: lang === "en" ? "System language has been updated to English." : lang === "fr" ? "La langue du système a été définie sur le Français." : "Ururimi rwa sisitemu rwabaye Ikinyarwanda.",
            });
        } catch (err) {
            console.error("Failed to save language to DB:", err);
        }
    };

    // Handle Theme Change
    const handleThemeSelect = async (newTheme: ThemeMode) => {
        setTheme(newTheme);
        try {
            await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language, taxPaymentSchedule: taxSchedule, theme: newTheme }),
            });
            setToast({
                type: "success",
                title: newTheme === "dark" ? "Dark Mode Activated" : "Light Mode Activated",
                description: newTheme === "dark" ? "Sleek dark aesthetics applied across Bryden IMS." : "Clean, bright daylight theme applied.",
            });
        } catch (err) {
            console.error("Failed to save theme to DB:", err);
        }
    };

    // Handle Tax Schedule Change
    const handleTaxScheduleChange = async (schedule: "monthly" | "quarterly") => {
        setTaxSchedule(schedule);
        setIsSavingTax(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language, taxPaymentSchedule: schedule, theme }),
            });
            if (res.ok) {
                setToast({
                    type: "success",
                    title: schedule === "monthly" ? "Monthly Filing Selected" : "Quarterly Filing Selected",
                    description: schedule === "monthly" 
                        ? "Deadlines tracked on the 15th of each consecutive month." 
                        : "Deadlines tracked on the 15th following the end of each quarter (Q1-Q4).",
                });
            }
        } catch (err) {
            console.error("Failed to save tax schedule:", err);
            setToast({
                type: "error",
                title: "Error",
                description: "Failed to update tax payment schedule.",
            });
        } finally {
            setIsSavingTax(false);
        }
    };

    // Compute dynamic next deadline date
    const nextTaxDeadline = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed (0 = Jan, 8 = Sep)
        const day = now.getDate();

        if (taxSchedule === "monthly") {
            // If today is before or on the 15th, deadline is this month on the 15th
            // If today is after the 15th, deadline is next month on the 15th
            let targetMonth = month;
            let targetYear = year;
            if (day > 15) {
                targetMonth += 1;
                if (targetMonth > 11) {
                    targetMonth = 0;
                    targetYear += 1;
                }
            }
            const dateObj = new Date(targetYear, targetMonth, 15);
            return dateObj.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } else {
            // Quarterly:
            // Q1: Jan-Mar -> due April 15
            // Q2: Apr-Jun -> due July 15
            // Q3: Jul-Sep -> due October 15
            // Q4: Oct-Dec -> due January 15 of next year
            const quarter = Math.floor(month / 3); // 0 = Q1, 1 = Q2, 2 = Q3, 3 = Q4
            let targetQuarterDueMonth: number;
            let targetYear = year;

            if (quarter === 0) {
                targetQuarterDueMonth = 3; // April
            } else if (quarter === 1) {
                targetQuarterDueMonth = 6; // July
            } else if (quarter === 2) {
                targetQuarterDueMonth = 9; // October
            } else {
                targetQuarterDueMonth = 0; // January
                targetYear += 1;
            }

            const dateObj = new Date(targetYear, targetQuarterDueMonth, 15);
            return dateObj.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    }, [taxSchedule]);

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        if (!newPassword) return 0;
        let score = 0;
        if (newPassword.length >= 6) score += 1;
        if (newPassword.length >= 10) score += 1;
        if (/[A-Z]/.test(newPassword)) score += 1;
        if (/[0-9]/.test(newPassword)) score += 1;
        if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
        return score; // 0 to 5
    }, [newPassword]);

    // Handle Password Update Submit
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        if (!currentPassword) {
            setPasswordError("Please enter your current password.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const res = await fetch("/api/settings/security", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update_password",
                    currentPasswordInput: currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setPasswordError(data.error || "Failed to update password.");
            } else {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setToast({
                    type: "success",
                    title: "Password Updated",
                    description: t("passwordSuccess"),
                });
            }
        } catch (err) {
            console.error("Password update error:", err);
            setPasswordError("An unexpected network error occurred.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // Handle Email Update Submit
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError("");

        if (!newEmail || !newEmail.includes("@")) {
            setEmailError("Please enter a valid email address.");
            return;
        }
        if (!emailPasswordConfirm) {
            setEmailError("Please enter your current password to authorize this change.");
            return;
        }

        setIsUpdatingEmail(true);
        try {
            const res = await fetch("/api/settings/security", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update_email",
                    newEmail,
                    passwordConfirm: emailPasswordConfirm,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setEmailError(data.error || "Failed to update email.");
            } else {
                setEmail(data.email || newEmail);
                setNewEmail("");
                setEmailPasswordConfirm("");
                setToast({
                    type: "success",
                    title: "Email Updated",
                    description: t("emailSuccess"),
                });
            }
        } catch (err) {
            console.error("Email update error:", err);
            setEmailError("An unexpected network error occurred.");
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 transition-colors duration-300">
            {/* ═══════════════════════════════════════════════════════════ */}
            {/* FLOATING TOAST NOTIFICATION                                 */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 flex items-start gap-3.5 p-4 rounded-2xl shadow-xl border backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-slate-100 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
                    {toast.type === "success" ? (
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <CheckCircle2 size={20} />
                        </div>
                    ) : (
                        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 shrink-0">
                            <AlertCircle size={20} />
                        </div>
                    )}
                    <div className="flex-1">
                        <h4 className="font-bold text-sm">{toast.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{toast.description}</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* HEADER                                                      */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
                <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                            <Sparkles size={20} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {t("settingsTitle")}
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("settingsSubtitle")}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Admin: {email}</span>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 1. LANGUAGE SETTINGS                                        */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 shrink-0">
                        <Languages size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                            {t("languageTitle")}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t("languageSubtitle")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* English Card */}
                    <button
                        type="button"
                        onClick={() => handleLanguageSelect("en")}
                        className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                            language === "en"
                                ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-3xl mb-3">🇬🇧</span>
                            {language === "en" && (
                                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                                    <Check size={12} /> {t("active")}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">English</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Standard international English terminology for all inventories and reports.
                            </p>
                        </div>
                    </button>

                    {/* Français Card */}
                    <button
                        type="button"
                        onClick={() => handleLanguageSelect("fr")}
                        className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                            language === "fr"
                                ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-3xl mb-3">🇫🇷</span>
                            {language === "fr" && (
                                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                                    <Check size={12} /> {t("active")}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">Français</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Traduction complète en langue française pour l'ensemble des modules du système.
                            </p>
                        </div>
                    </button>

                    {/* Kinyarwanda Card */}
                    <button
                        type="button"
                        onClick={() => handleLanguageSelect("rw")}
                        className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                            language === "rw"
                                ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-3xl mb-3">🇷🇼</span>
                            {language === "rw" && (
                                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                                    <Check size={12} /> {t("active")}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">Ikinyarwanda</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Ururimi gakondo rw'u Rwanda mu kumenyekanisha imisoro, ibicuruzwa n'inguzanyo.
                            </p>
                        </div>
                    </button>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 2. TAX PAYMENT METHOD (Monthly & Quarterly)                 */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                            {t("taxTitle")}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t("taxSubtitle")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    {/* Monthly Card */}
                    <div
                        onClick={() => handleTaxScheduleChange("monthly")}
                        className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                            taxSchedule === "monthly"
                                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                                    Monthly
                                </span>
                                {taxSchedule === "monthly" && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 size={16} /> {t("selected")}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {t("taxMonthlyTitle")}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                {t("taxMonthlyDesc")}
                            </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span>Cycle: Every 30 Days</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Deadline: 15th monthly</span>
                        </div>
                    </div>

                    {/* Quarterly Card */}
                    <div
                        onClick={() => handleTaxScheduleChange("quarterly")}
                        className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                            taxSchedule === "quarterly"
                                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                    Quarterly
                                </span>
                                {taxSchedule === "quarterly" && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 size={16} /> {t("selected")}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {t("taxQuarterlyTitle")}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                {t("taxQuarterlyDesc")}
                            </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span>Cycle: Every 3 Months (Q1-Q4)</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Deadline: 15th post-quarter</span>
                        </div>
                    </div>
                </div>

                {/* Dynamic Next Deadline Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-xs shrink-0">
                            <CalendarClock size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                {t("taxNextDeadline")}
                            </span>
                            <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                                {nextTaxDeadline}
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 max-w-sm sm:text-right">
                        {taxSchedule === "monthly" ? t("taxMonthlyNotice") : t("taxQuarterlyNotice")}
                    </div>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 italic">
                    {t("taxComplianceNote")}
                </p>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 3. THEME SELECTION (Light & Dark)                           */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 shrink-0">
                        {theme === "light" ? <Sun size={24} /> : <Moon size={24} />}
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                            {t("themeTitle")}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t("themeSubtitle")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Light Theme Card */}
                    <div
                        onClick={() => handleThemeSelect("light")}
                        className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                            theme === "light"
                                ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                                        <Sun size={18} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                        {t("themeLightTitle")}
                                    </h3>
                                </div>
                                {theme === "light" && (
                                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                                        <Check size={12} /> {t("active")}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                                {t("themeLightDesc")}
                            </p>
                        </div>

                        {/* Light Mode Visual Preview Box */}
                        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
                                <span className="font-semibold text-slate-700">Light Canvas</span>
                            </div>
                            <span className="px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-600 text-[10px] font-bold">
                                #FFFFFF
                            </span>
                        </div>
                    </div>

                    {/* Dark Theme Card */}
                    <div
                        onClick={() => handleThemeSelect("dark")}
                        className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                            theme === "dark"
                                ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-slate-800 text-indigo-400">
                                        <Moon size={18} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                        {t("themeDarkTitle")}
                                    </h3>
                                </div>
                                {theme === "dark" && (
                                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                                        <Check size={12} /> {t("active")}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                                {t("themeDarkDesc")}
                            </p>
                        </div>

                        {/* Dark Mode Visual Preview Box */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                                <span className="font-semibold text-slate-200">Dark OLED Canvas</span>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-400 text-[10px] font-bold">
                                #020617
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 4. UPDATE PASSWORD & 5. UPDATE EMAIL (Grid Layout)          */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── 4. Update Password Form ── */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors">
                    <div>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                                    {t("passwordTitle")}
                                </h2>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {t("passwordSubtitle")}
                                </p>
                            </div>
                        </div>

                        {passwordError && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{passwordError}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    {t("currentPasswordLabel")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPass ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password (default: admin123)"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    {t("newPasswordLabel")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPass ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter at least 6 characters"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPass(!showNewPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Password Strength Meter */}
                                {newPassword && (
                                    <div className="mt-2 space-y-1">
                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    passwordStrength <= 2
                                                        ? "w-1/3 bg-red-500"
                                                        : passwordStrength <= 3
                                                        ? "w-2/3 bg-amber-500"
                                                        : "w-full bg-emerald-500"
                                                }`}
                                            ></div>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            {passwordStrength <= 2
                                                ? t("passwordStrengthWeak")
                                                : passwordStrength <= 3
                                                ? t("passwordStrengthMedium")
                                                : t("passwordStrengthStrong")}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    {t("confirmPasswordLabel")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPass ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingPassword}
                                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isUpdatingPassword ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        <span>{t("saving")}</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={16} />
                                        <span>{t("updatePasswordBtn")}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>

                {/* ── 5. Update Email Form ── */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors">
                    <div>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40 shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                                    {t("emailTitle")}
                                </h2>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {t("emailSubtitle")}
                                </p>
                            </div>
                        </div>

                        {/* Current Email Badge */}
                        <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                    {t("currentEmailLabel")}
                                </span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                    {email}
                                </span>
                            </div>
                            <span className="px-2.5 py-1 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-bold rounded-lg border border-cyan-200/60 dark:border-cyan-800">
                                Verified
                            </span>
                        </div>

                        {emailError && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{emailError}</span>
                            </div>
                        )}

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            {/* New Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    {t("newEmailLabel")}
                                </label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="e.g. manager@brydenims.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    {t("confirmWithPasswordLabel")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showEmailPass ? "text" : "password"}
                                        value={emailPasswordConfirm}
                                        onChange={(e) => setEmailPasswordConfirm(e.target.value)}
                                        placeholder="Enter your current password"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailPass(!showEmailPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        {showEmailPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingEmail}
                                className="w-full mt-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-cyan-600/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isUpdatingEmail ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        <span>{t("saving")}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>{t("updateEmailBtn")}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}
