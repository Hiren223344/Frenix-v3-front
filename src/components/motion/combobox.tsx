"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion-tokens";

export type ComboboxFilter = (value: string, query: string, keywords: string[]) => boolean;

const defaultFilter: ComboboxFilter = (value, query, keywords) => {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  const haystack = [value, ...keywords].join(" ").toLocaleLowerCase();
  let queryIndex = 0;
  for (const character of haystack) {
    if (character === needle[queryIndex]) queryIndex += 1;
    if (queryIndex === needle.length) return true;
  }
  return false;
};

type VisibleMeta = { onSelect?: (value: string) => void };

type ComboboxContextValue = {
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  filter: ComboboxFilter;
  disabled: boolean;
  activeValue: string | null;
  setActiveValue: (value: string | null) => void;
  registerVisible: (value: string, meta: VisibleMeta) => () => void;
  registerLabel: (value: string, label: string) => () => void;
  visibleOrder: string[];
  getVisibleMeta: (value: string) => VisibleMeta | undefined;
  labels: Map<string, string>;
  triggerRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  contentId: string;
  labelledById: string;
};

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useComboboxContext(component: string) {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error(`<${component} /> must be used inside a <Combobox>.`);
  return ctx;
}

export type ComboboxProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  filter?: ComboboxFilter;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

