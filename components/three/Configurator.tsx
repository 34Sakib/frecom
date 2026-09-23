'use client';

import * as THREE from 'three';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Finish, Product, ProductModelKind } from '@/lib/products';
import { ScrollTrigger, registerGsap } from '@/lib/gsap';
import { useCapability, useMediaQuery } from '@/lib/hooks';
import { FinishPicker } from '@/components/site/FinishPicker';
import { AmbientLayer } from './AmbientLayer';
import { FRAMING, ProductModel } from './ProductModels';
import { PosterFallback } from './PosterFallback';
import { Stage } from './Stage';

/**
 * THE CONFIGURATOR — annotation callouts + live finish
 *
 * The camera does not orbit on a timer here; it is *choreographed by the copy*.
 * Every beat owns a point on the model, and that point does two jobs: it is where
 * the leader line lands, and it is where the camera swings. So the shot and the
 * sentence are always about the same part — which is the whole reason to pin a
 * section instead of showing a rotating object next to a paragraph.
 *
 * There are no drag controls in this view. A hand on the camera would fight the
 * rail every frame; the hero above already hands over full manual control, and
 * the DOM copy carries the same information for anyone who never touches 3D.
 */

type Vec3 = [number, number, number];
type Side = 'left' | 'right';
type Shot = { camera: Vec3; look: Vec3 };

/**
 * Annotation anchors in world space, read off the geometry in ProductModels —
 * one per beat, in beat order. They are exact because the models are exact, and
 * they are the seam that survives a swap to a GLB: today they are numbers, with
 * real assets they become named-node lookups (`scene.getObjectByName('cup')`).
 */
const ANCHORS: Record<ProductModelKind, Vec3[]> = {
  headphone: [
    [1.16, -0.4, 0.26], // cup shell, upper outer edge
    [0.05, 1.13, 0.08], // headband crown
    [1.22, -0.72, 0.06], // machined outer face plate
  ],
  monitor: [
    [0, 0.12, 0.56], // baffle, between the two drivers
    [0, 0.3, 0.6], // tweeter + waveguide
    [0, -1.05, 0.58], // badge above the boundary switch legend
  ],
  turntable: [
    [-0.28, -0.84, 0.71], // platter rim
    [0.84, -0.74, -0.28], // unipivot bearing housing
    [0.6, -0.98, 0.86], // plinth, front right
  ],
  amplifier: [
    [0.5, -0.44, -0.15], // top vents
    [-1.14, -0.79, 0.3], // left end panel, where the iron sits
    [-0.38, -0.72, 0.79], // toggles on the fascia
  ],
  stand: [
    [-0.36, -0.6, 0.12], // arc, lower left
    [0.34, -1.08, 0.4], // base
    [0.06, 0.26, 0.16], // felt cradle
  ],
  portable: [
    [0, -0.35, 0.52], // grille
    [0.51, -0.6, 0.1], // extruded tube wall
    [0.16, 0.5, 0.18], // machined top cap + control ring
  ],
};

/**
 * Camera keyframes, derived from the anchors rather than hand-placed per product.
 * The view direction is mixed halfway between the product's own front-on framing
 * and the direction of the part, then pushed in slightly across the sequence —
 * which keeps the shot moving even for objects whose details all sit on one face.
 */
function shotsFor(kind: ProductModelKind, anchors: Vec3[]): Shot[] {
  const base = FRAMING[kind];
  const center = new THREE.Vector3(...base.target);
  const out = new THREE.Vector3(...base.camera).sub(center);
  const radius = out.length();
  const dir = out.normalize();
  const aim = new THREE.Vector3();
  const view = new THREE.Vector3();
  const last = Math.max(1, anchors.length - 1);

  return anchors.map((a, i) => {
    const anchor = new THREE.Vector3(a[0], a[1], a[2]);
    aim.copy(anchor).sub(center).normalize();
    view.copy(dir).lerp(aim, 0.5);
    if (view.lengthSq() < 1e-3) view.copy(dir);
    view.normalize();

    const dist = radius * 0.86 * (1 - 0.07 * i);
    const cam = center.clone().addScaledVector(view, dist);
    cam.y += Math.sin((i / last) * Math.PI) * 0.16;

    const look = center.clone().lerp(anchor, 0.46);
    return { camera: [cam.x, cam.y, cam.z] as Vec3, look: [look.x, look.y, look.z] as Vec3 };
  });
}

