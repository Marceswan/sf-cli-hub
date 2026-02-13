/**
 * Parses a `range` query param (7d | 30d | 90d | custom) into
 * a start/end Date pair for SQL WHERE clauses.
 */

export interface DateRange {
  start: Date;
  end: Date;
}

export function parseDateRange(
  range: string | null,
  from: string | null,
  to: string | null
): DateRange {
  const end = to ? new Date(to + "T23:59:59.999Z") : new Date();

  if (range === "custom" && from) {
    return { start: new Date(from + "T00:00:00.000Z"), end };
  }

  const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}
