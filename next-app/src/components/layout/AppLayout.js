'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import MainMenu from './MainMenu';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import { getRouteConfig } from '@/data/routeConfig';
import { menuItems, plantaoItem } from '@/data/menuItems';

/* Ícone feather para o breadcrumb */
function BreadcrumbIcon({ activeHref }) {
  const href = activeHref === '/' ? '/' : activeHref.replace(/\/$/, '');
  const activeItem =
    menuItems.find(item => !item.header && (href === item.href || href.startsWith(item.href + '/'))) ||
    (href === plantaoItem.href ? plantaoItem : null);
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

  const mobileOpenRef  = useRef(false);
  const pathnameRef = useRef(pathname);
  const cloneTimerRef = useRef(null);
  const bodyTimerRef = useRef(null);

  useEffect(() => { mobileOpenRef.current = mobileOpen; }, [mobileOpen]);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  /* Adapta o sidebar dinamicamente ao redimensionar a janela */
  useEffect(() => {
    const handleResize = () => {
      const menu = document.querySelector('.main-menu');
      if (!menu) return;
      if (window.innerWidth >= 1200) {
        menu.style.transform = '';
        if (mobileOpenRef.current) setMobileOpen(false);
      } else {
        if (!mobileOpenRef.current) menu.style.transform = 'translateX(-300px)';
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const routeCfg = getRouteConfig(pathname);

  /* Transição zoom-fade via clone DOM (out-in) */
  useEffect(() => {
    const handleNavClick = (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || /^(https?:)?\/\/|^#|^mailto:|^tel:/.test(href)) return;

      const norm = s => s === '/' ? '/' : s.replace(/\/$/, '');
      if (norm(href) === norm(pathnameRef.current)) return;

      const cb = document.querySelector('.content-body');
      if (!cb) return;

      const rect = cb.getBoundingClientRect();
      const clone = cb.cloneNode(true);

      Object.assign(clone.style, {
        position: 'fixed',
        top: rect.top + 'px',
        left: rect.left + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
        margin: '0',
        zIndex: window.innerWidth < 1200 ? '1000' : '9999',
        pointerEvents: 'none',
        overflow: 'hidden',
        animation: 'zoom-fade-out-opacity .28s ease-in-out forwards, zoom-fade-out-scale .35s ease forwards',
      });

      document.body.appendChild(clone);
      document.body.classList.add('_page-leaving');

      clearTimeout(cloneTimerRef.current);
      cloneTimerRef.current = setTimeout(() => {
        clone.parentNode?.removeChild(clone);
      }, 360);

      clearTimeout(bodyTimerRef.current);
      bodyTimerRef.current = setTimeout(() => {
        document.body.classList.remove('_page-leaving');
      }, 720);
    };

    document.addEventListener('click', handleNavClick, true);
    return () => {
      document.removeEventListener('click', handleNavClick, true);
      clearTimeout(cloneTimerRef.current);
      clearTimeout(bodyTimerRef.current);
      document.body.classList.remove('_page-leaving');
    };
  }, []);

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
    if (window.innerWidth < 1200) {
      const menu = document.querySelector('.main-menu');
      if (menu) menu.style.transform = 'translateX(-300px)';
    }
  }, [pathname]);

  function closeMobileMenu() {
    setMobileOpen(false);
    if (window.innerWidth < 1200) {
      const menu = document.querySelector('.main-menu');
      if (menu) menu.style.transform = 'translateX(-300px)';
    }
  }

  function handleHamburger() {
    if (window.innerWidth >= 1200) {
      setCollapsed(c => !c);
    } else {
      if (mobileOpen) {
        closeMobileMenu();
      } else {
        setMobileOpen(true);
        const menu = document.querySelector('.main-menu');
        if (menu) menu.style.transform = 'translateX(0)';
      }
    }
  }

  return (
    <>
      <div
        className={`vertical-layout vertical-menu-modern${collapsed ? ' menu-collapsed' : ' menu-expanded'}${mobileOpen ? ' menu-open' : ''} menu-light menu-accordion menu-shadow`}
        dir="ltr"
      >
        {/* ── Sidebar ── */}
        <MainMenu
          collapsed={collapsed}
          onToggleCollapse={handleHamburger}
          onOverlayClick={closeMobileMenu}
          mobileOpen={mobileOpen}
        />

        {/* ── Área de conteúdo principal ── */}
        <div className="app-content content">
          <div className="content-overlay" />
          <div className="header-navbar-shadow" />
          {/* ── Barra de navegação superior — sticky dentro do app-content ── */}
          <Navbar onHamburgerClick={handleHamburger} />
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
                          <span style={{ cursor: 'default', pointerEvents: 'none' }}>
                            <BreadcrumbIcon activeHref={pathname} />
                          </span>
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
      </div>

      {/* ── Bottom nav mobile — fora do wrapper para position:fixed não ser afetado ── */}
      <MobileBottomNav onNavClick={closeMobileMenu} />

      {/* ── Faixa inferior ── */}
      <div className="_bottom-bar" style={{ position: 'fixed', bottom: 0, right: 0, height: '5px', background: 'linear-gradient(135deg,#003DFF 0%,#00E5FF 100%)', zIndex: 1020, borderRadius: '2px' }} />
    </>
  );
}
