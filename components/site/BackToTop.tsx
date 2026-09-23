'use client';

import { scrollToPosition } from '@/lib/scroll';

/**
 * The footer's single client need, kept as its own island so the rest of the
 * footer — links, index, fine print — can stay a server component and ship no JS.
 */
export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => scrollToPosition(0)}
      className="eyebrow group flex items-center gap-3 py-2 text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
    >
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-[var(--duration-base)] ease-[var(--ease-exp)] group-hover:-translate-y-1"
      >
        ↑
      </span>
      Back to top
    </button>
  );
}
