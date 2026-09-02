// Reagendamentos feitos dentro do preview.
//
// O PDF de 29/08 é explícito sobre o efeito: ao concluir, "destruir esse
// agendamento (e card) e criar um novo com status de Consulta agendada" — não
// é edição do card, é substituição, e a contagem recomeça a partir da nova
// data (issue #25).
//
// Como o preview não tem servidor, cada troca fica guardada no navegador de
// quem está navegando, no mesmo espírito do histórico de agendamentos. A
// chave entra na limpeza única de previewState.js, para não sobreviver a um
// reset.
const CHAVE = 'MOCK_REAGENDAMENTOS';

function ler() {
  if (typeof window === 'undefined') return [];
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE) || '[]');
    return Array.isArray(bruto) ? bruto : [];
  } catch {
    return [];
  }
}

export function registrarReagendamento(uuidOriginal, novoAgendamento) {
  if (typeof window === 'undefined' || !uuidOriginal) return;
  try {
    localStorage.setItem(CHAVE, JSON.stringify([...ler(), { uuidOriginal, novoAgendamento }]));
  } catch {
    // Armazenamento bloqueado: o agendamento novo não sobrevive à navegação,
    // e o preview segue mostrando o original.
  }
}

/**
 * Aplica sobre a lista de agendamentos as trocas já registradas.
 *
 * O card antigo sai e o novo entra na mesma posição, para a lista não
 * reembaralhar sob os olhos de quem acabou de reagendar — a ordenação por
 * prazo é aplicada depois, por quem chama.
 */
export function aplicarReagendamentos(agendamentos) {
  const trocas = ler();
  if (trocas.length === 0) return agendamentos;

  const porOriginal = new Map(trocas.map(t => [t.uuidOriginal, t.novoAgendamento]));

  return agendamentos.flatMap(agendamento => {
    if (!porOriginal.has(agendamento.uuid)) return [agendamento];
    const substituto = porOriginal.get(agendamento.uuid);
    return substituto ? [substituto] : [];
  });
}
