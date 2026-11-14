# Echo Lab

**Ditado e shadowing com o trecho exato de vídeos do YouTube.**

O vídeo toca, pausa sozinho no intervalo que você escolheu e espera você
escrever o que entendeu. Ao corrigir, o app compara sua resposta com a
transcrição do corte real — palavra por palavra — e mostra acertos, erros,
palavras faltando/sobrando e a porcentagem.

Roda **100% no seu computador**, sem conta, sem banco de dados e sem enviar
áudio para lugar nenhum. Não precisa de `npm install`: só Node.js.

```
echo-lab/
  start.cmd        duplo clique no Windows
  server.mjs       servidor local + provider de legendas
  public/          interface (HTML/CSS/JS puro)
  src/shared/      regras de corte, alinhamento e correção
  src/server/      YouTube, cache e servidor
  tests/           testes unitários com node:test
  scripts/         verificação ao vivo do provider
```

---

## Começar

Requisitos: **Node.js 20+** (testado em Node 24) e acesso ao YouTube.

No Windows, dê duplo clique em **`start.cmd`**. Ou:

```bash
cd echo-lab
node server.mjs --open
```

Abra `http://127.0.0.1:4317` se o navegador não abrir. Para usar outra porta:

```bash
node server.mjs --port 4318 --open
```

1. Cole um link do YouTube (vídeo normal, `youtu.be`, Shorts, embed ou só o ID).
2. Escolha **Ditado** ou **Shadowing**, o intervalo da pausa e, se quiser, onde começar.
3. Clique em **Buscar vídeo**. Confira a faixa de legenda e clique em **Começar sessão**.
4. No ditado: ouça, espere a pausa automática, escreva e pressione **Enter**.
5. No shadowing: ouça o trecho em loop, repita junto e, se quiser, grave sua voz para comparar.

O player fica sob controle do app: sem barra de seek e com as legendas do
YouTube escondidas durante o exercício.

---

## Por que o corte é confiável

Este é o ponto central do projeto. A correção não usa um contador aproximado
nem "mais ou menos o trecho". O caminho é:

1. **O corte é lido do player.** O app controla o player via IFrame API. Quando
   o alvo chega, ele pausa e registra `getCurrentTime()` naquele instante — o
   tempo real do vídeo, não o tempo do `setInterval`.
2. **A transcrição é fatiada por esse tempo real.** Cada palavra tem uma marca
   de início e fim. A referência são as palavras cujo **ponto médio** cai dentro
   do intervalo ouvido.
3. **As marcas de tempo são por palavra.** O app busca a faixa automática do
   YouTube, cujo JSON3 traz `tOffsetMs` por palavra. Ela é a fonte de tempo.
4. **O texto oficial é preservado.** Quando existe legenda humana, o app pega o
   texto oficial (com pontuação e grafia corretas) e **alinha palavra a palavra**
   com a faixa automática para transferir os tempos. Nos testes com uma palestra
   TED, 95% das palavras ficaram ancoradas em tempos do ASR.
5. **O corte evita o meio de palavras.** Por padrão, o alvo é ajustado para o
   início da próxima palavra com até 0,65 s de antecedência. A preferência é por
   palavras com tempo **estável** (alinhadas ao ASR); se não houver, usa a
   melhor estimativa.
6. **O tempo real manda.** Se o timer atrasar 20 ms, a referência usa o tempo
   atrasado — exatamente o que foi ouvido. O app mostra os timecodes de início e
   fim de cada trecho para você auditar.

Em medições no Chromium, `getCurrentTime()` teve resolução de ~16 ms e a pausa
ficou ~9 ms depois do alvo. Em um teste completo, o alvo era 6,072 s e o corte
real ficou em 6,089 s; a referência foi montada com 6,089 s.

### E quando só existe legenda humana?

Alguns vídeos não têm faixa automática. Nesse caso, o texto é dividido dentro de
cada frase por duração proporcional. O app avisa na tela que os tempos são
estimados. O texto continua sendo o oficial, mas o corte pode variar alguns
décimos de segundo. Para máxima precisão, prefira vídeos com as duas faixas
(ou escolha a faixa automática em **Faixa de legenda**).

A faixa automática pode ter pequenos erros de reconhecimento. Por isso o padrão
é usar o **texto oficial** com o **tempo do ASR**; você pode trocar para a
transcrição automática inteira quando fizer sentido.

