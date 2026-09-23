'use client';

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ScrollTrigger, registerGsap } from '@/lib/gsap';
import { useMediaQuery, usePrefersReducedMotion } from '@/lib/hooks';
import { scrollToPosition } from '@/lib/scroll';

/** Layout effects are what keep the pinned swap free of a frame at height 0. */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * HORIZONTAL RAIL
 *
 * Vertical scroll drives horizontal travel: the section is as tall as the rail
 * is long, the viewport sticks at the top of it, and the list is translated by
 * real scroll progress. No separate gesture to learn, one scrollbar throughout.
 *
 * Two things this deliberately does not do:
 *   - it is not a scroll container in this mode, so the page never traps a
 *     wheel gesture, and the browser's own back/forward scroll restore holds
 *   - the transform is written straight to the DOM in onUpdate. Progress is
 *     never React state, so a long rail costs zero re-renders; only the active
 *     index is state, and only when it actually changes
 *
 * Keyboard: items that would sit off-screen get revealed by moving the page to
 * the progress that brings them into view, so tabbing through the rail works
 * without a mouse.
 *
 * Until hydration resolves the media query, and permanently below lg or under
 * reduced motion, none of that applies: the rail is a real overflow scroller
 * instead — focusable, snap-aligned, native. That is also what gets prerendered
 * into the static HTML, so the pattern is usable before any JS arrives.
 */
export function HorizontalRail({
  children,
  label,
  className,
}: {
  children: ReactNode;
  /** Used for the scroll region's accessible name. */
  label: string;
  className?: string;
}) {
  const items = Children.toArray(children);
  const count = items.length;

  const outer = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLUListElement | null>(null);
  const bar = useRef<HTMLDivElement | null>(null);
  const travel = useRef(0);

  const [index, setIndex] = useState(0);

  const wide = useMediaQuery('(min-width: 1024px)');
  const reduced = usePrefersReducedMotion();
  const pinned = wide && !reduced && count > 1;

  useIsoLayoutEffect(() => {
    if (!pinned) return;
    registerGsap();

    const shell = outer.current;
    const row = track.current;
    if (!shell || !row) return;

    const measure = () => {
      travel.current = Math.max(0, row.scrollWidth - window.innerWidth);
      shell.style.height = `${window.innerHeight + travel.current}px`;
    };

    measure();

    // A second pass once the sticky box is in place: fonts and the flex row can
    // both land a frame later, and this is the measurement everything below the
    // rail is positioned from.
    const raf = requestAnimationFrame(() => {
      measure();
      ScrollTrigger.refresh();
    });

    const ro = new ResizeObserver(() => {
      measure();
      ScrollTrigger.refresh();
    });
    ro.observe(row);

    const st = ScrollTrigger.create({
      trigger: shell,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        row.style.transform = `translate3d(${-p * travel.current}px, 0, 0)`;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        const next = Math.min(count - 1, Math.round(p * (count - 1)));
        setIndex((i) => (i === next ? i : next));
      },
    });

    return () => {
      cancelAnimationFrame(raf);
      st.kill();
      ro.disconnect();
      shell.style.height = '';
      row.style.transform = '';
      if (bar.current) bar.current.style.transform = '';
      ScrollTrigger.refresh();
    };
  }, [pinned, count]);

  /** Tabbing to an off-screen item moves the page to the progress that shows it. */
  const onFocusCapture = useCallback(() => {
    if (!pinned) return;
    const row = track.current;
    const shell = outer.current;
    const item = document.activeElement?.closest('[data-rail-item]') as HTMLElement | null;
    if (!row || !shell || !item) return;

    const box = item.getBoundingClientRect();
    if (box.left >= 24 && box.right <= window.innerWidth - 24) return;

    const span = travel.current;
    if (!span) return;
    const pad = parseFloat(getComputedStyle(row).paddingLeft) || 0;
    const p = Math.min(1, Math.max(0, (item.offsetLeft - pad) / span));
    scrollToPosition(shell.getBoundingClientRect().top + window.scrollY + p * span);
  }, [pinned]);

  const counter = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={className}>
      <div
        ref={outer}
        className={pinned ? 'relative' : undefined}
        // Before the swap, and on every device that never gets the pin, this is
        // an ordinary horizontal scroll region — which needs a name and a tab
        // stop to be reachable by keyboard at all.
        role={pinned ? undefined : 'region'}
        aria-label={pinned ? undefined : `${label} — scrollable gallery`}
        tabIndex={pinned ? undefined : 0}
      >
        <div
          className={[
            'flex h-[100svh] flex-col justify-center',
            pinned ? 'sticky top-0 overflow-hidden' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="shell mb-7 flex items-baseline justify-between gap-6 lg:mb-10">
            <span className="eyebrow">{label}</span>
            {count > 1 && (
              <span className="eyebrow tabular">
                {counter(index + 1)} / {counter(count)}
              </span>
            )}
          </div>

          <ul
            ref={track}
            onFocusCapture={onFocusCapture}
            className={[
              'relative flex list-none items-stretch gap-5 lg:gap-8',
              pinned
                ? 'will-change-transform'
                : 'no-scrollbar snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
            ].join(' ')}
            style={{ paddingInline: 'var(--space-gutter)' }}
          >
            {items.map((child, i) => (
              <li
                key={i}
                data-rail-item
                className={pinned ? 'shrink-0' : 'shrink-0 snap-start'}
              >
                {child}
              </li>
            ))}
          </ul>

          <div className="shell mt-7 lg:mt-10" aria-hidden="true">
            <div className="h-px w-full bg-line">
              <div
                ref={bar}
                className="h-px origin-left bg-copper"
                style={{ transform: pinned ? 'scaleX(0)' : 'scaleX(1)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
