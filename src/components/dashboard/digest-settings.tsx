"use client";

import { useEffect, useState } from "react";
import { ProGate } from "./pro-gate";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface DigestSettingsProps {
  isPro: boolean;
}

export function DigestSettings({ isPro }: DigestSettingsProps) {
  const [enabled, setEnabled] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/digest")
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled ?? false);
        setDayOfWeek(data.dayOfWeek ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/dashboard/digest", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, dayOfWeek }),
      });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-24 rounded-xl bg-bg-surface border border-border animate-pulse" />;
  }

  return (
    <ProGate locked={!isPro} feature="Weekly Email Digest">
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-main mb-4">Weekly Email Digest</h3>
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-main">Enable weekly digest</span>
          </label>
        </div>
        {enabled && (
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm text-text-muted">Send on:</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="bg-bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {DAYS.map((day, i) => (
                <option key={i} value={i}>{day}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
      </div>
    </ProGate>
  );
}
