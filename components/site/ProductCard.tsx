'use client';

import Link from 'next/link';
import { PosterFallback } from '@/components/three/PosterFallback';
import { useHoverPeek } from '@/components/three/peek';
import { money } from '@/lib/format';
import type { Product } from '@/lib/products';
import { useCart } from '@/lib/store';
import { toast } from '@/components/ui/Toast';

export function ProductCard({
  product,
  className,
  plateCaption = '',
  showQuickAdd = true,
}: {
  product: Product;
  className?: string;
  plateCaption?: string;
  showQuickAdd?: boolean;
}) {
  const peek = useHoverPeek(product);
  const add = useCart((s) => s.add);

  const onQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product.slug, product.finishes[0].id);
    toast(`${product.name} — ${product.finishes[0].name} added to bag.`, {
      label: 'View bag',
      href: '/cart',
    });
  };

  return (
    <article className={className}>
      <Link href={`/products/${product.slug}`} className="group block" {...peek}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-white shadow-xs transition-shadow duration-300 group-hover:shadow-soft">
          <div className="absolute inset-0 transition-transform duration-[var(--duration-section)] ease-[var(--ease-exp)] group-hover:scale-[1.035]">
            <PosterFallback
              kind={product.model}
              colors={product.poster}
              caption={plateCaption}
              className="absolute inset-0"
            />
          </div>

          {product.isNew && (
            <span className="eyebrow absolute left-4 top-4 rounded-full border border-copper/40 bg-[#efe7da]/90 px-2.5 py-1 text-copper backdrop-blur-sm">
              New
            </span>
          )}

          {showQuickAdd && (
            <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between opacity-0 transition-all duration-300 ease-[var(--ease-exp)] group-hover:translate-y-0 group-hover:opacity-100 translate-y-1">
              <button
                type="button"
                onClick={onQuickAdd}
                className="rounded-full bg-[#2a2420] px-3.5 py-1.5 text-micro font-medium text-[#f7f3ec] shadow-sm transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                + Quick Add
              </button>
              <span className="eyebrow eyebrow-dark rounded-full border border-line bg-white/90 px-2.5 py-1 text-fog backdrop-blur-sm shadow-xs">
                {product.finishes.length} finishes
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-6">
          <h3 className="display-face text-h4 text-bone">{product.name}</h3>
          <p className="tabular shrink-0 text-small text-mist">{money(product.priceCents)}</p>
        </div>

        <p className="eyebrow eyebrow-dark mt-2.5">
          {product.code} — {product.category}
        </p>
      </Link>
    </article>
  );
}
