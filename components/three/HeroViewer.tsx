'use client';

import * as THREE from 'three';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { Finish, Product } from '@/lib/products';
import { EASE, gsap, registerGsap } from '@/lib/gsap';
import { useCapability } from '@/lib/hooks';
import { AmbientLayer } from './AmbientLayer';
import { FRAMING, ProductModel } from './ProductModels';
import { PosterFallback } from './PosterFallback';
import { Stage } from './Stage';

/**
 * LAYER 2 — HERO 3D VIEWER
 *
 * Three motions, each with a job:
 *   · dolly-in on load (GSAP) — signals "this object is the subject", and covers
 *     the moment the environment finishes baking
 *   · idle drift — proves the object is real 3D without demanding a drag
 *   · damped drag / arrow keys — hands over control without a hard transition
 *
 * The DOM owns intent, the canvas consumes it. That split is what lets the arrow
 * keys work without re-rendering a single React component per frame.
 */

type Intent = {
  /** Target yaw/pitch in radians. The canvas damps toward these. */
  yaw: number;
  pitch: number;
  idle: boolean;
};

const IDLE_RESUME_MS = 2800;
const PITCH_LIMIT = 0.42;

function SpinRig({
  product,
  finish,
  intent,
  autoRotate,
}: {
  product: Product;
  finish: Finish;
  intent: React.RefObject<Intent>;
  autoRotate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const elapsed = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    elapsed.current += dt;
    const state = intent.current;
    if (!state) return;

    if (autoRotate && state.idle) {
      state.yaw += dt * 0.14;
      state.pitch += (0 - state.pitch) * Math.min(1, dt * 0.9);
      // Barely-there float: reads as "held in the light", not as an animation.
      g.position.y = Math.sin(elapsed.current * 0.5) * 0.02;
      invalidate();
    }

    const dy = state.yaw - g.rotation.y;
    const dp = state.pitch - g.rotation.x;
    if (Math.abs(dy) < 1e-4 && Math.abs(dp) < 1e-4) return;

    const k = Math.min(1, dt * 5.5);
    g.rotation.y += dy * k;
    g.rotation.x += dp * k;
    invalidate(); // free in 'always' mode; keeps 'demand' mode honest
  });

  return (
    <group ref={group}>
      <ProductModel kind={product.model} finish={finish} />
    </group>
  );
}

function HeroRig({
  product,
  finish,
  intent,
  wakeRef,
  probed,
  reducedMotion,
}: {
  product: Product;
  finish: Finish;
  intent: React.RefObject<Intent>;
  wakeRef: React.RefObject<() => void>;
  probed: boolean;
  reducedMotion: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const [ready, setReady] = useState(false);
  const started = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const framing = FRAMING[product.model];

  const wake = useCallback(() => {
    const state = intent.current;
    if (state) state.idle = false;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      const s = intent.current;
      if (s) s.idle = true;
    }, IDLE_RESUME_MS);
  }, [intent]);

  useEffect(() => {
    wakeRef.current = wake;
    return () => {
      wakeRef.current = () => {};
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [wake, wakeRef]);

  useEffect(() => {
    if (!probed || started.current) return;
    started.current = true;

    // Reduced motion: the object is still fully inspectable, it just arrives
    // in place instead of travelling.
    if (reducedMotion) {
      setReady(true);
      return;
    }

    registerGsap();
    const target = new THREE.Vector3(...framing.target);
    const to = new THREE.Vector3(...framing.camera);
    const from = new THREE.Vector3(to.x * 1.5 + 0.7, to.y + 1.35, to.z * 1.5);
    const control = new THREE.Vector3(to.x * 0.55, to.y + 0.8, to.z * 0.86);
    const path = new THREE.QuadraticBezierCurve3(from, control, to);
    const drive = { t: 0 };

    camera.position.copy(from);
    camera.lookAt(target);

    const tween = gsap.to(drive, {
      t: 1,
      duration: 1.8,
      ease: EASE,
      delay: 0.12,
      onUpdate: () => {
        path.getPoint(drive.t, camera.position);
        camera.lookAt(target);
        invalidate();
      },
      onComplete: () => setReady(true),
    });

    return () => {
      tween.kill();
    };
  }, [camera, framing, invalidate, probed, reducedMotion]);

  // OrbitControls only mounts once the camera has arrived: otherwise its own
  // per-frame update would fight the dolly for control of the camera.
  return (
    <>
      <SpinRig product={product} finish={finish} intent={intent} autoRotate={!reducedMotion} />
      {ready && (
        <OrbitControls
          makeDefault
          target={framing.target}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.055}
          rotateSpeed={0.55}
          keyEvents={false}
          minPolarAngle={Math.PI * 0.24}
          maxPolarAngle={Math.PI * 0.76}
          minDistance={1.4}
          maxDistance={12}
          onStart={wake}
          onChange={() => invalidate()}
        />
      )}
    </>
  );
}

