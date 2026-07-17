"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type CheckProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.35, ease: "easeInOut", opacity: { duration: 0.01 } },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: CheckProps) {
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
      <motion.path d="M20 6 9 17l-5-5" variants={variants.path} initial="initial" animate={controls} />
    </motion.svg>
  );
}

export function Check(props: CheckProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
