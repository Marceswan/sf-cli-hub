"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export function TagManager({ initialTags }: { initialTags: Tag[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName("");
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      }
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="flex gap-2 sm:gap-3">
        <Input
          id="new-tag"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New tag name..."
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1 sm:max-w-xs"
        />
        <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="shrink-0">
          <Plus size={16} />
          <span className="hidden sm:inline">{creating ? "Adding..." : "Add Tag"}</span>
          <span className="sm:hidden">{creating ? "..." : "Add"}</span>
        </Button>
      </div>

      {/* Tag list */}
      <div className="bg-bg-card border border-border rounded-card overflow-hidden">
        {initialTags.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            No tags yet. Create your first tag above.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {initialTags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  {editingId === tag.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(tag.id)}
                        className="px-2 py-1 bg-bg-surface border border-border rounded text-sm w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRename(tag.id)}
                        className="text-emerald-500 hover:text-emerald-400 cursor-pointer shrink-0"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-text-muted hover:text-text-main cursor-pointer shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary">{tag.name}</Badge>
                      <span className="text-text-muted font-mono text-xs">{tag.slug}</span>
                    </div>
                  )}
                </div>
                {editingId !== tag.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(tag.id);
                        setEditName(tag.name);
                      }}
                      className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                      title="Rename"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deletingId === tag.id}
                      className="text-text-muted hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
