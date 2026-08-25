// UNFINISHED é "não realizada" (usuário não compareceu) — é o significado
// que a tela Agendamentos já dá a esse valor. Aqui ele estava rotulado como
// "em andamento", que na verdade é o PENDING. Cinza igual ao de Agendamentos,
// conforme o PDF pede ("usar a mesma cor cinza de tag da tela HISTÓRICO").
const STATUS_BADGE = {
  FINISHED:   { label: 'Consulta finalizada',    color: '#28c76f' },
  PENDING:    { label: 'Consulta pendente',      color: '#ff9f43' },
  SCHEDULED:  { label: 'Consulta agendada',      color: '#00cfe8' },
  CANCELLED:  { label: 'Consulta cancelada',     color: '#ea5455' },
  CANCELED:   { label: 'Consulta cancelada',     color: '#ea5455' },
  UNFINISHED: { label: 'Consulta não realizada', color: '#82868b' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status] ?? { label: status, color: '#82868b' };
  return (
    <span className="hist-status-badge" style={{
      display: 'inline-block',
      padding: '3px 10px',
      border: `1px solid ${cfg.color}`,
      borderRadius: '20px',
      color: cfg.color,
      fontSize: '11px',
      fontWeight: 700,
      lineHeight: 1.4,
      background: `${cfg.color}1f`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}
