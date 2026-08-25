// Escala de legibilidade das modais (issue #6). O cliente pediu texto e
// botões maiores, "como se fosse para pessoas mais velhas conseguirem
// enxergar". 16px de corpo e 44px de altura de botão são o mínimo que as
// diretrizes de acessibilidade recomendam para leitura e alvo de toque.
//
// Se ele achar pouco ao revisar, subir aqui — as modais que usam estes
// tokens acompanham juntas, em vez de irem divergindo uma a uma.

export const MODAL_CARD = { width: '460px', maxWidth: '92vw', borderRadius: '12px' };
export const MODAL_BODY = { padding: '1.75rem' };

export const MODAL_TITLE = { fontSize: '20px', fontWeight: 700, marginBottom: '1rem' };
export const MODAL_TEXT = { fontSize: '16px', lineHeight: 1.6, color: '#333' };
export const MODAL_TEXT_MUTED = { fontSize: '16px', lineHeight: 1.6, color: '#5e5873' };

// Botões lado a lado; em tela estreita eles quebram para a linha de baixo
// em vez de espremer o rótulo.
export const MODAL_ACTIONS = {
  display: 'flex', justifyContent: 'flex-end',
  gap: '10px', flexWrap: 'wrap', marginTop: '1.5rem',
};
export const MODAL_BUTTON = {
  minHeight: '44px', fontSize: '16px', padding: '0 20px',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
