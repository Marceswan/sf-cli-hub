"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { SubmissionDetailModal } from "./submission-detail-modal";

interface Submission {
  id: string;
  name: string;
  category: string;
  status: string;
  createdAt: string;
  authorName: string | null;
}

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

export function RecentSubmissions({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-1">
        {submissions.length === 0 ? (
          <p className="text-text-muted text-sm">No submissions yet.</p>
        ) : (
          submissions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedId(sub.id)}
              className="flex items-center justify-between w-full py-2.5 px-2 -mx-2 border-b border-border last:border-0 rounded-lg hover:bg-bg-surface transition-colors cursor-pointer text-left"
            >
              <div className="min-w-0 mr-3">
                <p className="font-medium text-sm truncate">{sub.name}</p>
                <p className="text-xs text-text-muted truncate">
                  by {sub.authorName || "Unknown"} &middot;{" "}
                  {formatDate(sub.createdAt)}
                </p>
              </div>
              <Badge variant={statusVariant[sub.status]} className="shrink-0">
                {sub.status}
              </Badge>
            </button>
          ))
        )}
      </div>

      {selectedId && (
        <SubmissionDetailModal
          resourceId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
