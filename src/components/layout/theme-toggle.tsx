"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-[60px] h-8 bg-bg-surface border border-border rounded-full" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-[60px] h-8 bg-bg-surface border border-border rounded-full p-0.5 cursor-pointer transition-colors"
      aria-label="Toggle theme"
    >
      <div
        className="w-[26px] h-[26px] bg-text-main rounded-full flex items-center justify-center text-bg-body transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        style={{ transform: isDark ? "translateX(28px)" : "translateX(0)" }}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </div>
    </button>
  );
}
