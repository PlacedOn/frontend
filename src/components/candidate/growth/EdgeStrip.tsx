"use client";

import { Quote } from "lucide-react";
import type { GrowthEdge } from "@/lib/v1";
import { Reveal } from "@/components/ui/Reveal";
import { BandDot, BAND_LABEL } from "./chips";

/**
 * The candidate's advantages — strengths worth leading with, each traced to
 * the verbatim interview evidence it came from.
 */
export function EdgeStrip({ edges }: { edges: GrowthEdge[] }) {
  if (edges.length === 0) return null;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {edges.map((edge, i) => (
        <Reveal key={edge.skill_label} delay={i * 0.08}>
          <figure
            className="group relative h-full overflow-hidden rounded-[var(--r-card)] p-6 text-white"
            style={{
              background: "linear-gradient(148deg, #1A0B3D 0%, #2B1168 52%, var(--iris-ink) 100%)",
              boxShadow: "var(--shadow-iris)",
            }}
          >
            {/* soft light bloom, drifts on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full opacity-40 blur-3xl transition-transform duration-700 group-hover:translate-x-[-14px] group-hover:translate-y-[10px]"
              style={{ background: "radial-gradient(circle, var(--iris-soft), transparent 70%)" }}
            />
            <Quote size={26} className="text-[var(--iris-soft)]" aria-hidden />
            {edge.quote && (
              <blockquote className="mt-3 text-[15.5px] font-medium leading-relaxed text-white/95">
                &ldquo;{edge.quote}&rdquo;
              </blockquote>
            )}
            <figcaption className="mt-4">
              <p className="flex items-center gap-2 text-[14px] font-extrabold tracking-tight">
                <BandDot band={edge.band} />
                {edge.skill_label}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70">
                  {BAND_LABEL[edge.band]}
                </span>
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">{edge.note}</p>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
