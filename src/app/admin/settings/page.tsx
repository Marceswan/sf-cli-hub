"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const [requireApproval, setRequireApproval] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setRequireApproval(data.requireApproval))
      .finally(() => setLoading(false));
  }, []);

  async function toggle() {
    setSaving(true);
    const newValue = !requireApproval;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requireApproval: newValue }),
      });
      if (res.ok) {
        setRequireApproval(newValue);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">Settings</h2>
        <div className="bg-bg-card border border-border rounded-card p-6 text-text-muted text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      <div className="bg-bg-card border border-border rounded-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Settings size={20} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Require Approval</p>
              <p className="text-sm text-text-muted">
                When enabled, new submissions require admin approval before appearing publicly.
                When disabled, submissions are automatically approved on creation.
              </p>
            </div>
          </div>
          <button
            onClick={toggle}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ml-4 ${
              requireApproval ? "bg-primary" : "bg-border"
            } ${saving ? "opacity-50" : ""}`}
            role="switch"
            aria-checked={requireApproval}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                requireApproval ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
