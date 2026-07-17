"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type MicProps = IconProps<keyof typeof animations>;

// The capsule lifts a touch while the pickup arc pulses, as if catching sound.
const animations = {
  default: {
    capsule: {
      initial: { y: 0 },
      animate: { y: [0, -1.5, 0], transition: { duration: 0.7, ease: "easeInOut" } },
    },
    arc: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 1.12, 1],
        opacity: [1, 0.7, 1],
        transition: { duration: 0.7, ease: "easeInOut" },
      },
    },
    stand: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: MicProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.rect
        x="9"
        y="2"
        width="6"
        height="13"
        rx="3"
        variants={variants.capsule}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 10v2a7 7 0 0 1-14 0v-2"
        variants={variants.arc}
        initial="initial"
        animate={controls}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
      />
      <motion.path d="M12 19v3" variants={variants.stand} initial="initial" animate={controls} />
    </motion.svg>
  );
}

export function Mic(props: MicProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
