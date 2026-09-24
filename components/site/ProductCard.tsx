'use client';

import Link from 'next/link';
import { PosterFallback } from '@/components/three/PosterFallback';
import { useHoverPeek } from '@/components/three/peek';
import { money } from '@/lib/format';
import type { Product } from '@/lib/products';

export function ProductCard({
  product,
  className,
  plateCaption = '',
}: {
  product: Product;
  className?: string;
  plateCaption?: string;
  showQuickAdd?: boolean;
}) {
  const peek = useHoverPeek(product);

  return (
    <article className={className}>
      <Link href={`/collection/${product.slug}`} className="group block" {...peek}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-ink-800 shadow-soft transition-all duration-500 group-hover:border-copper/40 group-hover:shadow-lift">
          <div className="absolute inset-0 transition-transform duration-[var(--duration-section)] ease-[var(--ease-exp)] group-hover:scale-[1.03]">
            <PosterFallback
              kind={product.model}
              colors={product.poster}
              caption={plateCaption}
              className="absolute inset-0"
            />
          </div>

          {product.isNew && (
            <span className="eyebrow absolute left-4 top-4 rounded-full border border-copper/40 bg-ink/80 px-2.5 py-1 text-copper backdrop-blur-md">
              Current Edition
            </span>
          )}

          <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between opacity-0 transition-all duration-300 ease-[var(--ease-exp)] group-hover:translate-y-0 group-hover:opacity-100 translate-y-1">
            <span className="eyebrow rounded-full border border-copper/50 bg-ink/90 px-3 py-1.5 text-copper backdrop-blur-md">
              View Object →
            </span>
            <span className="eyebrow eyebrow-dark rounded-full border border-line bg-surface/90 px-2.5 py-1 text-fog backdrop-blur-md">
              {product.finishes.length} Finishes
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-6">
          <h3 className="display-face text-h4 text-bone group-hover:text-copper transition-colors duration-200">
            {product.name}
          </h3>
          <p className="tabular shrink-0 text-small text-mist">{money(product.priceCents)}</p>
        </div>

        <p className="eyebrow eyebrow-dark mt-2.5">
          {product.code} — {product.category} · {product.year}
        </p>
      </Link>
    </article>
  );
}
