/**
 * Motion + timing tokens in JS form.
 *
 * These mirror the CSS custom properties in app/globals.css exactly. Having one
 * JS source lets GSAP timelines and Framer Motion variants use the same curve, so
 * the site reads as a single motion system instead of two libraries arguing.
 */

/** The site-wide "expensive" curve: fast departure, long soft settle. */
export const EASE_EXP = [0.16, 1, 0.3, 1] as const;
export const EASE_INOUT = [0.65, 0, 0.35, 1] as const;
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const;

export const EASE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * The same curve as a mutable 4-tuple. Framer Motion types `ease` as
 * `[number, number, number, number]`, which a `readonly` tuple does not satisfy —
 * hence one explicitly typed twin rather than a cast at every call site.
 */
export const EASE_BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Cubic-bezier evaluator (Newton, with a bisection fallback). Exists so the one
 * curve can also drive a JS-driven tween — Lenis's scroll easing — instead of
 * that being the single place on the site with a hand-rolled approximation.
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (x: number) => number {
  const ax = 1 - 3 * x2 + 3 * x1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 1 - 3 * y2 + 3 * y1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-5) return sampleY(t);
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 12; i++) {
      t = (lo + hi) / 2;
      if (sampleX(t) < x) lo = t;
      else hi = t;
    }
    return sampleY(t);
  };
}

/** EASE_EXP as a plain (x) => y function, for scroll physics. */
export const EASE_EXP_FN = cubicBezier(...EASE_EXP);

/** Seconds — GSAP speaks seconds. */
export const DUR = {
  micro: 0.2,
  base: 0.42,
  section: 0.64,
  cinematic: 0.9,
} as const;

/** Seconds of gap between sibling elements in a staggered group. */
export const STAGGER = 0.07;

/** Framer Motion transition presets. */
export const transitions = {
  micro: { duration: DUR.micro, ease: EASE_BEZIER },
  base: { duration: DUR.base, ease: EASE_BEZIER },
  section: { duration: DUR.section, ease: EASE_BEZIER },
  cinematic: { duration: DUR.cinematic, ease: EASE_BEZIER },
  spring: { type: 'spring', stiffness: 240, damping: 30, mass: 0.7 },
  springSoft: { type: 'spring', stiffness: 120, damping: 22, mass: 0.9 },
} as const;

/** Shared scroll-reveal variant. Children stagger; the container owns the timing. */
export const staggerParent = (stagger = STAGGER, delay = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const riseChild = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.section, ease: EASE_BEZIER },
  },
};

/** Mask reveal: the element unrolls from its own baseline. */
export const maskChild = {
  hidden: { y: '110%' },
  show: {
    y: '0%',
    transition: { duration: DUR.cinematic, ease: EASE_BEZIER },
  },
};

export const fadeChild = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.section, ease: EASE_BEZIER } },
};

export const scaleChild = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.section, ease: EASE_BEZIER },
  },
};

/** Standard viewport trigger: fire once, slightly before the element centres. */
export const viewportOnce = { once: true, amount: 0.25 } as const;
