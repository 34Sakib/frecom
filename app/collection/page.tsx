import type { Metadata } from 'next';

import { CatalogBrowser } from '@/components/site/CatalogBrowser';
import { SceneAbsent } from '@/components/three/LazyScenes';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Collection — Six Objects in Exhibition',
  description:
    'The complete Frecom digital collection: headphones, reference monitors, a precision turntable, balanced amplifier, and acoustic plinths.',
};

/**
 * THE COLLECTION
 *
 * Full exhibition archive of all six audio objects.
 */
export default function CollectionPage() {
  return (
    <>
      <SceneAbsent />

      <section className="shell pb-[clamp(2.5rem,6vw,4.5rem)] pt-[clamp(7rem,17vh,11rem)]">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <p className="eyebrow eyebrow-dark">Collection — Exhibition Archive</p>
            <h1 className="display-face mt-6 text-h1 text-bone">
              Six objects, and nothing else.
            </h1>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="max-w-[42ch] text-body text-fog">
              Every object here is drawn, milled and wired in one workshop in London E2,
              in numbers small enough to test every unit by hand. Precision acoustic
              architecture preserved in procedural 3D.
            </p>
          </div>
        </div>
      </section>

      <CatalogBrowser products={products} />
    </>
  );
}
