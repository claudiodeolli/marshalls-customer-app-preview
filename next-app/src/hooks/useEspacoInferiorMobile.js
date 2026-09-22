'use client';

import { useEffect } from 'react';

/*
 * Decide, tela a tela, qual espaço inferior o celular usa (issue #55).
 *
 * O CSS parte do espaço reduzido da #54 — uma reserva só, do tamanho da barra
 * inferior, sem a margem do último card. Este hook mede a tela e, se ela vai
 * rolar de qualquer jeito, liga `html.tela-rolavel`, que devolve o espaço
 * anterior à #54. Sem o script (ou antes dele rodar) fica o reduzido, que
 * nunca esconde nada.
 *
 * A decisão usa a altura com a barra de endereço À MOSTRA (100svh), e não a do
 * momento: assim ela não muda enquanto a pessoa rola e a barra some e volta.
 *
 * Uma tela é estática quando nenhum elemento — texto, botão, link, campo,
 * imagem, ícone — fica mais de TOLERANCIA_OMISSAO_PX atrás da barra inferior.
 * Borda, fundo e respiro do card não contam. Se a tela é estática mas ainda
 * sobraria rolagem (só card atrás da barra), a reserva é encurtada até a
 * rolagem sumir.
 */

const CLASSE_ROLAVEL = 'tela-rolavel';
const VARIAVEL_RESERVA = '--reserva-barra-inferior';
const CELULAR = '(max-width: 767.98px)';

// Até 2px de um elemento atrás da barra não conta como omissão. É a faixa do
// botão "Alterar senha" em 390x667 (1,56px), que o Cláudio quis estático; o
// próximo caso medido é 6,19px e deve rolar.
const TOLERANCIA_OMISSAO_PX = 2;

const SELETOR_ELEMENTOS = 'button, a, input, select, textarea, img, svg, video';

function temTextoProprio(el) {
  return [...el.childNodes].some(no => no.nodeType === Node.TEXT_NODE && no.textContent.trim());
}

function estaVisivel(el) {
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
}

/** Fim do elemento de conteúdo mais baixo da tela, em coordenadas do documento. */
function fimDoElementoMaisBaixo(corpo) {
  let fim = 0;
  for (const el of corpo.querySelectorAll('*')) {
    if (!el.matches(SELETOR_ELEMENTOS) && !temTextoProprio(el)) continue;
    if (!estaVisivel(el)) continue;
    fim = Math.max(fim, el.getBoundingClientRect().bottom + window.scrollY);
  }
  return fim;
}

/** Altura da janela com a barra de endereço à mostra. */
function medirAlturaPequena(sonda) {
  return sonda.getBoundingClientRect().height || window.innerHeight;
}

function criarSonda() {
  const sonda = document.createElement('div');
  sonda.setAttribute('aria-hidden', 'true');
  sonda.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
  document.body.appendChild(sonda);
  return sonda;
}

function usarEspacoReduzido(html) {
  html.classList.remove(CLASSE_ROLAVEL);
  html.style.removeProperty(VARIAVEL_RESERVA);
}

function usarEspacoAnterior(html) {
  html.classList.add(CLASSE_ROLAVEL);
  html.style.removeProperty(VARIAVEL_RESERVA);
}

function avaliar(sonda) {
  const html = document.documentElement;
  const corpo = document.querySelector('.content-body');
  const wrapper = document.querySelector('.content-wrapper');
  const barra = document.querySelector('._mob-nav');

  // Fora do celular, ou no Plantão (que tem regra própria e nunca rola), o
  // hook não opina.
  const foraDoAlcance = !window.matchMedia(CELULAR).matches || document.querySelector('._plantao-page');
  if (foraDoAlcance || !corpo || !wrapper || !barra) {
    usarEspacoReduzido(html);
    return;
  }

  // Durante a transição de página o conteúdo está escalado e qualquer medida
  // sai errada. Não decide nada agora: o animationend reagenda a avaliação.
  const emTransicao = corpo.getAnimations().some(animacao => animacao.playState === 'running');
  if (emTransicao) return;

  // Mede sempre no layout reduzido, que é o que a tela estática vai mostrar.
  usarEspacoReduzido(html);

  const alturaPequena = medirAlturaPequena(sonda);
  const faixaDaBarra = window.innerHeight - barra.getBoundingClientRect().top;
  const topoDaBarra = alturaPequena - faixaDaBarra;

  if (fimDoElementoMaisBaixo(corpo) > topoDaBarra + TOLERANCIA_OMISSAO_PX) {
    usarEspacoAnterior(html);
    return;
  }

  const sobra = Math.ceil(wrapper.getBoundingClientRect().bottom + window.scrollY - alturaPequena);
  if (sobra <= 0) return;

  const reservaAtual = parseFloat(getComputedStyle(wrapper).paddingBottom);
  const reservaEncurtada = reservaAtual - sobra;
  if (reservaEncurtada < 0) {
    usarEspacoAnterior(html);
    return;
  }
  html.style.setProperty(VARIAVEL_RESERVA, `${reservaEncurtada}px`);
}

export default function useEspacoInferiorMobile(pathname) {
  useEffect(() => {
    const sonda = criarSonda();
    let quadro = 0;
    let ativo = true;
    const agendar = () => {
      if (!ativo) return;
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => avaliar(sonda));
    };

    // O wrapper existe em todas as telas e muda de altura quando os cards
    // carregam, quando um filtro troca a lista ou quando uma imagem termina de
    // baixar. As mudanças que o próprio hook faz não alteram a decisão, então
    // não há laço: a segunda avaliação chega ao mesmo resultado.
    const wrapper = document.querySelector('.content-wrapper');
    const observador = wrapper ? new ResizeObserver(agendar) : null;
    if (observador) observador.observe(wrapper);

    // O .content-body entra com a transição de página zoom-fade-in-scale
    // (0,35s), que escala o conteúdo. Medido durante ela, tudo parece ~3%
    // menor — em Canais de contato a 360x640 o "Enviar e-mail" aparecia 5,5px
    // mais alto e cabia. O fim da animação não muda o layout, então o
    // observador de tamanho não o vê: por isso o animationend.
    //
    // Fontes e imagens que terminam de carregar depois também podem mover o
    // conteúdo.
    document.addEventListener('animationend', agendar);
    window.addEventListener('resize', agendar);
    window.addEventListener('load', agendar);
    document.fonts?.addEventListener('loadingdone', agendar);
    document.fonts?.ready.then(agendar);
    agendar();

    return () => {
      ativo = false;
      cancelAnimationFrame(quadro);
      observador?.disconnect();
      document.removeEventListener('animationend', agendar);
      window.removeEventListener('resize', agendar);
      window.removeEventListener('load', agendar);
      document.fonts?.removeEventListener('loadingdone', agendar);
      sonda.remove();
      usarEspacoReduzido(document.documentElement);
    };
  }, [pathname]);
}
