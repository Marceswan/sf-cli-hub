"use client";

import { Trophy } from "lucide-react";

interface CategoryRankCardProps {
  rank: number | null;
  total: number;
  category: string;
}

export function CategoryRankCard({ rank, total, category }: CategoryRankCardProps) {
  const categoryLabel = category.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="text-primary" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-text-muted">Category Rank</h3>
          <p className="text-xs text-text-muted">{categoryLabel}</p>
        </div>
      </div>
      {rank ? (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-text-main">#{rank}</span>
          <span className="text-sm text-text-muted">of {total}</span>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Not yet ranked</p>
      )}
    </div>
  );
}