---

## Como a nota é calculada

A comparação é por palavra, com normalização:

- maiúsculas/minúsculas, pontuação, apóstrofos e hífens são ignorados;
- `don't` e `dont` contam como a mesma palavra, assim como `well-known` e
  `well known`;
- cada palavra do trecho que você acertou vale 1;
- **palavras trocadas** (substituições), **faltando** e **extras** aparecem no
  diff e reduzem a porcentagem;
- a porcentagem principal é `acertos / (palavras do trecho + extras)`;
- o app também mostra "X de Y palavras" para você ver a base.

Exemplo: 10 palavras certas + 1 inventada = 90,9%. 12 certas, 1 trocada e 1
faltando em 14 = 85,7%.

O diff mostra:

- **Sua resposta**: verde = certa, vermelho/riscado = trocada ou sobrando;
- **Transcrição exata do corte**: verde = certa, âmbar tracejado = faltou,
  vermelho com `→` = palavra que você trocou.

A correção usa a transcrição do corte exibido no painel, com os timecodes ao
lado. Nada é comparado com o vídeo inteiro.

---

## Recursos

- **Ditado** com pausa automática, Enter para corrigir e diff palavra a palavra.
- **Shadowing** com texto de apoio, loop de 1 a 5 repetições, velocidade 0,6x a
  1x, karaokê por palavra e gravação local da sua voz.
- **Intervalo de 4 a 60 segundos**, com ajuste para pausas naturais.
- **Início personalizado** (`mm:ss`) ou automático na primeira fala.
- **Escolha da faixa** de legenda (oficial ou automática) quando as duas existem.
- **Player controlado**: sem seek acidental, sem legenda do YouTube aparecendo
  por cima do exercício.
- **Histórico** de trechos com nota, tempos e diff; **exportação JSON**.
- **Retomada**: ao reabrir, você pode continuar a sessão salva.
- **Aviso sonoro** opcional ao pausar e chime ao acertar tudo.
- **Tema escuro, responsivo** e atalhos de teclado.
- **Sem dependências npm**, sem build e sem telemetria.

### Atalhos

| Tecla | Ação |
| --- | --- |
| `Enter` | corrige a resposta |
| `Shift` + `Enter` | nova linha |
| `Espaço` | reproduz/pausa (fora do campo de texto) |
| `R` | repete o trecho |
| `N` | próximo trecho |
| `?` | ajuda |
| `Esc` | fecha diálogos |

---

## Configurações e persistência

- O intervalo e o modo são salvos no seu navegador (`localStorage`).
- Cada sessão guarda respostas, tempos e notas em `localStorage`.
- A sessão mais recente aparece em **Continuar** na tela inicial.
- Se você sair da aba, a sessão pausa para não cortar enquanto você não está
  ouvindo. Ao voltar, o trecho recomeça do início.
- A gravação de voz fica em memória no navegador e é descartada ao trocar de
  trecho. Use fones para o microfone não captar o vídeo.

> A sessão é local ao navegador e à pasta do app. Limpar os dados do site apaga
> o histórico.

---

## Testes e verificação

```bash
cd echo-lab
npm test              # 47 testes unitários (node:test, sem dependências)
npm run check         # consulta real ao YouTube (precisa de internet)
```

Os testes cobrem:

- normalização de texto, entidades HTML e anotações (`[Music]`, `(Audience)`);
- parsing de JSON3 manual e ASR, incluindo offsets por palavra, fillers e
  listas monotônicas;
- alinhamento manual ↔ ASR (exato, aproximado, lacunas, ordem);
- escolha de corte, preferência por tempos estáveis, início sem cortar palavra
  e fatiamento por ponto médio;
- correção: 100%, faltando, trocada, extra, resposta vazia, ordem, apóstrofos;
- provider: extração de ID de URLs, validação de faixas, snapshot do player,
  montagem da transcrição, fallback para ASR e erros.

A verificação ao vivo (`npm run check`) usa os vídeos padrão `jNQXAC9IVRw`
(só legenda humana) e `iG9CE55wbtY` (TED, manual + ASR). Ela confere ordem,
durações e mostra um exemplo de corte de 5 s.

