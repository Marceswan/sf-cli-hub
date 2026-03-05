"use client";

interface DashboardFilterBarProps {
  range: string;
  onRangeChange: (range: string) => void;
  isPro: boolean;
}

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "365d", label: "1 year" },
  { value: "all", label: "All time" },
];

export function DashboardFilterBar({ range, onRangeChange, isPro }: DashboardFilterBarProps) {
  return (
    <div className="flex gap-1 bg-bg-surface border border-border rounded-lg p-1">
      {RANGES.map((r) => {
        const disabled = !isPro && r.value !== "30d";
        return (
          <button
            key={r.value}
            onClick={() => !disabled && onRangeChange(r.value)}
            disabled={disabled}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              range === r.value
                ? "bg-primary text-white"
                : disabled
                ? "text-text-muted/40 cursor-not-allowed"
                : "text-text-muted hover:text-text-main hover:bg-bg-card cursor-pointer"
            }`}
            title={disabled ? "Pro feature" : undefined}
          >
            {r.label}
            {disabled && " 🔒"}
          </button>
        );
      })}
    </div>
  );
}
