'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { EASE, gsap, registerGsap } from '@/lib/gsap';
import { useMediaQuery, usePrefersReducedMotion } from '@/lib/hooks';

/**
 * MAGNETIC HOVER
 *
 * The element leans a fraction of the way toward the pointer, then settles back
 * when it leaves. Two constraints keep it from feeling gimmicky: the offset is a
 * cap rather than a multiplier of distance (a wide element must not travel
 * further than a narrow one), and it is attached to mouse pointers only — on
 * touch there is no hover to reward, and the settle-back would fire on tap.
 *
 * `quickTo` reuses one tween per axis, so a fast sweep across the button costs a
 * couple of value writes instead of spawning a tween per pointermove.
 */
export function Magnetic({
  children,
  className,
  strength = 0.28,
  max = 14,
}: {
  children: ReactNode;
  className?: string;
  /** Fraction of the pointer's offset from centre that the element adopts. */
  strength?: number;
  /** Hard cap, in px. */
  max?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const fine = useMediaQuery('(pointer: fine)');
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const box = host.current;
    const el = inner.current;
    if (!box || !el || !fine || reduced) return;
    registerGsap();

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: EASE });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: EASE });
    const clamp = gsap.utils.clamp(-max, max);

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      xTo(clamp((e.clientX - (r.left + r.width / 2)) * strength));
      yTo(clamp((e.clientY - (r.top + r.height / 2)) * strength));
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerleave', onLeave);
    return () => {
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: 'transform' });
    };
  }, [fine, max, reduced, strength]);

  return (
    <div ref={host} className={className}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
