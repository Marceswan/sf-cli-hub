import { Suspense } from "react";
import { BrowseContent } from "@/components/browse/browse-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowsePage() {
  return (
    <div className="flex-1 grid grid-cols-[1fr_minmax(0,1200px)_1fr]">
      <div className="max-sm:hidden grid-square-pattern" />
      <div className="col-start-2 px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Browse Tools</h1>
        <p className="text-text-muted mb-8">
          Discover CLI plugins, LWC components, and Apex utilities from the
          community.
        </p>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          }
        >
          <BrowseContent />
        </Suspense>
      </div>
      <div className="max-sm:hidden grid-square-pattern" />
    </div>
  );
}
