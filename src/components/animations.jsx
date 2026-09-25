import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

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
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
