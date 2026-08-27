// Usado pelo comando /resolve-issue pra rodar testes e2e e tirar screenshots
// de antes/depois. Viewport mobile porque é como o cliente realmente usa o
// app — ver next-app/src/app/(app)/agendamentos/page.js pros breakpoints
// (`d-none d-xl-flex` etc).
const { defineConfig, devices } = require('@playwright/test');

const APP_URL = 'http://localhost:3100';
// Segundo servidor com GITHUB_PAGES=1: é onde o basePath existe. Sem ele
// não há como um teste flagrar asset publicado sem prefixo, que foi
// exatamente o que quebrou os ícones no GitHub Pages.
const PAGES_URL = 'http://localhost:3200';

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    // Viewport do iPhone 13, mas forçando Chromium (só esse browser está
    // instalado neste ambiente) em vez do WebKit que o preset usaria.
    ...devices['iPhone 13'],
    defaultBrowserType: undefined,
    browserName: 'chromium',
  },
  projects: [
    {
      name: 'app',
      use: { baseURL: APP_URL },
      testIgnore: '**/basepath-*.spec.js',
    },
    {
      name: 'github-pages',
      use: { baseURL: PAGES_URL },
      testMatch: '**/basepath-*.spec.js',
    },
  ],
  webServer: [
    {
      command: 'npm run dev -- -p 3100',
      // Aponta para a rota mais pesada, não para a raiz: o next dev compila
      // sob demanda, e deixar essa compilação para dentro do primeiro teste
      // o fazia estourar o timeout enquanto o segundo servidor disputava CPU.
      url: `${APP_URL}/agendamentos`,
      reuseExistingServer: true,
      timeout: 180_000,
      env: { NEXT_PUBLIC_MOCK_MODE: '1' },
    },
    {
      command: 'npm run dev -- -p 3200',
      url: `${PAGES_URL}/marshalls-customer-app-preview/agendamentos`,
      reuseExistingServer: true,
      timeout: 120_000,
      // distDir separado: dois servidores de dev não podem dividir o .next.
      env: { GITHUB_PAGES: '1', NEXT_DIST_DIR: '.next-pages' },
    },
  ],
});
