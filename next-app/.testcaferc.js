// Config da suíte TestCafe, rodada pelo agente Pêndulo da esteira Maestri via
// `npm run test:e2e:portal` — browser visível dentro do portal "Bancada E2E".
// A suíte Playwright (playwright.config.js) continua existindo como rede de
// regressão das issues já entregues; as duas convivem.
module.exports = {
  src: ['tests/testcafe/**/*.js'],
  reporter: ['spec'],
  // Sem `screenshots`: em browser remoto o TestCafe não captura tela. A evidência
  // visual da falha sai do próprio portal (`maestri portal screenshot "Bancada E2E"`).
  selectorTimeout: 15000,
  assertionTimeout: 10000,
  pageLoadTimeout: 30000,
  // O app loga erros de hidratação em dev; deixar o TestCafe abortar por causa
  // deles esconderia a falha real do requisito sob teste.
  skipJsErrors: true,
};
