import type { Metadata } from 'next';

import { CartView } from '@/components/site/CartView';
import { SceneAbsent } from '@/components/three/LazyScenes';

export const metadata: Metadata = {
  title: 'Your bag',
  description:
    'The objects you have chosen, with shipping and estimated tax shown in full before checkout.',
};

/**
 * BAG
 *
 * No canvas on this route, so it has to say so — the loader would otherwise wait
 * out its safety timeout for a scene that was never going to arrive.
 *
 * The header is static on purpose. Reveals belong to the pages that are arguing
 * for attention; this one is answering a question.
 */
export default function CartPage() {
  return (
    <>
      <SceneAbsent />

      <section className="shell pb-[clamp(2.5rem,6vw,4rem)] pt-[clamp(7rem,17vh,11rem)]">
        <div className="grid gap-y-6 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-7">
            <p className="eyebrow eyebrow-dark">Bag</p>
            <h1 className="display-face mt-6 text-h1 text-bone">
              What you have chosen so far.
            </h1>
          </div>
          <p className="max-w-[38ch] text-small text-fog lg:col-span-4 lg:col-start-9 lg:self-end">
            Totals are calculated here, in full, before you go any further. Nothing
            is added at the end.
          </p>
        </div>
      </section>

      <section className="shell pb-[var(--space-section)]">
        <CartView />
      </section>
    </>
  );
}
