import Link from 'next/link';
import { products } from '@/lib/products';
import { BackToTop } from './BackToTop';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-700">
      <div className="shell relative z-10 grid gap-12 pb-[clamp(7rem,24vw,16rem)] pt-[clamp(4rem,8vw,7rem)] sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* Col 1: Studio & Atelier Overview */}
        <div className="lg:col-span-4">
          <p className="eyebrow eyebrow-dark">The Atelier</p>
          <p className="mt-6 max-w-[32ch] text-small text-fog leading-relaxed">
            Frecom designs and builds six acoustic objects in one workshop in London E2.
            Machined aluminium, unlacquered copper, and hand-wound components — exhibited
            as a study in acoustic architecture.
          </p>
          <div className="mt-7 flex flex-col gap-2">
            <a
              href="mailto:studio@frecom.audio"
              className="eyebrow link-line self-start text-copper"
            >
              studio@frecom.audio
            </a>
            <p className="text-micro text-ash">Showroom by appointment · Tue–Sat</p>
          </div>
        </div>

        {/* Col 2: The Six Objects */}
        <nav aria-label="Objects Catalogue" className="lg:col-span-3 lg:col-start-5">
          <p className="eyebrow eyebrow-dark">Exhibition Objects</p>
          <ul className="mt-6 list-none space-y-1">
            {products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/collection/${product.slug}`}
                  className="group flex items-baseline justify-between gap-4 py-2 text-small text-mist transition-colors duration-200 hover:text-bone"
                >
                  <span className="relative">
                    {product.name}
                    <span className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-copper origin-left transition-transform duration-300 ease-[var(--ease-exp)] group-hover:scale-x-100" />
                  </span>
                  <span className="eyebrow eyebrow-dark text-[0.625rem] tabular">
                    {product.code}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Col 3: Navigation */}
        <div className="lg:col-span-2 lg:col-start-8">
          <p className="eyebrow eyebrow-dark">Showroom</p>
          <ul className="mt-6 list-none space-y-3">
            {[
              { href: '/collection', label: 'All Objects' },
              { href: '/about', label: 'The Atelier' },
              { href: '/about#materials', label: 'Material Archive' },
              { href: '/contact', label: 'Inquiries & Visits' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group relative inline-block text-small text-mist transition-colors duration-200 hover:text-bone"
                >
                  {link.label}
                  <span className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-copper origin-left transition-transform duration-300 ease-[var(--ease-exp)] group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Archival Specifications */}
        <div className="lg:col-span-3 lg:col-start-10">
          <p className="eyebrow eyebrow-dark">Archive Standards</p>
          <ul className="mt-6 list-none space-y-3 text-micro text-fog">
            <li className="flex items-start gap-2">
              <span className="text-copper">✦</span>
              <span>Prototyped & Hand-Bench Built in London</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-copper">✦</span>
              <span>Procedural 3D & Acoustic Calibration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-copper">✦</span>
              <span>Solid Billet CNC & Zero-Resonance Tolerances</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-copper">✦</span>
              <span>Architectural Spec Sheets & Curatorial Inquiries</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Oversized Wordmark as Architectural Colophon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none"
      >
        <div className="shell">
          <p className="display-face -mb-[0.22em] translate-y-[0.05em] text-display leading-[0.8] text-bone/[0.04]">
            Frecom
          </p>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="relative z-10 border-t border-line">
        <div className="shell flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.75rem] text-ash">
            © {new Date().getFullYear()} Frecom Atelier. Static Digital Exhibition with Procedural Three.js.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
