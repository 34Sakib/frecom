import type { Product } from '@/lib/products';

/**
 * SPECIFICATION TABLE
 *
 * A definition list, not a table: these are name/value pairs, and `<dl>` is what
 * a screen reader reads as one. Server-rendered — there is nothing here to
 * animate, and the numbers are the point.
 *
 * The "in the box" list sits alongside it rather than in a second accordion,
 * because what you receive is a purchase decision, not an appendix.
 */

export function SpecTable({
  product,
  tone = 'dark',
  className,
}: {
  product: Product;
  /** Light sections need a darker hairline and body colour. */
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const light = tone === 'light';
  const rule = light ? 'border-bone-line' : 'border-line';
  const term = light ? 'eyebrow' : 'eyebrow eyebrow-dark';
  const detail = light ? 'text-ash' : 'text-mist';

  return (
    <div className={className}>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className={term}>Specification</p>
          <dl className="mt-6">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className={`flex items-baseline justify-between gap-8 border-b py-4 ${rule}`}
              >
                <dt className={term}>{spec.label}</dt>
                <dd className={`text-right text-small ${detail}`}>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className={term}>In the box</p>
          <ul className={`mt-6 list-none border-t ${rule}`}>
            {product.includes.map((item) => (
              <li
                key={item}
                className={`flex items-baseline gap-4 border-b py-4 text-small ${rule} ${detail}`}
              >
                <span aria-hidden="true" className="mt-[0.45em] h-1 w-1 shrink-0 rotate-45 bg-copper" />
                {item}
              </li>
            ))}
          </ul>
          <p className={`mt-6 text-small ${light ? 'text-ash' : 'text-fog'}`}>
            {product.edition} — {product.year}
          </p>
        </div>
      </div>
    </div>
  );
}
