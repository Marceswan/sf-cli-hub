"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Check,
  ExternalLink,
  Github,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ResourceDetail {
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
  iconEmoji: string;
  version: string | null;
  status: string;
  featured: boolean;
  avgRating: string | null;
  reviewsCount: number;
  createdAt: string;
  authorName: string | null;
  tags: { id: string; name: string; slug: string }[];
}

const categoryLabels: Record<string, string> = {
  "cli-plugins": "CLI Plugin",
  "lwc-library": "LWC Component",
  "apex-utilities": "Apex Utility",
  agentforce: "Agentforce",
  flow: "Flow",
  "experience-cloud": "Experience Cloud",
};

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

interface SubmissionDetailModalProps {
  resourceId: string;
  onClose: () => void;
}

export function SubmissionDetailModal({
  resourceId,
  onClose,
}: SubmissionDetailModalProps) {
  const router = useRouter();
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/resources/${resourceId}`)
      .then((res) => res.json())
      .then((data) => setResource(data))
      .finally(() => setLoading(false));
  }, [resourceId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function handleAction(status: "approved" | "rejected") {
    setActionLoading(status);
    try {
      await fetch(`/api/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onClose();
      router.refresh();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-semibold text-lg truncate pr-4">
            {loading ? "Loading..." : resource?.name || "Resource Details"}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-bg-surface transition-colors text-text-muted hover:text-text-main cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-text-muted" />
          </div>
        ) : resource ? (
          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6">
            {/* Icon + Name + Badges */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-bg-surface border border-border rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                {resource.iconEmoji}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                  {resource.name}
                </h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge>{categoryLabels[resource.category]}</Badge>
                  <Badge variant={statusVariant[resource.status]}>
                    {resource.status}
                  </Badge>
                  {resource.version && (
                    <Badge variant="primary">v{resource.version}</Badge>
                  )}
                  {resource.tags?.map((t) => (
                    <Badge
                      key={t.id}
                      variant="primary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-text-muted mb-1">
                Description
              </h4>
              <p className="text-sm">{resource.description}</p>
            </div>

            {/* Install Command */}
            {resource.installCommand && (
              <div>
                <h4 className="text-sm font-medium text-text-muted mb-1">
                  Installation
                </h4>
                <div className="bg-bg-surface border border-border rounded-lg px-3 py-2 font-mono text-sm break-all">
                  {resource.installCommand}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-muted">Author</span>
                <p className="font-medium">
                  {resource.authorName || "Anonymous"}
                </p>
              </div>
              <div>
                <span className="text-text-muted">Published</span>
                <p className="font-medium">{formatDate(resource.createdAt)}</p>
              </div>
              <div>
                <span className="text-text-muted">Rating</span>
                <p className="font-medium">
                  {parseFloat(resource.avgRating || "0").toFixed(1)} (
                  {resource.reviewsCount} reviews)
                </p>
              </div>
              {resource.featured && (
                <div>
                  <span className="text-text-muted">Featured</span>
                  <p className="font-medium text-star">Yes</p>
                </div>
              )}
            </div>

            {/* Links */}
            {(resource.repositoryUrl ||
              resource.npmUrl ||
              resource.documentationUrl) && (
              <div>
                <h4 className="text-sm font-medium text-text-muted mb-2">
                  Links
                </h4>
                <div className="flex flex-wrap gap-3">
                  {resource.repositoryUrl && (
                    <a
                      href={resource.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
                    >
                      <Github size={14} />
                      Repository
                      <ExternalLink size={10} />
                    </a>
                  )}
                  {resource.npmUrl && (
                    <a
                      href={resource.npmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
                    >
                      <ExternalLink size={14} />
                      npm
                    </a>
                  )}
                  {resource.documentationUrl && (
                    <a
                      href={resource.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
                    >
                      <ExternalLink size={14} />
                      Docs
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Long Description */}
            {resource.longDescription && (
              <div>
                <h4 className="text-sm font-medium text-text-muted mb-2">
                  About
                </h4>
                <div
                  className="prose dark:prose-invert max-w-none text-sm prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: resource.longDescription,
                  }}
                />
              </div>
            )}

            {/* Actions */}
            {resource.status === "pending" && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleAction("approved")}
                  disabled={actionLoading !== null}
                >
                  <Check size={14} />
                  {actionLoading === "approved" ? "Approving..." : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleAction("rejected")}
                  disabled={actionLoading !== null}
                >
                  <X size={14} />
                  {actionLoading === "rejected" ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-20 text-center text-text-muted">
            Failed to load resource details.
          </div>
        )}
      </div>
    </div>
  );
}
