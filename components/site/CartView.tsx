'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { PosterFallback } from '@/components/three/PosterFallback';
import { Magnetic } from '@/components/ui/Magnetic';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { lineTotal, money, shippingFor, taxFor } from '@/lib/format';
import { getFinish, getProduct, type Finish, type Product } from '@/lib/products';
import { useCart } from '@/lib/store';
import { DUR, EASE_BEZIER } from '@/lib/tokens';

/**
 * THE BAG
 *
 * The spec is explicit that the conversion path is not a showcase: this page is
 * deliberately the calmest on the site. The only movement is what helps a person
 * follow what just happened — a removed line leaves, the summary numbers settle,
 * the rows below close the gap. No reveals fire on scroll here, because someone
 * reading a total does not want the total to arrive in stages.
 *
 * Every figure is computed from the catalogue and the shipped formatters, so the
 * arithmetic on screen is the same arithmetic the rest of the site uses.
 */

type ResolvedLine = {
  slug: string;
  finishId: string;
  qty: number;
  product: Product;
  finish: Finish;
};

export function CartView() {
  const lines = useCart((s) => s.lines);
  const ready = useCart((s) => s.ready);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const reduced = useReducedMotion();

  // A line can only be resolved if its slug still exists: a catalogue change
  // between visits must not render an empty row.
  const resolved: ResolvedLine[] = ready
    ? lines.flatMap((line) => {
        const product = getProduct(line.slug);
        if (!product) return [];
        return [{ ...line, product, finish: getFinish(product, line.finishId) }];
      })
    : [];

  const subtotal = resolved.reduce(
    (sum, line) => sum + lineTotal(line.product.priceCents, line.qty),
    0,
  );
  const shipping = shippingFor(subtotal);
  const tax = taxFor(subtotal);
  const total = subtotal + shipping + tax;

  if (!ready) {
    return (
      <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-7">
          {[0, 1].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-7">
          <div className="rounded-lg border border-line bg-ink-800/60 p-[clamp(1.75rem,4vw,3rem)]">
            <p className="eyebrow eyebrow-dark">Nothing here yet</p>
            <p className="display-face mt-6 text-h2 text-bone">
              Your bag is empty, which is a fine place to start.
            </p>
            <p className="mt-6 max-w-[46ch] text-small text-fog">
              Six objects are in production. Every one of them is finished by hand,
              so the bag stays light on purpose.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link href="/products" className="btn btn-solid">
                  All objects
                </Link>
              </Magnetic>
              <Link href="/about" className="eyebrow link-line text-copper">
                The atelier →
              </Link>
            </div>
          </div>
        </div>

        <p className="text-small text-ash lg:col-span-3 lg:col-start-10 lg:self-end">
          Ordered before? Nothing is stored against your name — this site keeps a
          bag, not an account.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-8">
      {/* ---- Lines ---------------------------------------------------------- */}
      <div className="lg:col-span-7">
        <ul className="list-none border-t border-line">
          <AnimatePresence initial={false} mode="popLayout">
            {resolved.map((line) => {
              const key = `${line.slug}:${line.finishId}`;
              return (
                <motion.li
                  key={key}
                  layout={!reduced}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: DUR.base, ease: EASE_BEZIER }}
                  className="flex gap-5 border-b border-line py-6"
                >
                  <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-line">
                    <PosterFallback
                      kind={line.product.model}
                      colors={[line.finish.hex, line.product.poster[1]]}
                      caption=""
                      className="absolute inset-0"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <Link
                        href={`/products/${line.slug}`}
                        className="display-face text-h4 text-bone transition-colors duration-200 ease-[var(--ease-exp)] hover:text-copper"
                      >
                        {line.product.name}
                      </Link>
                      <p className="tabular shrink-0 text-small text-mist">
                        {money(lineTotal(line.product.priceCents, line.qty))}
                      </p>
                    </div>

                    <p className="eyebrow eyebrow-dark">
                      {line.product.code}
                      <span aria-hidden="true" className="mx-2 text-line-soft">
                        /
                      </span>
                      {line.finish.name}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                      <div
                        role="group"
                        aria-label={`Quantity of ${line.product.name}`}
                        className="flex items-center rounded-sm border border-line"
                      >
                        <button
                          type="button"
                          onClick={() => setQty(line.slug, line.finishId, line.qty - 1)}
                          aria-label={`Reduce ${line.product.name}, ${line.finish.name}`}
                          className="flex h-9 w-9 items-center justify-center text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
                        >
                          <span aria-hidden="true">−</span>
                        </button>
                        <span className="tabular w-8 text-center text-small text-mist">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.slug, line.finishId, line.qty + 1)}
                          aria-label={`Add another ${line.product.name}, ${line.finish.name}`}
                          className="flex h-9 w-9 items-center justify-center text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
                        >
                          <span aria-hidden="true">+</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          remove(line.slug, line.finishId);
                          toast(`${line.product.name} removed from your bag.`);
                        }}
                        className="eyebrow link-line text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/products" className="eyebrow link-line text-copper">
            ← Continue looking
          </Link>
          <button
            type="button"
            onClick={() => {
              clear();
              toast('Bag cleared.');
            }}
            className="eyebrow link-line text-fog transition-colors duration-200 ease-[var(--ease-exp)] hover:text-bone"
          >
            Clear bag
          </button>
        </div>
      </div>

      {/* ---- Summary -------------------------------------------------------- */}
      <div className="lg:col-span-4 lg:col-start-9">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow eyebrow-dark">Summary</p>
          <dl className="mt-6 border-t border-line">
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="text-small text-fog">Subtotal</dt>
              <dd className="tabular text-small text-mist">{money(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="text-small text-fog">Shipping</dt>
              <dd className="tabular text-small text-mist">
                {shipping === 0 ? 'Included' : money(shipping)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="text-small text-fog">Tax, estimated</dt>
              <dd className="tabular text-small text-mist">{money(tax)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-5">
              <dt className="eyebrow eyebrow-dark">Total</dt>
              <dd className="display-face tabular text-h3 text-bone">{money(total)}</dd>
            </div>
          </dl>

          <p className="mt-2 text-small text-ash">
            {shipping === 0
              ? 'Shipping is included on this order.'
              : `Shipping is free from ${money(50000)}.`}
          </p>

          <Magnetic className="mt-8 w-full">
            <Link href="/checkout" className="btn btn-copper w-full">
              Checkout
            </Link>
          </Magnetic>

          <p className="mt-6 max-w-[38ch] text-small text-ash">
            A design demonstration: no payment is taken, no order is placed, and
            nothing about your bag leaves this browser.
          </p>
        </div>
      </div>
    </div>
  );
}
