"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL, isLiveBackend } from "@/lib/api";
import type { JobDetail, SignalKind } from "@/lib/v1";

/**
 * /jobs — the candidate's entrance to the product.
 *
 * This route did not exist. Every /jobs/ path in the app lived under
 * /employer/, and /employer/search searches *candidates*. A person looking for
 * work could not see a single role on PlacedOn, which made the "I'm looking for
 * work" tab on the homepage a door into an interview rather than into the
 * product.
 *
 * Two deliberate departures from how job boards normally work:
 *
 * 1. **Public.** No login to browse. A cold candidate will not spend 22 minutes
 *    on a promise; they will spend thirty seconds deciding whether there is
 *    anything here worth their time. Asking them to sign up first loses them.
 *
 * 2. **Signals, not requirements.** Each card leads with the problem the role
 *    exists to solve and the two or three things it actually needs — the
 *    role-DNA the employer defined. A requirements wall is the thing job boards
 *    are worst at: it tells you what to claim, not whether you fit.
 *
 * The interview is asked for at the point of desire — on the role page, once
 * someone has found something they want — never before.
 */

const SIGNAL_LABEL: Record<SignalKind, string> = {
  success_signal: "What good looks like",
  must_have: "Needs",
  nice_to_have: "Bonus",
};

type State =
  | { kind: "loading" }
  | { kind: "ready"; jobs: JobDetail[] }
  | { kind: "offline" } // backend not configured for this environment
  | { kind: "error"; message: string };

