'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Trava a rolagem da página enquanto qualquer modal via ModalPortal estiver
// aberta. O contador cobre modais simultâneas. `overflow: hidden` no body é
// propagado para a viewport pelo navegador, então o gesto de rolagem para; e,
// ao contrário de `position: fixed`, mantém `window.scrollY` real — assim o
// scrollTo que as telas já fazem continua valendo com a modal aberta.
// `scrollbar-gutter: stable` reserva o espaço da barra e evita o layout pular
// no desktop quando ela some.
let modaisAbertas = 0;
let estilosSalvos = null;

function travarRolagemDaPagina() {
  if (modaisAbertas === 0) {
    const corpo = document.body;
    const raiz = document.documentElement;
    estilosSalvos = {
      overflowDoCorpo: corpo.style.overflow,
      gutterDaRaiz: raiz.style.scrollbarGutter,
    };
    raiz.style.scrollbarGutter = 'stable';
    corpo.style.overflow = 'hidden';
  }
  modaisAbertas += 1;
}

function liberarRolagemDaPagina() {
  modaisAbertas = Math.max(0, modaisAbertas - 1);
  if (modaisAbertas > 0 || !estilosSalvos) return;
  document.body.style.overflow = estilosSalvos.overflowDoCorpo;
  document.documentElement.style.scrollbarGutter = estilosSalvos.gutterDaRaiz;
  estilosSalvos = null;
}

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

  useEffect(() => {
    setMontado(true);
    travarRolagemDaPagina();
    return () => liberarRolagemDaPagina();
  }, []);

  if (!montado) return null;
  return createPortal(children, document.body);
}
