"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type ScanSearchProps = IconProps<keyof typeof animations>;

// The frame brackets redraw while the magnifier "scans" with a scale + tilt.
const animations = {
  default: {
    corners: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0.35, 1],
        transition: { duration: 0.5, ease: "easeInOut" },
      },
    },
    lens: {
      initial: { scale: 1, rotate: 0 },
      animate: {
        scale: [1, 1.14, 1],
        rotate: [0, -10, 0],
        transition: { duration: 0.7, ease: "easeInOut", delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

const CORNERS = [
  "M3 7V5a2 2 0 0 1 2-2h2",
  "M17 3h2a2 2 0 0 1 2 2v2",
  "M21 17v2a2 2 0 0 1-2 2h-2",
  "M7 21H5a2 2 0 0 1-2-2v-2",
];

function IconComponent({ size = 24, ...props }: ScanSearchProps) {
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
      {CORNERS.map((d) => (
        <motion.path key={d} d={d} variants={variants.corners} initial="initial" animate={controls} />
      ))}
      <motion.g
        variants={variants.lens}
        initial="initial"
        animate={controls}
        style={{ transformOrigin: "50% 50%", transformBox: "fill-box" }}
      >
        <circle cx="12" cy="12" r="3" />
        <path d="m16 16-1.9-1.9" />
      </motion.g>
    </motion.svg>
  );
}

export function ScanSearch(props: ScanSearchProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
