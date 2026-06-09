/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const BASE = isProd ? '/marshalls-customer-app-preview' : '';
const PROD_API = 'https://prontoatendimento.marshallsmed.com.br';

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
  // Em dev, proxia /api/* para a produção evitando CORS.
  // A propriedade só existe quando !isProd porque `output: export` +
  // rewrites causa erro no next build.
  ...(!isProd && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: `${PROD_API}/api/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;
