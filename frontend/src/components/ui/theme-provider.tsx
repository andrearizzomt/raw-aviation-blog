"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const isInitialRun = useRef(true);

  useEffect(() => {
    setMounted(true);
    
    // Get initial theme from localStorage or system preference
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem("theme") as Theme;
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        setTheme(systemTheme);
      }
    }
  }, []);

  // Apply theme class on <html>. Skip the transition on the initial run so
  // page load doesn't flash; animate on every subsequent toggle.
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const html = document.documentElement;

    if (isInitialRun.current) {
      isInitialRun.current = false;
      localStorage.setItem("theme", theme);
      html.classList.remove("light", "dark");
      html.classList.add(theme);
      return;
    }

    html.classList.add("theme-transitioning");
    localStorage.setItem("theme", theme);

    // Let the browser apply the transition rule before the theme class swap
    // so the color change itself is what gets animated (not snapped).
    const rafId = window.requestAnimationFrame(() => {
      html.classList.remove("light", "dark");
      html.classList.add(theme);
    });

    const timeoutId = window.setTimeout(() => {
      html.classList.remove("theme-transitioning");
    }, 280);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 