# Regras deste projeto

## 1. Não altere nada além do que foi pedido

**Esta é a regra mais forte do projeto. Ela vem antes de qualquer melhoria que
pareça óbvia.**

O que está no ar foi revisado e aprovado pelo cliente, pedido por pedido. Cada
detalhe que hoje está correto custou uma rodada de ida e volta com ele. Mexer
em algo que não foi pedido apaga esse trabalho, e o custo não é seu: é dele
descobrir, relatar e esperar de novo.

Na prática:

- **Mude só o que o pedido nomeia.** Se o pedido é sobre o botão, mexa no
  botão. Não "aproveite para" ajustar o espaçamento ao lado, renomear uma
  variável próxima, nem padronizar o que está inconsistente.
- **Refatoração só quando é o pedido.** Melhorar o código em volta é uma
  decisão do Cláudio, não sua.
- **Se você acha que outra coisa deveria mudar, diga — não faça.** Descreva o
  que viu e por quê, e deixe a decisão com ele.
- **Confirme o alcance antes de agir**: desktop, mobile ou ambos. Não assuma.

## 2. Um pedido de desktop não é um pedido de mobile

Foi assim que a issue #49 nasceu. O pedido da #46 era alinhar a barra numa
janela estreita de desktop. A correção foi escrita no breakpoint
`max-width: 1199.98px`, que **inclui o celular**, e a #47 completou o estrago
ao devolver o posicionamento ao tema. Nada disso foi pedido para o celular, e o
cliente encontrou o app desconfigurado no telefone dele três dias depois.

Antes de mexer em CSS responsivo:

- Veja em **qual faixa de largura** o pedido se aplica.
- Confira quais breakpoints a regra que você vai escrever alcança. Os do tema
  Vuexy são `575.98`, `767.98`, `991.98` e `1199.98`.
- Meça **o breakpoint que você não pretendia tocar** também, para provar que
  ele não mudou.

## 3. Verifique que o que já foi aprovado continua de pé

Antes de publicar, rode a suíte inteira:

```
cd next-app && npx playwright test --workers=1
```

Use `--workers=1`. Com mais workers a contenção de CPU derruba o carregamento
de imagens e gera falha que não existe — isso já custou um diagnóstico errado.

A suíte é a memória do que o cliente aprovou: cada spec leva o número da issue
que a originou. **Um teste que falha depois da sua mudança é um pedido antigo
sendo desfeito** — trate como defeito seu, não como teste desatualizado.

Se a mudança tornar um teste obsoleto de verdade, diga isso em voz alta e
explique por quê, em vez de afrouxar a asserção em silêncio.

## 4. Teste medindo, não olhando

Este projeto tem histórico de teste que passa sem provar nada. Casos reais:

- medir `window.scrollY` quando quem rolava era o `body` — sempre zero;
- exigir rolagem numa janela onde a página inteira cabia — nada para rolar;
- fotografar uma modal antes de ela chegar ao DOM.

Por isso: toda asserção de rolagem, geometria ou cor precisa de uma **guarda**
que prove que a medição vê o que deveria. Se o teste passaria mesmo com o
defeito presente, ele não é um teste.

## 5. Publique e confirme no ambiente real

`main` publica sozinho no GitHub Pages, e é lá que o cliente olha. A Vercel usa
a API real e exige login, então a verificação visual acontece no Pages:

```
https://claudiodeolli.github.io/marshalls-customer-app-preview/
```

Meça no ar depois de publicar, e anexe os números à issue. "Passou o teste
local" não é evidência de que o cliente vai ver certo.
