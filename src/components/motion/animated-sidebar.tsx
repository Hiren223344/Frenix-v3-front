"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/motion-tokens";

const MOBILE_BREAKPOINT = 768;
const WIDTH_EXPANDED = 256;
const WIDTH_ICON = 68;
const WIDTH_MOBILE = 280;

type Collapsible = "icon" | "offcanvas" | "none";
type Side = "left" | "right";
type Variant = "sidebar" | "inset" | "floating";

type SidebarContextValue = {
  isMobile: boolean;
  open: boolean;
  openMobile: boolean;
  setOpenMobile: (v: boolean) => void;
  toggleSidebar: () => void;
  // Pushed by <AnimatedSidebar> itself (see its effect below) rather than
  // accepted as Provider props — side/variant belong to the Sidebar, but
  // <AnimatedSidebarInset> and <AnimatedSidebarRail> are its siblings, not
  // descendants, so they need this ambient channel to stay in sync with it
  // instead of requiring the caller to pass the same value to three places.
  side: Side;
  setSide: (s: Side) => void;
  variant: Variant;
  setVariant: (v: Variant) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar components must be used inside <AnimatedSidebarProvider>");
  return ctx;
}

export type SidebarProviderStyle = CSSProperties;

export type AnimatedSidebarProviderProps = Omit<ComponentProps<"div">, "style"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openMobile?: boolean;
  defaultOpenMobile?: boolean;
  onOpenMobileChange?: (open: boolean) => void;
  style?: SidebarProviderStyle;
};

export function AnimatedSidebarProvider({
  open,
  defaultOpen = true,
  onOpenChange,
  openMobile,
  defaultOpenMobile = false,
  onOpenMobileChange,
  style,
  className,
  children,
  ...props
}: AnimatedSidebarProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpenControlled = open !== undefined;
  const currentOpen = isOpenControlled ? open : internalOpen;

  const [internalOpenMobile, setInternalOpenMobile] = useState(defaultOpenMobile);
  const isOpenMobileControlled = openMobile !== undefined;
  const currentOpenMobile = isOpenMobileControlled ? openMobile : internalOpenMobile;

  const [isMobile, setIsMobile] = useState(false);
  const [side, setSide] = useState<Side>("left");
  const [variant, setVariant] = useState<Variant>("sidebar");

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const setOpen = (next: boolean) => {
    if (!isOpenControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const setOpenMobile = (next: boolean) => {
    if (!isOpenMobileControlled) setInternalOpenMobile(next);
    onOpenMobileChange?.(next);
  };

  const toggleSidebar = () => (isMobile ? setOpenMobile(!currentOpenMobile) : setOpen(!currentOpen));

  return (
    <SidebarContext.Provider
      value={{
        isMobile,
        open: currentOpen,
        openMobile: currentOpenMobile,
        setOpenMobile,
        toggleSidebar,
        side,
        setSide,
        variant,
        setVariant,
      }}
    >
      <div className={cn("relative flex w-full", className)} style={style} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export type AnimatedSidebarProps = Omit<
  ComponentProps<"div">,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
> & {
  ariaLabel?: string;
  variant?: Variant;
  side?: Side;
  collapsible?: Collapsible;
  panelClassName?: string;
};

export function AnimatedSidebar({
  ariaLabel = "Sidebar",
  variant = "sidebar",
  side = "left",
  collapsible = "icon",
  className,
  panelClassName,
  children,
  ...props
}: AnimatedSidebarProps) {
  const { isMobile, open, openMobile, setOpenMobile, setSide, setVariant } = useSidebar();
  const reduced = useReducedMotion() ?? false;
  const collapsed = collapsible !== "none" && !open;
  const state = collapsed ? "collapsed" : "expanded";

  // Runs regardless of which branch below actually renders (including the
  // mobile "closed, nothing mounted" case), since it's called before either
  // return — <AnimatedSidebarInset>/<AnimatedSidebarRail> are this
  // component's siblings and need side/variant even while the mobile sheet
  // itself isn't in the DOM.
  useEffect(() => {
    setSide(side);
    setVariant(variant);
  }, [side, variant, setSide, setVariant]);

  if (isMobile) {
    const offscreenX = side === "right" ? WIDTH_MOBILE : -WIDTH_MOBILE;
    return (
      <AnimatePresence>
        {openMobile && (
          <>
            <motion.div
              key="backdrop"
              className="absolute inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMobile(false)}
            />
            <motion.aside
              key="panel"
              aria-label={ariaLabel}
              data-state="expanded"
              data-side={side}
              className={cn(
                "group/sidebar absolute inset-y-0 z-50 flex flex-col",
                side === "right" ? "right-0 border-l" : "left-0 border-r",
                panelClassName,
              )}
              style={{ width: WIDTH_MOBILE }}
              initial={reduced ? { opacity: 0 } : { x: offscreenX }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: offscreenX }}
              transition={SPRING_LAYOUT}
              {...props}
            >
              {children}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      aria-label={ariaLabel}
      data-state={state}
      data-side={side}
      data-variant={variant}
      className={cn(
        "group/sidebar sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden",
        side === "right" ? "order-last border-l" : "border-r",
        variant === "floating" &&
          (side === "right"
            ? "my-2 mr-2 h-[calc(100vh-1rem)] rounded-xl border shadow-sm"
            : "my-2 ml-2 h-[calc(100vh-1rem)] rounded-xl border shadow-sm"),
        panelClassName,
        className,
      )}
      animate={{ width: collapsed ? WIDTH_ICON : WIDTH_EXPANDED }}
      transition={reduced ? { duration: 0 } : SPRING_LAYOUT}
      {...props}
    >
      {children}
    </motion.aside>
  );
}

export function AnimatedSidebarInset({ className, ...props }: ComponentProps<"div">) {
  const { variant, side } = useSidebar();
  const inset = variant === "inset";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col",
        inset && "md:my-2 md:overflow-hidden md:rounded-xl md:border md:border-border md:shadow-sm",
        inset && (side === "right" ? "md:mr-2" : "md:ml-2"),
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col", className)} {...props} />;
}

export function AnimatedSidebarContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)} {...props} />;
}

export function AnimatedSidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-auto flex flex-col border-t", className)} {...props} />;
}

export function AnimatedSidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col", className)} {...props} />;
}

export function AnimatedSidebarGroupLabel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
        "group-data-[state=collapsed]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarGroupContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col", className)} {...props} />;
}

