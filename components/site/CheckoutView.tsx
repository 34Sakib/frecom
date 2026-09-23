'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Magnetic } from '@/components/ui/Magnetic';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { lineTotal, money, shippingFor, taxFor } from '@/lib/format';
import { getFinish, getProduct, type Finish, type Product } from '@/lib/products';
import { useCart } from '@/lib/store';
import { DUR, EASE_BEZIER } from '@/lib/tokens';

/**
 * CHECKOUT
 *
 * Two decisions worth stating.
 *
 * First, this page is the quietest on the site. The bag already animates because
 * removing a line is a change of state a person has to be able to follow; a form
 * that moves is a form that loses a sale.
 *
 * Second, there is no card field. A static export cannot take a payment and a
 * decorative card input would be a lie dressed as a feature — so payment is
 * chosen as a method, the way a workshop actually works: a secure link once the
 * build window is confirmed, a transfer, or an invoice for a room that buys on
 * paper. The order is recorded in the browser and says so.
 */

const METHODS = [
  {
    id: 'link',
    name: 'Card, by secure link',
    note: 'We email a payment link once the build window is confirmed. Nothing is charged today.',
  },
  {
    id: 'transfer',
    name: 'Bank transfer',
    note: 'Account details come with the invoice. The object ships when the transfer clears.',
  },
  {
    id: 'invoice',
    name: 'Invoice for studios',
    note: 'Thirty days, for rooms and institutions. We will ask for a purchase order.',
  },
];

const COUNTRIES = [
  'United Kingdom',
  'United States',
  'Germany',
  'France',
  'Netherlands',
  'Japan',
  'Australia',
  'Elsewhere — we will ask',
];

type ResolvedLine = {
  slug: string;
  finishId: string;
  qty: number;
  product: Product;
  finish: Finish;
};

