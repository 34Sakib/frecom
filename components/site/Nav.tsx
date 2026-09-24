'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useUi } from '@/lib/store';
import { lockScroll, scrollToTop } from '@/lib/scroll';
import { trapTabKey } from '@/lib/a11y';
import { DUR, EASE_BEZIER } from '@/lib/tokens';
import { products } from '@/lib/products';
import { useMediaQuery } from '@/lib/hooks';

/**
 * HEADER
 *
 * Fixed, obsidian glassmorphic header over the top of every exhibition page.
 * The hairline underneath is real scroll progress.
 * High-end digital showroom navigation: Objects, Atelier, Contact.
 */

const LINKS = [
  { href: '/collection', label: 'Objects' },
  { href: '/about', label: 'Atelier' },
  { href: '/contact', label: 'Contact' },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <span className="display-face text-[1.35rem] leading-none tracking-[-0.03em] text-bone">
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
          condensed && !menuOpen ? 'bg-ink/80 backdrop-blur-xl' : 'bg-transparent',
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
                        current ? 'text-bone' : 'text-fog hover:text-bone'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                className="eyebrow -mr-1 flex items-center gap-2.5 py-2 text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone lg:hidden"
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

        {/* Scroll progress hairline */}
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
            className="fixed inset-0 z-[88] flex flex-col bg-ink outline-none lg:hidden"
          >
            <div className="shell flex h-16 shrink-0 items-center justify-between">
              <Wordmark />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="eyebrow -mr-1 flex items-center gap-2 py-2 text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
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
                  {LINKS.map((link) => (
                    <li key={link.href} className="border-t border-line last:border-b">
                      <Link
                        href={link.href}
                        onClick={close}
                        className="display-face flex items-baseline justify-between gap-6 py-5 text-h2 text-bone"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="eyebrow eyebrow-dark mt-14">Six objects in exhibition</p>
                <ul className="mt-6 list-none">
                  {products.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={`/collection/${product.slug}`}
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
                <a href="mailto:studio@frecom.audio" className="link-line text-copper">
                  studio@frecom.audio
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
