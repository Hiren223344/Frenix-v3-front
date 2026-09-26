import type { Transition } from "motion/react";

/**
 * Shared physics/timing tokens from the beUI Motion Guides
 * (https://beui.dev/docs/motion-patterns) — import these instead of
 * hand-rolling a new easing curve or spring for every component so
 * new motion stays inside the same decision framework:
 *
 *   1. Check frequency — repeated actions should feel nearly instant;
 *      save expressive motion for rare moments.
 *   2. Name the purpose — explain space, confirm input, show state,
 *      or soften a change.
 *   3. Choose the physics — EASE_OUT for entrances/exits, EASE_IN_OUT
 *      for on-screen movement, linear for progress, springs for
 *      gestures (SPRING_PRESS) and shared/layout surfaces
 *      (SPRING_LAYOUT).
 *   4. Design the fallback — reduced motion keeps opacity/color
 *      feedback and instant state changes, and drops travel, scale,
 *      parallax, and spring overshoot. Gate every transform-bearing
 *      `initial`/`animate`/`exit`/`whileTap`/`whileHover` behind
 *      `useReducedMotion()`, the way every component under
 *      src/components/motion and src/components/ui already does.
 */

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.45, 0, 0.55, 1] as const;
// The standard "drawer" deceleration curve (also used by Vaul/shadcn's
// Sheet) — for a panel sliding in/out along an edge, where EASE_OUT reads
// as slightly too snappy for something that large.
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export const SPRING_PRESS: Transition = { type: "spring", stiffness: 500, damping: 30 };
export const SPRING_LAYOUT: Transition = { type: "spring", stiffness: 340, damping: 34 };

/**
 * Default interface-motion durations (seconds), from the guide's timing
 * table — for motion that repeats on every press, popover, dropdown, or
 * modal open. Marketing/demo motion and rare, expressive gestures (a
 * destructive confirm, a hero reveal) are exempt; those earn their own
 * longer, one-off timing.
 */
export const DURATION = {
  press: 0.14,
  popover: 0.16,
  dropdown: 0.2,
  modal: 0.35,
} as const;
