"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/browse/search-bar";
import { CategoryTabs } from "@/components/browse/category-tabs";
import { SortDropdown } from "@/components/browse/sort-dropdown";
import { ResourceCard } from "@/components/resource/resource-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

interface ResourceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  installCommand: string | null;
  iconEmoji: string;
  version: string | null;
  avgRating: string | null;
  reviewsCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (debouncedSearch) params.set("q", debouncedSearch);
    params.set("sort", sort);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setPagination(data.pagination || null);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch, sort, page]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    router.replace(`/browse?${params}`, { scroll: false });
  }, [category, debouncedSearch, sort, page, router]);

  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch, sort]);

  return (
    <>
      {/* Filters */}
      <div className="space-y-4 mb-8">
        <CategoryTabs value={category} onChange={setCategory} />
        <div className="flex gap-4 flex-col sm:flex-row">
          <SearchBar value={search} onChange={setSearch} className="flex-1" />
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">No tools found.</p>
          <p className="text-text-muted text-sm mt-2">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                slug={resource.slug}
                name={resource.name}
                description={resource.description}
                iconEmoji={resource.iconEmoji}
                installCommand={resource.installCommand || undefined}
                version={resource.version || undefined}
                avgRating={resource.avgRating ? parseFloat(resource.avgRating) : 0}
                reviewsCount={resource.reviewsCount}
                category={resource.category}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-1.5 text-sm text-text-muted self-center">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
