"use client";

/*
 * Animated-icon primitive — adapted from animate-ui (imskyleen/animate-ui) to
 * this codebase. Lucide-shaped SVGs animated with Motion. A parent AnimateIcon
 * (or per-icon trigger props) drives shared `controls`; each icon reads the
 * active variant via context and plays it on hover, tap, in-view, or command.
 *
 * Differences from upstream: no Radix Slot / workspace deps — we always render a
 * lightweight motion.span wrapper, use motion's own useInView, and short-circuit
 * under prefers-reduced-motion so icons rest in their complete (initial) state.
 */

import * as React from "react";
import {
  motion,
  useAnimation,
  useInView,
  useReducedMotion,
  type Variants,
  type SVGMotionProps,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/cn";

const staticAnimations = {
  path: {
    initial: { pathLength: 1 },
    animate: { pathLength: [0.05, 1], transition: { duration: 0.8, ease: "easeInOut" } },
  } as Variants,
  "path-loop": {
    initial: { pathLength: 1 },
    animate: { pathLength: [1, 0.05, 1], transition: { duration: 1.6, ease: "easeInOut" } },
  } as Variants,
} as const;

type StaticAnimations = keyof typeof staticAnimations;
type Trigger = boolean | string;

type AnimateIconContextValue = {
  controls: ReturnType<typeof useAnimation> | undefined;
  animation: string;
};

const AnimateIconContext = React.createContext<AnimateIconContextValue | null>(null);

function useAnimateIconContext(): AnimateIconContextValue {
  return React.useContext(AnimateIconContext) ?? { controls: undefined, animation: "default" };
}

type DefaultIconProps<T = string> = {
  animate?: boolean | T | StaticAnimations;
  animateOnHover?: boolean | T | StaticAnimations;
  animateOnTap?: boolean | T | StaticAnimations;
  animateOnView?: boolean | T | StaticAnimations;
  animateOnViewOnce?: boolean;
  animation?: T | StaticAnimations;
  loop?: boolean;
  loopDelay?: number;
  delay?: number;
};

type IconProps<T = string> = DefaultIconProps<T> &
  Omit<SVGMotionProps<SVGSVGElement>, "animate"> & { size?: number };

type IconWrapperProps<T> = IconProps<T> & {
  icon: React.ComponentType<IconProps<T>>;
};

type AnimateIconProps = HTMLMotionProps<"span"> &
  DefaultIconProps & { children: React.ReactNode };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function AnimateIcon({
  children,
  animate = false,
  animateOnHover = false,
  animateOnTap = false,
  animateOnView = false,
  animateOnViewOnce = true,
  animation = "default",
  loop = false,
  loopDelay = 0,
  delay = 0,
  style,
  ...props
}: AnimateIconProps) {
  const controls = useAnimation();
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: animateOnViewOnce, amount: 0.5 });

  const keyOf = React.useCallback(
    (t: Trigger): string => (typeof t === "string" ? t : (animation as string)),
    [animation],
  );

  const [current, setCurrent] = React.useState<string>(
    typeof animate === "string" ? animate : (animation as string),
  );
  const [active, setActive] = React.useState<boolean>(
    animate === true || typeof animate === "string",
  );
  // Bumped on every start so re-triggering (e.g. hover after an in-view play)
  // replays the animation even though `active` is already true.
  const [runId, setRunId] = React.useState(0);
  const activeRef = React.useRef(active);
  activeRef.current = active;

  const start = React.useCallback(
    (t: Trigger) => {
      setCurrent(keyOf(t));
      setActive(true);
      setRunId((n) => n + 1);
    },
    [keyOf],
  );
  const stop = React.useCallback(() => setActive(false), []);

  // Controlled `animate` prop.
  React.useEffect(() => {
    if (animate === false || animate === undefined) {
      setActive(false);
      return;
    }
    start(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  // In-view trigger.
  React.useEffect(() => {
    if (!animateOnView) return;
    if (inView) start(animateOnView);
    else if (!animateOnViewOnce) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, animateOnView]);

  // Runner — plays "animate" (optionally looping) then rests; "initial" when idle.
  React.useEffect(() => {
    if (reduce) return; // rest in the complete (initial) state
    let cancelled = false;
    const run = async () => {
      if (!active) {
        try {
          await controls.start("initial");
        } catch {
          /* interrupted */
        }
        return;
      }
      if (delay > 0) {
        await wait(delay);
        if (cancelled) return;
      }
      do {
        if (loop) controls.set("initial");
        try {
          await controls.start("animate");
        } catch {
          return;
        }
        if (cancelled || !loop || !activeRef.current) break;
        if (loopDelay > 0) {
          await wait(loopDelay);
          if (cancelled) return;
        }
      } while (!cancelled && loop && activeRef.current);
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, controls, reduce]);

  const onEnter = () => animateOnHover && start(animateOnHover);
  const onLeave = () => (animateOnHover || animateOnTap) && stop();
  const onDown = () => animateOnTap && start(animateOnTap);
  const onUp = () => animateOnTap && stop();

  // Springy micro-pop on interaction — applies to the whole wrapper so every
  // animated glyph feels alive on hover/tap without per-icon edits. Skipped
  // under reduced motion. Only armed when a hover/tap trigger is present.
  const canPop = !reduce && (Boolean(animateOnHover) || Boolean(animateOnTap));
  const pop = canPop
    ? {
        whileHover: animateOnHover ? { scale: 1.12 } : undefined,
        whileTap: { scale: 0.9 },
        transition: { type: "spring" as const, stiffness: 520, damping: 16, mass: 0.5 },
      }
    : {};

  return (
    <AnimateIconContext.Provider value={{ controls, animation: current }}>
      <motion.span
        ref={ref}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onPointerDown={onDown}
        onPointerUp={onUp}
        style={{ display: "inline-flex", ...style }}
        {...pop}
        {...props}
      >
        {children}
      </motion.span>
    </AnimateIconContext.Provider>
  );
}

function IconWrapper<T extends string>({
  size = 24,
  animation,
  animate,
  animateOnHover,
  animateOnTap,
  animateOnView,
  animateOnViewOnce,
  loop,
  loopDelay,
  delay,
  icon: IconComponent,
  className,
  ...props
}: IconWrapperProps<T>) {
  const parent = React.useContext(AnimateIconContext);
  const hasTrigger =
    animate !== undefined ||
    animateOnHover !== undefined ||
    animateOnTap !== undefined ||
    animateOnView !== undefined;

  // Inherit a parent AnimateIcon's controls when no local trigger is set.
  if (parent && !hasTrigger) {
    return (
      <AnimateIconContext.Provider
        value={{ controls: parent.controls, animation: (animation as string) ?? parent.animation }}
      >
        <IconComponent size={size} className={className} {...props} />
      </AnimateIconContext.Provider>
    );
  }

  if (hasTrigger) {
    return (
      <AnimateIcon
        animate={animate}
        animateOnHover={animateOnHover}
        animateOnTap={animateOnTap}
        animateOnView={animateOnView}
        animateOnViewOnce={animateOnViewOnce}
        animation={animation as string}
        loop={loop}
        loopDelay={loopDelay}
        delay={delay}
      >
        <IconComponent size={size} className={className} {...props} />
      </AnimateIcon>
    );
  }

  return <IconComponent size={size} className={className} {...props} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getVariants<V extends { default: Record<string, Variants> }>(animations: V): any {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { animation } = useAnimateIconContext();

  if (animation in staticAnimations) {
    const variant = staticAnimations[animation as StaticAnimations];
    const result: Record<string, Variants> = {};
    for (const key in animations.default) {
      if (key.includes("group")) continue;
      result[key] = variant;
    }
    return result;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (animations as any)[animation] ?? animations.default;
}

export {
  cn,
  staticAnimations,
  AnimateIcon,
  IconWrapper,
  useAnimateIconContext,
  getVariants,
  type IconProps,
  type IconWrapperProps,
  type AnimateIconProps,
};