/** Scroll position in, camera out. Damped, so a flick of the wheel still lands. */
function PartRail({
  progress,
  shots,
  targetX,
}: {
  progress: React.RefObject<number>;
  shots: Shot[];
  targetX: number;
}) {
  const camera = useThree((s) => s.camera);
  const camCurve = useMemo(
    () => new THREE.CatmullRomCurve3(shots.map((s) => new THREE.Vector3(...s.camera))),
    [shots],
  );
  const lookCurve = useMemo(
    () => new THREE.CatmullRomCurve3(shots.map((s) => new THREE.Vector3(...s.look))),
    [shots],
  );
  const point = useMemo(() => new THREE.Vector3(), []);
  const aim = useMemo(() => new THREE.Vector3(...shots[0].look), [shots]);
  const smooth = useRef(aim.clone());

  useFrame((_, dt) => {
    const u = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    const k = Math.min(1, dt * 4.5);

    camCurve.getPointAt(u, point);
    camera.position.lerp(point, k);

    lookCurve.getPointAt(u, aim);
    aim.x += targetX;
    smooth.current.lerp(aim, k);
    camera.lookAt(smooth.current);
  });

  return null;
}

/**
 * Projects the 3D anchors into DOM space. A transform write per label per frame —
 * no React state, no layout reads, and the labels stay exactly attached to their
 * parts because they are positioned from the same camera the frame is drawn from.
 *
 * The side a label extends to is tracked in a ref and only lifted into state when
 * it actually changes, so a label crossing the midline re-renders once, not 60
 * times a second.
 */
function AnchorProjector({
  anchors,
  nodes,
  onSide,
}: {
  anchors: Vec3[];
  nodes: React.RefObject<(HTMLDivElement | null)[]>;
  onSide: (i: number, side: Side) => void;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const list = nodes.current;
    if (!list) return;
    for (let i = 0; i < anchors.length; i += 1) {
      const el = list[i];
      if (!el) continue;
      const a = anchors[i];
      v.set(a[0], a[1], a[2]).project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      // Labels lean toward the middle of the frame, whichever side they land on.
      onSide(i, x > size.width * 0.68 ? 'left' : 'right');
    }
  });

  return null;
}

export type ConfiguratorProps = {
  product: Product;
  /** Owned by the page: the buy bar needs the same value. */
  finish: Finish;
  onFinish: (f: Finish) => void;
  /** Eyebrow above the sequence. */
  label?: string;
  className?: string;
};

