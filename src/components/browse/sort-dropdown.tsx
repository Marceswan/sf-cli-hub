"use client";

import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviews" },
  { value: "name", label: "Name (A-Z)" },
  { value: "oldest", label: "Oldest" },
];

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "px-4 py-3 bg-bg-surface border border-border rounded-lg text-text-main text-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors",
        "cursor-pointer appearance-none",
        className
      )}
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
