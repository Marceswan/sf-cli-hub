"use client";

import { useEffect, useState } from "react";
import { Settings, Type, X, Plus, Mail, ToggleRight } from "lucide-react";

const DEFAULT_HERO_WORDS = "Architect,Admin,Developer,Superuser,DevOps,Consultant,Agentforce";

export default function AdminSettingsPage() {
  const [requireApproval, setRequireApproval] = useState(true);
  const [heroWords, setHeroWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingWords, setSavingWords] = useState(false);
  const [wordsSaved, setWordsSaved] = useState(false);

  const [emailToggles, setEmailToggles] = useState({
    emailWelcome: true,
    emailSubmissionReceived: true,
    emailSubmissionApproved: true,
    emailSubmissionRejected: true,
    emailAdminAlert: true,
    emailUserSuspended: true,
    emailUserBanned: true,
    emailUserRestored: true,
  });
  const [savingEmail, setSavingEmail] = useState<string | null>(null);

  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [savingFlag, setSavingFlag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setRequireApproval(data.requireApproval);
        const words = (data.heroWords || DEFAULT_HERO_WORDS)
          .split(",")
          .map((w: string) => w.trim())
          .filter(Boolean);
        setHeroWords(words);
        setEmailToggles({
          emailWelcome: data.emailWelcome ?? true,
          emailSubmissionReceived: data.emailSubmissionReceived ?? true,
          emailSubmissionApproved: data.emailSubmissionApproved ?? true,
          emailSubmissionRejected: data.emailSubmissionRejected ?? true,
          emailAdminAlert: data.emailAdminAlert ?? true,
          emailUserSuspended: data.emailUserSuspended ?? true,
          emailUserBanned: data.emailUserBanned ?? true,
          emailUserRestored: data.emailUserRestored ?? true,
        });
        setFeatureFlags(data.featureFlags ?? {});
      })
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

  function addWord() {
    const trimmed = newWord.trim();
    if (!trimmed || heroWords.includes(trimmed)) return;
    setHeroWords([...heroWords, trimmed]);
    setNewWord("");
  }

  function removeWord(index: number) {
    setHeroWords(heroWords.filter((_, i) => i !== index));
  }

  async function toggleEmail(key: keyof typeof emailToggles) {
    setSavingEmail(key);
    const newValue = !emailToggles[key];
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });
      if (res.ok) {
        setEmailToggles((prev) => ({ ...prev, [key]: newValue }));
      }
    } finally {
      setSavingEmail(null);
    }
  }

  async function toggleFlag(key: string) {
    setSavingFlag(key);
    const newValue = !featureFlags[key];
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureFlags: { [key]: newValue } }),
      });
      if (res.ok) {
        setFeatureFlags((prev) => ({ ...prev, [key]: newValue }));
      }
    } finally {
      setSavingFlag(null);
    }
  }

  async function saveWords() {
    setSavingWords(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroWords: heroWords.join(",") }),
      });
      if (res.ok) {
        setWordsSaved(true);
        setTimeout(() => setWordsSaved(false), 2000);
      }
    } finally {
      setSavingWords(false);
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

        <hr className="border-border" />

        {/* Hero Words */}
        <div>
          <div className="flex items-start gap-3 mb-4">
            <Type size={20} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Hero Typing Words</p>
              <p className="text-sm text-text-muted">
                Words that cycle in the homepage hero heading: &quot;Supercharge your Salesforce ______ Workflow&quot;
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {heroWords.map((word, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-surface border border-border text-sm"
              >
                {word}
                <button
                  onClick={() => removeWord(i)}
                  className="text-text-muted hover:text-accent-pink transition-colors cursor-pointer"
                  aria-label={`Remove ${word}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWord()}
              placeholder="Add a word..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={addWord}
              disabled={!newWord.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={saveWords}
              disabled={savingWords}
              className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {savingWords ? "Saving..." : "Save Words"}
            </button>
            {wordsSaved && (
              <span className="text-sm text-green-500">Saved!</span>
            )}
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-bg-card border border-border rounded-card p-6 mt-6">
        <div className="flex items-start gap-3 mb-1">
          <Mail size={20} className="text-text-muted mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-text-muted">
              Control which transactional emails are sent.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {([
            { key: "emailWelcome" as const, label: "Welcome Email", desc: "Send a welcome email when a new user registers." },
            { key: "emailSubmissionReceived" as const, label: "Submission Received", desc: "Notify the submitter that their resource is pending review." },
            { key: "emailSubmissionApproved" as const, label: "Submission Approved", desc: "Notify the submitter when their resource is approved." },
            { key: "emailSubmissionRejected" as const, label: "Submission Rejected", desc: "Notify the submitter when their resource is not approved." },
            { key: "emailAdminAlert" as const, label: "Admin New Submission Alert", desc: "Email all admins when a new resource is submitted for review." },
            { key: "emailUserSuspended" as const, label: "User Suspended", desc: "Notify the user when their account is suspended." },
            { key: "emailUserBanned" as const, label: "User Banned", desc: "Notify the user when their account is banned." },
            { key: "emailUserRestored" as const, label: "User Restored", desc: "Notify the user when their account is restored to active." },
          ]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
              <button
                onClick={() => toggleEmail(key)}
                disabled={savingEmail === key}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ml-4 ${
                  emailToggles[key] ? "bg-primary" : "bg-border"
                } ${savingEmail === key ? "opacity-50" : ""}`}
                role="switch"
                aria-checked={emailToggles[key]}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    emailToggles[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-bg-card border border-border rounded-card p-6 mt-6">
        <div className="flex items-start gap-3 mb-1">
          <ToggleRight size={20} className="text-text-muted mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Feature Flags</p>
            <p className="text-sm text-text-muted">
              Toggle platform features on or off globally.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {([
            { key: "pro", label: "Pro / Subscription Features", desc: "Controls Stripe billing, pro analytics (engagement, referrals, outbound, search queries, tag performance, export), and email digests. When off, these pages redirect and API routes return 404." },
          ]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
              <button
                onClick={() => toggleFlag(key)}
                disabled={savingFlag === key}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ml-4 ${
                  featureFlags[key] ? "bg-primary" : "bg-border"
                } ${savingFlag === key ? "opacity-50" : ""}`}
                role="switch"
                aria-checked={featureFlags[key] ?? false}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    featureFlags[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
