const DAY_MS = 24 * 60 * 60 * 1000;

/** Recency is the only thing the signal green is allowed to mean. */
export function isRecent(isoDate: string, withinDays = 14, now: Date = new Date()): boolean {
  const elapsed = now.getTime() - new Date(isoDate).getTime();
  return elapsed >= 0 && elapsed < withinDays * DAY_MS;
}
