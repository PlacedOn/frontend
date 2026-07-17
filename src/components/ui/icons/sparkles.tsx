"use client";

import { motion, type Variants } from "motion/react";
import { getVariants, useAnimateIconContext, IconWrapper, type IconProps } from "./icon";

type SparklesProps = IconProps<keyof typeof animations>;

// The main star twinkles (rotate + scale) while the small spark blinks.
const animations = {
  default: {
    star: {
      initial: { scale: 1, rotate: 0 },
      animate: {
        scale: [1, 1.15, 1],
        rotate: [0, 18, 0],
        transition: { duration: 0.7, ease: "easeInOut" },
      },
    },
    spark: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [0.4, 1.2, 1],
        opacity: [0, 1, 1],
        transition: { duration: 0.6, ease: "easeOut", delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: SparklesProps) {
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
      <motion.path
        d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
        variants={variants.star}
        initial="initial"
        animate={controls}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
      />
      <motion.g variants={variants.spark} initial="initial" animate={controls} style={{ transformOrigin: "20px 4px", transformBox: "view-box" }}>
        <path d="M20 2v4" />
        <path d="M22 4h-4" />
      </motion.g>
      <motion.circle cx="4" cy="20" r="2" variants={variants.spark} initial="initial" animate={controls} style={{ transformOrigin: "4px 20px", transformBox: "view-box" }} />
    </motion.svg>
  );
}

export function Sparkles(props: SparklesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
