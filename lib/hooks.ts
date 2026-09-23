'use client';

import { useEffect, useRef, useState } from 'react';

/** SSR-safe media query. Starts false, resolves after mount. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/* -------------------------------------------------------------------------- */
/*  Device capability                                                          */
/* -------------------------------------------------------------------------- */

export type DeviceTier = 'high' | 'mid' | 'low';

export type Capability = {
  /** 'low' means: do not attempt WebGL at all. */
  tier: DeviceTier;
  reducedMotion: boolean;
  touch: boolean;
  /** False until the probe has run — lets callers avoid a wrong first frame. */
  probed: boolean;
};

const UNSAFE_DEFAULT: Capability = {
  tier: 'high',
  reducedMotion: false,
  touch: false,
  probed: false,
};

function probeWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return false;
    // Release the probe context immediately; Safari caps live contexts.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * The probe runs once per document, not once per component. Five separate hosts
 * (hero, story, configurator, hover preview, stage) all need the answer, and
 * each instance probing for itself would create — and immediately destroy — its
 * own WebGL context, which Safari counts against a hard budget.
 */
let probed: Capability | null = null;
let queued = false;
const waiting = new Set<(cap: Capability) => void>();

function runProbe() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;

  const constrained =
    connection?.saveData === true ||
    connection?.effectiveType === '2g' ||
    connection?.effectiveType === 'slow-2g';

  let tier: DeviceTier = 'high';
  if (!probeWebGL() || constrained || cores <= 2 || memory <= 2) {
    tier = 'low';
  } else if (cores <= 4 || memory <= 4 || touch) {
    tier = 'mid';
  }

  probed = { tier, reducedMotion, touch, probed: true };
  waiting.forEach((notify) => notify(probed as Capability));
  waiting.clear();
}

/**
 * Capability probe. Decides between a full WebGL scene and the static poster
 * fallback, so a low-end phone never pays for a context it can't drive.
 *
 * Deferred to the next frame so context creation never competes with hydration
 * and first paint. Callers must treat `probed: false` as "not yet" and hold
 * their space quietly — see Stage.
 */
export function useCapability(): Capability {
  const [cap, setCap] = useState<Capability>(() => probed ?? UNSAFE_DEFAULT);

  useEffect(() => {
    if (probed) {
      setCap(probed);
      return;
    }
    waiting.add(setCap);
    if (!queued) {
      queued = true;
      requestAnimationFrame(runProbe);
    }
    return () => {
      waiting.delete(setCap);
    };
  }, []);

  return cap;
}

/** True when the device should get the real WebGL scene. */
export function canRender3D(cap: Capability): boolean {
  return cap.probed && cap.tier !== 'low';
}

/* -------------------------------------------------------------------------- */
/*  Pointer helpers                                                            */
/* -------------------------------------------------------------------------- */

/** Normalised pointer position (-1..1) tracked in a ref — no re-renders. */
export function usePointerRef() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return pointer;
}

/** Tracks whether an element is intersecting once; used to defer heavy canvases. */
export function useInViewOnce<T extends HTMLElement>(
  rootMargin = '200px',
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, seen]);

  return [ref, seen];
}
