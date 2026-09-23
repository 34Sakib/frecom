'use client';

import { useMemo } from 'react';
import { create } from 'zustand';
import { products, type Product } from '@/lib/products';

/**
 * THE HOVER-PEEK CONTRACT, WITHOUT THREE.JS
 *
 * The catalogue's cards need to be able to *ask* for a 3D preview, but they must
 * not drag three.js into the route to do it. Keeping the request protocol in its
 * own module means `ProductCard` imports a few hundred bytes, and the panel —
 * the only part that touches three — stays behind a dynamic import.
 *
 * The state lives in a store rather than a React context on purpose. A context
 * has to wrap the grid to be readable, which means the provider arrives *after*
 * the capability probe resolves and every card remounts as it lands. A store is
 * read from anywhere, so the panel can mount as a plain sibling whenever its
 * chunk finishes downloading and the grid never notices.
 *
 * Nothing here was ever mandatory: on a route with no panel mounted (the home
 * page runs two canvases already) these calls simply write state nobody reads.
 */

type PeekState = { product: Product; active: boolean };

export const usePeek = create<PeekState>(() => ({
  product: products[0],
  active: false,
}));

/** Show `product` in the floating panel. */
export function peekProduct(product: Product) {
  const s = usePeek.getState();
  if (s.active && s.product.slug === product.slug) return;
  usePeek.setState({ product, active: true });
}

/** Hide the panel. The last object stays loaded, so a re-hover is instant. */
export function dismissPeek() {
  if (usePeek.getState().active) usePeek.setState({ active: false });
}

/** Spread on the element that owns a product's hover area. */
export function useHoverPeek(product: Product) {
  return useMemo(
    () => ({
      onPointerEnter: () => peekProduct(product),
      onPointerLeave: () => dismissPeek(),
    }),
    [product],
  );
}
