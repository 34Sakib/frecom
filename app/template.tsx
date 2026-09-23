'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE_BEZIER } from '@/lib/tokens';

/**
 * Every route's entrance. `template.tsx` remounts on navigation, which is exactly
 * the lifecycle a page entrance wants — no exit coordination, no router fighting.
 *
 * Opacity only, deliberately: this wrapper is an ancestor of every section on the
 * page, and a live transform on an ancestor skews the bounding rects ScrollTrigger
 * measures. The travel in a route change is provided by the sweep instead
 * (components/ui/PageTransition.tsx).
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DUR.section, ease: EASE_BEZIER }}
    >
      {children}
    </motion.div>
  );
}
