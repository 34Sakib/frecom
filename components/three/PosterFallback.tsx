'use client';

import { useId } from 'react';
import type { ProductModelKind } from '@/lib/products';

/**
 * The spec's low-power path: "serve a static image or short video loop instead of
 * full WebGL 3D". No photography was supplied, so the plate is drawn instead —
 * SVG silhouettes over the product's own poster gradient, with the same grain
 * pass as the rest of the site. It costs a few hundred bytes and keeps the page
 * art-directed on a device that cannot afford a context.
 */

const TRIM = '#8a6d3b';
const DARK = '#2a2420';
const COPPER = '#8a6d3b';

const cap = {
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function Silhouette({ kind, body }: { kind: ProductModelKind; body: string }) {
  switch (kind) {
    case 'headphone':
      return (
        <g {...cap}>
          <path
            d="M62 132C62 76 88 56 120 56s58 20 58 76"
            fill="none"
            stroke={TRIM}
            strokeWidth="11"
          />
          <path
            d="M64 132C64 82 88 64 120 64s56 18 56 68"
            fill="none"
            stroke={DARK}
            strokeWidth="4"
            opacity="0.7"
          />
          <rect x="48" y="124" width="36" height="66" rx="16" fill={body} stroke={TRIM} strokeWidth="1.4" />
          <rect x="156" y="124" width="36" height="66" rx="16" fill={body} stroke={TRIM} strokeWidth="1.4" />
          <circle cx="66" cy="157" r="12" fill={DARK} opacity="0.85" />
          <circle cx="174" cy="157" r="12" fill={DARK} opacity="0.85" />
          <path d="M66 190c-6 12-4 20 4 24" fill="none" stroke={DARK} strokeWidth="3" />
        </g>
      );

    case 'monitor':
      return (
        <g {...cap}>
          <rect x="68" y="62" width="104" height="132" rx="9" fill={body} stroke={TRIM} strokeWidth="1.4" />
          <rect x="77" y="71" width="86" height="114" rx="6" fill={DARK} opacity="0.55" />
          <circle cx="120" cy="146" r="31" fill={DARK} />
          <circle cx="120" cy="146" r="31" fill="none" stroke={TRIM} strokeWidth="3" opacity="0.8" />
          <circle cx="120" cy="146" r="10" fill={TRIM} opacity="0.32" />
          <circle cx="120" cy="100" r="14" fill={DARK} stroke={TRIM} strokeWidth="2.2" />
          <rect x="106" y="185" width="28" height="5" rx="2.5" fill={TRIM} opacity="0.7" />
          <rect x="84" y="192" width="14" height="8" rx="3" fill={DARK} />
          <rect x="142" y="192" width="14" height="8" rx="3" fill={DARK} />
        </g>
      );

    case 'turntable':
      return (
        <g {...cap}>
          <ellipse cx="104" cy="146" rx="52" ry="15" fill={TRIM} opacity="0.22" stroke={TRIM} strokeWidth="1.4" />
          <ellipse cx="104" cy="143" rx="15" ry="5" fill={DARK} opacity="0.8" />
          <path d="M104 137V127" stroke={TRIM} strokeWidth="3" />
          <path d="M178 156 140 139" stroke={TRIM} strokeWidth="3.4" />
          <circle cx="178" cy="156" r="8" fill={body} stroke={TRIM} strokeWidth="2" />
          <circle cx="187" cy="151" r="5.5" fill={DARK} stroke={TRIM} strokeWidth="1" />
          <rect x="44" y="152" width="152" height="24" rx="6" fill={body} stroke={TRIM} strokeWidth="1.4" />
          <rect x="60" y="176" width="15" height="9" rx="4" fill={DARK} />
          <rect x="150" y="176" width="15" height="9" rx="4" fill={DARK} />
        </g>
      );

    case 'amplifier':
      return (
        <g {...cap}>
          <rect x="44" y="126" width="152" height="54" rx="7" fill={body} stroke={TRIM} strokeWidth="1.4" />
          <rect x="44" y="126" width="152" height="16" rx="6" fill={TRIM} opacity="0.75" />
          <circle cx="78" cy="159" r="15" fill={TRIM} opacity="0.9" />
          <circle cx="78" cy="159" r="7.5" fill={DARK} />
          <path d="M78 146v6" stroke={DARK} strokeWidth="2.4" />
          <rect x="116" y="150" width="5" height="15" rx="2.5" fill={TRIM} />
          <rect x="131" y="150" width="5" height="15" rx="2.5" fill={TRIM} />
          <rect x="146" y="150" width="5" height="15" rx="2.5" fill={TRIM} />
          <circle cx="170" cy="134" r="3.4" fill={COPPER} />
          <circle cx="181" cy="134" r="3.4" fill={COPPER} opacity="0.5" />
          <rect x="58" y="180" width="12" height="8" rx="3" fill={DARK} />
          <rect x="170" y="180" width="12" height="8" rx="3" fill={DARK} />
        </g>
      );

    case 'stand':
      return (
        <g {...cap}>
          <path
            d="M92 186C88 120 96 84 118 84s28 34 28 102"
            fill="none"
            stroke={body}
            strokeWidth="12"
          />
          <path
            d="M92 186C88 120 96 84 118 84s28 34 28 102"
            fill="none"
            stroke={TRIM}
            strokeWidth="1.2"
            opacity="0.5"
          />
          <ellipse cx="118" cy="80" rx="19" ry="10" fill="none" stroke={DARK} strokeWidth="7" />
          <ellipse cx="118" cy="186" rx="42" ry="12" fill={body} stroke={TRIM} strokeWidth="1.4" />
          <ellipse cx="118" cy="182" rx="33" ry="9" fill="none" stroke={TRIM} strokeWidth="1" opacity="0.55" />
        </g>
      );

    case 'portable':
      return (
        <g {...cap}>
          <rect x="84" y="62" width="72" height="132" rx="36" fill={body} stroke={TRIM} strokeWidth="1.4" />
          {[0, 1, 2, 3].map((c) =>
            [0, 1, 2, 3, 4].map((r) => (
              <circle
                key={`${c}-${r}`}
                cx={99 + c * 14}
                cy={94 + r * 17}
                r="3.2"
                fill={DARK}
                opacity="0.75"
              />
            )),
          )}
          <rect x="82" y="56" width="76" height="11" rx="5.5" fill={TRIM} />
          <rect x="82" y="189" width="76" height="11" rx="5.5" fill={TRIM} />
          <ellipse cx="120" cy="56" rx="17" ry="5" fill="none" stroke={TRIM} strokeWidth="2.4" />
          <circle cx="134" cy="56" r="2.6" fill={COPPER} />
        </g>
      );
  }
}

export type PosterFallbackProps = {
  kind: ProductModelKind;
  /** [body, base] colours straight from the product record. */
  colors: [string, string];
  caption?: string;
  className?: string;
};

export function PosterFallback({
  kind,
  colors,
  caption = 'Static render',
  className,
}: PosterFallbackProps) {
  const [body, base] = colors;
  // Two plates of the same model can share a page (hero plus rail), and a
  // duplicated gradient id makes the second one paint with the first one's
  // colours. The React id keeps each plate self-contained.
  const poolId = `pool-${useId()}`;

  return (
    <div className={`overflow-hidden bg-[#efe7da]/50 ${className ?? ''}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(115% 85% at 50% 74%, #efe7da 0%, #f7f3ec 70%)`,
        }}
      />
      <svg
        viewBox="0 0 240 240"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        className="relative h-full w-full"
      >
        <defs>
          <radialGradient id={poolId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8a6d3b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8a6d3b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="120" cy="200" rx="98" ry="21" fill={`url(#${poolId})`} />
        <ellipse cx="120" cy="195" rx="60" ry="8" fill="#3a2e22" opacity="0.16" />
        <Silhouette kind={kind} body={body} />
      </svg>
      <div aria-hidden="true" className="grain-layer pointer-events-none absolute inset-0 opacity-20" />
      {caption && (
        <p className="eyebrow eyebrow-dark absolute bottom-4 left-4">{caption}</p>
      )}
    </div>
  );
}
