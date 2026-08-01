const STATUS_BADGE = {
  FINISHED:   { label: 'Consulta finalizada', color: '#28c76f' },
  UNFINISHED: { label: 'Consulta em andamento', color: '#ff9f43' },
  CANCELLED:  { label: 'Consulta cancelada',  color: '#ea5455' },
  CANCELED:   { label: 'Consulta cancelada',  color: '#ea5455' },
  SCHEDULED:  { label: 'Consulta agendada',   color: '#00cfe8' },
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
