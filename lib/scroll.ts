'use client';

import type Lenis from 'lenis';

/**
 * Smooth-scroll seam.
 *
 * Lives in its own module so the nav, the mobile menu and the rail can drive the
 * page without importing the provider component, and so there is exactly one
 * answer to "where does the page actually scroll from".
 *
 * Native scrolling is left completely alone when Lenis is absent (reduced
 * motion, no JS yet, or a device we chose not to smooth) — everything here
 * degrades to window.scrollTo, which means callers never need a branch.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}

export function scrollToTop(immediate = true): void {
  if (instance) instance.scrollTo(0, { immediate });
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
}

/** Scrolls an element to just under the fixed header. */
export function scrollToId(id: string, offset = -12): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  if (instance) instance.scrollTo(el, { offset, duration: 1.05 });
  else el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  return true;
}

export function scrollToPosition(top: number, immediate = false): void {
  if (instance) instance.scrollTo(top, { immediate });
  else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
}

export function lockScroll(locked: boolean): void {
  if (instance) {
    if (locked) instance.stop();
    else instance.start();
  }
  // globals.css hides overflow on this attribute, so the lock also holds for
  // keyboard and scrollbar input.
  if (locked) document.body.setAttribute('data-lenis-locked', '');
  else document.body.removeAttribute('data-lenis-locked');
}
