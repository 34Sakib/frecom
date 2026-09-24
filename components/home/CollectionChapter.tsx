'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/site/ProductCard';
import type { Product } from '@/lib/products';

export function CollectionChapter({ products }: { products: Product[] }) {
  return (
    <section aria-label="Chapter 04: The Exhibition Collection" className="relative bg-ink pb-24">
      {/* Chapter Marker Header */}
      <div className="shell border-t border-line pb-12 pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="eyebrow text-copper">Chapter 04</span>
            <span aria-hidden="true" className="h-px w-8 bg-line" />
            <span className="eyebrow eyebrow-dark">The Complete Collection</span>
          </div>
          <Link href="/collection" className="eyebrow link-line text-copper">
            Enter Full Archive →
          </Link>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[54ch]">
            <h2 className="display-face text-h2 text-bone">
              Six Objects. Nothing Superfluous.
            </h2>
            <p className="mt-4 text-lede text-mist/85">
              Each object is conceived once and crafted in small numbered editions in our
              London atelier. No seasonal redundancy — only permanent acoustic instruments.
            </p>
          </div>

          <div className="flex items-center gap-6 text-small text-fog">
            <div>
              <span className="tabular text-h4 text-bone">06</span>
              <p className="eyebrow mt-1">Archived Objects</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div>
              <span className="tabular text-h4 text-bone">100%</span>
              <p className="eyebrow mt-1">Bespoke CNC & Assembly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric Exhibition Gallery */}
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              plateCaption={`${product.name} — Archival Plate`}
            />
          ))}
        </div>

        {/* Curatorial Inquiries Banner */}
        <div className="mt-24 rounded-lg border border-line bg-surface/50 p-8 lg:p-14 backdrop-blur-sm">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <span className="eyebrow text-copper">Private Exhibition & Bench Auditions</span>
              <h3 className="display-face mt-4 text-h2 text-bone">
                Acquisitions by Private Appointment
              </h3>
              <p className="mt-4 max-w-[54ch] text-body text-mist/85">
                We welcome acoustic architects, collectors, and sound engineers to our E2 workshop
                to audition the full six-piece collection directly from master calibration benches.
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-4 lg:items-end">
              <a
                href="mailto:curator@frecom.audio?subject=Frecom Atelier Appointment Request"
                className="btn btn-copper w-full sm:w-auto"
              >
                Schedule Private Audition
              </a>
              <Link href="/about" className="eyebrow link-line text-fog hover:text-bone">
                Learn About Our Atelier →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
