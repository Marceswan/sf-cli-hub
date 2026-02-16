"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ResourceActions } from "@/components/admin/resource-actions";
import { formatDate } from "@/lib/utils";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

interface AdminResource {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  featured: boolean;
  avgRating: string | null;
  reviewsCount: number;
  createdAt: Date;
  authorName: string;
}

interface AdminResourcesTableProps {
  resources: AdminResource[];
  tagsByResource: Record<string, { id: string; name: string }[]>;
}

type SortKey = "name" | "category" | "status" | "rating" | "author" | "date";
type SortDir = "asc" | "desc";

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

const categoryLabels: Record<string, string> = {
  "cli-plugins": "CLI",
  "lwc-library": "LWC",
  "apex-utilities": "Apex",
  agentforce: "Agent",
  flow: "Flow",
  "experience-cloud": "ExpCloud",
};

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "cli-plugins", label: "CLI Plugins" },
  { value: "lwc-library", label: "LWC Library" },
  { value: "apex-utilities", label: "Apex Utilities" },
  { value: "agentforce", label: "Agentforce" },
  { value: "flow", label: "Flow" },
  { value: "experience-cloud", label: "Experience Cloud" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const featuredOptions = [
  { value: "", label: "All" },
  { value: "true", label: "Featured" },
  { value: "false", label: "Not Featured" },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronDown size={14} className="opacity-0 group-hover:opacity-30" />;
  return dir === "asc" ? (
    <ChevronUp size={14} className="text-primary" />
  ) : (
    <ChevronDown size={14} className="text-primary" />
  );
}

export function AdminResourcesTable({
  resources,
  tagsByResource,
}: AdminResourcesTableProps) {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "date" || key === "rating" ? "desc" : "asc");
    }
  }

  const filtered = useMemo(() => {
    let result = resources;

    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (categoryFilter) {
      result = result.filter((r) => r.category === categoryFilter);
    }
    if (featuredFilter) {
      const isFeatured = featuredFilter === "true";
      result = result.filter((r) => r.featured === isFeatured);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "rating":
          cmp =
            parseFloat(a.avgRating || "0") - parseFloat(b.avgRating || "0");
          break;
        case "author":
          cmp = (a.authorName || "").localeCompare(b.authorName || "");
          break;
        case "date":
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [resources, statusFilter, categoryFilter, featuredFilter, search, sortKey, sortDir]);

  const columns: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "rating", label: "Rating" },
    { key: "author", label: "Author" },
    { key: "date", label: "Date" },
  ];

  const selectClass =
    "bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        Resources ({filtered.length} of {resources.length})
      </h2>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={selectClass}
        >
          {categoryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className={selectClass}
        >
          {featuredOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="group text-left px-4 py-3 font-medium text-text-muted cursor-pointer hover:text-text-main transition-colors select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <SortIcon
                        active={sortKey === col.key}
                        dir={sortDir}
                      />
                    </span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Tags
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-text-muted"
                  >
                    No resources match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((resource) => (
                  <tr
                    key={resource.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {resource.name}
                      {resource.featured && (
                        <span className="ml-2 text-star text-xs">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{categoryLabels[resource.category]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[resource.status]}>
                        {resource.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {parseFloat(resource.avgRating || "0").toFixed(1)} (
                      {resource.reviewsCount})
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {resource.authorName || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatDate(resource.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(tagsByResource[resource.id] || []).map((t) => (
                          <Badge
                            key={t.id}
                            variant="primary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {t.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ResourceActions
                        resourceId={resource.id}
                        slug={resource.slug}
                        status={resource.status}
                        featured={resource.featured}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
