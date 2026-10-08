import { useEffect, useRef, useState } from 'react';

export default function PaymentCardStep({ cardForm, setCardForm, onConfirmPayment, onBack, confirmModal }) {
  const [needsBottomSpace, setNeedsBottomSpace] = useState(null);
  const stepRef = useRef(null);

  useEffect(() => {
    const step = stepRef.current;
    if (!step) return undefined;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const previousMargin = step.style.marginBottom;
        const appContent = document.querySelector('.app-content');
        const previousPadding = appContent?.style.getPropertyValue('padding-bottom') || '';
        const previousPriority = appContent?.style.getPropertyPriority('padding-bottom') || '';
        const previousTransition = appContent?.style.getPropertyValue('transition-duration') || '';
        const previousTransitionPriority = appContent?.style.getPropertyPriority('transition-duration') || '';
        const desktopLayout = window.innerWidth >= 768;
        // Mobile keeps the bottom-nav reserve; account for it without toggling its layout.
        const mobileStructuralPadding = desktopLayout ? 0 : parseFloat(getComputedStyle(appContent).paddingBottom) || 0;
        step.style.marginBottom = '0px';
        if (desktopLayout) {
          appContent?.style.setProperty('transition-duration', '0s', 'important');
          appContent?.style.setProperty('padding-bottom', '0px', 'important');
        }
        const contentHeight = document.documentElement.scrollHeight - (desktopLayout ? 0 : mobileStructuralPadding);
        const needsSpace = contentHeight > document.documentElement.clientHeight;
        step.style.marginBottom = previousMargin;
        if (desktopLayout) {
          if (previousPadding) appContent.style.setProperty('padding-bottom', previousPadding, previousPriority);
          else appContent?.style.removeProperty('padding-bottom');
          if (appContent) void getComputedStyle(appContent).paddingBottom;
          if (previousTransition) appContent.style.setProperty('transition-duration', previousTransition, previousTransitionPriority);
          else appContent?.style.removeProperty('transition-duration');
        }
        if (window.innerWidth >= 768 && !needsSpace) appContent?.classList.add('_issue-68-card-static');
        else appContent?.classList.remove('_issue-68-card-static');
        void document.documentElement.scrollHeight;
        if (window.scrollY !== scrollY) window.scrollTo(window.scrollX, scrollY);
        setNeedsBottomSpace(needsSpace);
      });
    };
    const content = document.querySelector('.content-wrapper');
    const observer = new ResizeObserver(measure);
    observer.observe(step);
    if (content) observer.observe(content);
    window.addEventListener('resize', measure);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', measure);
      const scrollY = window.scrollY;
      document.querySelector('.app-content')?.classList.remove('_issue-68-card-static');
      void document.documentElement.scrollHeight;
      if (window.scrollY !== scrollY) window.scrollTo(window.scrollX, scrollY);
    };
  }, []);

  return (
    <>
      <div
        ref={stepRef}
        className={`_payment-card-step${needsBottomSpace === true ? ' _payment-card-step--scrollable' : ''}${needsBottomSpace === false ? ' _payment-card-step--static' : ''}`}
        style={{ maxWidth: 480, margin: '0 auto', marginBottom: needsBottomSpace ? 28 : 0 }}
      >
        <div className="card">
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <h6 style={{ margin: 0, fontWeight: 700, color: '#5e5873' }}>Dados do Cartão</h6>
          </div>
          <div className="card-body">
            <div className="form-group mb-1">
              <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Número do cartão</label>
              <input
                type="text"
                className="form-control"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={cardForm.number}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '');
                  const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
                  setCardForm(f => ({ ...f, number: formatted }));
                }}
              />
            </div>
            <div className="form-group mb-1">
              <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Nome do titular</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nome impresso no cartão"
                value={cardForm.name}
                onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="row">
              <div className="col-6">
                <div className="form-group mb-1">
                  <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>Validade</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cardForm.expiry}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '');
                      setCardForm(f => ({ ...f, expiry: v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v }));
                    }}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group mb-1">
                  <label style={{ fontSize: 13, color: '#6e6b7b', display: 'block', marginBottom: 4 }}>CVV</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="000"
                    maxLength={4}
                    value={cardForm.cvv}
                    onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={onConfirmPayment}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: 24, fontWeight: 700, marginTop: 10 }}
            >
              Finalizar pagamento
            </button>
          </div>
        </div>
        <button
          onClick={onBack}
          className="_payment-card-back"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6e6b7b', fontWeight: 600, fontSize: 14, marginTop: 12, padding: '4px 0' }}
        >
          ← Voltar
        </button>
      </div>
      {confirmModal}
    </>
  );
}