O fluxo completo também foi exercitado em Chromium headless com Playwright
(fora do repositório): carregar vídeo, pausa automática, legenda do YouTube
oculta, resposta 100%, continuidade do próximo trecho a partir do corte real,
extra detectado, sombra/karakê, retomada de sessão, troca de faixa, layout
mobile sem overflow e erros de link/vídeo.

---

## Requisitos e limitações

- **Só vídeos com legenda em inglês.** Sem legenda (humana ou automática) não há
  referência confiável. O app mostra o motivo e a lista de idiomas disponível.
- **Vídeos com incorporação bloqueada** não tocam no app. Use outro vídeo.
- **Anúncios e buffering** podem atrasar o corte; o app mostra "Anúncio ou
  carregando…" e espera. O tempo registrado continua sendo o tempo real do
  vídeo, e a referência é montada a partir dele.
- **A extração de legendas depende do YouTube.** O provider usa o endpoint do
  player no cliente iOS, que em 2026 entrega as faixas com URLs utilizáveis. Se
  o YouTube mudar isso, o app falha de forma explícita (com mensagem), e o
  provider pode precisar de ajuste. O endpoint público `timedtext` e o
  `get_transcript` estão bloqueados por BotGuard para requisições fora do
  navegador; por isso a escolha do cliente iOS.
- **Legenda humana sem ASR** tem tempos estimados dentro da frase (o app avisa).
- **Cache local** em `echo-lab/.cache/` (ignorado pelo git): respostas do player
  por 6 h e legendas por 30 dias, para não sobrecarregar o YouTube.
- **Uma instância local** na porta 4317, ligada a `127.0.0.1`. Não há deploy
  público nem multiusuário.
- **Uso pessoal/educacional.** O app lê legendas públicas e incorpora o player;
  não baixa vídeo nem áudio. Respeite os termos do YouTube e os direitos dos
  vídeos que usar.

### Se algo falhar

- **"Não consegui falar com o servidor local"** → rode `node server.mjs` dentro
  de `echo-lab/` e abra `http://127.0.0.1:4317`.
- **"O YouTube limitou temporariamente as requisições"** → aguarde alguns
  minutos. O cache evita novas consultas para o mesmo vídeo.
- **"Este vídeo não tem legenda em inglês"** → escolha outro vídeo ou confira a
  faixa no menu **Faixa de legenda**.
- **Legenda expirou** → clique em **Buscar vídeo** de novo; o app renova o
  player e tenta uma vez.
- **Acentos/português estranhos no terminal** → é só a codificação do console do
  Windows; a interface no navegador está em UTF-8.

---

## Arquitetura

```
Navegador
  public/js/player.js      wrapper do IFrame API; controla pausa, seek,
                           esconde legendas do YouTube, mede o tempo real
  public/js/app.js         máquina de estados da sessão, timer de 30 ms,
                           persistência, retomada, gravação
  public/js/ui.js          templates e diff (tudo escapado)
  src/shared/segments.mjs  escolha do corte, início, fatiamento por midpoint
  src/shared/scoring.mjs   normalização + Levenshtein por palavra
  src/shared/captions.mjs  JSON3 → palavras com tempo; alinhamento manual/ASR
  src/shared/alignment.mjs Needleman-Wunsch monotônico para ancorar tempos

Servidor local (Node, sem deps)
  server.mjs               static + API + cache + erros
  src/server/youtube.mjs   cliente iOS do player, faixas en, JSON3,
                           alinhamento e fallback
  src/server/cache.mjs     cache JSON em disco
```

O navegador nunca fala com o YouTube para legendas: o servidor local faz a
consulta, valida a URL `youtube.com/api/timedtext`, guarda o JSON3 bruto e
entrega apenas as palavras. Isso evita CORS e mantém a chave/ordem do alinhamento
em um lugar testável.

Variável opcional: `YT_CLIENT_VERSION` (padrão `20.10.4`) para atualizar a
versão do cliente iOS caso o YouTube exija uma nova.

---

## Privacidade

- Nenhuma conta, analytics ou chamada para servidor de terceiros além do
  YouTube (player e legendas).
- Áudio do microfone não sai do navegador; é um `Blob` local descartado ao trocar
  de trecho.
- Respostas e notas ficam no `localStorage` do seu navegador.
- O servidor escuta apenas `127.0.0.1`.

Projeto isolado em `echo-lab/`; não altera os demais projetos do repositório.
