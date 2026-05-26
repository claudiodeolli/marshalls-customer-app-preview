/* Replica o b-alert do BootstrapVue */

export default function Alert({ variant = 'info', show = true, children, className = '' }) {
  if (!show) return null;
  return (
    <div className={`alert alert-${variant} ${className}`} role="alert">
      {children}
    </div>
  );
}
