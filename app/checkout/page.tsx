import type { Metadata } from 'next';

import { CheckoutView } from '@/components/site/CheckoutView';
import { SceneAbsent } from '@/components/three/LazyScenes';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Delivery, contact and payment method for your order — with the totals shown in full before you send it.',
};

/**
 * CHECKOUT
 *
 * Static route, no canvas, so it declares that to the loader. State lives in the
 * client island; this page is only its frame.
 */
export default function CheckoutPage() {
  return (
    <>
      <SceneAbsent />

      <section className="shell pb-[clamp(2.5rem,6vw,4rem)] pt-[clamp(7rem,17vh,11rem)]">
        <div className="grid gap-y-6 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-7">
            <p className="eyebrow eyebrow-dark">Checkout</p>
            <h1 className="display-face mt-6 text-h1 text-bone">
              Three short steps, then a person writes back.
            </h1>
          </div>
          <p className="max-w-[38ch] text-small text-fog lg:col-span-4 lg:col-start-9 lg:self-end">
            The build window is confirmed by hand, so nothing is taken now. Expect
            a reply within two working days.
          </p>
        </div>
      </section>

      <section className="shell pb-[var(--space-section)]">
        <CheckoutView />
      </section>
    </>
  );
}
