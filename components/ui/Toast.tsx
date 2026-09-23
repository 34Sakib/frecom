'use client';

import Link from 'next/link';
import { create } from 'zustand';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE_BEZIER } from '@/lib/tokens';

/**
 * Add-to-cart confirmation. A live region that is always in the DOM, so a screen
 * reader has something to announce into — the toast itself is just the visible
 * half of the message.
 *
 * The auto-dismiss is the one timer on the site that is honest: it is measuring
 * how long a human needs to read a sentence, not pretending to measure work.
 */

export type ToastAction = { label: string; href: string };

type ToastItem = { id: number; message: string; action?: ToastAction };

type ToastState = {
  items: ToastItem[];
  push: (message: string, action?: ToastAction) => void;
  dismiss: (id: number) => void;
};

let seq = 0;

const useToasts = create<ToastState>((set, get) => ({
  items: [],
  push: (message, action) => {
    const id = ++seq;
    // Three at once is already more than anyone reads; the oldest gives way.
    set((s) => ({ items: [...s.items.slice(-2), { id, message, action }] }));
    window.setTimeout(() => get().dismiss(id), 5200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

/** Imperative seam: any component can confirm an action without subscribing. */
export const toast = (message: string, action?: ToastAction) =>
  useToasts.getState().push(message, action);

export function Toaster() {
  const items = useToasts((s) => s.items);
  const dismiss = useToasts((s) => s.dismiss);
  const reduced = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-24 z-[80] flex w-[min(23rem,calc(100vw-2rem))] flex-col gap-2 sm:right-6"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout={!reduced}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: DUR.base, ease: EASE_BEZIER }}
            className="pointer-events-auto flex items-start gap-4 rounded-md border border-line bg-ink-800/95 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm"
          >
            <p className="flex-1 text-small text-mist">{item.message}</p>
            {item.action && (
              <Link
                href={item.action.href}
                onClick={() => dismiss(item.id)}
                className="eyebrow link-line shrink-0 text-copper"
              >
                {item.action.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="-mr-1 shrink-0 px-1 text-base leading-none text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
