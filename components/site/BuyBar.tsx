'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCart } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import { money } from '@/lib/format';
import { DUR, EASE_BEZIER } from '@/lib/tokens';
import { useMounted } from '@/lib/hooks';
import type { Finish, Product } from '@/lib/products';

/**
 * STICKY BUY BAR
 *
 * Appears only once the real add-to-bag block has scrolled past the top of the
 * viewport, and disappears the moment it comes back — so the page never shows two
 * purchase controls at once, and the bar is never a duplicate affordance, only a
 * replacement for one that has left the screen.
 *
 * Portalled to <body>. Everything on the detail page that animates sits inside
 * transformed wrappers, and a transformed ancestor becomes the containing block
 * for `position: fixed` — in place, this bar would be clipped to its parent.
 */
export function BuyBar({
  product,
  finish,
  /** id of the element the bar waits for — the page's primary add-to-bag block. */
  watch,
}: {
  product: Product;
  finish: Finish;
  watch: string;
}) {
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const add = useCart((s) => s.add);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(watch);
    if (!anchor || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => {
        // Past it, not merely off-screen: an anchor below the fold on load must
        // not raise the bar before anything has been read.
        setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, [watch]);

  const addToBag = () => {
    add(product.slug, finish.id);
    toast(`${product.name} — ${finish.name} added to your bag.`, {
      label: 'View bag',
      href: '/cart',
    });
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="buy-bar"
          initial={reduced ? { opacity: 0 } : { y: '110%' }}
          animate={reduced ? { opacity: 1 } : { y: '0%' }}
          exit={reduced ? { opacity: 0 } : { y: '110%' }}
          transition={{ duration: reduced ? DUR.micro : DUR.base, ease: EASE_BEZIER }}
          className="fixed inset-x-0 bottom-0 z-[74] border-t border-line bg-ink-800/95 backdrop-blur-xl"
        >
          <div className="shell flex items-center justify-between gap-4 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            <div className="min-w-0">
              <p className="display-face truncate text-h4 leading-tight text-bone">
                {product.name}
              </p>
              <p className="eyebrow eyebrow-dark mt-1.5 truncate">
                <span className="tabular text-mist">{money(product.priceCents)}</span>
                <span className="mx-2 text-line-soft">/</span>
                {finish.name}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/cart"
                className="eyebrow link-line hidden py-2 text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone sm:inline-block"
              >
                Bag
              </Link>
              <button type="button" onClick={addToBag} className="btn btn-copper">
                Add to bag
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
