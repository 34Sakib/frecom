import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductDetail } from '@/components/site/ProductDetail';
import { getProduct, products } from '@/lib/products';

/**
 * Static detail route. Every slug is known at build time, so `generateStaticParams`
 * emits six HTML files and the `[slug]` segment never needs a server.
 */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.lede,
    openGraph: {
      title: `${product.name} — Frecom`,
      description: product.tagline,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
