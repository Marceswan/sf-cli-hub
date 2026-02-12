"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagFilterProps {
  value: string;
  onChange: (slug: string) => void;
}

export function TagFilter({ value, onChange }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setTags)
      .catch(() => {});
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = value === tag.slug;
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onChange(active ? "" : tag.slug)}
            className="cursor-pointer"
          >
            <Badge variant={active ? "primary" : "default"}>
              {tag.name}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
