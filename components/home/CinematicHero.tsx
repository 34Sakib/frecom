'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { FinishPicker } from '@/components/site/FinishPicker';
import { LazyHeroViewer } from '@/components/three/LazyScenes';
import { Magnetic } from '@/components/ui/Magnetic';
import { money } from '@/lib/format';
import type { Finish, Product } from '@/lib/products';
import { DUR, EASE_BEZIER } from '@/lib/tokens';

const SLIDE_DURATION_MS = 6400;

export type HeroSlide = {
  product: Product;
  numeral: string;
  headline: [string, string];
  synopsis: string;
  materialSpec: string;
};

export function CinematicHero({
  products: showcaseProducts,
}: {
  products: Product[];
}) {
  const reducedMotion = useReducedMotion();

  const slides: HeroSlide[] = [
    {
      product: showcaseProducts.find((p) => p.slug === 'aurora-01') ?? showcaseProducts[0],
      numeral: '01',
      headline: ['Acoustic Mass.', 'Pure Geometry.'],
      synopsis:
        'Closed-back reference headphones machined from a single billet of aerospace-grade aluminium. Tuned with surgical phase coherence.',
      materialSpec: 'Solid Billet 6061-T6 · Micro-Vented Acoustic Chamber',
    },
    {
      product: showcaseProducts.find((p) => p.slug === 'monolith-09') ?? showcaseProducts[1] ?? showcaseProducts[0],
      numeral: '02',
      headline: ['Zero Resonance.', 'Monolithic Presence.'],
      synopsis:
        'Dual beryllium transducers anchored in a 24-kilogram seamless aluminium housing. Engineered to command space without vibrating it.',
      materialSpec: '24kg Billet Casting · Pure Beryllium Inverted Domes',
    },
    {
      product: showcaseProducts.find((p) => p.slug === 'atelier-t3') ?? showcaseProducts[2] ?? showcaseProducts[0],
      numeral: '03',
      headline: ['Rotational Purity.', 'Unipivot Precision.'],
      synopsis:
        'Mass-damped belt drive seated upon a 14-kilogram mineral plinth. An artisanal unipivot tonearm calibrated to milligram tolerances.',
      materialSpec: 'Mineral Composite Plinth · Sapphire Jewel Bearing',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [finishes, setFinishes] = useState<Record<string, Finish>>(() => {
    const map: Record<string, Finish> = {};
    for (const slide of slides) {
      map[slide.product.slug] = slide.product.finishes[0];
    }
    return map;
  });

  const activeSlide = slides[activeIndex];
  const activeProduct = activeSlide.product;
  const activeFinish = finishes[activeProduct.slug] ?? activeProduct.finishes[0];

  const setFinishForCurrent = useCallback(
    (finish: Finish) => {
      setFinishes((prev) => ({ ...prev, [activeProduct.slug]: finish }));
    },
    [activeProduct.slug],
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progressKey, setProgressKey] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setProgressKey((k) => k + 1);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
    setProgressKey((k) => k + 1);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || reducedMotion) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, reducedMotion, progressKey]);

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-ink pt-20 lg:pt-0"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      aria-label="Chapter 01: The Exhibition"
    >
      {/* Background ambient radial gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_65%_45%,rgba(212,136,88,0.06),transparent_55%)]"
      />

      <div className="shell relative z-10 grid min-h-[100svh] grid-cols-1 items-center pb-12 pt-16 lg:grid-cols-12 lg:gap-x-12 lg:pb-16 lg:pt-24">
        {/* Left Editorial Narrative */}
        <div className="flex flex-col justify-center lg:col-span-5 lg:col-start-1">
          {/* Chapter Eyebrow & Index */}
          <div className="flex items-center gap-4">
            <span className="eyebrow text-copper">Chapter 01</span>
            <span aria-hidden="true" className="h-px w-8 bg-line" />
            <span className="eyebrow eyebrow-dark">The Digital Exhibition</span>
          </div>

          {/* Mask-reveal Headline */}
          <div className="mt-8 min-h-[8.5rem] lg:min-h-[10.5rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.slug}
                initial={{
                  clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)',
                  y: 20,
                  opacity: 0,
                }}
                animate={{
                  clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)',
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.7, ease: EASE_BEZIER },
                }}
                exit={{
                  clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0% 0%)',
                  y: -14,
                  opacity: 0,
                  transition: { duration: 0.35, ease: EASE_BEZIER },
                }}
              >
                <h1 className="display-face text-h1 text-bone leading-[1.02]">
                  {activeSlide.headline[0]}
                  <br />
                  <span className="text-copper">{activeSlide.headline[1]}</span>
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Synopsis */}
          <div className="mt-4 min-h-[4.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeProduct.slug + '-syn'}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: 0.1, ease: EASE_BEZIER },
                }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
                className="max-w-[44ch] text-lede text-mist/90"
              >
                {activeSlide.synopsis}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Material & Provenance Spec Tag */}
          <div className="mt-8 border-t border-line pt-6">
            <p className="eyebrow eyebrow-dark">{activeProduct.code} · {activeSlide.materialSpec}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="display-face text-h4 text-bone">{activeProduct.name}</span>
              <span className="tabular text-small text-mist">{money(activeProduct.priceCents)}</span>
            </div>
          </div>

          {/* Actions & Finish Switcher */}
          <div className="mt-8 flex flex-col gap-6">
            <FinishPicker
              product={activeProduct}
              finish={activeFinish}
              onFinish={setFinishForCurrent}
              showNote={false}
            />

            <div className="flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link href={`/collection/${activeProduct.slug}`} className="btn btn-copper">
                  Inspect Object →
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/collection" className="btn btn-ghost">
                  Exhibition Index
                </Link>
              </Magnetic>
            </div>
          </div>

          {/* Slide Navigation Trackers */}
          <div className="mt-12 border-t border-line pt-6">
            <div className="grid grid-cols-3 gap-4">
              {slides.map((s, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={s.product.slug}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className="group relative flex flex-col items-start text-left focus:outline-none"
                    aria-label={`Slide ${idx + 1}: ${s.product.name}`}
                    aria-current={isCurrent ? 'true' : 'false'}
                  >
                    <div className="relative h-[2px] w-full overflow-hidden bg-line">
                      {isCurrent && !reducedMotion ? (
                        <div
                          key={`prog-${progressKey}`}
                          className="h-full bg-copper"
                          style={{
                            animation: `heroProgress ${SLIDE_DURATION_MS}ms linear forwards`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                          }}
                        />
                      ) : isCurrent ? (
                        <div className="h-full w-full bg-copper" />
                      ) : null}
                    </div>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span
                        className={`eyebrow tabular transition-colors duration-200 ${
                          isCurrent ? 'text-copper' : 'text-fog group-hover:text-mist'
                        }`}
                      >
                        {s.numeral}
                      </span>
                      <span
                        className={`text-micro transition-colors duration-200 hidden sm:inline ${
                          isCurrent ? 'text-bone' : 'text-fog group-hover:text-mist'
                        }`}
                      >
                        {s.product.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 3D Viewport Hero */}
        <div className="relative mt-8 h-[60vh] min-h-[22rem] lg:col-span-7 lg:col-start-6 lg:mt-0 lg:h-[min(82vh,48rem)]">
          <div className="relative h-full w-full overflow-hidden rounded-md border border-line bg-surface shadow-soft">
            <LazyHeroViewer
              key={activeProduct.slug}
              product={activeProduct}
              finish={activeFinish}
              className="relative h-full w-full"
            />

            <div className="pointer-events-none absolute bottom-4 right-4 text-micro">
              <span className="eyebrow text-[0.625rem] text-copper">
                {activeFinish.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
