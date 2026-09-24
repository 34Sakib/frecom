import type { Metadata } from 'next';

import { CinematicHero } from '@/components/home/CinematicHero';
import { FormChapter } from '@/components/home/FormChapter';
import { MaterialChapter } from '@/components/home/MaterialChapter';
import { CollectionChapter } from '@/components/home/CollectionChapter';
import { getProduct, products } from '@/lib/products';

export const metadata: Metadata = {
  title: { absolute: 'Frecom — Premium 3D Digital Audio Exhibition' },
  description:
    'A cinematic digital showroom for six premium audio objects, built around procedural 3D, art-directed camera choreography, and acoustic craftsmanship.',
};

/**
 * FRECOM DIGITAL SHOWROOM — 4 CINEMATIC CHAPTERS
 *
 * Chapter 01: Hero — The Arrival & Flagship Objects
 * Chapter 02: Form — Acoustic Architecture & Scroll Camera Spline
 * Chapter 03: Material — Tactile Provenance & 3D Specimen Inspection
 * Chapter 04: Collection — The Six Audio Objects Archive
 */
export default function HomePage() {
  const formHeroProduct = getProduct('aurora-01') ?? products[0];
  const materialHeroProduct = getProduct('monolith-09') ?? products[1] ?? products[0];

  return (
    <main className="bg-ink text-bone">
      {/* Chapter 01: The Arrival */}
      <CinematicHero products={products} />

      {/* Chapter 02: Form & Acoustic Architecture */}
      <FormChapter product={formHeroProduct} />

      {/* Chapter 03: Tactile Materiality */}
      <MaterialChapter product={materialHeroProduct} />

      {/* Chapter 04: The Exhibition Collection */}
      <CollectionChapter products={products} />
    </main>
  );
}
