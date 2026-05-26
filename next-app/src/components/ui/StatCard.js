/* Card de estatística (padrão panel-resume) - equivalente ao statCard() do mock-api.js */

import Avatar from './Avatar';
import FeatherIcon from './FeatherIcon';

export default function StatCard({ value, label, icon, variant = 'light-primary' }) {
  return (
    <div className="card mb-1">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div className="truncate">
          <h4 className="mb-25 font-weight-bolder">{value}</h4>
          <span>{label}</span>
        </div>
        <Avatar variant={variant} size={45} rounded icon={icon} />
      </div>
    </div>
  );
}
