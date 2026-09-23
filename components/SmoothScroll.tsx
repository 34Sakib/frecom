'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, registerGsap } from '@/lib/gsap';
import { EASE_EXP_FN } from '@/lib/tokens';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { scrollToTop, setLenis } from '@/lib/scroll';

/**
 * SMOOTH SCROLL + SCROLLTRIGGER SYNC
 *
 * Lenis is driven from GSAP's ticker rather than its own rAF loop, so there is
 * one clock for scrolling, tweens and ScrollTrigger — the three cannot drift a
 * frame apart, which is the usual cause of a sticky section that shivers.
 *
 * Lenis's easing is the site curve (EASE_EXP) evaluated in JS, so the page
 * decelerates on exactly the same bezier as every CSS transition on the site.
 *
 * Reduced motion opts out of Lenis entirely and gets native scrolling. Nothing
 * downstream needs to know: lib/scroll.ts falls back to window.scrollTo.
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    // Mobile browsers resize the viewport when the URL bar collapses; without
    // this every such resize re-measures every trigger mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });
  }, []);

  useEffect(() => {
    if (reduced) {
      setLenis(null);
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: EASE_EXP_FN,
      smoothWheel: true,
      // Touch keeps the platform's own momentum: Lenis smoothing it is the one
      // place where "smooth" reads as lag on a phone.
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      autoRaf: false,
    });

    setLenis(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Nothing here should ever be smoothed over: a dropped frame must not make
    // the scroll position lie about where the user is.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  // A new route starts at the top, then gets re-measured once its own layout has
  // settled — two frames after paint, plus again when webfonts swap in, since
  // both change every trigger's start and end.
  useEffect(() => {
    scrollToTop(true);

    let cancelled = false;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!cancelled) ScrollTrigger.refresh();
      }),
    );
    const onFonts = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(onFonts).catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
