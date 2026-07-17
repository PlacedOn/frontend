"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: { rotate: [0, 180], transition: { duration: 0.7, ease: "easeInOut" } },
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
      <motion.g variants={variants.group} initial="initial" animate={controls} style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}>
        <path d={"M12 6v12"} />
        <path d={"M17.196 9 6.804 15"} />
        <path d={"m6.804 9 10.392 6"} />
      </motion.g>
    </motion.svg>
  );
}

export function Asterisk(props: Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
