/* Replica o b-badge do BootstrapVue com as classes do Vuexy */

export default function Badge({ variant = 'primary', pill = false, children, className = '' }) {
  return (
    <span className={`badge ${pill ? 'badge-pill' : ''} badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

/* Mapeia status de API para variante de badge */
export function statusBadge(status) {
  const map = {
    paid:      { variant: 'light-success', label: 'Pago' },
    pending:   { variant: 'light-warning', label: 'Pendente' },
    overdue:   { variant: 'light-danger',  label: 'Atrasado' },
    sent:      { variant: 'light-info',    label: 'Enviado' },
    canceled:  { variant: 'light-secondary', label: 'Cancelado' },
  };
  const m = map[status] || { variant: 'light-secondary', label: status };
  return <Badge variant={m.variant} pill>{m.label}</Badge>;
}
