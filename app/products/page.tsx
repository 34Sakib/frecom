import type { Metadata } from 'next';

import { CatalogBrowser } from '@/components/site/CatalogBrowser';
import { SceneAbsent } from '@/components/three/LazyScenes';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Objects',
  description:
    'The complete Frecom catalogue: headphones, loudspeakers, a turntable, an amplifier and a stand. Filter by family or sort by price and year.',
};

/**
 * THE CATALOGUE
 *
 * The header is server-rendered and static; only the filter bar and the grid are
 * a client island. Nothing on this route opens a canvas by itself — the 3D preview
 * is a hover-only enhancement mounted by the browser island — so `SceneAbsent`
 * has to say so, or the curtain would wait for a scene that is never coming.
 */
export default function ProductsPage() {
  return (
    <>
      <SceneAbsent />

      <section className="shell pb-[clamp(2.5rem,6vw,4.5rem)] pt-[clamp(7rem,17vh,11rem)]">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <p className="eyebrow eyebrow-dark">Objects — the whole catalogue</p>
            <h1 className="display-face mt-6 text-h1 text-bone">
              Six objects, and nothing else.
            </h1>
          </div>

          <div className="lg:col-span-3 lg:col-start-10 lg:self-end">
            <p className="max-w-[42ch] text-body text-fog">
              Every object here is drawn, milled and wired in one workshop, in runs
              small enough to check by hand. Read them in the order they were
              designed, or sort by price if you are choosing.
            </p>
          </div>
        </div>
      </section>

      <CatalogBrowser products={products} />
    </>
  );
}
