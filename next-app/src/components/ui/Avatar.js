/* Replica o componente b-avatar do BootstrapVue usando as classes CSS do Vuexy.
   Suporta texto (initial), ícone (FeatherIcon) e variantes de cor. */

import FeatherIcon from './FeatherIcon';

export default function Avatar({ variant = 'light-primary', size = 38, text, icon, rounded = '', className = '', style }) {
  const shapeClass = rounded === 'circle' ? 'rounded-circle'
    : rounded === '' || rounded === true ? 'rounded'
    : '';

  const px = typeof size === 'number' ? size : parseInt(size, 10);
  const iconSize = Math.round(px * 0.47);

  return (
    <span
      className={`b-avatar ${variant ? 'badge-' + variant : ''} ${shapeClass} ${className}`}
      style={{ width: px + 'px', height: px + 'px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}
    >
      {text && (
        <span className="b-avatar-text">
          <span>{text}</span>
        </span>
      )}
      {icon && !text && (
        <span className="b-avatar-icon">
          <FeatherIcon icon={icon} size={iconSize} />
        </span>
      )}
    </span>
  );
}
