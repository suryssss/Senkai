"use client";

import { createContext, useContext, useState, useEffect, useSyncExternalStore } from "react";

const ThemeContext = createContext({
    theme: "dark",
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

const emptySubscribe = () => () => {};

export function ThemeProvider({ children }) {
    const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("structflow-theme") || "dark";
        const raf = requestAnimationFrame(() => {
            setTheme(savedTheme);
            document.documentElement.setAttribute("data-theme", savedTheme);
        });
        return () => cancelAnimationFrame(raf);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("structflow-theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    if (!isMounted) {
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
