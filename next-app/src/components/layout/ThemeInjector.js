'use client';

import { useEffect } from 'react';

const THEMES = {
  '1': ['#0052FF', '#00B7FF'],
  '2': ['#003DFF', '#00E5FF'],
  '3': ['#0052FF', '#00E5FF'],
  '4': ['#0A1F5C', '#00B7FF'],
  '5': ['#0A1F5C', '#2E5FE5'],
  '6': ['#0A1F5C', '#4F8FFF'],
  '7': ['#0A1F5C', '#00C8FF'],
  '8': ['#0A1F5C', '#00E5FF'],
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ThemeInjector() {
  useEffect(() => {
    const themeId = localStorage.getItem('ctTheme') || '1';
    const colors = THEMES[themeId] || THEMES['1'];
    const [c1, c2] = colors;
    const shadow = hexToRgba('#0052FF', 0.6);

    const css = [
      /* Botões primários */
      `[dir] .btn-primary { background: linear-gradient(135deg,${c1} 0%,${c2} 100%) !important; border: none !important; }`,
      `[dir] .btn-primary.active,[dir] .btn-primary:active,[dir] .btn-primary:focus { background: linear-gradient(135deg,${c1} 0%,${c2} 100%) !important; border: none !important; }`,
      `[dir] .btn-primary:hover:not(.disabled):not(:disabled) { box-shadow: 0 8px 25px -8px #0052FF !important; }`,
      /* Item ativo do sidebar (sidebar expandido) */
      `[dir] .main-menu.menu-light .navigation>li.active>a { box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      `[dir=ltr] .main-menu.menu-light .navigation>li.active>a { background: linear-gradient(135deg,${c1} 0%,${c2} 100%) !important; }`,
      `[dir=rtl] .main-menu.menu-light .navigation>li.active>a { background: linear-gradient(-135deg,${c1} 0%,${c2} 100%) !important; }`,
      `[dir=ltr] .main-menu.menu-light .navigation>li ul .active { background: linear-gradient(135deg,${c1} 0%,${c2} 100%) !important; }`,
      /* Item ativo do sidebar (sidebar recolhido) */
      `[dir] .vertical-layout.vertical-menu-modern.menu-collapsed .main-menu:not(.expanded) .navigation>li.active>a { background: linear-gradient(118deg,${c1},${c2}) !important; box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      /* Botão Plantão 24h */
      `[data-plantao-shortcut]:not(.plantao-inactive) > a { background: linear-gradient(135deg,${c1} 0%,${c2} 100%) !important; box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      /* Card congratulations */
      `[dir=ltr] .card-congratulations { background: linear-gradient(135deg,${c1} 0%,${c2} 100%) !important; }`,
      /* Elementos com gradiente primário inline (avatar, botão Filtrar, etc.) */
      `._ct-gradient { background: linear-gradient(135deg,${c1} 0%,${c2} 100%) !important; }`,
      `.navbar-header { border-bottom-right-radius: .178rem !important; }`,
    ].join('\n');

    let el = document.getElementById('ct-theme');
    if (!el) {
      el = document.createElement('style');
      el.id = 'ct-theme';
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, []);

  return null;
}
