/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const BASE = isProd ? '/marshalls-customer-app-preview' : '';

const nextConfig = {
  output: 'export',
  basePath: BASE,
  assetPrefix: BASE,
  trailingSlash: isProd,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
