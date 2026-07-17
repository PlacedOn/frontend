"use client";

import { useState } from "react";
import { Mic, Trash2 } from "lucide-react";
import type { CandidateProfile, ClaimedSkill, SelfRating } from "@/lib/v1";
import { FieldLabel, INPUT_CLS, INPUT_STYLE, RATINGS, RATING_META, SectionCard } from "./kit";

type Props = {
  profile: CandidateProfile;
  update: (patch: Partial<CandidateProfile>) => void;
};

function RatingControl({ value, onChange, name }: { value: SelfRating; onChange: (r: SelfRating) => void; name: string }) {
  return (
    <div
      role="group"
      aria-label={`Self-rating for ${name}`}
      className="inline-flex rounded-full border p-0.5"
      style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
    >
      {RATINGS.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={value === r}
          title={RATING_META[r].hint}
          onClick={() => onChange(r)}
          className="cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold transition-colors duration-[var(--d-micro)]"
          style={
            value === r
              ? { background: "var(--ink)", color: "#fff" }
              : { color: "var(--ink-3)" }
          }
        >
          {RATING_META[r].label}
        </button>
      ))}
    </div>
  );
}

function VerifyToggle({ on, onClick, name }: { on: boolean; onClick: () => void; name: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Verify ${name} in my interview`}
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-all duration-[var(--d-micro)] hover:-translate-y-px"
      style={
        on
          ? { background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", borderColor: "transparent", color: "#fff", boxShadow: "var(--shadow-iris)" }
          : { background: "var(--glass)", borderColor: "var(--glass-line-hi)", color: "var(--ink-2)" }
      }
    >
      <Mic className="h-3.5 w-3.5" aria-hidden />
      {on ? "Interview will verify this" : "Verify in my interview"}
    </button>
  );
}

/** Step 3 — Card A: skills in the candidate's own words. Claims the interview turns into evidence. */
export function SkillsSection({ profile, update }: Props) {
  const [draft, setDraft] = useState("");
  const skills = profile.claimed_skills;
  const queued = skills.filter((s) => s.wants_to_verify).length;

  const setSkill = (index: number, patch: Partial<ClaimedSkill>) =>
    update({ claimed_skills: skills.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  const removeSkill = (index: number) => update({ claimed_skills: skills.filter((_, i) => i !== index) });
  const addSkill = () => {
    const label = draft.trim();
    if (!label || skills.some((s) => s.label.toLowerCase() === label.toLowerCase())) return;
    update({
      claimed_skills: [...skills, { skill_id: null, label, self_rating: "working", wants_to_verify: true }],
    });
    setDraft("");
  };

  return (
    <SectionCard
      id="skills"
      step={3}
      kicker="Claimed skills"
      title="Skills, as you'd say them"
      note={
        <>
          Everything here is <em>you said</em> — the interview is where it becomes <em>shown</em>. Flag a skill
          and your interview will probe exactly that.
        </>
      }
      aside={
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
          style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
        >
          <Mic className="h-3.5 w-3.5" aria-hidden />
          {queued} queued for your interview
        </span>
      }
    >
      <ul className="grid gap-3">
        {skills.map((skill, i) => (
          <li
            key={skill.label}
            className="rounded-[1.25rem] border p-4 transition-colors hover:bg-white"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-bold leading-snug text-[var(--ink)]">
                {skill.label}
                <span
                  className="ml-2 align-middle text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  you said
                </span>
              </p>
              <button
                type="button"
                onClick={() => removeSkill(i)}
                aria-label={`Remove ${skill.label}`}
                className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg text-[var(--ink-3)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--danger)]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <RatingControl value={skill.self_rating} name={skill.label} onChange={(r) => setSkill(i, { self_rating: r })} />
              <VerifyToggle on={skill.wants_to_verify} name={skill.label} onClick={() => setSkill(i, { wants_to_verify: !skill.wants_to_verify })} />
            </div>
          </li>
        ))}
        {skills.length === 0 && (
          <li className="rounded-[1.25rem] p-6 text-center text-[13.5px] text-[var(--ink-3)]" style={{ background: "var(--mist)" }}>
            Add your first skill in your own words — no taxonomy required.
          </li>
        )}
      </ul>

      <div className="mt-5">
        <FieldLabel hint="Your words, not keywords — 'payments retries' beats 'Java'">Add a skill</FieldLabel>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="e.g. Debugging distributed systems under pressure"
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
          <button
            type="button"
            onClick={addSkill}
            disabled={!draft.trim()}
            className="shrink-0 cursor-pointer rounded-[var(--r-btn)] px-5 text-[13.5px] font-bold text-white transition-opacity disabled:cursor-default disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-[12px] leading-5 text-[var(--ink-3)]">
          Self-ratings are how it feels to you — they are never a score, and employers never see a number.
        </p>
      </div>
    </SectionCard>
  );
}
