'use client';

import { useLayoutEffect, useRef } from 'react';
import { LOCALE } from '@/lib/format';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { EASE_EXP_FN } from '@/lib/tokens';

/**
 * ANIMATED COUNTER
 *
 * The number that arrives is always the real one, read from the catalogue — the
 * animation only decides how it arrives. It runs on the site curve rather than a
 * stock ease-out, and it writes to the DOM node directly: a count-up does not
 * need sixty React renders to be legible.
 *
 * The final value is what gets prerendered, so the static HTML and a
 * reduced-motion visitor both show the truth without waiting for a scroll.
 */
export function Counter({
  value,
  decimals = 0,
  duration = 1.2,
  prefix,
  suffix,
  className,
}: {
  value: number;
  decimals?: number;
  /** Seconds. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  const format = (n: number) =>
    n.toLocaleString(LOCALE, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  useLayoutEffect(() => {
    const el = host.current;
    const text = el?.firstChild;
    if (!el || !text || reduced) return;

    let raf = 0;
    let startedAt = 0;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();

        const step = (now: number) => {
          if (!startedAt) startedAt = now;
          const t = Math.min(1, (now - startedAt) / (duration * 1000));
          // Easing the *value* is what makes the settle feel engineered.
          text.nodeValue = format(value * EASE_EXP_FN(t));
          if (t < 1) raf = requestAnimationFrame(step);
          else text.nodeValue = format(value);
        };

        text.nodeValue = format(0);
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      text.nodeValue = format(value);
    };
    // `format` closes over `decimals` only; the rest is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decimals, duration, reduced, value]);

  return (
    <span className={className}>
      {prefix}
      <span ref={host} className="tabular">
        {format(value)}
      </span>
      {suffix}
    </span>
  );
}
