'use client';

import { ProductCard } from './ProductCard';
import { Reveal, RevealGroup, RevealItem, RevealMask } from '@/components/ui/Reveal';
import type { Product } from '@/lib/products';

export function NewArrivalsGrid({ products }: { products: Product[] }) {
  // Grab items marked isNew (Monolith 09 and Halo), plus Vantage amplifier
  const newArrivals = products.filter((p) => p.isNew || p.year === 2025).slice(0, 2);
  const companion = products.find((p) => p.slug === 'plinth-stand') ?? products[4];

  return (
    <section className="shell py-[var(--space-section)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="rounded border border-copper/50 bg-[#efe7da] px-2.5 py-0.5 text-[0.625rem] font-mono uppercase tracking-widest text-copper shadow-xs">
              Just Dropped
            </span>
            <p className="eyebrow eyebrow-dark">2025 Workshop Additions</p>
          </div>
          <h2 className="display-face mt-6 text-h2 text-bone">
            <RevealMask>New arrivals from the bench</RevealMask>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="max-w-[36ch] text-small text-fog sm:text-right">
            Freshly engineered geometries entering continuous production this season.
          </p>
        </Reveal>
      </div>

      <RevealGroup className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {newArrivals.map((product) => (
          <RevealItem key={product.slug} className="flex flex-col">
            <div className="relative">
              <ProductCard
                product={product}
                showQuickAdd={true}
                plateCaption={`${product.name} — 2025 edition`}
              />
            </div>
            <p className="mt-4 max-w-[36ch] text-micro text-fog line-clamp-2">
              {product.lede}
            </p>
          </RevealItem>
        ))}

        <RevealItem key={companion.slug} className="flex flex-col">
          <div className="relative">
            <ProductCard
              product={companion}
              showQuickAdd={true}
              plateCaption={`${companion.name} — studio complement`}
            />
          </div>
          <p className="mt-4 max-w-[36ch] text-micro text-fog line-clamp-2">
            {companion.lede}
          </p>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
