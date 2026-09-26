"use client";

import {
  animate,
  type AnimationPlaybackControls,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { SPRING_PRESS } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

type HoldStatus = "idle" | "holding" | "complete";

// How long the "Done" state lingers before the button resets — not
// caller-configurable (unlike holdDuration): it's cosmetic settle time,
// not part of the hold contract the caller is confirming against.
const COMPLETE_LINGER_MS = 1200;

export type HoldActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
> & {
  children?: ReactNode;
  type?: "horizontal" | "vertical";
  labelClassName?: string;
  holdingLabel?: ReactNode;
  completeLabel?: ReactNode;
  holdDuration?: number;
  onHoldComplete?: () => void;
  fillClassName?: string;
};

export function HoldActionButton({
  children,
  type = "vertical",
  className,
  labelClassName,
  holdingLabel = "Keep holding",
  completeLabel = "Done",
  holdDuration = 1600,
  onHoldComplete,
  fillClassName,
  ...props
}: HoldActionButtonProps) {
  const reduced = useReducedMotion() ?? false;
  const [status, setStatus] = useState<HoldStatus>("idle");
  const progress = useMotionValue(0);
  const fillTransform = useTransform(progress, (v) => v);
  const fillControls = useRef<AnimationPlaybackControls | null>(null);
  const lingerTimeout = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      fillControls.current?.stop();
      window.clearTimeout(lingerTimeout.current);
    },
    [],
  );

  const startHold = () => {
    if (status === "complete") return;
    setStatus("holding");
    fillControls.current?.stop();
    // Real-time hold gate — never shortened under reduced motion, since
    // that's the confirmation itself, not a decorative flourish.
    fillControls.current = animate(progress, 1, {
      duration: holdDuration / 1000,
      ease: "linear",
      onComplete: () => {
        setStatus("complete");
        onHoldComplete?.();
        lingerTimeout.current = window.setTimeout(() => {
          setStatus("idle");
          animate(progress, 0, { duration: 0.15 });
        }, COMPLETE_LINGER_MS);
      },
    });
  };

  const cancelHold = () => {
    if (status !== "holding") return;
    setStatus("idle");
    fillControls.current?.stop();
    fillControls.current = animate(progress, 0, reduced ? { duration: 0.08 } : SPRING_PRESS);
  };

  const label = status === "holding" ? holdingLabel : status === "complete" ? completeLabel : children;

  return (
    <motion.button
      {...props}
      type="button"
      data-status={status}
      aria-live="polite"
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      whileTap={reduced || status === "complete" ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={cn(
        "relative isolate inline-flex min-w-48 select-none items-center justify-center overflow-hidden rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <motion.span
        aria-hidden="true"
        className={cn("absolute inset-0 -z-10 bg-foreground/15", fillClassName)}
        style={
          type === "vertical"
            ? { scaleY: fillTransform, transformOrigin: "bottom" }
            : { scaleX: fillTransform, transformOrigin: "left" }
        }
      />
      <span className={cn("relative z-10 truncate", labelClassName)}>{label}</span>
    </motion.button>
  );
}

export default HoldActionButton;
