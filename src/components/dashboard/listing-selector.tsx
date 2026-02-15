"use client";

interface Listing {
  id: string;
  name: string;
  slug: string;
  iconEmoji: string;
}

interface ListingSelectorProps {
  listings: Listing[];
  value: string; // "all" or listing id
  onChange: (value: string) => void;
}

export function ListingSelector({ listings, value, onChange }: ListingSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <option value="all">All Listings</option>
      {listings.map((l) => (
        <option key={l.id} value={l.id}>
          {l.iconEmoji} {l.name}
        </option>
      ))}
    </select>
  );
}
