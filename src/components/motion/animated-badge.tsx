"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, Check, Circle, LoaderCircle, Radio, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type AnimatedBadgeStatus =
  | "neutral"
  | "info"
  | "loading"
  | "success"
  | "warning"
  | "danger";

const STATUS_STYLES: Record<AnimatedBadgeStatus, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  loading: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
};

// Every status keeps a dot present (loading spins it, the rest just swap the
// glyph) so the pill never resizes when it changes status.
const STATUS_ICON: Record<AnimatedBadgeStatus, typeof Circle> = {
  neutral: Circle,
  info: Radio,
  loading: LoaderCircle,
  success: Check,
  warning: AlertTriangle,
  danger: X,
};

const SIZE_STYLES = {
  sm: "h-6 gap-1 px-2 text-[11px]",
  md: "h-7 gap-1.5 px-2.5 text-xs",
} as const;

const ICON_SIZE = { sm: 11, md: 13 } as const;

export type AnimatedBadgeProps = Omit<ComponentProps<"span">, "children"> & {
  status?: AnimatedBadgeStatus;
  size?: keyof typeof SIZE_STYLES;
  children?: ReactNode;
};

export function AnimatedBadge({
  status = "neutral",
  size = "md",
  className,
  children,
  ...props
}: AnimatedBadgeProps) {
  const reduced = useReducedMotion() ?? false;
  const Icon = STATUS_ICON[status];

  return (
    <span
      data-slot="animated-badge"
      data-status={status}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        STATUS_STYLES[status],
        SIZE_STYLES[size],
        className,
      )}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={reduced ? undefined : { opacity: 0, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="inline-flex shrink-0 items-center justify-center"
        >
          <Icon
            size={ICON_SIZE[size]}
            className={status === "loading" ? "animate-spin" : undefined}
          />
        </motion.span>
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={typeof children === "string" ? children : status}
          initial={reduced ? undefined : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default AnimatedBadge;
