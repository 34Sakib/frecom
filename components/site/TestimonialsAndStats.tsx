'use client';

import { useState } from 'react';
import { Counter } from '@/components/ui/Counter';
import { Reveal, RevealGroup, RevealItem, RevealMask } from '@/components/ui/Reveal';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  location: string;
  object: string;
  initials: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The Aurora 01 is the only closed headphone I can master with for eight hours without second-guessing low-end balance. The bass extension is transparent, tight, and completely honest.',
    author: 'Marcus Ward',
    role: 'Senior Mastering Engineer',
    location: 'Abbey Road / London',
    object: 'Aurora 01',
    initials: 'MW',
  },
  {
    quote:
      'Monolith 09 gives us the phase accuracy of a point source with the headroom of an architectural near-field. It anchors our cutting room with zero acoustic fatigue.',
    author: 'Kenji Takahashi',
    role: 'Acoustic Director',
    location: 'Tokyo Sound Lab',
    object: 'Monolith 09',
    initials: 'KT',
  },
  {
    quote:
      'The Atelier T3 plinth absorbs floor vibration better than setups three times its weight. Pitch stability on piano transients is pristine. Pure mechanical excellence.',
    author: 'Elena Voss',
    role: 'Classical Producer & Archivist',
    location: 'Berlin Philharmonie',
    object: 'Atelier T3',
    initials: 'EV',
  },
];

export function TestimonialsAndStats() {
  const [activeQuote, setActiveQuote] = useState(0);

  return (
    <section className="border-y border-line bg-[#efe7da] py-[var(--space-section)]">
      <div className="shell">
        {/* Editorial Testimonials Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="eyebrow eyebrow-dark">Peer Verification</p>
            <h2 className="display-face mt-6 text-h2 text-bone">
              <RevealMask>Verified in professional rooms</RevealMask>
            </h2>
          </Reveal>

          {/* Tab switcher */}
          <div className="flex items-center gap-3">
            {TESTIMONIALS.map((t, idx) => (
              <button
                key={t.author}
                type="button"
                onClick={() => setActiveQuote(idx)}
                aria-label={`Testimonial from ${t.author}`}
                className={`rounded-full px-4 py-1.5 text-micro transition-all duration-200 ${
                  activeQuote === idx
                    ? 'border border-copper bg-white text-copper shadow-xs'
                    : 'border border-line bg-white/60 text-fog hover:text-bone'
                }`}
              >
                {t.initials} — {t.object}
              </button>
            ))}
          </div>
        </div>

        {/* Quote Display */}
        <div className="mt-12 rounded-lg border border-line bg-white p-8 sm:p-12 lg:p-16 shadow-soft">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="eyebrow eyebrow-dark text-copper">
                {TESTIMONIALS[activeQuote].object} Reference
              </p>
              <blockquote className="display-face mt-6 text-h3 text-bone leading-[1.3] text-balance">
                &ldquo;{TESTIMONIALS[activeQuote].quote}&rdquo;
              </blockquote>
              <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-small font-medium text-bone">
                  {TESTIMONIALS[activeQuote].author}
                </span>
                <span aria-hidden="true" className="text-line-soft">
                  —
                </span>
                <span className="text-micro text-fog">
                  {TESTIMONIALS[activeQuote].role}, {TESTIMONIALS[activeQuote].location}
                </span>
              </div>
            </div>

            <div className="hidden lg:col-span-4 lg:flex lg:flex-col lg:items-end lg:justify-center border-l border-line/60 pl-8">
              <span className="display-face text-[5rem] font-light leading-none text-copper/25">
                {TESTIMONIALS[activeQuote].initials}
              </span>
              <span className="eyebrow eyebrow-dark mt-4">Certified Listener</span>
            </div>
          </div>
        </div>

      {/* Animated Stat Counters (Count up once on scroll into view) */}
      <RevealGroup className="mt-16 grid grid-cols-2 gap-8 border-t border-line pt-12 sm:grid-cols-4 lg:mt-20">
        <RevealItem>
          <dt className="eyebrow eyebrow-dark">Bench Test Hours</dt>
          <dd className="display-face mt-4 text-h2 text-bone">
            <Counter value={4200} />
            <span className="text-copper ml-1">+</span>
          </dd>
          <p className="mt-2 text-micro text-fog">Monitored listening sessions</p>
        </RevealItem>

        <RevealItem>
          <dt className="eyebrow eyebrow-dark">Billet Tolerance</dt>
          <dd className="display-face mt-4 text-h2 text-bone">
            ±<Counter value={20} />
            <span className="text-copper ml-1">μm</span>
          </dd>
          <p className="mt-2 text-micro text-fog">Aviation CNC machining</p>
        </RevealItem>

        <RevealItem>
          <dt className="eyebrow eyebrow-dark">Inspection Pass</dt>
          <dd className="display-face mt-4 text-h2 text-bone">
            <Counter value={100} />
            <span className="text-copper ml-1">%</span>
          </dd>
          <p className="mt-2 text-micro text-fog">Hand-tested before sealing</p>
        </RevealItem>

        <RevealItem>
          <dt className="eyebrow eyebrow-dark">Room Supply Chain</dt>
          <dd className="display-face mt-4 text-h2 text-copper">
            <Counter value={1} />
          </dd>
          <p className="mt-2 text-micro text-fog">One single workshop room</p>
        </RevealItem>
      </RevealGroup>
      </div>
    </section>
  );
}
