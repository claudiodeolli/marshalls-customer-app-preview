// Issue #37 — the top navbar must stay locked at the top while the page scrolls,
// with the page content passing behind it under a translucent film.
// Expectations come from the issue checklist, not from globals.css.
import { Selector, ClientFunction } from 'testcafe';

const appUrl = process.env.APP_URL ?? 'http://localhost:3100';

// The portal browser cannot be resized from inside the test (t.resizeWindow is
// unsupported on remote browsers), so the run declares its viewport through
// VIEWPORT and every viewport-specific expectation is derived from it.
const [declaredViewportWidth] = (process.env.VIEWPORT ?? '390x844').split('x').map(Number);
const isDesktopViewport = declaredViewportWidth >= 1200;
// TestCafe binds the test to the fixture through the `test` object itself, so the
// alias has to call it as a method instead of holding a detached reference.
const desktopOnlyTest = (name, fn) => (isDesktopViewport ? test(name, fn) : test.skip(name, fn));
const mobileOnlyTest = (name, fn) => (isDesktopViewport ? test.skip(name, fn) : test(name, fn));

const NAVBAR_HEIGHT = 70.38;
const DESKTOP_STICKY_TOP = 18.2;
const MOBILE_STICKY_TOP = 0;
const DESKTOP_BORDER_RADIUS = '8px';
const MOBILE_BORDER_RADIUS = '0px';
const GAP_BELOW_NAVBAR = 28;
const CONTENT_SIDE_PADDING = 28;
const FILM_HEIGHT = 102;
const BOTTOM_NAV_INSET = 16;
const BRAND_GRADIENT_START = 'rgb(148, 241, 255)';
const TOLERANCE = 0.6;
// The mobile sidebar slides in slowly; retried assertions wait it out.
const SLIDE_TIMEOUT = { timeout: 8000 };

const expectedStickyTop = isDesktopViewport ? DESKTOP_STICKY_TOP : MOBILE_STICKY_TOP;

const NAVBAR = '.header-navbar.floating-nav';
const FILM = '.header-navbar-shadow';
const CONTENT_HEADER = '.content-header';
const APP_CONTENT = '.app-content';
const USER_DROPDOWN = '[data-user-dd="1"]';
const SIDEBAR = '.main-menu';
const SIDEBAR_OVERLAY = '.sidenav-overlay';
const BOTTOM_NAV = '._mob-nav';
const PLANTAO_PAGE = '._plantao-page';

const rectOf = ClientFunction(selector => {
  const element = document.querySelector(selector);
  if (!element) return null;
  const { top, bottom, left, right, width, height } = element.getBoundingClientRect();
  return { top, bottom, left, right, width, height };
});

const styleOf = ClientFunction((selector, property) => {
  const element = document.querySelector(selector);
  return element ? window.getComputedStyle(element)[property] : null;
});

// The page scrolls inside <body>, not the viewport: window.scrollTo/scrollY stay at
// zero here, so every scroll assertion has to drive the element that really scrolls.
function pageScroller() {
  const html = document.documentElement;
  return html.scrollHeight > html.clientHeight ? html : document.body;
}

const scrollPageTo = ClientFunction(offset => {
  const scroller = pageScroller();
  scroller.scrollTop = offset;
  return scroller.scrollTop;
}, { dependencies: { pageScroller } });

const viewportMetrics = ClientFunction(() => {
  const scroller = pageScroller();
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    pageWidth: scroller.clientWidth,
    pageHeight: scroller.clientHeight,
    pageScrollHeight: scroller.scrollHeight,
    pageScrollTop: scroller.scrollTop,
    pageOverflowY: window.getComputedStyle(scroller).overflowY,
  };
}, { dependencies: { pageScroller } });

const pointHits = ClientFunction((x, y, selector) => {
  const hit = document.elementFromPoint(x, y);
  const container = document.querySelector(selector);
  return Boolean(hit && container && (container === hit || container.contains(hit)));
});

const navbarWidth = ClientFunction(() => document.querySelector('.header-navbar.floating-nav').getBoundingClientRect().width);

const sidebarLeftEdge = ClientFunction(() => document.querySelector('.main-menu').getBoundingClientRect().left);

