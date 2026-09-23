'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, registerGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * SCROLL-LINKED DRIFT
 *
 * `speed` is a fraction of the element's own height, so the same number reads the
 * same on a phone and on a 5K display — a fixed pixel offset would not. The tween
 * is scrubbed against the element's own passage through the viewport, which is
 * what lets a foreground plane and a background plane separate without either of
 * them appearing to lag.
 *
 * Transform only, written by GSAP on its own ticker: no layout reads, no React
 * renders. Reduced motion gets the element in place, un-transformed.
 */
export function Parallax({
  children,
  className,
  speed = 0.16,
  rotate = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Positive drifts up as the page moves down (reads as "further away"). */
  speed?: number;
  /** Optional degrees of tilt across the same pass. */
  rotate?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const box = host.current;
    const el = inner.current;
    if (!box || !el || reduced) return;
    registerGsap();

    const tween = gsap.fromTo(
      el,
      { yPercent: speed * 50, rotate: -rotate },
      {
        yPercent: -speed * 50,
        rotate,
        ease: 'none',
        scrollTrigger: {
          trigger: box,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el, { clearProps: 'transform' });
    };
  }, [reduced, rotate, speed]);

  return (
    <div ref={host} className={className}>
      <div ref={inner} className={reduced ? undefined : 'will-change-transform'}>
        {children}
      </div>
    </div>
  );
}
