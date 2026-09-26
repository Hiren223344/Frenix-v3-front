import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from '@/lib/motion-tokens';

// transitions.dev's "texts reveal": mounts hidden (per the .t-stagger-line
// CSS) and flips to .is-shown a frame later, so the browser has an initial
// state to transition away from — adding the class on the same render as
// the hidden state would collapse into no transition at all.
export function Reveal({ children, className = '', style }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`t-stagger ${shown ? 'is-shown' : ''} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

// transitions.dev's "skeleton loader and reveal": `skeleton` and `children`
// occupy the same slot and cross-fade once `loading` flips false. Meant for
// a fixed-size card/row, not an arbitrarily tall list — the skeleton and
// content stack via position:absolute, so the wrapper needs its own height
// (pass it via `style` at the call site).
export function SkeletonReveal({ loading, skeleton, children, className = '', style }) {
  return (
    <div className={`t-skel ${loading ? '' : 'is-revealed'} ${className}`.trim()} style={style}>
      <div className={`t-skel-skeleton ${loading ? 'is-pulsing' : ''}`}>{skeleton}</div>
      <div className="t-skel-content">{children}</div>
    </div>
  );
}

// transitions.dev's "text states swap": swaps a status word/phrase in
// place — the old text exits up with blur, the new text enters from below.
// Mirrors the spec's three-phase is-exit / is-enter-start choreography,
// translated from direct textContent mutation to a controlled `value` prop
// so it can drive things like a "Save" -> "Saved" button label.
export function TextSwap({ value, as: Tag = 'span', className = '', style }) {
  const [display, setDisplay] = useState(value);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'exit' | 'enter-start'
  const timers = useRef({ timeout: null, raf: null });

  useEffect(() => {
    if (value === display) return undefined;
    setPhase('exit');
    const dur =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--text-swap-dur')
      ) || 150;
    timers.current.timeout = setTimeout(() => {
      setDisplay(value);
      setPhase('enter-start');
      // Force a reflow so the next class removal actually transitions.
      timers.current.raf = requestAnimationFrame(() => setPhase('idle'));
    }, dur);
    return () => {
      clearTimeout(timers.current.timeout);
      cancelAnimationFrame(timers.current.raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Tag
      className={`t-text-swap ${phase === 'exit' ? 'is-exit' : ''} ${phase === 'enter-start' ? 'is-enter-start' : ''} ${className}`.trim()}
      style={style}
    >
      {display}
    </Tag>
  );
}

// transitions.dev's "card resize": tweens a container's width/height via
// a plain CSS transition (.t-resize, in index.css). A raw CSS transition
// can't interpolate to/from `height: auto`, so this measures the
// content's natural height and toggles the wrapper between 0 and that
// measured px value instead — the explicit-value contract the transition
// needs, same trick as the auto-growing textarea in Playground.jsx.
export function CardResize({ active, children, className = '', style = undefined }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setHeight(active ? el.scrollHeight : 0);
  }, [active, children]);

  return (
    <div
      className={`t-resize ${className}`.trim()}
      style={{ height, overflow: 'hidden', ...style }}
      aria-hidden={!active}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

// transitions.dev's "success check": fades a status icon in while it
// rotates upright, settles with a Y-bob, and (for an SVG <path> icon)
// draws its stroke. Appear-only per the spec — the icon is meant to mount
// already in this state (e.g. inside a freshly-mounted success toast), so
// there's no separate "out" phase to trigger from; a parent that remounts
// the wrapper (a `key` change, an AnimatePresence item) is what replays it.
export function SuccessCheck({ children, className = '', style = undefined }) {
  return (
    <span className={`t-success-check ${className}`.trim()} data-state="in" aria-hidden="true" style={style}>
      {children}
    </span>
  );
}

// Fades + rises a block in as it scrolls into view — unlike Reveal (which
// only ever plays once, on mount), this re-triggers per element via
// IntersectionObserver (whileInView), so every section gets its own moment
// as the page scrolls past it. `once` (default true) keeps it from
// replaying on scroll back up, which reads as jittery rather than smooth.
export function ScrollReveal({ children, className = '', style, delay = 0, y = 24, once = true, amount = 0.2 }) {
  const reduced = useReducedMotion() ?? false;

  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
