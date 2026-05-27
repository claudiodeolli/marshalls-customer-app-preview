'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { menuItems, plantaoItem } from '@/data/menuItems';

/* SVG inline montado a partir da definição de ícone do menuItems.js */
function MenuIcon({ def, hasDot = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={def.viewBox}
      fill={def.fill ?? 'none'}
      stroke={def.stroke ?? 'currentColor'}
      strokeWidth={def.strokeWidth ?? '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{
        __html: hasDot
          ? def.inner + '<circle cx="250" cy="250" r="75" class="plantao-svg-dot" />'
          : def.inner,
      }}
    />
  );
}

export default function MainMenu({ collapsed, onToggleCollapse, onOverlayClick }) {
  const pathname = usePathname();
  const [tooltip, setTooltip] = useState({ visible: false, text: '', top: 0, left: 0 });
  const [capTop, setCapTop] = useState(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    const update = () => {
      const content = menuRef.current?.querySelector('.main-menu-content');
      if (content) setCapTop(content.offsetTop - 15);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* Plantão ativo se nenhum item de menu está ativo */
  const p = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const anyActive = menuItems.some(item => !item.header && (p === item.href || p.startsWith(item.href + '/')));
  const plantaoActive = p === plantaoItem.href && !anyActive;
  const plantaoInactive = anyActive;

  function handleMouseOver(e) {
    if (!collapsed) { setTooltip(t => ({ ...t, visible: false })); return; }
    const li = e.target.closest?.('.navigation > li:not(.navigation-header)');
    if (!li) { setTooltip(t => ({ ...t, visible: false })); return; }
    const span = li.querySelector('a .menu-title');
    if (!span) return;
    const rect = li.getBoundingClientRect();
    setTooltip({ visible: true, text: span.textContent.trim(), top: rect.top + rect.height / 2, left: rect.right + 10 });
  }

  function handleMouseLeave() {
    setTooltip(t => ({ ...t, visible: false }));
  }

  return (
    <>
      <div
        className="main-menu menu-fixed menu-light menu-accordion menu-shadow"
        data-scroll-to-active="true"
        ref={menuRef}
      >
        {/* ── Header do sidebar com logo e Plantão 24h ── */}
        <div className="navbar-header expanded">
          <ul className="nav navbar-nav flex-row">
            <li className="nav-item mr-auto">
              <Link className="navbar-brand" href="/painel">
                <span className="brand-logo">
                  <img
                    src={`${(process.env.NEXT_PUBLIC_BASE_PATH ?? '')}/img/MarshallsMed%20novo2_%20Med%20maior.png`}
                    alt="Logo"
                    className="_logo-full"
                    style={{ width: '149.98px', height: '46.55px', objectFit: 'contain' }}
                  />
                </span>
              </Link>
              {/* Logo pequeno exibido quando o sidebar está recolhido */}
              <img
                className="_logo-collapsed"
                src={`${(process.env.NEXT_PUBLIC_BASE_PATH ?? '')}/img/MarshallsMed%20novo2_%20Med%20menor.png`}
                alt="Logo"
              />
            </li>
            <li className="nav-item nav-toggle">
              <a
                className="nav-link modern-nav-toggle pr-0"
                onClick={e => { e.preventDefault(); onToggleCollapse(); }}
                style={{ cursor: 'pointer' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="d-block d-xl-none feather feather-x font-medium-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </a>
            </li>
          </ul>

          {/* ── Plantão 24h - shortcut no header do sidebar ── */}
          <ul
            className={`${plantaoInactive ? 'plantao-inactive' : ''}`}
            data-plantao-shortcut="1"
            style={{ listStyle: 'none', margin: '0', marginTop: '0.5rem', padding: '0', paddingTop: '1rem' }}
          >
            <Link href={plantaoItem.href}>
              <MenuIcon def={plantaoItem.icon} hasDot />
              <span className="menu-title">{plantaoItem.title}</span>
            </Link>
          </ul>
        </div>

        <div className="shadow-bottom" />

        {/* ── Lista de itens do menu ── */}
        <PerfectScrollbar
          className="main-menu-content"
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <ul className="navigation navigation-main" id="main-menu-navigation">
            {menuItems.map((item, idx) => {
              if (item.header) {
                return (
                  <li key={`header-${idx}`} className="navigation-header text-truncate">
                    <span>{item.header}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                    </svg>
                  </li>
                );
              }
              const isActive = p === item.href || p.startsWith(item.href + '/');
              return (
                <li key={item.href} className={`nav-item${isActive ? ' active' : ''}`}>
                  <Link href={item.href} className={isActive ? 'active' : ''} aria-current={isActive ? 'page' : undefined}>
                    <MenuIcon def={item.icon} />
                    <span className="menu-title">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </PerfectScrollbar>

        {/* ── Decorative squares above ps__rail-y ── */}
        {capTop !== null && <>
          <div className="_sb-sq _sb-sq--bg" style={{ top: capTop }} />
          <div className="_sb-sq _sb-sq--fg" style={{ top: capTop }} />
        </>}
      </div>

      {/* ── Floating tooltip para sidebar recolhida ── */}
      <div
        id="_sb-tip"
        style={{
          position: 'fixed',
          zIndex: 99999,
          background: 'rgba(22,33,52,.93)',
          color: '#fff',
          padding: '5px 13px',
          borderRadius: '7px',
          fontSize: '.78rem',
          fontWeight: 600,
          letterSpacing: '.025em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: tooltip.visible ? 1 : 0,
          transform: 'translateY(-50%)',
          transition: 'opacity .15s ease',
          boxShadow: '0 4px 18px rgba(0,0,0,.22)',
          fontFamily: 'Montserrat, Helvetica, Arial, serif',
          top: tooltip.top,
          left: tooltip.left,
        }}
      >
        {tooltip.text}
      </div>

      {/* ── Overlay para mobile ── */}
      <div className="sidenav-overlay" onClick={onOverlayClick} />
      <div className="drag-target" />
    </>
  );
}
