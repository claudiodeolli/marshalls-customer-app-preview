/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/marshalls-customer-app-preview' : '',
  assetPrefix: isProd ? '/marshalls-customer-app-preview' : '',
  trailingSlash: isProd,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
