"use client";

import { useEffect, useRef, type ComponentType } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from "motion/react";
import {
  ShieldCheck, Sparkles, BadgeCheck, Quote, type LucideProps,
} from "lucide-react";
import { AnimateIcon, ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { HeroAurora } from "@/components/background/HeroAurora";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * Floating-cards hero (after 21st.dev @ravikatiyar162/floating-icons-hero-section):
 * a centred headline inside a field of soft-shadowed cards that drift and repel
 * from the cursor on spring physics. The cards carry PlacedOn's real ecosystem —
 * candidates with roles, an evidenced trait, a verification, live activity — so
 * the field says what the product does at a glance instead of decorating.
 */
type Person = { kind: "person"; initials: string; name: string; role: string; tone: string };
type Trait = { kind: "trait"; label: string; value: string; sub: string; fill: number };
type Verified = { kind: "verified"; label: string; sub: string };
type Activity = { kind: "activity"; label: string; bars: number[] };
type Badge = { kind: "badge"; Icon: ComponentType<LucideProps>; text: string };
type Card = (Person | Trait | Verified | Activity | Badge) & { className: string; mobile?: boolean };

const CARDS: Card[] = [
  { kind: "person", initials: "AR", name: "Aarav Rao", role: "Backend engineer", tone: "var(--iris)", className: "top-[12%] left-[6%]", mobile: true },
  { kind: "person", initials: "MP", name: "Maya Patel", role: "Applied AI engineer", tone: "#EC4899", className: "top-[15%] right-[6%]", mobile: true },
  { kind: "person", initials: "DK", name: "Diego Kim", role: "Data engineer", tone: "#10B981", className: "bottom-[15%] left-[7%]" },
  { kind: "person", initials: "LC", name: "Lena Cho", role: "Frontend engineer", tone: "#3B82F6", className: "bottom-[14%] right-[7%]", mobile: true },
  { kind: "verified", label: "Verified", sub: "22-min conversation", className: "top-[13%] left-[35%]" },
  { kind: "trait", label: "Systems thinking", value: "Strong", sub: "71–88% evidenced", fill: 0.82, className: "top-[42%] left-[3%]" },
  { kind: "activity", label: "Interview activity", bars: [8, 12, 7, 15, 11, 17, 13], className: "top-[45%] right-[3%]" },
  { kind: "badge", Icon: BadgeCheck, text: "Fits 4 of 5 role signals", className: "bottom-[11%] right-[33%]", mobile: true },
  { kind: "badge", Icon: Quote, text: "Traceable to transcript", className: "top-[56%] left-[4%]" },
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
            "radial-gradient(56% 48% at 50% 46%, color-mix(in oklab, var(--hero-veil) 85%, transparent) 0%, color-mix(in oklab, var(--hero-veil) 35%, transparent) 52%, transparent 80%)",
        }}
      />

      {/* floating card field — decorative, never blocks the CTAs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {CARDS.map((card, i) => (
          <FloatCard key={i} card={card} index={i} mouseX={mouseX} mouseY={mouseY} reduce={!!reduce} />
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
          <span>Zero resume bias</span>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * One floating card: staggered scale-in, continuous drift, and cursor repulsion
 * (spring). All motion is disabled under reduced-motion, where the card fades in
 * and holds still.
 */
function FloatCard({
  card, index, mouseX, mouseY, reduce,
}: {
  card: Card;
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
    const REACH = 160;
    const onMove = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = mouseX.current - (r.left + r.width / 2);
      const dy = mouseY.current - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < REACH) {
        const angle = Math.atan2(dy, dx);
        const force = (1 - dist / REACH) * 42;
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
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute hidden md:block", card.className)}
    >
      <motion.div
        className="rounded-[16px] border px-3.5 py-2.5"
        style={{
          background: "var(--glass-hi)",
          borderColor: "var(--glass-line-hi)",
          backdropFilter: "blur(16px) saturate(1.3)",
          WebkitBackdropFilter: "blur(16px) saturate(1.3)",
          boxShadow: "0 18px 44px -20px rgba(40,26,120,0.42), inset 0 1px 0 rgba(255,255,255,0.75)",
        }}
        animate={reduce ? undefined : { y: [0, -8, 0, 8, 0], x: [0, 5, 0, -5, 0], rotate: [0, 3, 0, -3, 0] }}
        transition={reduce ? undefined : { duration: dur, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <CardBody card={card} />
      </motion.div>
    </motion.div>
  );
}

function CardBody({ card }: { card: Card }) {
  if (card.kind === "person") {
    return (
      <div className="flex items-center gap-2.5">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white"
          style={{ background: card.tone }}
        >
          {card.initials}
        </span>
        <div className="min-w-0 whitespace-nowrap pr-1">
          <p className="text-[13px] font-bold leading-tight text-[var(--ink)]">{card.name}</p>
          <p className="text-[11.5px] leading-tight text-[var(--ink-3)]">{card.role}</p>
        </div>
      </div>
    );
  }
  if (card.kind === "verified") {
    return (
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full" style={{ background: "rgba(16,185,129,0.14)", color: "#047857" }}>
          <ShieldCheck size={16} />
        </span>
        <div className="whitespace-nowrap pr-1">
          <p className="text-[13px] font-bold leading-tight" style={{ color: "#047857" }}>{card.label}</p>
          <p className="text-[11.5px] leading-tight text-[var(--ink-3)]">{card.sub}</p>
        </div>
      </div>
    );
  }
  if (card.kind === "trait") {
    return (
      <div className="w-[168px]">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[12.5px] font-bold text-[var(--ink)]">{card.label}</p>
          <p className="text-[11.5px] font-semibold text-[var(--iris-ink)]">{card.value}</p>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
          <span className="block h-full rounded-full" style={{ width: `${card.fill * 100}%`, background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} />
        </div>
        <p className="mt-1 text-[11px] text-[var(--ink-3)]">{card.sub}</p>
      </div>
    );
  }
  if (card.kind === "activity") {
    const max = Math.max(...card.bars);
    return (
      <div className="w-[150px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>{card.label}</p>
        <div className="mt-2 flex h-9 items-end gap-1">
          {card.bars.map((b, i) => (
            <span
              key={i}
              className="flex-1 rounded-[3px]"
              style={{ height: `${(b / max) * 100}%`, background: i === card.bars.length - 1 ? "var(--iris)" : "var(--iris-line)" }}
            />
          ))}
        </div>
        <p className="mt-1 text-[11px] text-[var(--ink-3)]">last 7 days</p>
      </div>
    );
  }
  // badge
  return (
    <div className="flex items-center gap-2 whitespace-nowrap pr-1">
      <span className="grid size-6 shrink-0 place-items-center rounded-full" style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}>
        <card.Icon size={13} />
      </span>
      <p className="text-[12.5px] font-bold text-[var(--ink)]">{card.text}</p>
    </div>
  );
}
