# Esteira Maestri — do WhatsApp ao PR

Time de agentes montado no canvas da Maestri para este repositório. O `Orquestrador` (terminal
com Maestro habilitado) conduz; os sete recrutas abaixo executam cada etapa.

## Fluxo

```
WhatsApp
   │
   ▼
Antena ──► issue no GitHub ──► Forja ──► branch + implementação + PR
                                 ▲              │
                                 │              ▼
                                 │        Pendulo   (e2e TestCafe, browser visível)
                                 │        Retina    (validação visual por screenshot)
                                 │        Ancora    (escopo e regressão)
                                 │        Lapidario (qualidade de código)
                                 │        Vigia     (segurança)
                                 └──── REPROVADO ───┘
                                                │ APROVADO
                                                ▼
                                    Painel de PR ──► review humano do Cláudio
```

Cada veredito é **APROVADO** ou **REPROVADO + lista numerada de correções objetivas**. Qualquer
reprovação volta direto para o `Forja`, que corrige na mesma branch (o PR atualiza sozinho) e
devolve para quem reprovou revalidar.

## Triagem

Nem todo pedido usa a esteira inteira: cada nó é uma sessão de modelo lendo contexto. Antes de
acionar qualquer um, o `Orquestrador` classifica o pedido num tier e chama só os nós daquele
tier — regra completa em `.claude/commands/esteira.md` (Passo 0).

| Tier | Quando | Nós |
| --- | --- | --- |
| T0 | doc, spec, script, config de teste, anexo | Forja, Ancora |
| T1 | texto, cor, ícone, espaçamento, valor literal em 1–2 telas | Forja, Retina, Ancora |
| T2 | condição, estado, fluxo, ordenação, prazo, componente local novo | + Pendulo, Lapidario |
| T3 | compartilhado, `lib/`, auth, storage, rede, dependência, workflow, asset/basePath | os sete |

Na dúvida, sobe de tier. Qualquer nó pode promover o item (e aí os faltantes são convocados);
rebaixar no meio do ciclo, nunca. O `Ancora` participa de todos os tiers — é ele que confere o
diff contra o checklist e roda a regressão Playwright. A `Antena` só entra quando o pedido
envolve o WhatsApp. Pergunta, consulta e ajuste da própria esteira não acordam ninguém.

## Agentes

| Codinome | Role | O que entrega |
| --- | --- | --- |
| `Antena` | Triagem de Pedidos do Cliente | lê o WhatsApp (`whatsapp-triage`), interpreta prints e PDFs e abre a issue com o checklist completo de requisitos |
| `Forja` | Developer de Issues | único que edita `next-app/src`; trabalha em branch `issue-<n>-<slug>`, abre o PR, absorve as reprovações |
| `Pendulo` | Tester E2E TestCafe | specs em `next-app/tests/testcafe/`, rodados em browser visível dentro do portal |
| `Retina` | Validador de Design | screenshots em 390x844 e 1440x900, comparação com o documento do cliente e com as telas vizinhas |
| `Ancora` | Guardiao de Escopo e Regressao | mapeia cada hunk do diff para um item do checklist; caça alteração não pedida e regressão de decisão anterior |
| `Lapidario` | Revisor de PR | qualidade de código, convenção do projeto, higiene de commit; aponta o portal do PR ao aprovar |
| `Vigia` | Revisor de Seguranca | segredo no bundle, XSS, dado sensível em localStorage, auth no cliente, `npm audit` |

Os prompts completos ficam nos roles da Maestri (`maestri role show "<nome do role>"`), escopados
ao workspace **Marshalls**.

## Portais

| Portal | Dono | Para quê |
| --- | --- | --- |
| `Painel de Issues` | Antena | abre a issue assim que ela é criada; senão, a lista aberta com label `whatsapp` |
| `Bancada E2E` | Pendulo | browser onde o TestCafe roda à vista (`npm run test:e2e:portal`) |
| `Vitrine` | Retina | inspeção visual do app em mobile e desktop |
| `Painel de PR` | Lapidario | abre o PR aprovado para o review humano |

Os portais do GitHub precisam de sessão logada: na primeira vez, faça login dentro do portal.

## Nota compartilhada

`Esteira` é o quadro do pipeline (issue atual, branch, PR e o estado de cada etapa). Está conectada
aos sete agentes: todos leem antes de começar e registram o veredito ao terminar.

## Como tocar a esteira

```
maestri ask "Antena" "puxe as mensagens novas e abra as issues"
maestri ask "Forja" "implemente a issue #<n>"
maestri ask --batch '{"Ancora": "audite o escopo da branch issue-<n>", "Vigia": "revise a segurança do PR #<p>"}'
```

O comando `/esteira <numero-da-issue>` conduz o ciclo inteiro de uma issue.

## Recriar o time num workspace novo

Os roles já existem no workspace Marshalls. Basta:

```
maestri recruit "Antena"    --role "Triagem de Pedidos do Cliente"     --dir "D:\Freela\marshalls-customer-app-preview"
maestri recruit "Forja"     --role "Developer de Issues"               --dir "D:\Freela\marshalls-customer-app-preview"
maestri recruit "Pendulo"   --role "Tester E2E TestCafe"               --dir "D:\Freela\marshalls-customer-app-preview"
maestri recruit "Retina"    --role "Validador de Design"               --dir "D:\Freela\marshalls-customer-app-preview"
maestri recruit "Ancora"    --role "Guardiao de Escopo e Regressao"    --dir "D:\Freela\marshalls-customer-app-preview"
maestri recruit "Lapidario" --role "Revisor de PR"                     --dir "D:\Freela\marshalls-customer-app-preview"
maestri recruit "Vigia"     --role "Revisor de Seguranca"              --dir "D:\Freela\marshalls-customer-app-preview"
```

Depois conecte a nota e os portais a seus donos (`maestri connect`) e ligue cada revisor ao `Forja`.
