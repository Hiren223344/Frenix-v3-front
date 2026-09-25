"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactElement, ReactNode } from "react";
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type CenterMorphModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CenterMorphModalContext = createContext<CenterMorphModalContextValue | null>(null);

function useCenterMorphModalContext(component: string) {
  const ctx = useContext(CenterMorphModalContext);
  if (!ctx) {
    throw new Error(`<${component} /> must be used inside a <CenterMorphModal>.`);
  }
  return ctx;
}

export type CenterMorphModalProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export function CenterMorphModal({ open, defaultOpen = false, onOpenChange, children }: CenterMorphModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const value = useMemo(() => ({ open: currentOpen, setOpen }), [currentOpen, setOpen]);

  return <CenterMorphModalContext.Provider value={value}>{children}</CenterMorphModalContext.Provider>;
}

export type CenterMorphModalTriggerProps = {
  children: ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
};

export function CenterMorphModalTrigger({ children }: CenterMorphModalTriggerProps) {
  const { setOpen } = useCenterMorphModalContext("CenterMorphModalTrigger");

  return cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      setOpen(true);
    },
  });
}

export type CenterMorphModalContentProps = {
  ariaLabel: string;
  ariaDescribedBy?: string;
  dismissible?: boolean;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  className?: string;
  backdropClassName?: string;
  children?: ReactNode;
};

export function CenterMorphModalContent({
  ariaLabel,
  ariaDescribedBy,
  dismissible = true,
  showCloseButton = true,
  closeButtonLabel = "Close modal",
  className,
  backdropClassName,
  children,
}: CenterMorphModalContentProps) {
  const { open, setOpen } = useCenterMorphModalContext("CenterMorphModalContent");
  const reduced = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !dismissible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dismissible, close]);

  // The panel doesn't grow out of any particular element's bounds — it
  // morphs from a zero-area rect centered on itself, out to its own full
  // size, via an inset() clip-path (each edge moves outward from the
  // center to 0 at the same rate) rather than a plain scale, which is
  // what makes it read as "unfolding toward every edge" instead of just
  // zooming in.
  const panelVariants = reduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, clipPath: "inset(50% 50% 50% 50% round 28px)" },
        visible: { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 28px)" },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="center-morph-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm",
            backdropClassName,
          )}
          onMouseDown={(event) => {
            if (dismissible && event.target === event.currentTarget) close();
          }}
        >
          <motion.div
            key="center-morph-modal-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            tabIndex={-1}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full max-w-lg overflow-hidden rounded-[28px] border border-border bg-card text-card-foreground shadow-2xl focus:outline-none",
              className,
            )}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {showCloseButton && (
              <button
                type="button"
                onClick={close}
                aria-label={closeButtonLabel}
                className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default CenterMorphModal;
