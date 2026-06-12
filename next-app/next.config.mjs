/** @type {import('next').NextConfig} */

// GITHUB_PAGES=1 → build estático para GitHub Pages
// Sem essa var → build normal para Vercel (servidor + proxy)
// NODE_ENV=development (npm run dev) → mock local automaticamente
const isGitHubPages = process.env.GITHUB_PAGES === '1';
const isDev = process.env.NODE_ENV === 'development';
const BASE = isGitHubPages ? '/marshalls-customer-app-preview' : '';
const PROD_API = 'https://prontoatendimento.marshallsmed.com.br';

const nextConfig = {
  // Static export só para GitHub Pages; Vercel usa o servidor Next.js
  ...(isGitHubPages ? { output: 'export' } : {}),
  basePath: BASE,
  assetPrefix: BASE,
  trailingSlash: isGitHubPages,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE,
    NEXT_PUBLIC_MOCK_MODE: (isGitHubPages || isDev) ? '1' : '',
  },
  images: {
    unoptimized: true,
  },
  // Proxy /api/* → produção. Ativo em dev e em Vercel (quando não é GitHub Pages).
  // Não pode coexistir com output:'export' no build, por isso é excluído no GitHub Pages.
  ...(!isGitHubPages && {
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
