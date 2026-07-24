import { MapPin, Wallet, Building2, Clock, Users, Route, Target, ShieldCheck, Sparkles } from "lucide-react";
import type { JobListing, JobSignal } from "@/lib/mock/jobs";
import type { SignalKind } from "@/lib/v1";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { IconTile } from "@/components/ui/IconTile";

const WORK_MODE_LABEL: Record<JobListing["workMode"], string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const SIGNAL_GROUP: Record<SignalKind, { title: string; hint: string }> = {
  success_signal: { title: "What great looks like", hint: "The interview looks for evidence of these." },
  must_have: { title: "Must be true", hint: "Non-negotiable for this role." },
  nice_to_have: { title: "A bonus", hint: "Helps, but not required." },
};

const GROUP_ORDER: SignalKind[] = ["success_signal", "must_have", "nice_to_have"];

/**
 * Full role page. Frames the employer's Role-DNA signals as "what this
 * interview will explore" (transparency), shows the Reality Card, and — for a
 * candidate who's already interviewed — a hybrid reuse/top-up preview. Apply
 * routes into the existing pre-interview → consent → interview flow with the
 * role bound, so the AI session is generated for THIS job.
 */
export function JobDetail({ job, hasEvidence = false }: { job: JobListing; hasEvidence?: boolean }) {
  const total = job.signals.length;
  const covered = Math.min(job.coveredSignals, total);
  const topUp = Math.max(total - covered, 0);
  const applyHref = `/pre-interview?job=${encodeURIComponent(job.id)}&role=${encodeURIComponent(job.roleFamily)}`;

  const grouped = GROUP_ORDER
    .map((kind) => ({ kind, items: job.signals.filter((s) => s.kind === kind) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* main column */}
      <div className="space-y-6">
        <GlassCard>
          <div className="flex items-start gap-4">
            <IconTile icon={Building2} tone="iris" size="lg" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[var(--ink-3)]">{job.company} · {job.level}</p>
              <h2 className="mt-0.5 text-[clamp(1.3rem,1.1rem+0.9vw,1.7rem)] font-extrabold tracking-tight text-[var(--ink)]">{job.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[var(--ink-2)]">
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} strokeWidth={1.75} aria-hidden /> {job.location}</span>
                <span className="inline-flex items-center gap-1.5"><Wallet size={14} strokeWidth={1.75} aria-hidden /> {job.compRange}</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--iris-ink)]">{WORK_MODE_LABEL[job.workMode]}</span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{job.summary}</p>
          <p className="mt-3 flex items-start gap-2 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            <Target size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--iris)]" aria-hidden />
            <span><span className="font-bold text-[var(--ink)]">First 90 days:</span> {job.outcome}</span>
          </p>
        </GlassCard>

        {/* Role-DNA signals framed as interview probes */}
        <GlassCard>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--iris)]" aria-hidden />
            <h3 className="text-[15px] font-bold text-[var(--ink)]">What this interview will explore</h3>
          </div>
          <p className="mt-1 text-[13px] text-[var(--ink-3)]">
            The AI asks about these — the team&apos;s own requirements, not a generic quiz. Every trait links back to your own words.
          </p>
          <div className="mt-4 space-y-5">
            {grouped.map((g) => (
              <div key={g.kind}>
                <p className="eyebrow">{SIGNAL_GROUP[g.kind].title}</p>
                <ul className="mt-2 space-y-2">
                  {g.items.map((s) => (
                    <SignalRow key={s.signal} signal={s} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* sidebar: reality card + apply */}
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <GlassCard>
          {hasEvidence && covered > 0 ? (
            <>
              <p className="text-[13px] font-bold text-[var(--ink)]">You&apos;ve already shown {covered} of {total} signals</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-2)]">
                Your existing interview evidence is reused. {topUp > 0
                  ? <>This is a short <span className="font-semibold text-[var(--iris-ink)]">top-up</span> covering the {topUp} new signal{topUp === 1 ? "" : "s"}.</>
                  : <>Nothing new to cover — you can apply straight away.</>}
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                <span className="block h-full rounded-full" style={{ width: `${Math.round((covered / total) * 100)}%`, background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} />
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] font-bold text-[var(--ink)]">One honest interview</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-2)]">
                ~{Math.max(total * 2, 6)} min, voice or text, no timer. The AI adapts to what you say and probes the {total} signals above.
              </p>
            </>
          )}

          <GradientButton href={applyHref} size="lg" className="mt-4 w-full">
            Apply &amp; interview
          </GradientButton>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-[var(--ink-3)]">
            <ShieldCheck size={13} aria-hidden /> Nothing shared until you approve it
          </p>
        </GlassCard>

        <GlassCard>
          <p className="eyebrow">The reality</p>
          <ul className="mt-3 space-y-3 text-[13px]">
            <RealityRow icon={Users} label="Team" value={job.reality.teamContext} />
            <RealityRow icon={Route} label="Process" value={job.reality.process} />
            <RealityRow icon={Clock} label="Response time" value={job.reality.responseSla} />
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function SignalRow({ signal }: { signal: JobSignal }) {
  return (
    <li className="rounded-[14px] border px-3 py-2.5" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
      <p className="text-[13.5px] font-semibold text-[var(--ink)]">{signal.signal}</p>
      <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">Looks for: {signal.evidence}</p>
    </li>
  );
}

function RealityRow({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--ink-3)]" aria-hidden />
      <span>
        <span className="font-semibold text-[var(--ink-2)]">{label}: </span>
        <span className="text-[var(--ink-2)]">{value}</span>
      </span>
    </li>
  );
}
