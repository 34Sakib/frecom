'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { DUR, EASE_BEZIER, STAGGER, maskChild, viewportOnce } from '@/lib/tokens';

/**
 * SCROLL REVEALS — three shapes, one curve.
 *
 * A page that reveals everything the same way reads as machine-made, so there are
 * three: `Reveal` lifts a block, `RevealMask` unrolls type from its own baseline
 * (for headlines — the clip is what makes type look drawn rather than faded), and
 * `RevealGroup` + `RevealItem` stagger a set of siblings.
 *
 * Every one fires on first intersection and never again: content that re-animates
 * on the way back up is the clearest tell of a template. Under reduced motion the
 * elements render in their final state — the variants are attached, there is just
 * nothing left to travel.
 */

type Kind = 'rise' | 'fade' | 'scale';

const HIDDEN: Record<Kind, { opacity: number; y?: number; scale?: number }> = {
  rise: { opacity: 0, y: 26 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.96 },
};

const SHOWN: Record<Kind, { opacity: number; y?: number; scale?: number }> = {
  rise: { opacity: 1, y: 0 },
  fade: { opacity: 1 },
  scale: { opacity: 1, scale: 1 },
};

function variantsFor(kind: Kind, delay: number): Variants {
  return {
    hidden: HIDDEN[kind],
    show: {
      ...SHOWN[kind],
      transition: { duration: DUR.section, ease: EASE_BEZIER, delay },
    },
  };
}

/** Motion components these primitives may become, so pages keep real semantics. */
const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  figure: motion.figure,
  li: motion.li,
  span: motion.span,
} as const;

type Tag = keyof typeof TAGS;

type BlockProps = {
  children: ReactNode;
  className?: string;
  as?: Tag;
  delay?: number;
};

/** A single block that lifts into place the first time it is seen. */
export function Reveal({
  children,
  className,
  as = 'div',
  delay = 0,
  kind = 'rise',
}: BlockProps & { kind?: Kind }) {
  const reduced = useReducedMotion();
  const Tag = TAGS[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      variants={variantsFor(kind, delay)}
      initial={reduced ? false : 'hidden'}
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </Tag>
  );
}

/**
 * Mask reveal for headlines: the clip sits on the outer element, the type slides
 * up inside it. Wrap it in the real `h1`/`h2` — this only owns the movement.
 *
 * The trigger belongs to the clip, not to the type inside it. An element parked
 * a full line below an `overflow: hidden` parent contributes no visible area, and
 * IntersectionObserver scores it at zero forever — so watching the type meant
 * waiting for a reveal that could only begin once it had already happened. The
 * clip is never clipped, so the clip is what gets observed; the variant still
 * reaches the type by inheritance.
 */
export function RevealMask({ children, className, delay = 0, as = 'span' }: BlockProps) {
  const reduced = useReducedMotion();
  const Tag = TAGS[as] as typeof motion.span;
  const shown = maskChild.show;
  return (
    <Tag
      className={`block overflow-hidden ${className ?? ''}`}
      initial={reduced ? false : 'hidden'}
      whileInView="show"
      viewport={viewportOnce}
    >
      <Tag
        className="block will-change-transform"
        variants={{
          hidden: maskChild.hidden,
          show: { ...shown, transition: { ...shown.transition, delay } },
        }}
      >
        {children}
      </Tag>
    </Tag>
  );
}

/** Wraps a set of siblings; each `RevealItem` inside is offset by `stagger`. */
export function RevealGroup({
  children,
  className,
  as = 'div',
  stagger = STAGGER,
  delay = 0,
}: BlockProps & { stagger?: number }) {
  const reduced = useReducedMotion();
  const Tag = TAGS[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      initial={reduced ? false : 'hidden'}
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </Tag>
  );
}

/** A member of a `RevealGroup`. The trigger belongs to the parent. */
export function RevealItem({
  children,
  className,
  as = 'div',
  delay = 0,
  kind = 'rise',
}: BlockProps & { kind?: Kind }) {
  const Tag = TAGS[as] as typeof motion.div;
  return (
    <Tag className={className} variants={variantsFor(kind, delay)}>
      {children}
    </Tag>
  );
}
