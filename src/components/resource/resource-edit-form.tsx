"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { TagPicker } from "@/components/ui/tag-picker";
import { Save, ImagePlus, X, Trash2 } from "lucide-react";
import Image from "next/image";

const categories = [
  { value: "cli-plugins", label: "CLI Plugin" },
  { value: "lwc-library", label: "LWC Component" },
  { value: "apex-utilities", label: "Apex Utility" },
];

const MAX_SCREENSHOTS = 5;

interface Screenshot {
  id: string;
  url: string;
  displayOrder: number;
}

interface ResourceTag {
  id: string;
  name: string;
  slug: string;
}

interface ResourceEditFormProps {
  resource: {
    id: string;
    name: string;
    slug: string;
    description: string;
    longDescription: string | null;
    category: string;
    installCommand: string | null;
    repositoryUrl: string | null;
    npmUrl: string | null;
    documentationUrl: string | null;
    iconEmoji: string | null;
    version: string | null;
    authorName: string | null;
  };
  screenshots: Screenshot[];
  tags?: ResourceTag[];
}

export function ResourceEditForm({ resource, screenshots, tags: initialTags = [] }: ResourceEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags.map((t) => t.id));
  const [existingScreenshots, setExistingScreenshots] = useState<Screenshot[]>(screenshots);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = existingScreenshots.length + newFiles.length;

  function addScreenshots(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_SCREENSHOTS - totalCount;
    const added = Array.from(files).slice(0, remaining);
    const previews = added.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...added]);
    setNewPreviews((prev) => [...prev, ...previews]);
  }

  function removeNewScreenshot(index: number) {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function removeExistingScreenshot(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/uploads/screenshots/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExistingScreenshots((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // silently fail, screenshot stays visible
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      longDescription: formData.get("longDescription") as string,
      category: formData.get("category") as string,
      installCommand: formData.get("installCommand") as string,
      repositoryUrl: formData.get("repositoryUrl") as string,
      npmUrl: formData.get("npmUrl") as string,
      documentationUrl: formData.get("documentationUrl") as string,
      iconEmoji: formData.get("iconEmoji") as string,
      version: formData.get("version") as string,
      authorName: (formData.get("authorName") as string) || undefined,
      tagIds: selectedTags,
    };

    try {
      // Step 1: Update resource fields
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Update failed");
        return;
      }

      // Step 2: Upload new screenshots one at a time
      for (const file of newFiles) {
        const uploadForm = new FormData();
        uploadForm.append("resourceId", resource.id);
        uploadForm.append("file", file);

        const uploadRes = await fetch("/api/uploads/screenshots", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          console.error("Screenshot upload failed:", await uploadRes.text());
        }
      }

      router.push(`/resources/${resource.slug}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        label="Tool Name"
        required
        defaultValue={resource.name}
      />

      <Input
        id="authorName"
        name="authorName"
        label="Author"
        placeholder="Leave blank to use your account name"
        defaultValue={resource.authorName || ""}
      />

      <div className="space-y-1.5">
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={resource.category}
          className="w-full px-4 py-3 bg-bg-surface border border-border rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <TagPicker value={selectedTags} onChange={setSelectedTags} />

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium">
          Short Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          minLength={10}
          maxLength={500}
          defaultValue={resource.description}
          className="w-full px-4 py-3 bg-bg-surface border border-border rounded-lg text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EmojiPicker name="iconEmoji" label="Icon Emoji" defaultValue={resource.iconEmoji || ""} />
        <Input
          id="version"
          name="version"
          label="Version"
          placeholder="1.0.0"
          defaultValue={resource.version || ""}
        />
      </div>

      <Input
        id="installCommand"
        name="installCommand"
        label="Install Command"
        placeholder="npm install my-plugin"
        defaultValue={resource.installCommand || ""}
      />

      <Input
        id="repositoryUrl"
        name="repositoryUrl"
        label="Repository URL"
        type="url"
        placeholder="https://github.com/..."
        defaultValue={resource.repositoryUrl || ""}
      />

      <div className="space-y-1.5">
        <label htmlFor="longDescription" className="block text-sm font-medium">
          Long Description
        </label>
        <p className="text-xs text-text-muted">
          If a GitHub Repository URL is provided, this will be auto-populated
          from the repo&apos;s README on save. Otherwise, paste markdown or HTML
          here.
        </p>
        <textarea
          id="longDescription"
          name="longDescription"
          rows={10}
          defaultValue={resource.longDescription || ""}
          placeholder="Paste markdown or HTML content..."
          className="w-full px-4 py-3 bg-bg-surface border border-border rounded-lg text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-y font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="npmUrl"
          name="npmUrl"
          label="npm URL"
          type="url"
          placeholder="https://npmjs.com/..."
          defaultValue={resource.npmUrl || ""}
        />
        <Input
          id="documentationUrl"
          name="documentationUrl"
          label="Documentation URL"
          type="url"
          placeholder="https://..."
          defaultValue={resource.documentationUrl || ""}
        />
      </div>

      {/* Screenshots */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          Screenshots ({totalCount}/{MAX_SCREENSHOTS})
        </label>
        <p className="text-xs text-text-muted">
          Upload up to {MAX_SCREENSHOTS} screenshots. PNG, JPG, WebP, or GIF. Max 5 MB each.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {/* Existing screenshots */}
          {existingScreenshots.map((shot) => (
            <div
              key={shot.id}
              className="relative aspect-video rounded-lg overflow-hidden border border-border group"
            >
              <Image
                src={shot.url}
                alt={`Screenshot`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <button
                type="button"
                onClick={() => removeExistingScreenshot(shot.id)}
                disabled={deletingId === shot.id}
                className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Remove screenshot"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* New screenshot previews */}
          {newPreviews.map((src, i) => (
            <div
              key={`new-${i}`}
              className="relative aspect-video rounded-lg overflow-hidden border border-dashed border-primary/50"
            >
              <Image
                src={src}
                alt={`New preview ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <button
                type="button"
                onClick={() => removeNewScreenshot(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Remove screenshot"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                New
              </div>
            </div>
          ))}

          {/* Add button */}
          {totalCount < MAX_SCREENSHOTS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary cursor-pointer"
            >
              <ImagePlus size={20} />
              <span className="text-xs">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            addScreenshots(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        <Save size={16} />
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
