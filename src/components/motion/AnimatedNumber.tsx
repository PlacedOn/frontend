"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A number that counts up to its value the first time it scrolls into view —
 * a small piece of motion that makes data feel live, not decorative. Uses
 * requestAnimationFrame with an ease-out curve. Under reduced-motion it renders
 * the final value immediately.
 */
export function AnimatedNumber({
  value,
  duration = 900,
  className,
  style,
}: {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic — settles, no bounce
        setDisplay(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !done.current) {
          done.current = true;
          run();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduce]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}
