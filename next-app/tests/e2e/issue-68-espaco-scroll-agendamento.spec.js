const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../../test-results/issue-68-before-after');
fs.mkdirSync(screenshotDir, { recursive: true });

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 390, height: 480 },
  { width: 768, height: 640 },
  { width: 1440, height: 900 },
  { width: 1440, height: 480 },
];

async function verificarMedicao(page, selector, property, className, staticClassName) {
  await expect.poll(() => page.locator(selector).evaluate((element, { property, className, staticClassName }) => {
    const appContent = document.querySelector('.app-content');
    const scrollY = window.scrollY;
    const previous = element.style[property];
    const previousAppPadding = appContent.style.getPropertyValue('padding-bottom');
    const previousAppPriority = appContent.style.getPropertyPriority('padding-bottom');
    const previousTransition = appContent.style.getPropertyValue('transition-duration');
    const previousTransitionPriority = appContent.style.getPropertyPriority('transition-duration');
    const desktopLayout = window.innerWidth >= 768;
    const mobileStructuralPadding = parseFloat(getComputedStyle(appContent).paddingBottom) || 0;
    element.style[property] = '0px';
    if (desktopLayout) {
      appContent.style.setProperty('transition-duration', '0s', 'important');
      appContent.style.setProperty('padding-bottom', '0px', 'important');
    }
    const contentHeight = document.documentElement.scrollHeight - (desktopLayout ? 0 : mobileStructuralPadding);
    const overflow = contentHeight > document.documentElement.clientHeight;
    element.style[property] = previous;
    if (desktopLayout) {
      if (previousAppPadding) appContent.style.setProperty('padding-bottom', previousAppPadding, previousAppPriority);
      else appContent.style.removeProperty('padding-bottom');
      void getComputedStyle(appContent).paddingBottom;
      if (previousTransition) appContent.style.setProperty('transition-duration', previousTransition, previousTransitionPriority);
      else appContent.style.removeProperty('transition-duration');
    }
    void document.documentElement.scrollHeight;
    if (window.scrollY !== scrollY) window.scrollTo(window.scrollX, scrollY);
    return element.classList.contains(className) === overflow
      && element.classList.contains(staticClassName) === !overflow;
  }, { property, className, staticClassName })).toBe(true);

  return page.locator(selector).evaluate((element, { property, className, staticClassName }) => {
    const appContent = document.querySelector('.app-content');
    const scrollY = window.scrollY;
    const previous = element.style[property];
    const previousAppPadding = appContent.style.getPropertyValue('padding-bottom');
    const previousAppPriority = appContent.style.getPropertyPriority('padding-bottom');
    const previousTransition = appContent.style.getPropertyValue('transition-duration');
    const previousTransitionPriority = appContent.style.getPropertyPriority('transition-duration');
    const desktopLayout = window.innerWidth >= 768;
    const mobileStructuralPadding = parseFloat(getComputedStyle(appContent).paddingBottom) || 0;
    element.style[property] = '0px';
    if (desktopLayout) {
      appContent.style.setProperty('transition-duration', '0s', 'important');
      appContent.style.setProperty('padding-bottom', '0px', 'important');
    }
    const measurements = {
      hasOverflow: document.documentElement.scrollHeight - (desktopLayout ? 0 : mobileStructuralPadding) > document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      hasSpacing: element.classList.contains(className),
      isStatic: element.classList.contains(staticClassName),
    };
    element.style[property] = previous;
    if (desktopLayout) {
      if (previousAppPadding) appContent.style.setProperty('padding-bottom', previousAppPadding, previousAppPriority);
      else appContent.style.removeProperty('padding-bottom');
      void getComputedStyle(appContent).paddingBottom;
      if (previousTransition) appContent.style.setProperty('transition-duration', previousTransition, previousTransitionPriority);
      else appContent.style.removeProperty('transition-duration');
    }
    void document.documentElement.scrollHeight;
    if (window.scrollY !== scrollY) window.scrollTo(window.scrollX, scrollY);
    measurements.appliedSpacing = getComputedStyle(element)[property];
    measurements.appPadding = getComputedStyle(appContent).paddingBottom;
    return measurements;
  }, { property, className, staticClassName });
}

