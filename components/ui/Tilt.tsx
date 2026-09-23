'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { EASE, gsap, registerGsap } from '@/lib/gsap';
import { useMediaQuery, usePrefersReducedMotion } from '@/lib/hooks';

/**
 * TILT
 *
 * A shallow rotation toward the pointer plus a light sheen that tracks it. Kept
 * to a few degrees: past about eight the object stops reading as a surface and
 * starts reading as a toy. The sheen is a radial gradient positioned by two CSS
 * custom properties written in the same handler, so the highlight and the
 * rotation are always describing the same cursor position.
 *
 * Mouse pointers only. Note for callers: a transform on this element makes it a
 * containing block, so nothing `position: fixed` may live inside it.
 */
export function Tilt({
  children,
  className,
  max = 6,
  sheen = true,
}: {
  children: ReactNode;
  className?: string;
  /** Degrees at the outer edge. */
  max?: number;
  sheen?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const fine = useMediaQuery('(pointer: fine)');
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = el.current;
    if (!node || !fine || reduced) return;
    registerGsap();

    gsap.set(node, { transformPerspective: 1000, transformOrigin: 'center' });
    const rx = gsap.quickTo(node, 'rotationX', { duration: 0.6, ease: EASE });
    const ry = gsap.quickTo(node, 'rotationY', { duration: 0.6, ease: EASE });

    const onMove = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 2 * max);
      rx((0.5 - py) * 2 * max);
      node.style.setProperty('--sheen-x', `${(px * 100).toFixed(1)}%`);
      node.style.setProperty('--sheen-y', `${(py * 100).toFixed(1)}%`);
      node.style.setProperty('--sheen-o', '1');
    };
    const onLeave = () => {
      rx(0);
      ry(0);
      node.style.setProperty('--sheen-o', '0');
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(node);
      gsap.set(node, { clearProps: 'transform' });
    };
  }, [fine, max, reduced]);

  return (
    <div
      ref={el}
      className={`relative [transform-style:preserve-3d] ${className ?? ''}`}
    >
      {children}
      {sheen && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ease-[var(--ease-exp)]"
          style={{
            opacity: 'var(--sheen-o, 0)',
            background:
              'radial-gradient(380px circle at var(--sheen-x, 50%) var(--sheen-y, 0%), rgb(255 255 255 / 0.07), transparent 62%)',
          }}
        />
      )}
    </div>
  );
}
