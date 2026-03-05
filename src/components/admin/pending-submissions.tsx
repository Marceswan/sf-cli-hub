"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { SubmissionDetailModal } from "./submission-detail-modal";

interface Tag {
  id: string;
  name: string;
}

interface Submission {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  authorName: string | null;
  authorEmail: string | null;
  tags: Tag[];
}

const categoryLabels: Record<string, string> = {
  "cli-plugins": "CLI Plugin",
  "lwc-library": "LWC Component",
  "apex-utilities": "Apex Utility",
  agentforce: "Agentforce",
  flow: "Flow",
  "experience-cloud": "Experience Cloud",
};

export function PendingSubmissions({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (submissions.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-card p-8 text-center">
        <p className="text-text-muted">No pending submissions.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {submissions.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedId(sub.id)}
            className="w-full text-left bg-bg-card border border-border rounded-card p-4 sm:p-6 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">
                  {sub.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge>{categoryLabels[sub.category]}</Badge>
                  {sub.tags.map((t) => (
                    <Badge
                      key={t.id}
                      variant="primary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {t.name}
                    </Badge>
                  ))}
                  <span className="text-xs text-text-muted">
                    by {sub.authorName || sub.authorEmail} &middot;{" "}
                    {formatDate(sub.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-text-muted text-sm line-clamp-2">
              {sub.description}
            </p>
          </button>
        ))}
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
