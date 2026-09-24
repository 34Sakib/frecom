import type { Metadata } from 'next';
import { SceneAbsent } from '@/components/three/LazyScenes';

export const metadata: Metadata = {
  title: 'Contact & Atelier Inquiries',
  description:
    'Schedule a private listening session or submit curatorial inquiries directly to the Frecom workshop in London E2.',
};

export default function ContactPage() {
  return (
    <>
      <SceneAbsent />

      <main className="min-h-screen bg-ink pb-24 pt-[clamp(7rem,16vh,10rem)] text-bone">
        <div className="shell">
          <div className="max-w-[56ch]">
            <p className="eyebrow text-copper">Atelier Inquiries</p>
            <h1 className="display-face mt-6 text-h1 text-bone">
              Direct Inquiries & Private Auditions.
            </h1>
            <p className="mt-6 text-lede text-mist/90">
              We maintain an open channel with acousticians, collectors, and sound designers.
              Every message is read and answered by our lead benchmaker in London E2.
            </p>
          </div>

          <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-12 lg:gap-16">
            {/* Atelier Address & Details */}
            <div className="lg:col-span-5">
              <h2 className="eyebrow eyebrow-dark">Workshop Location</h2>
              <p className="mt-4 text-h4 text-bone">Frecom Acoustic Atelier</p>
              <p className="mt-2 text-small text-mist/80 leading-relaxed">
                Unit 4, Redchurch Foundry
                <br />
                London E2 7DD, United Kingdom
              </p>

              <div className="mt-8 border-t border-line pt-6">
                <h3 className="eyebrow eyebrow-dark">Private Sessions</h3>
                <p className="mt-2 text-small text-mist/80">
                  Tuesday through Saturday
                  <br />
                  10:00 — 18:00 GMT (By Appointment Only)
                </p>
              </div>

              <div className="mt-8 border-t border-line pt-6">
                <h3 className="eyebrow eyebrow-dark">Electronic Correspondence</h3>
                <a
                  href="mailto:curator@frecom.audio"
                  className="link-line mt-2 inline-block text-small text-copper"
                >
                  curator@frecom.audio
                </a>
              </div>
            </div>

            {/* Inquiries Action Card */}
            <div className="rounded-lg border border-line bg-surface/50 p-8 lg:col-span-7 lg:p-12 backdrop-blur-sm">
              <h2 className="display-face text-h3 text-bone">
                Commission an Object or Reserve a Session
              </h2>
              <p className="mt-4 text-small text-mist/85 leading-relaxed">
                To inquire about current edition allocations, custom anodised finishes, or
                scheduling an audition in our sound-isolated listening chamber, contact us directly.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="mailto:curator@frecom.audio?subject=Frecom Exhibition Commission Inquiry"
                  className="btn btn-copper text-center"
                >
                  Initiate Acquisition Inquiry →
                </a>
                <a
                  href="mailto:curator@frecom.audio?subject=Frecom Atelier Audition Booking"
                  className="btn btn-ghost text-center"
                >
                  Schedule Audition
                </a>
              </div>

              <div className="mt-10 border-t border-line pt-6 text-micro text-fog">
                All Frecom objects are handcrafted and insured worldwide directly from our workshop.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
