'use client';

import { LazyScrollStory } from '@/components/three/LazyScenes';
import type { Product } from '@/lib/products';

export function FormChapter({ product }: { product: Product }) {
  return (
    <section aria-label="Chapter 02: Form and Acoustic Architecture" className="relative bg-ink">
      {/* Chapter Marker Header */}
      <div className="shell border-t border-line pb-8 pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="eyebrow text-copper">Chapter 02</span>
            <span aria-hidden="true" className="h-px w-8 bg-line" />
            <span className="eyebrow eyebrow-dark">Form & Acoustic Architecture</span>
          </div>
          <p className="eyebrow eyebrow-dark">Scroll to guide the camera spline</p>
        </div>

        <div className="mt-8 max-w-[64ch]">
          <h2 className="display-face text-h2 text-bone">
            The Geometry of Acoustic Isolation.
          </h2>
          <p className="mt-4 text-lede text-mist/85">
            Acoustic mass is not an aesthetic afterthought — it is the physics of silence.
            Scroll through three movements exploring the structural resonance damping of the{' '}
            {product.name}.
          </p>
        </div>
      </div>

      {/* 3D Catmull-Rom Camera Spline Story */}
      <LazyScrollStory
        product={product}
        finish={product.finishes[0]}
        label={`${product.name} — Architecture in Three Movements`}
      />
    </section>
  );
}
