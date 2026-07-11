"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Check, UserRound, BriefcaseBusiness } from "lucide-react";
import type { Role } from "@/app/login/actions";

type Props = {
  value: Role;
  onChange: (role: Role) => void;
};

const OPTIONS: Array<{
  role: Role;
  icon: typeof UserRound;
  title: string;
  sub: string;
}> = [
  {
    role: "candidate",
    icon: UserRound,
    title: "I'm looking for a job",
    sub: "Interview once, get matched to real roles.",
  },
  {
    role: "employer",
    icon: BriefcaseBusiness,
    title: "I'm hiring",
    sub: "For founders, HR and hiring managers.",
  },
];

/** Two selectable role cards — the fork that decides which dashboard you get. */
export function RolePicker({ value, onChange }: Props) {
  const reduce = useReducedMotion();

  return (
    <fieldset className="min-w-0 border-0 p-0" style={{ margin: 0 }}>
      <legend className="mb-2 p-0 text-[13px] font-semibold text-[var(--ink-2)]">
        Who are you joining as?
      </legend>
      <div role="radiogroup" aria-label="Account type" className="grid min-w-0 gap-2.5 min-[420px]:grid-cols-2">
        {OPTIONS.map(({ role, icon: Icon, title, sub }) => {
          const selected = value === role;
          return (
            <motion.button
              key={role}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(role)}
              whileTap={reduce ? undefined : { scale: 0.975 }}
              className="relative flex min-h-[44px] min-w-0 flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition-colors duration-[var(--d-micro)]"
              style={{
                borderColor: selected ? "var(--iris)" : "var(--glass-line-hi)",
                background: selected ? "var(--iris-ghost)" : "rgba(255,255,255,0.6)",
                boxShadow: selected
                  ? "0 0 0 1px var(--iris), var(--shadow-sm)"
                  : "var(--shadow-sm)",
              }}
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-xl transition-colors duration-[var(--d-micro)]"
                style={{
                  background: selected ? "var(--iris)" : "var(--mist)",
                  color: selected ? "#fff" : "var(--ink-2)",
                }}
              >
                <Icon size={17} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold leading-snug text-[var(--ink)]">
                  {title}
                </span>
                <span className="text-[12.5px] leading-snug text-[var(--ink-3)]">{sub}</span>
              </span>
              <AnimatePresence>
                {selected && (
                  <motion.span
                    initial={reduce ? { scale: 1 } : { scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={reduce ? { scale: 1, opacity: 0 } : { scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full text-white"
                    style={{ background: "var(--iris)" }}
                    aria-hidden="true"
                  >
                    <Check size={12} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}
