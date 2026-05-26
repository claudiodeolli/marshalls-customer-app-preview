'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import MainMenu from './MainMenu';
import Navbar from './Navbar';
import { getRouteConfig } from '@/data/routeConfig';
import { menuItems, plantaoItem } from '@/data/menuItems';

/* Ícone feather para o breadcrumb */
function BreadcrumbIcon({ activeHref }) {
  const activeItem =
    menuItems.find(item => !item.header && (activeHref === item.href || activeHref.startsWith(item.href + '/'))) ||
    (activeHref === plantaoItem.href ? plantaoItem : null);
  if (!activeItem) return null;
  const def = activeItem.icon;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="feather align-text-top _bc-custom"
      viewBox={def.viewBox}
      fill={def.fill ?? 'none'}
      stroke={def.stroke ?? 'currentColor'}
      strokeWidth={def.strokeWidth ?? '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
      dangerouslySetInnerHTML={{ __html: def.inner }}
    />
  );
}

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const routeCfg = getRouteConfig(pathname);

  /* Sincroniza classes no body (requeridas pelo CSS do Vuexy) */
  useEffect(() => {
    const body = document.body;
    body.classList.add(
      'vertical-layout',
      'vertical-menu-modern',
      'navbar-floating',
      'footer-static',
      '2-columns',
      'menu-expanded'
    );
    return () => {
      body.classList.remove('vertical-layout', 'vertical-menu-modern', 'navbar-floating', 'footer-static', '2-columns', 'menu-expanded', 'menu-collapsed', 'menu-open');
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (collapsed) {
      body.classList.add('menu-collapsed');
      body.classList.remove('menu-expanded');
    } else {
      body.classList.remove('menu-collapsed');
      body.classList.add('menu-expanded');
    }
  }, [collapsed]);

  useEffect(() => {
    const body = document.body;
    if (mobileOpen) {
      body.classList.add('menu-open');
    } else {
      body.classList.remove('menu-open');
    }
  }, [mobileOpen]);

  /* Fecha o menu mobile ao mudar de página */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleHamburger() {
    if (window.innerWidth >= 1200) {
      setCollapsed(c => !c);
    } else {
      setMobileOpen(o => !o);
    }
  }

  return (
    <div
      className={`vertical-layout vertical-menu-modern${collapsed ? ' menu-collapsed' : ' menu-expanded'}${mobileOpen ? ' menu-open' : ''} menu-light menu-accordion menu-shadow`}
      dir="ltr"
    >
      {/* ── Sidebar ── */}
      <MainMenu
        collapsed={collapsed}
        onToggleCollapse={handleHamburger}
        onOverlayClick={() => setMobileOpen(false)}
      />

      {/* ── Barra de navegação superior ── */}
      <Navbar onHamburgerClick={handleHamburger} />

      {/* ── Área de conteúdo principal ── */}
      <div className="app-content content">
        <div className="content-overlay" />
        <div className="header-navbar-shadow" />
        <div className="content-wrapper">

          {/* Cabeçalho da página com título e breadcrumb */}
          <div className="content-header row">
            <div className="content-header-left col-md-9 col-12 mb-2">
              <div className="row breadcrumbs-top">
                <div className="col-12">
                  <h2 className="content-header-title float-left pr-1 mb-0">
                    {routeCfg.pageTitle}
                  </h2>
                  <div className="breadcrumb-wrapper">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link href="/painel">
                          <BreadcrumbIcon activeHref={pathname} />
                        </Link>
                      </li>
                      {routeCfg.breadcrumb.map((crumb, i) => (
                        <li key={i} className={`breadcrumb-item${crumb.active ? ' active' : ''}`}>
                          {crumb.href ? <Link href={crumb.href}>{crumb.text}</Link> : crumb.text}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo da página */}
          <div className="content-body" key={pathname}>
            {children}
          </div>

        </div>
      </div>

      {/* ── Faixa inferior ── */}
      <div style={{ height: '5px', background: 'linear-gradient(90deg,#4a90d9,rgba(74,144,217,.3),#4a90d9)', width: '100%', display: 'block', borderRadius: '2px' }} />
    </div>
  );
}
