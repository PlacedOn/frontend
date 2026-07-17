"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { x: 0 },
      animate: { x: [0, "-22%", 0], transition: { duration: 0.5, ease: "easeInOut" } },
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <path d={"m15 18-6-6 6-6"} />
      </motion.g>
    </motion.svg>
  );
}

export function ChevronLeft(props: Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
