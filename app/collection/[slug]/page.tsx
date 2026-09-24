import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductDetail } from '@/components/site/ProductDetail';
import { getProduct, products } from '@/lib/products';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  return {
    title: `${product.name} — Exhibition Object`,
    description: product.lede,
    openGraph: {
      title: `${product.name} — Frecom Digital Exhibition`,
      description: product.tagline,
    },
  };
}

export default async function CollectionDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
