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
      <motion.path d={"M5 12h14"} variants={variants.e0} initial="initial" animate={controls} />
      <motion.path d={"M12 5v14"} variants={variants.e1} initial="initial" animate={controls} />
    </motion.svg>
  );
}

export function Plus(props: Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
