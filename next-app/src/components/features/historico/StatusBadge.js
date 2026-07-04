const STATUS_BADGE = {
  FINISHED:   { label: 'Finalizado',   cls: 'badge-light-success', color: '#28c76f' },
  UNFINISHED: { label: 'Em Andamento', cls: 'badge-light-warning',  color: '#ff9f43' },
  CANCELLED:  { label: 'Cancelado',    cls: 'badge-light-danger',   color: '#ea5455' },
  CANCELED:   { label: 'Cancelado',    cls: 'badge-light-danger',   color: '#ea5455' },
  SCHEDULED:  { label: 'Agendado',     cls: 'badge-light-primary',  color: '#00cfe8' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status] ?? { label: status, cls: 'badge-light-secondary', color: '#6e6b7b' };
  return <span className={`badge ${cfg.cls}`} style={{ fontWeight: 700, fontSize: '11px' }}>{cfg.label}</span>;
}
