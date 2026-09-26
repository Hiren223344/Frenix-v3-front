"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ElementType, PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";
import { forwardRef, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { SPRING_LAYOUT } from "@/lib/motion-tokens";

// A generic "sliding highlight" background: hovering any direct child of
// the rendered element measures that child's rect and glides a single pill
// behind it; the pill disappears once the pointer leaves. No per-item
// registration needed — it works by walking up from the pointer event's
// target to the nearest direct child of this container, so any markup
// (nav items, tabs, list rows, ...) gets the effect for free by rendering
// inside it. Purely a hover affordance: an *active*/selected item's own
// steady highlight (if it wants one) is that item's own concern — see
// AnimatedSidebarMenuButton's separate layoutId pill for the sidebar's.
type Rect = { top: number; left: number; width: number; height: number };

export type SharedLayoutBgProps = {
  as?: ElementType;
  inset?: number;
  pillClassName?: string;
  pillContainerClassName?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

export const SharedLayoutBg = forwardRef(function SharedLayoutBg(
  {
    as: Component = "div",
    inset = 0,
    pillClassName,
    pillContainerClassName,
    className,
    children,
    onPointerOver,
    onPointerLeave,
    style,
    ...props
  }: SharedLayoutBgProps & { style?: CSSProperties },
  forwardedRef: Ref<HTMLElement>,
) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const reduced = useReducedMotion() ?? false;

  const measure = (target: HTMLElement) => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setRect({
      top: targetRect.top - containerRect.top,
      left: targetRect.left - containerRect.left,
      width: targetRect.width,
      height: targetRect.height,
    });
  };

  const handlePointerOver = (event: ReactPointerEvent<HTMLElement>) => {
    (onPointerOver as ((e: ReactPointerEvent<HTMLElement>) => void) | undefined)?.(event);
    const container = containerRef.current;
    if (!container) return;
    // Walk up from whatever was actually hovered to the direct child of
    // this container it lives inside — items can be arbitrarily nested
    // markup (an icon inside a button inside a list item).
    let node = event.target as HTMLElement | null;
    while (node && node.parentElement !== container) node = node.parentElement;
    if (node) measure(node);
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    (onPointerLeave as ((e: ReactPointerEvent<HTMLElement>) => void) | undefined)?.(event);
    setRect(null);
  };

  return (
    <Component
      {...props}
      ref={(node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) (forwardedRef as { current: HTMLElement | null }).current = node;
      }}
      onPointerOver={handlePointerOver}
      onPointerLeave={handlePointerLeave}
      style={{ position: "relative", ...style }}
      className={className}
    >
      <div
        aria-hidden="true"
        className={cn(inset === 0 && "absolute inset-0", "pointer-events-none", pillContainerClassName)}
      >
        <AnimatePresence>
          {rect && (
            <motion.div
              key="shared-layout-bg-pill"
              initial={false}
              animate={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : SPRING_LAYOUT}
              className={cn("absolute", pillClassName)}
            />
          )}
        </AnimatePresence>
      </div>
      {children}
    </Component>
  );
});

export default SharedLayoutBg;
