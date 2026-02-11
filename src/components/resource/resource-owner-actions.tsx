"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ResourceOwnerActionsProps {
  resourceId: string;
  slug: string;
}

export function ResourceOwnerActions({
  resourceId,
  slug,
}: ResourceOwnerActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this resource? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to delete resource");
        return;
      }

      router.push("/browse");
    } catch {
      alert("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/resources/${slug}/edit`}>
        <Button variant="secondary" size="sm">
          <Pencil size={14} />
          Edit
        </Button>
      </Link>
      <Button
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 size={14} />
        {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
