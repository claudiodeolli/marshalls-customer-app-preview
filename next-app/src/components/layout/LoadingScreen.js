'use client';

import { useEffect, useState } from 'react';

/* Tela de carregamento idêntica ao #loading-bg do index.html original */
export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    /* Aguarda a montagem do app e oculta a tela de loading */
    const timer = setTimeout(() => setHidden(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div id="loading-bg" style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-logo">
        <img src="/img/MarshallsMed%20novo2_%20Med%20maior.png" alt="Logo" width="200" />
      </div>
      <div className="loading">
        <div className="effect-1 effects" />
        <div className="effect-2 effects" />
        <div className="effect-3 effects" />
      </div>
    </div>
  );
}
