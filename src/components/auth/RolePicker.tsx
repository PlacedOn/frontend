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
    <fieldset className="w-full min-w-0 border-0 p-0" style={{ margin: 0 }}>
      <legend className="mb-2 p-0 text-[13px] font-semibold tracking-[0.01em] text-[var(--ink-2)]">
        Who are you joining as?
      </legend>
      <div
        role="radiogroup"
        aria-label="Account type"
        className="grid w-full min-w-0 gap-2.5 grid-cols-2"
      >
        {OPTIONS.map(({ role, icon: Icon, title, sub }) => {
          const selected = value === role;
          return (
            <motion.button
              key={role}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(role)}
              animate={reduce ? undefined : { y: selected ? -2 : 0, scale: selected ? 1.01 : 1 }}
              whileHover={reduce || selected ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="relative flex min-h-[44px] w-full min-w-0 cursor-pointer flex-col items-start gap-2 rounded-2xl border p-3 sm:p-3.5 text-left transition-[border-color,background-color,box-shadow] duration-[var(--d-micro)]"
              style={{
                borderColor: selected ? "var(--iris)" : "var(--glass-line-hi)",
                background: selected
                  ? "linear-gradient(150deg, rgba(105,34,245,0.11) 0%, rgba(139,84,255,0.05) 55%, rgba(255,255,255,0.65) 100%)"
                  : "rgba(255,255,255,0.62)",
                boxShadow: selected
                  ? "0 0 0 1px var(--iris), 0 14px 30px -14px rgba(105, 34, 245, 0.42)"
                  : "var(--shadow-sm)",
              }}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-[background-color,color,box-shadow] duration-[var(--d-micro)]"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, var(--iris-soft), var(--iris))"
                    : "var(--mist)",
                  color: selected ? "#fff" : "var(--ink-2)",
                  boxShadow: selected ? "0 6px 14px -6px rgba(105, 34, 245, 0.55)" : "none",
                }}
              >
                <Icon size={16} />
              </span>
              <span className="flex w-full min-w-0 flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold leading-snug text-[var(--ink)] break-words">
                  {title}
                </span>
                <span className="text-[12px] leading-snug text-[var(--ink-3)] break-words">{sub}</span>
              </span>
              <AnimatePresence>
                {selected && (
                  <motion.span
                    initial={reduce ? { scale: 1 } : { scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={reduce ? { scale: 1, opacity: 0 } : { scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="absolute right-2.5 top-2.5 grid h-4.5 w-4.5 place-items-center rounded-full text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--iris-soft), var(--iris))",
                      boxShadow: "0 0 0 2px rgba(255,255,255,0.8), 0 4px 10px -3px rgba(105,34,245,0.5)",
                    }}
                    aria-hidden="true"
                  >
                    <Check size={11} strokeWidth={3} />
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
