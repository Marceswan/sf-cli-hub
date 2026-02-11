"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle } from "lucide-react";

const categories = [
  { value: "cli-plugins", label: "CLI Plugin" },
  { value: "lwc-library", label: "LWC Component" },
  { value: "apex-utilities", label: "Apex Utility" },
];

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    };

    try {
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
          <Input
            id="iconEmoji"
            name="iconEmoji"
            label="Icon Emoji"
            placeholder="⚡"
            maxLength={10}
          />
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

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          <Send size={16} />
          {loading ? "Submitting..." : "Submit for Review"}
        </Button>
      </form>
    </div>
  );
}
