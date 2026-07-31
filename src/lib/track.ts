/**
 * Product event capture — the critical path for every data-driven feature.
 *
 * Nothing wrote to `product_events` before this, which is why it had 0 rows
 * while the site was live. The table also could not have held these events:
 * `profile_id` was NOT NULL and every acquisition event happens BEFORE signup.
 * Migration `product_events_allow_anonymous` made `profile_id` nullable and
 * added `anon_id`, with a check constraint that every row carries exactly one.
 *
 * Writes go straight to PostgREST with the anon key. That key is already public
 * in the client bundle — RLS is the control, not secrecy. The `anon` role has
 * INSERT only, and its policy requires `profile_id is null`, so a hostile caller
 * can write junk under its own id but cannot forge an event attributed to a real
 * user. Verified by running both cases as `anon` in a rolled-back transaction:
 * the honest insert succeeded, the forged one returned 42501.
 *
 * Three rules this file will not break:
 *   1. Never block or break the UI. Fire-and-forget, `keepalive`, all errors
 *      swallowed. A analytics outage must never cost a click on a CTA.
 *   2. Never carry PII. `props` is jsonb and trivially over-filled — no free
 *      text, no emails, no names, no transcript fragments. Enums and counts.
 *   3. Opt-out is honoured from the first commit, not retrofitted. Data you
 *      collected without a working opt-out is data you may not be able to use.
 */

const ANON_KEY_STORAGE = "pl_anon";
const OPT_OUT_STORAGE = "pl_no_track";

/** Events we actually emit. A union, so a typo is a compile error, not a
 *  silently-misnamed row that splits a funnel in two when you query it. */
export type ProductEvent =
  | "landing_view"
  | "cta_fork_selected"
  | "quick_chip_clicked"
  | "search_submitted"
  | "pre_interview_start"
  | "interview_topic_opened";

/** Values allowed in props. Deliberately narrow — no nested objects, because
 *  nesting is how free text sneaks in. */
type PropValue = string | number | boolean | null;

function optedOut(): boolean {
  try {
    // Honour DNT and an explicit local flag. `msDoNotTrack`/`doNotTrack` vary
    // by browser, so check the ones that exist rather than assuming one.
    const dnt =
      navigator.doNotTrack === "1" ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === "1";
    return dnt || localStorage.getItem(OPT_OUT_STORAGE) === "1";
  } catch {
    return true; // storage blocked → assume opt-out. Fail closed, not open.
  }
}

/** A stable per-browser id, so a pre-signup funnel can be stitched together and
 *  later joined to a profile. Not an identity: it is a random uuid with no
 *  derivation from anything about the person. */
function anonId(): string | null {
  try {
    let id = localStorage.getItem(ANON_KEY_STORAGE);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY_STORAGE, id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Record one product event. Never throws, never awaits into a handler, never
 * returns anything a caller could be tempted to branch on.
 */
export function track(event: ProductEvent, props: Record<string, PropValue> = {}): void {
  if (typeof window === "undefined") return; // no-op during SSR
  if (optedOut()) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return; // unconfigured environment — silently do nothing

  const id = anonId();
  if (!id) return; // no storage, no stitching; drop rather than write orphans

  try {
    void fetch(`${url}/rest/v1/product_events`, {
      method: "POST",
      // keepalive so the write survives the navigation that a CTA click causes.
      // Without it, the most interesting events — the ones that lead somewhere —
      // are exactly the ones that get cancelled.
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        anon_id: id,
        event,
        path: window.location.pathname,
        props,
      }),
    }).catch(() => {});
  } catch {
    /* never surface analytics failure to the UI */
  }
}

/** Let a person turn it off, and prove it took effect. */
export function setTrackingOptOut(off: boolean): void {
  try {
    if (off) localStorage.setItem(OPT_OUT_STORAGE, "1");
    else localStorage.removeItem(OPT_OUT_STORAGE);
  } catch {
    /* storage blocked — already effectively opted out */
  }
}