const isSidebarParked = ClientFunction(() => {
  const sidebar = document.querySelector('.main-menu');
  return Boolean(sidebar) && sidebar.getBoundingClientRect().right <= 0;
});

const bodyHasClass = ClientFunction(name => document.body.classList.contains(name));

async function expectClose(t, actual, expected, message) {
  await t.expect(Math.abs(actual - expected) <= TOLERANCE).ok(
    `${message} — esperado ${expected}px (±${TOLERANCE}), obtido ${actual}px`,
  );
}

// The portal is resized after the first navigation, so the app can mount believing it
// is on desktop and skip the mobile layout work it only does at mount time. Reloading
// once guarantees every test starts from a mount made at the declared viewport.
async function openAtDeclaredViewport(t) {
  await t.eval(() => window.location.reload());
  await t.expect(Selector(NAVBAR).exists).ok('a navbar não renderizou');

  // Parking the sidebar off-screen is the last thing the layout does when it mounts on
  // mobile, so it is the signal that hydration finished and the page can be driven.
  if (!isDesktopViewport) {
    await t.expect(isSidebarParked()).ok('a sidebar não foi recolhida no mount mobile — app não hidratou');
  }

  const { innerWidth } = await viewportMetrics();
  await t.expect(innerWidth >= 1200).eql(isDesktopViewport,
    `o portal abriu em ${innerWidth}px, fora do modo declarado em VIEWPORT=${declaredViewportWidth}px`);
}

fixture('Issue #37 — navbar travada e pelicula (/agendamentos)')
  .page(`${appUrl}/agendamentos`)
  .beforeEach(openAtDeclaredViewport);

test('a navbar permanece imóvel no topo ao rolar a página', async t => {
  const atRest = await rectOf(NAVBAR);
  await expectClose(t, atRest.top, expectedStickyTop, 'navbar fora de posição com a página no topo');

  for (const offset of [120, 400, 900]) {
    const reached = await scrollPageTo(offset);
    await t.expect(reached).gt(0, `a página não rolou em scrollTo(${offset}) — o teste de travamento seria vazio`);

    const scrolled = await rectOf(NAVBAR);
    await expectClose(t, scrolled.top, expectedStickyTop, `a navbar se moveu com scrollY=${reached}`);
    await expectClose(t, scrolled.left, atRest.left, `a navbar deslocou horizontalmente com scrollY=${reached}`);
  }

  await scrollPageTo(0);
  const backAtTop = await rectOf(NAVBAR);
  await expectClose(t, backAtTop.top, expectedStickyTop, 'a navbar não voltou à posição de repouso');
});

test('a altura da navbar permanece 70.38px, parada e rolando', async t => {
  const atRest = await rectOf(NAVBAR);
  await expectClose(t, atRest.height, NAVBAR_HEIGHT, 'altura da navbar com a página no topo');

  await scrollPageTo(600);
  const scrolled = await rectOf(NAVBAR);
  await expectClose(t, scrolled.height, NAVBAR_HEIGHT, 'altura da navbar com a página rolada');
});

desktopOnlyTest('no desktop a navbar mantém cantos de 8px e o gap de 18.2px acima', async t => {
  await t.expect(await styleOf(NAVBAR, 'borderTopLeftRadius')).eql(DESKTOP_BORDER_RADIUS, 'canto superior esquerdo');
  await t.expect(await styleOf(NAVBAR, 'borderTopRightRadius')).eql(DESKTOP_BORDER_RADIUS, 'canto superior direito');

  await scrollPageTo(500);
  const scrolled = await rectOf(NAVBAR);
  await expectClose(t, scrolled.top, DESKTOP_STICKY_TOP, 'gap acima da navbar travada');
  await t.expect(scrolled.left).gt(0, 'a navbar encostou na borda esquerda — o efeito floating sumiu');
});

