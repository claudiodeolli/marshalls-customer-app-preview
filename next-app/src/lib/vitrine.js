// Trava temporária da vitrine do preview.
//
// O cliente usa estas telas para mostrar as possibilidades ao designer, e
// pediu que elas fiquem estáveis: sempre os mesmos cards, no mesmo aparelho e
// em qualquer outro. A tela de Agendamentos já era assim; o Histórico e os
// Encaminhamentos passam a ser (issues #29 e #30).
//
// A trava é **só de exibição**, como ele decidiu. O preview continua gravando
// o que o visitante agenda — é o que faz o fluxo de marcação terminar
// mostrando a consulta criada —, e são as telas que ignoram esses registros
// enquanto isto estiver ligado.
//
// Ele já avisou: "depois a gente deixa funcionando certinho". Desligar é
// trocar a linha abaixo para `false`.
export const VITRINE_TRAVADA = true;

// Quantos cards cada tag mostra enquanto a vitrine está travada.
//
// Histórico: o filtro "Consultas agendadas" fica com dois, um de cada origem.
// Encaminhamentos: um por tag, e ali todos são de encaminhamento — não existe
// origem avulsa naquela tela.
export const CARDS_POR_TAG = {
  historicoAgendadas: 2,
  encaminhamentos: 1,
};

/**
 * Corta uma lista já ordenada em no máximo `limite` itens por chave.
 *
 * Recorta o que aparece, e não o que existe: os dados seguem inteiros no
 * repositório, e destravar a vitrine devolve todos eles.
 */
export function limitarPorChave(itens, chaveDe, limite) {
  const contagem = new Map();

  return itens.filter(item => {
    const chave = chaveDe(item);
    const vistos = contagem.get(chave) ?? 0;
    if (vistos >= limite) return false;
    contagem.set(chave, vistos + 1);
    return true;
  });
}
