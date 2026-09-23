'use client';

import { Reveal, RevealMask } from '@/components/ui/Reveal';

type GalleryItem = {
  id: string;
  tag: string;
  location: string;
  object: string;
  colors: [string, string, string];
  label: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'lathe',
    tag: 'Process 01',
    location: 'London E2 Atelier',
    object: 'FR—01 Cup Billet',
    colors: ['#efe7da', '#e2d7c5', '#8a6d3b'],
    label: 'Single-pass CNC turning of solid 6061 aluminium billet',
  },
  {
    id: 'kyoto',
    tag: 'Installation',
    location: 'Kyoto Sound Sanctuary',
    object: 'FR—09 Pair',
    colors: ['#f2ece1', '#ded2be', '#7a6f62'],
    label: 'Monolith 09 near-field monitors on timber acoustic baffles',
  },
  {
    id: 'anodize',
    tag: 'Finishing',
    location: 'Chemical Room',
    object: 'Oxide Treatment',
    colors: ['#ede3d2', '#dccbb1', '#8a6d3b'],
    label: 'Twelve-hour copper immersion bath for raw patina growth',
  },
  {
    id: 'berlin',
    tag: 'Mastering',
    location: 'Berlin Mitte Studio',
    object: 'FR—03 Transcription',
    colors: ['#f0e9dc', '#e5dac8', '#5c4a2a'],
    label: 'Atelier T3 tracing a 180g lacquer test pressing',
  },
];

export function StudioGallery() {
  return (
    <section className="shell py-[var(--space-section)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <p className="eyebrow eyebrow-dark">In the Wild</p>
          <h2 className="display-face mt-6 text-h2 text-bone">
            <RevealMask>From the lathe to the room</RevealMask>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="max-w-[38ch] text-small text-fog sm:text-right">
            Every object is built to settle into a space rather than demand attention from it.
          </p>
        </Reveal>
      </div>

      {/* 4-Item Authentic Grid — deliberately restrained hover-zoom only */}
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {GALLERY_ITEMS.map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-md border border-line bg-white shadow-xs transition-all duration-300 hover:shadow-soft"
          >
            {/* Visual Plate with subtle hover zoom */}
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <div
                className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-exp)] group-hover:scale-105"
                style={{
                  background: `radial-gradient(ellipse at 30% 20%, ${item.colors[1]} 0%, ${item.colors[0]} 85%)`,
                }}
              >
                {/* Stylized architectural scene graphic */}
                <svg
                  className="absolute inset-0 h-full w-full opacity-40 transition-opacity duration-300 group-hover:opacity-60"
                  viewBox="0 0 200 250"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="100" cy="120" r="55" stroke={item.colors[2]} strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="100" cy="120" r="28" stroke={item.colors[2]} strokeWidth="1.5" />
                  <line x1="20" y1="210" x2="180" y2="210" stroke={item.colors[2]} strokeWidth="0.75" />
                  <line x1="20" y1="220" x2="140" y2="220" stroke={item.colors[2]} strokeWidth="0.5" />
                  <rect x="40" y="50" width="120" height="130" stroke={item.colors[2]} strokeWidth="0.5" strokeOpacity="0.5" />
                </svg>
              </div>

              {/* Tag Overlays */}
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="eyebrow eyebrow-dark rounded-full border border-line/60 bg-white/90 px-2.5 py-1 text-fog shadow-xs">
                  {item.tag}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 rounded border border-line/50 shadow-xs backdrop-blur-sm">
                <span className="eyebrow text-copper block text-[0.625rem]">
                  {item.object}
                </span>
                <p className="mt-1 text-small font-medium text-bone">
                  {item.location}
                </p>
                <p className="mt-1 text-micro text-fog line-clamp-2">
                  {item.label}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
