'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { dismissPeek } from '@/components/three/peek';
import { DUR, EASE_BEZIER, STAGGER } from '@/lib/tokens';
import type { Product } from '@/lib/products';

/**
 * CATALOGUE GRID
 *
 * Deliberately a plain, uniform grid. The anti-template rule asks for varied
 * layouts, and variety is where it belongs — the home page, where the rhythm is
 * authored. Here the grid is a working surface that reshuffles on every filter and
 * sort; irregular tiles would just make the same six objects land somewhere new
 * each time and make price comparison harder. Uniform is the honest shape for a
 * catalogue.
 *
 * Reordering is animated with `layout`, so a filter reads as objects moving rather
 * than a hard cut, and dismissal is the one thing `popLayout` is for. Under
 * reduced motion the positions simply arrive.
 */
export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const signature = products.map((p) => p.slug).join('|');

  // The hovered card may be about to unmount; the shared preview panel must not
  // be left pointing at an object that is no longer on screen.
  useEffect(() => {
    dismissPeek();
  }, [signature]);

  if (products.length === 0) {
    return (
      <div className={`rounded-md border border-line bg-ink-800 px-8 py-20 text-center ${className ?? ''}`}>
        <p className="display-face text-h3 text-bone">Nothing in this category yet</p>
        <p className="mx-auto mt-4 max-w-[38ch] text-small text-fog">
          Every object is designed once and made for as long as it is wanted. Try
          another category, or view the whole catalogue.
        </p>
      </div>
    );
  }

  return (
    <motion.ul
      layout={!reduced}
      className={`relative grid list-none grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16 ${className ?? ''}`}
    >
      <AnimatePresence mode="popLayout">
        {products.map((product, i) => (
          <motion.li
            key={product.slug}
            layout={!reduced}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.985 }}
            transition={{
              duration: reduced ? DUR.micro : DUR.section,
              ease: EASE_BEZIER,
              delay: reduced ? 0 : Math.min(i * STAGGER, 0.4),
            }}
          >
            <ProductCard product={product} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
