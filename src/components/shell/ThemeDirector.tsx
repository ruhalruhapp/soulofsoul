"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Theme + RTL director.
 * - Applies 'dark' class to html element when dark mode is on
 * - Sets dir="rtl" and lang="ar" on html element when Arabic is on
 * - Persists across reloads via Zustand persist middleware
 */
export function ThemeDirector() {
  const theme = useAppStore((s) => s.theme);
  const lang = useAppStore((s) => s.lang);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  return null;
}
