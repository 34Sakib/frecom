'use client';

import Link from 'next/link';
import { useState } from 'react';

import { FinishPicker } from './FinishPicker';
import { SpecTable } from './SpecTable';
import { BuyBar } from './BuyBar';
import { LazyConfigurator, LazyHeroViewer } from '@/components/three/LazyScenes';
import { Lightbox } from '@/components/ui/Lightbox';
import { Magnetic } from '@/components/ui/Magnetic';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { toast } from '@/components/ui/Toast';
import { money, shippingFor } from '@/lib/format';
import { products, type Finish, type Product } from '@/lib/products';
import { useCart } from '@/lib/store';

/**
 * PRODUCT DETAIL
 *
 * One piece of state — the chosen finish — and it belongs to the page, because
 * two surfaces read it: the viewer (which renders it) and the buy bar (which
 * records it in the bag). The `FinishPicker` radio group is the canonical
 * control; the canvas is the illustration, which is what keeps the object
 * configurable on a device that never gets a canvas.
 *
 * Two canvases at most live here (viewer + configurator) and neither is mounted
 * on a device that failed the probe — the wrappers in LazyScenes decide that at
 * the module graph, so three.js is never even downloaded.
 */

const MATERIAL_NOTE =
  'Colour is in the metal, not on it. Every surface is finished by hand and left unlacquered where the hand falls, which is why these objects darken where you hold them and settle rather than wear out. Wipe with a dry cloth; nothing here wants a solvent.';

export function ProductDetail({ product }: { product: Product }) {
  const [finish, setFinish] = useState<Finish>(product.finishes[0]);
  const [materialOpen, setMaterialOpen] = useState(false);
  const add = useCart((s) => s.add);

  const others = products.filter((p) => p.slug !== product.slug);
  const index = product.finishes.findIndex((f) => f.id === finish.id) + 1;

  const addToBag = () => {
    add(product.slug, finish.id);
    toast(`${product.name} — ${finish.name} added to your bag.`, {
      label: 'View bag',
      href: '/cart',
    });
  };

  return (
    <article>
      <div className="shell pb-[clamp(3rem,8vw,6rem)] pt-[clamp(6rem,14vh,9rem)]">
        <Link href="/products" className="eyebrow link-line text-fog hover:text-bone">
          ← All objects
        </Link>

        <div className="mt-10 grid gap-y-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-white shadow-xs sm:aspect-[16/11] lg:aspect-auto lg:h-[min(76svh,50rem)]">
              <LazyHeroViewer
                product={product}
                finish={finish}
                className="absolute inset-0"
              />
            </div>
          </div>

          <div className="flex flex-col lg:col-span-4 lg:col-start-9">
            <p className="eyebrow eyebrow-dark">
              {product.code} — {product.category}
            </p>

            <h1 className="display-face mt-6 text-h1 text-bone text-balance">
              {product.name}
            </h1>

            <p className="mt-6 max-w-[42ch] text-lede text-mist">{product.tagline}</p>

            <div className="mt-9 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <p className="tabular text-h3 text-bone">{money(product.priceCents)}</p>
              <p className="eyebrow eyebrow-dark">
                {shippingFor(product.priceCents) === 0 ? 'Ships free' : 'Shipping at checkout'}
              </p>
            </div>

            <FinishPicker
              className="mt-11"
              product={product}
              finish={finish}
              onFinish={setFinish}
            />

            <button
              type="button"
              onClick={() => setMaterialOpen(true)}
              className="eyebrow link-line mt-6 self-start text-copper"
            >
              About {finish.name}
            </button>

            <Magnetic className="mt-10 w-full">
              <button
                id="add-to-bag"
                type="button"
                onClick={addToBag}
                className="btn btn-copper w-full"
              >
                Add to bag — {money(product.priceCents)}
              </button>
            </Magnetic>

            <a
              href={`mailto:studio@frecom.example?subject=${encodeURIComponent(
                `${product.name} — enquiry`,
              )}`}
              className="eyebrow link-line mt-6 self-start text-fog hover:text-bone"
            >
              Ask about this object
            </a>
          </div>
        </div>
      </div>

      <section className="shell pb-[var(--space-section)]">
        <RevealGroup className="grid gap-y-14 border-t border-line pt-14 lg:grid-cols-12 lg:gap-8">
          <RevealItem className="lg:col-span-6">
            <h2 className="eyebrow eyebrow-dark">Notes on the making</h2>
            <div className="mt-8 flex flex-col gap-6">
              {product.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="max-w-[56ch] text-lede text-mist/85">
                  {paragraph}
                </p>
              ))}
            </div>
          </RevealItem>

          <RevealItem className="lg:col-span-6 lg:col-start-8">
            <SpecTable product={product} />
          </RevealItem>
        </RevealGroup>
      </section>

      <LazyConfigurator
        product={product}
        finish={finish}
        onFinish={setFinish}
        label="Materials & making"
      />

      <section className="shell py-[var(--space-section)]">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-line pt-10">
          <h2 className="eyebrow eyebrow-dark">Also in the workshop</h2>
          <Link href="/products" className="eyebrow link-line text-copper">
            All six objects
          </Link>
        </div>

        <ul className="mt-8 grid list-none sm:grid-cols-2 sm:gap-x-16">
          {others.map((other) => (
            <li key={other.slug} className="border-b border-line">
              <Link
                href={`/products/${other.slug}`}
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

      {/* Watches the real add-to-bag block, so the page never shows two purchase
          controls at once. */}
      <BuyBar product={product} finish={finish} watch="add-to-bag" />

      <Lightbox
        open={materialOpen}
        onClose={() => setMaterialOpen(false)}
        title={`${finish.name} — material note`}
      >
        <div className="grid gap-8 p-6 sm:grid-cols-[0.85fr_1.15fr] sm:gap-10 sm:p-10">
          <div
            aria-hidden="true"
            className="aspect-square rounded-md border border-line-soft"
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
