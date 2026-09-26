"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { EASE_OUT, SPRING_PRESS } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

export type ExpandingArrowButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
> & {
  children?: ReactNode;
  accentClassName?: string;
  labelClassName?: string;
};

const DOTS = [0, 1, 2];

const containerVariants: Variants = {
  rest: {},
  active: { transition: { staggerChildren: 0.05 } },
};

const dotVariants: Variants = {
  rest: { opacity: 0, scale: 0.4, x: -4 },
  active: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.18, ease: EASE_OUT } },
};

const arrowVariants: Variants = {
  rest: { x: -6, opacity: 0.6 },
  active: { x: 0, opacity: 1, transition: { duration: 0.22, ease: EASE_OUT } },
};

export function ExpandingArrowButton({
  children,
  className,
  accentClassName,
  labelClassName,
  type = "button",
  ...props
}: ExpandingArrowButtonProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.button
      {...props}
      type={type}
      initial="rest"
      whileHover="active"
      whileFocus="active"
      animate="rest"
      variants={reduced ? undefined : containerVariants}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={SPRING_PRESS}
      className={cn(
        "group inline-flex items-center gap-3 overflow-hidden rounded-full bg-foreground py-3 pl-3 pr-5 text-sm font-medium text-background outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-background/15", accentClassName)}
      >
        <span className="block size-1.5 rounded-full bg-background" />
      </span>
      <span className={cn("whitespace-nowrap", labelClassName)}>{children}</span>
      <span aria-hidden="true" className="flex shrink-0 items-center gap-1">
        {DOTS.map((i) => (
          <motion.span
            key={i}
            variants={reduced ? undefined : dotVariants}
            className="block size-1 shrink-0 rounded-full bg-background"
          />
        ))}
        <motion.span variants={reduced ? undefined : arrowVariants} className="flex shrink-0 items-center">
          <ArrowRight size={14} />
        </motion.span>
      </span>
    </motion.button>
  );
}

export default ExpandingArrowButton;
