'use client';

import { TriangleAlert } from 'lucide-react';

// Textos definidos pelo cliente no PDF de regras (issue #2) — copiados
// literalmente, não parafrasear ao mexer aqui.
const CONTENT = {
  referral: {
    title: 'Importante!',
    paragraphs: [
      'Você poderá reagendar esta consulta até 48 horas antes do horário agendado sem perder o encaminhamento. Após esse prazo, não será possível reagendar.',
      'Se optar pelo cancelamento, o encaminhamento será encerrado. Para agendar novamente uma consulta com essa especialidade sem custo, será necessário passar pelo Plantão 24h e obter um novo encaminhamento, caso ainda haja indicação médica.',
    ],
  },
  avulsa: {
    title: 'Lembre-se!',
    paragraphs: [
      'Você poderá reagendar ou cancelar esta consulta até 48 horas antes do horário agendado, sem perder o valor pago.',
      'Se optar por um horário dentro das próximas 48 horas, não será possível reagendar ou cancelar a consulta e, caso não seja realizada, ela será considerada utilizada.',
    ],
  },
};

const RECOMMENDATION =
  'Recomendação: Escolha uma data e horário em que realmente tenha disponibilidade para realizar a consulta, especialmente se o atendimento ocorrer nas próximas 48 horas.';

/** origin: 'referral' (Encaminhamento, grátis) | 'avulsa' (consulta paga). */
export default function BookingRulesAlert({ origin }) {
  const content = CONTENT[origin];
  if (!content) return null;

  return (
    <div
      data-testid={`booking-rules-alert-${origin}`}
      style={{
        display: 'flex', gap: '10px', alignItems: 'flex-start',
        background: '#fff8e1', border: '1px solid #ffe082',
        borderRadius: '8px', padding: '12px 14px', marginBottom: '16px',
        fontSize: '13px', color: '#7a5c00',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: '1px' }}>
        <TriangleAlert color="#d4a017" size={18} />
      </span>
      <div>
        <strong style={{ display: 'block', marginBottom: '6px' }}>{content.title}</strong>
        {content.paragraphs.map((text, i) => (
          <p key={i} style={{ margin: '0 0 6px' }}>{text}</p>
        ))}
        <p style={{ margin: 0 }}>{RECOMMENDATION}</p>
      </div>
    </div>
  );
}
