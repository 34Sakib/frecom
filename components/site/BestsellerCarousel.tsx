'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Reveal, RevealMask } from '@/components/ui/Reveal';
import type { Product } from '@/lib/products';

export function BestsellerCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Curate 4 bestsellers
  const bestsellers = products.filter(
    (p) => p.featured || p.slug === 'aurora-01' || p.slug === 'monolith-09' || p.slug === 'atelier-t3' || p.slug === 'vantage'
  ).slice(0, 5);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scrollBy = (offset: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="shell py-[var(--space-section)]">
      {/* Header with quiet controls */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <p className="eyebrow eyebrow-dark">Curated Selection</p>
          <h2 className="display-face mt-6 text-h2 text-bone">
            <RevealMask>Bestsellers from the bench</RevealMask>
          </h2>
        </Reveal>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollBy(-380)}
            disabled={!canScrollLeft}
            aria-label="Scroll bestsellers left"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-bone shadow-xs transition-all duration-200 hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollBy(380)}
            disabled={!canScrollRight}
            aria-label="Scroll bestsellers right"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-bone shadow-xs transition-all duration-200 hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal Scroll-Snap Carousel */}
      <div
        ref={trackRef}
        role="region"
        aria-label="Bestselling products carousel"
        className="no-scrollbar mt-12 flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-2 -mx-[var(--space-gutter)] px-[var(--space-gutter)] sm:gap-8"
      >
        {bestsellers.map((product) => (
          <div
            key={product.slug}
            className="w-[82vw] shrink-0 snap-start sm:w-[22rem] lg:w-[25rem]"
          >
            <ProductCard
              product={product}
              showQuickAdd={true}
              plateCaption={`${product.name} — studio render`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
