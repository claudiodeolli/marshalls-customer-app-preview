// Usado pelo comando /resolve-issue pra rodar testes e2e e tirar screenshots
// de antes/depois. Viewport mobile porque é como o cliente realmente usa o
// app — ver next-app/src/app/(app)/agendamentos/page.js pros breakpoints
// (`d-none d-xl-flex` etc).
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3100',
    // Viewport do iPhone 13, mas forçando Chromium (só esse browser está
    // instalado neste ambiente) em vez do WebKit que o preset usaria.
    ...devices['iPhone 13'],
    defaultBrowserType: undefined,
    browserName: 'chromium',
  },
  webServer: {
    command: 'npm run dev -- -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 60_000,
    env: { NEXT_PUBLIC_MOCK_MODE: '1' },
  },
});
