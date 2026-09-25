"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import type { ComponentProps, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { ArrowDown, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const THRESHOLD = 64;
const MAX_PULL = 110;
const INDICATOR = 44;

export type PullToRefreshProps = Omit<ComponentProps<"div">, "children" | "onDrag" | "onDragStart" | "onDragEnd"> & {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  ariaLabel?: string;
};

export function PullToRefresh({
  onRefresh,
  children,
  ariaLabel,
  className,
  ...props
}: PullToRefreshProps) {
  const reduced = useReducedMotion() ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [refreshing, setRefreshing] = useState(false);
  const dragStart = useRef<number | null>(null);

  const pull = useMotionValue(0);
  const contentY = useTransform(pull, (p) => Math.min(p, MAX_PULL) * 0.55);
  const contentStyle = useMotionTemplate`translateY(${contentY}px)`;
  const indicatorOpacity = useTransform(pull, [0, THRESHOLD * 0.6], [0, 1]);
  const indicatorScale = useTransform(pull, [0, THRESHOLD], [0.6, 1]);
  const indicatorRotate = useTransform(pull, [0, THRESHOLD * 1.4], [0, 200]);

  const settle = (to: number) => {
    if (reduced) {
      pull.set(to);
      return;
    }
    animate(pull, to, { type: "spring", stiffness: 380, damping: 32 });
  };

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (refreshing) return;
    const el = scrollRef.current;
    // Only start a pull gesture from the very top of the scroll area — a
    // mid-scroll drag is a normal scroll, not a refresh gesture.
    if (!el || el.scrollTop > 0) return;
    dragStart.current = e.clientY;
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (dragStart.current == null || refreshing) return;
    const delta = e.clientY - dragStart.current;
    if (delta <= 0) {
      pull.set(0);
      return;
    }
    // Resistance past MAX_PULL: the gesture keeps working but stops paying
    // off 1:1, so it reads as a soft limit rather than a hard wall.
    const eased = delta <= MAX_PULL ? delta : MAX_PULL + (delta - MAX_PULL) * 0.15;
    pull.set(eased);
  };

  const endDrag = async () => {
    if (dragStart.current == null) return;
    dragStart.current = null;
    const current = pull.get();
    if (current >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      settle(INDICATOR);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        settle(0);
      }
    } else {
      settle(0);
    }
  };

  return (
    <div
      data-slot="pull-to-refresh"
      aria-label={ariaLabel}
      role="region"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <motion.div
        aria-hidden
        style={{ opacity: indicatorOpacity, scale: indicatorScale }}
        className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center"
      >
        <span className="grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
          {refreshing ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <motion.span style={{ rotate: indicatorRotate }} className="flex">
              <ArrowDown size={16} />
            </motion.span>
          )}
        </span>
      </motion.div>

      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="h-full touch-pan-y overflow-y-auto"
      >
        <motion.div style={{ transform: contentStyle }}>{children}</motion.div>
      </div>
    </div>
  );
}

export default PullToRefresh;
