'use client';

import { useEffect } from 'react';

const C1 = '#003DFF';
const C2 = '#00E5FF';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ThemeInjector() {
  useEffect(() => {
    const shadow = hexToRgba('#0052FF', 0.6);

    const css = [
      `.btn { transition: box-shadow 150ms ease !important; }`,
      `[dir] .btn-primary { background: linear-gradient(135deg,${C1} 0%,${C2} 100%) !important; border: none !important; }`,
      `[dir] .btn-primary.active,[dir] .btn-primary:active,[dir] .btn-primary:focus { background: linear-gradient(135deg,${C1} 0%,${C2} 100%) !important; border: none !important; }`,
      `[dir] .btn-primary:hover:not(.disabled):not(:disabled) { box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      `[dir] .btn-outline-primary:hover:not(.disabled):not(:disabled) { box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      `[dir] .main-menu.menu-light .navigation>li.active>a { box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      `[dir=ltr] .main-menu.menu-light .navigation>li.active>a { background: linear-gradient(135deg,${C1} 0%,${C2} 100%) !important; }`,
      `[dir=rtl] .main-menu.menu-light .navigation>li.active>a { background: linear-gradient(-135deg,${C1} 0%,${C2} 100%) !important; }`,
      `[dir=ltr] .main-menu.menu-light .navigation>li ul .active { background: linear-gradient(135deg,${C1} 0%,${C2} 100%) !important; }`,
      `[dir] .vertical-layout.vertical-menu-modern.menu-collapsed .main-menu:not(.expanded) .navigation>li.active>a { background: linear-gradient(118deg,${C1},${C2}) !important; box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      `[data-plantao-shortcut]:not(.plantao-inactive) > a { background: linear-gradient(135deg,${C1} 0%,${C2} 100%) !important; box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      `[dir=ltr] .card-congratulations { background: linear-gradient(135deg,${C1} 0%,${C2} 100%) !important; }`,
      `._ct-gradient { background: linear-gradient(135deg,${C1} 0%,${C2} 100%) !important; transition: box-shadow 150ms ease !important; }`,
      `._ct-gradient:hover:not(:disabled) { box-shadow: 0 0 10px 1px ${shadow} !important; }`,
      `.nav-item-user-btn--open ._ct-gradient:hover:not(:disabled) { box-shadow: none !important; }`,
      `.nav-item-user-btn--open:has(._sair-link:hover) ._ct-gradient { box-shadow: 0 0 10px 1px ${shadow} !important; }`,
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
