"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Fraction of cursor offset the element follows. */
  strength?: number;
  className?: string;
};

/**
 * Magnetic hover wrapper: the child eases toward the cursor and springs back
 * on leave. Fine-pointer + no-preference only, so touch and reduced-motion
 * users get a plain, stable control.
 */
export function Magnetic({ children, strength = 0.3, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * strength);
          yTo((e.clientY - (r.top + r.height / 2)) * strength);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        return () => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={cn("inline-flex will-change-transform", className)}>
      {children}
    </span>
  );
}
