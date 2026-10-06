---
description: Executa E2E Playwright relevante usando somente mock
agent: e2e
subagent: true
---

Execute os testes E2E relevantes para `$ARGUMENTS` reutilizando
`next-app/playwright.config.js`. Respeite as portas separadas, o timeout de
startup frio e `--workers=1` quando a suíte completa for solicitada. Verifique
console e rede inesperada, não use dados reais, não edite arquivos e reporte
comandos, resultado, duração, falhas e artefatos.
