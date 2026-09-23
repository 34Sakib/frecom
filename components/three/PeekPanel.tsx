'use client';

import * as THREE from 'three';
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFrame } from '@react-three/fiber';
import { Stage } from './Stage';
import { FRAMING, ProductModel } from './ProductModels';
import { usePeek } from './peek';
import { usePointerRef } from '@/lib/hooks';
import { getFinish, type Product } from '@/lib/products';

/**
 * CATALOGUE HOVER PEEK
 *
 * One canvas follows the cursor and shows the hovered object as 3D. One, not one
 * per card: a context per grid item would blow past the browser's context budget
 * on the first scroll.
 *
 * This is pure enhancement, so the catalogue only mounts it on the highest tier
 * of device — pointer-fine input, a device that passed the WebGL probe, and no
 * reduced-motion preference (a panel that chases the cursor is precisely the kind
 * of motion that preference exists to refuse). Touch and low-tier devices get
 * nothing at all rather than a degraded version.
 *
 * It reads the hovered object from the peek store, so it mounts as a plain
 * sibling of the grid — no wrapper, nothing to remount when its chunk lands.
 * The canvas mounts parked at opacity 0, so shader compilation happens during
 * idle rather than during the user's first hover, and it idles at
 * `frameloop="demand"`: an unhovered grid costs zero frames.
 */

/** Frames the object slightly wider than the detail page — the peek is square. */
function peekCamera(product: Product): {
  camera: [number, number, number];
  target: [number, number, number];
  fov: number;
} {
  const frame = FRAMING[product.model];
  const target = new THREE.Vector3(...frame.target);
  const camera = new THREE.Vector3(...frame.camera)
    .sub(target)
    .multiplyScalar(1.2)
    .add(target);
  return { camera: [camera.x, camera.y, camera.z], target: frame.target, fov: frame.fov };
}

/** A gentle lean toward the cursor plus a slow drift, so the object is never dead still. */
function PeekRig({ phase, children }: { phase: number; children: ReactNode }) {
  const pointer = usePointerRef();
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    t.current += dt;
    const k = Math.min(1, dt * 3.2);
    const yaw = pointer.current.x * 0.42 + Math.sin(t.current * 0.42 + phase) * 0.1;
    g.rotation.y += (yaw - g.rotation.y) * k;
    g.rotation.x += (pointer.current.y * -0.14 - g.rotation.x) * k;
  });

  return <group ref={group}>{children}</group>;
}

function PeekBody({ product, active }: { product: Product; active: boolean }) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const cursor = useRef({ x: 0, y: 0 });

  const place = useCallback(() => {
    const el = wrap.current;
    if (!el) return;
    const { x, y } = cursor.current;
    // Offset up and to the right so the cursor tip never lands on the object.
    el.style.transform = `translate3d(calc(${x}px - 50% + 28px), calc(${y}px - 50% - 28px), 0)`;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cursor.current.x = e.clientX;
      cursor.current.y = e.clientY;
      // While hidden the panel has no transition, so this snaps into position
      // and the next reveal fades in where the cursor already is.
      place();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [place]);

  const frame = useMemo(() => peekCamera(product), [product]);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className={[
        'pointer-events-none fixed left-0 top-0 z-40 flex h-[13rem] w-[13rem] flex-col overflow-hidden rounded-lg ring-1 lg:h-[16rem] lg:w-[16rem]',
        'shadow-[var(--shadow-lift)]',
        active
          ? 'bg-ink/80 opacity-100 ring-line-soft backdrop-blur-md transition-opacity duration-[var(--duration-section)] ease-[var(--ease-exp)]'
          : 'bg-ink opacity-0 ring-line transition-none',
      ].join(' ')}
    >
      <div className="relative min-h-0 flex-1">
        <Stage
          className="absolute inset-0"
          camera={frame.camera}
          target={frame.target}
          fov={frame.fov}
          shadows={false}
          paused={!active}
          fallback={null}
        >
          <PeekRig phase={product.order * 1.7}>
            <ProductModel kind={product.model} finish={getFinish(product)} />
          </PeekRig>
        </Stage>
        {/* A hint of the object's own light, so the panel does not read as a
            flat cut-out pasted over the card. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(58% 52% at 50% 44%, rgb(255 246 232 / 0.09), transparent 70%)',
          }}
        />
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-4 py-3">
        <span className="eyebrow eyebrow-dark">{product.code}</span>
        <span className="truncate text-small text-mist">
          {product.name} — {getFinish(product).name}
        </span>
      </div>
    </div>
  );
}

/** Portalled to the body: a transformed grid ancestor would trap a fixed panel. */
export function PeekPanel() {
  const product = usePeek((s) => s.product);
  const active = usePeek((s) => s.active);
  return createPortal(<PeekBody product={product} active={active} />, document.body);
}
