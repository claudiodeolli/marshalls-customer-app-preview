/* Replica o b-button do BootstrapVue */

import Link from 'next/link';

export default function Button({ variant = 'primary', size, href, target, onClick, block, children, className = '', type = 'button', disabled }) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    className,
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <a href={href} target={target} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
