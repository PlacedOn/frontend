"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Plus, Trash2, Rocket, Sparkles, Loader2 } from "lucide-react";
import {
  v1,
  V1Error,
  isLiveBackend,
  type JobDetail,
  type RoleDnaSignal,
  type SignalKind,
  type RealityCard,
  type WorkMode,
} from "@/lib/v1";

const FIELD =
  "mt-1.5 w-full rounded-[var(--r-btn)] border px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:border-[var(--iris)]";
const FIELD_STYLE = { borderColor: "var(--glass-line-hi)", background: "var(--glass)" } as const;

const KIND_LABEL: Record<SignalKind, string> = {
  success_signal: "Success signal",
  must_have: "Must-have",
  nice_to_have: "Nice-to-have",
};

const emptySignal = (kind: SignalKind = "success_signal"): RoleDnaSignal => ({
  kind,
  signal: "",
  required_evidence: "",
});

export function JobSetup({ jobId }: { jobId: string }) {
  const live = isLiveBackend();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // editable local state
  const [businessProblem, setBusinessProblem] = useState("");
  const [outcome, setOutcome] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [signals, setSignals] = useState<RoleDnaSignal[]>([
    emptySignal(),
    emptySignal(),
    emptySignal(),
  ]);
  const [reality, setReality] = useState<RealityCard>({});

  // Generate-from-description (firewalled)
  const [genDesc, setGenDesc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genInfo, setGenInfo] = useState<{ note: string; stripped: string[] } | null>(null);

  const [savingDna, setSavingDna] = useState(false);
  const [savingReality, setSavingReality] = useState(false);
  const [activating, setActivating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const hydrate = useCallback((d: JobDetail) => {
    setJob(d);
    setBusinessProblem(d.business_problem ?? "");
    setOutcome(d.first_90_day_outcome ?? "");
    setFollowUp(d.human_follow_up ?? "");
    if (d.signals.length) setSignals(d.signals.map((s) => ({ ...s })));
    if (d.reality_card) setReality(d.reality_card);
  }, []);

  useEffect(() => {
    if (!live) return;
    v1.getJob(jobId)
      .then(hydrate)
      .catch((e) => setLoadError(e instanceof V1Error ? e.message : "Could not load this role."));
  }, [jobId, live, hydrate]);

  // client-side mirror of the server completeness gate (compute_search_ready)
  const successCount = signals.filter((s) => s.kind === "success_signal" && s.signal.trim()).length;
  const hasOutcome = outcome.trim().length > 0;
  const hasReality = Boolean(reality.work_mode && reality.response_sla?.trim());
  const ready = successCount >= 3 && hasOutcome && hasReality;

  const setSignal = (i: number, patch: Partial<RoleDnaSignal>) =>
    setSignals((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const generateSignals = async () => {
    if (!genDesc.trim()) return;
    setGenerating(true);
    setGenInfo(null);
    try {
      const res = await v1.generateRoleDna(jobId, genDesc.trim());
      // Drop empty placeholder rows, append the firewall-clean proposals to edit.
      setSignals((prev) => [...prev.filter((s) => s.signal.trim()), ...res.signals]);
      setGenInfo({ note: res.note, stripped: res.stripped });
    } catch (e) {
      setGenInfo({ note: e instanceof V1Error ? e.message : "Could not generate signals.", stripped: [] });
    } finally {
      setGenerating(false);
    }
  };

  const saveDna = async () => {
    setSavingDna(true);
    setMsg(null);
    try {
      const cleaned = signals
        .filter((s) => s.signal.trim())
        .map((s, i) => ({ ...s, signal: s.signal.trim(), position: i }));
      const d = await v1.setRoleDna(jobId, {
        business_problem: businessProblem.trim() || null,
        first_90_day_outcome: outcome.trim() || null,
        human_follow_up: followUp.trim() || null,
        signals: cleaned,
      });
      hydrate(d);
      setMsg("Role DNA saved.");
    } catch (e) {
      setMsg(e instanceof V1Error ? e.message : "Could not save Role DNA.");
    } finally {
      setSavingDna(false);
    }
  };

  const saveReality = async () => {
    setSavingReality(true);
    setMsg(null);
    try {
      const d = await v1.setRealityCard(jobId, reality);
      hydrate(d);
      setMsg("Job Reality Card saved.");
    } catch (e) {
      setMsg(e instanceof V1Error ? e.message : "Could not save the reality card.");
    } finally {
      setSavingReality(false);
    }
  };

  const activate = async () => {
    setActivating(true);
    setMsg(null);
    try {
      const d = await v1.updateStatus(jobId, "active");
      hydrate(d);
      setMsg("Role is active and can enter candidate search.");
    } catch (e) {
      setMsg(e instanceof V1Error ? e.message : "Could not activate.");
    } finally {
      setActivating(false);
    }
  };

  if (!live) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6" style={{ color: "var(--iris-ink)" }}>
        Backend not connected. Set <code>NEXT_PUBLIC_API_BASE_URL</code> to the live API to edit Role DNA and the reality card.
      </div>
    );
  }
  if (loadError) return <p className="text-[14px] font-semibold text-[#b91c1c]">{loadError}</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        {/* ── Role DNA ─────────────────────────────── */}
        <section className="glass rounded-[var(--r-card)] p-6">
          <h2 className="text-[19px] font-bold">Role DNA</h2>
          <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">The observable signals a candidate is assessed against — never vague traits.</p>

          {/* Generate from a plain-language description — firewalled */}
          <div className="mt-5 rounded-[var(--r-card)] p-4" style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}>
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[var(--iris-ink)]" />
              <span className="text-[13px] font-semibold text-[var(--ink)]">Generate signals from a description</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-2)]">
              Paste the role in plain words. We propose observable signals — and never pedigree or protected traits. You edit and approve everything below.
            </p>
            <textarea
              rows={3}
              value={genDesc}
              onChange={(e) => setGenDesc(e.target.value)}
              placeholder="Senior backend engineer to keep our payments service reliable — debugging under load, clear tradeoffs, ships weekly."
              className={FIELD}
              style={FIELD_STYLE}
            />
            <button
              type="button"
              onClick={generateSignals}
              disabled={generating || !genDesc.trim() || !live}
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}
            >
              {generating ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><Sparkles size={14} /> Generate signals</>}
            </button>
            {!live && <p className="mt-2 text-[12px] text-[var(--ink-3)]">Connect the backend to generate.</p>}
            {genInfo && (
              <div className="mt-3 text-[12.5px]">
                <p className="text-[var(--ink-2)]">{genInfo.note}</p>
                {genInfo.stripped.length > 0 && (
                  <div className="mt-2 rounded-[var(--r-btn)] px-3 py-2" style={{ background: "rgba(180,120,10,0.12)" }}>
                    <p className="font-semibold" style={{ color: "#B45309" }}>Removed — pedigree / protected, never assessed:</p>
                    <ul className="mt-1 list-disc pl-4 text-[var(--ink-2)]">
                      {genInfo.stripped.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <label className="mt-5 block">
            <span className="text-[13px] font-semibold text-[var(--ink-2)]">Business problem to solve</span>
            <textarea rows={2} value={businessProblem} onChange={(e) => setBusinessProblem(e.target.value)} placeholder="Keep a payments service reliable while shipping weekly." className={FIELD} style={FIELD_STYLE} />
          </label>
          <label className="mt-4 block">
            <span className="text-[13px] font-semibold text-[var(--ink-2)]">First-90-day outcome <span className="text-[var(--iris-ink)]">· required to activate</span></span>
            <textarea rows={2} value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Contribute safely to a service with clear debugging and review habits." className={FIELD} style={FIELD_STYLE} />
          </label>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--ink-2)]">Signals <span className="text-[var(--ink-3)]">· at least 3 success signals</span></span>
            <button type="button" onClick={() => setSignals((p) => [...p, emptySignal()])} className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-[var(--iris-ink)]">
              <Plus size={14} /> Add
            </button>
          </div>
          <ul className="mt-3 space-y-3">
            {signals.map((s, i) => (
              <li key={i} className="rounded-[var(--r-btn)] border p-3" style={{ borderColor: "var(--glass-line)" }}>
                <div className="flex items-center gap-2">
                  <select value={s.kind} onChange={(e) => setSignal(i, { kind: e.target.value as SignalKind })} className="rounded-[10px] border px-2 py-1.5 text-[12.5px] font-semibold" style={FIELD_STYLE}>
                    {(Object.keys(KIND_LABEL) as SignalKind[]).map((k) => (
                      <option key={k} value={k}>{KIND_LABEL[k]}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setSignals((p) => p.filter((_, idx) => idx !== i))} className="ml-auto cursor-pointer text-[var(--ink-3)] hover:text-[#b91c1c]" aria-label="Remove signal">
                    <Trash2 size={15} />
                  </button>
                </div>
                <input value={s.signal} onChange={(e) => setSignal(i, { signal: e.target.value })} placeholder="Clarifies constraints before proposing a fix" className={FIELD} style={FIELD_STYLE} />
                <input value={s.required_evidence ?? ""} onChange={(e) => setSignal(i, { required_evidence: e.target.value })} placeholder="What would show this? (optional)" className="mt-2 w-full rounded-[var(--r-btn)] border px-3.5 py-2 text-[13px] outline-none focus:border-[var(--iris)]" style={FIELD_STYLE} />
              </li>
            ))}
          </ul>

          <label className="mt-5 block">
            <span className="text-[13px] font-semibold text-[var(--ink-2)]">Suggested human follow-up</span>
            <textarea rows={2} value={followUp} onChange={(e) => setFollowUp(e.target.value)} placeholder="Discuss a real project trade-off and a code-review response." className={FIELD} style={FIELD_STYLE} />
          </label>

          <button type="button" onClick={saveDna} disabled={savingDna} className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50" style={{ background: "var(--iris)" }}>
            {savingDna ? "Saving…" : "Save Role DNA"}
          </button>
        </section>

        {/* ── Job Reality Card ─────────────────────── */}
        <section className="glass rounded-[var(--r-card)] p-6">
          <h2 className="text-[19px] font-bold">Job Reality Card</h2>
          <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">The honest work conditions candidates see — so fit is mutual.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[13px] font-semibold text-[var(--ink-2)]">Work mode <span className="text-[var(--iris-ink)]">· required</span></span>
              <select value={reality.work_mode ?? ""} onChange={(e) => setReality((r) => ({ ...r, work_mode: (e.target.value || null) as WorkMode | null }))} className={FIELD} style={FIELD_STYLE}>
                <option value="">Select…</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-[var(--ink-2)]">Response SLA <span className="text-[var(--iris-ink)]">· required</span></span>
              <input value={reality.response_sla ?? ""} onChange={(e) => setReality((r) => ({ ...r, response_sla: e.target.value }))} placeholder="Reply within 3 business days" className={FIELD} style={FIELD_STYLE} />
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-[var(--ink-2)]">Location</span>
              <input value={reality.location ?? ""} onChange={(e) => setReality((r) => ({ ...r, location: e.target.value }))} placeholder="Bengaluru" className={FIELD} style={FIELD_STYLE} />
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-[var(--ink-2)]">Compensation range</span>
              <input value={reality.compensation_range ?? ""} onChange={(e) => setReality((r) => ({ ...r, compensation_range: e.target.value }))} placeholder="₹8–14 LPA" className={FIELD} style={FIELD_STYLE} />
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-[var(--ink-2)]">Team / manager context</span>
              <input value={reality.team_context ?? ""} onChange={(e) => setReality((r) => ({ ...r, team_context: e.target.value }))} placeholder="6-person platform team, weekly 1:1s" className={FIELD} style={FIELD_STYLE} />
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-[var(--ink-2)]">Process & decision owner</span>
              <input value={reality.process ?? ""} onChange={(e) => setReality((r) => ({ ...r, process: e.target.value }))} placeholder="1 screen + 1 human interview; EM decides" className={FIELD} style={FIELD_STYLE} />
            </label>
          </div>

          <button type="button" onClick={saveReality} disabled={savingReality} className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50" style={{ background: "var(--iris)" }}>
            {savingReality ? "Saving…" : "Save Reality Card"}
          </button>
        </section>
      </div>

      {/* ── Completion / activate ──────────────────── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-[var(--r-card)] p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Readiness</p>
          <p className="mt-1 text-[14px] font-bold">{job ? job.title : "Role"}{job?.level ? ` · ${job.level}` : ""}</p>
          <ul className="mt-4 space-y-2.5 text-[13.5px]">
            <Requirement met={successCount >= 3} label={`${successCount}/3 success signals`} />
            <Requirement met={hasOutcome} label="First-90-day outcome" />
            <Requirement met={hasReality} label="Work mode + response SLA" />
          </ul>
          <p className="mt-4 text-[12.5px] text-[var(--ink-3)]">Save each section, then activate. A role can only enter candidate search when complete.</p>
          <button type="button" onClick={activate} disabled={activating || !ready || job?.status === "active"} className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] px-5 py-3 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
            <Rocket size={15} /> {job?.status === "active" ? "Active" : "Activate role"}
          </button>
          {msg && <p className="mt-3 text-[12.5px] font-semibold text-[var(--iris-ink)]">{msg}</p>}
        </div>
      </aside>
    </div>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-full text-white" style={{ background: met ? "#059669" : "var(--mist)" }}>
        {met && <Check size={12} strokeWidth={3} />}
      </span>
      <span className={met ? "text-[var(--ink)]" : "text-[var(--ink-3)]"}>{label}</span>
    </li>
  );
}
