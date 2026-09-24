'use client';

import { useState } from 'react';
import { LazyConfigurator } from '@/components/three/LazyScenes';
import type { Finish, Product } from '@/lib/products';

export function MaterialChapter({ product }: { product: Product }) {
  const [finish, setFinish] = useState<Finish>(product.finishes[0]);

  return (
    <section aria-label="Chapter 03: Tactile Materiality" className="relative bg-ink">
      <div className="shell border-t border-line pb-8 pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="eyebrow text-copper">Chapter 03</span>
            <span aria-hidden="true" className="h-px w-8 bg-line" />
            <span className="eyebrow eyebrow-dark">Material & Surface Provenance</span>
          </div>
          <p className="eyebrow text-copper">Live Specimen Inspection</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="display-face text-h2 text-bone">
              Colour is in the Metal, Never on it.
            </h2>
            <p className="mt-4 text-lede text-mist/85">
              Every enclosure begins as solid billet stock, CNC-profiled and grain-finished
              by hand. We leave contact surfaces unlacquered so the metal patinas with honest
              human use, deepening in character rather than wearing away.
            </p>
          </div>

          <div className="flex flex-col justify-end border-l border-line pl-6 lg:col-span-5">
            <div className="grid grid-cols-2 gap-4 text-small text-fog">
              <div>
                <span className="eyebrow text-bone">Alloy 6061-T6</span>
                <p className="mt-1 text-micro text-ash">Aerospace grade billet</p>
              </div>
              <div>
                <span className="eyebrow text-bone">Hand Micro-Grain</span>
                <p className="mt-1 text-micro text-ash">Non-directional brushing</p>
              </div>
              <div>
                <span className="eyebrow text-bone">Unlacquered Copper</span>
                <p className="mt-1 text-micro text-ash">Organic oxidation</p>
              </div>
              <div>
                <span className="eyebrow text-bone">Beryllium Acoustic Foil</span>
                <p className="mt-1 text-micro text-ash">Purity above 99.2%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Material Configurator with Callouts */}
      <LazyConfigurator
        product={product}
        finish={finish}
        onFinish={setFinish}
        label={`${product.name} — Tactile Material Study`}
      />
    </section>
  );
}
