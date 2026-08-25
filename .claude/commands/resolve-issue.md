Resolve uma issue do GitHub deste repositório de ponta a ponta: implementa a correção, valida com testes e2e reais (não só leitura de código), gera um relatório de antes/depois com screenshots anexado à issue, comita, dá push e publica em produção no Vercel.

Argumento: `$ARGUMENTS` é o número da issue (ex: `/resolve-issue 2`). Se vazio, rode `gh issue list --repo claudiodeolli/marshalls-customer-app-preview --label whatsapp --state open` e escolha a mais antiga que não tenha a label `precisa-triagem` nem um item `- [ ]` (pergunta em aberto) não respondido no corpo — se todas tiverem pendência, pare e mostre a lista pro usuário escolher.

Exporte `GH_TOKEN` a partir de `whatsapp-triage/.env` antes de qualquer chamada ao `gh` (mesmo mecanismo do `/whatsapp-issues`).

## Passo 1 — Entender a issue

`gh issue view $ARGUMENTS --repo claudiodeolli/marshalls-customer-app-preview --json title,body,number,url,labels,comments`

Leia o corpo inteiro, incluindo os documentos/imagens anexados (baixe e leia com Read se ainda não tiver contexto suficiente — os links `raw.githubusercontent.com` funcionam direto). Se houver um item `- [ ]` em "Em aberto" sem resposta em nenhum comentário da issue, **pare e pergunte ao usuário** em vez de decidir sozinho — essas perguntas existem justamente porque só ele pode resolver.

Depois de ler, investigue o código de verdade (`next-app/src`) pra confirmar/refinar o plano da issue — o plano escrito na issue foi um palpite; o código real manda.

**Sempre releia o documento de origem.** Se a issue referencia um PDF/print anexado, baixe e leia o documento inteiro antes de implementar — o corpo da issue é um resumo e pode ter perdido requisitos. O contrato é a seção "Requisitos" da issue **mais** tudo que o documento original especifica; se o documento pedir algo que não está no checklist da issue, adicione o item ao checklist (editando a issue) em vez de ignorar.

Preste atenção especial aos requisitos que é fácil ler e não registrar: valores numéricos exatos (prazos, tamanhos), textos literais de UI, espaçamento pedido explicitamente, ícones/cores, tooltips de elementos bloqueados, e transições de estado depois de uma ação. Ao encontrar um número no documento (ex: "15 minutos"), procure o valor correspondente no código e confirme se batem — divergência silenciosa aqui é o erro mais comum.

**Escopo**: implemente todos os itens do checklist. Se algum for genuinamente impossível de localizar ou depender de decisão que só o usuário pode tomar, deixe o item desmarcado, explique no relatório, e **não feche a issue** — issue com item desmarcado permanece aberta. Nunca reporte como "concluído" algo que não foi implementado e validado.

## Passo 2 — Screenshot "antes"

Antes de tocar em qualquer código: suba o dev server em modo mock (`cd next-app && npm run dev -- -p 3100`, com `NEXT_PUBLIC_MOCK_MODE=1`) e use Playwright (`@playwright/test` já é devDependency) pra navegar até a tela afetada e tirar um screenshot mostrando o comportamento **atual (com o bug)**. Viewport mobile (390×844 — o `playwright.config.js` já usa `devices['iPhone 13']` por padrão). Salve em `next-app/tests/e2e/.tmp-screenshots/antes-<descrição-curta>.png` (pasta é gitignored, é só rascunho de trabalho — os screenshots finais do relatório vão pra outro lugar no Passo 5). Derrube o dev server depois (ou deixe rodando se for reaproveitar no passo seguinte, mas sempre derrube no final do comando).

Se o comportamento depende de uma condição relativa a tempo (ex: "faltando 48h pra consulta"), não dependa das datas fixas do mock data (`next-app/src/data/mockData.js`) — elas podem estar no passado por já ter passado tempo. Em vez disso, intercepte a resposta mockada com `page.route()` do Playwright e injete um appointment com data calculada a partir de `Date.now()`, garantindo o cenário exato que você precisa mostrar.

## Passo 3 — Implementar a correção

