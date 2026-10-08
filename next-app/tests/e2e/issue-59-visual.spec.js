const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const output = path.join(__dirname, '../../test-results/issue-59-after');
fs.mkdirSync(output, { recursive: true });

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`ReferralModal, regras e pagamento responsivos em ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/agendamentos');
    await page.getByRole('button', { name: 'Novo Agendamento' }).first().click();
    await page.getByText('Cardiologia', { exact: true }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    const referralMeasurements = await modal.evaluate(dialog => {
      const style = selector => {
        const element = dialog.querySelector(selector);
        const css = getComputedStyle(element);
        return { fontSize: css.fontSize, fontWeight: css.fontWeight };
      };
      return {
        title: style('#referral-modal-title'),
        instructions: style('p'),
        specialty: style('[style*="font-size: 15px"]'),
        createdAt: style('[style*="font-size: 13px"]'),
        actions: [...dialog.querySelectorAll('button')].slice(-2).map(button => {
          const css = getComputedStyle(button);
          return { fontSize: css.fontSize, fontWeight: css.fontWeight };
        }),
      };
    });
    expect(referralMeasurements).toEqual({
      title: { fontSize: '16px', fontWeight: '700' },
      instructions: { fontSize: '14px', fontWeight: '400' },
      specialty: { fontSize: '15px', fontWeight: '700' },
      createdAt: { fontSize: '13px', fontWeight: '400' },
      actions: [
        { fontSize: '14px', fontWeight: '600' },
        { fontSize: '14px', fontWeight: '600' },
      ],
    });
    const confirm = modal.getByRole('button', { name: 'Confirmar' });
    await expect(confirm).toBeDisabled();
    const disabledConfirmStyle = await confirm.evaluate(element => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage, filter: style.filter, shadow: style.boxShadow };
    });
    expect(disabledConfirmStyle).toEqual({
      backgroundColor: 'rgb(204, 204, 204)',
      backgroundImage: 'none',
      filter: 'none',
      shadow: 'none',
    });
    await modal.getByText('Cardiologia', { exact: true }).click();
    if (viewport.width >= 1200) {
      const confirmColor = await confirm.evaluate(element => getComputedStyle(element).backgroundColor);
      await confirm.hover();
      const hoverStyle = await confirm.evaluate(element => ({
        color: getComputedStyle(element).backgroundColor,
        filter: getComputedStyle(element).filter,
        transform: getComputedStyle(element).transform,
        shadow: getComputedStyle(element).boxShadow,
      }));
      expect(hoverStyle.color).toBe(confirmColor);
      await expect.poll(() => confirm.evaluate(element => getComputedStyle(element).filter)).toBe('brightness(1.08)');
      expect(hoverStyle.transform).toBe('none');
      await expect.poll(() => confirm.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none');
    } else {
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
      await page.mouse.move(0, 0);
      expect(await confirm.evaluate(element => element.matches(':hover'))).toBe(false);
      await expect(confirm).toHaveCSS('filter', 'brightness(1.08)');
      await expect.poll(() => confirm.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none');
    }
    await page.mouse.move(0, 0);
    await page.screenshot({ path: path.join(output, `referral-${viewport.width}.png`), fullPage: true });
    await page.keyboard.press('Tab');
    await confirm.focus();
    await expect(confirm).toHaveCSS('outline-width', '3px');

    await page.goto('/schedule/calendar?referral=ref-003');
    const rules = page.getByTestId('booking-rules-alert-referral');
    await expect(rules).toBeVisible();
    await expect(rules.locator('img[src*="warning_3d.png"]')).toBeVisible();
    await page.screenshot({ path: path.join(output, `booking-rules-${viewport.width}.png`), fullPage: true });

    await page.goto('/schedule/calendar');
    await page.getByText('Ortopedia', { exact: true }).first().click();
    const noReferralState = page.locator('._referral-empty-state');
    const noReferralMessage = noReferralState.getByText('Você não possui encaminhamentos disponíveis.', { exact: true });
    const referralGuidance = noReferralState.getByText('Solicite um encaminhamento médico para agendar esta especialidade, ou:', { exact: true });
    const noReferralMessageBox = noReferralMessage.locator('..');
    await expect(noReferralMessageBox).toHaveText('Você não possui encaminhamentos disponíveis.');
    await expect(noReferralMessageBox).toHaveCSS('border-style', 'solid');
    await expect(noReferralMessageBox).toHaveCSS('border-radius', '8px');
    await expect(noReferralMessageBox).toHaveCSS('padding', '12px 14px');
    await expect(noReferralMessage).toHaveCSS('font-size', '14px');
    await expect(referralGuidance).toHaveCSS('font-size', '14px');
    expect(await referralGuidance.evaluate(element => element.parentElement === document.querySelector('._referral-empty-state'))).toBe(true);
    await expect(noReferralState).toHaveCSS('padding-top', '28px');
    await expect(noReferralState).toHaveCSS('padding-bottom', '28px');
    await noReferralState.getByRole('button', { name: 'Adquirir consulta avulsa' }).click();
    await page.getByText('Ortopedia', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Escolher depois, continuar para o pagamento' }).click();
    await page.getByRole('button', { name: 'Entendi' }).click();
    const payment = page.locator('._payment-select-step');
    await expect(payment).toBeVisible();
    if (viewport.width < 768) {
      await expect(page.locator('html')).not.toHaveClass(/tela-rolavel/);
      const overflow = await page.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight);
      expect(overflow).toBeLessThanOrEqual(0);
    }
    const paymentMeasurements = await payment.evaluate(element => {
      const css = selector => getComputedStyle(element.querySelector(selector));
      return {
        label: css('._payment-summary-label').fontSize,
        specialty: [css('._payment-summary-specialty').fontSize, css('._payment-summary-specialty').fontWeight],
        price: [css('._payment-summary-price').fontSize, css('._payment-summary-price').fontWeight],
        method: [css('._payment-method-title').fontSize, css('._payment-method-title').fontWeight],
        option: [css('._payment-option-title').fontSize, css('._payment-option-title').fontWeight],
        subtitle: css('._payment-option-subtitle').fontSize,
        icon: [css('._payment-option-icon').width, css('._payment-option-icon').height],
        iconBackgrounds: [...element.querySelectorAll('._payment-option-icon')].map(icon => getComputedStyle(icon).backgroundColor),
        svg: [css('._payment-option-icon svg').width, css('._payment-option-icon svg').height],
        actions: [...element.querySelectorAll('._payment-step-actions button')].map(button => {
          const style = getComputedStyle(button);
          return [style.fontSize, style.fontWeight];
        }),
        cardBackgrounds: [...element.querySelectorAll('._payment-option-card')].map(card => getComputedStyle(card).backgroundColor),
        summaryBackground: css('._payment-summary-card').backgroundColor,
      };
    });
    if (viewport.width >= 1200) {
      expect(paymentMeasurements).toEqual({
        label: '12px',
        specialty: ['17px', '700'],
        price: ['19.5px', '700'],
        method: ['14px', '700'],
        option: ['14.5px', '600'],
        subtitle: '13px',
        icon: ['40px', '40px'],
        svg: ['22px', '22px'],
        actions: [['12.6px', '500'], ['12.6px', '500']],
        iconBackgrounds: Array(3).fill('rgb(227, 242, 252)'),
        cardBackgrounds: Array(3).fill('rgb(255, 255, 255)'),
        summaryBackground: 'rgb(255, 255, 255)',
      });
    } else {
      expect(paymentMeasurements).toEqual({
        label: '12px',
        specialty: ['17px', '700'],
        price: ['20px', '700'],
        method: ['14px', '700'],
        option: ['15px', '600'],
        subtitle: '13px',
        icon: ['44px', '44px'],
        svg: ['22px', '22px'],
        actions: [['14px', '600'], ['14px', '600']],
        iconBackgrounds: Array(3).fill('rgb(227, 242, 252)'),
        cardBackgrounds: Array(3).fill('rgb(255, 255, 255)'),
        summaryBackground: 'rgb(255, 255, 255)',
      });
    }
    await page.screenshot({ path: path.join(output, `payment-select-${viewport.width}.png`), fullPage: true });

    if (viewport.width < 768) {
      await page.setViewportSize({ width: 390, height: 480 });
      await expect(page.locator('html')).toHaveClass(/tela-rolavel/, { timeout: 5000 });
      await expect(payment).toHaveCSS('margin-bottom', '28px');
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(payment.getByRole('button', { name: '← Voltar' })).toBeInViewport();
      await expect(payment.getByRole('button', { name: 'Cancelar' })).toBeInViewport();
      const noPaymentSpacing = await page.addStyleTag({ content: 'html.tela-rolavel ._payment-select-step { margin-bottom: 0 !important; }' });
      await page.screenshot({ path: path.join(output, 'payment-select-short-before-390x480.png'), fullPage: true });
      await noPaymentSpacing.evaluate(style => style.remove());
      await page.screenshot({ path: path.join(output, 'payment-select-short-after-390x480.png'), fullPage: true });

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('html')).not.toHaveClass(/tela-rolavel/);
      await expect(payment).toHaveCSS('margin-bottom', '0px');
    }

    await page.getByText('Usar outro cartão', { exact: true }).click();
    const backButton = page.getByRole('button', { name: '← Voltar', exact: true });
    await expect(backButton).toBeVisible();
    const backButtonTypography = await backButton.evaluate(button => {
      const style = getComputedStyle(button);
      return { fontSize: style.fontSize, fontWeight: style.fontWeight };
    });
    expect(backButtonTypography).toEqual(viewport.width >= 1200
      ? { fontSize: '12.6px', fontWeight: '500' }
      : { fontSize: '14px', fontWeight: '600' });
    await page.screenshot({ path: path.join(output, `new-card-${viewport.width}.png`), fullPage: true });
    const overflow = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      bodyScrollHeight: document.body.scrollHeight,
    }));
    if (viewport.width >= 1200) {
      expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight);
    } else {
      await expect(page.locator('html')).not.toHaveClass(/tela-rolavel/);
      expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight);

      await page.setViewportSize({ width: 390, height: 480 });
      await expect(page.locator('html')).toHaveClass(/tela-rolavel/, { timeout: 5000 });
      await expect(page.locator('._payment-card-step')).toHaveCSS('margin-bottom', '28px');
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(page.getByRole('button', { name: 'Finalizar pagamento' })).toBeInViewport();
      await expect(backButton).toBeInViewport();
      const noCardSpacing = await page.addStyleTag({ content: 'html.tela-rolavel ._payment-card-step { margin-bottom: 0 !important; }' });
      await page.screenshot({ path: path.join(output, 'new-card-short-before-390x480.png'), fullPage: true });
      await noCardSpacing.evaluate(style => style.remove());
      await page.screenshot({ path: path.join(output, 'new-card-short-after-390x480.png'), fullPage: true });
      const reservedBottomSpace = await page.evaluate(() => {
        const style = getComputedStyle(document.querySelector('._payment-card-step'));
        return style.marginBottom;
      });
      expect(reservedBottomSpace).toBe('28px');
    }
  });
}
