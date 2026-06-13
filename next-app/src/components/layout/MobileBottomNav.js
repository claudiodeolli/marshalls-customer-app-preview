'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { plantaoItem } from '@/data/menuItems';

const ITEMS = [
  {
    label: 'Plantão 24h',
    href: '/plantao',
    icon: plantaoItem.icon,
  },
  {
    label: 'Clube',
    href: '/meu-clube',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      stroke: 'none',
      strokeWidth: '0',
      inner: '<path fill="currentColor" d="m2 22 14-5-9-9zm10.35-5.82L5.3 18.7l2.52-7.05zm2.18-3.65 5.59-5.59c.49-.49 1.28-.49 1.77 0l.59.59 1.06-1.06-.59-.59c-1.07-1.07-2.82-1.07-3.89 0l-5.59 5.59zm-4.47-5.65-.59.59 1.06 1.06.59-.59c1.07-1.07 1.07-2.82 0-3.89l-.59-.59-1.06 1.07.59.59c.48.48.48 1.28 0 1.76m7 5-1.59 1.59 1.06 1.06 1.59-1.59c.49-.49 1.28-.49 1.77 0l1.61 1.61 1.06-1.06-1.61-1.61c-1.08-1.07-2.82-1.07-3.89 0m-2-6-3.59 3.59 1.06 1.06 3.59-3.59c1.07-1.07 1.07-2.82 0-3.89l-1.59-1.59-1.06 1.06 1.59 1.59c.48.49.48 1.29 0 1.77"/>',
    },
  },
  {
    label: 'Suporte',
    href: '/canais-de-contato',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 5.9 5.9l.91-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.27 16z"/>',
    },
  },
  {
    label: 'Perfil',
    href: '/meus-dados',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    },
  },
];

export default function MobileBottomNav({ onNavClick }) {
  const pathname = usePathname();
  const p = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  return (
    <nav className="_mob-nav">
      {ITEMS.map(item => {
        const active = p === item.href || p.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`_mob-nav__item${active ? ' _mob-nav__item--active' : ''}`}
            onClick={onNavClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={item.icon.viewBox}
              fill={item.icon.fill ?? 'none'}
              stroke={item.icon.stroke ?? 'currentColor'}
              strokeWidth={item.icon.strokeWidth ?? '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: item.icon.inner }}
            />
            <span className="_mob-nav__item__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