export function AnimatedSidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

export function AnimatedSidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("relative", className)} {...props} />;
}

type MenuButtonTarget = "_blank" | "_self" | "_parent" | "_top";

export type AnimatedSidebarMenuButtonProps = Omit<ComponentProps<"button">, "onSelect"> & {
  icon?: ReactNode;
  badge?: ReactNode;
  isActive?: boolean;
  ariaExpanded?: boolean;
  disabled?: boolean;
  /** Auto-closes the mobile sheet after a select — on by default, like a real nav. */
  closeOnSelect?: boolean;
  target?: MenuButtonTarget;
  rel?: string;
  onSelect?: () => void;
  /** Internal route — renders a react-router <Link> instead of a <button>. */
  to?: string;
  /** External URL — renders an <a>. Defaults to a safe new-tab open. */
  href?: string;
};

const MENU_BUTTON_CLASS =
  "group/menu-button flex min-h-9 w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 text-sm font-medium transition-colors " +
  "text-muted-foreground hover:bg-muted hover:text-foreground " +
  "data-[active]:bg-muted data-[active]:text-foreground";

function MenuButtonContent({
  icon,
  badge,
  ariaExpanded,
  children,
}: {
  icon?: ReactNode;
  badge?: ReactNode;
  ariaExpanded?: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      {icon && <span className="flex shrink-0 items-center justify-center">{icon}</span>}
      <span className="min-w-0 flex-1 truncate text-left group-data-[state=collapsed]/sidebar:hidden">
        {children}
      </span>
      {badge != null && (
        <span className="ml-auto shrink-0 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold text-foreground group-data-[state=collapsed]/sidebar:hidden">
          {badge}
        </span>
      )}
      {ariaExpanded !== undefined && (
        <motion.span
          animate={{ rotate: ariaExpanded ? 90 : 0 }}
          className="ml-auto shrink-0 text-muted-foreground group-data-[state=collapsed]/sidebar:hidden"
        >
          ›
        </motion.span>
      )}
    </>
  );
}

