'use client';

import type { ReactNode } from 'react';

/**
 * A transform loop with no per-frame logic to compute, so it belongs in CSS
 * rather than a rAF. The global reduced-motion block zeroes its duration, which
 * freezes the band at its start offset — the band still reads correctly as a
 * line of words, it simply stops travelling.
 */

export type MarqueeProps = {
  items: ReactNode[];
  className?: string;
  /** Seconds for one full loop. */
  speed?: number;
  reverse?: boolean;
  tone?: 'dark' | 'light';
};

export function Marquee({
  items,
  className,
  speed = 42,
  reverse = false,
  tone = 'dark',
}: MarqueeProps) {
  const copy = (clone: boolean) => (
    <div
      key={clone ? 'clone' : 'source'}
      className="flex shrink-0 items-center"
      aria-hidden={clone || undefined}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`display-face whitespace-nowrap text-h3 ${
              tone === 'light' ? 'text-ink' : 'text-bone'
            }`}
          >
            {item}
          </span>
          <span
            aria-hidden="true"
            className="mx-8 inline-block h-1 w-1 shrink-0 rotate-45 bg-copper"
          />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`relative flex overflow-hidden ${className ?? ''}`}>
      <div
        className="flex w-max will-change-transform"
        style={{ animation: `marquee-x ${speed}s linear infinite${reverse ? ' reverse' : ''}` }}
      >
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
