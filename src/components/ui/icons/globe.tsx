"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type GlobeProps = IconProps<keyof typeof animations>;

// The meridian flexes through zero, reading as the globe turning on its axis.
const animations = {
  default: {
    sphere: {},
    meridian: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, -1, 1],
        transition: { duration: 1.4, ease: "easeInOut" },
      },
    },
    equator: {
      initial: { opacity: 1 },
      animate: { opacity: [1, 0.4, 1], transition: { duration: 1.4, ease: "easeInOut" } },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: GlobeProps) {
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
      <motion.circle cx="12" cy="12" r="10" variants={variants.sphere} initial="initial" animate={controls} />
      <motion.path
        d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
        variants={variants.meridian}
        initial="initial"
        animate={controls}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
      />
      <motion.path d="M2 12h20" variants={variants.equator} initial="initial" animate={controls} />
    </motion.svg>
  );
}

export function Globe(props: GlobeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