mobileOnlyTest('no mobile a navbar é full-bleed, sem gap e sem cantos arredondados', async t => {
  const { pageWidth } = await viewportMetrics();
  const atRest = await rectOf(NAVBAR);

  await expectClose(t, atRest.top, MOBILE_STICKY_TOP, 'existe gap acima da navbar no mobile');
  await expectClose(t, atRest.left, 0, 'a navbar não encosta na borda esquerda no mobile');
  await expectClose(t, atRest.width, pageWidth, 'a navbar não ocupa a largura total no mobile');
  await t.expect(await styleOf(NAVBAR, 'borderTopLeftRadius')).eql(MOBILE_BORDER_RADIUS, 'canto superior esquerdo');
  await t.expect(await styleOf(NAVBAR, 'borderTopRightRadius')).eql(MOBILE_BORDER_RADIUS, 'canto superior direito');

  await scrollPageTo(500);
  const scrolled = await rectOf(NAVBAR);
  await expectClose(t, scrolled.top, MOBILE_STICKY_TOP, 'a navbar saiu do topo no mobile ao rolar');
});

test('o conteúdo passa por trás da navbar sem ser cortado', async t => {
  const headerAtRest = await rectOf(CONTENT_HEADER);
  await t.expect(headerAtRest.height).gt(0, 'o cabeçalho da página não renderizou');

  await scrollPageTo(60);
  const navbar = await rectOf(NAVBAR);
  const headerBehind = await rectOf(CONTENT_HEADER);

  await t.expect(headerBehind.top < navbar.bottom && headerBehind.bottom > navbar.top).ok(
    `o conteúdo não chegou a passar por trás da navbar (conteúdo ${headerBehind.top}–${headerBehind.bottom}, navbar ${navbar.top}–${navbar.bottom})`);
  await expectClose(t, headerBehind.height, headerAtRest.height,
    'o conteúdo foi cortado ao passar por trás da navbar');
  await t.expect(Selector(CONTENT_HEADER).visible).ok('o conteúdo sumiu ao passar por trás da navbar');
});

test('a película translúcida fica sobre o conteúdo e não cobre a barra de rolagem', async t => {
  await t.expect(await styleOf(FILM, 'display')).notEql('none', 'a película continua desativada');

  await scrollPageTo(300);
  const film = await rectOf(FILM);
  const navbar = await rectOf(NAVBAR);
  const metrics = await viewportMetrics();

  await expectClose(t, film.height, FILM_HEIGHT, 'altura da película');
  await t.expect(film.top <= navbar.top + TOLERANCE).ok(
    `a película começa abaixo do topo da navbar (película ${film.top}, navbar ${navbar.top})`);
  await t.expect(film.bottom).gt(navbar.bottom,
    'a película não avança sobre o conteúdo abaixo da navbar — não haveria faixa translúcida visível');

  const background = await styleOf(FILM, 'backgroundImage');
  await t.expect(background).contains('linear-gradient', 'a película não tem gradiente');
  await t.expect(background).contains('rgba(', 'o gradiente da película não é translúcido');

  await t.expect(metrics.pageScrollHeight).gt(metrics.pageHeight,
    'a página não tem barra de rolagem — a checagem de scrollbar seria vazia');
  await t.expect(film.right <= metrics.pageWidth + TOLERANCE).ok(
    `a película invade a barra de rolagem (borda direita ${film.right}, área útil ${metrics.pageWidth})`);

  const filmZIndex = Number(await styleOf(FILM, 'zIndex'));
  const navbarZIndex = Number(await styleOf(NAVBAR, 'zIndex'));
  await t.expect(filmZIndex).gt(0, 'a película não está empilhada acima do conteúdo');
  await t.expect(filmZIndex).lt(navbarZIndex, 'a película cobre a própria navbar');
});

test('o gradiente de marca da navbar é preservado', async t => {
  const background = await styleOf(NAVBAR, 'backgroundImage');
  await t.expect(background).contains('linear-gradient', 'a navbar perdeu o gradiente');
  await t.expect(background).contains(BRAND_GRADIENT_START, 'a navbar perdeu o azul #94F1FF do gradiente de marca');
});

test('com scroll em 0 o gap entre navbar e conteúdo continua 28px', async t => {
  await scrollPageTo(0);
  const navbar = await rectOf(NAVBAR);
  const header = await rectOf(CONTENT_HEADER);

  await expectClose(t, header.top - navbar.bottom, GAP_BELOW_NAVBAR, 'gap entre a navbar e o conteúdo');
  await t.expect(header.top).gt(navbar.bottom, 'o conteúdo está escondido sob a navbar no topo da página');
});

