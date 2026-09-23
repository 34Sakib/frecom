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

const SLIDE_DURATION_MS = 5600;

export type HeroSlide = {
  product: Product;
  headline: [string, string];
  synopsis: string;
};

export function HomeHero({
  products: showcaseProducts,
}: {
  products: Product[];
}) {
  const reducedMotion = useReducedMotion();

  // Curate 3 flagship slides
  const slides: HeroSlide[] = [
    {
      product: showcaseProducts.find((p) => p.slug === 'monolith-09') ?? showcaseProducts[0],
      headline: ['Acoustic mass.', 'Zero resonance.'],
      synopsis:
        'Dual beryllium drivers sealed in a 24-kilogram seamless aluminium housing. Made to anchor a room without vibrating it.',
    },
    {
      product: showcaseProducts.find((p) => p.slug === 'aurora-01') ?? showcaseProducts[1] ?? showcaseProducts[0],
      headline: ['Eleven days', 'on the bench.'],
      synopsis:
        'Closed-back reference headphones cut from aerospace billet aluminium. Balanced weight and vented surround for uninterrupted sessions.',
    },
    {
      product: showcaseProducts.find((p) => p.slug === 'atelier-t3') ?? showcaseProducts[2] ?? showcaseProducts[0],
      headline: ['Pure mechanical', 'rotation.'],
      synopsis:
        'Mass-damped belt drive on a 14-kilogram mineral plinth. Unipivot tonearm hand-calibrated to four milligrams tolerance.',
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

  // Auto-advance timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressStartTime = useRef<number>(Date.now());
  const [progressKey, setProgressKey] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setProgressKey((k) => k + 1);
    progressStartTime.current = Date.now();
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
    setProgressKey((k) => k + 1);
    progressStartTime.current = Date.now();
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

  // Pause handling on interaction
  const onPointerEnter = () => setIsPaused(true);
  const onPointerLeave = () => setIsPaused(false);

  return (
    <section
      className="relative overflow-hidden"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      aria-roledescription="carousel"
      aria-label="Flagship 3D Showcase"
    >
      <div className="mx-auto grid w-full max-w-[108rem] grid-cols-1 px-[var(--space-gutter)] pt-28 pb-12 lg:min-h-[100svh] lg:grid-cols-12 lg:items-center lg:gap-x-8 lg:pt-32 lg:pb-24">
        {/* Left Column: Editorial Headline & Copy */}
        <div className="relative z-10 lg:col-span-5 lg:col-start-1 lg:row-start-1">
          {/* Eyebrow & Slide Counter */}
          <div className="flex items-center gap-4">
            <span className="eyebrow eyebrow-dark">Flagship Showcase</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-soft" />
            <span className="eyebrow eyebrow-dark tabular text-copper">
              {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>

          {/* Mask-reveal headline */}
          <div className="mt-8 min-h-[9.5rem] lg:min-h-[11rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.slug}
                initial={{
                  clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)',
                  y: 18,
                  opacity: 0,
                }}
                animate={{
                  clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)',
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.65, ease: EASE_BEZIER },
                }}
                exit={{
                  clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0% 0%)',
                  y: -14,
                  opacity: 0,
                  transition: { duration: 0.35, ease: EASE_BEZIER },
                }}
              >
                <h1 className="display-face text-h1 text-bone leading-[1.05]">
                  {activeSlide.headline[0]}
                  <br />
                  <span className="text-mist/90">{activeSlide.headline[1]}</span>
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mask-reveal body copy */}
          <div className="mt-4 min-h-[4.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeProduct.slug + '-syn'}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: 0.1, ease: EASE_BEZIER },
                }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
                className="max-w-[42ch] text-lede text-mist/85"
              >
                {activeSlide.synopsis}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Product Specs Pill */}
          <div className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-line pt-6">
            <span className="eyebrow eyebrow-dark">{activeProduct.code}</span>
            <span className="text-h4 text-bone">{activeProduct.name}</span>
            <span className="eyebrow tabular text-copper">
              {money(activeProduct.priceCents)}
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href={`/products/${activeProduct.slug}`} className="btn btn-solid">
                Explore the {activeProduct.name}
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/products" className="btn btn-ghost">
                All objects
              </Link>
            </Magnetic>
          </div>

          {/* Interactive Slide Progress Trackers */}
          <div className="mt-12 border-t border-line/60 pt-6">
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
                    {/* Linear filling progress bar */}
                    <div className="relative h-[2px] w-full overflow-hidden bg-line">
                      {isCurrent && !reducedMotion ? (
                        <div
                          key={`prog-${progressKey}`}
                          className="h-full bg-copper"
                          style={{
                            animation: `fillProgress ${SLIDE_DURATION_MS}ms linear forwards`,
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
                        0{idx + 1}
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

        {/* Right Column: Real-time 3D Scene */}
        <div className="order-2 mt-10 lg:order-none lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <div className="-mx-[var(--space-gutter)] h-[62vh] min-h-[22rem] lg:ml-0 lg:mr-[calc(-1*var(--space-gutter))] lg:h-[min(76vh,44rem)] lg:min-h-[30rem]">
            <LazyHeroViewer
              key={activeProduct.slug}
              product={activeProduct}
              finish={activeFinish}
              className="relative h-full w-full"
            />
          </div>
        </div>

        {/* Bottom Left: Finish Selection for active product */}
        <div className="relative z-10 order-3 mt-8 lg:order-none lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:mt-6">
          <FinishPicker
            product={activeProduct}
            finish={activeFinish}
            onFinish={setFinishForCurrent}
            showNote={false}
          />
          <div className="mt-4 flex items-center justify-between text-micro text-fog">
            <span className="eyebrow eyebrow-dark">Live WebGL — drag to inspect</span>
            <span className="text-ash">Pausable on hover</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fillProgress {
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
