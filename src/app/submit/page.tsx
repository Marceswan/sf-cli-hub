"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { TagPicker } from "@/components/ui/tag-picker";
import { Send, CheckCircle, ImagePlus, X } from "lucide-react";
import Image from "next/image";

const categories = [
  { value: "cli-plugins", label: "CLI Plugin" },
  { value: "lwc-library", label: "LWC Component" },
  { value: "apex-utilities", label: "Apex Utility" },
  { value: "agentforce", label: "Agentforce" },
  { value: "flow", label: "Flow" },
  { value: "experience-cloud", label: "Experience Cloud" },
];

const MAX_SCREENSHOTS = 5;

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addScreenshots(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_SCREENSHOTS - screenshotFiles.length;
    const newFiles = Array.from(files).slice(0, remaining);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setScreenshotFiles((prev) => [...prev, ...newFiles]);
    setScreenshotPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeScreenshot(index: number) {
    URL.revokeObjectURL(screenshotPreviews[index]);
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
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
      // Step 1: Create resource
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Submission failed");
        return;
      }

      const resource = await res.json();

      // Step 2: Upload screenshots one at a time
      for (const file of screenshotFiles) {
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

      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Submission Received!</h1>
        <p className="text-text-muted mb-8">
          Your tool has been submitted for review. We&apos;ll notify you once
          it&apos;s approved.
        </p>
        <Button onClick={() => router.push("/browse")}>
          Browse Tools
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Submit a Tool</h1>
      <p className="text-text-muted mb-8">
        Share your CLI plugin, LWC component, or Apex utility with the
        community. Submissions are reviewed before being published.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required fields */}
        <Input id="name" name="name" label="Tool Name" required />
        <Input
          id="authorName"
          name="authorName"
          label="Author"
          placeholder="Leave blank to use your account name"
        />

        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-4 py-3 bg-bg-surface border border-border rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          >
            <option value="">Select a category</option>
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
            placeholder="Brief description of what your tool does..."
            className="w-full px-4 py-3 bg-bg-surface border border-border rounded-lg text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Optional fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EmojiPicker name="iconEmoji" label="Icon Emoji" />
          <Input
            id="version"
            name="version"
            label="Version"
            placeholder="1.0.0"
          />
        </div>

        <Input
          id="installCommand"
          name="installCommand"
          label="Install Command"
          placeholder="npm install my-plugin"
        />

        <Input
          id="repositoryUrl"
          name="repositoryUrl"
          label="Repository URL"
          type="url"
          placeholder="https://github.com/..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="npmUrl"
            name="npmUrl"
            label="npm URL"
            type="url"
            placeholder="https://npmjs.com/..."
          />
          <Input
            id="documentationUrl"
            name="documentationUrl"
            label="Documentation URL"
            type="url"
            placeholder="https://..."
          />
        </div>

        {/* Screenshots */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">
            Screenshots ({screenshotFiles.length}/{MAX_SCREENSHOTS})
          </label>
          <p className="text-xs text-text-muted">
            Upload up to {MAX_SCREENSHOTS} screenshots. PNG, JPG, WebP, or GIF. Max 5 MB each.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            {screenshotPreviews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-video rounded-lg overflow-hidden border border-border"
              >
                <Image
                  src={src}
                  alt={`Preview ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors cursor-pointer"
                  aria-label="Remove screenshot"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {screenshotFiles.length < MAX_SCREENSHOTS && (
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
            onChange={(e) => addScreenshots(e.target.files)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          <Send size={16} />
          {loading ? "Submitting..." : "Submit for Review"}
        </Button>
      </form>
    </div>
  );
}
