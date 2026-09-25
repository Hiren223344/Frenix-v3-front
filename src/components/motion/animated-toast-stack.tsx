"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Info, LoaderCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastStatus = "neutral" | "info" | "loading" | "success" | "error";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastInput = {
  status?: ToastStatus;
  title: string;
  description?: string;
  /** ms before auto-dismiss; 0 (or omitted with status "loading") keeps it open until dismissed/updated. */
  duration?: number;
};

export type Toast = ToastInput & { id: number };

const DEFAULT_ICONS: Record<ToastStatus, typeof Info> = {
  neutral: Info,
  info: Info,
  loading: LoaderCircle,
  success: Check,
  error: X,
};

let seq = 0;

export function useAnimatedToastStack(options: { defaultDuration?: number; limit?: number } = {}) {
  const { defaultDuration = 4000, limit = 5 } = options;
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const clearTimer = (id: number) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  };

  const dismissToast = useCallback((id: number) => {
    clearTimer(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const arm = useCallback(
    (id: number, duration: number | undefined, status: ToastStatus | undefined) => {
      clearTimer(id);
      const ms = duration ?? (status === "loading" ? 0 : defaultDuration);
      if (ms > 0) {
        timers.current.set(id, setTimeout(() => dismissToast(id), ms));
      }
    },
    [defaultDuration, dismissToast],
  );

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = ++seq;
      setToasts((prev) => {
        const next = [{ ...input, id }, ...prev];
        // Drop the oldest once past the limit rather than growing forever.
        return next.length > limit ? next.slice(0, limit) : next;
      });
      arm(id, input.duration, input.status);
      return id;
    },
    [arm, limit],
  );

  const updateToast = useCallback(
    (id: number, patch: Partial<ToastInput>) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      arm(id, patch.duration, patch.status);
    },
    [arm],
  );

  const clearToasts = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  return { toasts, showToast, updateToast, dismissToast, clearToasts };
}

const SIDE = {
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
} as const;

const ENTER_FROM_TOP = (pos: ToastPosition) => pos.startsWith("top");

export type AnimatedToastStackProps = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  position?: ToastPosition;
  placement?: "fixed" | "absolute";
  maxVisible?: number;
  icons?: Partial<Record<ToastStatus, ReactNode>>;
  classNames?: { root?: string; surface?: string };
};

export function AnimatedToastStack({
  toasts,
  onDismiss,
  position = "bottom-right",
  placement = "fixed",
  maxVisible = 4,
  icons,
  classNames,
}: AnimatedToastStackProps) {
  const reduced = useReducedMotion() ?? false;
  const fromTop = ENTER_FROM_TOP(position);
  const visible = toasts.slice(0, maxVisible);

  return (
    <div
      className={cn(
        placement,
        "z-50 flex w-full max-w-sm flex-col gap-2 p-0",
        SIDE[position],
        classNames?.root,
      )}
      style={{ position: placement }}
    >
      <AnimatePresence initial={false}>
        {visible.map((toast) => {
          const status = toast.status ?? "neutral";
          const Icon = DEFAULT_ICONS[status];
          const icon = icons?.[status];

          return (
            <motion.div
              key={toast.id}
              layout={!reduced}
              initial={reduced ? undefined : { opacity: 0, y: fromTop ? -16 : 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={cn(
                "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-3 shadow-lg",
                "border-border bg-card text-card-foreground",
                classNames?.surface,
              )}
              role="status"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                  status === "error" && "bg-red-500/10 text-red-600 dark:text-red-400",
                  status === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  (status === "neutral" || status === "info") && "bg-muted text-muted-foreground",
                  status === "loading" && "bg-muted text-muted-foreground",
                )}
              >
                {icon ?? <Icon size={14} className={status === "loading" ? "animate-spin" : undefined} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{toast.title}</span>
                {toast.description && (
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {toast.description}
                  </span>
                )}
              </span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => onDismiss(toast.id)}
                className="-m-1 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default AnimatedToastStack;
