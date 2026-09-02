'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { resetarEstadoInicialUmaVez } from '@/lib/previewState';

export default function AppGroupLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Antes de qualquer tela ler o que está guardado: o preview volta ao mesmo
  // ponto de partida em todo navegador, uma vez só (issue #19).
  useEffect(() => {
    resetarEstadoInicialUmaVez();
  }, []);

  useEffect(() => {
    history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: '15px', color: '#6e6b7b' }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AppLayout>{children}</AppLayout>;
}
