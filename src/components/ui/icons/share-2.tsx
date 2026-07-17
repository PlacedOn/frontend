"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type Share2Props = IconProps<keyof typeof animations>;

// Connecting lines draw between nodes, then the nodes pulse — a "share" pop.
const animations = {
  default: {
    line: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: "easeInOut", opacity: { duration: 0.01 } },
      },
    },
    node: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.28, 1],
        transition: { duration: 0.45, ease: "easeOut", delay: 0.25 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

const NODES: Array<[number, number]> = [
  [18, 5],
  [6, 12],
  [18, 19],
];

function IconComponent({ size = 24, ...props }: Share2Props) {
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
      <motion.line
        x1="8.59"
        x2="15.42"
        y1="13.51"
        y2="17.49"
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="15.41"
        x2="8.59"
        y1="6.51"
        y2="10.49"
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
      {NODES.map(([cx, cy]) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="3"
          variants={variants.node}
          initial="initial"
          animate={controls}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
    </motion.svg>
  );
}

export function Share2(props: Share2Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
