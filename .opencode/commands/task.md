---
description: Investiga e executa uma issue com escopo controlado
agent: orchestrator
subagent: false
---

Conduza a issue descrita em `$ARGUMENTS` com o fluxo seguro do projeto: registre
o estado inicial do Git, investigue antes de planejar, delimite resultado,
invariantes, arquivos autorizados, testes e riscos, e peça esclarecimento se
necessário. Use apenas as delegações necessárias entre explorer, implementer,
e2e, visual-qa e reviewer. Faça o menor diff, execute verificações pertinentes e
revise o diff completo. Não faça commit, push, merge, deploy ou publicação sem
pedido explícito; pare diante de risco, falha essencial ou alteração fora do
escopo.
