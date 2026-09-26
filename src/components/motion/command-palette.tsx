"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComponentType, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/motion-tokens";

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  hint?: string;
  keywords?: string[];
  onSelect: () => void;
};

// Same fuzzy subsequence matcher as the Combobox primitive (src/components
// motion/combobox.tsx's defaultFilter) — kept as a private copy rather than
// a shared export since this is the only detail the two components share.
function fuzzyMatch(label: string, query: string, keywords: string[] = []): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  const haystack = [label, ...keywords].join(" ").toLocaleLowerCase();
  let queryIndex = 0;
  for (const character of haystack) {
    if (character === needle[queryIndex]) queryIndex += 1;
    if (queryIndex === needle.length) return true;
  }
  return false;
}

type ItemGroup = { name: string | null; items: CommandItem[] };

function groupItems(items: CommandItem[]): ItemGroup[] {
  const groups: ItemGroup[] = [];
  const byName = new Map<string | null, ItemGroup>();
  for (const item of items) {
    const key = item.group ?? null;
    let group = byName.get(key);
    if (!group) {
      group = { name: key, items: [] };
      byName.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

export type CommandPaletteProps = {
  items: CommandItem[];
  shortcut?: string;
  placeholder?: string;
  emptyMessage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function CommandPalette({
  items,
  shortcut = "k",
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  open,
  onOpenChange,
  className,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const reduced = useReducedMotion() ?? false;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Global Cmd/Ctrl + <shortcut> toggle — what makes this a self-contained
  // block: mount it once with just `items` and the keybinding works with no
  // extra wiring, the same way every real command palette behaves.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === shortcut.toLowerCase()) {
        event.preventDefault();
        setOpen(!currentOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut, setOpen, currentOpen]);

  const filteredGroups = useMemo(() => {
    const filtered = items.filter((item) => fuzzyMatch(item.label, query, item.keywords));
    return groupItems(filtered);
  }, [items, query]);

  const flatIds = useMemo(
    () => filteredGroups.flatMap((group) => group.items.map((item) => item.id)),
    [filteredGroups],
  );

  useEffect(() => {
    if (activeId && flatIds.includes(activeId)) return;
    setActiveId(flatIds[0] ?? null);
  }, [flatIds, activeId]);

  useEffect(() => {
    if (!currentOpen) {
      setQuery("");
      setActiveId(null);
      return;
    }
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      previouslyFocused.current?.focus?.();
    };
  }, [currentOpen]);

  const runSelect = useCallback(
    (item: CommandItem | undefined) => {
      if (!item) return;
      setOpen(false);
      item.onSelect();
    },
    [setOpen],
  );

  const moveActive = (dir: 1 | -1) => {
    if (flatIds.length === 0) return;
    const currentIndex = activeId ? flatIds.indexOf(activeId) : -1;
    const nextIndex = (currentIndex + dir + flatIds.length) % flatIds.length;
    setActiveId(flatIds[nextIndex]);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        if (flatIds.length) {
          event.preventDefault();
          setActiveId(flatIds[0]);
        }
        break;
      case "End":
        if (flatIds.length) {
          event.preventDefault();
          setActiveId(flatIds[flatIds.length - 1]);
        }
        break;
      case "Enter": {
        event.preventDefault();
        runSelect(items.find((item) => item.id === activeId));
        break;
      }
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {currentOpen && (
        <motion.div
          key="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            key="command-palette-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            onMouseDown={(event) => event.stopPropagation()}
            className={cn(
              "flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 text-card-foreground shadow-2xl backdrop-blur-xl",
              className,
            )}
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-4">
              <Search size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={currentOpen}
                aria-controls="command-palette-list"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={placeholder}
                className="h-12 w-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden shrink-0 rounded border border-border/60 px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline-block">
                Esc
              </kbd>
            </div>

            <div
              id="command-palette-list"
              role="listbox"
              aria-label="Commands"
              className="max-h-80 overflow-y-auto p-2"
            >
              {flatIds.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.name ?? "__ungrouped"} role="group" className="flex flex-col">
                    {group.name && (
                      <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {group.name}
                      </div>
                    )}
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = item.id === activeId;
                      return (
                        <div
                          key={item.id}
                          data-slot="command-palette-item"
                          data-active={active || undefined}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveId(item.id)}
                          onClick={() => runSelect(item)}
                          className="relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none"
                        >
                          {active && (
                            <motion.div
                              layoutId="command-palette-active-row"
                              className="absolute inset-0 rounded-lg bg-muted"
                              transition={reduced ? { duration: 0 } : SPRING_LAYOUT}
                            />
                          )}
                          <span className="relative flex min-w-0 flex-1 items-center gap-2.5">
                            {Icon && <Icon size={15} className="shrink-0 text-muted-foreground" />}
                            <span className="truncate">{item.label}</span>
                          </span>
                          {item.hint && (
                            <kbd className="relative shrink-0 rounded border border-border/60 bg-background/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                              {item.hint}
                            </kbd>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default CommandPalette;
