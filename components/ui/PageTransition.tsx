'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE_BEZIER } from '@/lib/tokens';

/**
 * ROUTE-CHANGE SWEEP
 *
 * The App Router has no exit hook, so rather than fight it the transition passes
 * *through* the viewport instead of holding the old page back: a soft band with a
 * copper leading edge travels down the screen while the new page settles beneath
 * it (see app/template.tsx). Navigation stays exactly as fast as the router wants
 * to be — nothing here delays the next route.
 *
 * The band is deliberately short. A full-height curtain would hide the very
 * content the transition exists to introduce.
 */
export function PageTransition() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [sweep, setSweep] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    // The first paint is the preloader's job, not this one's.
    if (first.current) {
      first.current = false;
      return;
    }
    setSweep((n) => n + 1);
  }, [pathname]);

  return (
    <AnimatePresence>
      {sweep > 0 && !reduced && (
        <motion.div
          key={sweep}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[85]"
          initial={{ y: '-60%' }}
          animate={{ y: '160%' }}
          exit={{ opacity: 0, transition: { duration: DUR.micro, ease: EASE_BEZIER } }}
          transition={{ duration: DUR.cinematic, ease: EASE_BEZIER }}
        >
          <div className="relative h-[45vh] w-full bg-gradient-to-b from-transparent via-ink-800/70 to-transparent">
            <div className="absolute inset-x-0 bottom-0 h-px bg-copper/70" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
