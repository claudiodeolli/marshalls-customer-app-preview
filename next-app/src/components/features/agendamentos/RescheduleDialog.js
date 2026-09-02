'use client';

import { withEmphasis } from '@/components/ui/emphasis';
import {
  MODAL_OVERLAY, MODAL_CARD, MODAL_BODY, MODAL_TITLE, MODAL_TEXT, MODAL_ACTIONS, MODAL_BUTTON,
} from '@/components/ui/modalScale';

// Texto do PDF "Regra e BOTÕES de REAGENDAR" (issue #25). O do Encaminhamento
// é dele, palavra por palavra.
//
// O da Avulsa o documento não trouxe — a seção começa em "1. REAGENDAR —
// Consulta por Encaminhamento" e o item 2 não veio. O texto abaixo repete a
// estrutura dele e troca só o que a página 1 do mesmo PDF diz que muda: a
// Avulsa reagendada preserva a consulta adquirida, não o encaminhamento.
// É um exemplo até ele mandar o definitivo.
const CONTEUDO = {
  referral: {
    regra: '48 horas antes do horário agendado, sem perder o Encaminhamento',
  },
  avulsa: {
    regra: '48 horas antes do horário agendado, sem perder a consulta adquirida',
  },
};

function paragrafos({ especialidade, medico, regra }) {
  return [
    `Você está prestes a reagendar a consulta de **${especialidade}** com o(a) Dr(a). **${medico}**.`,
    `O reagendamento é permitido até **${regra}**. Ao continuar, você poderá **escolher uma nova data e horário para esta consulta**.`,
    '**Deseja continuar com o reagendamento?**',
  ];
}

/** appointment: o agendamento que será trocado; origin decide o texto da regra. */
export default function RescheduleDialog({ appointment, onBack, onConfirm }) {
  if (!appointment) return null;

  const origem = appointment.beneficiaryMedicalReferral ? 'referral' : 'avulsa';
  const texto = paragrafos({
    especialidade: appointment.specialty?.name ?? appointment.professional?.specialties?.[0]?.name ?? 'consulta',
    medico: appointment.professional?.name ?? 'profissional',
    regra: CONTEUDO[origem].regra,
  });

  return (
    <div
      style={MODAL_OVERLAY}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reagendar-titulo"
      onClick={evento => { if (evento.target === evento.currentTarget) onBack(); }}
    >
      <div className="card" data-testid="reagendar-confirmacao" style={MODAL_CARD}>
        <div style={MODAL_BODY}>
          <h5 id="reagendar-titulo" style={MODAL_TITLE}>Reagendar consulta?</h5>
          {texto.map((paragrafo, indice) => (
            <p key={indice} style={MODAL_TEXT}>{withEmphasis(paragrafo)}</p>
          ))}
          <div style={MODAL_ACTIONS}>
            <button type="button" className="btn btn-outline-secondary" style={MODAL_BUTTON} onClick={onBack}>
              Voltar
            </button>
            {/* Azul padrão, como ele apontou no PDF. */}
            <button type="button" className="btn btn-primary" style={MODAL_BUTTON} onClick={onConfirm}>
              Reagendar consulta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
