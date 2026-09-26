"use client";

import { ArrowRight } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { SPRING_PRESS } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

const THUMB_INSET = 4;

export type SlideActionButtonProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onComplete"> & {
  children?: ReactNode;
  completeLabel?: ReactNode;
  threshold?: number;
  resetDelay?: number;
  onComplete?: () => void;
  thumbClassName?: string;
  fillClassName?: string;
};

export function SlideActionButton({
  children,
  completeLabel = "Complete",
  threshold = 0.82,
  resetDelay = 1200,
  onComplete,
  thumbClassName,
  fillClassName,
  className,
  ...props
}: SlideActionButtonProps) {
  const reduced = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(false);
  const [maxDrag, setMaxDrag] = useState(0);
  const x = useMotionValue(0);
  const resetTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current?.offsetWidth ?? 0;
      const thumb = thumbRef.current?.offsetWidth ?? 0;
      setMaxDrag(Math.max(track - thumb - THUMB_INSET * 2, 0));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => () => window.clearTimeout(resetTimeout.current), []);

  const fillWidth = useTransform(x, (v) => v + (thumbRef.current?.offsetWidth ?? 0) + THUMB_INSET * 2);

  const finish = (didComplete: boolean) => {
    if (didComplete) {
      animate(x, maxDrag, reduced ? { duration: 0.08 } : SPRING_PRESS);
      setCompleted(true);
      onComplete?.();
      resetTimeout.current = window.setTimeout(() => {
        setCompleted(false);
        animate(x, 0, reduced ? { duration: 0.08 } : SPRING_PRESS);
      }, resetDelay);
      return;
    }
    animate(x, 0, reduced ? { duration: 0.08 } : SPRING_PRESS);
  };

  return (
    <div
      {...props}
      ref={trackRef}
      className={cn(
        "relative h-14 w-72 max-w-full select-none overflow-hidden rounded-full border border-border bg-card",
        className,
      )}
    >
      <motion.div aria-hidden="true" className={cn("absolute inset-y-0 left-0 bg-foreground/10", fillClassName)} style={{ width: fillWidth }} />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-14 text-center text-sm font-medium text-muted-foreground">
        {completed ? completeLabel : children}
      </span>
      <motion.div
        ref={thumbRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={maxDrag > 0 ? Math.round((x.get() / maxDrag) * 100) : 0}
        aria-label={typeof children === "string" ? children : "Slide to confirm"}
        drag={completed ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.04}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => {
          const fraction = maxDrag > 0 ? x.get() / maxDrag : 0;
          finish(fraction >= threshold);
        }}
        whileTap={reduced || completed ? undefined : { scale: 0.96 }}
        transition={SPRING_PRESS}
        className={cn(
          "absolute top-1 bottom-1 left-1 grid aspect-square cursor-grab place-items-center rounded-full bg-foreground text-background shadow-sm active:cursor-grabbing",
          thumbClassName,
        )}
      >
        <ArrowRight size={16} />
      </motion.div>
    </div>
  );
}

export default SlideActionButton;
