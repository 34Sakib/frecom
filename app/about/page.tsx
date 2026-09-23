import Link from 'next/link';
import type { Metadata } from 'next';

import { LazyAmbientSignature } from '@/components/three/LazyScenes';
import { Counter } from '@/components/ui/Counter';
import { Magnetic } from '@/components/ui/Magnetic';
import { Parallax } from '@/components/ui/Parallax';
import { Reveal, RevealGroup, RevealItem, RevealMask } from '@/components/ui/Reveal';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'The atelier',
  description:
    'Frecom is one workshop in one room: how the objects are drawn, how long they take, and why the line stays at six.',
};

/**
 * ABOUT
 *
 * The spec asks this page for a parallax narrative and an abstract signature
 * moment, and for nothing else to compete with them. So the page alternates
 * between two densities: three movements of prose that drift against oversized
 * ghost numerals, then one ledger band where the numbers are the layout, then
 * the shader signature — the only canvas on the route, and the only place the
 * page stops speaking.
 *
 * The narrative is not decoration: each movement is a column of type at a
 * different width and offset, so the eye walks diagonally down the page the way
 * it does through the prints on the wall.
 */

const MOVEMENTS = [
  {
    id: 'room',
    index: '01',
    label: '01 / The room',
    title: 'One room, and everything in it.',
    body: 'Drawings stay on the wall. Parts arrive, get measured against a print, and go back if they are out. The same four people mill, wind, anodise and assemble, which is why a change to one object turns up in the others inside a week rather than a season.',
  },
  {
    id: 'pace',
    index: '02',
    label: '02 / The pace',
    title: 'Slow is a production constraint, not a mood.',
    body: 'Nothing here is finished to a date. An object leaves when it measures correctly, so the workshop quotes a window rather than a deadline, and the line only changes when the change is worth making across all of it at once.',
  },
  {
    id: 'finish',
    index: '03',
    label: '03 / The finish',
    title: 'The metal is the colour.',
    body: 'Finishes are chemical or mechanical — anodised, oxidised, ceramic-coated, oiled — and they keep moving after they leave. Copper darkens where your hand falls. Aluminium holds its bead blast until it does not. We would rather tell you that than lacquer it into place.',
  },
];

/** Column spans deliberately unequal: the page should not read as a list. */
const COLUMNS = ['lg:col-span-5', 'lg:col-span-5 lg:col-start-8 lg:mt-[12vh]', 'lg:col-span-6 lg:col-start-3'];

