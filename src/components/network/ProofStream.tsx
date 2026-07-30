"use client";

import { useMemo, useState } from "react";
import { GitBranch, ShieldCheck, PenLine, ExternalLink, CornerDownLeft } from "lucide-react";
import { logProgress } from "@/app/candidate/network/actions";
import { useMounted } from "@/hooks/useMounted";
import type { Artifact, ProgressLog } from "@/lib/network/types";

type Props = {
  artifacts: Artifact[];
  progress: ProgressLog[];
  hasWork: boolean;
  onPosted: () => void;
};

type StreamItem =
  | { id: string; date: string; kind: "artifact"; artifact: Artifact }
  | { id: string; date: string; kind: "progress"; log: ProgressLog };

/** Deterministic UTC date — safe on the server and as the pre-mount fallback. */
function absolute(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Relative "3d ago" — depends on Date.now(), so only used after mount. */
function relative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return absolute(iso);
}

/**
 * The proof stream — the candidate's OWN chronological build log (shipped work +
 * progress notes), not a feed of other people. Plain glass rows on a single
 * rail; verified work wears a shield, never a like count.
 */
export function ProofStream({ artifacts, progress, hasWork, onPosted }: Props) {
  const mounted = useMounted(); // relative timestamps are client-only
  const ts = (iso: string) => (mounted ? relative(iso) : absolute(iso));
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items: StreamItem[] = useMemo(() => {
    const a: StreamItem[] = artifacts.map((x) => ({ id: `a-${x.id}`, date: x.created_at, kind: "artifact", artifact: x }));
    const p: StreamItem[] = progress.map((x) => ({ id: `p-${x.id}`, date: x.created_at, kind: "progress", log: x }));
    return [...a, ...p].sort((m, n) => n.date.localeCompare(m.date));
  }, [artifacts, progress]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || posting) return;
    setPosting(true);
    setError(null);
    const res = await logProgress({ body: text });
    setPosting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setBody("");
    onPosted();
  }

  return (
    <section aria-labelledby="stream-heading" className="glass rounded-[var(--r-card)] p-6 md:p-7">
      <p className="eyebrow flex items-center gap-2">
        <PenLine size={13} aria-hidden /> Proof stream
      </p>
      <h2 id="stream-heading" className="mt-2 text-[clamp(1.3rem,1.1rem+0.8vw,1.7rem)] font-extrabold tracking-tight text-[var(--ink)]">
        The work itself
      </h2>

      {/* composer */}
      <form onSubmit={post} className="mt-5">
        <div className="flex items-end gap-2 rounded-[16px] border p-2.5" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={1}
            placeholder="What did you move forward today?"
            aria-label="Post a progress note"
            className="min-h-[40px] w-full resize-none bg-transparent px-2 py-2 text-[14px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
          />
          <button
            type="submit"
            disabled={!body.trim() || posting}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white transition-transform duration-150 active:scale-[0.97] disabled:opacity-45"
            style={{ background: "var(--iris)" }}
          >
            Post <CornerDownLeft size={14} aria-hidden />
          </button>
        </div>
        {error && <p className="mt-2 px-1 text-[12.5px] font-semibold text-[var(--warn)]">{error}</p>}
      </form>

      {/* the rail */}
      {items.length > 0 ? (
        <ol className="relative mt-6 space-y-1 pl-6">
          <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px" style={{ background: "var(--glass-line-hi)" }} />
          {items.map((item) => (
            <li key={item.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[22px] top-[15px] grid size-3.5 place-items-center rounded-full"
                style={{ background: item.kind === "artifact" ? "var(--iris)" : "var(--glass-hi)", boxShadow: item.kind === "artifact" ? "0 0 0 3px var(--iris-ghost)" : "0 0 0 2px var(--glass-line-hi)" }}
              />
              <div className="rounded-[14px] px-3.5 py-3 transition-colors duration-150 hover:bg-[var(--glass-hi)]">
                {item.kind === "artifact" ? (
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <GitBranch size={14} className="text-[var(--iris-ink)]" aria-hidden />
                      <span className="text-[14px] font-bold tracking-tight text-[var(--ink)]">{item.artifact.title}</span>
                      {(item.artifact.source === "github" || item.artifact.verified_at) && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                          <ShieldCheck size={11} aria-hidden /> Verified
                        </span>
                      )}
                      <span className="ml-auto text-[11.5px] font-medium text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>{ts(item.date)}</span>
                    </div>
                    {item.artifact.summary && <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-2)]">{item.artifact.summary}</p>}
                    {item.artifact.url && (
                      <a href={item.artifact.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--iris-ink)] hover:gap-1.5">
                        View the work <ExternalLink size={12} aria-hidden />
                      </a>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-[13.5px] leading-relaxed text-[var(--ink)]">{item.log.body}</p>
                    <span className="mt-1 block text-[11.5px] font-medium text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>{ts(item.date)}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 rounded-[16px] border p-6 text-center text-[13.5px] leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line)" }}>
          {hasWork ? "Your work will show here." : "Your work starts here. Import from GitHub above, or note what you shipped today — every entry is evidence you own."}
        </p>
      )}
    </section>
  );
}
