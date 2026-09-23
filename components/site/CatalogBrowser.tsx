'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { ProductGrid } from './ProductGrid';
import {
  categories,
  sortProducts,
  sorts,
  type Product,
  type SortId,
} from '@/lib/products';
import { canRender3D, useCapability, useMediaQuery } from '@/lib/hooks';
import { DUR, EASE_BEZIER } from '@/lib/tokens';

/**
 * The peek panel is the only part of the catalogue that needs three.js, and it is
 * fetched only on a device that will actually draw it — same budget as every
 * other canvas: a pointer that can hover, a device past the WebGL probe, and no
 * reduced-motion preference, since a panel that follows the cursor is exactly the
 * motion that preference refuses.
 */
const PeekPanel = dynamic(
  () => import('@/components/three/PeekPanel').then((m) => m.PeekPanel),
  { ssr: false },
);

/**
 * CATALOGUE
 *
 * Filters and sorts are the only stateful controls on the route and they are real
 * controls: toggle buttons that announce their own pressed state, a native
 * `<select>` for sort (the platform's own listbox is better than any custom one),
 * and a live region reporting how many objects survived the filter.
 *
 * Filtering happens in memory — the whole catalogue is six objects, authored at
 * build time — so there is no loading state to fake and nothing to prefetch.
 */
export function CatalogBrowser({ products }: { products: Product[] }) {
  const cap = useCapability();
  const fine = useMediaQuery('(pointer: fine)');
  const reduced = useReducedMotion();

  const [categoryId, setCategoryId] = useState<string>('all');
  const [sort, setSort] = useState<SortId>('designed');

  // Read URL query param on mount so direct links from category tiles filter immediately
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && categories.some((c) => c.id === cat)) {
      setCategoryId(cat);
    }
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>([['all', products.length]]);
    for (const product of products) {
      map.set(product.categoryId, (map.get(product.categoryId) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const shown = useMemo(
    () =>
      sortProducts(
        categoryId === 'all'
          ? products
          : products.filter((p) => p.categoryId === categoryId),
        sort,
      ),
    [products, categoryId, sort],
  );

  const peekable = cap.probed && canRender3D(cap) && !cap.touch && fine && !reduced;

  return (
    <>
      <div className="sticky top-16 z-30 border-y border-line bg-[#f7f3ec]/90 backdrop-blur-xl lg:top-20">
        <div className="shell flex flex-wrap items-center gap-x-8 gap-y-3 py-3">
          <div
            role="group"
            aria-label="Filter by category"
            className="no-scrollbar order-1 -mx-1 min-w-0 flex-1 overflow-x-auto px-1"
          >
            <div className="flex items-center gap-7 whitespace-nowrap">
              {categories.map((category) => {
                const active = category.id === categoryId;
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategoryId(category.id)}
                    className={`relative py-2 text-small transition-colors duration-200 ease-[var(--ease-exp)] ${
                      active ? 'text-bone' : 'text-mist hover:text-bone'
                    }`}
                  >
                    {category.name}
                    <span
                      className={`eyebrow tabular ml-2 ${
                        active ? 'text-copper' : 'eyebrow-dark'
                      }`}
                    >
                      {counts.get(category.id) ?? 0}
                    </span>
                    {active &&
                      (reduced ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-px bg-copper"
                        />
                      ) : (
                        <motion.span
                          aria-hidden="true"
                          layoutId="catalog-filter"
                          transition={{ duration: DUR.base, ease: EASE_BEZIER }}
                          className="absolute inset-x-0 bottom-0 h-px bg-copper"
                        />
                      ))}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="order-3 flex items-center gap-6 sm:order-2">
            {/* The one number on the page that changes without a navigation, so
                it is the one number that has to say so out loud. */}
            <p aria-live="polite" className="eyebrow eyebrow-dark tabular">
              {shown.length} of {products.length}
            </p>

            <label className="flex items-center gap-3">
              <span className="eyebrow eyebrow-dark">Sort</span>
              <span className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortId)}
                  className="field w-auto cursor-pointer appearance-none py-2 pl-3 pr-9 text-small"
                >
                  {sorts.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ash"
                >
                  ▾
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="shell pb-[var(--space-section)] pt-[clamp(2.5rem,6vw,4.5rem)]">
        {/* Hidden but real: the cards below are h3, so without this the outline
            jumps h1 → h3. The filter bar already names the list on screen. */}
        <h2 className="sr-only">All objects</h2>
        <ProductGrid products={shown} />
      </div>

      {peekable && <PeekPanel />}
    </>
  );
}
