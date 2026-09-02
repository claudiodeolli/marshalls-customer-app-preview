// Estado que o preview guarda no navegador de quem acessa.
//
// A tela de Histórico junta os registros fixos do repositório com o que o
// próprio visitante criou agendando pelo preview, e esse acúmulo é por
// aparelho: o cliente via no celular três consultas que ele mesmo marcou
// testando, e no desktop não (issue #19).
//
// A persistência continua — é ela que faz o fluxo de agendamento terminar
// mostrando a consulta recém-criada. O que muda é que existe uma versão do
// estado inicial: quando ela avança, o navegador limpa o que havia acumulado
// e volta ao mesmo ponto de partida de todos os outros. Depois disso o que o
// visitante criar fica guardado normalmente, até a próxima virada de versão.
//
// Para zerar todo mundo de novo, basta mudar VERSAO_DO_ESTADO_INICIAL.
const CHAVE_DA_VERSAO = 'PREVIEW_STATE_VERSION';
const VERSAO_DO_ESTADO_INICIAL = '2026-09-01';

// Só o que o visitante produz navegando. Sessão e identidade ficam de fora:
// limpá-las deslogaria quem está no meio de uma demonstração.
const CHAVES_DE_NAVEGACAO = [
  'MOCK_HISTORY',
  'APPOINTMENT',
  'APPOINTMENT_ATTACHMENTS',
  'pendingAvulsa',
  'historico_filter',
];

/**
 * Devolve o preview ao estado inicial uma única vez por navegador.
 *
 * Chamada no layout, e não em cada tela, para que a limpeza aconteça em
 * qualquer porta de entrada do app.
 */
export function resetarEstadoInicialUmaVez() {
  if (typeof window === 'undefined') return false;

  try {
    if (localStorage.getItem(CHAVE_DA_VERSAO) === VERSAO_DO_ESTADO_INICIAL) return false;

    for (const chave of CHAVES_DE_NAVEGACAO) localStorage.removeItem(chave);
    localStorage.setItem(CHAVE_DA_VERSAO, VERSAO_DO_ESTADO_INICIAL);
    return true;
  } catch {
    // Navegador com armazenamento bloqueado: não há estado acumulado para
    // limpar, e o preview funciona igual.
    return false;
  }
}
