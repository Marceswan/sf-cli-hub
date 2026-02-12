"use client";

import { cn } from "@/lib/utils";

const categories = [
  { value: "", label: "All" },
  { value: "cli-plugins", label: "CLI Plugins" },
  { value: "lwc-library", label: "LWC Library" },
  { value: "apex-utilities", label: "Apex Utilities" },
  { value: "agentforce", label: "Agentforce" },
  { value: "flow", label: "Flow" },
  { value: "experience-cloud", label: "Experience Cloud" },
];

interface CategoryTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-1 border-b border-border pb-px overflow-x-auto">
      {categories.map((cat) => {
        const isActive = value === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors rounded-t-lg -mb-px whitespace-nowrap cursor-pointer",
              isActive
                ? "text-primary border-b-2 border-primary"
                : "text-text-muted hover:text-text-main"
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
