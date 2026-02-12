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
      <div className="flex gap-3">
        <Input
          id="new-tag"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New tag name..."
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="max-w-xs"
        />
        <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
          <Plus size={16} />
          {creating ? "Adding..." : "Add Tag"}
        </Button>
      </div>

      {/* Tag list */}
      <div className="bg-bg-card border border-border rounded-card overflow-hidden">
        {initialTags.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            No tags yet. Create your first tag above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-text-muted">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">Slug</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialTags.map((tag) => (
                <tr key={tag.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {editingId === tag.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRename(tag.id)}
                          className="px-2 py-1 bg-bg-surface border border-border rounded text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRename(tag.id)}
                          className="text-emerald-500 hover:text-emerald-400 cursor-pointer"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-text-muted hover:text-text-main cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <Badge variant="primary">{tag.name}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">
                    {tag.slug}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
