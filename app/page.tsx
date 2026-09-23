import type { Metadata } from 'next';

import { HomeHero } from '@/components/home/HomeHero';
import { TrustBar } from '@/components/site/TrustBar';
import { CategoryTiles } from '@/components/site/CategoryTiles';
import { BestsellerCarousel } from '@/components/site/BestsellerCarousel';
import { PromoBanner } from '@/components/site/PromoBanner';
import { LazyScrollStory } from '@/components/three/LazyScenes';
import { NewArrivalsGrid } from '@/components/site/NewArrivalsGrid';
import { TestimonialsAndStats } from '@/components/site/TestimonialsAndStats';
import { StudioGallery } from '@/components/site/StudioGallery';
import { NewsletterSection } from '@/components/site/NewsletterSection';
import { getProduct, products } from '@/lib/products';

export const metadata: Metadata = {
  title: { absolute: 'Frecom — Audio Objects, Made in One Room' },
  description:
    'Six audio objects, designed once and built in one workshop: reference headphones, monitors, turntable, discrete amplifier, and acoustic stands.',
};

/**
 * HOMEPAGE — 11-SECTION MASTER SEQUENCE
 *
 * Implements the definitive section rhythm authored in the Master Spec:
 *   1. Hero 3D Showcase (Energy: High)
 *   2. Trust Bar (Energy: Calm)
 *   3. Shop by Category (Energy: Medium)
 *   4. Bestsellers Carousel (Energy: Medium-High)
 *   5. Promo Allocation Banner (Energy: High — singular)
 *   6. Scroll-Story Signature 3D (Energy: High — sustained)
 *   7. New Arrivals Grid (Energy: Medium)
 *   8. Social Proof & Testimonials (Energy: Calm-Medium)
 *   9. Studio & Client Gallery (Energy: Calm)
 *  10. Dispatch Newsletter (Energy: Calm)
 *  11. Mega-Menu Footer (Energy: Calm)
 */
export default function HomePage() {
  const story = getProduct('aurora-01') ?? products[0];

  return (
    <>
      {/* 1. Hero Animated 3D Slider (High) */}
      <HomeHero products={products} />

      {/* 2. Trust Bar (Calm) */}
      <TrustBar />

      {/* 3. Shop by Category (Medium) */}
      <CategoryTiles />

      {/* 4. Featured / Bestsellers Carousel (Medium-High) */}
      <BestsellerCarousel products={products} />

      {/* 5. Offers / Promo Allocation Banner (High) */}
      <PromoBanner />

      {/* 6. Scroll-Story Signature 3D Camera Spline (High - Sustained) */}
      <LazyScrollStory
        product={story}
        finish={story.finishes[0]}
        label="Aurora 01 — In Three Movements"
      />

      {/* 7. New Arrivals (Medium) */}
      <NewArrivalsGrid products={products} />

      {/* 8. Social Proof & Testimonials + Stat Counters (Calm-Medium) */}
      <TestimonialsAndStats />

      {/* 9. Studio & Client Gallery (Calm) */}
      <StudioGallery />

      {/* 10. Newsletter Dispatch (Calm) */}
      <NewsletterSection />
    </>
  );
}
