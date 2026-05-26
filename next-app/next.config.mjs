/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/marshalls-customer-app-preview',
  assetPrefix: '/marshalls-customer-app-preview',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
