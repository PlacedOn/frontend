"use client";

import { useEffect, useRef, type ComponentType } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "motion/react";
import {
  Mic, ShieldCheck, FileCheck2, Sparkles, Scale, MessageSquareText, Search,
  TrendingUp, Users, BadgeCheck, Fingerprint, BrainCircuit, Award, Quote,
  type LucideProps,
} from "lucide-react";
import { AnimateIcon, ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { HeroAurora } from "@/components/background/HeroAurora";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

type FloatItem = { Icon: ComponentType<LucideProps>; className: string; mobile?: boolean };

/*
 * Floating-icons hero (after 21st.dev @ravikatiyar162): a centred headline
 * inside a field of soft-shadowed icon tiles that (a) drift continuously and
 * (b) repel from the cursor on spring physics. Adapted to Frost Luxe and — the
 * deliberate change — the tiles carry PlacedOn's hiring ecosystem (interview,
 * evidence, fairness, matching), never random brand logos.
 */
const ICONS: FloatItem[] = [
  { Icon: Mic, className: "top-[14%] left-[9%]", mobile: true },
  { Icon: ShieldCheck, className: "top-[18%] right-[10%]", mobile: true },
  { Icon: FileCheck2, className: "bottom-[16%] left-[11%]", mobile: true },
  { Icon: Sparkles, className: "bottom-[14%] right-[12%]", mobile: true },
  { Icon: TrendingUp, className: "top-[44%] left-[6%]", mobile: true },
  { Icon: BadgeCheck, className: "top-[47%] right-[6%]", mobile: true },
  { Icon: Scale, className: "top-[9%] left-[30%]" },
  { Icon: MessageSquareText, className: "top-[8%] right-[31%]" },
  { Icon: Search, className: "bottom-[11%] left-[32%]" },
  { Icon: Users, className: "top-[68%] right-[25%]" },
  { Icon: Fingerprint, className: "bottom-[9%] right-[39%]" },
  { Icon: BrainCircuit, className: "top-[27%] left-[19%]" },
  { Icon: Award, className: "top-[25%] right-[20%]" },
  { Icon: Quote, className: "top-[71%] left-[21%]" },
];

export function Hero() {
  const reduce = useReducedMotion();
  const { open } = useDemoDialog();
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    mouseX.current = e.clientX;
    mouseY.current = e.clientY;
  };

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      id="top"
      onMouseMove={onMove}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      <div aria-hidden className="absolute inset-0">
        <HeroAurora />
      </div>
      {/* radial legibility wash — bright at the centre where the copy sits */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 50% at 50% 46%, rgba(247,249,254,0.82) 0%, rgba(247,249,254,0.3) 55%, rgba(247,249,254,0) 80%)",
        }}
      />

      {/* floating icon field — decorative, never blocks the CTAs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {ICONS.map((item, i) => (
          <FloatIcon key={i} item={item} index={i} mouseX={mouseX} mouseY={mouseY} reduce={!!reduce} />
        ))}
      </div>

      {/* centred content */}
      <div className="shell relative z-[1] flex flex-col items-center pt-28 pb-24 text-center md:pt-24">
        <motion.a
          {...rise(0.04)}
          href="/trust"
          className="chip transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
        >
          <ShieldCheck size={14} className="text-[var(--iris)]" aria-hidden />
          LL144 &amp; EU AI Act aligned
        </motion.a>

        <motion.h1
          {...rise(0.12)}
          className="mt-6 max-w-[16ch] text-balance text-[clamp(2.7rem,1rem+6.6vw,5.6rem)] leading-[0.98] tracking-[-0.035em] text-[var(--ink)]"
          style={{ fontWeight: 680 }}
        >
          Defining the future with <span className="grad-iris">smart hiring</span>.
        </motion.h1>

        <motion.p
          {...rise(0.22)}
          className="mt-6 max-w-[52ch] text-[clamp(1.05rem,1rem+0.45vw,1.28rem)] leading-relaxed text-[var(--ink-2)]"
        >
          One honest, adaptive conversation shows how a candidate actually thinks, decides
          and holds up under pressure — every trait traced back to something they said.
        </motion.p>

        <motion.div {...rise(0.32)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <AnimateIcon animateOnHover>
            <Button href="/pre-interview" className="!px-7 !py-4 text-[15.5px]">
              <Sparkles size={17} aria-hidden /> Start your interview
              <ArrowRight size={17} />
            </Button>
          </AnimateIcon>
          <Button onClick={() => open("employer")} variant="ghost" className="!px-6 !py-4 text-[15px]">
            Book a demo
          </Button>
        </motion.div>

        <motion.div
          {...rise(0.44)}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-[var(--ink-3)]"
        >
          <span className="flex items-center gap-1.5">
            <span className="livedot" /> Free for candidates
          </span>
          <span className="hidden text-[var(--glass-line-hi)] sm:inline">·</span>
          <span>Every score tied to a transcript moment</span>
          <span className="hidden text-[var(--glass-line-hi)] sm:inline">·</span>
          <span>Zero résumé bias</span>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * One floating tile: staggered scale-in, a continuous drift, and cursor
 * repulsion (spring). All motion is disabled under reduced-motion, where the
 * tile simply fades in and holds still.
 */
function FloatIcon({
  item, index, mouseX, mouseY, reduce,
}: {
  item: FloatItem;
  index: number;
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const REACH = 150;
    const onMove = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = mouseX.current - (r.left + r.width / 2);
      const dy = mouseY.current - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < REACH) {
        const angle = Math.atan2(dy, dx);
        const force = (1 - dist / REACH) * 50;
        x.set(-Math.cos(angle) * force);
        y.set(-Math.sin(angle) * force);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, mouseX, mouseY, x, y]);

  const dur = 6 + (index % 5); // deterministic (no SSR/CSR mismatch), still varied

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { x: springX, y: springY }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: reduce ? 0 : index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute", item.className, item.mobile ? "" : "hidden md:block")}
    >
      <motion.div
        className="grid size-14 place-items-center rounded-[22px] md:size-16"
        style={{
          background: "var(--glass-hi)",
          border: "1px solid var(--glass-line-hi)",
          backdropFilter: "blur(12px) saturate(1.3)",
          WebkitBackdropFilter: "blur(12px) saturate(1.3)",
          boxShadow: "0 18px 40px -18px rgba(40,26,120,0.42), inset 0 1px 0 rgba(255,255,255,0.75)",
        }}
        animate={reduce ? undefined : { y: [0, -8, 0, 8, 0], x: [0, 6, 0, -6, 0], rotate: [0, 5, 0, -5, 0] }}
        transition={reduce ? undefined : { duration: dur, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <item.Icon className="size-6 md:size-7" style={{ color: "var(--iris)" }} strokeWidth={1.75} />
      </motion.div>
    </motion.div>
  );
}
