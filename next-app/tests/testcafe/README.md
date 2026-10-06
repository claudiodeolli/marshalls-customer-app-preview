# Testes E2E em TestCafe (visíveis no portal da Maestri)

Suíte do agente **Pêndulo** da esteira Maestri. Roda num browser **visível**, dentro do
portal `Bancada E2E` — o usuário assiste o teste andar na tela, nada de headless.

```bash
npm run test:e2e:portal                                   # suíte inteira
npm run test:e2e:portal -- tests/testcafe/smoke-agendamentos.js
```

O runner (`scripts/run-testcafe-portal.mjs`):

1. sobe o dev server em modo mock na porta 3100 se ele não estiver de pé (a frio, leva
   minutos — o mesmo limite do `playwright.config.js`);
2. inicia `testcafe remote`, que imprime uma URL de conexão;
3. aponta o portal `Bancada E2E` para essa URL — é assim que o browser do portal vira o
   browser do teste. Se o portal não existir, ele é criado e conectado a quem rodou.

Variáveis: `PORTAL_NAME` (padrão `Bancada E2E`), `APP_PORT` (padrão `3100`), `VIEWPORT`
(padrão `390x844`, o mobile do cliente; use `1440x900` para desktop).

## Convenções

- Um arquivo por issue: `issue-<n>-<slug>.js`.
- A fixture monta a URL a partir de `process.env.APP_URL` (o runner injeta), com fallback
  `http://localhost:3100`. Não use caminho relativo em `fixture.page()`: o `baseUrl` do
  `.testcaferc.js` não é aplicado a ele e o TestCafe trata `/agendamentos` como host.
- Assertions derivadas do texto do requisito, nunca da implementação.
- Texto literal de UI vira assertion de texto exato; valor numérico vira assertion no valor.
- Cobrir os limiares (no limite, antes e depois) e as telas vizinhas que o diff alcança.

## Relação com a suíte Playwright

`tests/e2e/` (Playwright, `npm run test:e2e`) continua sendo a rede de regressão das issues
já entregues e roda também contra o build de GitHub Pages. A suíte TestCafe não a substitui:
ela é a validação assistida da issue em andamento.

## Screenshot da falha

Em browser remoto o TestCafe nem sempre consegue capturar a tela sozinho. Quando precisar da
evidência visual, capture o próprio portal: `maestri portal screenshot "Bancada E2E"`.