test('o dropdown do avatar abre por cima do conteúdo sem ser cortado', async t => {
  await t.click(Selector('.nav-item-user-btn'));
  // The dropdown slides in, so its box only settles after the entry animation.
  await t.wait(600);

  const dropdown = Selector(USER_DROPDOWN);
  await t.expect(dropdown.visible).ok('o dropdown do avatar não abriu');
  await t.expect(dropdown.innerText).contains('Sair', 'o item "Sair" não está no dropdown');

  const navbar = await rectOf(NAVBAR);
  const menu = await rectOf(USER_DROPDOWN);
  await t.expect(menu.bottom).gt(navbar.bottom, 'o dropdown não ultrapassa a navbar — estaria contido/cortado');
  await t.expect(menu.height).gt(0, 'o dropdown abriu sem altura');

  const isOnTop = await pointHits((menu.left + menu.right) / 2, menu.bottom - 10, USER_DROPDOWN);
  await t.expect(isOnTop).ok('a parte do dropdown abaixo da navbar está coberta por outro elemento');
});

desktopOnlyTest('a navbar acompanha a largura do conteúdo ao recolher a sidebar', async t => {
  const expanded = await rectOf(NAVBAR);
  await t.click(Selector('.nav-item.d-none.d-xl-block').find('.nav-link'));
  await t.expect(await bodyHasClass('menu-collapsed')).ok('a sidebar não recolheu ao clicar no hambúrguer');
  await t.expect(navbarWidth()).notEql(expanded.width,
    'a navbar não acompanhou a sidebar recolhida — a largura ficou igual', SLIDE_TIMEOUT);

  const collapsed = await rectOf(NAVBAR);
  const content = await rectOf(APP_CONTENT);
  await expectClose(t, collapsed.width, content.width - 2 * CONTENT_SIDE_PADDING,
    'largura da navbar dentro do padding de 28px do conteúdo');
});

mobileOnlyTest('a sidebar aberta fica acima da navbar, com overlay cobrindo-a e scroll travado', async t => {
  const scrollBeforeOpening = await scrollPageTo(200);
  await t.click(Selector('.nav-link.menu-toggle'));
  await t.expect(sidebarLeftEdge()).gte(0, 'a sidebar não entrou na tela ao tocar no hambúrguer', SLIDE_TIMEOUT);

  await t.expect(await bodyHasClass('menu-open')).ok('body não recebeu a classe menu-open');
  await t.expect((await viewportMetrics()).pageOverflowY).eql('hidden',
    'o scroll da página não foi travado com a sidebar aberta');

  const navbar = await rectOf(NAVBAR);
  const overlay = await rectOf(SIDEBAR_OVERLAY);
  await t.expect(overlay.top <= navbar.top && overlay.bottom >= navbar.bottom).ok(
    `o overlay não cobre a navbar (overlay ${overlay.top}–${overlay.bottom}, navbar ${navbar.top}–${navbar.bottom})`);

  const sidebar = await rectOf(SIDEBAR);
  await t.expect(await pointHits((sidebar.left + sidebar.right) / 2, sidebar.top + 120, SIDEBAR)).ok(
    'a sidebar aberta está atrás do overlay');

  // Over the sidebar the topmost element is the sidebar itself, so the overlay is
  // probed on the strip of the navbar that the open sidebar leaves exposed.
  const exposedNavbarX = (sidebar.right + navbar.right) / 2;
  await t.expect(await pointHits(exposedNavbarX, (navbar.top + navbar.bottom) / 2, SIDEBAR_OVERLAY)).ok(
    'a navbar aparece por cima do overlay da sidebar');

  // The overlay spans the whole screen, so it has to be clicked on the strip the open
  // sidebar leaves exposed — its centre point belongs to the sidebar.
  await t.click(Selector(SIDEBAR_OVERLAY), { offsetX: Math.round(exposedNavbarX), offsetY: 400 });
  await t.expect(isSidebarParked()).ok('a sidebar não fechou pelo overlay', SLIDE_TIMEOUT);
  await t.expect(await bodyHasClass('menu-open')).notOk('a classe menu-open ficou presa no body');

  const afterClosing = await viewportMetrics();
  await t.expect(afterClosing.pageOverflowY).notEql('hidden',
    'o scroll da página continuou travado depois de fechar a sidebar');
  await expectClose(t, afterClosing.pageScrollTop, scrollBeforeOpening,
    'a posição de rolagem se perdeu ao abrir e fechar a sidebar');
});

