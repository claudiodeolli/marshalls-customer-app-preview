'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Leva a modal para fora da subárvore do conteúdo.
 *
 * Desde a issue #45 o `.content-wrapper` tem `mask-image`, e isso o torna
 * bloco contenedor para descendentes `position: fixed` — além de abrir um
 * contexto de empilhamento próprio. Os overlays passavam a se posicionar por
 * ele e ficavam presos abaixo do bottom nav, que vive fora dali: no mobile o
 * clique no botão da modal era interceptado pela navegação inferior.
 *
 * Renderiza nulo no primeiro passo para não divergir do HTML do servidor.
 */
export default function ModalPortal({ children }) {
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  if (!montado) return null;
  return createPortal(children, document.body);
}
