---
description: Coordena até cinco ciclos limitados de implementação e validação
agent: orchestrator
subagent: false
---

Conduza um ciclo Ralph limitado a no máximo cinco iterações para `$ARGUMENTS`:
interprete a issue, investigue, delimite escopo, implemente apenas o autorizado,
execute build/verificações, E2E e screenshots quando aplicável, revise diff e
arquivos protegidos, e corrija somente falhas relacionadas. Reavalie o escopo
após cada correção. Interrompa imediatamente diante de alteração não autorizada,
risco de produção, falha que exija sair do escopo, decisão do usuário,
impossibilidade de teste essencial ou risco ao trabalho existente. Este comando é
uma coordenação guiada por prompts; não controla internamente o runtime, não
repete comandos como prova de sucesso e nunca faz commit, push, merge ou deploy
automaticamente.
