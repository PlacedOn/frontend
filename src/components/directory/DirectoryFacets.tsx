"use client";

/**
 * The talent directory's own facet controls.
 *
 * Lifted verbatim out of `FilterRail` when that file became a shared shell (see
 * its header). Nothing about the behaviour changed in the move — this is the
 * same six facets, the same copy, the same controls. It lives in its own file
 * because it is the half that is specific to browsing PEOPLE, and the half that
 * is specific to browsing people is the half with the fairness reasoning in it.
 */

import { SkillPill } from "./SkillPill";
import { Facet, facetSelectStyle } from "./FilterRail";
import {
  AVAILABILITY_COPY,
  EXPERIENCE_BOUNDS,
  type Availability,
  type DirectoryFilters,
} from "@/types/directory";
import type { DirectoryVocabulary } from "@/lib/directory/filter";
import { useId } from "react";

export interface DirectoryFacetsProps {
  filters: DirectoryFilters;
  vocabulary: DirectoryVocabulary;
  skillCounts: ReadonlyMap<string, number>;
  locationCounts: ReadonlyMap<string, number>;
  /** Every change hands back a whole new filter object — never a mutation. */
  onChange: (next: DirectoryFilters) => void;
}

const AVAILABILITY_ORDER: readonly Availability[] = [
  "immediately",
  "within_30_days",
  "within_90_days",
  "not_looking",
];

/** Coarse, human year boundaries. Nobody filters on "7 to 9 years". */
const EXPERIENCE_STEPS: readonly number[] = [0, 1, 2, 3, 5, 8, 12, EXPERIENCE_BOUNDS.max];

