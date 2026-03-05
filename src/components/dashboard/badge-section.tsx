"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface BadgeSectionProps {
  slug: string;
}

const STYLES = ["flat", "flat-square", "for-the-badge"] as const;

export function BadgeSection({ slug }: BadgeSectionProps) {
  const [style, setStyle] = useState<string>("flat");
  const [copied, setCopied] = useState(false);

  const badgeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/badge/${slug}.svg?style=${style}`;
  const markdown = `[![SFDXHub](${badgeUrl})](https://sfdxhub.com/resources/${slug})`;

  function handleCopy() {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-text-main mb-4">README Badge</h3>

      <div className="flex gap-2 mb-4">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              style === s
                ? "bg-primary text-white"
                : "bg-bg-surface text-text-muted hover:text-text-main border border-border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Live preview */}
      <div className="bg-bg-surface border border-border rounded-lg p-4 mb-4 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt="Badge preview" className="h-6" />
      </div>

      {/* Markdown snippet */}
      <div className="relative">
        <pre className="bg-bg-surface border border-border rounded-lg p-3 text-xs text-text-muted overflow-x-auto">
          {markdown}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-bg-card border border-border rounded-md hover:bg-bg-surface transition-colors cursor-pointer"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-text-muted" />}
        </button>
      </div>
    </div>
  );
}
