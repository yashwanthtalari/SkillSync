"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to avoid hydration flicker
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
      aria-label="Toggle Theme"
      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      )}
    </button>
  );
}
