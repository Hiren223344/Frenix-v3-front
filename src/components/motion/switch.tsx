"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { SPRING_PRESS } from "@/lib/motion-tokens";

export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
  className?: string;
};

// Track/thumb geometry in px — kept as plain numbers (not Tailwind classes
// alone) since the thumb's x offset has to match them exactly for the
// spring animation to land flush against each end of the track.
const TRACK_WIDTH = 40;
const TRACK_PADDING = 3;
const THUMB_SIZE = 18;

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  ariaLabel,
  className,
}: SwitchProps) {
  const reduced = useReducedMotion() ?? false;
  const thumbX = checked ? TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING : TRACK_PADDING;

  const track = (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={!label ? ariaLabel : undefined}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      whileTap={disabled || reduced ? undefined : { scale: 0.94 }}
      transition={SPRING_PRESS}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-foreground" : "bg-muted",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <motion.span
        aria-hidden="true"
        className="block rounded-full bg-background shadow-sm"
        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
        animate={{ x: thumbX }}
        transition={reduced ? { duration: 0 } : SPRING_PRESS}
      />
    </motion.button>
  );

  if (!label) return track;

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2.5 text-sm text-foreground",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      {track}
      <span>{label}</span>
    </label>
  );
}

export default Switch;
