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
      <motion.path d={"M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9"} variants={variants.e0} initial="initial" animate={controls} />
      <motion.path d={"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"} variants={variants.e1} initial="initial" animate={controls} />
      <motion.path d={"m17 17 4 4"} variants={variants.e2} initial="initial" animate={controls} />
      <motion.path d={"m21 17-4 4"} variants={variants.e3} initial="initial" animate={controls} />
    </motion.svg>
  );
}

export function MailX(props: Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
