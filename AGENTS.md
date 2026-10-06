# Instruções de trabalho seguro

Estas regras complementam `CLAUDE.md`; o arquivo original permanece a fonte de
contexto histórico e não deve ser alterado durante a configuração do OpenCode.

## Princípios obrigatórios

- Preserve o comportamento existente fora do escopo autorizado.
- Investigue antes de planejar e implemente o menor diff possível.
- Nunca refatore por conveniência nem melhore código adjacente sem autorização.
- Nunca altere dependências, lockfiles, build, deploy, workflows, autenticação,
  proxy/API, dados mockados ou integrações reais incidentalmente.
- Nunca apague, reverta ou sobrescreva alterações preexistentes do usuário.
- Nunca use `git reset --hard`, `git clean`, `git checkout`/`git restore` para
  descartar trabalho, nem comandos equivalentes de limpeza destrutiva.
- Nunca faça push, merge, publicação ou deploy automaticamente.
- Nunca use dados reais de produção nos testes e nunca execute operações que
  criem, alterem ou excluam dados reais.
- Não instale dependências sem necessidade demonstrada e aprovação explícita.
- Não declare uma verificação aprovada sem executar e conferir o resultado.

## Delimitação de cada issue

Antes de editar, registre:

1. resultado solicitado;
2. comportamento que permanece inalterado;
3. arquivos provavelmente envolvidos;
4. arquivos autorizados;
5. testes que demonstram a correção;
6. riscos de regressão.

Se interpretações diferentes levarem a diffs diferentes, faça uma pergunta
objetiva antes de implementar. Para tarefas claras e estritamente locais, não
exija aprovação repetitiva para cada operação interna; permissões OpenCode e
revisão do diff continuam obrigatórias.

## Limites do workspace

O repositório contém três projetos independentes:

- raiz: preview estático legado, `npm run serve`, porta 3000;
- `next-app`: frontend Next.js administrativo, projeto de interesse;
- `whatsapp-triage`: ferramenta local de triagem de WhatsApp, fora do app e do
  deploy.

Não modifique os outros projetos ao trabalhar no frontend.

No `next-app`, o mock é ativado no desenvolvimento (`NODE_ENV=development`) e
no GitHub Pages (`GITHUB_PAGES=1`). O modo Vercel usa o proxy para a API externa.
Playwright já sobe os servidores nas portas 3100 e 3200, com timeout de 600000
ms para o primeiro startup frio. Não suba o preview legado na mesma porta nem
crie outra infraestrutura Playwright.

## Arquivos protegidos por padrão

Alterações exigem autorização explícita e justificativa no plano:

- `next-app/src/data/mockData.js`
- `next-app/src/lib/vitrine.js`
- `next-app/src/lib/previewState.js`
- `next-app/src/lib/api.js`
- `next-app/src/lib/AuthContext.js`
- `next-app/next.config.mjs`
- `next-app/playwright.config.js`
- `next-app/package.json` e `next-app/package-lock.json`
- `next-app/src/app/globals.css` e layouts compartilhados
- `.github/workflows/deploy.yml`
- configurações de autenticação, proxy, API, build e deploy
- `.claude/`, `.maestri/`, `.vercel/` e arquivos de ambiente

Uma issue explicitamente autorizada pode tocar um arquivo protegido, mas nunca
por inferência genérica como “corrija a tela”.

## Git e validação

Registre `git status`, `git diff` e `git diff --cached` antes da tarefa. Workspace
sujo deve ser preservado; não faça limpeza automática nem troque silenciosamente
de branch. Depois, revise o diff completo, arquivos inesperados e arquivos
protegidos antes de qualquer commit. Commit só pode conter a tarefa autorizada;
push, merge e deploy nunca são automáticos.

Use exclusivamente mock nos testes. Para E2E, prefira o comando existente:

```text
cd next-app
npx playwright test --workers=1
```

A suíte completa pode levar vários minutos no primeiro startup. Mudanças visuais
exigem screenshots antes/depois nas mesmas viewports, sem atualizar baselines
automaticamente. Falhas de API externa, startup ou browser devem ser reportadas
como limitações, não mascaradas por alterações no produto.

## Configuração OpenCode

Os agentes, permissões e comandos em `.opencode/` são deliberadamente
conservadores. Agentes de leitura e QA não editam código; o implementador recebe
aprovação de edição por operação. O comando `/ralph` é um ciclo guiado limitado a
cinco iterações e não tenta controlar internamente o runtime do OpenCode.
