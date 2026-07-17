"use client";

import type { Availability, CandidateProfile, Seniority, WorkMode, WorkType } from "@/lib/v1";
import {
  AVAILABILITIES,
  AVAILABILITY_LABEL,
  FieldLabel,
  INPUT_CLS,
  INPUT_STYLE,
  PrefBadge,
  ROLE_SUGGESTIONS,
  SENIORITIES,
  SENIORITY_LABEL,
  SectionCard,
  TagInput,
  ToggleChip,
  WORK_MODES,
  WORK_MODE_LABEL,
  WORK_TYPES,
  WORK_TYPE_LABEL,
} from "./kit";

type Props = {
  profile: CandidateProfile;
  update: (patch: Partial<CandidateProfile>) => void;
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Step 2 — what you're looking for. Routes the interview + scopes matching. */
export function IntentSection({ profile, update }: Props) {
  return (
    <SectionCard
      id="intent"
      step={2}
      kicker="Intent"
      title="What you're looking for"
      note="Target roles route your interview to the right role family. The rest scopes which openings we show you — none of it is used to judge you."
    >
      <div className="grid gap-6">
        <div>
          <FieldLabel hint="Routes your interview — pick the families you actually want">Target roles</FieldLabel>
          <TagInput
            values={profile.target_roles}
            onChange={(target_roles) => update({ target_roles })}
            placeholder="Add a role family…"
            suggestions={ROLE_SUGGESTIONS}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className="w-full">
              <FieldLabel>Where you are</FieldLabel>
            </legend>
            <div className="flex flex-wrap gap-2">
              {SENIORITIES.map((s: Seniority) => (
                <ToggleChip key={s} active={profile.seniority === s} onClick={() => update({ seniority: s })}>
                  {SENIORITY_LABEL[s]}
                </ToggleChip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="w-full">
              <FieldLabel>Availability</FieldLabel>
            </legend>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITIES.map((a: Availability) => (
                <ToggleChip key={a} active={profile.availability === a} onClick={() => update({ availability: a })}>
                  {AVAILABILITY_LABEL[a]}
                </ToggleChip>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset>
          <legend className="w-full">
            <FieldLabel hint="Multi-select — every shape of work you'd take">Work types</FieldLabel>
          </legend>
          <div className="flex flex-wrap gap-2">
            {WORK_TYPES.map((w: WorkType) => (
              <ToggleChip key={w} active={profile.work_types.includes(w)} onClick={() => update({ work_types: toggle(profile.work_types, w) })}>
                {WORK_TYPE_LABEL[w]}
              </ToggleChip>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className="w-full">
              <FieldLabel hint="Multi-select">
                Work mode <PrefBadge />
              </FieldLabel>
            </legend>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((m: WorkMode) => (
                <ToggleChip key={m} active={profile.work_mode_pref.includes(m)} onClick={() => update({ work_mode_pref: toggle(profile.work_mode_pref, m) })}>
                  {WORK_MODE_LABEL[m]}
                </ToggleChip>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <FieldLabel hint="A range is fine">Comp expectation</FieldLabel>
            <input
              value={profile.comp_expectation ?? ""}
              onChange={(e) => update({ comp_expectation: e.target.value || null })}
              placeholder="e.g. ₹14–20L"
              className={INPUT_CLS}
              style={INPUT_STYLE}
            />
          </label>
        </div>

        <div>
          <FieldLabel hint="Used only to match openings near you — never as a signal about you">
            Locations open to <PrefBadge />
          </FieldLabel>
          <TagInput
            values={profile.locations_open_to}
            onChange={(locations_open_to) => update({ locations_open_to })}
            placeholder="Add a city or region…"
            suggestions={["Remote (India)", "Bengaluru", "Pune", "Hyderabad", "Delhi NCR"]}
          />
        </div>
      </div>
    </SectionCard>
  );
}
