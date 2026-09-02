'use client';

import { useEffect, useRef } from 'react';

/**
 * Faz o "voltar" andar pelas etapas de um fluxo que vive numa rota só.
 *
 * A marcação de consulta avança por estado do React — escolher a
 * especialidade, abrir o calendário, seguir para o pagamento — e nada disso
 * criava entrada no histórico do navegador. O histórico guardava apenas a
 * página de onde o usuário veio, então `router.back()` saía da tela inteira em
 * vez de recuar um passo (issue #23).
 *
 * Cada avanço empilha uma entrada no histórico e guarda, numa pilha própria,
 * um retrato do estado anterior. Voltar — pelo botão da tela ou pelo gesto do
 * aparelho, que passam a concordar — consome as duas.
 *
 * Os retratos ficam fora do `history.state` de propósito: ao voltar, o
 * navegador entrega o estado da entrada **anterior**, que é a do roteador do
 * Next e não conhece as etapas deste fluxo. Guardar por fora é o que mantém o
 * dado do lado certo do movimento.
 *
 * Esvaziada a pilha, o voltar sai da tela — que é o comportamento certo na
 * primeira etapa.
 *
 * @param etapa     identificador da etapa atual; mudou, avançou
 * @param retrato   estado da etapa atual, para quando se voltar a ela
 * @param restaurar função que reaplica um retrato
 */
export function useHistoricoDeEtapas(etapa, retrato, restaurar) {
  const etapaAnterior = useRef(etapa);
  const retratoAnterior = useRef(retrato);
  const pilha = useRef([]);

  useEffect(() => {
    function aoVoltar() {
      const anterior = pilha.current.pop();
      if (!anterior) return;

      etapaAnterior.current = anterior.etapa;
      retratoAnterior.current = anterior.retrato;
      restaurar(anterior.retrato);
    }

    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, [restaurar]);

  // Empilha antes de o retrato anterior ser substituído: os efeitos rodam na
  // ordem em que são declarados, e o de baixo é quem atualiza a referência.
  useEffect(() => {
    if (etapaAnterior.current === etapa) return;

    // Ao voltar, `aoVoltar` já reposicionou `etapaAnterior` antes de o React
    // reprocessar, então a condição acima corta este efeito e nenhum passo
    // fantasma é empilhado.
    pilha.current.push({ etapa: etapaAnterior.current, retrato: retratoAnterior.current });
    // Espalhar o estado que já estava lá: o roteador do Next guarda os
    // próprios dados em history.state, e sobrescrevê-los faria o voltar cair
    // numa navegação cheia em vez de disparar o popstate.
    window.history.pushState({ ...window.history.state }, '', window.location.href);
    etapaAnterior.current = etapa;
  }, [etapa]);

  useEffect(() => {
    retratoAnterior.current = retrato;
  });
}