export function Combobox({
  value,
  defaultValue = "",
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  query,
  defaultQuery = "",
  onQueryChange,
  filter = defaultFilter,
  disabled = false,
  className,
  children,
}: ComboboxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isValueControlled = value !== undefined;
  const currentValue = isValueControlled ? value : internalValue;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpenControlled = open !== undefined;
  const currentOpen = isOpenControlled ? open : internalOpen;

  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const isQueryControlled = query !== undefined;
  const currentQuery = isQueryControlled ? query : internalQuery;

  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [visibleMeta, setVisibleMeta] = useState<Map<string, VisibleMeta>>(new Map());
  const [labels, setLabels] = useState<Map<string, string>>(new Map());

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reactId = useId();

  const setValue = useCallback(
    (next: string) => {
      if (!isValueControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isValueControlled, onValueChange],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const setQuery = useCallback(
    (next: string) => {
      if (!isQueryControlled) setInternalQuery(next);
      onQueryChange?.(next);
    },
    [isQueryControlled, onQueryChange],
  );

  const registerVisible = useCallback((itemValue: string, meta: VisibleMeta) => {
    setVisibleMeta((prev) => {
      if (prev.has(itemValue) && prev.get(itemValue)?.onSelect === meta.onSelect) return prev;
      const next = new Map(prev);
      next.set(itemValue, meta);
      return next;
    });
    return () => {
      setVisibleMeta((prev) => {
        if (!prev.has(itemValue)) return prev;
        const next = new Map(prev);
        next.delete(itemValue);
        return next;
      });
    };
  }, []);

  const registerLabel = useCallback((itemValue: string, label: string) => {
    setLabels((prev) => {
      if (prev.get(itemValue) === label) return prev;
      const next = new Map(prev);
      next.set(itemValue, label);
      return next;
    });
    return () => {
      setLabels((prev) => {
        if (!prev.has(itemValue)) return prev;
        const next = new Map(prev);
        next.delete(itemValue);
        return next;
      });
    };
  }, []);

  const visibleOrder = useMemo(() => Array.from(visibleMeta.keys()), [visibleMeta]);
  const getVisibleMeta = useCallback((itemValue: string) => visibleMeta.get(itemValue), [visibleMeta]);

  // Keep the active (keyboard-highlighted) item pinned to something that's
  // still on screen whenever the filtered set changes underneath it.
  useEffect(() => {
    if (activeValue && visibleOrder.includes(activeValue)) return;
    setActiveValue(visibleOrder[0] ?? null);
  }, [visibleOrder, activeValue]);

  useEffect(() => {
    if (!currentOpen) setActiveValue(null);
  }, [currentOpen]);

  const ctx = useMemo<ComboboxContextValue>(
    () => ({
      value: currentValue,
      setValue,
      open: currentOpen,
      setOpen,
      query: currentQuery,
      setQuery,
      filter,
      disabled,
      activeValue,
      setActiveValue,
      registerVisible,
      registerLabel,
      visibleOrder,
      getVisibleMeta,
      labels,
      triggerRef,
      inputRef,
      contentId: `combobox-content-${reactId}`,
      labelledById: `combobox-label-${reactId}`,
    }),
    [
      currentValue,
      setValue,
      currentOpen,
      setOpen,
      currentQuery,
      setQuery,
      filter,
      disabled,
      activeValue,
      registerVisible,
      registerLabel,
      visibleOrder,
      getVisibleMeta,
      labels,
      reactId,
    ],
  );

  return (
    <ComboboxContext.Provider value={ctx}>
      <div data-slot="combobox" className={cn("relative", className)}>
        {children}
      </div>
    </ComboboxContext.Provider>
  );
}

export type ComboboxTriggerProps = ComponentProps<"div">;

export function ComboboxTrigger({ className, children, ...props }: ComboboxTriggerProps) {
  const ctx = useComboboxContext("ComboboxTrigger");

  return (
    <div
      ref={ctx.triggerRef}
      data-slot="combobox-trigger"
      onClick={() => {
        if (ctx.disabled) return;
        ctx.setOpen(true);
      }}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-foreground",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        ctx.disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <Search size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
      {children}
    </div>
  );
}

export type ComboboxInputProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange"> & {
  wrapperClassName?: string;
};

export function ComboboxInput({ className, wrapperClassName, onFocus, onKeyDown, ...props }: ComboboxInputProps) {
  const ctx = useComboboxContext("ComboboxInput");

  // The input may mount a tick after the trigger click that opened it (it
  // can live inside ComboboxContent, which only renders once ctx.open
  // flips true) — focusing here, once it actually exists, is what makes
  // "click to open" also mean "start typing immediately."
  useEffect(() => {
    if (ctx.open) ctx.inputRef.current?.focus();
  }, [ctx.open, ctx.inputRef]);

  const moveActive = (dir: 1 | -1) => {
    if (ctx.visibleOrder.length === 0) return;
    const currentIndex = ctx.activeValue ? ctx.visibleOrder.indexOf(ctx.activeValue) : -1;
    const nextIndex = (currentIndex + dir + ctx.visibleOrder.length) % ctx.visibleOrder.length;
    ctx.setActiveValue(ctx.visibleOrder[nextIndex]);
  };

  const selectActive = () => {
    if (!ctx.activeValue) return;
    ctx.setValue(ctx.activeValue);
    ctx.getVisibleMeta(ctx.activeValue)?.onSelect?.(ctx.activeValue);
    ctx.setOpen(false);
  };

  return (
    <input
      ref={ctx.inputRef}
      type="text"
      role="combobox"
      aria-expanded={ctx.open}
      aria-controls={ctx.contentId}
      autoComplete="off"
      value={ctx.query}
      onChange={(e) => {
        ctx.setQuery(e.target.value);
        if (!ctx.open) ctx.setOpen(true);
      }}
      onFocus={(e) => {
        if (!ctx.disabled) ctx.setOpen(true);
        onFocus?.(e);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            if (!ctx.open) ctx.setOpen(true);
            else moveActive(1);
            break;
          case "ArrowUp":
            e.preventDefault();
            if (!ctx.open) ctx.setOpen(true);
            else moveActive(-1);
            break;
          case "Home":
            if (ctx.open && ctx.visibleOrder.length) {
              e.preventDefault();
              ctx.setActiveValue(ctx.visibleOrder[0]);
            }
            break;
          case "End":
            if (ctx.open && ctx.visibleOrder.length) {
              e.preventDefault();
              ctx.setActiveValue(ctx.visibleOrder[ctx.visibleOrder.length - 1]);
            }
            break;
          case "Enter":
            if (ctx.open) {
              e.preventDefault();
              selectActive();
            }
            break;
          case "Escape":
            if (ctx.open) {
              e.preventDefault();
              e.stopPropagation();
              ctx.setOpen(false);
            }
            break;
          default:
            break;
        }
      }}
      disabled={ctx.disabled}
      className={cn(
        "h-full w-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground",
        wrapperClassName,
        className,
      )}
      {...props}
    />
  );
}

type Placement = { top?: number; bottom?: number; left: number; width: number };

function usePopoverPlacement(
  triggerRef: RefObject<HTMLDivElement | null>,
  open: boolean,
  side: "bottom" | "top",
  align: "start" | "end" | "center",
  sideOffset: number,
  avoidCollisions: boolean,
): Placement | null {
  const [placement, setPlacement] = useState<Placement | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;

      let resolvedSide = side;
      if (avoidCollisions) {
        const spaceBelow = viewportH - rect.bottom;
        const spaceAbove = rect.top;
        if (side === "bottom" && spaceBelow < 240 && spaceAbove > spaceBelow) resolvedSide = "top";
        if (side === "top" && spaceAbove < 240 && spaceBelow > spaceAbove) resolvedSide = "bottom";
      }

      let left = rect.left;
      if (align === "end") left = rect.right - rect.width;
      if (align === "center") left = rect.left + rect.width / 2 - rect.width / 2;

      setPlacement(
        resolvedSide === "bottom"
          ? { top: rect.bottom + sideOffset, left, width: rect.width }
          : { bottom: viewportH - rect.top + sideOffset, left, width: rect.width },
      );
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, side, align, sideOffset, avoidCollisions, triggerRef]);

  return placement;
}

