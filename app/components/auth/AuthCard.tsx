"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Lock,
    Mail,
    User,
    Phone,
    ShieldCheck,
    Briefcase,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    KeyRound,
    Sparkles,
    Check,
    HelpCircle,
    X,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";

interface AuthCardProps {
    initialMode?: "signin" | "signup";
}

export default function AuthCard({ initialMode = "signin" }: AuthCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/dashboard";

    const { login, register } = useAuth();
    const { t } = useLanguage();

    const [mode, setMode] = useState<"signin" | "signup">(initialMode);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Sign-In Form State
    const [signInEmail, setSignInEmail] = useState("");
    const [signInPassword, setSignInPassword] = useState("");
    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Sign-Up Form State
    const [signUpName, setSignUpName] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
    const [signUpPhone, setSignUpPhone] = useState("");
    const [signUpRole, setSignUpRole] = useState<"admin" | "manager">("manager");
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

    // Forgot Password Modal State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSent, setForgotSent] = useState(false);

    // Password strength calculation for Sign-Up
    const passwordRequirements = useMemo(() => {
        return {
            length: signUpPassword.length >= 8,
            uppercase: /[A-Z]/.test(signUpPassword),
            lowercase: /[a-z]/.test(signUpPassword),
            number: /[0-9]/.test(signUpPassword),
            special: /[^A-Za-z0-9]/.test(signUpPassword),
        };
    }, [signUpPassword]);

    const passwordStrengthScore = useMemo(() => {
        if (!signUpPassword) return 0;
        let score = 0;
        if (passwordRequirements.length) score += 1;
        if (passwordRequirements.uppercase) score += 1;
        if (passwordRequirements.lowercase) score += 1;
        if (passwordRequirements.number) score += 1;
        if (passwordRequirements.special) score += 1;
        return score;
    }, [signUpPassword, passwordRequirements]);

    const passwordsMatch = useMemo(() => {
        if (!signUpConfirmPassword) return null;
        return signUpPassword === signUpConfirmPassword;
    }, [signUpPassword, signUpConfirmPassword]);

    // Handle Sign In Submit
    const handleSignInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!signInEmail || !signInPassword) {
            setErrorMessage("Please provide both email and password.");
            return;
        }

        setIsLoading(true);
        const res = await login({
            email: signInEmail.trim(),
            password: signInPassword,
            rememberMe,
        });
        setIsLoading(false);

        if (!res.success) {
            setErrorMessage(res.error || "Authentication failed. Please check your credentials.");
        } else {
            setSuccessMessage("Authentication successful! Redirecting...");
            router.push(redirectUrl);
            router.refresh();
        }
    };

    // Handle Sign Up Submit
    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!signUpName.trim()) {
            setErrorMessage("Please enter your full name.");
            return;
        }

        if (!signUpEmail.trim()) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        if (passwordStrengthScore < 3) {
            setErrorMessage("Please choose a stronger password (minimum 8 characters with upper, lower, and numbers).");
            return;
        }

        if (signUpPassword !== signUpConfirmPassword) {
            setErrorMessage("Password confirmation does not match.");
            return;
        }

        setIsLoading(true);
        const res = await register({
            name: signUpName.trim(),
            email: signUpEmail.trim(),
            password: signUpPassword,
            role: signUpRole,
            phone: signUpPhone.trim() || undefined,
            rememberMe,
        });
        setIsLoading(false);

        if (!res.success) {
            setErrorMessage(res.error || "Registration failed. Please try again.");
        } else {
            setSuccessMessage("Account created successfully! Redirecting to workspace...");
            router.push(redirectUrl);
            router.refresh();
        }
    };

    // Pre-fill demo credentials
    const handleQuickDemoFill = () => {
        setSignInEmail("admin@brydenims.com");
        setSignInPassword("admin123");
        setErrorMessage("");
    };

    return (
        <div className="w-full max-w-md mx-auto relative">
            {/* Ambient Background Glow Effect */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Main Auth Card */}
            <div className="relative rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden transition-all duration-300">
                {/* Top Subtle Gradient Stripe */}
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500" />

                <div className="p-6 sm:p-8">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                                <Lock size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    Bryden IMS
                                </h1>
                                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {t("tagline")}
                                </p>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                            <ShieldCheck size={13} />
                            <span>Encrypted</span>
                        </div>
                    </div>

                    {/* Mode Segmented Tab Switcher */}
                    <div className="p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("signin");
                                setErrorMessage("");
                                setSuccessMessage("");
                            }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                                mode === "signin"
                                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                        >
                            <KeyRound size={14} />
                            <span>{t("authSignIn")}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("signup");
                                setErrorMessage("");
                                setSuccessMessage("");
                            }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                                mode === "signup"
                                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                        >
                            <User size={14} />
                            <span>{t("authSignUp")}</span>
                        </button>
                    </div>

                    {/* Form Headline */}
                    <div className="mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                            {mode === "signin" ? t("authWelcomeBack") : t("authCreateAccountTitle")}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {mode === "signin"
                                ? t("authWelcomeBackSubtitle")
                                : t("authCreateAccountSubtitle")}
                        </p>
                    </div>

                    {/* Feedback Alert Banners */}
                    {errorMessage && (
                        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <div className="flex-1 font-medium">{errorMessage}</div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                            <div className="flex-1 font-medium">{successMessage}</div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SIGN IN FORM                                                */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {mode === "signin" && (
                        <form onSubmit={handleSignInSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div>
                                <label
                                    htmlFor="signin-email"
                                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                                >
                                    {t("authEmail")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        id="signin-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={signInEmail}
                                        onChange={(e) => setSignInEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label
                                        htmlFor="signin-password"
                                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                                    >
                                        {t("authPassword")}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(true)}
                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                    >
                                        {t("authForgotPassword")}
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        id="signin-password"
                                        type={showSignInPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={signInPassword}
                                        onChange={(e) => setSignInPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        aria-label={showSignInPassword ? "Hide password" : "Show password"}
                                    >
                                        {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        {t("authRememberMe")}
                                    </span>
                                </label>
                            </div>

                            {/* Sign In Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span>{t("authSigningIn")}</span>
                                ) : (
                                    <>
                                        <span>{t("authSignInBtn")}</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            {/* 1-Click Demo Shortcut */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleQuickDemoFill}
                                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <Sparkles size={14} className="text-indigo-500" />
                                    <span>{t("authQuickDemo")}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SIGN UP FORM                                                */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {mode === "signup" && (
                        <form onSubmit={handleSignUpSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="signup-name"
                                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                                >
                                    {t("authFullName")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <input
                                        id="signup-name"
                                        type="text"
                                        required
                                        value={signUpName}
                                        onChange={(e) => setSignUpName(e.target.value)}
                                        placeholder="Jean-Paul Habimana"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="signup-email"
                                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                                >
                                    {t("authEmail")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        id="signup-email"
                                        type="email"
                                        required
                                        value={signUpEmail}
                                        onChange={(e) => setSignUpEmail(e.target.value)}
                                        placeholder="admin@brydenims.com"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Role Selection (Strictly Admin and Manager) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    {t("authRole")}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Admin Card */}
                                    <div
                                        onClick={() => setSignUpRole("admin")}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                            signUpRole === "admin"
                                                ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20"
                                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {t("authRoleAdmin")}
                                                </span>
                                            </div>
                                            {signUpRole === "admin" && (
                                                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                            Full system control & user admin
                                        </p>
                                    </div>

                                    {/* Manager Card */}
                                    <div
                                        onClick={() => setSignUpRole("manager")}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                            signUpRole === "manager"
                                                ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20"
                                                : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase size={16} className="text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {t("authRoleManager")}
                                                </span>
                                            </div>
                                            {signUpRole === "manager" && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                            Inventory, sales & operations
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Phone (Optional) */}
                            <div>
                                <label
                                    htmlFor="signup-phone"
                                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                                >
                                    {t("authPhone")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        id="signup-phone"
                                        type="tel"
                                        value={signUpPhone}
                                        onChange={(e) => setSignUpPhone(e.target.value)}
                                        placeholder="+250 788 123 456"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="signup-password"
                                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                                >
                                    {t("authPassword")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        id="signup-password"
                                        type={showSignUpPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={signUpPassword}
                                        onChange={(e) => setSignUpPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                                    >
                                        {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {/* Password Strength Visual Indicator */}
                                {signUpPassword && (
                                    <div className="mt-2 space-y-1.5">
                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    passwordStrengthScore <= 2
                                                        ? "w-1/3 bg-red-500"
                                                        : passwordStrengthScore <= 4
                                                        ? "w-2/3 bg-amber-500"
                                                        : "w-full bg-emerald-500"
                                                }`}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                            <span className={passwordRequirements.length ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                                                &bull; 8+ chars
                                            </span>
                                            <span className={passwordRequirements.uppercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                                                &bull; Uppercase
                                            </span>
                                            <span className={passwordRequirements.lowercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                                                &bull; Lowercase
                                            </span>
                                            <span className={passwordRequirements.number ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                                                &bull; Number
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="signup-confirm-password"
                                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                                >
                                    {t("authConfirmPassword")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        id="signup-confirm-password"
                                        type={showSignUpConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={signUpConfirmPassword}
                                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        aria-label={showSignUpConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showSignUpConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordsMatch !== null && (
                                    <p className={`text-[11px] mt-1 font-medium ${passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                                    </p>
                                )}
                            </div>

                            {/* Sign Up Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span>{t("authRegistering")}</span>
                                ) : (
                                    <>
                                        <span>{t("authSignUpBtn")}</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Bottom Mode Switcher Link */}
                    <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
                        {mode === "signin" ? (
                            <span>
                                {t("authNoAccount")}{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode("signup");
                                        setErrorMessage("");
                                        setSuccessMessage("");
                                    }}
                                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                    {t("authSignUp")}
                                </button>
                            </span>
                        ) : (
                            <span>
                                {t("authHaveAccount")}{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode("signin");
                                        setErrorMessage("");
                                        setSuccessMessage("");
                                    }}
                                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                    {t("authSignIn")}
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FORGOT PASSWORD MODAL HELPER                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                    <HelpCircle size={20} />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Reset Password
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotModal(false);
                                    setForgotSent(false);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {!forgotSent ? (
                            <>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Enter your registered administrator or manager email address. In Bryden IMS, administrators can also reset user passwords directly via the system Settings page.
                                </p>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="admin@brydenims.com"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForgotSent(true)}
                                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/20"
                                    >
                                        Send Reset Instructions
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-4 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                    <Check size={24} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Instructions Dispatched
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    If an account with that email exists, password recovery details have been logged. You can also sign in with the default admin account: <span className="font-semibold text-indigo-600 dark:text-indigo-400">admin@brydenims.com</span>
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotModal(false);
                                        setForgotSent(false);
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                                >
                                    Return to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
