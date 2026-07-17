"use client";

/*
 * A friendly, deterministic flat-illustration avatar for anonymized candidates.
 * Same id always renders the same character (skin, hair, shirt, features). It's
 * an illustration, not a photo, so it never de-anonymizes — it just gives each
 * card a warm, human face like the pipeline reference.
 */

const SKIN = ["#F6D3B4", "#EDC098", "#DBA875", "#C08A5A", "#9A6A42"];
const HAIR = ["#26262E", "#4A3526", "#7A4A2A", "#C2472A", "#B4B2BC", "#161620"];
const SHIRT = ["#6922F5", "#3B82F6", "#0FA3A0", "#F59E0B", "#334155", "#8B54FF"];
const BG = ["#E1F4EA", "#EAE9FC", "#FCEBDD", "#E4F0FB"];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function CandidateAvatar({ seed, size = 56, className = "" }: { seed: string; size?: number; className?: string }) {
  const h = hash(seed);
  const pick = <T,>(arr: T[], shift: number) => arr[(h >> shift) % arr.length];
  const skin = pick(SKIN, 2);
  const hair = pick(HAIR, 5);
  const shirt = pick(SHIRT, 8);
  const bg = pick(BG, 11);
  const hairStyle = (h >> 14) % 4; // 0 short, 1 curly, 2 bun, 3 cap
  const glasses = (h >> 17) % 3 === 0;
  const beard = (h >> 19) % 3 === 0;
  const cid = `av-${h.toString(36)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 88 88" className={className} role="img" aria-label="Candidate avatar">
      <circle cx={44} cy={44} r={44} fill={bg} />
      <clipPath id={cid}>
        <circle cx={44} cy={44} r={44} />
      </clipPath>
      <g clipPath={`url(#${cid})`}>
        {/* shoulders */}
        <path d="M16 84 C16 66 30 60 44 60 C58 60 72 66 72 84 Z" fill={shirt} />
        <path d="M36 58 h16 v6 a8 8 0 0 1 -16 0 Z" fill={skin} />

        {/* hair behind (curly) */}
        {hairStyle === 1 && <circle cx={44} cy={38} r={19} fill={hair} />}

        {/* head */}
        <circle cx={44} cy={42} r={16} fill={skin} />
        {/* ears */}
        <circle cx={28} cy={44} r={3.2} fill={skin} />
        <circle cx={60} cy={44} r={3.2} fill={skin} />

        {/* hair front */}
        {hairStyle === 0 && <path d="M28 42 C26 25 62 25 60 42 C60 33 54 29 44 29 C34 29 28 33 28 42 Z" fill={hair} />}
        {hairStyle === 1 && <path d="M29 40 C28 30 60 30 59 40 C59 33 53 30 44 30 C35 30 29 33 29 40 Z" fill={hair} />}
        {hairStyle === 2 && (
          <>
            <path d="M28 42 C26 26 62 26 60 42 C60 33 54 29 44 29 C34 29 28 33 28 42 Z" fill={hair} />
            <circle cx={44} cy={22} r={6} fill={hair} />
          </>
        )}
        {hairStyle === 3 && <path d="M27 42 A17 17 0 0 1 61 42 L61 40 A17 15 0 0 0 27 40 Z" fill={hair} />}

        {/* beard */}
        {beard && <path d="M30 46 C30 60 58 60 58 46 C58 55 51 58 44 58 C37 58 30 55 30 46 Z" fill={hair} opacity={0.92} />}

        {/* eyes */}
        <circle cx={38.5} cy={44} r={1.9} fill="#26262E" />
        <circle cx={49.5} cy={44} r={1.9} fill="#26262E" />

        {/* glasses */}
        {glasses && (
          <g fill="none" stroke="#2B2B33" strokeWidth={1.4}>
            <rect x={33} y={40.5} width={11} height={7} rx={3.5} />
            <rect x={44} y={40.5} width={11} height={7} rx={3.5} />
            <path d="M44 43.5 h0" />
          </g>
        )}

        {/* smile */}
        <path d="M38.5 50 Q44 54.5 49.5 50" fill="none" stroke="#26262E" strokeWidth={1.8} strokeLinecap="round" />
      </g>
    </svg>
  );
}
