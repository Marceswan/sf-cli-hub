"use client";

import { cn } from "@/lib/utils";

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const;

interface PulseFilterBarProps {
  range: string;
  onRangeChange: (range: string) => void;
}

export function PulseFilterBar({ range, onRangeChange }: PulseFilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onRangeChange(r.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
            range === r.value
              ? "bg-primary text-white"
              : "bg-bg-surface text-text-muted hover:text-text-main border border-border"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
