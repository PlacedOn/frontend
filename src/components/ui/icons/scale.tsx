"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type ScaleProps = IconProps<keyof typeof animations>;

// The balance tips and settles around its top pivot — weighing evidence.
const animations = {
  default: {
    balance: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, -6, 5, -2, 0],
        transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.3, 0.55, 0.8, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: ScaleProps) {
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
      <motion.g
        variants={variants.balance}
        initial="initial"
        animate={controls}
        style={{ transformOrigin: "12px 4px", transformBox: "view-box" }}
      >
        <path d="M12 3v18" />
        <path d="m19 8 3 8a5 5 0 0 1-6 0zV7" />
        <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" />
        <path d="m5 8 3 8a5 5 0 0 1-6 0zV7" />
        <path d="M7 21h10" />
      </motion.g>
    </motion.svg>
  );
}

export function Scale(props: ScaleProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
