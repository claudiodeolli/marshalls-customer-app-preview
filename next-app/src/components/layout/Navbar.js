'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';

/* Ícone hamburger (menu) */
function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="feather feather-menu ficon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

/* Ícone de logout */
function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ marginRight: '0.5rem', flexShrink: 0 }}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function buildGreeting(firstName) {
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const now = new Date();
  const name = firstName ? `${firstName}! ` : '';
  return `Olá, ${name} Hoje é ${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;
}

export default function Navbar({ onHamburgerClick }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const dropdownRef = useRef(null);

  const firstName = user?.name?.split(' ')[0] ?? user?.firstName ?? '';
  const initials = firstName ? firstName[0].toUpperCase() : '?';

  useEffect(() => {
    setGreeting(buildGreeting(firstName));
  }, [firstName]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav
      className="header-navbar navbar navbar-expand-lg align-items-center floating-nav navbar-light navbar-shadow"
      role="navigation"
      data-nav="brand-center"
    >
      <div className="navbar-container d-flex content" style={{ height: '70.38px', alignItems: 'center' }}>

        {/* ── Esquerda: hamburger ── */}
        <div className="bookmark-wrapper d-flex align-items-center">
          {/* Hamburger mobile */}
          <ul className="nav navbar-nav">
            <li className="nav-item d-xl-none">
              <a className="nav-link menu-toggle" href="#" onClick={e => { e.preventDefault(); onHamburgerClick(); }} style={{ padding: '0.5rem 0.75rem' }}>
                <MenuIcon />
              </a>
            </li>
          </ul>
          {/* Hamburger desktop */}
          <ul className="nav navbar-nav">
            <li className="nav-item d-none d-xl-block">
              <a
                className="nav-link"
                href="#"
                onClick={e => { e.preventDefault(); onHamburgerClick(); }}
                style={{ cursor: 'pointer' }}
              >
                <MenuIcon />
              </a>
            </li>
          </ul>
        </div>

        {/* ── Direita: saudação + avatar do usuário ── */}
        <ul className="nav navbar-nav align-items-center ml-auto">
          {greeting && (
            <li className="nav-item">
              <span className="navbar-greeting">{greeting}</span>
            </li>
          )}
          <li className="nav-item dropdown dropdown-user" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              className={`nav-item-user-btn${dropdownOpen ? ' nav-item-user-btn--open' : ''}`}
              onClick={e => { e.stopPropagation(); setDropdownOpen(o => !o); }}
            >
              {/* Avatar circular com inicial */}
              <div
                className="_ct-gradient _user-avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0052ff 0%,#00b7ff 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  data-user-dd="1"
                  style={{
                    display: 'block',
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #ebe9f1',
                    borderRadius: '0.358rem',
                    boxShadow: '0 5px 25px rgba(34,41,47,0.1)',
                    minWidth: '180px',
                    zIndex: 9999,
                  }}
                >
                  <a
                    href="#"
                    className="_sair-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.28rem',
                      color: '#ea5455',
                      fontWeight: 500,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={e => { e.preventDefault(); setDropdownOpen(false); logout(); }}
                  >
                    <LogoutIcon />
                    Sair
                  </a>
                </div>
              )}
            </button>
          </li>
        </ul>

      </div>
    </nav>
  );
}