export function AnimatedSidebarMenuButton({
  icon,
  badge,
  isActive,
  ariaExpanded,
  disabled = false,
  closeOnSelect = true,
  target,
  rel,
  onSelect,
  to,
  href,
  className,
  children,
  ...props
}: AnimatedSidebarMenuButtonProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const cls = cn(MENU_BUTTON_CLASS, disabled && "pointer-events-none opacity-50", className);

  const handleSelect = () => {
    onSelect?.();
    if (closeOnSelect && isMobile) setOpenMobile(false);
  };

  if (disabled) {
    return (
      <span aria-disabled="true" className={cls}>
        <MenuButtonContent icon={icon} badge={badge} ariaExpanded={ariaExpanded}>
          {children}
        </MenuButtonContent>
      </span>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        aria-current={isActive ? "page" : undefined}
        data-active={isActive || undefined}
        className={cls}
        onClick={handleSelect}
      >
        <MenuButtonContent icon={icon} badge={badge} ariaExpanded={ariaExpanded}>
          {children}
        </MenuButtonContent>
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
        data-active={isActive || undefined}
        className={cls}
        onClick={handleSelect}
      >
        <MenuButtonContent icon={icon} badge={badge} ariaExpanded={ariaExpanded}>
          {children}
        </MenuButtonContent>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-current={isActive ? "page" : undefined}
      aria-expanded={ariaExpanded}
      data-active={isActive || undefined}
      className={cls}
      {...props}
    >
      <MenuButtonContent icon={icon} badge={badge} ariaExpanded={ariaExpanded}>
        {children}
      </MenuButtonContent>
    </button>
  );
}

export type AnimatedSidebarMenuSubProps = Omit<
  ComponentProps<"ul">,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
> & { open: boolean };

export function AnimatedSidebarMenuSub({
  open,
  className,
  children,
  ...props
}: AnimatedSidebarMenuSubProps) {
  const reduced = useReducedMotion() ?? false;
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.ul
          initial={reduced ? undefined : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduced ? undefined : { height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className={cn(
            "ml-4 flex flex-col gap-0.5 overflow-hidden border-l border-border pl-3",
            "group-data-[state=collapsed]/sidebar:hidden",
            className,
          )}
          {...props}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}

export function AnimatedSidebarMenuSubItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={className} {...props} />;
}

export type AnimatedSidebarMenuSubButtonProps = Omit<ComponentProps<"button">, "onSelect"> & {
  icon?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  target?: MenuButtonTarget;
  rel?: string;
  onSelect?: () => void;
  /** Internal route — renders a react-router <Link> instead of a <button>. */
  to?: string;
  href?: string;
};

const MENU_SUB_BUTTON_CLASS =
  "flex min-h-7 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-muted-foreground transition-colors " +
  "hover:bg-muted hover:text-foreground " +
  "data-[active]:text-foreground data-[active]:font-medium";

function SubButtonContent({ icon, children }: { icon?: ReactNode; children?: ReactNode }) {
  return (
    <>
      {icon && <span className="flex shrink-0 items-center justify-center">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </>
  );
}

export function AnimatedSidebarMenuSubButton({
  icon,
  isActive,
  disabled = false,
  closeOnSelect = true,
  target,
  rel,
  onSelect,
  to,
  href,
  className,
  children,
  ...props
}: AnimatedSidebarMenuSubButtonProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const cls = cn(MENU_SUB_BUTTON_CLASS, disabled && "pointer-events-none opacity-50", className);

  const handleSelect = () => {
    onSelect?.();
    if (closeOnSelect && isMobile) setOpenMobile(false);
  };

  if (disabled) {
    return (
      <span aria-disabled="true" className={cls}>
        <SubButtonContent icon={icon}>{children}</SubButtonContent>
      </span>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        aria-current={isActive ? "page" : undefined}
        data-active={isActive || undefined}
        className={cls}
        onClick={handleSelect}
      >
        <SubButtonContent icon={icon}>{children}</SubButtonContent>
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
        data-active={isActive || undefined}
        className={cls}
        onClick={handleSelect}
      >
        <SubButtonContent icon={icon}>{children}</SubButtonContent>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive || undefined}
      className={cls}
      {...props}
    >
      <SubButtonContent icon={icon}>{children}</SubButtonContent>
    </button>
  );
}

export function AnimatedSidebarClose({ className, ...props }: ComponentProps<"button">) {
  const { setOpenMobile } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Close sidebar"
      onClick={() => setOpenMobile(false)}
      className={cn("grid size-7 shrink-0 place-items-center rounded-lg transition-colors", className)}
      {...props}
    />
  );
}

export function AnimatedSidebarTrigger({ className, ...props }: ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={toggleSidebar}
      className={cn("grid size-8 shrink-0 place-items-center rounded-lg transition-colors", className)}
      {...props}
    />
  );
}

export function AnimatedSidebarRail({ className, ...props }: ComponentProps<"button">) {
  const { toggleSidebar, side } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar width"
      onClick={toggleSidebar}
      className={cn(
        "absolute inset-y-0 z-10 w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-border",
        side === "right" ? "left-0" : "right-0",
        className,
      )}
      {...props}
    />
  );
}

export default AnimatedSidebar;
