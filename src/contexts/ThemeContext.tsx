    import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

    type ThemeMode = "light" | "dark";

    type ThemeContextValue = {
    themeMode: ThemeMode;
    toggleTheme: () => void;
    isDark: boolean;
    };

    const ThemeContext = createContext<ThemeContextValue | null>(null);

    export function AppThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeMode] = useState<ThemeMode>("dark");

    useEffect(() => {
        AsyncStorage.getItem("theme_mode").then((saved) => {
        if (saved === "light" || saved === "dark") setThemeMode(saved);
        });
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeMode((prev) => {
        const next = prev === "dark" ? "light" : "dark";
        AsyncStorage.setItem("theme_mode", next);
        return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme, isDark: themeMode === "dark" }}>
        {children}
        </ThemeContext.Provider>
    );
    }

    export function useThemeMode() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
    return ctx;
    }