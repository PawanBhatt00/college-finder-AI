"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeCtx = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("cf-theme");

    const preferred: Theme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";

    const initial: Theme =
      saved === "dark" || saved === "light" ? saved : preferred;

    document.documentElement.classList.toggle("dark", initial === "dark");
    localStorage.setItem("cf-theme", initial);

    const frame = requestAnimationFrame(() => {
      setTheme(initial);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";

      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("cf-theme", next);

      return next;
    });
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);