export type HeroViewerProps = {
  product: Product;
  finish: Finish;
  /** Sizing comes from the caller — the viewer fills it. */
  className?: string;
  /** The ambient shader backdrop. On for hero, off for small panels. */
  ambient?: boolean;
  shadows?: boolean;
  /** Renders the drag/keys affordance. */
  hint?: boolean;
};

export function HeroViewer({
  product,
  finish,
  className,
  ambient = true,
  shadows = true,
  hint = true,
}: HeroViewerProps) {
  const cap = useCapability();
  const intent = useRef<Intent>({ yaw: 0, pitch: 0, idle: true });
  const wakeRef = useRef<() => void>(() => {});
  const [touched, setTouched] = useState(false);
  const descId = useId();
  const framing = FRAMING[product.model];

  const onPointerDown = useCallback(() => {
    setTouched(true);
    wakeRef.current();
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = Math.PI / 12;
    const state = intent.current;
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft':
        state.yaw -= step;
        break;
      case 'ArrowRight':
        state.yaw += step;
        break;
      case 'ArrowUp':
        state.pitch = Math.max(-PITCH_LIMIT, state.pitch - 0.12);
        break;
      case 'ArrowDown':
        state.pitch = Math.min(PITCH_LIMIT, state.pitch + 0.12);
        break;
      default:
        handled = false;
    }
    if (!handled) return;
    e.preventDefault();
    wakeRef.current();
  }, []);

  return (
    <div
      // The viewer fills whatever box it is handed and is always its own
      // positioning context: `className` sizes it, never positions it. Hardcoding
      // `relative` next to a caller's `absolute` made the two fight in the
      // cascade, and the loser collapsed the box to zero height — a blank canvas
      // with no error anywhere. `h-full` makes the fill unconditional.
      className={`relative h-full w-full cursor-grab outline-none active:cursor-grabbing ${className ?? ''}`}
      // The drag surface is the canvas itself — OrbitControls needs the pointer
      // events — so the focusable wrapper carries the keyboard control instead.
      tabIndex={0}
      role="group"
      aria-roledescription="Interactive 3D product view"
      aria-label={`${product.name}, ${finish.name} finish. Drag to rotate, or use the arrow keys.`}
      aria-describedby={descId}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      <Stage
        className="absolute inset-0"
        camera={framing.camera}
        target={framing.target}
        fov={framing.fov}
        shadows={shadows}
        ambient={ambient ? <AmbientLayer intensity={0.8} /> : undefined}
        fallback={
          <PosterFallback
            kind={product.model}
            colors={product.poster}
            className="absolute inset-0"
            caption={`${product.name} — static render`}
          />
        }
      >
        <HeroRig
          product={product}
          finish={finish}
          intent={intent}
          wakeRef={wakeRef}
          probed={cap.probed}
          reducedMotion={cap.reducedMotion}
        />
      </Stage>



      <p id={descId} className="sr-only">
        A rendered three-dimensional view of the {product.name} in the {finish.name}{' '}
        finish. The object can be turned with the arrow keys once this view has focus.
        Finish selection and the full specification are available as text on this page
        and do not require the 3D view.
      </p>
    </div>
  );
}
