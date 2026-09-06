import {
  MODAL_OVERLAY, MODAL_CARD, MODAL_BODY, MODAL_TITLE, MODAL_TEXT, MODAL_TEXT_MUTED,
  MODAL_ACTIONS, MODAL_BUTTON,
} from '@/components/ui/modalScale';
import { withEmphasis } from '@/components/ui/emphasis';
import { getMinutesUntilStart } from '@/lib/appointmentTime';

// Regras do cliente (issue #2 no GitHub): o texto do modal depende da
// origem da consulta — Encaminhamento sempre encerra o encaminhamento ao
// cancelar; Avulsa preserva o valor pago só se cancelada com 48h+ de
// antecedência, senão a consulta é considerada utilizada.
//
// Cada cenário devolve uma lista de parágrafos, não um bloco corrido: o
// cliente mandou os três prints com o texto "separadinho" e com os negritos
// marcados (issue #9). Os trechos entre ** viram negrito na renderização.
function getCancelWarning(appointment) {
  const isEncaminhamento = Boolean(appointment.beneficiaryMedicalReferral);
  if (isEncaminhamento) {
    return [
      'Ao cancelar esta consulta, **o encaminhamento utilizado será encerrado e não poderá ser reutilizado**.',
      'Para agendar novamente uma consulta com esta especialidade, será necessário passar pelo **Plantão 24h** e obter um novo encaminhamento, caso ainda haja indicação médica.',
    ];
  }

  const minutesUntil = getMinutesUntilStart(appointment);
  const within48h = minutesUntil >= 0 && minutesUntil < 48 * 60;
  if (within48h) {
    return [
      'Esta consulta está a menos de **48 horas do horário agendado**. Conforme informado antes da compra, se optar pelo cancelamento agora, **a consulta será considerada utilizada e o valor pago não será reembolsado**. Também não será possível escolher uma nova data e horário sem custo adicional.',
    ];
  }
  return [
    'Ao cancelar esta consulta com mais de **48 horas de antecedência**, você poderá **escolher depois uma nova data e horário para essa especialidade, sem custo adicional**.',
  ];
}

export default function CancelDialog({ open, appointment, loading, onClose, onConfirm }) {
  if (!open || !appointment) return null;
  const specialtyName = appointment.professional?.specialties?.[0]?.name || '';
  const doctorName = appointment.professional?.name || '';
  const warning = getCancelWarning(appointment);
  return (
    <div style={{ ...MODAL_OVERLAY, zIndex: 9998 }}>
      <div className="card mb-0 _modal-enter" style={MODAL_CARD}>
        <div className="card-body" style={MODAL_BODY}>
          <h5 style={MODAL_TITLE}>Cancelar consulta?</h5>
          <p style={{ ...MODAL_TEXT, marginBottom: '0.75rem' }}>
            Você está prestes a cancelar o agendamento de <strong>{specialtyName}</strong> com o(a) Dr(a). <strong>{doctorName}</strong>.
          </p>
          {warning.map((paragrafo, index) => (
            <p key={index} style={{ ...MODAL_TEXT_MUTED, marginBottom: '1rem' }}>
              {withEmphasis(paragrafo)}
            </p>
          ))}
          <p style={{ ...MODAL_TEXT, fontWeight: 700, margin: 0 }}>
            Deseja continuar com o cancelamento?
          </p>
          <div style={MODAL_ACTIONS}>
            <button className="btn btn-outline-secondary" style={MODAL_BUTTON} onClick={onClose}>Voltar</button>
            <button className="btn btn-danger" style={MODAL_BUTTON} disabled={loading} onClick={onConfirm}>
              {loading ? 'Aguarde...' : 'Cancelar consulta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
