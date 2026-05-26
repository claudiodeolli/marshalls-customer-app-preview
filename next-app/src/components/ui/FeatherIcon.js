'use client';

import * as Icons from 'react-feather';

/* Wrapper em torno do react-feather que aceita nome de ícone como string,
   replicando o comportamento do <feather-icon icon="..." /> do Vue original. */
export default function FeatherIcon({ icon, size = 14, className = '', style }) {
  const name = icon
    .replace(/Icon$/, '')
    .replace(/([a-z])([A-Z])/g, '$1$2');

  const Icon = Icons[name] || Icons[icon] || null;
  if (!Icon) return null;
  return <Icon size={size} className={className} style={style} />;
}
