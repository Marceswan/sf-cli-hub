"use client";

import { useEffect, useState } from "react";
import { Settings, Type, X, Plus } from "lucide-react";

const DEFAULT_HERO_WORDS = "Architect,Admin,Developer,Superuser,DevOps,Consultant,Agentforce";

export default function AdminSettingsPage() {
  const [requireApproval, setRequireApproval] = useState(true);
  const [heroWords, setHeroWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingWords, setSavingWords] = useState(false);
  const [wordsSaved, setWordsSaved] = useState(false);

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
    </div>
  );
}
