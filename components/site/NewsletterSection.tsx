'use client';

import { useState } from 'react';
import { Reveal, RevealMask } from '@/components/ui/Reveal';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <section className="shell py-[var(--space-section)]">
      <div className="rounded-lg border border-line bg-white p-8 sm:p-12 lg:p-16 shadow-soft">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow eyebrow-dark">Correspondence</p>
              <h2 className="display-face mt-6 text-h2 text-bone">
                <RevealMask>The bench dispatch.</RevealMask>
              </h2>
              <p className="mt-5 max-w-[42ch] text-lede text-mist/85">
                Published only when an object leaves the workshop or a batch is scheduled. No marketing cadences, no sales blasts.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            {submitted ? (
              <div className="rounded-md border border-copper/40 bg-[#efe7da] p-6 text-left shadow-xs">
                <p className="eyebrow text-copper">Recorded on the bench sheet</p>
                <p className="mt-2 text-small text-bone">
                  Thank you. You will only receive word from us when a new run begins or an allocation window opens.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <label htmlFor="dispatch-email" className="eyebrow eyebrow-dark">
                  Direct Email
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    id="dispatch-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@studio.example"
                    className="field flex-1 py-3 px-4 text-small transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-copper/70"
                  />
                  <button
                    type="submit"
                    className="btn btn-solid shrink-0 px-6 py-3"
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-[0.75rem] text-fog">
                  One workshop, one room. Unsubscribe in any dispatch with a single click.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
