'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cartCount, useCart, useUi } from '@/lib/store';
import { lockScroll, scrollToTop } from '@/lib/scroll';
import { trapTabKey } from '@/lib/a11y';
import { DUR, EASE_BEZIER } from '@/lib/tokens';
import { products } from '@/lib/products';
import { useMediaQuery } from '@/lib/hooks';

/**
 * HEADER
 *
 * Fixed, transparent over the top of every page and condensed once the page has
 * actually moved. The state flips on a scroll read, not a scroll listener per
 * frame: progress is written straight to a transform, and only the boolean that
 * changes the treatment is React state.
 *
 * The hairline under it is real scroll progress. On long pages it is the only
 * honest answer to "how much of this is left", so it earns its place — and it is
 * scroll-driven, so it does not count as decorative motion under reduced motion.
 *
 * Below lg the links move into a full-screen panel. That panel is a real dialog:
 * scroll lock, Escape, a focus trap, and focus returned to the page on close.
 */

const LINKS = [
  { href: '/products', label: 'Objects' },
  { href: '/about', label: 'Atelier' },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <span className="display-face text-[1.3rem] leading-none tracking-[-0.03em] text-bone">
      Frecom
      <span className="text-copper">.</span>
    </span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const wide = useMediaQuery('(min-width: 1024px)');

  const menuOpen = useUi((s) => s.menuOpen);
  const setMenuOpen = useUi((s) => s.setMenuOpen);

  const lines = useCart((s) => s.lines);
  const cartReady = useCart((s) => s.ready);
  const hydrateCart = useCart((s) => s.hydrate);
  const count = cartReady ? cartCount(lines) : 0;

  // The header is on every route, so this is the one place the persisted cart is
  // deliberately read back. The store skips hydration at import time so the
  // exported HTML never claims a bag the client cannot reproduce.
  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);

  const bar = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      const next = window.scrollY > 24;
      setCondensed((c) => (c === next ? c : next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const close = useCallback(() => setMenuOpen(false), [setMenuOpen]);

  // A navigation always ends the dialog, and so does growing past the breakpoint
  // that no longer has a menu button — otherwise the page would stay scroll-locked
  // with nothing on screen to release it.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    if (wide && menuOpen) setMenuOpen(false);
  }, [wide, menuOpen, setMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    lockScroll(true);
    const raf = requestAnimationFrame(() => panel.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      trapTabKey(panel.current, e);
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      cancelAnimationFrame(raf);
      lockScroll(false);
    };
  }, [menuOpen, setMenuOpen]);

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-[70]',
          condensed && !menuOpen ? 'bg-ink/85 backdrop-blur-xl' : 'bg-transparent',
        ].join(' ')}
      >
        <div
          className={[
            'border-b transition-colors duration-500 ease-[var(--ease-exp)]',
            condensed && !menuOpen ? 'border-line' : 'border-transparent',
          ].join(' ')}
        >
          <div className="shell flex h-16 items-center justify-between gap-4 lg:h-20">
            <Link
              href="/"
              aria-label="Frecom — home"
              className="shrink-0 py-2"
              onClick={() => {
                if (pathname === '/') scrollToTop(false);
              }}
            >
              <Wordmark />
            </Link>

            <div className="flex items-center gap-7 lg:gap-9">
              <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
                {LINKS.map((link) => {
                  const current = isCurrent(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={current ? 'page' : undefined}
                      className={`eyebrow link-line py-2 transition-colors duration-200 ease-[var(--ease-exp)] ${
                        current ? 'text-bone' : 'text-mist hover:text-bone'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <Link
                href="/cart"
                aria-current={isCurrent(pathname, '/cart') ? 'page' : undefined}
                aria-label={count > 0 ? `Bag, ${count} item${count === 1 ? '' : 's'}` : 'Bag'}
                className="eyebrow link-line flex items-center gap-2 py-2 text-mist transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
              >
                Bag
                {count > 0 && (
                  <span className="tabular inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-copper px-1 text-[0.625rem] leading-none tracking-normal text-white">
                    {count}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                className="eyebrow -mr-1 flex items-center gap-2.5 py-2 text-mist transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone lg:hidden"
              >
                Menu
                <span aria-hidden="true" className="flex flex-col gap-[5px]">
                  <span className="block h-px w-4 bg-current" />
                  <span className="block h-px w-4 bg-current" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Real read position, drawn as a hairline. Decorative to a screen
            reader — the page itself is the progress indicator. */}
        <div aria-hidden="true" className="shell">
          <div className="h-px w-full overflow-hidden">
            <div
              ref={bar}
              className="h-px origin-left bg-copper"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            key="site-menu"
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: DUR.section, ease: EASE_BEZIER }}
            className="fixed inset-0 z-[88] flex flex-col bg-[#f7f3ec] outline-none lg:hidden"
          >
            <div className="shell flex h-16 shrink-0 items-center justify-between">
              <Wordmark />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="eyebrow -mr-1 flex items-center gap-2 py-2 text-mist transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
              >
                Close
                <span aria-hidden="true" className="text-base leading-none">
                  ×
                </span>
              </button>
            </div>

            <nav
              aria-label="Menu"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              <div className="shell pb-20 pt-10">
                <ul className="list-none">
                  {[...LINKS, { href: '/cart', label: 'Bag' }].map((link) => (
                    <li key={link.href} className="border-t border-line last:border-b">
                      <Link
                        href={link.href}
                        onClick={close}
                        className="display-face flex items-baseline justify-between gap-6 py-5 text-h2 text-bone"
                      >
                        {link.label}
                        {link.href === '/cart' && count > 0 && (
                          <span className="eyebrow tabular text-copper">{count}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="eyebrow eyebrow-dark mt-14">Six objects</p>
                <ul className="mt-6 list-none">
                  {products.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={close}
                        className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                      >
                        <span className="text-h4 text-mist">{product.name}</span>
                        <span className="eyebrow eyebrow-dark shrink-0">{product.code}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className="shell shrink-0 border-t border-line py-5">
              <p className="text-small text-fog">
                Studio enquiries —{' '}
                <a href="mailto:studio@frecom.example" className="link-line text-copper">
                  studio@frecom.example
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
