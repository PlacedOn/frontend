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
      <motion.path d={"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"} variants={variants.e0} initial="initial" animate={controls} />
      <motion.path d={"M16 3.128a4 4 0 0 1 0 7.744"} variants={variants.e1} initial="initial" animate={controls} />
      <motion.path d={"M22 21v-2a4 4 0 0 0-3-3.87"} variants={variants.e2} initial="initial" animate={controls} />
      <motion.circle cx={"9"} cy={"7"} r={"4"} variants={variants.e3} initial="initial" animate={controls} />
    </motion.svg>
  );
}

export function Users(props: Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