export type ComboboxContentProps = {
  side?: "bottom" | "top";
  align?: "start" | "end" | "center";
  sideOffset?: number;
  avoidCollisions?: boolean;
  className?: string;
  children?: ReactNode;
};

export function ComboboxContent({
  side = "bottom",
  align = "start",
  sideOffset = 6,
  avoidCollisions = true,
  className,
  children,
}: ComboboxContentProps) {
  const ctx = useComboboxContext("ComboboxContent");
  const reduced = useReducedMotion() ?? false;
  const placement = usePopoverPlacement(ctx.triggerRef, ctx.open, side, align, sideOffset, avoidCollisions);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctx.open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (contentRef.current?.contains(target) || ctx.triggerRef.current?.contains(target)) return;
      ctx.setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [ctx.open, ctx]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {ctx.open && placement && (
        <motion.div
          ref={contentRef}
          id={ctx.contentId}
          data-slot="combobox-content"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: side === "bottom" ? -4 : 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: side === "bottom" ? -4 : 4 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
          style={{
            position: "fixed",
            top: placement.top,
            bottom: placement.bottom,
            left: placement.left,
            // A floor, not a fixed width — callers set their own width via
            // className (the spec's own "Workspace" example sets w-72 on
            // ComboboxContent independent of the trigger's width), this
            // just keeps a caller that doesn't specify one from ending up
            // narrower than the trigger it's anchored to.
            minWidth: placement.width,
            zIndex: 100,
          }}
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export type ComboboxListProps = {
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
};

export function ComboboxList({ ariaLabel = "Options", className, children }: ComboboxListProps) {
  const ctx = useComboboxContext("ComboboxList");
  return (
    <div
      role="listbox"
      aria-label={ariaLabel}
      id={ctx.contentId}
      className={cn("max-h-72 overflow-y-auto", className)}
    >
      {children}
    </div>
  );
}

export function ComboboxEmpty({ className, children }: { className?: string; children?: ReactNode }) {
  const ctx = useComboboxContext("ComboboxEmpty");
  if (ctx.visibleOrder.length > 0) return null;
  return (
    <div className={cn("px-3 py-6 text-center text-sm text-muted-foreground", className)}>{children}</div>
  );
}

export function ComboboxGroup({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div role="group" className={cn("flex flex-col", className)}>
      {children}
    </div>
  );
}

export function ComboboxLabel({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={cn("px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function ComboboxSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn("my-1.5 h-px bg-border", className)} />;
}

export type ComboboxItemProps = {
  value: string;
  textValue?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
  children?: ReactNode;
};

export function ComboboxItem({
  value,
  textValue,
  keywords = [],
  disabled = false,
  onSelect,
  className,
  children,
}: ComboboxItemProps) {
  const ctx = useComboboxContext("ComboboxItem");
  const label = textValue ?? value;
  const visible = ctx.filter(value, ctx.query, keywords);
  const active = ctx.activeValue === value;
  const selected = ctx.value === value;

  // Depending on the specific registration functions (stable for the
  // provider's whole lifetime via useCallback) rather than the whole `ctx`
  // object — which is a new reference on every registration, since it
  // carries the very state these effects write to — is what keeps this
  // from re-firing every time any item registers, which otherwise loops:
  // register -> ctx changes -> effect re-runs -> register -> ...
  const { registerLabel, registerVisible } = ctx;

  useLayoutEffect(() => registerLabel(value, label), [registerLabel, value, label]);

  useLayoutEffect(() => {
    if (!visible || disabled) return;
    return registerVisible(value, { onSelect });
  }, [registerVisible, value, visible, disabled, onSelect]);

  if (!visible) return null;

  const select = () => {
    if (disabled) return;
    ctx.setValue(value);
    onSelect?.(value);
    ctx.setOpen(false);
  };

  return (
    <div
      data-slot="combobox-item"
      data-value={value}
      data-active={active || undefined}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      onMouseEnter={() => !disabled && ctx.setActiveValue(value)}
      onClick={select}
      className={cn(
        "flex cursor-pointer items-center rounded-lg px-2.5 text-sm text-foreground outline-none",
        active && "bg-muted",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type ComboboxValueProps = {
  placeholder?: ReactNode;
  className?: string;
};

export function ComboboxValue({ placeholder = "Select an option", className }: ComboboxValueProps) {
  const ctx = useComboboxContext("ComboboxValue");
  const label = ctx.labels.get(ctx.value);
  return (
    <span className={cn("truncate text-sm", !label && "text-muted-foreground", className)}>
      {label ?? placeholder}
    </span>
  );
}

export default Combobox;
