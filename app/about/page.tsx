import Link from 'next/link';
import type { Metadata } from 'next';

import { LazyAmbientSignature } from '@/components/three/LazyScenes';
import { Counter } from '@/components/ui/Counter';
import { Magnetic } from '@/components/ui/Magnetic';
import { Parallax } from '@/components/ui/Parallax';
import { Reveal, RevealGroup, RevealItem, RevealMask } from '@/components/ui/Reveal';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'The Atelier & Architecture',
  description:
    'Frecom is one workshop in one room: how the objects are drawn, how long they take, and why the collection stays at six.',
};

const MOVEMENTS = [
  {
    id: 'room',
    index: '01',
    label: '01 / The Workshop',
    title: 'One room, and everything in it.',
    body: 'Technical drawings stay on the wall. Parts arrive, get measured against a print with micrometer gauges, and go back if they deviate. The same four craftspeople mill, wind, anodise and assemble, which is why a change to one object turns up in the others inside a week rather than a season.',
  },
  {
    id: 'pace',
    index: '02',
    label: '02 / The Pace',
    title: 'Deliberate cadence is an acoustic constraint.',
    body: 'Nothing here is rushed to an arbitrary release date. An object leaves only when its acoustic impulse measures true. The workshop quotes an archival window rather than a deadline, and the line only evolves when the advancement elevates every object in the studio.',
  },
  {
    id: 'finish',
    index: '03',
    label: '03 / The Finish',
    title: 'The metal is the colour, never a facade.',
    body: 'Surfaces are treated chemically or mechanically — anodised, oxidised, ceramic-stabilised, hand-rubbed. Copper darkens where your hand naturally rests. Solid aluminium retains its velvet bead-blast texture. We prefer living patina over synthetic plastic lacquers.',
  },
];

const COLUMNS = ['lg:col-span-5', 'lg:col-span-5 lg:col-start-8 lg:mt-[12vh]', 'lg:col-span-6 lg:col-start-3'];

export default function AboutPage() {
  const finishCount = products.reduce((n, p) => n + p.finishes.length, 0);

  const LEDGER = [
    { label: 'Atelier Founded', value: 2011, suffix: undefined },
    { label: 'Exhibition Objects', value: products.length, suffix: undefined },
    { label: 'Archival Finishes', value: finishCount, suffix: undefined },
    { label: 'Active Calibration Benches', value: 4, suffix: undefined },
    { label: 'Days per Headphone (Hand-Assembled)', value: 11, suffix: undefined },
    { label: 'Foundry Rooms Involved', value: 1, suffix: undefined },
  ];

  return (
    <main className="bg-ink text-bone">
      {/* ------------------------------------------------------------------ */}
      {/*  HEADER                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="shell pb-[clamp(3rem,7vw,5rem)] pt-[clamp(7rem,17vh,11rem)]">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-8">
            <p className="eyebrow text-copper">The Atelier & Archive</p>
            <h1 className="display-face mt-7 text-h1 text-bone">
              <RevealMask>Six objects, made by four people, in one room.</RevealMask>
            </h1>
          </Reveal>

          <Reveal className="lg:col-span-3 lg:col-start-10 lg:self-end" delay={0.12}>
            <p className="max-w-[34ch] text-small text-fog">
              Frecom is a physical acoustic atelier. The collection remains at six
              because six is the exact number our hands can tune, test, and sign.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  NARRATIVE — three movements                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="shell py-[var(--space-section)]">
        <RevealGroup className="grid gap-y-24 lg:grid-cols-12 lg:gap-x-8">
          {MOVEMENTS.map((movement, i) => (
            <RevealItem key={movement.id} className={`relative ${COLUMNS[i]}`}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-[0.34em] left-0 select-none"
              >
                <Parallax speed={0.5}>
                  <span className="display-face block text-[clamp(5rem,13vw,11rem)] leading-none text-bone/[0.04]">
                    {movement.index}
                  </span>
                </Parallax>
              </div>

              <div className="relative">
                <p className="eyebrow text-copper">{movement.label}</p>
                <h2 className="display-face mt-6 text-h2 text-bone">
                  <RevealMask>{movement.title}</RevealMask>
                </h2>
                <p className="mt-7 max-w-[48ch] text-lede text-mist/85">{movement.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  LEDGER — Graphite elevation section                                */}
      {/* ------------------------------------------------------------------ */}
      <section id="materials" className="border-y border-line bg-ink-700">
        <div className="shell py-[var(--space-section)]">
          <Reveal className="grid gap-y-6 lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-5">
              <p className="eyebrow text-copper">Atelier Ledger</p>
              <h2 className="display-face mt-6 text-h2 text-bone">
                <RevealMask>The workshop, itemised.</RevealMask>
              </h2>
            </div>
            <p className="max-w-[38ch] text-small text-fog lg:col-span-4 lg:col-start-9 lg:self-end">
              Counted directly at the master calibration bench. Every parameter below
              reflects ongoing physical production in London E2.
            </p>
          </Reveal>

          <Reveal className="mt-16 lg:mt-24" delay={0.1}>
            <dl className="border-t border-line">
              {LEDGER.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-8 border-b border-line py-5 sm:py-6"
                >
                  <dt className="eyebrow text-fog">{row.label}</dt>
                  <dd className="display-face tabular text-h3 text-bone sm:text-h2">
                    <Counter value={row.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  SIGNATURE MOMENT — ambient procedural canvas                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden border-b border-line bg-ink">
        <div className="absolute inset-0">
          <LazyAmbientSignature className="absolute inset-0" />
        </div>

        <div className="shell relative flex min-h-[clamp(30rem,74svh,46rem)] flex-col justify-between py-[clamp(3rem,8vh,5rem)]">
          <Reveal>
            <p className="eyebrow text-copper">Artisanal Signature</p>
          </Reveal>

          <Reveal className="max-w-[28ch]" delay={0.12}>
            <p className="display-face text-h2 text-bone">
              Everything in this exhibition was designed, milled, and voiced in the same room.
              If you require a custom architectural commission, write to our curators.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="eyebrow eyebrow-dark">
              Procedural WebGL Ambient Field · London E2
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  CLOSING CORRESPONDENCE                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="shell py-[var(--space-section)]">
        <RevealGroup className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <RevealItem className="lg:col-span-5">
            <h2 className="display-face text-h3 text-bone">
              <RevealMask>Write to the Atelier.</RevealMask>
            </h2>
            <p className="mt-6 max-w-[40ch] text-small text-fog">
              Commissions, custom metal finishes, or scheduling a sound audition.
              A benchmaker responds directly.
            </p>
          </RevealItem>

          <RevealItem className="lg:col-span-4 lg:col-start-7 lg:self-center">
            <Magnetic>
              <a href="mailto:curator@frecom.audio" className="btn btn-copper">
                curator@frecom.audio
              </a>
            </Magnetic>
          </RevealItem>

          <RevealItem className="lg:col-span-2 lg:col-start-11 lg:self-center lg:justify-self-end">
            <Link href="/collection" className="eyebrow link-line text-copper">
              The Collection →
            </Link>
          </RevealItem>
        </RevealGroup>
      </section>
    </main>
  );
}
