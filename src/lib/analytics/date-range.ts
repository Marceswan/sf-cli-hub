/**
 * Parses a `range` query param (7d | 30d | 90d | 180d | 365d | all | custom)
 * into a start/end Date pair for SQL WHERE clauses.
 */

export interface DateRange {
  start: Date;
  end: Date;
}

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
};

export function parseDateRange(
  range: string | null,
  from: string | null,
  to: string | null
): DateRange {
  const end = to ? new Date(to + "T23:59:59.999Z") : new Date();

  if (range === "custom" && from) {
    return { start: new Date(from + "T00:00:00.000Z"), end };
  }

  if (range === "all") {
    return { start: new Date("2024-01-01T00:00:00.000Z"), end };
  }

  const days = RANGE_DAYS[range || "7d"] ?? 7;
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}
