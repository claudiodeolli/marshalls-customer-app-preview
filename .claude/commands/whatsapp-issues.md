Lê as mensagens novas do WhatsApp do cliente (contato rastreado em `whatsapp-triage/.env`) e abre uma issue neste repositório do GitHub para cada pedido de mudança novo, já traduzido pra linguagem de dev.

## Passo 1 — Buscar mensagens novas

1. Se `whatsapp-triage/node_modules` não existir, rode `cd whatsapp-triage && npm install`.
2. Rode `cd whatsapp-triage && npm run fetch`.
   - Na primeira vez (sem sessão salva ainda), vai aparecer um QR code no terminal — peça pro usuário escanear com o WhatsApp (Aparelhos conectados → Conectar um aparelho) e espere o comando terminar sozinho depois disso.
   - Se a sessão cair com mensagem de "deslogada", avise o usuário e pare — é uma ação dele (apagar `whatsapp-triage/.auth` e reescanear), não tente contornar.
3. Leia `whatsapp-triage/tmp/output.json` — uma lista `{ id, timestamp, kind, body, imagePath }` ordenada por horário. Se vier vazia, informe "nenhuma mensagem nova" e pare por aqui.

## Passo 2 — Agrupar em pedidos

Agrupe as mensagens em "pedidos" usando julgamento: mensagens próximas no tempo e sobre o mesmo assunto formam um pedido só; um intervalo grande ou uma troca clara de assunto começa um pedido novo. Não crie uma issue por mensagem — várias mensagens seguidas costumam ser um pedido só.

## Passo 3 — Interpretar cada pedido

Você traduz o pedido do cliente (informal, às vezes confuso, sem termos técnicos) pra linguagem de desenvolvedor. Para cada grupo:

- **Leia as imagens** (`imagePath`, quando houver) com a ferramenta Read. Prints podem ter marcações à mão (círculo, seta, sublinhado, X, risco...), normalmente vermelhas, apontando pra um elemento da tela. Toda marcação visível vira uma anotação, mesmo que só dê pra arriscar um palpite sobre o que ela aponta — nesse caso diga isso explicitamente em vez de inventar.
- **Investigue o código de verdade** em `next-app/src` (Glob/Grep) antes de listar arquivos prováveis — o repositório está bem aqui, não é preciso só chutar como antes.
- Escreva:
  - **title** — até 80 caracteres, direto ao ponto.
  - **rephrase** — como um dev formularia o requisito: elemento + tela + comportamento + condição. Não é tradução literal, é o que o cliente realmente quer, em até 3 frases.
  - **plan** — passos curtos e imperativos (até 5), cada um com os arquivos prováveis reais.
  - **openQuestions** — SOMENTE ambiguidade genuína de produto/requisito que só o Cláudio pode resolver (ex: "aumenta o botão" mas há dois botões na tela). NUNCA inclua dúvida técnica de implementação (qual hook, qual seletor CSS, nome de arquivo) — isso você decide sozinho e segue.
  - **confidence** — alta, média ou baixa.

## Passo 4 — Anexar imagens (se houver)

Para cada imagem usada num pedido: copie `whatsapp-triage/tmp/<id>.jpg` para `whatsapp-triage/attachments/<AAAA-MM>/<id>.jpg`, `git add` só esse arquivo. Depois de processar todos os pedidos, faça um único commit com todos os anexos novos (`chore: anexa prints do whatsapp para issues`) e `git push` — **antes** de criar qualquer issue que referencie uma imagem, porque a URL só resolve depois do push:

`https://raw.githubusercontent.com/claudiodeolli/marshalls-customer-app-preview/main/whatsapp-triage/attachments/<AAAA-MM>/<id>.jpg`

## Passo 5 — Criar a issue

Exporte `GH_TOKEN` a partir de `whatsapp-triage/.env` antes de qualquer chamada ao `gh` (ele usa essa variável em vez de precisar de `gh auth login` global — ver comentário no `.env.example`). Se `GH_TOKEN` estiver vazio, pare e peça pro usuário gerar o token (mesmos passos do `.env.example`) e colar lá.

As labels `whatsapp`, `precisa-triagem` e `erro-interpretacao` já existem neste repositório — não precisa criar de novo.

Para cada pedido:

```
gh issue create --repo claudiodeolli/marshalls-customer-app-preview \
  --title "<title>" \
  --label whatsapp \
  [--label precisa-triagem   # só se openQuestions não estiver vazio] \
  --body-file <arquivo temporário com o corpo abaixo>
```

Corpo da issue (markdown; omita as seções vazias):

```
### Pedido original (WhatsApp)
> <transcrição das mensagens do grupo>

### O que entendi
<rephrase>

### Marcações detectadas nos prints
- **<cor> (<forma>)** em <local> → aponta para: <o quê> — provável intenção: <intenção>

### Plano sugerido
1. <passo> (`<arquivos prováveis>`)

### Em aberto
- [ ] <pergunta>

### Confiança: <alta|media|baixa>

### Imagens
![print](<url raw.githubusercontent.com>)

---
_Criado a partir de mensagens do WhatsApp via /whatsapp-issues._
```

## Passo 6 — Resumo final

Liste pro usuário, em poucas linhas, as issues criadas (número + título + link).