export function Configurator({
  product,
  finish,
  onFinish,
  label = 'Materials & making',
  className,
}: ConfiguratorProps) {
  const cap = useCapability();
  const wide = useMediaQuery('(min-width: 1024px)');
  const beats = product.beats;
  const section = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const progress = useRef(0);
  const sidesRef = useRef<Side[]>([]);
  const [active, setActive] = useState(0);
  const [sides, setSides] = useState<Side[]>([]);

  const anchors = useMemo(
    () => ANCHORS[product.model].slice(0, beats.length),
    [product.model, beats.length],
  );
  const shots = useMemo(() => shotsFor(product.model, anchors), [product.model, anchors]);
  const targetX = wide ? -0.42 : 0;

  const onSide = useCallback((i: number, side: Side) => {
    if (sidesRef.current[i] === side) return;
    sidesRef.current[i] = side;
    setSides(sidesRef.current.slice());
  }, []);

  const staticOnly = cap.probed && (cap.reducedMotion || cap.tier === 'low');

  useEffect(() => {
    if (staticOnly) return;
    registerGsap();
    const el = section.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.current = self.progress;
        if (rail.current) rail.current.style.transform = `scaleX(${self.progress})`;
        const next = Math.min(
          beats.length - 1,
          Math.floor(self.progress * beats.length * 0.999),
        );
        setActive((prev) => (prev === next ? prev : next));
      },
    });

    return () => trigger.kill();
  }, [beats.length, staticOnly]);

  /* --- Reduced motion / low capability: same parts, told as a spread --------- */

  if (staticOnly) {
    return (
      <section className={`shell py-[var(--space-section)] ${className ?? ''}`}>
        <h2 className="eyebrow eyebrow-dark">{label}</h2>
        <div className="mt-12 grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="flex flex-col gap-10">
            <ol className="border-t border-line">
              {beats.map((beat) => (
                <li key={beat.id} className="border-b border-line py-8">
                  <p className="eyebrow eyebrow-dark">{beat.label}</p>
                  <h3 className="display-face mt-5 text-h3 text-bone text-balance">
                    {beat.title}
                  </h3>
                  <p className="mt-4 max-w-[46ch] text-small text-fog">{beat.body}</p>
                </li>
              ))}
            </ol>
            <FinishPicker product={product} finish={finish} onFinish={onFinish} />
          </div>

          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[38rem]">
            <Stage
              className="absolute inset-0"
              camera={shots[0].camera}
              target={shots[0].look}
              fov={FRAMING[product.model].fov}
              shadowScale={10}
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
        </div>
      </section>
    );
  }

  return (
    <div
      ref={section}
      className={`relative ${className ?? ''}`}
      style={{ height: `${beats.length * 90 + 100}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Stage
          className="absolute inset-0"
          camera={shots[0].camera}
          target={[shots[0].look[0] + targetX, shots[0].look[1], shots[0].look[2]]}
          fov={FRAMING[product.model].fov}
          shadowScale={10}
          ambient={<AmbientLayer intensity={0.6} motes={false} octaves={3} />}
          fallback={
            <PosterFallback
              kind={product.model}
              colors={product.poster}
              className="absolute inset-0"
              caption={`${product.name} — static render`}
            />
          }
        >
          <PartRail progress={progress} shots={shots} targetX={targetX} />
          <ProductModel kind={product.model} finish={finish} />
          <AnchorProjector anchors={anchors} nodes={nodes} onSide={onSide} />
        </Stage>

        {/* Annotation layer: leaders land on the parts, captions lean inward. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {beats.map((beat, i) => {
            const on = i === active;
            const side = sides[i] ?? 'right';
            return (
              <div
                key={beat.id}
                ref={(el) => {
                  nodes.current[i] = el;
                }}
                className="absolute left-0 top-0 will-change-transform"
              >
                <span
                  className={`absolute left-0 top-0 block h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-500 ease-[var(--ease-exp)] ${
                    on ? 'border-copper bg-copper' : 'border-copper/45 bg-ink'
                  }`}
                />
                <span
                  className={`absolute top-0 h-px -translate-y-1/2 bg-copper/35 transition-all duration-500 ease-[var(--ease-exp)] ${
                    side === 'left' ? 'right-2' : 'left-2'
                  } ${on ? 'w-12 lg:w-16' : 'w-8 lg:w-10'}`}
                />
                <span
                  className={`absolute bottom-2.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] transition-opacity duration-500 ease-[var(--ease-exp)] text-copper ${
                    side === 'left' ? 'right-2' : 'left-2'
                  } ${on ? 'opacity-100' : 'opacity-45'}`}
                >
                  {beat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Scrim: enough to hold type over a render, not enough to dim the object. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-transparent lg:bg-linear-to-r lg:from-ink lg:via-ink/40 lg:to-transparent"
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="shell flex h-full flex-col justify-end pb-10 lg:grid lg:h-full lg:grid-cols-12 lg:items-stretch lg:gap-0 lg:py-[clamp(3rem,9vh,6rem)]">
            <div className="lg:col-span-5 lg:flex lg:flex-col lg:justify-between">
              <div>
                <h2 className="eyebrow eyebrow-dark">{label}</h2>

                <div className="mt-8 grid lg:mt-12 lg:min-h-[15rem] lg:content-start">
                  {beats.map((beat, i) => (
                    <article
                      key={beat.id}
                      className={`col-start-1 row-start-1 transition-[opacity,transform] duration-700 ease-[var(--ease-exp)] ${
                        i === active
                          ? 'opacity-100 translate-y-0'
                          : 'pointer-events-none translate-y-2 opacity-0'
                      }`}
                    >
                      <p className="eyebrow eyebrow-dark">{beat.label}</p>
                      <h3 className="display-face mt-6 text-h2 text-bone text-balance">
                        {beat.title}
                      </h3>
                      <p className="mt-6 max-w-[44ch] text-lede text-mist/85">{beat.body}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="lg:mt-14">
                {/* Real scroll progress, drawn straight to the DOM. */}
                <span className="mb-8 block h-px w-full bg-line-soft lg:mb-10">
                  <span
                    ref={rail}
                    className="block h-full origin-left bg-copper"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </span>

                <div className="pointer-events-auto">
                  <FinishPicker product={product} finish={finish} onFinish={onFinish} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
