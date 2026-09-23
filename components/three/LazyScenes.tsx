'use client';

import dynamic from 'next/dynamic';
import { useEffect, type ReactNode } from 'react';

import { PosterFallback } from './PosterFallback';
import { StorySpread } from '@/components/site/StorySpread';
import { registerGsap, ScrollTrigger } from '@/lib/gsap';
import { canRender3D, useCapability } from '@/lib/hooks';
import { useLoad } from '@/lib/store';
import type { HeroViewerProps } from './HeroViewer';
import type { ScrollStoryProps } from './ScrollStory';
import type { ConfiguratorProps } from './Configurator';

/**
 * THE WEBGL BUDGET, ENFORCED AT THE MODULE GRAPH
 *
 * Every 3D host on this site already refused to *create a context* on a device
 * that cannot drive one — but three.js was still being downloaded and parsed on
 * those devices, which is the opposite of what the spec's low-power path asks
 * for. Importing the scene modules is itself the expensive part, so the import
 * has to be what is gated.
 *
 * These wrappers are that gate. Until the capability probe has run they render a
 * spacer of exactly the height the scene will occupy, so the canvas arriving
 * later never shifts the page. On a device that will not draw, three.js is never
 * fetched at all and the poster plate is rendered instead. Only on a capable
 * device does the dynamic import fire.
 *
 * `ssr: false` throughout: the static export ships these routes as HTML with the
 * spacer in place, which is also the correct no-JS answer — nothing is hidden.
 */

const HeroViewer = dynamic<HeroViewerProps>(
  () => import('./HeroViewer').then((m) => m.HeroViewer),
  { ssr: false },
);

const ScrollStory = dynamic<ScrollStoryProps>(
  () => import('./ScrollStory').then((m) => m.ScrollStory),
  { ssr: false },
);

const Configurator = dynamic<ConfiguratorProps>(
  () => import('./Configurator').then((m) => m.Configurator),
  { ssr: false },
);

const AmbientSignature = dynamic<AmbientSignatureProps>(
  () => import('./AmbientSignature').then((m) => m.AmbientSignature),
  { ssr: false },
);

/* -------------------------------------------------------------------------- */
/*  Shared plumbing                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Tells the loader there is nothing left to wait for. Skipping and succeeding are
 * the same outcome from the preloader's point of view — the curtain must not stay
 * up for a scene that was deliberately never started.
 */
function useResolveScene(shouldResolve: boolean) {
  const skipScene = useLoad((s) => s.skipScene);
  useEffect(() => {
    if (shouldResolve) skipScene();
  }, [shouldResolve, skipScene]);
}

/**
 * One re-measure after a scene mounts. The triggers created inside the scene
 * measure the document at their own mount, which is mid-hydration — fonts, the
 * rail and the rest of the page all land around the same frame, and every start
 * and end would otherwise be a few hundred pixels stale.
 */
function useRefreshOnMount() {
  useEffect(() => {
    registerGsap();
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(first);
      if (second) cancelAnimationFrame(second);
    };
  }, []);
}

type GateProps = {
  className?: string;
  /** Rendered before the probe reports and while the import is in flight. */
  spacer: ReactNode;
  fallback: ReactNode;
  children: ReactNode;
};

function Gate({ className, spacer, fallback, children }: GateProps) {
  const cap = useCapability();
  const resolve = cap.probed && !canRender3D(cap);
  useResolveScene(resolve);

  if (!cap.probed) return <div className={className}>{spacer}</div>;
  if (!canRender3D(cap)) return <div className={className}>{fallback}</div>;
  return <SceneMount className={className}>{children}</SceneMount>;
}

/** A fragment with a re-measure attached — no box of its own to disturb layout. */
function SceneMount({ className, children }: { className?: string; children: ReactNode }) {
  useRefreshOnMount();
  return <div className={className}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/*  Public wrappers                                                            */
/* -------------------------------------------------------------------------- */

export function LazyHeroViewer({ product, finish, className, ...rest }: HeroViewerProps) {
  return (
    <Gate
      className={className}
      spacer={null}
      fallback={
        <PosterFallback
          kind={product.model}
          // The poster is the only view a low-power device gets, so it at least
          // takes the finish that was asked for.
          colors={[finish.hex, product.poster[1]]}
          caption={`${product.name} — static render`}
          className="absolute inset-0"
        />
      }
    >
      <HeroViewer product={product} finish={finish} {...rest} />
    </Gate>
  );
}

export function LazyScrollStory({
  product,
  finish,
  beats = product.beats,
  label,
  className,
}: ScrollStoryProps) {
  return (
    <Gate
      className={className}
      spacer={<div aria-hidden="true" style={{ height: `${beats.length * 100 + 60}vh` }} />}
      fallback={
        <StorySpread
          product={product}
          beats={beats}
          label={label ?? 'In three movements'}
        />
      }
    >
      <ScrollStory product={product} finish={finish} beats={beats} label={label} />
    </Gate>
  );
}

export function LazyConfigurator({ product, label, ...rest }: ConfiguratorProps) {
  return (
    <Gate
      spacer={<div aria-hidden="true" style={{ height: `${product.beats.length * 90 + 100}vh` }} />}
      fallback={
        <StorySpread product={product} beats={product.beats} label={label ?? 'Materials & making'} />
      }
    >
      <Configurator product={product} label={label} {...rest} />
    </Gate>
  );
}

export type AmbientSignatureProps = {
  /** Sized by the caller, like every other stage. */
  className?: string;
  /** Rendered if the device will not run a shader. */
  fallbackClassName?: string;
};

export function LazyAmbientSignature({ className, fallbackClassName }: AmbientSignatureProps) {
  return (
    <Gate
      className={className}
      spacer={null}
      fallback={
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-[radial-gradient(120%_90%_at_72%_18%,rgba(192,118,62,0.30),transparent_62%),radial-gradient(90%_70%_at_18%_88%,rgba(241,236,228,0.09),transparent_70%)] ${fallbackClassName ?? ''}`}
        />
      }
    >
      <AmbientSignature className="absolute inset-0" />
    </Gate>
  );
}

/**
 * ROUTES WITH NO 3D AT ALL
 *
 * The loader waits for a scene to report, so a page that never mounts one has to
 * say so or the curtain sits on its safety timeout. This is that statement:
 * render it once on any route with no canvas — including the catalogue, whose
 * preview only exists while a card is hovered.
 */
export function SceneAbsent() {
  useResolveScene(true);
  return null;
}
