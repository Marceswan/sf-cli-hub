"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, MousePointerClick, ArrowUpRight, Users, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatsCard } from "@/components/admin/stats-cards";
import { ListingSelector } from "./listing-selector";
import { DashboardFilterBar } from "./dashboard-filter-bar";
import { ProGate } from "./pro-gate";
import { EngagementChart } from "./charts/engagement-chart";
import { ReferralChart } from "./charts/referral-chart";
import { OutboundChart } from "./charts/outbound-chart";
import { SearchTable } from "./charts/search-table";
import { CategoryRankCard } from "./charts/category-rank-card";
import { TagPerformanceTable } from "./charts/tag-performance-table";
import { DigestSettings } from "./digest-settings";
import { BadgeSection } from "./badge-section";

interface Listing {
  id: string;
  name: string;
  slug: string;
  category: string;
  iconEmoji: string;
}

interface Overview {
  impressions: number;
  detailViews: number;
  outboundClicks: number;
  uniqueSessions: number;
  ctr: number;
  outboundRate: number;
  prevImpressions: number;
  prevDetailViews: number;
  prevOutboundClicks: number;
  prevUniqueSessions: number;
}

interface EngagementRow { date: string; impressions: number; detailViews: number; outboundClicks: number }
interface ReferralRow { source: string; count: number }
interface OutboundRow { destination: string; count: number }
interface SearchRow { query: string; count: number }
interface TagRow { tag: string; tagClicks: number }

interface AnalyticsDashboardProps {
  listings: Listing[];
  isPro: boolean;
}

