'use client';

import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Beat, Finish, Product, ProductModelKind } from '@/lib/products';
import { ScrollTrigger, gsap, registerGsap } from '@/lib/gsap';
import { useCapability, useMediaQuery } from '@/lib/hooks';
import { AmbientLayer } from './AmbientLayer';
import { FRAMING, ProductModel } from './ProductModels';
import { PosterFallback } from './PosterFallback';
import { Stage } from './Stage';

/**
 * LAYER 3 — SCROLL CHOREOGRAPHY
 *
 * The camera travels a Catmull-Rom spline around the object while the story
 * beats cross-fade. The scroll position is read once per ScrollTrigger update
 * into a ref; the canvas damps toward it in useFrame. Nothing here re-renders
 * React on scroll: the only state change is the active beat index, which is what
 * the annotation rail and the accessibility tree need.
 *
 * Sticky positioning does the pinning (no ScrollTrigger pin-spacers), which
 * keeps layout state honest through resizes and works with Lenis untouched.
 */

/** Camera path: an arc around the object, sinking slightly as the story ends. */
function cameraPath(kind: ProductModelKind, beats: number) {
  const base = FRAMING[kind].camera;
  const radius = Math.hypot(base[0], base[2]);
  const start = Math.atan2(base[0], base[2]);
  const steps = Math.max(2, beats);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < steps; i += 1) {
    const u = i / (steps - 1);
    const angle = start + u * Math.PI * 0.62;
    const r = radius * (1.08 - u * 0.2);
    const y = base[1] + Math.sin(u * Math.PI) * 0.62 - u * 0.3;
    points.push(new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r));
  }

  return new THREE.CatmullRomCurve3(points);
}

function CameraRail({
  progress,
  kind,
  beats,
  targetX,
}: {
  progress: React.RefObject<number>;
  kind: ProductModelKind;
  beats: number;
  targetX: number;
}) {
  const camera = useThree((s) => s.camera);
  const curve = useMemo(() => cameraPath(kind, beats), [kind, beats]);
  const look = useMemo(() => {
    const [x, y, z] = FRAMING[kind].target;
    // Shifting the pivot (rather than the canvas) composes the object to one
    // side of the viewport while the ambient layer stays full-bleed.
    return new THREE.Vector3(x + targetX, y, z);
  }, [kind, targetX]);
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const u = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    curve.getPointAt(u, point);
    camera.position.lerp(point, Math.min(1, dt * 4.5));
    camera.lookAt(look);
  });

  return null;
}

export type ScrollStoryProps = {
  product: Product;
  finish: Finish;
  beats?: Beat[];
  /** Eyebrow above the first beat. */
  label?: string;
  className?: string;
};

