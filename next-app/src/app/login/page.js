'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function hexToRgba(hex, alpha) {
  const h = (hex || '#1976d2').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  const [config, setConfig] = useState(null);
  const [registration, setRegistration] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Chunk module 55859: clear sessionStorage on login page, then fetch webapp config.
  // AbortController evita que o StrictMode (double-invoke em dev) dispare duas requisições.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const controller = new AbortController();
    sessionStorage.removeItem('config');
    fetch(`${API_BASE}/api/webapp?domain=${window.location.hostname}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        console.debug('[login] webapp config:', data);
        if (data.success && data.data) {
          sessionStorage.setItem('config', JSON.stringify(data.data));
          setConfig(data.data);
        }
      })
      .catch(err => { if (err.name !== 'AbortError') console.warn('[login] webapp config fetch failed:', err); });
    return () => controller.abort();
  }, []);

  // Remove app layout body classes, apply blank-page
  useEffect(() => {
    const body = document.body;
    ['vertical-layout', 'vertical-menu-modern', 'navbar-floating', 'footer-static',
      '2-columns', 'menu-expanded', 'menu-collapsed', 'menu-open'].forEach(c => body.classList.remove(c));
    body.classList.add('blank-page');
    return () => body.classList.remove('blank-page');
  }, []);

  // Redirect authenticated users (chunk: status === 'authenticated' → push to /schedule or /beneficiary)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/plantao');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. GET /api/auth/csrf → csrfToken
      const csrfRes = await fetch(`${API_BASE}/api/auth/csrf`, { credentials: 'include' });
      if (csrfRes.status === 429) {
        setError('Muitas tentativas. Aguarde alguns segundos e tente novamente.');
        return;
      }
      if (!csrfRes.ok) throw new Error(`CSRF fetch failed: ${csrfRes.status}`);
      const { csrfToken } = await csrfRes.json();

      // 2. POST /api/auth/callback/credentials
      // clientId vem da config se disponível (chunk: "credentialsLogin" flow)
      const params = {
        csrfToken,
        registration,
        password,
        loginType: 'credentialsLogin',
        redirect: 'false',
        callbackUrl: `${API_BASE}/`,
        json: 'true',
      };
      if (config?.clientId) params.clientId = config.clientId;

      const signInRes = await fetch(`${API_BASE}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString(),
        credentials: 'include',
      });

      const signInData = await signInRes.json();
      console.debug('[login] signIn response:', signInData);

      if (!signInData.ok || signInData.error) {
        setError('Credenciais inválidas. Por favor, verifique seu registro e senha.');
        return;
      }

      // 3. GET /api/auth/session → user data
      const sessionRes = await fetch(`${API_BASE}/api/auth/session`, { credentials: 'include' });
      const session = await sessionRes.json();
      console.debug('[login] session:', session);

      if (!session?.user) {
        setError('Erro ao obter sessão. Tente novamente.');
        return;
      }

      login(session.user);
      router.replace('/plantao');
    } catch (err) {
      console.error('[login] erro:', err);
      setError('Ocorreu um erro durante o login. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }, [registration, password, config, login, router]);

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const primaryColor = config?.primaryColor || '#1976d2';
  const textColorBtn = config?.textColorSecondary || '#fff';

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Left panel — decorative, desktop only (chunk: !h → hidden on lg-down) */}
      <div
        className="d-none d-lg-flex"
        style={{
          flex: '0 0 60%',
          background: `linear-gradient(${hexToRgba(primaryColor, 0.5)}, ${hexToRgba(primaryColor, 0.98)}), url('/medica.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '3rem',
        }}
      >
        <h1 style={{ fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '3.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          Bem-vindo
        </h1>
        <h2 style={{ marginBottom: '2rem', maxWidth: '85%', fontSize: '1.6rem', fontWeight: 300, lineHeight: 1.4, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          Sua saúde cuidada com tecnologia, humanização e excelência médica.
        </h2>
        <p style={{ opacity: 0.95, maxWidth: '75%', fontSize: '1.1rem', lineHeight: 1.6, textShadow: '1px 1px 2px rgba(0,0,0,0.2)', margin: 0 }}>
          Acesse sua conta e tenha controle total sobre seus agendamentos, consultas e histórico médico.
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo from config (chunk module 17637: renders config.logo as <img>) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
            {config?.logo ? (
              <img
                src={config.logo.replace(/^﻿/, '').trim()}
                alt="Logomarca"
                style={{ width: 220, height: 'auto', maxHeight: 82, objectFit: 'contain', marginBottom: '1rem' }}
              />
            ) : (
              <div style={{ width: 220, height: 82, backgroundColor: '#f5f5f5', borderRadius: 4, marginBottom: '1rem' }} />
            )}
            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#666', lineHeight: 1.5, margin: 0, padding: '0 2rem' }}>
              Entre com suas credenciais para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" role="alert" style={{ fontSize: '0.9rem', borderRadius: 8, marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            {/* Chunk: field name is "Registro", not email/CPF */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="registration-field">Registro</label>
              <input
                id="registration-field"
                type="text"
                className="form-control"
                name="registration"
                autoComplete="username"
                required
                value={registration}
                onChange={e => setRegistration(e.target.value)}
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password-field">Senha</label>
              <input
                id="password-field"
                type="password"
                className="form-control"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="btn btn-block"
              disabled={submitting}
              style={{
                marginTop: '0.5rem',
                padding: '0.9rem 0',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: textColorBtn,
                backgroundColor: primaryColor,
                borderColor: primaryColor,
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm" role="status" style={{ width: 22, height: 22, borderWidth: 2 }} />
              ) : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
