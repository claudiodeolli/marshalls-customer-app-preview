'use client';

import { TriangleAlert } from 'lucide-react';

// Textos definidos pelo cliente no PDF de regras (issue #2), com os mesmos
// destaques em negrito do documento — ele pediu explicitamente para manter
// ("mantem os negritos ali do texto", issue #5). Os trechos entre ** são
// renderizados em negrito; não reescrever sem conferir o PDF.
const CONTENT = {
  referral: {
    title: 'Importante!',
    paragraphs: [
      'Você poderá **reagendar** esta consulta até **48 horas antes do horário agendado sem perder o encaminhamento**. **Após esse prazo, não será possível reagendar.**',
      'Se optar pelo **cancelamento**, o encaminhamento será encerrado. Para agendar novamente uma consulta com essa especialidade **sem custo**, será necessário passar pelo **Plantão 24h** e obter um novo encaminhamento, caso ainda haja indicação médica.',
    ],
  },
  avulsa: {
    title: 'Lembre-se!',
    paragraphs: [
      'Você poderá **reagendar** ou **cancelar** esta consulta até **48 horas antes do horário agendado**, sem perder o valor pago.',
      'Se optar por um horário dentro das próximas 48 horas, não será possível reagendar ou cancelar a consulta e, caso não seja realizada, ela será considerada utilizada.',
    ],
  },
};

const RECOMMENDATION =
  '**Recomendação:** Escolha uma data e horário em que **realmente tenha disponibilidade** para realizar a consulta, especialmente se o atendimento ocorrer nas próximas 48 horas.';

/** Renderiza os trechos entre ** em negrito, preservando o resto do texto. */
function withEmphasis(text) {
  return text.split('**').map((part, index) => (
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
  ));
}

/** origin: 'referral' (Encaminhamento, grátis) | 'avulsa' (consulta paga). */
export default function BookingRulesAlert({ origin }) {
  const content = CONTENT[origin];
  if (!content) return null;

  return (
    /* O ícone acompanha o título na primeira linha, e o corpo começa na
       borda do box. Antes o container era um flex de duas colunas, o que
       recuava todas as linhas para debaixo do título — o cliente pediu o
       texto "sem recuo, como nas outras modais normais" (issue #7). */
    <div
      data-testid={`booking-rules-alert-${origin}`}
      style={{
        background: '#fff8e1', border: '1px solid #ffe082',
        borderRadius: '8px', padding: '12px 14px', marginBottom: '16px',
        fontSize: '13px', color: '#7a5c00', lineHeight: 1.6,
      }}
    >
      <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <TriangleAlert color="#d4a017" size={18} style={{ flexShrink: 0 }} />
        {content.title}
      </strong>
      {content.paragraphs.map((text, index) => (
        <p key={index} style={{ margin: '0 0 6px' }}>{withEmphasis(text)}</p>
      ))}
      <p style={{ margin: 0 }}>{withEmphasis(RECOMMENDATION)}</p>
    </div>
  );
}
