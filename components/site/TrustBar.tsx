'use client';

import { usePrefersReducedMotion } from '@/lib/hooks';

type TrustItem = {
  source: string;
  quote: string;
  badge?: string;
};

const TRUST_ITEMS: TrustItem[] = [
  { source: 'Wallpaper* Award', quote: 'Best Acoustic Engineering', badge: 'Design' },
  { source: 'Monocle Directory', quote: 'Atelier of the Year', badge: 'Craft' },
  { source: '5-Year Warranty', quote: 'Every Part Hand-Calibrated', badge: 'Benchmark' },
  { source: 'Wired Reference', quote: 'A Triumph of Quiet Luxury', badge: 'Acoustics' },
  { source: 'Insured Global Air', quote: 'Dispatched Direct from Workshop', badge: 'Courier' },
  { source: 'Numbered Certificate', quote: 'Bench Tested Prior to Seal', badge: 'Verified' },
];

export function TrustBar() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      role="region"
      aria-label="Editorial accolades and trust hallmarks"
      className="relative flex h-16 w-full items-center overflow-hidden border-y border-line bg-[#efe7da]"
    >
      {reducedMotion ? (
        <div className="shell flex items-center justify-between gap-6 overflow-x-auto py-2">
          {TRUST_ITEMS.slice(0, 4).map((item) => (
            <div key={item.source} className="flex shrink-0 items-center gap-2.5">
              <span className="eyebrow text-bone">{item.source}</span>
              <span aria-hidden="true" className="text-line-soft">·</span>
              <span className="text-micro text-fog">{item.quote}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex w-max items-center gap-12 whitespace-nowrap will-change-transform animate-marquee hover:[animation-play-state:paused]">
          {/* Double array for seamless endless marquee */}
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <div key={`${item.source}-${i}`} className="flex items-center gap-3">
              <span className="rounded border border-line bg-white px-2 py-0.5 text-[0.625rem] font-mono uppercase tracking-widest text-copper shadow-xs">
                {item.badge}
              </span>
              <span className="text-small font-medium tracking-tight text-bone">
                {item.source}
              </span>
              <span aria-hidden="true" className="text-line-soft">
                —
              </span>
              <span className="text-micro text-fog">{item.quote}</span>
              <span aria-hidden="true" className="ml-8 text-line-soft/60">
                ✦
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Subtle fade scrims on edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#efe7da] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#efe7da] to-transparent"
      />

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-marquee {
          animation: marquee 36s linear infinite;
        }
      `}</style>
    </div>
  );
}
