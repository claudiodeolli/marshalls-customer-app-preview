/* Itens do menu lateral com categorias - espelha a estrutura do app.js original */


export const menuItems = [
  { header: 'Assinante' },
  {
    title: 'Encaminhamentos',
    href: '/encaminhamentos',
    icon: {
      viewBox: '0 0 21 21',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<rect x="1" y="7" width="18" height="13" rx="2" ry="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h1A1.5 1.5 0 0 1 12 5.5V7"/><path d="M6 11v4"/><path d="M4 13h4"/><path d="M11 12h5"/><path d="M11 16h3"/>',
    },
  },
  {
    title: 'Histórico',
    href: '/historico',
    icon: {
      viewBox: '2 2 20 20',
      fill: 'currentColor',
      stroke: 'none',
      strokeWidth: '0',
      inner: '<path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>',
    },
  },
  {
    title: 'Agendamentos',
    href: '/agendamentos',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="7.35" y="13.35" width="1.3" height="1.3" rx="0.28" ry="0.28" fill="currentColor" stroke="none"/><rect x="11.35" y="13.35" width="1.3" height="1.3" rx="0.28" ry="0.28" fill="currentColor" stroke="none"/><rect x="15.35" y="13.35" width="1.3" height="1.3" rx="0.28" ry="0.28" fill="currentColor" stroke="none"/><rect x="7.35" y="17.1" width="1.3" height="1.3" rx="0.28" ry="0.28" fill="currentColor" stroke="none"/><rect x="11.35" y="17.1" width="1.3" height="1.3" rx="0.28" ry="0.28" fill="currentColor" stroke="none"/><rect x="15.35" y="17.1" width="1.3" height="1.3" rx="0.28" ry="0.28" fill="currentColor" stroke="none"/>',
    },
  },
  {
    title: 'Meus dados',
    href: '/meus-dados',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    },
  },

  { header: 'Benefícios' },
  {
    title: 'Meu Clube',
    href: '/meu-clube',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
    },
  },

  { header: 'Suporte' },
  {
    title: 'Canais de contato',
    href: '/canais-de-contato',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 5.9 5.9l.91-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.27 16z"/>',
    },
  },

  { header: 'Financeiro' },
  {
    title: 'Minha conta',
    href: '/minha-conta',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    },
  },

  { header: 'Segurança' },
  {
    title: 'Mudar minha senha',
    href: '/mudar-senha',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      inner: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    },
  },
];

/* Ícone do Plantão 24h - aparece no header do sidebar, não na lista */
export const plantaoItem = {
  title: 'Plantão 24h',
  href: '/plantao',
  icon: {
    viewBox: '0 0 500 500',
    fill: 'currentColor',
    stroke: 'currentColor',
    strokeWidth: '30',
    inner: '<path fill="currentColor" fill-rule="evenodd" stroke="currentColor" stroke-width="30" stroke-linejoin="round" d="M 190,55 L 310,55 A 25,25 0 0 1 335,80 L 335,145 A 20,20 0 0 0 355,165 L 420,165 A 25,25 0 0 1 445,190 L 445,310 A 25,25 0 0 1 420,335 L 355,335 A 20,20 0 0 0 335,355 L 335,420 A 25,25 0 0 1 310,445 L 190,445 A 25,25 0 0 1 165,420 L 165,355 A 20,20 0 0 0 145,335 L 80,335 A 25,25 0 0 1 55,310 L 55,190 A 25,25 0 0 1 80,165 L 145,165 A 20,20 0 0 0 165,145 L 165,80 A 25,25 0 0 1 190,55 Z M 208,73 L 292,73 A 25,25 0 0 1 317,98 L 317,163 A 20,20 0 0 0 337,183 L 402,183 A 25,25 0 0 1 427,208 L 427,292 A 25,25 0 0 1 402,317 L 337,317 A 20,20 0 0 0 317,337 L 317,402 A 25,25 0 0 1 292,427 L 208,427 A 25,25 0 0 1 183,402 L 183,337 A 20,20 0 0 0 163,317 L 98,317 A 25,25 0 0 1 73,292 L 73,208 A 25,25 0 0 1 98,183 L 163,183 A 20,20 0 0 0 183,163 L 183,98 A 25,25 0 0 1 208,73 Z" />',
  },
};
