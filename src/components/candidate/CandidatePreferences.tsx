"use client";

import { useEffect, useState } from "react";
import { v1, V1Error, isLiveBackend, type CandidatePreferences as Prefs, type Visibility } from "@/lib/v1";

const FIELD =
  "mt-1.5 w-full rounded-[var(--r-btn)] border px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:border-[var(--iris)]";
const FIELD_STYLE = { borderColor: "var(--glass-line-hi)", background: "var(--glass)" } as const;

const WORK_MODES = ["remote", "hybrid", "onsite"] as const;
const VISIBILITY: { value: Visibility; label: string; hint: string }[] = [
  { value: "off", label: "Off", hint: "You're invisible to employers." },
  { value: "matched_only", label: "Matched only", hint: "Only roles you match can find you." },
  { value: "searchable", label: "Searchable", hint: "Employers searching this role family can find you." },
];

const splitList = (s: string): string[] =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

export function CandidatePreferences() {
  const live = isLiveBackend();
  const [prefs, setPrefs] = useState<Prefs>({
    role_families: [],
    locations: [],
    work_modes: [],
    salary_min_expectation: null,
    feedback_style: null,
    visibility: "off",
    research_consent: false,
  });
  const [roleText, setRoleText] = useState("");
  const [locText, setLocText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!live) {
      setLoaded(true);
      return;
    }
    v1.getPreferences()
      .then((p) => {
        setPrefs(p);
        setRoleText(p.role_families.join(", "));
        setLocText(p.locations.join(", "));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [live]);

  const toggleMode = (mode: string) =>
    setPrefs((p) => ({
      ...p,
      work_modes: p.work_modes.includes(mode)
        ? p.work_modes.filter((m) => m !== mode)
        : [...p.work_modes, mode],
    }));

  const save = async () => {
    setMsg(null);
    // Preview has no account to write to; don't throw a backend error at a
    // candidate who's just exploring their settings.
    if (!live) {
      setMsg("Preview — your choices save here once your account is connected.");
      return;
    }
    setBusy(true);
    try {
      const payload: Prefs = {
        ...prefs,
        role_families: splitList(roleText),
        locations: splitList(locText),
      };
      const saved = await v1.putPreferences(payload);
      setPrefs(saved);
      setMsg("Preferences saved.");
    } catch (e) {
      setMsg(e instanceof V1Error ? e.message : "Could not save preferences.");
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) return <p className="text-[14px] text-[var(--ink-3)]">Loading…</p>;

  return (
    <div className="glass max-w-2xl rounded-[var(--r-card)] p-6 sm:p-8">
      {!live && (
        <p className="mb-6 rounded-[var(--r-btn)] px-4 py-3 text-[13px] leading-relaxed" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          Preview — explore every setting freely. You&rsquo;re <b>private by default</b>; nothing is shared or saved until your account is connected.
        </p>
      )}

      <label className="block">
        <span className="text-[13px] font-semibold text-[var(--ink-2)]">Role families <span className="text-[var(--ink-3)]">· comma separated</span></span>
        <input value={roleText} onChange={(e) => setRoleText(e.target.value)} placeholder="junior_backend, platform" className={FIELD} style={FIELD_STYLE} />
      </label>

      <label className="mt-5 block">
        <span className="text-[13px] font-semibold text-[var(--ink-2)]">Locations <span className="text-[var(--ink-3)]">· comma separated</span></span>
        <input value={locText} onChange={(e) => setLocText(e.target.value)} placeholder="Bengaluru, Remote (India)" className={FIELD} style={FIELD_STYLE} />
      </label>

      <div className="mt-5">
        <span className="text-[13px] font-semibold text-[var(--ink-2)]">Work modes</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {WORK_MODES.map((mode) => {
            const on = prefs.work_modes.includes(mode);
            return (
              <button
                key={mode}
                type="button"
                onClick={() => toggleMode(mode)}
                className="cursor-pointer rounded-full border px-4 py-2 text-[13px] font-semibold capitalize transition-colors"
                style={on ? { borderColor: "var(--iris)", background: "var(--iris-ghost)", color: "var(--iris-ink)" } : { borderColor: "var(--glass-line-hi)" }}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-semibold text-[var(--ink-2)]">Minimum salary expectation</span>
          <input value={prefs.salary_min_expectation ?? ""} onChange={(e) => setPrefs((p) => ({ ...p, salary_min_expectation: e.target.value }))} placeholder="₹8 LPA" className={FIELD} style={FIELD_STYLE} />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold text-[var(--ink-2)]">Feedback style</span>
          <input value={prefs.feedback_style ?? ""} onChange={(e) => setPrefs((p) => ({ ...p, feedback_style: e.target.value }))} placeholder="Direct and specific" className={FIELD} style={FIELD_STYLE} />
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-[13px] font-semibold text-[var(--ink-2)]">Visibility to employers</legend>
        <div className="mt-2 space-y-2">
          {VISIBILITY.map((v) => (
            <label key={v.value} className="flex cursor-pointer items-start gap-3 rounded-[var(--r-btn)] border p-3" style={{ borderColor: prefs.visibility === v.value ? "var(--iris)" : "var(--glass-line)" }}>
              <input type="radio" name="visibility" checked={prefs.visibility === v.value} onChange={() => setPrefs((p) => ({ ...p, visibility: v.value }))} className="mt-0.5 accent-[var(--iris)]" />
              <span>
                <span className="text-[14px] font-semibold">{v.label}</span>
                <span className="block text-[13px] text-[var(--ink-2)]">{v.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-[var(--r-btn)] border p-4" style={{ borderColor: "var(--glass-line-hi)" }}>
        <input type="checkbox" checked={prefs.research_consent} onChange={(e) => setPrefs((p) => ({ ...p, research_consent: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-[var(--iris)]" />
        <span className="text-[13.5px] leading-relaxed">
          <span className="font-semibold">Help improve the assessment (optional).</span> Allow de-identified use of your disputed/corrected evidence to improve accuracy. Off by default; you can turn it off any time.
        </span>
      </label>

      {msg && <p className="mt-4 text-[13px] font-semibold text-[var(--iris-ink)]">{msg}</p>}

      <button type="button" onClick={save} disabled={busy} className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[14px] font-bold text-white disabled:opacity-50" style={{ background: "var(--iris)" }}>
        {busy ? "Saving…" : "Save preferences"}
      </button>
    </div>
  );
}
