'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Magnetic } from '@/components/ui/Magnetic';
import { Reveal, RevealMask } from '@/components/ui/Reveal';

export function PromoBanner() {
  // Countdown to next batch allocation closing window (e.g. 14 days from arbitrary fixed epoch)
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    // Target date: 14 days from initial load for persistent visual countdown
    const target = new Date();
    target.setDate(target.getDate() + 14);
    target.setHours(target.getHours() + 8);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative my-[var(--space-section)] overflow-hidden border-y border-line bg-[#efe7da] py-20 lg:py-28">
      {/* Slow luxury gradient shift backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 animate-gradient-shift bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(138,109,59,0.22),rgba(247,243,236,0))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-copper/15 blur-[120px]"
      />

      <div className="shell relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          {/* Left Column: Bold Oversized Typography */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3">
              <span className="rounded border border-copper/40 bg-white/90 px-2.5 py-1 text-micro font-mono uppercase tracking-widest text-copper shadow-xs">
                Batch 04 Allocation
              </span>
              <span className="eyebrow eyebrow-dark">Limited Run — 24 Numbered Pieces</span>
            </div>

            <h2 className="display-face mt-6 text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.98] text-bone">
              <RevealMask>Autumn reservation.</RevealMask>
              <br />
              <span className="text-copper">Direct from the lathe.</span>
            </h2>

            <p className="mt-7 max-w-[48ch] text-lede text-mist/90">
              Only twenty-four units are scheduled for the current quarter across all six objects.
              Each leaves with hand-stamped inspection certificates and guaranteed bench delivery.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link href="/products" className="btn btn-copper">
                  Reserve from Batch 04
                </Link>
              </Magnetic>
              <Magnetic>
                <a
                  href="mailto:studio@frecom.example?subject=Batch%2004%20Bench%20Reservation"
                  className="btn btn-ghost"
                >
                  Request Atelier Sheet
                </a>
              </Magnetic>
            </div>
          </div>

          {/* Right Column: Live Architectural Countdown Box */}
          <div className="lg:col-span-4">
            <div className="rounded-lg border border-line bg-white/95 p-8 shadow-soft backdrop-blur-md">
              <p className="eyebrow eyebrow-dark">Allocation Window Closes In</p>

              <div className="mt-8 grid grid-cols-4 gap-3 text-center">
                <div className="flex flex-col border-r border-line/60 pr-2">
                  <span className="display-face text-h2 text-bone tabular">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-fog mt-1">
                    Days
                  </span>
                </div>
                <div className="flex flex-col border-r border-line/60 pr-2">
                  <span className="display-face text-h2 text-bone tabular">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-fog mt-1">
                    Hours
                  </span>
                </div>
                <div className="flex flex-col border-r border-line/60 pr-2">
                  <span className="display-face text-h2 text-bone tabular">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-fog mt-1">
                    Mins
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="display-face text-h2 text-copper tabular">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-wider text-fog mt-1">
                    Secs
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-line/60 pt-4 text-micro text-fog">
                <span>Bench Status: 19 of 24 allocated</span>
                <span className="inline-block h-2 w-2 rounded-full bg-copper animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            transform: scale(1) translate(0%, 0%);
          }
          50% {
            transform: scale(1.1) translate(3%, -2%);
          }
          100% {
            transform: scale(1) translate(0%, 0%);
          }
        }
        .animate-gradient-shift {
          animation: gradientShift 18s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
