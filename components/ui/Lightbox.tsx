'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE_BEZIER } from '@/lib/tokens';
import { lockScroll } from '@/lib/scroll';
import { trapTabKey } from '@/lib/a11y';
import { useMounted } from '@/lib/hooks';

/**
 * MODAL SURFACE — material lightbox, and anything else that needs the same
 * contract: real dialog semantics, a focus trap, Escape, scroll lock, and focus
 * returned to whatever opened it.
 *
 * Portalled to <body> on purpose. Several surfaces on this site are transformed
 * (Tilt, the reveal wrappers) and a transformed ancestor becomes the containing
 * block for `position: fixed` — a dialog rendered in place would be clipped to
 * its card. The portal removes that class of bug entirely.
 */

export type LightboxProps = {
  open: boolean;
  onClose: () => void;
  /** Names the dialog for assistive tech. Rendered visually by the caller. */
  title: string;
  children: ReactNode;
  className?: string;
};

export function Lightbox({ open, onClose, title, children, className }: LightboxProps) {
  const reduced = useReducedMotion();
  const mounted = useMounted();
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    restore.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll(true);

    // Focus lands inside the dialog, never on the page behind it.
    const raf = requestAnimationFrame(() => panel.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      // Shared with the mobile nav so both traps behave identically.
      trapTabKey(panel.current, e);
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      cancelAnimationFrame(raf);
      lockScroll(false);
      restore.current?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_BEZIER }}
        >
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-ink/90 backdrop-blur-md"
          />

          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-lenis-prevent
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 10 }}
            transition={{ duration: DUR.section, ease: EASE_BEZIER }}
            className={`relative max-h-[86svh] w-full max-w-4xl overflow-y-auto rounded-lg border border-line bg-ink-800 shadow-[var(--shadow-lift)] outline-none ${
              className ?? ''
            }`}
          >
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:border-bone hover:text-bone"
            >
              ×
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
