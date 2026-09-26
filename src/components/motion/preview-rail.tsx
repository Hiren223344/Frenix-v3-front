"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";

import { SPRING_LAYOUT, SPRING_PRESS } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

export type PreviewRailItem = {
  id: string;
  label: string;
  description?: string;
  href?: string;
  /** Internal route — not part of the beUI spec, added for react-router use. */
  to?: string;
};

export type PreviewRailProps = {
  items: PreviewRailItem[];
  label?: string;
  orientation?: "horizontal" | "vertical";
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string) => void;
  onItemSelect?: (item: PreviewRailItem) => void;
  renderPreview?: (item: PreviewRailItem) => ReactNode;
  showPreview?: boolean;
  previewSide?: "before" | "after";
  highlightActive?: boolean;
  itemSize?: number;
  className?: string;
  railClassName?: string;
  previewContainerClassName?: string;
  previewClassName?: string;
};

// How far (in item-slots) the magnification reaches, and how large the
// nearest tick grows — the classic macOS Dock formula: distance maps
// through a smoothstep falloff so the "pyramid" has a rounded peak
// instead of a cone, then scales the tick between 1x and MAX_SCALE.
const MAGNIFY_RADIUS_FACTOR = 2.4;
const MAX_SCALE = 2.2;

function magnifyScale(distance: number, itemSize: number) {
  const radius = itemSize * MAGNIFY_RADIUS_FACTOR;
  if (distance >= radius) return 1;
  const t = 1 - distance / radius;
  const eased = t * t * (3 - 2 * t);
  return 1 + (MAX_SCALE - 1) * eased;
}

export function PreviewRail({
  items,
  label = "Section navigation",
  orientation = "vertical",
  activeId,
  defaultActiveId,
  onActiveChange,
  onItemSelect,
  renderPreview,
  showPreview = true,
  previewSide = "after",
  highlightActive = false,
  itemSize = 24,
  className,
  railClassName,
  previewContainerClassName,
  previewClassName,
}: PreviewRailProps) {
  const reduced = useReducedMotion() ?? false;
  const vertical = orientation === "vertical";

  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId ?? items[0]?.id);
  const isControlled = activeId !== undefined;
  const currentActiveId = isControlled ? activeId : internalActiveId;

  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const setActive = (id: string) => {
    if (!isControlled) setInternalActiveId(id);
    onActiveChange?.(id);
  };

  const select = (item: PreviewRailItem) => {
    setActive(item.id);
    onItemSelect?.(item);
  };

  // Position tracking stays live under reduced motion too — the floating
  // preview is informational (which section is this?), not decorative, so
  // only the magnify *scale* itself (a transform/travel effect) gets
  // dropped below.
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverPos(vertical ? event.clientY - rect.top : event.clientX - rect.left);
  };

  const closestIndex = useMemo(() => {
    if (hoverPos == null || items.length === 0) return null;
    let closest = 0;
    let closestDist = Infinity;
    items.forEach((_, i) => {
      const center = i * itemSize + itemSize / 2;
      const d = Math.abs(hoverPos - center);
      if (d < closestDist) {
        closestDist = d;
        closest = i;
      }
    });
    return closest;
  }, [hoverPos, items, itemSize]);

  const previewItem = closestIndex != null ? items[closestIndex] : null;
  const previewCenter = closestIndex != null ? closestIndex * itemSize + itemSize / 2 : 0;

  return (
    <div
      className={cn(
        "relative inline-flex",
        vertical ? "flex-row items-start" : "flex-col items-start",
        className,
      )}
    >
      <div
        ref={railRef}
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverPos(null)}
        className={cn(
          "relative flex gap-0 rounded-full border border-border bg-card p-2",
          vertical ? "flex-col" : "flex-row",
          railClassName,
        )}
      >
        {items.map((item, i) => {
          const center = i * itemSize + itemSize / 2;
          const distance = hoverPos == null ? Infinity : Math.abs(hoverPos - center);
          const scale = reduced ? 1 : magnifyScale(distance, itemSize);
          const isActive = item.id === currentActiveId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              onClick={() => select(item)}
              onFocus={() => setHoverPos(center)}
              onBlur={() => setHoverPos(null)}
              style={vertical ? { height: itemSize } : { width: itemSize }}
              className={cn(
                "relative flex shrink-0 items-center justify-center outline-none",
                vertical ? "w-full" : "h-full",
              )}
            >
              <motion.span
                aria-hidden="true"
                animate={{ scale }}
                transition={reduced ? { duration: 0 } : SPRING_PRESS}
                className={cn(
                  "rounded-full bg-muted-foreground/50",
                  vertical ? "h-[3px] w-4" : "h-4 w-[3px]",
                  isActive && highlightActive && "bg-foreground",
                )}
              />
            </button>
          );
        })}
      </div>

      {showPreview && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute z-10",
            vertical
              ? previewSide === "after"
                ? "left-full top-0 ml-3"
                : "right-full top-0 mr-3"
              : previewSide === "after"
                ? "left-0 top-full mt-3"
                : "left-0 bottom-full mb-3",
            previewContainerClassName,
          )}
        >
          <AnimatePresence>
            {previewItem && (
              <motion.div
                key={previewItem.id}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  ...(vertical ? { top: previewCenter } : { left: previewCenter }),
                }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                transition={reduced ? { duration: 0.1 } : SPRING_LAYOUT}
                style={
                  vertical
                    ? { position: "absolute", translateY: "-50%" }
                    : { position: "absolute", translateX: "-50%" }
                }
                className={cn(
                  "w-max max-w-64 rounded-xl border border-border bg-popover px-3.5 py-2.5 shadow-lg",
                  previewClassName,
                )}
              >
                {renderPreview ? (
                  renderPreview(previewItem)
                ) : (
                  <>
                    <div className="text-sm font-medium text-foreground">{previewItem.label}</div>
                    {previewItem.description && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{previewItem.description}</div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default PreviewRail;
