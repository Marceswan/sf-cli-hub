"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function TagPicker({ value, onChange }: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setTags)
      .catch(() => {});
  }, []);

  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">Tags</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const selected = value.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className="cursor-pointer"
            >
              <Badge variant={selected ? "primary" : "default"}>
                {tag.name}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
