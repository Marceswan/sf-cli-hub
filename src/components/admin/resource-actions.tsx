"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";

interface ResourceActionsProps {
  resourceId: string;
  slug: string;
  status: string;
  featured: boolean;
}

export function ResourceActions({
  resourceId,
  slug,
  status,
  featured,
}: ResourceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleFeatured() {
    setLoading(true);
    try {
      await fetch(`/api/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    setLoading(true);
    try {
      await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1">
      <Link
        href={`/resources/${slug}/edit`}
        className="p-1.5 rounded hover:bg-bg-surface transition-colors text-text-muted hover:text-text-main"
        title="Edit"
      >
        <Pencil size={14} />
      </Link>
      {status === "approved" && (
        <button
          onClick={toggleFeatured}
          disabled={loading}
          className="p-1.5 rounded hover:bg-bg-surface transition-colors cursor-pointer"
          title={featured ? "Unfeature" : "Feature"}
        >
          <Star
            size={14}
            className={featured ? "fill-star text-star" : "text-text-muted"}
          />
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-text-muted hover:text-red-500 cursor-pointer"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
