"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

const categories = [
  { value: "cli-plugins", label: "CLI Plugin" },
  { value: "lwc-library", label: "LWC Component" },
  { value: "apex-utilities", label: "Apex Utility" },
];

interface ResourceEditFormProps {
  resource: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    installCommand: string | null;
    repositoryUrl: string | null;
    npmUrl: string | null;
    documentationUrl: string | null;
    iconEmoji: string | null;
    version: string | null;
  };
}

export function ResourceEditForm({ resource }: ResourceEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        <Input
          id="iconEmoji"
          name="iconEmoji"
          label="Icon Emoji"
          placeholder="⚡"
          maxLength={10}
          defaultValue={resource.iconEmoji || ""}
        />
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        <Save size={16} />
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