export default function AboutPage() {
  const finishCount = products.reduce((n, p) => n + p.finishes.length, 0);

  // The ledger reads from the same catalogue the routes are generated from, so
  // no number on this page can drift out of date with the shop.
  const LEDGER = [
    { label: 'Workshop founded', value: 2011, suffix: undefined },
    { label: 'Objects in production', value: products.length, suffix: undefined },
    { label: 'Finishes offered', value: finishCount, suffix: undefined },
    { label: 'Benches making them', value: 4, suffix: undefined },
    { label: 'Days per headphone, by hand', value: 11, suffix: undefined },
    { label: 'Rooms involved', value: 1, suffix: undefined },
  ];

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/*  HEADER — statement on the left, the paraphrase tucked bottom-right. */}
      {/* ------------------------------------------------------------------ */}
      <section className="shell pb-[clamp(3rem,7vw,5rem)] pt-[clamp(7rem,17vh,11rem)]">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <Reveal className="lg:col-span-8">
            <p className="eyebrow eyebrow-dark">The atelier</p>
            <h1 className="display-face mt-7 text-h1 text-bone">
              <RevealMask>Six objects, made by four people, in one room.</RevealMask>
            </h1>
          </Reveal>

          <Reveal className="lg:col-span-3 lg:col-start-10 lg:self-end" delay={0.12}>
            <p className="max-w-[34ch] text-small text-fog">
              Frecom is a workshop before it is a shop. The line stays short
              because a short line is the only one you can keep checking by hand.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  NARRATIVE — three movements, drifting numerals behind each.        */}
      {/* ------------------------------------------------------------------ */}
      <section className="shell py-[var(--space-section)]">
        <RevealGroup className="grid gap-y-24 lg:grid-cols-12 lg:gap-x-8">
          {MOVEMENTS.map((movement, i) => (
            <RevealItem key={movement.id} className={`relative ${COLUMNS[i]}`}>
              {/* Type as scenery: the numeral is the movement's only ornament,
                  and it travels further than the copy it sits behind. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-[0.34em] left-0 select-none"
              >
                <Parallax speed={0.5}>
                  <span className="display-face block text-[clamp(5rem,13vw,11rem)] leading-none text-bone/[0.05]">
                    {movement.index}
                  </span>
                </Parallax>
              </div>

              <div className="relative">
                <p className="eyebrow eyebrow-dark">{movement.label}</p>
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
      {/*  LEDGER — the tonal flip, and the numbers carry the layout.         */}
      {/* ------------------------------------------------------------------ */}
      <section className="surface-bone">
        <div className="shell py-[var(--space-section)]">
          <Reveal className="grid gap-y-6 lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-5">
              <p className="eyebrow">In numbers</p>
              <h2 className="display-face mt-6 text-h2 text-ink">
                <RevealMask>The whole company, itemised.</RevealMask>
              </h2>
            </div>
            <p className="max-w-[38ch] text-small text-ash lg:col-span-4 lg:col-start-9 lg:self-end">
              Counted at the bench, not in a deck. Every figure below is generated
              from the catalogue this site is built out of.
            </p>
          </Reveal>

          <Reveal className="mt-16 lg:mt-24" delay={0.1}>
            <dl className="border-t border-bone-line">
              {LEDGER.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-8 border-b border-bone-line py-5 sm:py-6"
                >
                  <dt className="eyebrow text-ash">{row.label}</dt>
                  <dd className="display-face tabular text-h3 text-ink sm:text-h2">
                    <Counter value={row.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  SIGNATURE — the one canvas on this route, and the last word.       */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden border-y border-line bg-ink">
        <div className="absolute inset-0">
          <LazyAmbientSignature className="absolute inset-0" />
        </div>

        <div className="shell relative flex min-h-[clamp(30rem,74svh,46rem)] flex-col justify-between py-[clamp(3rem,8vh,5rem)]">
          <Reveal>
            <p className="eyebrow eyebrow-dark">Signature</p>
          </Reveal>

          <Reveal className="max-w-[24ch]" delay={0.12}>
            <p className="display-face text-h2 text-bone">
              Everything you can see here was drawn in the same room. If it is not
              here, ask — the answer is usually yes, and usually slower.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="eyebrow eyebrow-dark">
              Ambient field, rendered live
              <span aria-hidden="true" className="mx-2 text-line-soft">
                /
              </span>
              no photograph
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  CLOSE                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="shell py-[var(--space-section)]">
        <RevealGroup className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <RevealItem className="lg:col-span-5">
            <h2 className="display-face text-h3 text-bone">
              <RevealMask>Write to the workshop.</RevealMask>
            </h2>
            <p className="mt-6 max-w-[40ch] text-small text-fog">
              Commissions, finishes that are not listed, or a question about
              something you already own. A person answers.
            </p>
          </RevealItem>

          <RevealItem className="lg:col-span-4 lg:col-start-7 lg:self-center">
            <Magnetic>
              <a href="mailto:studio@frecom.example" className="btn btn-solid">
                studio@frecom.example
              </a>
            </Magnetic>
          </RevealItem>

          <RevealItem className="lg:col-span-2 lg:col-start-11 lg:self-center lg:justify-self-end">
            <Link href="/products" className="eyebrow link-line text-copper">
              All objects →
            </Link>
          </RevealItem>
        </RevealGroup>
      </section>
    </>
  );
}
