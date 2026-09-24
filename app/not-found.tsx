import Link from 'next/link';
import { getFinish, products } from '@/lib/products';

/**
 * 404
 *
 * A dead end is still a page: displays the exhibition collection.
 * Note: not-found.tsx in Next.js does not support metadata export.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink text-bone">
      <section className="shell pb-[clamp(2.5rem,6vw,4rem)] pt-[clamp(7rem,17vh,11rem)]">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-8">
            <p className="eyebrow text-copper">Exhibition Archive · Error 404</p>
            <h1 className="display-face mt-7 text-h1 text-bone">
              This chamber was never opened.
            </h1>
            <p className="mt-7 max-w-[46ch] text-lede text-mist/85">
              The six exhibition objects exist, however. Everything the atelier crafts
              is documented below.
            </p>
          </div>
        </div>
      </section>

      <section className="shell pb-[var(--space-section)]">
        <ul className="list-none border-t border-line">
          {products.map((product) => (
            <li key={product.slug}>
              <Link
                href={`/collection/${product.slug}`}
                className="group grid grid-cols-12 items-baseline gap-4 border-b border-line py-6"
              >
                <span className="eyebrow eyebrow-dark col-span-3 sm:col-span-2">
                  {product.code}
                </span>
                <span className="display-face col-span-9 text-h3 text-bone transition-colors duration-200 ease-[var(--ease-exp)] group-hover:text-copper sm:col-span-5">
                  {product.name}
                </span>
                <span className="col-span-9 col-start-4 text-small text-fog sm:col-span-3 sm:col-start-auto">
                  {product.tagline}
                </span>
                <span className="eyebrow eyebrow-dark col-span-3 col-start-10 text-right text-mist sm:col-span-2">
                  {getFinish(product).name}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Link href="/collection" className="btn btn-copper">
            Exhibition Collection
          </Link>
          <Link href="/" className="eyebrow link-line text-copper">
            Return to Entrance →
          </Link>
        </div>
      </section>
    </main>
  );
}
