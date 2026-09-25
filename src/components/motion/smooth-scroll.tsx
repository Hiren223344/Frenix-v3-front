"use client";

import { animate, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

type ScrollTarget = { scrollTo: (y: number) => void };

const SmoothScrollContext = createContext<ScrollTarget | null>(null);

/** Outside a <SmoothScroll>, falls back to the window/document scroller. */
export function useSmoothScroll(): ScrollTarget {
  const ctx = useContext(SmoothScrollContext);
  return useMemo(
    () =>
      ctx ?? {
        scrollTo: (y: number) => window.scrollTo({ top: y, behavior: "smooth" }),
      },
    [ctx],
  );
}

export type SmoothScrollProps = Omit<ComponentProps<"div">, "children"> & {
  children: ReactNode;
  /** true (default): smooth-scrolls the whole page's window. false: this element scrolls itself (needs its own height + overflow-y). */
  root?: boolean;
};

// A light inertial-scroll layer: real wheel/touch input still drives the
// browser's own scrollbar (so native scrollbars, scroll anchoring and
// keyboard/accessibility scrolling all keep working) — this only takes over
// to ease *programmatic* jumps (useSmoothScroll().scrollTo) so they glide
// instead of snapping, and softens the release of a wheel gesture into a
// short decel rather than stopping dead on the last tick.
export function SmoothScroll({ children, root = true, className, ...props }: SmoothScrollProps) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const velocity = useRef(0);
  const lastWheelAt = useRef(0);
  const coasting = useRef<ReturnType<typeof animate> | null>(null);

  const getScroller = (): { get: () => number; set: (y: number) => void; max: () => number } => {
    if (root) {
      return {
        get: () => window.scrollY,
        set: (y) => window.scrollTo(0, y),
        max: () => document.documentElement.scrollHeight - window.innerHeight,
      };
    }
    const el = ref.current!;
    return {
      get: () => el.scrollTop,
      set: (y) => {
        el.scrollTop = y;
      },
      max: () => el.scrollHeight - el.clientHeight,
    };
  };

  const scrollTo = (y: number) => {
    coasting.current?.stop();
    const scroller = getScroller();
    const clamped = Math.max(0, Math.min(y, scroller.max()));
    if (reduced) {
      scroller.set(clamped);
      return;
    }
    const proxy = { y: scroller.get() };
    coasting.current = animate(proxy, { y: clamped }, {
      type: "spring",
      stiffness: 260,
      damping: 34,
      onUpdate: (v) => scroller.set(v.y),
    });
  };

  useEffect(() => {
    if (reduced) return;
    const target: HTMLElement | Window = root ? window : ref.current!;

    const onWheel = (e: WheelEvent) => {
      velocity.current = e.deltaY;
      lastWheelAt.current = performance.now();
    };
    const onWheelEnd = () => {
      // A wheel gesture stops sending events the instant the user lifts off
      // — coast the last-known velocity out over a short decel so the stop
      // reads as inertia rather than a hard cut.
      const idleFor = performance.now() - lastWheelAt.current;
      if (idleFor > 40 || Math.abs(velocity.current) < 4) return;
      const scroller = getScroller();
      const from = scroller.get();
      const distance = velocity.current * 4;
      const clamped = Math.max(0, Math.min(from + distance, scroller.max()));
      coasting.current?.stop();
      coasting.current = animate({ y: from }, { y: clamped }, {
        type: "spring",
        stiffness: 90,
        damping: 26,
        onUpdate: (v) => scroller.set(v.y),
      });
    };
    const timer = setInterval(() => {
      if (performance.now() - lastWheelAt.current > 60 && velocity.current !== 0) {
        onWheelEnd();
        velocity.current = 0;
      }
    }, 60);

    target.addEventListener("wheel", onWheel as EventListener, { passive: true });
    return () => {
      target.removeEventListener("wheel", onWheel as EventListener);
      clearInterval(timer);
      coasting.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, root]);

  const content = root ? (
    children
  ) : (
    <div ref={ref} data-slot="smooth-scroll" className={cn("overscroll-contain", className)} {...props}>
      {children}
    </div>
  );

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>{content}</SmoothScrollContext.Provider>
  );
}

export default SmoothScroll;
