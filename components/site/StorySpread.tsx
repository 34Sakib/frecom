import { PosterFallback } from '@/components/three/PosterFallback';
import { FinishPicker } from './FinishPicker';
import type { Beat, Finish, Product } from '@/lib/products';

/**
 * THE PART OF A PRODUCT STORY THAT NEEDS NO CANVAS
 *
 * Both the pinned story and the configurator already have a static branch for
 * reduced motion — but that branch still contains a `Stage`, and a `Stage` means
 * three.js was already downloaded. This is the same content with the canvas
 * genuinely absent, so it can be the fallback for a device that will never draw
 * one: the beats as a numbered spread, the poster plate in place of the render.
 *
 * It is deliberately plain markup. This is what the weakest device on the site
 * receives, so it carries no scroll listeners, no measurement and no motion
 * beyond the global reduced-motion rules.
 */
export function StorySpread({
  product,
  beats,
  label,
  className,
  finish,
  onFinish,
}: {
  product: Product;
  beats: Beat[];
  /** Eyebrow above the list. */
  label: string;
  className?: string;
  /** When both are given, the finish control is rendered here too — on a device
   *  with no canvas this is the only way to configure the object. */
  finish?: Finish;
  onFinish?: (f: Finish) => void;
}) {
  return (
    <section className={`shell py-[var(--space-section)] ${className ?? ''}`}>
      <p className="eyebrow eyebrow-dark">{label}</p>

      <div className="mt-12 grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="flex flex-col gap-12">
          <ol className="list-none border-t border-line">
            {beats.map((beat) => (
              <li key={beat.id} className="border-b border-line py-8">
                <p className="eyebrow eyebrow-dark">{beat.label}</p>
                <h3 className="display-face mt-5 text-h3 text-bone text-balance">
                  {beat.title}
                </h3>
                <p className="mt-4 max-w-[46ch] text-small text-fog">{beat.body}</p>
              </li>
            ))}
          </ol>

          {finish && onFinish && (
            <FinishPicker product={product} finish={finish} onFinish={onFinish} />
          )}
        </div>

        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[38rem]">
          <PosterFallback
            kind={product.model}
            colors={[finish?.hex ?? product.poster[0], product.poster[1]]}
            className="absolute inset-0"
            caption={`${product.name} — static render`}
          />
        </div>
      </div>
    </section>
  );
}
