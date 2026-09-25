"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { SPRING_LAYOUT } from "@/lib/motion-tokens";

export type BouncyAccordionItem = {
  id: string;
  title: string;
  description: ReactNode;
  icon?: ReactNode;
};

export type BouncyAccordionClassNames = {
  root?: string;
  item?: string;
  trigger?: string;
  content?: string;
};

export type BouncyAccordionProps = {
  items: BouncyAccordionItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Clicking the open item's trigger closes it. Default true. */
  collapsible?: boolean;
  className?: string;
  classNames?: BouncyAccordionClassNames;
};

export function BouncyAccordion({
  items,
  value,
  defaultValue = null,
  onValueChange,
  collapsible = true,
  className,
  classNames,
}: BouncyAccordionProps) {
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
  const isControlled = value !== undefined;
  const openId = isControlled ? value : internalValue;

  const setOpenId = useCallback(
    (next: string | null) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const toggle = (id: string) => {
    if (id === openId) {
      if (collapsible) setOpenId(null);
      return;
    }
    setOpenId(id);
  };

  return (
    <LayoutGroup>
      <div
        data-slot="bouncy-accordion"
        className={cn("flex flex-col divide-y divide-border", className, classNames?.root)}
      >
        {items.map((item) => (
          <BouncyAccordionRow
            key={item.id}
            item={item}
            open={item.id === openId}
            onToggle={() => toggle(item.id)}
            classNames={classNames}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}

function BouncyAccordionRow({
  item,
  open,
  onToggle,
  classNames,
}: {
  item: BouncyAccordionItem;
  open: boolean;
  onToggle: () => void;
  classNames?: BouncyAccordionClassNames;
}) {
  const reduced = useReducedMotion() ?? false;
  const contentId = useId();
  const spring = reduced ? { duration: 0 } : SPRING_LAYOUT;

  return (
    // `layout` here (not on the content below) is what makes the rest of
    // the list resettle with weight when a sibling's content reveal changes
    // its height — the content animates its own height directly, and this
    // row just reports the resulting box change into the shared LayoutGroup.
    <motion.div layout={!reduced} transition={spring} className={cn("py-1", classNames?.item)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted",
          classNames?.trigger,
        )}
      >
        {item.icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {item.icon}
          </span>
        )}
        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{item.title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={spring}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown size={16} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            role="region"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={spring}
            className={cn("overflow-hidden", classNames?.content)}
          >
            <div className={cn("px-3 pb-4 text-sm leading-relaxed text-muted-foreground", item.icon && "pl-14")}>
              {item.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default BouncyAccordion;