export function JobBoard() {
  const params = useSearchParams();
  const [state, setState] = useState<State>({ kind: "loading" });
  // Seeded from ?q= so the hero handoff carries the candidate's words through.
  // Without this the search on the homepage would silently throw them away.
  const [q, setQ] = useState(() => params.get("q") ?? "");

  useEffect(() => {
    if (!isLiveBackend()) {
      setState({ kind: "offline" });
      return;
    }
    let alive = true;
    // Public browse — deliberately not authFetch. Requiring a session to look
    // at open roles is the thing this route exists to fix.
    fetch(`${API_BASE_URL}/v1/jobs/public`, { headers: { Accept: "application/json" } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return (await r.json()) as JobDetail[];
      })
      .then((jobs) => alive && setState({ kind: "ready", jobs }))
      .catch((e) => alive && setState({ kind: "error", message: String(e.message ?? e) }));
    return () => {
      alive = false;
    };
  }, []);

  const jobs = state.kind === "ready" ? state.jobs : [];
  // A search box above nothing to search is a dead control in the most
  // prominent position on the page. It stays up during loading so the layout
  // does not jump, and disappears only once we know there is no list.
  const hasList = state.kind === "loading" || jobs.length > 0;
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(needle) ||
        (j.level ?? "").toLowerCase().includes(needle) ||
        j.signals.some((s) => s.signal.toLowerCase().includes(needle)),
    );
  }, [jobs, q]);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-20 pt-8 md:px-8 md:pb-24 md:pt-10">
      <h1
        className="text-[clamp(1.875rem,1.5rem+1.9vw,2.75rem)] font-semibold tracking-[-0.022em]"
        style={{ color: "var(--ink)" }}
      >
        Open roles
      </h1>
      <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Every company is verified before its roles go up. Browse as long as you
        like — no account needed.
      </p>

      {hasList && (
        <>
          <label htmlFor="job-q" className="sr-only">
            Search roles
          </label>
          <input
            id="job-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search roles, levels, or skills…"
            className="mt-6 w-full max-w-[480px] rounded-full px-5 py-3 text-[15px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{ border: "1px solid var(--line-2)", color: "var(--ink)", outlineColor: "var(--accent)" }}
          />
        </>
      )}

      <div className="mt-10">
        {state.kind === "loading" && <Skeletons />}

        {state.kind === "ready" && filtered.length > 0 && (
          <>
            <p className="mb-4 text-[13px]" style={{ color: "var(--ink-3)" }}>
              {filtered.length} {filtered.length === 1 ? "role" : "roles"}
              {q && " matching your search"}
            </p>
            <div className="flex flex-col gap-4">
              {filtered.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </>
        )}

        {/* A mistyped search is not a moment to re-pitch the product. Keep it to
            one line and get out of the way. */}
        {state.kind === "ready" && filtered.length === 0 && jobs.length > 0 && (
          <p className="text-[15px]" style={{ color: "var(--ink-2)" }}>
            Nothing matches <span style={{ color: "var(--ink)" }}>&ldquo;{q.trim()}&rdquo;</span>.
            Try a broader word — or clear the search to see all {jobs.length}{" "}
            {jobs.length === 1 ? "role" : "roles"}.
          </p>
        )}

        {/* No roles at all. Say why, plainly, in a quiet line — then use the
            space for the thing this page is actually here to explain. A job
            board that pretends to have listings it does not have is worse than
            one that admits it. */}
        {state.kind === "ready" && jobs.length === 0 && (
          <Empty status="No roles are listed yet — we verify every company before its roles go up." />
        )}

        {state.kind === "offline" && (
          <Empty status="Roles aren't loading here — this build isn't pointed at a live backend." />
        )}

        {state.kind === "error" && (
          <Empty status="We couldn't load roles just now. That's on us — try again in a moment." />
        )}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: JobDetail }) {
  // Lead with what the role is for, then the two or three things it needs.
  // Ordered so success signals come first — they are the ones a candidate can
  // actually judge themselves against.
  const signals = [...job.signals]
    .sort((a, b) => rank(a.kind) - rank(b.kind))
    .slice(0, 3);

  return (
    <article
      className="rounded-[var(--r-card,20px)] bg-[var(--paper)] p-5 transition-shadow duration-[var(--dur-fast,150ms)] hover:shadow-[0_2px_8px_rgba(16,15,13,0.06),0_12px_28px_-14px_rgba(16,15,13,0.10)] md:p-6"
      style={{ border: "1px solid var(--line)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
            {job.title}
          </h2>
          {job.level && (
            <p className="mt-1 text-[13.5px]" style={{ color: "var(--ink-3)" }}>
              {job.level}
            </p>
          )}
        </div>
        {job.is_search_ready && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
            style={{ background: "var(--accent-weak)", color: "var(--accent-ink)" }}
          >
            Accepting interviews
          </span>
        )}
      </div>

      {job.business_problem && (
        <p className="mt-3.5 max-w-[62ch] text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {job.business_problem}
        </p>
      )}

      {signals.length > 0 && (
        <dl className="mt-4 flex flex-col gap-2">
          {signals.map((s, i) => (
            <div key={`${s.signal}-${i}`} className="flex flex-wrap items-baseline gap-x-2.5">
              <dt
                className="text-[11.5px] uppercase tracking-[0.1em]"
                style={{ color: "var(--ink-3)" }}
              >
                {SIGNAL_LABEL[s.kind]}
              </dt>
              <dd className="text-[14px]" style={{ color: "var(--ink-2)" }}>
                {s.signal}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-5">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors duration-[var(--dur-fast,150ms)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ background: "var(--accent)", color: "#fff", outlineColor: "var(--accent)" }}
        >
          See the role
        </Link>
      </div>
    </article>
  );
}

function rank(k: SignalKind) {
  return k === "success_signal" ? 0 : k === "must_have" ? 1 : 2;
}

/**
 * The zero state.
 *
 * An apology in a grey box is not a design. When there are no roles, this page
 * still has a job: explain the model and show what a role looks like here, so
 * someone can decide whether the interview is worth their time. That is the
 * conversion this screen exists for, and it works better with no listings than a
 * wall of listings would.
 *
 * The sample card is explicitly labelled as an example. It is not a fake
 * listing — it shows the *format*, which is the thing that differs from every
 * other job board.
 */
function Empty({ status }: { status: string }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-14">
      <div>
        {/* The status is true and it is stated first — but it is a status, not a
            headline. Set as an h2 it became the largest thing on the page after
            the page title, which made an empty list read as a broken product
            rather than a young one. */}
        <p className="flex items-start gap-2.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
          <span
            aria-hidden="true"
            className="mt-[6px] size-1.5 shrink-0 rounded-full"
            style={{ background: "var(--line-2)" }}
          />
          {status}
        </p>

        <h2 className="mt-4 max-w-[22ch] text-[clamp(1.5rem,1.25rem+1.1vw,2.125rem)] font-semibold tracking-[-0.022em]" style={{ color: "var(--ink)" }}>
          One interview. Every role you&rsquo;re matched to.
        </h2>
        <p className="mt-3.5 max-w-[46ch] text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Applying again for every job is the part that wastes your time. Do the
          interview once and it counts for everything that opens after it.
        </p>

        <ol className="mt-7 flex flex-col gap-4">
          {[
            ["Interview once", "One 22-minute conversation. Voice or text, in the browser."],
            ["We read it, you approve it", "Every trait points back to something you said. You decide what an employer sees."],
            ["Matched from then on", "No applying, no re-interviewing. New roles get matched to the evidence you already have."],
          ].map(([h, b], i) => (
            <li key={h} className="flex gap-3.5">
              <span
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
                style={{ background: "var(--accent-weak)", color: "var(--accent-ink)" }}
              >
                {i + 1}
              </span>
              <span>
                <span className="block text-[14.5px] font-semibold" style={{ color: "var(--ink)" }}>{h}</span>
                <span className="mt-0.5 block text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{b}</span>
              </span>
            </li>
          ))}
        </ol>

        <Link
          href="/pre-interview"
          className="mt-8 inline-flex items-center rounded-full px-6 py-3 text-[14.5px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ background: "var(--accent)", color: "#fff", outlineColor: "var(--accent)" }}
        >
          Take the interview
        </Link>
        <p className="mt-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
          Free, and nothing is shared until you approve it.
        </p>
      </div>

      {/* what a role looks like here — the format, not a fake listing */}
      <div>
        <p className="text-[11.5px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
          What a role looks like here
        </p>
        <article
          className="mt-3 rounded-[var(--r-card,20px)] p-5 md:p-6"
          style={{ border: "1px solid var(--line)", background: "var(--paper)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[17px] font-semibold" style={{ color: "var(--ink)" }}>Backend Engineer</h3>
              <p className="mt-1 text-[13px]" style={{ color: "var(--ink-3)" }}>Senior</p>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
              style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}
            >
              Example
            </span>
          </div>

          <p className="mt-3.5 text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            Checkout times went from 200ms to 2s over six months and nobody knows
            which change did it. We need someone who can find out.
          </p>

          <dl className="mt-4 flex flex-col gap-2">
            {[
              ["What good looks like", "Finds the cause before proposing the fix"],
              ["Needs", "Has debugged something under real load"],
              ["Bonus", "Has owned a migration end to end"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap items-baseline gap-x-2.5">
                <dt className="text-[11.5px] uppercase tracking-[0.1em]" style={{ color: "var(--ink-3)" }}>{k}</dt>
                <dd className="text-[14px]" style={{ color: "var(--ink-2)" }}>{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 border-t pt-4 text-[13px] leading-relaxed" style={{ borderColor: "var(--line)", color: "var(--ink-3)" }}>
            No requirements wall — just the problem and what it actually takes.
            You can tell in five seconds whether that&rsquo;s you.
          </p>
        </article>
      </div>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading roles">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-[var(--r-card,20px)] p-6"
          style={{ border: "1px solid var(--line)", background: "var(--paper-2)" }}
        >
          <div className="h-5 w-52 rounded" style={{ background: "var(--line)" }} />
          <div className="mt-3 h-4 w-full max-w-[38rem] rounded" style={{ background: "var(--line)" }} />
          <div className="mt-2 h-4 w-full max-w-[26rem] rounded" style={{ background: "var(--line)" }} />
        </div>
      ))}
    </div>
  );
}
