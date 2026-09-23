'use client';

import { useRef } from 'react';
import type { Finish, Product } from '@/lib/products';

/**
 * The accessible way to choose a finish.
 *
 * A real radio group: labelled, one tab stop, arrow keys to move through the
 * options, and the material described in text next to the swatches. It reads and
 * writes the same `finish` the canvas does, so it is the canonical control and
 * the 3D view is the illustration — not the other way round. That is also what
 * keeps the product configurable on devices that never get a canvas.
 */
export function FinishPicker({
  product,
  finish,
  onFinish,
  tone = 'dark',
  showNote = true,
  className,
}: {
  product: Product;
  finish: Finish;
  onFinish: (f: Finish) => void;
  /** Which surface it sits on — the light sections need darker hairlines. */
  tone?: 'dark' | 'light';
  showNote?: boolean;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = product.finishes.findIndex((f) => f.id === finish.id);
  const light = tone === 'light';

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = product.finishes.length;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    onFinish(product.finishes[next]);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-6">
        <p className={light ? 'eyebrow' : 'eyebrow eyebrow-dark'}>Finish</p>
        <p className={`eyebrow ${light ? 'text-copper-ink' : 'text-copper'}`}>
          {finish.name}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label={`Finish for the ${product.name}`}
        className="mt-5 flex flex-wrap gap-2.5"
        onKeyDown={onKeyDown}
      >
        {product.finishes.map((f, i) => {
          const on = f.id === finish.id;
          const border = on
            ? light
              ? 'border-copper-ink shadow-[0_0_0_1px_var(--color-copper-ink)]'
              : 'border-copper shadow-[0_0_0_1px_var(--color-copper)]'
            : light
              ? 'border-bone-line hover:border-ash'
              : 'border-line-soft hover:border-fog';
          return (
            <button
              key={f.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onFinish(f)}
              // Inline hex, not a token: the swatch has to show the finish itself.
              style={{ background: f.hex }}
              className={`h-11 w-11 rounded-sm border transition-[border-color,box-shadow] duration-200 ease-[var(--ease-exp)] ${border}`}
            >
              <span className="sr-only">
                {f.name} — {f.note}
              </span>
            </button>
          );
        })}
      </div>

      {showNote && (
        <p className={`mt-5 max-w-[36ch] text-small ${light ? 'text-ash' : 'text-fog'}`}>
          {finish.note}
        </p>
      )}
    </div>
  );
}