Edite `next-app/src` seguindo o plano da issue (refinado no Passo 1). Sem introduzir dependências novas sem necessidade clara. Siga o estilo já existente no arquivo (este projeto usa JS puro, não TypeScript, inline styles em vez de CSS modules — não mude a convenção do arquivo que você está editando).

## Passo 4 — Testes e2e + screenshot "depois"

Escreva um spec Playwright em `next-app/tests/e2e/issue-$ARGUMENTS-<descrição-curta>.spec.js` — assertions reais (`expect(locator).toBeVisible()`, `toHaveText()`, etc.), não só um screenshot. Cubra os cenários de limiar (ex: exatamente nas 48h, um pouco antes, um pouco depois).

**Derive os testes do checklist de requisitos, nunca da sua implementação.** Escrever o teste olhando pro código que você acabou de escrever só prova que o código faz o que faz — passa 100% e não detecta requisito esquecido. Percorra o checklist item por item e escreva a assertion a partir do texto do requisito. Itens sobre texto literal viram `toHaveText` com o texto exato do documento; itens sobre valores viram assertion no valor; itens sobre espaçamento preservado viram assertion de que o elemento/espaço continua lá.

Dentro do próprio teste (ou logo depois, num script separado), tire o screenshot "depois" nas mesmas condições do Passo 2, mesmo viewport, mesma tela.

Rode `npm run test:e2e` (dentro de `next-app`). Se algo falhar, corrija o código (não o teste) até passar — a menos que o teste esteja genuinamente errado, o que deve ser raro. Não prossiga pro commit com testes falhando.

## Passo 5 — Relatório de antes/depois

1. Copie os screenshots de antes/depois pra `resolution-reports/issue-$ARGUMENTS/` (pasta na raiz do repo, mesma lógica de `whatsapp-triage/attachments/`: arquivos comitados direto, servidos via `raw.githubusercontent.com`).
2. `git add resolution-reports/issue-$ARGUMENTS/`, commit **separado** (`chore: anexa screenshots da issue #$ARGUMENTS`) e `git push` — precisa estar no `main` antes das URLs funcionarem.
3. Monte o relatório em markdown:

```
## Resolvido

<resumo do que foi corrigido, em 2-3 frases>

### Antes
![antes](<url raw.githubusercontent.com>)

### Depois
![depois](<url raw.githubusercontent.com>)

### Testes e2e
- `next-app/tests/e2e/issue-$ARGUMENTS-<nome>.spec.js` — <o que cobre>
- Rodado com `npm run test:e2e`: **N passed**

### Arquivos alterados
- `<arquivo>` — <o que mudou>

### Ficou de fora (se aplicável)
<o que não foi implementado e por quê>
```

Inclua no relatório o checklist de requisitos da issue com o estado real de cada item (`- [x]` / `- [ ]`), para o usuário conferir a cobertura sem abrir o projeto.

4. Poste como comentário na issue: `gh issue comment $ARGUMENTS --repo claudiodeolli/marshalls-customer-app-preview --body-file <arquivo>`.
5. Feche a issue **somente se todos os itens do checklist estiverem marcados**: `gh issue close $ARGUMENTS --repo claudiodeolli/marshalls-customer-app-preview`. Se sobrou item, atualize o corpo da issue com o checklist parcial e deixe aberta.

## Passo 6 — Commit da correção

Commit separado do commit de screenshots (Passo 5), só com o código de `next-app/src` e o spec de teste. Mesmas regras do `/deploy`:
- Assunto em inglês, imperativo, ≤72 caracteres.
- Corpo detalhado listando o que mudou e por quê (referencie `Closes #$ARGUMENTS`).
- **Nunca** inclua `Co-Authored-By` ou qualquer atribuição de autoria a IA — confira a mensagem antes de commitar.

`git add` só os arquivos relevantes (nunca `-A` sem olhar `git status` antes), commit com heredoc, `git push`.

## Passo 7 — Deploy

Da raiz do repositório: `npx vercel --prod`. Reporte a URL de produção que ele devolver.

## Passo 8 — Resumo final

Diga pro usuário, em poucas linhas: o que foi corrigido, link da issue fechada (com o relatório), link do deploy, e qualquer coisa que ficou de fora do escopo.
