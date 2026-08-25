// Duplicado de agendamentos/page.js de propósito — é uma função pura de 4
// linhas e criar um módulo compartilhado só pra isso não paga o esforço.
function getMinutesUntil(dateStr, timeStr) {
  try {
    const [d, m, y] = (dateStr ?? '').split('/');
    const [h, min] = (timeStr ?? '').split(':');
    const apptTime = new Date(`${y}-${m}-${d}T${h}:${min}:00-03:00`);
    if (isNaN(apptTime.getTime())) return -1;
    return Math.floor((apptTime - Date.now()) / 60000);
  } catch { return -1; }
}

// Regras do cliente (issue #2 no GitHub): o texto do modal depende da
// origem da consulta — Encaminhamento sempre encerra o encaminhamento ao
// cancelar; Avulsa preserva o valor pago só se cancelada com 48h+ de
// antecedência, senão a consulta é considerada utilizada.
function getCancelWarning(appointment) {
  const isEncaminhamento = Boolean(appointment.beneficiaryMedicalReferral);
  if (isEncaminhamento) {
    return 'Ao cancelar esta consulta, o encaminhamento utilizado será encerrado e não poderá ser reutilizado. Para agendar novamente uma consulta com esta especialidade, será necessário passar pelo Plantão 24h e obter um novo encaminhamento, caso ainda haja indicação médica.';
  }

  const minutesUntil = getMinutesUntil(appointment.detail?.date, appointment.detail?.from);
  const within48h = minutesUntil >= 0 && minutesUntil < 48 * 60;
  if (within48h) {
    return 'Esta consulta está a menos de 48 horas do horário agendado. Conforme informado antes da compra, se optar pelo cancelamento, a consulta será considerada utilizada e o valor pago não será reembolsado. Também não será possível escolher uma nova data e horário sem custo adicional.';
  }
  return 'Ao cancelar esta consulta com mais de 48 horas de antecedência, você poderá escolher depois uma nova data e horário para essa especialidade, sem custo adicional.';
}

export default function CancelDialog({ open, appointment, loading, onClose, onConfirm }) {
  if (!open || !appointment) return null;
  const specialtyName = appointment.professional?.specialties?.[0]?.name || '';
  const doctorName = appointment.professional?.name || '';
  const warning = getCancelWarning(appointment);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="card mb-0 _modal-enter" style={{ width: '400px', maxWidth: '90vw', borderRadius: '12px' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Cancelar consulta?</h5>
          <p style={{ color: '#333', marginBottom: '0.75rem', fontSize: '14px' }}>
            Você está prestes a cancelar o agendamento de <strong>{specialtyName}</strong> com o(a) Dr(a). <strong>{doctorName}</strong>.
          </p>
          <p style={{ color: '#5e5873', marginBottom: '1.5rem', fontSize: '13px' }}>
            {warning}
          </p>
          <p style={{ color: '#333', marginBottom: '1rem', fontSize: '14px', fontWeight: 600 }}>
            Deseja continuar com o cancelamento?
          </p>
          <div className="d-flex justify-content-end" style={{ gap: '8px' }}>
            <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Voltar</button>
            <button className="btn btn-danger btn-sm" disabled={loading} onClick={onConfirm}>
              {loading ? 'Aguarde...' : 'Cancelar consulta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
