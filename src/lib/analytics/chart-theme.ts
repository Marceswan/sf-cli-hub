"use client";

import { useEffect, useState } from "react";

export interface ChartColors {
  primary: string;
  accent: string;
  accentPink: string;
  textMain: string;
  textMuted: string;
  border: string;
  bgCard: string;
  bgSurface: string;
}

function readColors(): ChartColors {
  if (typeof window === "undefined") {
    return {
      primary: "#00a1e0",
      accent: "#6366f1",
      accentPink: "#ec4899",
      textMain: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
      bgCard: "#ffffff",
      bgSurface: "#f8fafc",
    };
  }

  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim();

  return {
    primary: get("--color-primary") || "#00a1e0",
    accent: get("--color-accent") || "#6366f1",
    accentPink: get("--color-accent-pink") || "#ec4899",
    textMain: get("--color-text-main") || "#0f172a",
    textMuted: get("--color-text-muted") || "#64748b",
    border: get("--color-border") || "#e2e8f0",
    bgCard: get("--color-bg-card") || "#ffffff",
    bgSurface: get("--color-bg-surface") || "#f8fafc",
  };
}

/**
 * Reactively reads CSS custom properties for Recharts color props.
 * Re-reads on theme class changes (light ↔ dark).
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(readColors);

  useEffect(() => {
    // Re-read on theme toggle (class mutation on <html>)
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also read once after mount to catch SSR → client mismatch
    setColors(readColors());

    return () => observer.disconnect();
  }, []);

  return colors;
}
