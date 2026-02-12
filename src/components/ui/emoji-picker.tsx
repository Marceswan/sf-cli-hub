"use client";

import { useState, useRef, useEffect } from "react";

const EMOJI_CATEGORIES = [
  { label: "Code", emojis: ["💻", "🖥️", "⌨️", "🔧", "🛠️", "🔨", "⚙️", "🔩", "📟", "🧑‍💻"] },
  { label: "Lightning", emojis: ["⚡", "🔌", "🔋", "💡", "🌩️", "🔥", "✨", "💥", "🚀", "🎯"] },
  { label: "Data", emojis: ["💾", "📊", "📈", "📉", "🗄️", "📦", "🗃️", "🧮", "📋", "📝"] },
  { label: "Security", emojis: ["🔒", "🔓", "🛡️", "🔑", "🗝️", "🔐", "👁️", "🕵️"] },
  { label: "Design", emojis: ["🎨", "🖌️", "🖼️", "🧩", "🏗️", "🧱", "📐", "✏️"] },
  { label: "Misc", emojis: ["🧪", "🧰", "📡", "🌐", "🏷️", "⭐", "🎉", "♻️", "🤖", "🐛"] },
];

const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((cat) =>
  cat.emojis.map((emoji) => ({ emoji, category: cat.label }))
);

// Simple name mapping for search
const EMOJI_NAMES: Record<string, string> = {
  "💻": "laptop computer code",
  "🖥️": "desktop monitor screen",
  "⌨️": "keyboard type",
  "🔧": "wrench tool fix",
  "🛠️": "hammer wrench tools build",
  "🔨": "hammer build",
  "⚙️": "gear settings config",
  "🔩": "nut bolt hardware",
  "📟": "pager terminal",
  "🧑‍💻": "developer coder programmer",
  "⚡": "lightning bolt zap power electric",
  "🔌": "plug electric power connect",
  "🔋": "battery power energy",
  "💡": "lightbulb idea tip",
  "🌩️": "cloud lightning storm",
  "🔥": "fire hot flame",
  "✨": "sparkles magic stars",
  "💥": "boom crash explosion",
  "🚀": "rocket launch deploy ship",
  "🎯": "target bullseye goal",
  "💾": "floppy disk save storage",
  "📊": "chart bar graph analytics",
  "📈": "chart up increase growth",
  "📉": "chart down decrease",
  "🗄️": "cabinet file storage database",
  "📦": "package box bundle npm",
  "🗃️": "card file box records",
  "🧮": "abacus calculate math",
  "📋": "clipboard list checklist",
  "📝": "memo note write edit",
  "🔒": "lock secure private",
  "🔓": "unlock open public",
  "🛡️": "shield protect guard security",
  "🔑": "key access auth",
  "🗝️": "old key vintage access",
  "🔐": "locked key secure auth",
  "👁️": "eye watch monitor observe",
  "🕵️": "detective investigate inspect",
  "🎨": "palette art design color",
  "🖌️": "paintbrush art design",
  "🖼️": "frame picture image",
  "🧩": "puzzle piece plugin extension",
  "🏗️": "construction build scaffold",
  "🧱": "brick block build foundation",
  "📐": "ruler triangle measure layout",
  "✏️": "pencil edit write draw",
  "🧪": "test tube experiment lab",
  "🧰": "toolbox tools kit utility",
  "📡": "satellite antenna api broadcast",
  "🌐": "globe web internet global",
  "🏷️": "label tag category",
  "⭐": "star favorite bookmark",
  "🎉": "party celebration tada",
  "♻️": "recycle refresh sync loop",
  "🤖": "robot bot automation ai",
  "🐛": "bug debug issue fix",
};

interface EmojiPickerProps {
  name: string;
  defaultValue?: string;
  label?: string;
}

export function EmojiPicker({ name, defaultValue = "", label }: EmojiPickerProps) {
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const filtered = search.trim()
    ? ALL_EMOJIS.filter(({ emoji, category }) => {
        const q = search.toLowerCase();
        const names = EMOJI_NAMES[emoji] || "";
        return (
          names.includes(q) ||
          category.toLowerCase().includes(q) ||
          emoji.includes(search)
        );
      })
    : ALL_EMOJIS;

  function pickEmoji(emoji: string) {
    setSelected(emoji);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-main">
          {label}
        </label>
      )}
      <div ref={wrapperRef} className="relative">
        <div className="flex items-center gap-2">
          {/* Preview box — mirrors CardIcon styling */}
          <div className="w-12 h-12 bg-bg-surface border border-border rounded-[10px] flex items-center justify-center text-2xl shrink-0">
            {selected || <span className="text-text-muted/40 text-base">?</span>}
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="px-4 py-2 text-sm bg-bg-surface border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
          >
            {open ? "Close" : "Pick"}
          </button>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected("")}
              className="px-2 py-2 text-xs text-text-muted hover:text-red-500 transition-colors cursor-pointer"
              aria-label="Clear emoji"
            >
              Clear
            </button>
          )}
        </div>

        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={selected} />

        {/* Popover */}
        {open && (
          <div className="absolute z-50 top-full mt-2 left-0 w-72 bg-bg-card border border-border rounded-lg shadow-lg p-3">
            {/* Search */}
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emoji..."
              className="w-full px-3 py-2 mb-2 text-sm bg-bg-surface border border-border rounded-md text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />

            {/* Emoji grid */}
            <div className="max-h-52 overflow-y-auto">
              {search.trim() ? (
                filtered.length > 0 ? (
                  <div className="grid grid-cols-8 gap-0.5">
                    {filtered.map(({ emoji }) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => pickEmoji(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-bg-surface transition-colors cursor-pointer"
                        title={EMOJI_NAMES[emoji] || ""}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-4">
                    No matching emoji
                  </p>
                )
              ) : (
                EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.label} className="mb-2">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                      {cat.label}
                    </p>
                    <div className="grid grid-cols-8 gap-0.5">
                      {cat.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => pickEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-bg-surface transition-colors cursor-pointer"
                          title={EMOJI_NAMES[emoji] || ""}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
