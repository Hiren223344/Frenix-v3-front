"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

const MOBILE_BREAKPOINT = 768;
const WIDTH_EXPANDED = 256;
const WIDTH_ICON = 68;
const WIDTH_MOBILE = 280;

type Collapsible = "icon" | "offcanvas" | "none";

type SidebarContextValue = {
  isMobile: boolean;
  open: boolean;
  openMobile: boolean;
  setOpenMobile: (v: boolean) => void;
  toggleSidebar: () => void;
  collapsible: Collapsible;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar components must be used inside <AnimatedSidebarProvider>");
  return ctx;
}

export type AnimatedSidebarProviderProps = ComponentProps<"div"> & {
  defaultOpen?: boolean;
};

export function AnimatedSidebarProvider({
  defaultOpen = true,
  className,
  children,
  ...props
}: AnimatedSidebarProviderProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const toggleSidebar = () => (isMobile ? setOpenMobile((v) => !v) : setOpen((v) => !v));

  return (
    <SidebarContext.Provider
      value={{ isMobile, open, openMobile, setOpenMobile, toggleSidebar, collapsible: "icon" }}
    >
      <div className={cn("relative flex w-full", className)} {...props}>
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
  collapsible?: Collapsible;
  panelClassName?: string;
};

export function AnimatedSidebar({
  ariaLabel,
  collapsible = "icon",
  className,
  panelClassName,
  children,
  ...props
}: AnimatedSidebarProps) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();
  const reduced = useReducedMotion() ?? false;
  const collapsed = collapsible !== "none" && !open;
  const state = collapsed ? "collapsed" : "expanded";

  if (isMobile) {
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
              className={cn("group/sidebar absolute inset-y-0 left-0 z-50 flex flex-col border-r", panelClassName)}
              style={{ width: WIDTH_MOBILE }}
              initial={reduced ? undefined : { x: -WIDTH_MOBILE }}
              animate={{ x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: -WIDTH_MOBILE }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
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
      className={cn("group/sidebar flex shrink-0 flex-col overflow-hidden border-r", panelClassName, className)}
      animate={{ width: collapsed ? WIDTH_ICON : WIDTH_EXPANDED }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 34 }}
      {...props}
    >
      {children}
    </motion.aside>
  );
}

export function AnimatedSidebarInset({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-1 flex-col", className)} {...props} />;
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

export type AnimatedSidebarMenuButtonProps = Omit<ComponentProps<"button">, "onSelect"> & {
  icon?: ReactNode;
  badge?: ReactNode;
  isActive?: boolean;
  ariaExpanded?: boolean;
  onSelect?: () => void;
  /** Internal route — renders a react-router <Link> instead of a <button>. */
  to?: string;
  /** External URL — renders an <a target="_blank">. */
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
  onSelect,
  to,
  href,
  className,
  children,
  ...props
}: AnimatedSidebarMenuButtonProps) {
  const cls = cn(MENU_BUTTON_CLASS, className);

  if (to) {
    return (
      <Link
        to={to}
        aria-current={isActive ? "page" : undefined}
        data-active={isActive || undefined}
        className={cls}
        onClick={onSelect}
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
        target="_blank"
        rel="noopener noreferrer"
        data-active={isActive || undefined}
        className={cls}
        onClick={onSelect}
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
      onClick={onSelect}
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
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
  isActive?: boolean;
  onSelect?: () => void;
};

export function AnimatedSidebarMenuSubButton({
  isActive,
  onSelect,
  className,
  ...props
}: AnimatedSidebarMenuSubButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive || undefined}
      className={cn(
        "flex min-h-7 w-full items-center rounded-md px-2 text-left text-sm text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "data-[active]:text-foreground data-[active]:font-medium",
        className,
      )}
      {...props}
    />
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
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar width"
      onClick={toggleSidebar}
      className={cn(
        "absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-border",
        className,
      )}
      {...props}
    />
  );
}

export default AnimatedSidebar;
