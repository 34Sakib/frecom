'use client';

import Link from 'next/link';
import { useState } from 'react';

import { FinishPicker } from './FinishPicker';
import { SpecTable } from './SpecTable';
import { LazyConfigurator, LazyHeroViewer } from '@/components/three/LazyScenes';
import { Lightbox } from '@/components/ui/Lightbox';
import { Magnetic } from '@/components/ui/Magnetic';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { money } from '@/lib/format';
import { products, type Finish, type Product } from '@/lib/products';

/**
 * DIGITAL EXHIBITION — PRODUCT DETAIL
 *
 * An art-directed digital gallery room for an individual audio object.
 * Focus is entirely on acoustic architecture, procedural 3D inspection,
 * material provenance, and curatorial inquiries.
 */

const MATERIAL_NOTE =
  'Colour is in the metal, not on it. Every surface is finished by hand and left unlacquered where the hand falls, which is why these objects darken where you hold them and settle rather than wear out. Wipe with a dry cloth; nothing here wants a solvent.';

export function ProductDetail({ product }: { product: Product }) {
  const [finish, setFinish] = useState<Finish>(product.finishes[0]);
  const [materialOpen, setMaterialOpen] = useState(false);

  const others = products.filter((p) => p.slug !== product.slug);
  const index = product.finishes.findIndex((f) => f.id === finish.id) + 1;

  const inquiryHref = `mailto:curator@frecom.audio?subject=${encodeURIComponent(
    `Frecom Exhibition Inquiry — ${product.name} [${finish.name}] (${product.code})`,
  )}&body=${encodeURIComponent(
    `Hello Frecom Studio,\n\nI am inquiring regarding ${product.name} in ${finish.name} (${product.code}). Please share archival specifications and private showroom viewing availability.\n\nBest regards,`,
  )}`;

  return (
    <article className="min-h-screen bg-ink text-bone">
      <div className="shell pb-[clamp(3rem,8vw,6rem)] pt-[clamp(6rem,14vh,9rem)]">
        <Link href="/collection" className="eyebrow link-line text-fog hover:text-bone">
          ← Exhibition Collection
        </Link>

        <div className="mt-10 grid gap-y-12 lg:grid-cols-12 lg:gap-10">
          {/* 3D Interactive Exhibition Hero */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-surface shadow-soft sm:aspect-[16/11] lg:aspect-auto lg:h-[min(80svh,52rem)]">
              <LazyHeroViewer
                product={product}
                finish={finish}
                className="absolute inset-0"
              />
              <div className="pointer-events-none absolute bottom-5 right-5 text-micro">
                <span className="eyebrow text-[0.625rem] text-copper">
                  {finish.name} · Procedural Canvas
                </span>
              </div>
            </div>
          </div>

          {/* Curatorial Dossier & Specs */}
          <div className="flex flex-col justify-center lg:col-span-5 lg:pl-4">
            <p className="eyebrow eyebrow-dark">
              {product.code} — {product.category} · Edition {product.year}
            </p>

            <h1 className="display-face mt-6 text-h1 text-bone text-balance">
              {product.name}
            </h1>

            <p className="mt-6 max-w-[44ch] text-lede text-mist/90">{product.tagline}</p>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-y border-line py-5">
              <p className="tabular text-h3 text-bone">{money(product.priceCents)}</p>
              <p className="eyebrow eyebrow-dark">
                Archival build · Studio commission
              </p>
            </div>

            <FinishPicker
              className="mt-8"
              product={product}
              finish={finish}
              onFinish={setFinish}
            />

            <button
              type="button"
              onClick={() => setMaterialOpen(true)}
              className="eyebrow link-line mt-6 self-start text-copper"
            >
              Material Dossier: {finish.name} →
            </button>

            <div className="mt-10 flex flex-col gap-4">
              <Magnetic className="w-full">
                <a
                  href={inquiryHref}
                  className="btn btn-copper w-full"
                >
                  Request Acquisition Dossier
                </a>
              </Magnetic>

              <p className="text-center text-micro text-fog">
                Showroom inspections and bench builds scheduled by private appointment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes on the Making & Archival Specs */}
      <section className="shell pb-[var(--space-section)]">
        <RevealGroup className="grid gap-y-14 border-t border-line pt-16 lg:grid-cols-12 lg:gap-12">
          <RevealItem className="lg:col-span-6">
            <h2 className="eyebrow eyebrow-dark">Notes on the Making</h2>
            <div className="mt-8 flex flex-col gap-6">
              {product.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="max-w-[56ch] text-lede text-mist/85">
                  {paragraph}
                </p>
              ))}
            </div>
          </RevealItem>

          <RevealItem className="lg:col-span-6">
            <SpecTable product={product} />
          </RevealItem>
        </RevealGroup>
      </section>

      {/* Material Investigation Studio */}
      <LazyConfigurator
        product={product}
        finish={finish}
        onFinish={setFinish}
        label="Material Specimen Inspection"
      />

      {/* Other Objects in Exhibition */}
      <section className="shell py-[var(--space-section)]">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-line pt-10">
          <h2 className="eyebrow eyebrow-dark">Also in Exhibition</h2>
          <Link href="/collection" className="eyebrow link-line text-copper">
            All Six Objects →
          </Link>
        </div>

        <ul className="mt-8 grid list-none sm:grid-cols-2 sm:gap-x-16">
          {others.map((other) => (
            <li key={other.slug} className="border-b border-line">
              <Link
                href={`/collection/${other.slug}`}
                className="group flex items-baseline justify-between gap-6 py-5"
              >
                <span className="display-face text-h4 text-bone transition-colors duration-200 ease-[var(--ease-exp)] group-hover:text-copper">
                  {other.name}
                </span>
                <span className="eyebrow eyebrow-dark tabular shrink-0 text-mist">
                  {money(other.priceCents)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Material Modal Dialog */}
      <Lightbox
        open={materialOpen}
        onClose={() => setMaterialOpen(false)}
        title={`${finish.name} — material note`}
      >
        <div className="grid gap-8 p-6 sm:grid-cols-[0.85fr_1.15fr] sm:gap-10 sm:p-10">
          <div
            aria-hidden="true"
            className="aspect-square rounded-md border border-line-soft shadow-lift"
            style={{ background: finish.hex }}
          />

          <div>
            <p className="eyebrow eyebrow-dark">
              Finish {String(index).padStart(2, '0')} of{' '}
              {String(product.finishes.length).padStart(2, '0')}
            </p>
            <h3 className="display-face mt-5 text-h2 text-bone">{finish.name}</h3>
            <p className="mt-5 text-body text-mist">{finish.note}.</p>
            <p className="mt-5 max-w-[46ch] text-small text-fog">{MATERIAL_NOTE}</p>
          </div>
        </div>
      </Lightbox>
    </article>
  );
}
