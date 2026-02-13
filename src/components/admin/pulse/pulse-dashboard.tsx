"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, Users, Clock, ShieldCheck } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-cards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PulseFilterBar } from "./pulse-filter-bar";
import { TrafficCharts } from "./traffic-charts";
import { PagesTable } from "./pages-table";
import { CategoryCharts } from "./category-charts";
import { AudienceCharts } from "./audience-charts";

interface Overview {
  totalViews: number;
  uniqueVisitors: number;
  avgDuration: number;
  authRatio: number;
}

export function PulseDashboard() {
  const [range, setRange] = useState("7d");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [dailyTraffic, setDailyTraffic] = useState([]);
  const [hourlyTraffic, setHourlyTraffic] = useState([]);
  const [pages, setPages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [audience, setAudience] = useState<{ daily: []; totals: { authenticated: 0; anonymous: 0 } } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const qs = `range=${range}`;
      const [ov, daily, hourly, pg, cat, aud] = await Promise.all([
        fetch(`/api/admin/pulse/overview?${qs}`).then((r) => r.json()),
        fetch(`/api/admin/pulse/traffic?${qs}&groupBy=day`).then((r) => r.json()),
        fetch(`/api/admin/pulse/traffic?${qs}&groupBy=hour`).then((r) => r.json()),
        fetch(`/api/admin/pulse/pages?${qs}&limit=20`).then((r) => r.json()),
        fetch(`/api/admin/pulse/categories?${qs}`).then((r) => r.json()),
        fetch(`/api/admin/pulse/audience?${qs}`).then((r) => r.json()),
      ]);
      setOverview(ov);
      setDailyTraffic(daily);
      setHourlyTraffic(hourly);
      setPages(pg);
      setCategories(cat);
      setAudience(aud);
    } catch (err) {
      console.error("Failed to fetch pulse data:", err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">App Pulse</h2>
        <PulseFilterBar range={range} onRangeChange={setRange} />
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl bg-bg-surface border border-border animate-pulse" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total Views" value={overview.totalViews} icon={<Eye size={20} />} />
          <StatsCard label="Unique Visitors" value={overview.uniqueVisitors} icon={<Users size={20} />} />
          <StatsCard label="Avg Duration" value={overview.avgDuration} icon={<Clock size={20} />} />
          <StatsCard label="Auth Ratio" value={overview.authRatio} icon={<ShieldCheck size={20} />} />
        </div>
      ) : null}

      {/* Tabbed charts */}
      <Tabs defaultValue="traffic">
        <TabsList>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          {loading ? (
            <div className="h-[400px] rounded-xl bg-bg-surface border border-border animate-pulse" />
          ) : (
            <TrafficCharts daily={dailyTraffic} hourly={hourlyTraffic} />
          )}
        </TabsContent>

        <TabsContent value="pages">
          {loading ? (
            <div className="h-[400px] rounded-xl bg-bg-surface border border-border animate-pulse" />
          ) : (
            <PagesTable pages={pages} />
          )}
        </TabsContent>

        <TabsContent value="categories">
          {loading ? (
            <div className="h-[400px] rounded-xl bg-bg-surface border border-border animate-pulse" />
          ) : (
            <CategoryCharts categories={categories} />
          )}
        </TabsContent>

        <TabsContent value="audience">
          {loading ? (
            <div className="h-[400px] rounded-xl bg-bg-surface border border-border animate-pulse" />
          ) : audience ? (
            <AudienceCharts daily={audience.daily} totals={audience.totals} />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
