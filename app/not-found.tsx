import Link from 'next/link';

import { SceneAbsent } from '@/components/three/LazyScenes';
import { getFinish, products } from '@/lib/products';

export const metadata = {
  title: 'Nothing here',
  description: 'This page does not exist. The six objects do.',
};

/**
 * 404
 *
 * A dead end is still a page, so it does the only useful thing a dead end can:
 * puts the whole catalogue in front of you rather than an apology and a button.
 * Static export ships this as `404.html`, which every host will serve for an
 * unknown path.
 */
export default function NotFound() {
  return (
    <>
      <SceneAbsent />

      <section className="shell pb-[clamp(2.5rem,6vw,4rem)] pt-[clamp(7rem,17vh,11rem)]">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-8">
            <p className="eyebrow eyebrow-dark">Error 404</p>
            <h1 className="display-face mt-7 text-h1 text-bone">
              This page was never made.
            </h1>
            <p className="mt-7 max-w-[46ch] text-lede text-mist/85">
              The six objects were, though. Everything the workshop builds is below,
              and the link you followed was probably one of them.
            </p>
          </div>
        </div>
      </section>

      <section className="shell pb-[var(--space-section)]">
        <ul className="list-none border-t border-line">
          {products.map((product) => (
            <li key={product.slug}>
              <Link
                href={`/products/${product.slug}`}
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
          <Link href="/products" className="btn btn-solid">
            All objects
          </Link>
          <Link href="/" className="eyebrow link-line text-copper">
            Back to the front →
          </Link>
        </div>
      </section>
    </>
  );
}
