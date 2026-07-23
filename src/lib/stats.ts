/**
 * Honest rate statistics for the team dashboard. A rate is never shown as a bare
 * percentage — it always carries its numerator/denominator and a Wilson score
 * interval, and a too-small sample reports "not enough data" instead of a
 * confident-looking number. See PLACEDON_TEAM_DASHBOARD_STATISTICAL_PLAN §6.1.
 */

const Z = 1.96; // 95%

export type Rate = {
  x: number;
  n: number;
  /** Point estimate x/n, or null when n === 0. */
  point: number | null;
  /** Wilson interval bounds in [0,1], or null when n === 0. */
  lo: number | null;
  hi: number | null;
  /** Below this, the UI should say "not enough data yet" rather than a rate. */
  sufficient: boolean;
};

/**
 * Wilson score interval for a binomial rate. Handles the edges the naive
 * formula breaks on: n=0 (no data), x=0 (0/n), and x=n (n/n).
 * @param minN sample size below which `sufficient` is false (default 5).
 */
export function wilson(x: number, n: number, minN = 5): Rate {
  if (n <= 0) return { x, n, point: null, lo: null, hi: null, sufficient: false };
  const p = x / n;
  const z2 = Z * Z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const margin = (Z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)) / denom;
  return {
    x,
    n,
    point: p,
    lo: Math.max(0, center - margin),
    hi: Math.min(1, center + margin),
    sufficient: n >= minN,
  };
}

/** "8 / 12 · 67%" — a rate always shows its counts, never a bare percent. */
export function fmtRate(r: Rate): string {
  if (r.point === null) return "No data yet";
  return `${r.x} / ${r.n} · ${Math.round(r.point * 100)}%`;
}

/** "39–86%" interval label, or a sample-size note when too small to trust. */
export function fmtInterval(r: Rate): string {
  if (r.point === null) return "awaiting data";
  if (!r.sufficient) return `only ${r.n} so far — not enough to trust`;
  return `95% CI ${Math.round((r.lo ?? 0) * 100)}–${Math.round((r.hi ?? 1) * 100)}%`;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
export { pct };
