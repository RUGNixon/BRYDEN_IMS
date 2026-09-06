"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    setTheme: () => {},
    toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeMode>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage first
        const savedTheme = localStorage.getItem("bryden_theme") as ThemeMode;
        if (savedTheme === "light" || savedTheme === "dark") {
            setThemeState(savedTheme);
            applyTheme(savedTheme);
        } else {
            // Check system preferences or fetch from API
            fetch("/api/settings")
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data?.theme === "light" || data?.theme === "dark") {
                        setThemeState(data.theme);
                        applyTheme(data.theme);
                        localStorage.setItem("bryden_theme", data.theme);
                    }
                })
                .catch(() => {});
        }
    }, []);

    const applyTheme = (targetTheme: ThemeMode) => {
        if (typeof document !== "undefined") {
            const root = document.documentElement;
            if (targetTheme === "dark") {
                root.classList.add("dark");
                root.setAttribute("data-theme", "dark");
            } else {
                root.classList.remove("dark");
                root.setAttribute("data-theme", "light");
            }
        }
    };

    const setTheme = (newTheme: ThemeMode) => {
        setThemeState(newTheme);
        localStorage.setItem("bryden_theme", newTheme);
        applyTheme(newTheme);
    };

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