async function capturarParSemEspaco(page, selector, property, className, nome) {
  const element = page.locator(selector);
  const original = await element.evaluate((node, { property, className }) => {
    const state = {
      inlineValue: node.style[property],
      hasClass: node.classList.contains(className),
    };
    node.style[property] = '0px';
    node.classList.remove(className);
    return state;
  }, { property, className });
  await page.screenshot({ path: path.join(screenshotDir, `${nome}-before.png`) });
  await element.evaluate((node, { property, className, original }) => {
    node.style[property] = original.inlineValue;
    node.classList.toggle(className, original.hasClass);
  }, { property, className, original });
  await page.screenshot({ path: path.join(screenshotDir, `${nome}-after.png`) });
}

test('Agendar Consulta só reserva espaço inferior quando a medição indica scroll', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await page.goto('/schedule/calendar?referral=ref-003');
  await expect(page.getByTestId('calendario')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Entendi' }).click();

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    const medidas = await verificarMedicao(
      page,
      '._schedule-calendar-step',
      'paddingBottom',
      '_schedule-calendar-step--scrollable',
      '_schedule-calendar-step--static',
    );
    expect(medidas.hasSpacing).toBe(medidas.hasOverflow);
    expect(medidas.isStatic).toBe(!medidas.hasOverflow);
    expect(medidas.appliedSpacing).toBe(medidas.hasOverflow ? '28px' : '0px');
    if (viewport.width >= 768 && !medidas.hasOverflow) {
      expect(medidas.appPadding, JSON.stringify({ viewport, medidas })).toBe('0px');
    }
    if (medidas.hasOverflow) {
      if (viewport.width === 390 && viewport.height === 480) {
        await capturarParSemEspaco(
          page,
          '._schedule-calendar-step',
          'paddingBottom',
          '_schedule-calendar-step--scrollable',
          'agendamento-390x480',
        );
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(page.getByRole('button', { name: 'AGENDAR', exact: true })).toBeInViewport();
    } else {
      await expect(page.getByRole('button', { name: 'AGENDAR', exact: true })).toBeInViewport();
    }
  }
});

test('Cadastro de cartão só reserva espaço inferior quando a medição indica scroll', async ({ page }) => {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.goto('/schedule/calendar');
    await page.getByText('Ortopedia', { exact: true }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Adquirir consulta avulsa' }).click();
    await page.getByText('Ortopedia', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Escolher depois, continuar para o pagamento' }).click();
    await page.getByRole('button', { name: 'Entendi' }).click();
    await page.getByText('Usar outro cartão', { exact: true }).click();

    const cardStep = page.locator('._payment-card-step');
    await expect(cardStep).toBeVisible();
    const medidas = await verificarMedicao(
      page,
      '._payment-card-step',
      'marginBottom',
      '_payment-card-step--scrollable',
      '_payment-card-step--static',
    );
    expect(medidas.hasSpacing).toBe(medidas.hasOverflow);
    expect(medidas.isStatic).toBe(!medidas.hasOverflow);
    expect(medidas.appliedSpacing).toBe(medidas.hasOverflow ? '28px' : '0px');
    if (viewport.width >= 768 && !medidas.hasOverflow) {
      expect(medidas.appPadding, JSON.stringify({ viewport, medidas })).toBe('0px');
    }
    if (medidas.hasOverflow && viewport.width === 390 && viewport.height === 480) {
      await capturarParSemEspaco(
        page,
        '._payment-card-step',
        'marginBottom',
        '_payment-card-step--scrollable',
        'cartao-390x480',
      );
    }
    await expect(cardStep.getByRole('button', { name: 'Finalizar pagamento' })).toBeInViewport();
    if (medidas.hasOverflow) {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(cardStep.getByRole('button', { name: 'Finalizar pagamento' })).toBeInViewport();
      await expect(cardStep.getByRole('button', { name: '← Voltar' })).toBeInViewport();
    }
  }
});
