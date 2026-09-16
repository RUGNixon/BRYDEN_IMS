"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: "admin" | "manager";
    status: "active" | "suspended" | "pending";
    phone?: string | null;
    avatarUrl?: string | null;
    createdAt?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<{ success: boolean; error?: string }>;
    register: (data: { name: string; email: string; password: string; role: "admin" | "manager"; phone?: string; rememberMe?: boolean }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
    login: async () => ({ success: false }),
    register: async () => ({ success: false }),
    logout: async () => {},
    refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchCurrentUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.user) {
                    setUser(data.user);
                    return;
                }
            }
            setUser(null);
        } catch (err) {
            console.error("Failed to load user profile:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const data = await res.json();
            if (!res.ok) {
                return { success: false, error: data.error || "Login failed." };
            }

            setUser(data.user);
            return { success: true };
        } catch (err) {
            console.error("Login request error:", err);
            return { success: false, error: "Network error occurred. Please try again." };
        }
    };

    const register = async (data: { name: string; email: string; password: string; role: "admin" | "manager"; phone?: string; rememberMe?: boolean }) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) {
                return { success: false, error: result.error || "Registration failed." };
            }

            setUser(result.user);
            return { success: true };
        } catch (err) {
            console.error("Register request error:", err);
            return { success: false, error: "Network error occurred. Please try again." };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Logout request error:", err);
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser: fetchCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
