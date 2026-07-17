"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    e0: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, delay: 0.00, ease: "easeInOut", opacity: { duration: 0.01 } },
      },
    },
    e1: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, delay: 0.07, ease: "easeInOut", opacity: { duration: 0.01 } },
      },
    },
    e2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, delay: 0.14, ease: "easeInOut", opacity: { duration: 0.01 } },
      },
    },
    e3: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, delay: 0.21, ease: "easeInOut", opacity: { duration: 0.01 } },
      },
    },
    e4: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, delay: 0.28, ease: "easeInOut", opacity: { duration: 0.01 } },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: Props) {
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
      <motion.circle cx={"16"} cy={"4"} r={"1"} variants={variants.e0} initial="initial" animate={controls} />
      <motion.path d={"m18 19 1-7-6 1"} variants={variants.e1} initial="initial" animate={controls} />
      <motion.path d={"m5 8 3-3 5.5 3-2.36 3.5"} variants={variants.e2} initial="initial" animate={controls} />
      <motion.path d={"M4.24 14.5a5 5 0 0 0 6.88 6"} variants={variants.e3} initial="initial" animate={controls} />
      <motion.path d={"M13.76 17.5a5 5 0 0 0-6.88-6"} variants={variants.e4} initial="initial" animate={controls} />
    </motion.svg>
  );
}

export function Accessibility(props: Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
