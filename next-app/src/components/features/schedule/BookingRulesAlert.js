'use client';

import { useEffect, useRef, useState } from 'react';
import { withEmphasis } from '@/components/ui/emphasis';
import EmojiIcon from '@/components/ui/EmojiIcon';
import {
  MODAL_OVERLAY, MODAL_CARD, MODAL_BODY, MODAL_TITLE, MODAL_TEXT, MODAL_ACTIONS, MODAL_BUTTON,
} from '@/components/ui/modalScale';

// Textos definidos pelo cliente, reescritos por ele em 27/08 às 23:12 (issue
// #21). Os trechos entre ** são renderizados em negrito, e onde cada negrito
// começa e termina faz parte do que ele especificou — não reescrever sem
// conferir as imagens anexadas à issue.
const CONTENT = {
  referral: {
    title: 'Importante!',
    paragraphs: [
      'Esta modalidade de consulta pode ser **reagendada até 48 horas antes do horário agendado, sem perder o Encaminhamento. Após esse prazo, não é possível reagendar.**',
      'Se optar pelo **cancelamento**, o Encaminhamento será encerrado. Para agendar novamente uma consulta com essa especialidade **sem custo**, será necessário passar pelo **Plantão 24h** e obter um novo Encaminhamento, caso ainda haja indicação médica.',
    ],
  },
  avulsa: {
    title: 'Lembre-se!',
    paragraphs: [
      'As **Consultas Avulsas** podem ser **reagendadas ou canceladas até 48 horas antes do horário agendado, sem perder a consulta adquirida**.',
      'Se optar por um horário dentro das próximas **48 horas**, **não será possível reagendar sem perder a consulta**. Se cancelar ou não comparecer ao atendimento, **a consulta será considerada utilizada**.',
    ],
  },
};

const RECOMMENDATION =
  '**Recomendação:** Escolha uma data e horário em que **realmente tenha disponibilidade** para realizar a consulta, especialmente se o atendimento ocorrer nas próximas **48 horas**.';

/**
 * Regras da origem escolhida, mostradas como modal ao abrir a tela.
 *
 * Era um banner fixo no corpo da página até a issue #24, quando o cliente
 * pediu para transformá-lo em modal — "a gente deixa essas telas mais limpas,
 * só com esse aviso roxo fixado direto na tela". Ele abre a cada visita à
 * tela, e não uma vez por sessão: é o que ele pediu literalmente.
 *
 * origin: 'referral' (Encaminhamento, grátis) | 'avulsa' (consulta paga).
 */
export default function BookingRulesAlert({ origin }) {
  const content = CONTENT[origin];
  const [aberto, setAberto] = useState(true);
  const botaoEntendi = useRef(null);

  // Foco no botão assim que a modal abre: é o que um diálogo deve fazer, e é
  // também o que garante que o Esc chegue — sem foco dentro dela, a tecla vai
  // para onde o navegador estiver apontando.
  useEffect(() => {
    if (aberto) botaoEntendi.current?.focus();
  }, [aberto]);

  // Esc fecha, como nas outras modais da seção.
  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = evento => { if (evento.key === 'Escape') setAberto(false); };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto]);

  if (!content || !aberto) return null;

  return (
    <div
      style={MODAL_OVERLAY}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`booking-rules-title-${origin}`}
      onClick={event => { if (event.target === event.currentTarget) setAberto(false); }}
    >
      <div className="card" style={{ ...MODAL_CARD, background: '#fff8e1', border: '1px solid #ffe082' }}>
        {/* O testid fica no corpo, e não no card: é este o elemento que
            carrega o padding contra o qual a issue #7 mede o recuo. */}
        <div data-testid={`booking-rules-alert-${origin}`} style={{ ...MODAL_BODY, color: '#7a5c00' }}>
          {/* O ícone acompanha o título na primeira linha e o corpo começa na
              borda do box: o cliente pediu o texto "sem recuo, como nas outras
              modais normais" (issue #7). */}
          <strong
            id={`booking-rules-title-${origin}`}
            style={{ ...MODAL_TITLE, display: 'flex', alignItems: 'center', gap: '8px', color: '#7a5c00' }}
          >
            <EmojiIcon name="aviso" size={22} />
            {content.title}
          </strong>
          {content.paragraphs.map((text, index) => (
            <p key={index} style={{ ...MODAL_TEXT, color: '#7a5c00' }}>{withEmphasis(text)}</p>
          ))}
          <p style={{ ...MODAL_TEXT, color: '#7a5c00', marginBottom: 0 }}>{withEmphasis(RECOMMENDATION)}</p>
          <div style={MODAL_ACTIONS}>
            <button
              ref={botaoEntendi}
              type="button"
              className="btn btn-primary"
              style={MODAL_BUTTON}
              onClick={() => setAberto(false)}
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