export function AnalyticsDashboard({ listings, isPro }: AnalyticsDashboardProps) {
  const [listingId, setListingId] = useState("all");
  const [range, setRange] = useState(isPro ? "30d" : "30d");
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [engagement, setEngagement] = useState<EngagementRow[]>([]);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [outbound, setOutbound] = useState<OutboundRow[]>([]);
  const [searchQueries, setSearchQueries] = useState<SearchRow[]>([]);
  const [categoryRank, setCategoryRank] = useState<{ rank: number | null; total: number; category: string } | null>(null);
  const [tagPerformance, setTagPerformance] = useState<TagRow[]>([]);

  const qs = `listingId=${listingId}&range=${range}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch free-tier data
      const [ov, rank] = await Promise.all([
        fetch(`/api/dashboard/analytics/overview?${qs}`).then((r) => r.json()),
        listingId !== "all"
          ? fetch(`/api/dashboard/analytics/category-rank?listingId=${listingId}`).then((r) => r.json())
          : Promise.resolve(null),
      ]);
      setOverview(ov);
      setCategoryRank(rank);

      // Fetch pro-tier data (will return 403 for free users — that's fine)
      if (isPro) {
        const [eng, ref, out, sq, tp] = await Promise.all([
          fetch(`/api/dashboard/analytics/engagement?${qs}`).then((r) => r.json()),
          fetch(`/api/dashboard/analytics/referrals?${qs}`).then((r) => r.json()),
          fetch(`/api/dashboard/analytics/outbound?${qs}`).then((r) => r.json()),
          fetch(`/api/dashboard/analytics/search-queries?${qs}`).then((r) => r.json()),
          fetch(`/api/dashboard/analytics/tag-performance?${qs}`).then((r) => r.json()),
        ]);
        setEngagement(Array.isArray(eng) ? eng : []);
        setReferrals(Array.isArray(ref) ? ref : []);
        setOutbound(Array.isArray(out) ? out : []);
        setSearchQueries(Array.isArray(sq) ? sq : []);
        setTagPerformance(Array.isArray(tp) ? tp : []);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [qs, listingId, isPro]);

  useEffect(() => {
    if (listings.length > 0) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData, listings.length]);

  // Empty state: no listings
  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-semibold text-text-main mb-2">No listings yet</p>
        <p className="text-text-muted mb-6">
          Submit your first tool to start tracking how developers discover it.
        </p>
        <a
          href="/submit"
          className="inline-flex px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Submit a Tool
        </a>
      </div>
    );
  }

  const selectedListing = listings.find((l) => l.id === listingId);

  function handleExport() {
    window.open(`/api/dashboard/analytics/export?${qs}`, "_blank");
  }

  function delta(current: number, prev: number): string {
    if (prev === 0) return current > 0 ? "+100%" : "—";
    const pct = Math.round(((current - prev) / prev) * 100);
    return pct > 0 ? `+${pct}%` : `${pct}%`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Analytics</h1>
          <p className="text-sm text-text-muted">Track how developers discover your tools</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ListingSelector listings={listings} value={listingId} onChange={setListingId} />
          <DashboardFilterBar range={range} onRangeChange={setRange} isPro={isPro} />
          {isPro && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-muted hover:text-text-main bg-bg-surface border border-border rounded-lg hover:bg-bg-card transition-colors cursor-pointer"
            >
              <Download size={14} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl bg-bg-surface border border-border animate-pulse" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Impressions"
            value={overview.impressions}
            icon={<Eye size={20} />}
          />
          <StatsCard
            label="Detail Views"
            value={overview.detailViews}
            icon={<MousePointerClick size={20} />}
          />
          <StatsCard
            label="Outbound Clicks"
            value={overview.outboundClicks}
            icon={<ArrowUpRight size={20} />}
          />
          <StatsCard
            label="Unique Sessions"
            value={overview.uniqueSessions}
            icon={<Users size={20} />}
          />
        </div>
      ) : null}

      {/* CTR and outbound rate */}
      {!loading && overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">CTR</p>
            <p className="text-xl font-bold text-text-main">{overview.ctr.toFixed(1)}%</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Outbound Rate</p>
            <p className="text-xl font-bold text-text-main">{overview.outboundRate.toFixed(1)}%</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Views vs Prev Period</p>
            <p className="text-xl font-bold text-text-main">{delta(overview.detailViews, overview.prevDetailViews)}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Clicks vs Prev Period</p>
            <p className="text-xl font-bold text-text-main">{delta(overview.outboundClicks, overview.prevOutboundClicks)}</p>
          </div>
        </div>
      )}

      {/* Category Rank (when single listing selected) */}
      {!loading && categoryRank && listingId !== "all" && (
        <CategoryRankCard
          rank={categoryRank.rank}
          total={categoryRank.total}
          category={categoryRank.category}
        />
      )}

      {/* Pro Charts */}
      <Tabs defaultValue="engagement">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="outbound">Outbound</TabsTrigger>
          <TabsTrigger value="search">Search Queries</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <ProGate locked={!isPro} feature="Engagement Trends">
            {loading ? (
              <div className="h-[300px] rounded-xl bg-bg-surface border border-border animate-pulse" />
            ) : (
              <EngagementChart data={engagement} />
            )}
          </ProGate>
        </TabsContent>

        <TabsContent value="referrals">
          <ProGate locked={!isPro} feature="Referral Sources">
            {loading ? (
              <div className="h-[300px] rounded-xl bg-bg-surface border border-border animate-pulse" />
            ) : (
              <ReferralChart data={referrals} />
            )}
          </ProGate>
        </TabsContent>

        <TabsContent value="outbound">
          <ProGate locked={!isPro} feature="Outbound Clicks">
            {loading ? (
              <div className="h-[300px] rounded-xl bg-bg-surface border border-border animate-pulse" />
            ) : (
              <OutboundChart data={outbound} />
            )}
          </ProGate>
        </TabsContent>

        <TabsContent value="search">
          <ProGate locked={!isPro} feature="Search Queries">
            {loading ? (
              <div className="h-[300px] rounded-xl bg-bg-surface border border-border animate-pulse" />
            ) : (
              <SearchTable data={searchQueries} />
            )}
          </ProGate>
        </TabsContent>

        <TabsContent value="tags">
          <ProGate locked={!isPro} feature="Tag Performance">
            {loading ? (
              <div className="h-[300px] rounded-xl bg-bg-surface border border-border animate-pulse" />
            ) : (
              <TagPerformanceTable data={tagPerformance} />
            )}
          </ProGate>
        </TabsContent>
      </Tabs>

      {/* Badge + Digest Settings */}
      {selectedListing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BadgeSection slug={selectedListing.slug} />
          <DigestSettings isPro={isPro} />
        </div>
      )}
      {listingId === "all" && listings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BadgeSection slug={listings[0].slug} />
          <DigestSettings isPro={isPro} />
        </div>
      )}
    </div>
  );
}
