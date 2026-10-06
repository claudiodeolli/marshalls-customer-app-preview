Conduz uma issue pela esteira de agentes da Maestri, do código ao PR pronto para o review
humano. Rode a partir do terminal `Orquestrador` (o que tem Maestro habilitado).

Argumento: `$ARGUMENTS` é o número da issue (ex: `/esteira 35`). Se vier vazio, peça ao
`Antena` para puxar mensagens novas do WhatsApp e abrir as issues, mostre a lista ao usuário e
pare — quem escolhe o que entra na esteira é ele.

A topologia do time, os codinomes e os portais estão em `.claude/maestri-esteira.md`. Rode
`maestri list` antes de começar para confirmar quem está de pé; se faltar agente, recrute com
os comandos daquele documento.

## Passo 0 — Triagem (obrigatória, antes de acordar qualquer nó)

Cada nó acionado é uma sessão de modelo inteira lendo contexto. Acione só os que o pedido
exige. Classifique num tier e anuncie a escolha ao usuário em até 3 linhas (tier + nós + o
motivo de quem ficou fora) antes de despachar.

Os sinais vêm do texto da issue e, quando já existe branch, de
`git diff --stat origin/main...HEAD`.

| Tier | Quando | Nós |
| --- | --- | --- |
| **T0 — fora do app** | só documentação, spec, script, config de teste ou anexo | Forja, Ancora |
| **T1 — cosmético** | valor literal, texto de UI, cor, ícone, espaçamento; 1–2 arquivos de tela; sem lógica nova | Forja, Retina, Ancora |
| **T2 — comportamento** | condição, estado, fluxo de modal, ordenação, data/prazo, componente local novo | Forja, Pendulo, Retina, Ancora, Lapidario |
| **T3 — transversal ou sensível** | qualquer gatilho abaixo | os sete |

Gatilhos que forçam T3 independentemente do tamanho do diff: `package.json` ou
`package-lock.json` · `.github/` · `next-app/src/lib/` · `AuthContext` · `localStorage` ·
`fetch`/`axios` · `globals.css` · `next-app/src/components/ui/` · caminho de asset ou
`basePath` · qualquer arquivo importado por mais de duas telas.

Regras que protegem a precisão:

- **Na dúvida entre dois tiers, sobe.**
- **Promoção sim, rebaixamento nunca.** Qualquer nó pode devolver "isto é T3" (o `Ancora`
  descobre que o componente é compartilhado, a `Retina` vê que a mudança vazou para outra
  tela). Convoque os faltantes antes de aprovar. Tirar um nó no meio do ciclo não existe.
- **`Ancora` está em todos os tiers**: é ele que mapeia o diff contra o checklist e roda a
  rede de regressão Playwright — justamente o que o cliente cobra quando algo muda sem pedido.
- **`Antena` só entra** quando o pedido é ler o WhatsApp ou abrir issue. Com o número da issue
  em mãos, ela fica fora.
- **Nenhum nó** quando o pedido é pergunta, consulta de estado, leitura de código ou ajuste na
  própria esteira: responda direto.

## Passo 1 — Preparar o quadro

Atualize a seção "Item em andamento" da nota `Esteira` com o número da issue e marque a etapa
de implementação como `em andamento` (`maestri note edit "Esteira" "<linha antiga>" "<linha
nova>"`). O quadro é o que o usuário olha para saber onde a issue está.

## Passo 2 — Implementação

`maestri ask "Forja" "implemente a issue #$ARGUMENTS seguindo seu role: branch própria,
screenshot antes/depois, sem sair do checklist. Ao terminar, me devolva o nome da branch e a
URL do PR."`

Use timeout generoso (issue média passa de 10 minutos). Se estourar, **não reenvie o pedido**:
`maestri check "Forja"` para ver o progresso e espere de novo.

Se o `Forja` responder que a issue tem pergunta em aberto, pare e leve a pergunta ao usuário.

## Passo 3 — Validações em paralelo

Com a branch pronta, reveja a triagem do Passo 0 contra o diff real (o que o `Forja` tocou
pode ter subido o tier) e dispare **num único batch** apenas os revisores do tier:

```
maestri ask --batch '{
  "Pendulo":   "e2e da issue #N, branch <branch>. Tocados: <arquivos>. Requisitos: <itens>",
  "Retina":    "visual da issue #N, branch <branch>. Telas: <rotas>. Pedido do cliente: <citação>",
  "Ancora":    "escopo e regressão da branch <branch> contra o checklist da issue #N",
  "Lapidario": "qualidade do PR <url>. Diff: <arquivos>",
  "Vigia":     "segurança do PR <url>. Tocados: <arquivos sensíveis>"
}'
```

**O briefing é o maior corte de tokens da esteira**: mande no prompt o que você já sabe —
branch, arquivos tocados, rotas afetadas, os requisitos literais em jogo e o que outro nó já
verificou. Sem isso, cada revisor re-deriva o mesmo contexto do zero.

O batch só retorna quando todos terminarem — dimensione o timeout pelo mais lento (o `Pendulo`
sobe o dev server e roda browser de verdade; conte 15 minutos).

## Passo 4 — Consolidar os vereditos

Junte as respostas numa lista única de correções, sem duplicar item que dois revisores
apontaram, e devolva de uma vez ao `Forja`. Rodadas parciais fazem o dev refazer a mesma
branch várias vezes sem necessidade.

Reprovado por qualquer um → `maestri ask "Forja" "<lista numerada de correções>"` e, quando ele
devolver, revalide **somente com quem reprovou** (não refaça o batch inteiro).

Registre cada veredito na nota `Esteira` conforme chegam.

## Passo 5 — Entregar para o review humano

Com todos aprovados:

1. Confirme que o `Lapidario` apontou o portal: `maestri portal info "Painel de PR"` precisa
   mostrar a URL do PR. Se não, aponte você mesmo:
   `maestri portal navigate "Painel de PR" "<url do PR>"`.
2. Mova a issue para o histórico da nota `Esteira` (número, título, PR, data) e limpe a seção
   "Item em andamento".
3. Resuma ao usuário em poucas linhas: o que foi implementado, o veredito de cada revisor, o
   que ficou de fora e o link do PR esperando o review dele.

Não faça merge nem deploy: o merge é decisão do usuário, depois do review dele no portal.