export function CheckoutView() {
  const lines = useCart((s) => s.lines);
  const ready = useCart((s) => s.ready);
  const clear = useCart((s) => s.clear);
  const reduced = useReducedMotion();

  const uid = useId();
  const field = (name: string) => `${uid}-${name}`;

  const [method, setMethod] = useState(METHODS[0].id);
  const [placed, setPlaced] = useState<{ reference: string; count: number; total: number; method: string } | null>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);

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
  const count = resolved.reduce((n, line) => n + line.qty, 0);

  // The confirmation is the one thing a person must not miss, so focus goes to it.
  useEffect(() => {
    if (placed) confirmation.current?.focus();
  }, [placed]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (resolved.length === 0) return;

    // Reference generated in the browser, from the moment of submission. It looks
    // like the real thing because the alternative — a decorative fake — is worse.
    setPlaced({
      reference: `FR-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      count,
      total,
      method: METHODS.find((m) => m.id === method)?.name ?? METHODS[0].name,
    });
    clear();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  if (placed) {
    return (
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.section, ease: EASE_BEZIER }}
        className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-8"
      >
        <div className="lg:col-span-7">
          <p className="eyebrow eyebrow-dark">Recorded</p>
          <h2
            ref={confirmation}
            tabIndex={-1}
            className="display-face mt-6 text-h2 text-bone outline-none"
          >
            Thank you — the workshop has it.
          </h2>
          <p className="mt-7 max-w-[52ch] text-lede text-mist/85">
            A person reads every one of these and writes back with the build window
            and the payment link. If the object is made to order, that reply is
            where the window gets fixed.
          </p>

          <dl className="mt-12 border-t border-line">
            {[
              { label: 'Reference', value: placed.reference },
              { label: 'Objects', value: String(placed.count) },
              { label: 'Payment', value: placed.method },
              { label: 'Total, at this estimate', value: money(placed.total) },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-8 border-b border-line py-4"
              >
                <dt className="eyebrow eyebrow-dark">{row.label}</dt>
                <dd className="tabular text-small text-mist">{row.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-[52ch] text-small text-ash">
            This is a demonstration build. The reference was generated in your
            browser, nothing was charged, and no message was sent anywhere.
          </p>
        </div>

        <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
          <div className="flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href="/products" className="btn btn-solid">
                Back to the objects
              </Link>
            </Magnetic>
            <Link href="/about" className="eyebrow link-line text-copper">
              The atelier →
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

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
            <p className="eyebrow eyebrow-dark">Nothing to check out</p>
            <p className="display-face mt-6 text-h2 text-bone">
              The bag is empty, so there is nothing to send.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link href="/products" className="btn btn-solid">
                  Choose an object
                </Link>
              </Magnetic>
              <Link href="/cart" className="eyebrow link-line text-copper">
                Back to the bag →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-8">
      <div className="lg:col-span-7">
        {/* ---- Contact ------------------------------------------------------ */}
        <fieldset className="border-t border-line pt-8">
          <legend className="eyebrow eyebrow-dark">01 — Contact</legend>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor={field('name')} className="text-small text-fog">
                Name
              </label>
              <input
                id={field('name')}
                name="name"
                type="text"
                required
                autoComplete="name"
                className="field mt-2"
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor={field('email')} className="text-small text-fog">
                Email
              </label>
              <input
                id={field('email')}
                name="email"
                type="email"
                required
                autoComplete="email"
                className="field mt-2"
              />
            </div>
          </div>
        </fieldset>

        {/* ---- Delivery ----------------------------------------------------- */}
        <fieldset className="mt-12 border-t border-line pt-8">
          <legend className="eyebrow eyebrow-dark">02 — Delivery</legend>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={field('address')} className="text-small text-fog">
                Address
              </label>
              <input
                id={field('address')}
                name="address"
                type="text"
                required
                autoComplete="address-line1"
                className="field mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={field('address2')} className="text-small text-fog">
                Apartment, studio, floor <span className="text-ash">(optional)</span>
              </label>
              <input
                id={field('address2')}
                name="address2"
                type="text"
                autoComplete="address-line2"
                className="field mt-2"
              />
            </div>
            <div>
              <label htmlFor={field('city')} className="text-small text-fog">
                City
              </label>
              <input
                id={field('city')}
                name="city"
                type="text"
                required
                autoComplete="address-level2"
                className="field mt-2"
              />
            </div>
            <div>
              <label htmlFor={field('postal')} className="text-small text-fog">
                Postal code
              </label>
              <input
                id={field('postal')}
                name="postal"
                type="text"
                required
                autoComplete="postal-code"
                className="field mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={field('country')} className="text-small text-fog">
                Country
              </label>
              <select
                id={field('country')}
                name="country"
                required
                autoComplete="country-name"
                className="field mt-2 cursor-pointer appearance-none"
                defaultValue={COUNTRIES[0]}
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-5 max-w-[52ch] text-small text-ash">
            Objects are packed in wool and plywood. Insured delivery is included
            from {money(50000)}; below that it is {money(4500)} worldwide.
          </p>
        </fieldset>

        {/* ---- Payment ------------------------------------------------------ */}
        <fieldset className="mt-12 border-t border-line pt-8">
          <legend className="eyebrow eyebrow-dark">03 — Payment</legend>
          <div role="radiogroup" aria-label="Payment method" className="mt-6 flex flex-col">
            {METHODS.map((option) => (
              <label
                key={option.id}
                className="group flex cursor-pointer items-start gap-5 border-b border-line py-5"
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.id}
                  checked={method === option.id}
                  onChange={() => setMethod(option.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-soft transition-colors duration-200 ease-[var(--ease-exp)] peer-checked:border-copper peer-focus-visible:ring-2 peer-focus-visible:ring-copper peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-copper transition-opacity duration-200 ease-[var(--ease-exp)] ${
                      method === option.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </span>
                <span className="flex-1">
                  <span className="block text-body text-bone">{option.name}</span>
                  <span className="mt-1 block max-w-[52ch] text-small text-fog">
                    {option.note}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-12 border-t border-line pt-8">
          <Magnetic className="w-full sm:w-auto">
            <button type="submit" className="btn btn-copper w-full sm:w-auto">
              Place order — {money(total)}
            </button>
          </Magnetic>
          <p className="mt-6 max-w-[52ch] text-small text-ash">
            No card details are collected on this site, and nothing is charged. This
            is a design demonstration.
          </p>
        </div>
      </div>

      {/* ---- Summary ---- */}
      <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow eyebrow-dark">Order</p>
          <ul className="mt-6 list-none border-t border-line">
            {resolved.map((line) => (
              <li
                key={`${line.slug}:${line.finishId}`}
                className="flex items-baseline justify-between gap-6 border-b border-line py-4"
              >
                <span className="min-w-0 text-small text-mist">
                  {line.product.name}
                  <span className="text-ash">
                    {' '}
                    × {line.qty} · {line.finish.name}
                  </span>
                </span>
                <span className="tabular shrink-0 text-small text-mist">
                  {money(lineTotal(line.product.priceCents, line.qty))}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-2">
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

          <Link href="/cart" className="eyebrow link-line text-copper">
            ← Edit the bag
          </Link>
        </div>
      </div>
    </form>
  );
}
