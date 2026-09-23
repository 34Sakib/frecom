'use client';

import { useEffect, useRef } from 'react';
import { EASE, gsap, registerGsap } from '@/lib/gsap';
import { useMediaQuery, usePrefersReducedMotion } from '@/lib/hooks';

/**
 * MORPHING CURSOR
 *
 * Pointer-only and motion-only: on touch, or with reduced motion, this renders
 * nothing and the system cursor is the cursor.
 *
 * The native cursor is deliberately NOT hidden. Replacing the one thing the user
 * uses to point with a slower, damped imitation is a usability tax for a purely
 * decorative gain — so this is additive: a soft ring that trails the real
 * pointer and swells over anything interactive, with an optional label from
 * `data-cursor="Drag"`.
 */

const INTERACTIVE = 'a, button, input, select, textarea, [role="radio"], [data-cursor]';
const RING = 44;
const HALF = RING / 2;

export function Cursor() {
  const fine = useMediaQuery('(pointer: fine)');
  const reduced = usePrefersReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hostEl = host.current;
    const ringEl = ring.current;
    const dotEl = dot.current;
    const labelEl = label.current;
    if (!fine || reduced || !hostEl || !ringEl || !dotEl || !labelEl) return;

    registerGsap();
    gsap.set(hostEl, { x: -100, y: -100, autoAlpha: 0 });
    gsap.set(ringEl, { scale: 0.55, opacity: 0.3, transformOrigin: '50% 50%' });
    gsap.set(labelEl, { opacity: 0 });

    const xTo = gsap.quickTo(hostEl, 'x', { duration: 0.35, ease: EASE });
    const yTo = gsap.quickTo(hostEl, 'y', { duration: 0.35, ease: EASE });

    // One place decides the ring's geometry, so a press mid-hover and a hover
    // mid-press can't leave it stuck at the wrong size.
    let scale = 0.55;
    let opacity = 0.3;
    let tagged = false;
    let pressed = false;
    let visible = false;

    const apply = () => {
      gsap.to(ringEl, {
        scale: pressed ? scale * 0.82 : scale,
        opacity,
        duration: 0.42,
        ease: EASE,
        overwrite: 'auto',
      });
      gsap.to(dotEl, { scale: tagged ? 0 : 1, duration: 0.32, ease: EASE, overwrite: 'auto' });
    };

    const setLabel = (text: string | null) => {
      if (!text) {
        gsap.to(labelEl, { opacity: 0, duration: 0.16, ease: EASE, overwrite: 'auto' });
        return;
      }
      if (labelEl.textContent !== text) labelEl.textContent = text;
      gsap.to(labelEl, { opacity: 1, duration: 0.24, ease: EASE, overwrite: 'auto' });
    };

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.set(hostEl, { x: e.clientX, y: e.clientY });
        gsap.to(hostEl, { autoAlpha: 1, duration: 0.3, ease: EASE, overwrite: 'auto' });
        return;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const hit = target?.closest?.(INTERACTIVE) as HTMLElement | null | undefined;
      const text = hit?.dataset.cursor ?? null;

      if (!hit) {
        scale = 0.55;
        opacity = 0.3;
        tagged = false;
      } else if (text) {
        scale = 2.1;
        opacity = 1;
        tagged = true;
      } else {
        scale = 1;
        opacity = 1;
        tagged = false;
      }

      setLabel(text);
      apply();
    };

    const onDown = () => {
      pressed = true;
      apply();
    };

    const onUp = () => {
      pressed = false;
      apply();
    };

    const onLeave = () => {
      visible = false;
      gsap.to(hostEl, { autoAlpha: 0, duration: 0.24, ease: EASE, overwrite: 'auto' });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      gsap.killTweensOf([hostEl, ringEl, dotEl, labelEl]);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div ref={host} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[120]">
      <div
        ref={ring}
        className="absolute rounded-full border border-copper"
        style={{ left: -HALF, top: -HALF, width: RING, height: RING }}
      />
      <span
        ref={label}
        className="eyebrow absolute left-0 top-0 whitespace-nowrap rounded-full border border-copper/40 bg-ink/90 px-2.5 py-1 text-copper"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={dot}
        className="absolute rounded-full bg-copper"
        style={{ left: -2, top: -2, width: 4, height: 4 }}
      />
    </div>
  );
}
