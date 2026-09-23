'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE_BEZIER } from '@/lib/tokens';
import { lockScroll } from '@/lib/scroll';
import { useLoad, useLoadProgress, useLoaded } from '@/lib/store';

/**
 * REAL-PROGRESS LOADER
 *
 * The bar is wired to actual blocking work — web fonts resolving, and the WebGL
 * host reporting its first drawn frame or deciding not to draw at all (see
 * lib/store.ts for the weights, components/three/Stage.tsx for the beacon). There
 * is no choreography here: on a fast machine the overlay is gone in a few
 * hundred milliseconds, exactly as it should be.
 *
 * SAFETY_MS is a trapdoor, not a timer. If a signal is ever lost — a browser that
 * never settles document.fonts, a context that dies before its first frame — the
 * overlay still lifts, so the site can never be locked behind a spinner.
 */
const SAFETY_MS = 6500;

export function Preloader() {
  const progress = useLoadProgress();
  const loaded = useLoaded();
  const reduced = useReducedMotion();
  const markFonts = useLoad((s) => s.markFonts);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fonts = document.fonts;
    if (!fonts) {
      markFonts();
    } else {
      const settle = () => {
        if (!cancelled) markFonts();
      };
      fonts.ready.then(settle).catch(settle);
    }

    const trapdoor = window.setTimeout(() => setForced(true), SAFETY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(trapdoor);
    };
  }, [markFonts]);

  const done = loaded || forced;
  const percent = Math.round(progress * 100);

  // The curtain owns the scroll until it lifts — otherwise the first gesture
  // scrolls a page the visitor cannot yet see.
  useEffect(() => {
    lockScroll(!done);
  }, [done]);

  return (
    <>
      {/* No JS, no curtain: the export must never hide its own content. */}
      <noscript>
        <style>{`[data-preloader]{display:none !important}`}</style>
      </noscript>

      <AnimatePresence>
        {!done && (
          <motion.div
            key="preloader"
            data-preloader
            initial={false}
            animate={{ y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '-101%' }}
            transition={{ duration: reduced ? DUR.micro : DUR.cinematic, ease: EASE_BEZIER }}
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink px-[var(--space-gutter)] pb-10 pt-8"
          >
            <div className="flex items-baseline justify-between">
              <span className="eyebrow eyebrow-dark">Frecom — audio objects</span>
              <span className="eyebrow eyebrow-dark tabular">{percent}%</span>
            </div>

            <div className="flex flex-col gap-8">
              <p className="display-face text-h1 text-bone">Frecom</p>
              <div
                role="progressbar"
                aria-label="Loading"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="h-px w-full bg-line"
              >
                <div
                  className="h-px origin-left bg-copper"
                  style={{
                    transform: `scaleX(${progress})`,
                    transition: `transform ${DUR.section}s cubic-bezier(0.16, 1, 0.3, 1)`,
                  }}
                />
              </div>
              <p className="max-w-[34ch] text-small text-ash">
                Studio-lit objects, rendered live. If your device would rather not run
                WebGL, you will see a still render instead — everything on this site
                remains readable either way.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