export function DirectoryFacets({
  filters,
  vocabulary,
  skillCounts,
  locationCounts,
  onChange,
}: DirectoryFacetsProps) {
  const figureTraitId = useId();
  const figureMinId = useId();
  const expMinId = useId();
  const expMaxId = useId();

  const toggleSkill = (skill: string) =>
    onChange({
      ...filters,
      skills: filters.skills.includes(skill)
        ? filters.skills.filter((s) => s !== skill)
        : [...filters.skills, skill],
    });

  const toggleLocation = (location: string) =>
    onChange({
      ...filters,
      locations: filters.locations.includes(location)
        ? filters.locations.filter((l) => l !== location)
        : [...filters.locations, location],
    });

  return (
    <>
      {/* ── role (single-select) ── */}
      <Facet title="Role">
        <div className="flex flex-wrap gap-1.5">
          {vocabulary.roles.map((role) => (
            <SkillPill
              key={role}
              label={role}
              selected={filters.role === role}
              // Selecting the active role clears it — a single-select group with
              // no "Any" option is a trap on touch.
              onToggle={() => onChange({ ...filters, role: filters.role === role ? null : role })}
            />
          ))}
        </div>
      </Facet>

      {/* ── skills (multi-select, AND) ── */}
      <Facet title="Skills" hint="A candidate must carry every skill you select.">
        <div className="flex flex-wrap gap-1.5">
          {vocabulary.skills.map((skill) => (
            <SkillPill
              key={skill}
              label={skill}
              count={skillCounts.get(skill) ?? 0}
              selected={filters.skills.includes(skill)}
              onToggle={() => toggleSkill(skill)}
            />
          ))}
        </div>
      </Facet>

      {/* ── minimum figure on a NAMED trait ──
          The plan's `min_score` would be a floor on a blended number. This is a
          floor on one trait, and the trait has to be chosen explicitly. See the
          note on `DirectoryFilters.minFigure`. */}
      <Facet
        title="Minimum figure"
        hint="Set a floor on one trait. There is no overall score to filter on."
      >
        <label
          htmlFor={figureTraitId}
          className="block text-[11.5px] font-medium"
          style={{ color: "var(--ink-2)" }}
        >
          Trait
        </label>
        <select
          id={figureTraitId}
          className="mt-1 cursor-pointer"
          style={facetSelectStyle}
          value={filters.minFigure.traitKey ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              minFigure: { ...filters.minFigure, traitKey: e.target.value || null },
            })
          }
        >
          <option value="">No trait selected — filter off</option>
          {vocabulary.traits.map((trait) => (
            <option key={trait.key} value={trait.key}>
              {trait.label}
            </option>
          ))}
        </select>

        <label
          htmlFor={figureMinId}
          className="mt-3 block text-[11.5px] font-medium"
          style={{ color: "var(--ink-2)" }}
        >
          At least{" "}
          <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>
            {filters.minFigure.min}
          </span>{" "}
          of 100
        </label>
        <input
          id={figureMinId}
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minFigure.min}
          disabled={!filters.minFigure.traitKey}
          onChange={(e) =>
            onChange({
              ...filters,
              minFigure: { ...filters.minFigure, min: Number(e.target.value) },
            })
          }
          className="mt-1.5 w-full"
          style={{
            accentColor: "var(--iris)",
            cursor: filters.minFigure.traitKey ? "pointer" : "not-allowed",
            opacity: filters.minFigure.traitKey ? 1 : 0.45,
          }}
        />

        {/* ── the uncovered opt-in ──
            A checkbox, not a pill, and not a default. The floor applies to
            people who HAVE a reading; people the interview never asked stay in
            the results and are marked on the card. This control is the only way
            to drop them, and it is off until someone turns it on.

            Why a checkbox where every other control here is a pill: pills in
            this rail all mean "include things matching this". This one means the
            opposite — it REMOVES records — and giving a subtractive control the
            additive grammar is how you get someone excluding people while
            believing they narrowed a category. The checkbox carries its own
            "on/off" reading, which is the honest shape for a switch that hides
            humans.

            Disabled without a named trait, because there is nothing to be
            uncovered ON. */}
        <div className="mt-3.5">
          <label
            className="flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-snug"
            style={{
              color: filters.minFigure.traitKey ? "var(--ink-2)" : "var(--ink-3)",
              cursor: filters.minFigure.traitKey ? "pointer" : "not-allowed",
              opacity: filters.minFigure.traitKey ? 1 : 0.55,
            }}
          >
            <input
              type="checkbox"
              checked={filters.minFigure.excludeNoReading}
              disabled={!filters.minFigure.traitKey}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minFigure: { ...filters.minFigure, excludeNoReading: e.target.checked },
                })
              }
              // 16px box with the label as the rest of the target; the whole row
              // is the hit area because the <label> wraps both.
              className="mt-[2px] size-4 shrink-0"
              style={{ accentColor: "var(--iris)" }}
            />
            <span>
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                Also hide anyone with no reading on this trait
              </span>
              <span className="mt-0.5 block" style={{ color: "var(--ink-3)" }}>
                They are shown by default. A missing reading means the interview never asked — it is
                not a low figure, and hiding it hides our gap, not theirs.
              </span>
            </span>
          </label>
        </div>
      </Facet>

      {/* ── work location ──
          A working ARRANGEMENT, never a region of origin. It is a hard
          constraint on where the job happens; it is not, and must never become,
          an input to any reading. */}
      <Facet title="Works from" hint="Where the work happens, not where anyone is from.">
        <div className="flex flex-wrap gap-1.5">
          {vocabulary.locations.map((location) => (
            <SkillPill
              key={location}
              label={location}
              count={locationCounts.get(location) ?? 0}
              selected={filters.locations.includes(location)}
              onToggle={() => toggleLocation(location)}
            />
          ))}
        </div>
      </Facet>

      {/* ── availability (single-select) ── */}
      <Facet title="Availability">
        <div className="flex flex-wrap gap-1.5">
          {AVAILABILITY_ORDER.map((value) => (
            <SkillPill
              key={value}
              label={AVAILABILITY_COPY[value]}
              selected={filters.availability === value}
              onToggle={() =>
                onChange({
                  ...filters,
                  availability: filters.availability === value ? null : value,
                })
              }
            />
          ))}
        </div>
      </Facet>

      {/* ── experience window ── */}
      <Facet title="Experience">
        <div className="flex items-end gap-2.5">
          <div className="flex-1">
            <label
              htmlFor={expMinId}
              className="block text-[11.5px] font-medium"
              style={{ color: "var(--ink-2)" }}
            >
              From
            </label>
            <select
              id={expMinId}
              className="mt-1 cursor-pointer"
              style={facetSelectStyle}
              value={filters.experience.min}
              onChange={(e) => {
                const min = Number(e.target.value);
                onChange({
                  ...filters,
                  // Dragging the floor past the ceiling pushes the ceiling
                  // rather than producing an empty impossible window.
                  experience: { min, max: Math.max(min, filters.experience.max) },
                });
              }}
            >
              {EXPERIENCE_STEPS.filter((y) => y < EXPERIENCE_BOUNDS.max).map((years) => (
                <option key={years} value={years}>
                  {years} yr
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor={expMaxId}
              className="block text-[11.5px] font-medium"
              style={{ color: "var(--ink-2)" }}
            >
              To
            </label>
            <select
              id={expMaxId}
              className="mt-1 cursor-pointer"
              style={facetSelectStyle}
              value={filters.experience.max}
              onChange={(e) => {
                const max = Number(e.target.value);
                onChange({
                  ...filters,
                  experience: { min: Math.min(max, filters.experience.min), max },
                });
              }}
            >
              {EXPERIENCE_STEPS.filter((y) => y > EXPERIENCE_BOUNDS.min).map((years) => (
                <option key={years} value={years}>
                  {years >= EXPERIENCE_BOUNDS.max ? "Any" : `${years} yr`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Facet>
    </>
  );
}
