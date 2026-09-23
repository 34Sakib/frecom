'use client';

import Link from 'next/link';
import { Tilt } from '@/components/ui/Tilt';
import { Reveal, RevealGroup, RevealItem, RevealMask } from '@/components/ui/Reveal';
import { PosterFallback } from '@/components/three/PosterFallback';
import { products, type ProductModelKind } from '@/lib/products';

type CategoryTile = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  model: ProductModelKind;
  poster: [string, string];
  count: number;
  featuredCode: string;
  colSpan: string;
  aspect: string;
};

export function CategoryTiles() {
  const categoryData: CategoryTile[] = [
    {
      id: 'headphones',
      name: 'Headphones',
      eyebrow: 'Personal Acoustic Reference',
      description: 'Milled from monolithic aerospace aluminium with vented beryllium diaphragms.',
      model: 'headphone',
      poster: ['#2b2a28', '#8d857a'],
      count: products.filter((p) => p.categoryId === 'headphones').length,
      featuredCode: 'FR—01',
      colSpan: 'lg:col-span-7',
      aspect: 'aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/11]',
    },
    {
      id: 'loudspeakers',
      name: 'Loudspeakers',
      eyebrow: 'Architectural Sound Monitors',
      description: 'Mass-loaded acoustic enclosures designed to anchor a room without harmonic smear.',
      model: 'monitor',
      poster: ['#1c1a17', '#e2ddd5'],
      count: products.filter((p) => p.categoryId === 'loudspeakers').length,
      featuredCode: 'FR—02 & FR—06',
      colSpan: 'lg:col-span-5',
      aspect: 'aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/11]',
    },
    {
      id: 'analogue',
      name: 'Analogue',
      eyebrow: 'Precision Mechanical Playback',
      description: 'Cast mineral plinth and unipivot tonearm for true zero-flutter transcription.',
      model: 'turntable',
      poster: ['#282622', '#c9a275'],
      count: products.filter((p) => p.categoryId === 'analogue').length,
      featuredCode: 'FR—03',
      colSpan: 'lg:col-span-4',
      aspect: 'aspect-[4/3] sm:aspect-[16/10]',
    },
    {
      id: 'electronics',
      name: 'Electronics',
      eyebrow: 'Class-A Discrete Power',
      description: 'Hand-wound transformer iron and discrete dual-mono gain stages in oiled copper.',
      model: 'amplifier',
      poster: ['#1f1e1c', '#b87333'],
      count: products.filter((p) => p.categoryId === 'electronics').length,
      featuredCode: 'FR—04',
      colSpan: 'lg:col-span-4',
      aspect: 'aspect-[4/3] sm:aspect-[16/10]',
    },
    {
      id: 'objects',
      name: 'Objects & Stands',
      eyebrow: 'Acoustic Complements',
      description: 'Machined support structures and vibration isolators for desk and atelier.',
      model: 'stand',
      poster: ['#22201d', '#59554e'],
      count: products.filter((p) => p.categoryId === 'objects').length,
      featuredCode: 'FR—05',
      colSpan: 'lg:col-span-4',
      aspect: 'aspect-[4/3] sm:aspect-[16/10]',
    },
  ];

  return (
    <section className="shell py-[var(--space-section)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <Reveal>
          <p className="eyebrow eyebrow-dark">Workshop Disciplines</p>
          <h2 className="display-face mt-6 text-h2 text-bone">
            <RevealMask>Shop by category</RevealMask>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[40ch] text-small text-fog lg:text-right">
            Five disciplines, designed with common geometry and finish palettes so any combination lives together naturally.
          </p>
        </Reveal>
      </div>

      {/* Asymmetric art-directed tile grid with staggered entrance */}
      <RevealGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12 lg:gap-8">
        {categoryData.map((cat, i) => (
          <RevealItem key={cat.id} className={cat.colSpan}>
            <Tilt className="h-full rounded-md" max={3.5}>
              <Link
                href={`/products?category=${cat.id}`}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-line bg-white p-6 sm:p-8 transition-all duration-300 shadow-xs hover:shadow-soft hover:border-copper/60"
              >
                {/* Top Row: Eyebrow + Count */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <span className="eyebrow eyebrow-dark text-[0.6875rem] text-fog">
                      {cat.eyebrow}
                    </span>
                    <h3 className="display-face mt-2 text-h3 text-bone transition-colors duration-200 group-hover:text-copper">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="eyebrow tabular rounded-full border border-line bg-[#efe7da] px-3 py-1 text-copper">
                    {cat.count} {cat.count === 1 ? 'Object' : 'Objects'}
                  </span>
                </div>

                {/* Center Visual Plate */}
                <div className={`relative my-6 w-full overflow-hidden rounded border border-line/60 bg-[#efe7da]/40 ${cat.aspect}`}>
                  <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-exp)] group-hover:scale-105">
                    <PosterFallback
                      kind={cat.model}
                      colors={cat.poster}
                      className="absolute inset-0 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Bottom Row: Description + Link cue */}
                <div className="relative z-10 flex items-end justify-between gap-4 border-t border-line/60 pt-4">
                  <p className="max-w-[36ch] text-micro text-fog line-clamp-2">
                    {cat.description}
                  </p>
                  <span
                    aria-hidden="true"
                    className="eyebrow text-copper transition-transform duration-300 ease-[var(--ease-exp)] group-hover:translate-x-1"
                  >
                    View →
                  </span>
                </div>
              </Link>
            </Tilt>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
