"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface SubmissionActionsProps {
  resourceId: string;
}

export function SubmissionActions({ resourceId }: SubmissionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(status: "approved" | "rejected") {
    setLoading(status);
    try {
      await fetch(`/api/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {
      // silent fail
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="primary"
        onClick={() => handleAction("approved")}
        disabled={loading !== null}
      >
        <Check size={14} />
        {loading === "approved" ? "Approving..." : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => handleAction("rejected")}
        disabled={loading !== null}
      >
        <X size={14} />
        {loading === "rejected" ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  );
}
