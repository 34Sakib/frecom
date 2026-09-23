/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static output: no server, no API routes, no ISR. Deployable to any CDN.
  output: 'export',
  // No image server exists in a static export, so images are served as-authored.
  images: { unoptimized: true },
  // Emits /products/aurora-01/index.html so hosts without rewrite rules resolve deep links.
  trailingSlash: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    // Keeps the three.js tree-shakeable in the client bundle.
    optimizePackageImports: ['@react-three/drei', 'framer-motion'],
  },
};

export default nextConfig;