mobileOnlyTest('o bottom nav continua fixo no rodapé e abaixo da navbar no empilhamento', async t => {
  const { innerHeight } = await viewportMetrics();
  const atRest = await rectOf(BOTTOM_NAV);
  await t.expect(atRest.bottom <= innerHeight && atRest.bottom > innerHeight - BOTTOM_NAV_INSET).ok(
    `o bottom nav não está no rodapé (fim ${atRest.bottom}, viewport ${innerHeight})`);

  await scrollPageTo(600);
  const scrolled = await rectOf(BOTTOM_NAV);
  await expectClose(t, scrolled.bottom, atRest.bottom, 'o bottom nav saiu do rodapé ao rolar');
  await expectClose(t, scrolled.height, atRest.height, 'o bottom nav mudou de tamanho ao rolar');

  const bottomNavZIndex = Number(await styleOf(BOTTOM_NAV, 'zIndex'));
  const navbarZIndex = Number(await styleOf(NAVBAR, 'zIndex'));
  await t.expect(bottomNavZIndex).lt(navbarZIndex, 'o bottom nav disputa empilhamento com a navbar');
});

fixture('Issue #37 — nao-regressao na Plantao 24h (/plantao)')
  .page(`${appUrl}/plantao`)
  .beforeEach(openAtDeclaredViewport);

test('a Plantão 24h mantém a navbar travada e o conteúdo dentro da tela', async t => {
  await t.expect(Selector(PLANTAO_PAGE).visible).ok('a página Plantão 24h não renderizou');

  const navbar = await rectOf(NAVBAR);
  await expectClose(t, navbar.top, expectedStickyTop, 'a navbar saiu do topo na Plantão 24h');
  await expectClose(t, navbar.height, NAVBAR_HEIGHT, 'altura da navbar na Plantão 24h');

  const content = await rectOf(PLANTAO_PAGE);
  const metrics = await viewportMetrics();
  await t.expect(content.top).gte(navbar.bottom - TOLERANCE, 'o conteúdo da Plantão 24h nasce sob a navbar');
  await t.expect(content.bottom <= metrics.innerHeight + 1).ok(
    `a Plantão 24h estourou a altura da tela (fim do conteúdo ${content.bottom}, viewport ${metrics.innerHeight})`);
});

// globals.css reaches every screen, so the locked navbar, the film and the 28px gap are
// re-checked on the other long pages the change can affect.
const NEIGHBOURING_ROUTES = ['/painel', '/historico', '/meu-clube', '/meus-dados'];

for (const route of NEIGHBOURING_ROUTES) {
  fixture(`Issue #37 — navbar travada em ${route}`)
    .page(`${appUrl}${route}`)
    .beforeEach(openAtDeclaredViewport);

  test(`${route} mantém a navbar travada, a película e o gap de 28px`, async t => {
    const navbarAtRest = await rectOf(NAVBAR);
    const header = await rectOf(CONTENT_HEADER);
    await expectClose(t, navbarAtRest.top, expectedStickyTop, `navbar fora de posição em ${route}`);
    await expectClose(t, navbarAtRest.height, NAVBAR_HEIGHT, `altura da navbar em ${route}`);
    await expectClose(t, header.top - navbarAtRest.bottom, GAP_BELOW_NAVBAR, `gap abaixo da navbar em ${route}`);

    await scrollPageTo(400);
    const navbarScrolled = await rectOf(NAVBAR);
    await expectClose(t, navbarScrolled.top, expectedStickyTop, `a navbar se moveu ao rolar ${route}`);

    const film = await rectOf(FILM);
    const metrics = await viewportMetrics();
    await t.expect(await styleOf(FILM, 'display')).notEql('none', `a película sumiu em ${route}`);
    await t.expect(film.right <= metrics.pageWidth + TOLERANCE).ok(
      `a película invade a barra de rolagem em ${route} (borda direita ${film.right}, área útil ${metrics.pageWidth})`);
  });
}