export function ScrollStory({
  product,
  finish,
  beats = product.beats,
  label = 'In three movements',
  className,
}: ScrollStoryProps) {
  const cap = useCapability();
  const wide = useMediaQuery('(min-width: 1024px)');
  const section = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const framing = FRAMING[product.model];
  const targetX = wide ? -0.42 : 0;
  const live = cap.probed && !cap.reducedMotion;

  useEffect(() => {
    if (!live) {
      progress.current = 1;
      return;
    }
    registerGsap();
    const el = section.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.current = self.progress;
        if (rail.current) rail.current.style.transform = `scaleY(${self.progress})`;
        const next = Math.min(
          beats.length - 1,
          Math.floor(self.progress * beats.length * 0.999),
        );
        setActive((prev) => (prev === next ? prev : next));
      },
    });

    const items = el.querySelectorAll('[data-beat]');
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    });
    items.forEach((item, i) => {
      tl.fromTo(
        item,
        { autoAlpha: 0, yPercent: 10 },
        { autoAlpha: 1, yPercent: 0, duration: 0.42 },
        i + 0.04,
      );
      if (i < items.length - 1) {
        tl.to(item, { autoAlpha: 0, yPercent: -7, duration: 0.36 }, i + 0.64);
      }
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      trigger.kill();
    };
  }, [beats.length, live]);

  /* --- Reduced motion / low capability: the same story, told in type -------- */

  if (cap.probed && (cap.reducedMotion || cap.tier === 'low')) {
    return (
      <section className={`shell py-[var(--space-section)] ${className ?? ''}`}>
        <h2 className="eyebrow eyebrow-dark">{label}</h2>
        <div className="mt-12 grid gap-px bg-line lg:grid-cols-3">
          {beats.map((beat) => (
            <article key={beat.id} className="bg-surface p-8 lg:p-10 border border-line shadow-soft">
              <p className="eyebrow eyebrow-dark">{beat.label}</p>
              <h3 className="display-face mt-8 text-h3 text-bone text-balance">
                {beat.title}
              </h3>
              <p className="mt-5 text-small text-fog">{beat.body}</p>
            </article>
          ))}
        </div>
        <div className="relative mt-16 aspect-[4/3] lg:aspect-[21/9]">
          <Stage
            className="absolute inset-0"
            camera={framing.camera}
            target={framing.target}
            fov={framing.fov}
            shadowScale={10}
            ambient={<AmbientLayer intensity={0.8} octaves={3} />}
            fallback={
              <PosterFallback
                kind={product.model}
                colors={product.poster}
                className="absolute inset-0"
                caption={`${product.name} — static render`}
              />
            }
          >
            <ProductModel kind={product.model} finish={finish} />
          </Stage>
        </div>
      </section>
    );
  }

  return (
    <div
      ref={section}
      className={`relative ${className ?? ''}`}
      style={{ height: `${beats.length * 100 + 60}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Stage
          className="absolute inset-0"
          camera={framing.camera}
          target={[framing.target[0] + targetX, framing.target[1], framing.target[2]]}
          fov={framing.fov}
          shadowScale={10}
          ambient={<AmbientLayer intensity={0.8} octaves={3} />}
          fallback={
            <PosterFallback
              kind={product.model}
              colors={product.poster}
              className="absolute inset-0"
              caption={`${product.name} — static render`}
            />
          }
        >
          <CameraRail
            progress={progress}
            kind={product.model}
            beats={beats.length}
            targetX={targetX}
          />
          <ProductModel kind={product.model} finish={finish} />
        </Stage>

        {/* Scrim: rich architectural limestone gradient for crystal clear text readability over 3D render */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#f6f2eb] via-[#f6f2eb]/75 to-transparent lg:bg-linear-to-r lg:from-[#f6f2eb] lg:via-[#f6f2eb]/60 lg:to-transparent"
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="shell flex h-full flex-col justify-end pb-16 lg:grid lg:h-full lg:grid-cols-12 lg:items-center lg:pb-0">
            <div className="lg:col-span-5 lg:pt-4">
              <h2 className="eyebrow eyebrow-dark">{label}</h2>

              <div className="mt-10 grid lg:min-h-[22rem] lg:content-center">
                {beats.map((beat, i) => (
                  <article
                    key={beat.id}
                    data-beat
                    className={`col-start-1 row-start-1 ${
                      i === 0 ? '' : 'invisible'
                    }`}
                  >
                    <p className="eyebrow eyebrow-dark">{beat.label}</p>
                    <h3 className="display-face mt-6 text-h2 text-bone text-balance">
                      {beat.title}
                    </h3>
                    <p className="mt-6 max-w-[46ch] text-lede text-mist/90">{beat.body}</p>
                  </article>
                ))}
              </div>
            </div>

            {/* Index rail */}
            <div className="hidden lg:col-span-4 lg:col-start-9 lg:flex lg:items-center lg:justify-end">
              <div className="flex items-center gap-6">
                <span className="eyebrow eyebrow-dark tabular">
                  {String(active + 1).padStart(2, '0')} / {String(beats.length).padStart(2, '0')}
                </span>
                <span className="relative block h-24 w-px bg-line-soft">
                  <span
                    ref={rail}
                    className="absolute inset-0 origin-top bg-copper"
                    style={{ transform: 'scaleY(0)' }}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
