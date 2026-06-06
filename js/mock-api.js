/* ============================================================
   MARSHALLS -- Mock API Interceptor
   Intercepta XMLHttpRequest para api-marshalls.com e retorna
   dados mockados após um delay (skeleton effect).
   ============================================================ */
(function () {
  'use strict';

  var DELAY = 1800; // ms de skeleton antes de exibir dados

  /* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function month(mm, yyyy, revenue, entries, expenses, taxes, rbt12, rbt12p, range, limit, rate) {
    var pad = mm < 10 ? '0' + mm : '' + mm;
    return {
      tax_period: pad + '-' + yyyy,
      revenue:    revenue,
      entries:    entries,
      expenses:   expenses,
      taxes:      taxes,
      rbt12:      rbt12,
      rbt12p:     rbt12p,
      range:      range,
      limit:      limit,
      rate:       rate
    };
  }

  /* â”€â”€ Dados mensais (todos em centavos) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  //  tax_period    rev       ent        exp      tax      rbt12     rbt12p   faixa  limite    rate
  var months2024 = [
    month( 1, 2024,  980000, 1180000,  220000,  58800, 10800000,  9200000, 1, 18000000, 6.0),
    month( 2, 2024, 1050000, 1260000,  230000,  63000, 11200000,  9600000, 1, 18000000, 6.0),
    month( 3, 2024, 1120000, 1340000,  245000,  67200, 11800000, 10100000, 1, 18000000, 6.0),
    month( 4, 2024, 1200000, 1440000,  250000,  72000, 12500000, 10800000, 1, 18000000, 6.0),
    month( 5, 2024, 1350000, 1620000,  260000,  81000, 13200000, 11500000, 1, 18000000, 6.0),
    month( 6, 2024, 1280000, 1540000,  255000,  76800, 13600000, 11900000, 1, 18000000, 6.0),
    month( 7, 2024, 1380000, 1660000,  270000,  82800, 14100000, 12400000, 1, 18000000, 6.0),
    month( 8, 2024, 1450000, 1740000,  280000,  87000, 14700000, 12900000, 1, 18000000, 6.0),
    month( 9, 2024, 1300000, 1560000,  265000,  78000, 15000000, 13200000, 1, 18000000, 6.0),
    month(10, 2024, 1600000, 1920000,  295000,  96000, 15800000, 13900000, 1, 18000000, 6.0),
    month(11, 2024, 1750000, 2100000,  310000, 105000, 16500000, 14500000, 1, 18000000, 6.0),
    month(12, 2024, 1900000, 2280000,  320000, 114000, 17200000, 15100000, 1, 18000000, 6.0)
  ];

  var months2025 = [
    month( 1, 2025, 1420000, 1704000,  285000,  85200, 15800000, 13900000, 1, 18000000, 6.0),
    month( 2, 2025, 1580000, 1896000,  300000,  94800, 16300000, 14300000, 1, 18000000, 6.0),
    month( 3, 2025, 1650000, 1980000,  315000,  99000, 16900000, 14800000, 1, 18000000, 6.0),
    month( 4, 2025, 1720000, 2064000,  325000, 103200, 17500000, 15400000, 1, 18000000, 6.0),
    month( 5, 2025, 1850000, 2220000,  340000, 111000, 18100000, 15900000, 2, 36000000, 11.2),
    month( 6, 2025, 1780000, 2136000,  330000, 106800, 18600000, 16400000, 2, 36000000, 11.2),
    month( 7, 2025, 1920000, 2304000,  355000, 115200, 19200000, 16900000, 2, 36000000, 11.2),
    month( 8, 2025, 2050000, 2460000,  370000, 123000, 19900000, 17500000, 2, 36000000, 11.2),
    month( 9, 2025, 1980000, 2376000,  360000, 118800, 20400000, 17900000, 2, 36000000, 11.2),
    month(10, 2025, 2200000, 2640000,  390000, 132000, 21100000, 18500000, 2, 36000000, 11.2),
    month(11, 2025, 2350000, 2820000,  410000, 141000, 21900000, 19200000, 2, 36000000, 11.2),
    month(12, 2025, 2480000, 2976000,  425000, 148800, 22600000, 19800000, 2, 36000000, 11.2)
  ];

  /* â”€â”€ Distribuição de lucros â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function profitMonths(year) {
    var baseAmounts = [410000,480000,500000,520000,550000,530000,560000,590000,570000,620000,660000,680000];
    return baseAmounts.map(function (amt, idx) {
      var mm = idx + 1;
      return { period: (mm < 10 ? '0' + mm : '' + mm), directors: [{ director_id: 1, amount: amt }] };
    });
  }

  /* â”€â”€ Respostas mockadas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  var MOCK = {
    '/company/finance': function () {
      return {
        finance: {
          '2024': months2024,
          '2025': months2025
        },
        simples: {
          rbt12:      22600000,
          rbt12p:     19800000,
          range:      2,
          limit:      36000000,
          anex:       3,
          anexes:     [3],
          next_rates: [11.2]
        },
        profitDistribution: {
          '2024': {
            total: 5670000,
            directors: [{ director_id: 1, name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS', total: 5670000 }],
            months: profitMonths(2024)
          },
          '2025': {
            total: 6670000,
            directors: [{ director_id: 1, name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS', total: 6670000 }],
            months: profitMonths(2025)
          }
        }
      };
    },

    '/company/details': function () {
      return {
        id: 1,
        name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS',
        tax_regime: 'simples_nacional',
        cnpj: '00.000.000/0001-00',
        opened_at: '2020-01-01',
        tax_period_start: '01-2020',
        taxes: [
          { id: 1, status: 'paid',    tax_period: '03-2025', due_at: '2025-04-20', file_link: 'https://example.com/file1.pdf' },
          { id: 2, status: 'paid',    tax_period: '04-2025', due_at: '2025-05-20', file_link: 'https://example.com/file2.pdf' },
          { id: 3, status: 'pending', tax_period: '05-2025', due_at: '2025-06-20', file_link: null }
        ]
      };
    },

    '/user': function () {
      return {
        id: 1,
        name: 'João Demo',
        email: 'demo@marshalls.com',
        role: 1,
        group: null,
        registerComplete: true,
        profileComplete: true,
        affiliate: false,
        force_login: 0,
          companies: [{ id: 1, name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS', opened_at: '2020-01-01' }],
        ability: [
          { action: 'read', subject: 'panel' },
          { action: 'read', subject: 'user' },
          { action: 'read', subject: 'companies' },
          { action: 'read', subject: 'taxes' },
          { action: 'read', subject: 'subscriptions' },
          { action: 'read', subject: 'digital_certificate' },
          { action: 'read', subject: 'companies_list' },
          { action: 'read', subject: 'affiliate' },
          { action: 'read', subject: 'checkout' }
        ]
      };
    }
  };

  /* â”€â”€ Detecta qual mock usar baseado na URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function getMock(url) {
    for (var pattern in MOCK) {
      if (url.indexOf(pattern) !== -1) {
        return MOCK[pattern];
      }
    }
    return null;
  }

  /* â”€â”€ Interceptor de XMLHttpRequest â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  var _open = XMLHttpRequest.prototype.open;
  var _send = XMLHttpRequest.prototype.send;
  var _setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this._mockFn  = null;
    this._mockUrl = url;

    if (typeof url === 'string' && url.indexOf('api-marshalls.com') !== -1) {
      this._mockFn = getMock(url);
    }

    if (!this._mockFn) {
      return _open.apply(this, arguments);
    }
    // Para requests mockados: não abrimos o XHR real
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (!this._mockFn) {
      return _setRequestHeader.apply(this, arguments);
    }
    // Ignora headers em requests mockados
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (!this._mockFn) {
      return _send.apply(this, arguments);
    }

    var self = this;
    var mockFn = self._mockFn;

    setTimeout(function () {
      var data = mockFn();
      var json = JSON.stringify(data);

      Object.defineProperty(self, 'readyState',    { get: function () { return 4; },    configurable: true });
      Object.defineProperty(self, 'status',        { get: function () { return 200; },  configurable: true });
      Object.defineProperty(self, 'statusText',    { get: function () { return 'OK'; }, configurable: true });
      Object.defineProperty(self, 'response',      { get: function () { return json; }, configurable: true });
      Object.defineProperty(self, 'responseText',  { get: function () { return json; }, configurable: true });
      Object.defineProperty(self, 'responseURL',   { get: function () { return self._mockUrl; }, configurable: true });

      if (typeof self.onreadystatechange === 'function') {
        self.onreadystatechange.call(self);
      }
      if (typeof self.onload === 'function') {
        self.onload.call(self);
      }

      var loadEvent = new Event('load');
      self.dispatchEvent(loadEvent);
      var loadendEvent = new Event('loadend');
      self.dispatchEvent(loadendEvent);
    }, DELAY);
  };

  /* getResponseHeader e getAllResponseHeaders para compatibilidade com axios */
  var _getResponseHeader    = XMLHttpRequest.prototype.getResponseHeader;
  var _getAllResponseHeaders = XMLHttpRequest.prototype.getAllResponseHeaders;

  XMLHttpRequest.prototype.getResponseHeader = function (name) {
    if (this._mockFn) {
      if (name.toLowerCase() === 'content-type') return 'application/json';
      return null;
    }
    return _getResponseHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.getAllResponseHeaders = function () {
    if (this._mockFn) {
      return 'content-type: application/json\r\n';
    }
    return _getAllResponseHeaders.apply(this, arguments);
  };

  console.log('[Mock API] Interceptor ativo para api-marshalls.com (delay: ' + DELAY + 'ms)');

  /* â”€â”€ Logo override via MutationObserver â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  var _repoBase = location.pathname.indexOf('/marshalls-customer-app-preview/') === 0 ? '/marshalls-customer-app-preview' : '';
  var LOGO_SVG = '<a href="/" class="brand-logo" style="display:inline-flex;align-items:center;">'
    + '<img src="' + _repoBase + '/img/MarshallsMed%20novo2_%20Med%20maior.png" alt="Logo" style="width:149.98px;height:46.55px;object-fit:contain;" />'
    + '</a>';

  function injectLogo() {
    var brandLogoSpan = document.querySelector('.navbar-brand .brand-logo');
    if (brandLogoSpan && !brandLogoSpan.dataset.logoInjected) {
      // Substitui o conteúdo (b-img) pelo SVG
      brandLogoSpan.innerHTML = LOGO_SVG;
      brandLogoSpan.dataset.logoInjected = '1';
    }
  }

  var _logoObserver = new MutationObserver(function () {
    injectLogo();
  });

  /* â”€â”€ CSS shims: evita CSS_CHUNK_LOAD_FAILED para chunks ausentes â”€â”€ */
  (function () {
    var missingCss = [
      '/css/chunk-0d36f369.d73247e7.css',
      '/css/chunk-cf639660.9b1e46c4.css',
      '/css/chunk-5b77a0d8.9b1e46c4.css',
      '/css/chunk-8e696c16.2119b9b7.css',
      '/css/chunk-a994ecf2.e03da3c8.css',
      '/css/chunk-7d76483f.d514bd62.css',
      '/css/chunk-665fac01.582154b3.css',
      '/css/chunk-1e1e2ade.f6fbe297.css',
      '/css/chunk-546837cd.4f19eb0b.css',
      '/css/chunk-3419fd6c.c82b503b.css'
    ];
    missingCss.forEach(function (href) {
      var el = document.createElement('link');
      el.rel = 'stylesheet';
      el.setAttribute('data-href', _repoBase + href);
      document.head.appendChild(el);
    });
  })();

  /* â”€â”€ Chunks de rotas registrados via webpackJsonp (antes do app.js) â”€â”€ */
  (function () {
    var wp = window['webpackJsonp'] = window['webpackJsonp'] || [];

    /* helper: badge de status */
    function badge(h, status) {
      var map = {
        paid:     { v: 'success',   l: 'Pago' },
        pending:  { v: 'warning',   l: 'Pendente' },
        overdue:  { v: 'danger',    l: 'Atrasado' },
        sent:     { v: 'info',      l: 'Enviado' },
        canceled: { v: 'secondary', l: 'Cancelado' }
      };
      var m = map[status] || { v: 'secondary', l: status };
      return h('b-badge', { attrs: { variant: m.v, pill: true } }, m.l);
    }

    /* helper: coluna de informação */
    function infoCol(h, label, value) {
      return h('div', { staticClass: 'col-12 col-md-6 mb-2' }, [
        h('div', { staticClass: 'text-muted small mb-25' }, label),
        h('div', { staticClass: 'font-weight-bold' }, value || 'â€”')
      ]);
    }

    /* helper: card de estatística (padrão panel-resume) */
    function statCard(h, value, label, icon, variant) {
      return h('div', { staticClass: 'card mb-1' }, [
        h('div', { staticClass: 'card-body d-flex justify-content-between align-items-center' }, [
          h('div', { staticClass: 'truncate' }, [
            h('h4', { staticClass: 'mb-25 font-weight-bolder' }, value),
            h('span', label)
          ]),
          h('b-avatar', {
            attrs: { variant: variant, size: '45', rounded: '' }
          }, [h('feather-icon', { attrs: { icon: icon, size: '21' } })])
        ])
      ]);
    }

    /* â”€â”€ LayoutFull (chunk-2d22bcc3 â†’ "f102") */
    wp.push([['chunk-2d22bcc3'], {
      'f102': function (t, e) {
        e.__esModule = true;
        e.default = {
          name: 'LayoutFull',
          render: function (h) {
            return h('div', { staticClass: 'misc-wrapper' }, this.$slots.default || []);
          }
        };
      }
    }]);

    /* â”€â”€ chunks compartilhados (sem entry point próprio) */
    wp.push([['chunk-d0a9a6f8'], {}]);
    wp.push([['chunk-8d89d014'], {}]);
    wp.push([['chunk-20680bbe'], {}]);

    /* â”€â”€ /empresa/detalhes (chunk-0d36f369 â†’ "8f8c") */
    wp.push([['chunk-0d36f369'], {
      '8f8c': function (t, e) {
        e.__esModule = true;
        e.default = {
          computed: {
            company: function () { return this.$store.state.authenticate.companySelected || {}; }
          },
          render: function (h) {
            var c = this.company;
            var regimeMap = { simples_nacional: 'Simples Nacional', lucro_presumido: 'Lucro Presumido', lucro_real: 'Lucro Real' };
            var regime = regimeMap[c.tax_regime] || c.tax_regime || 'â€”';
            var openDate = c.opened_at ? c.opened_at.split('-').reverse().join('/') : 'â€”';
            var guias = [
              { period: '03/2025', type: 'DAS', value: 'R$ 990,00',   due: '20/04/2025', status: 'paid' },
              { period: '04/2025', type: 'DAS', value: 'R$ 1.032,00', due: '20/05/2025', status: 'paid' },
              { period: '05/2025', type: 'DAS', value: 'R$ 1.110,00', due: '20/06/2025', status: 'pending' }
            ];
            return h('div', [
              /* Stat row */
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-6 col-md-3' }, [statCard(h, 'Simples Nacional', 'Regime tributário', 'BriefcaseIcon', 'light-primary')]),
                h('div', { staticClass: 'col-6 col-md-3' }, [statCard(h, 'Ativo', 'Status da empresa', 'CheckCircleIcon', 'light-success')]),
                h('div', { staticClass: 'col-6 col-md-3' }, [statCard(h, '1', 'Sócio(s)', 'UsersIcon', 'light-info')]),
                h('div', { staticClass: 'col-6 col-md-3' }, [statCard(h, '5 anos', 'Tempo de abertura', 'CalendarIcon', 'light-warning')])
              ]),
              /* Main content row */
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-12 col-lg-8' }, [
                  h('div', { staticClass: 'card' }, [
                    h('div', { staticClass: 'card-header' }, [
                      h('div', { staticClass: 'd-flex align-items-center' }, [
                        h('feather-icon', { attrs: { icon: 'BriefcaseIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                        h('h4', { staticClass: 'mb-0' }, 'Dados da empresa')
                      ])
                    ]),
                    h('div', { staticClass: 'card-body' }, [
                      h('div', { staticClass: 'row' }, [
                        infoCol(h, 'Razão Social', c.name || 'MARSHALLS CORPORATE AND DIGITAL BUSINESS'),
                        infoCol(h, 'CNPJ', '00.000.000/0001-00'),
                        infoCol(h, 'Regime Tributário', regime),
                        infoCol(h, 'Data de Abertura', openDate),
                        infoCol(h, 'CNAE Principal', '62.01-5-01 â€“ Desenvolvimento de software'),
                        infoCol(h, 'E-mail Fiscal', 'fiscal@marshalls.com.br'),
                        infoCol(h, 'Telefone', '(11) 99999-9999'),
                        infoCol(h, 'Sócio Administrador', 'Usuário Demo')
                      ])
                    ])
                  ])
                ]),
                h('div', { staticClass: 'col-12 col-lg-4' }, [
                  h('div', { staticClass: 'card' }, [
                    h('div', { staticClass: 'card-header' }, [
                      h('div', { staticClass: 'd-flex align-items-center' }, [
                        h('feather-icon', { attrs: { icon: 'FileTextIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                        h('h4', { staticClass: 'mb-0' }, 'Guias recentes')
                      ])
                    ]),
                    h('ul', { staticClass: 'list-group list-group-flush' },
                      guias.map(function (g) {
                        return h('li', {
                          key: g.period,
                          staticClass: 'list-group-item d-flex justify-content-between align-items-center'
                        }, [
                          h('div', [
                            h('div', { staticClass: 'font-weight-bold' }, g.type + ' ' + g.period),
                            h('small', { staticClass: 'text-muted' }, 'Venc. ' + g.due)
                          ]),
                          h('div', { staticClass: 'text-right' }, [
                            h('div', { staticClass: 'font-weight-bold' }, g.value),
                            badge(h, g.status)
                          ])
                        ]);
                      })
                    )
                  ])
                ])
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /impostos (chunk-cf639660 â†’ "d58f5") */
    wp.push([['chunk-cf639660'], {
      'd58f5': function (t, e) {
        e.__esModule = true;
        var taxItems = [
          { id: 1, period: '01/2025', type: 'DAS', due: '20/02/2025', amount: 'R$ 852,00',   status: 'paid' },
          { id: 2, period: '02/2025', type: 'DAS', due: '20/03/2025', amount: 'R$ 948,00',   status: 'paid' },
          { id: 3, period: '03/2025', type: 'DAS', due: '20/04/2025', amount: 'R$ 990,00',   status: 'paid' },
          { id: 4, period: '04/2025', type: 'DAS', due: '20/05/2025', amount: 'R$ 1.032,00', status: 'paid' },
          { id: 5, period: '05/2025', type: 'DAS', due: '20/06/2025', amount: 'R$ 1.110,00', status: 'pending' }
        ];
        e.default = {
          data: function () { return { items: taxItems }; },
          methods: {
            goDetail: function (id) { this.$router.push({ name: 'impostos/id', params: { id: String(id) } }); }
          },
          render: function (h) {
            var self = this;
            var paid = self.items.filter(function (x) { return x.status === 'paid'; });
            var pending = self.items.filter(function (x) { return x.status === 'pending'; });
            return h('div', [
              /* Stat row */
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-6 col-md-4' }, [statCard(h, String(paid.length), 'Impostos pagos', 'CheckCircleIcon', 'light-success')]),
                h('div', { staticClass: 'col-6 col-md-4' }, [statCard(h, String(pending.length), 'Pendentes', 'AlertCircleIcon', 'light-warning')]),
                h('div', { staticClass: 'col-12 col-md-4' }, [statCard(h, 'R$ 3.822,00', 'Total pago no período', 'DollarSignIcon', 'light-primary')])
              ]),
              /* List card */
              h('div', { staticClass: 'card' }, [
                h('div', { staticClass: 'card-header' }, [
                  h('div', { staticClass: 'd-flex align-items-center' }, [
                    h('feather-icon', { attrs: { icon: 'FileTextIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                    h('h4', { staticClass: 'mb-0' }, 'Histórico de impostos')
                  ])
                ]),
                h('ul', { staticClass: 'list-group list-group-flush' },
                  self.items.map(function (tx) {
                    return h('li', {
                      key: tx.id,
                      staticClass: 'list-group-item d-flex justify-content-between align-items-center',
                      style: { cursor: 'pointer' },
                      on: { click: function () { self.goDetail(tx.id); } }
                    }, [
                      h('div', { staticClass: 'd-flex align-items-center' }, [
                        h('b-avatar', {
                          attrs: { variant: tx.status === 'paid' ? 'light-success' : 'light-warning', size: '38', rounded: '' },
                          staticClass: 'mr-1'
                        }, [h('feather-icon', { attrs: { icon: 'FileTextIcon', size: '16' } })]),
                        h('div', [
                          h('div', { staticClass: 'font-weight-bold' }, tx.type + ' â€“ Competência ' + tx.period),
                          h('small', { staticClass: 'text-muted' }, 'Vencimento: ' + tx.due)
                        ])
                      ]),
                      h('div', { staticClass: 'd-flex align-items-center' }, [
                        h('span', { staticClass: 'font-weight-bold mr-75' }, tx.amount),
                        badge(h, tx.status)
                      ])
                    ]);
                  })
                )
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /declaracoes (chunk-5b77a0d8 â†’ "bed4") */
    wp.push([['chunk-5b77a0d8'], {
      'bed4': function (t, e) {
        e.__esModule = true;
        var declItems = [
          { id: 1, period: '01/2025', type: 'DASN-Simei', due: '31/01/2025', sent: '15/01/2025', status: 'sent' },
          { id: 2, period: '01/2025', type: 'DEFIS',      due: '31/03/2025', sent: '10/03/2025', status: 'sent' },
          { id: 3, period: '12/2024', type: 'DeSTDA',     due: '20/01/2025', sent: '18/01/2025', status: 'sent' },
          { id: 4, period: '01/2025', type: 'DeSTDA',     due: '20/02/2025', sent: '19/02/2025', status: 'sent' },
          { id: 5, period: '02/2025', type: 'DeSTDA',     due: '20/03/2025', sent: null,         status: 'pending' }
        ];
        e.default = {
          data: function () { return { items: declItems }; },
          methods: {
            goDetail: function (id) { this.$router.push({ name: 'declaracoes/id', params: { id: String(id) } }); }
          },
          render: function (h) {
            var self = this;
            var sent = self.items.filter(function (x) { return x.status === 'sent'; });
            var pending = self.items.filter(function (x) { return x.status === 'pending'; });
            return h('div', [
              /* Stat row */
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-6 col-md-4' }, [statCard(h, String(sent.length), 'Declarações enviadas', 'SendIcon', 'light-success')]),
                h('div', { staticClass: 'col-6 col-md-4' }, [statCard(h, String(pending.length), 'Pendentes', 'ClockIcon', 'light-warning')]),
                h('div', { staticClass: 'col-12 col-md-4' }, [statCard(h, String(self.items.length), 'Total de declarações', 'CalendarIcon', 'light-primary')])
              ]),
              /* List card */
              h('div', { staticClass: 'card' }, [
                h('div', { staticClass: 'card-header' }, [
                  h('div', { staticClass: 'd-flex align-items-center' }, [
                    h('feather-icon', { attrs: { icon: 'CalendarIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                    h('h4', { staticClass: 'mb-0' }, 'Histórico de declarações')
                  ])
                ]),
                h('ul', { staticClass: 'list-group list-group-flush' },
                  self.items.map(function (d) {
                    return h('li', {
                      key: d.id,
                      staticClass: 'list-group-item d-flex justify-content-between align-items-center',
                      style: { cursor: 'pointer' },
                      on: { click: function () { self.goDetail(d.id); } }
                    }, [
                      h('div', { staticClass: 'd-flex align-items-center' }, [
                        h('b-avatar', {
                          attrs: { variant: d.status === 'sent' ? 'light-success' : 'light-warning', size: '38', rounded: '' },
                          staticClass: 'mr-1'
                        }, [h('feather-icon', { attrs: { icon: 'CalendarIcon', size: '16' } })]),
                        h('div', [
                          h('div', { staticClass: 'font-weight-bold' }, d.type + ' â€“ ' + d.period),
                          h('small', { staticClass: 'text-muted' }, d.sent ? 'Enviada em ' + d.sent : 'Prazo: ' + d.due)
                        ])
                      ]),
                      badge(h, d.status)
                    ]);
                  })
                )
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /assinaturas (chunk-8e696c16 â†’ "6c5e") */
    wp.push([['chunk-8e696c16'], {
      '6c5e': function (t, e) {
        e.__esModule = true;
        e.default = {
          render: function (h) {
            var features = [
              'Contabilidade completa',
              'Emissão de guias DAS',
              'Declarações acessórias',
              'Suporte prioritário',
              'Certificado digital e-CPF',
              'Gestão de impostos'
            ];
            return h('div', [
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-12 col-md-6 offset-md-3' }, [
                  /* Titular info lines */
                  h('h4', { staticClass: 'mb-25', style: { fontWeight: '600', fontSize: '1.1rem', color: '#5e5873' } }, 'Plano de Assinatura Individual'),
                  h('p', { staticClass: 'text-muted mb-2' }, [
                    'Titular Responsável: José da Silva\u00a0–\u00a0CPF 432.198.765-09'
                  ]),
                  /* Status stat */
                  statCard(h, 'Ativa', 'Status da assinatura', 'CheckCircleIcon', 'light-success'),
                  /* Plan card */
                  h('div', { staticClass: 'card' }, [
                    h('div', { staticClass: 'card-header' }, [
                      h('div', { staticClass: 'd-flex align-items-center' }, [
                        h('feather-icon', { attrs: { icon: 'CreditCardIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                        h('h4', { staticClass: 'mb-0' }, 'Minha assinatura')
                      ])
                    ]),
                    h('div', { staticClass: 'card-body' }, [
                      h('div', { staticClass: 'text-center py-1' }, [
                        h('h2', { staticClass: 'text-primary mb-25 font-weight-bolder' }, 'Plano Pro'),
                        h('p', { staticClass: 'text-muted mb-50' }, 'Acesso completo a todas as funcionalidades do Marshalls'),
                        h('div', { staticClass: 'my-1' }, [
                          h('h3', { staticClass: 'font-weight-bolder' }, [
                            h('span', { staticClass: 'text-primary' }, 'R$ 149'),
                            h('small', { staticClass: 'text-muted font-weight-normal' }, '/mês')
                          ])
                        ]),
                        h('hr')
                      ]),
                      h('ul', { staticClass: 'list-group list-group-flush' },
                        features.map(function (f) {
                          return h('li', { staticClass: 'list-group-item d-flex align-items-center px-0' }, [
                            h('b-avatar', {
                              attrs: { variant: 'light-success', size: '24', rounded: '' },
                              staticClass: 'mr-1'
                            }, [h('feather-icon', { attrs: { icon: 'CheckIcon', size: '12' } })]),
                            h('span', f)
                          ]);
                        })
                      ),
                      h('hr'),
                      h('div', { staticClass: 'text-center mt-1' }, [
                        h('p', { staticClass: 'text-muted small mb-1' }, 'Próxima cobrança: 01/06/2025 Â· Renovação automática'),
                        h('b-button', { attrs: { variant: 'outline-primary', size: 'sm' } }, 'Gerenciar pagamento')
                      ])
                    ])
                  ])
                ])
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /perfil (chunk-a994ecf2 â†’ "6617") */
    wp.push([['chunk-a994ecf2'], {
      '6617': function (t, e) {
        e.__esModule = true;
        e.default = {
          computed: {
            user: function () { return this.$store.state.authenticate.userInfo || {}; }
          },
          render: function (h) {
            var u = this.user;
            return h('div', [
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-12 col-md-8 offset-md-2' }, [
                  h('div', { staticClass: 'card' }, [
                    h('div', { staticClass: 'card-header' }, [
                      h('div', { staticClass: 'd-flex align-items-center' }, [
                        h('feather-icon', { attrs: { icon: 'UserIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                        h('h4', { staticClass: 'mb-0' }, 'Dados pessoais')
                      ])
                    ]),
                    h('div', { staticClass: 'card-body' }, [
                      h('div', { staticClass: 'text-center mb-2' }, [
                        h('b-avatar', {
                          attrs: { size: '90', variant: 'light-primary', text: (u.name || 'U').charAt(0), rounded: 'circle' }
                        }),
                        h('h5', { staticClass: 'mt-1 mb-25 font-weight-bolder' }, u.name || 'Usuário Demo'),
                        h('p', { staticClass: 'text-muted small mb-0' }, u.role === 0 ? 'Usuário' : 'Administrador')
                      ]),
                      h('hr'),
                      h('div', { staticClass: 'row' }, [
                        infoCol(h, 'Nome completo', u.name || 'Usuário Demo'),
                        infoCol(h, 'E-mail', u.email || 'demo@marshalls.com'),
                        infoCol(h, 'CPF', '000.000.000-00'),
                        infoCol(h, 'Telefone', '(11) 99999-9999'),
                        infoCol(h, 'Data de nascimento', '01/01/1990'),
                        infoCol(h, 'Perfil', u.role === 0 ? 'Usuário' : 'Administrador')
                      ])
                    ])
                  ])
                ])
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /certificado-digital (chunk-7d76483f â†’ "eb67") */
    wp.push([['chunk-7d76483f'], {
      'eb67': function (t, e) {
        e.__esModule = true;
        e.default = {
          render: function (h) {
            return h('div', [
              /* Stat row */
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-6 col-md-4' }, [statCard(h, 'e-CPF A1', 'Tipo do certificado', 'ServerIcon', 'light-primary')]),
                h('div', { staticClass: 'col-6 col-md-4' }, [statCard(h, '15/03/2026', 'Validade', 'CalendarIcon', 'light-success')]),
                h('div', { staticClass: 'col-12 col-md-4' }, [statCard(h, '306 dias', 'Dias restantes', 'ClockIcon', 'light-warning')])
              ]),
              /* Main card */
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-12 col-md-8 offset-md-2' }, [
                  h('div', { staticClass: 'card' }, [
                    h('div', { staticClass: 'card-header' }, [
                      h('div', { staticClass: 'd-flex align-items-center justify-content-between w-100' }, [
                        h('div', { staticClass: 'd-flex align-items-center' }, [
                          h('feather-icon', { attrs: { icon: 'ServerIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                          h('h4', { staticClass: 'mb-0' }, 'Certificado Digital e-CPF')
                        ]),
                        h('b-badge', { attrs: { variant: 'light-success', pill: true } }, 'âœ“  Válido')
                      ])
                    ]),
                    h('div', { staticClass: 'card-body' }, [
                      h('div', { staticClass: 'row' }, [
                        infoCol(h, 'Titular', 'Usuário Demo'),
                        infoCol(h, 'CPF', '000.000.000-00'),
                        infoCol(h, 'Tipo', 'e-CPF A1'),
                        infoCol(h, 'Autoridade Certificadora', 'Serasa AC'),
                        infoCol(h, 'Emitido em', '15/03/2023'),
                        infoCol(h, 'Validade', '15/03/2026')
                      ])
                    ])
                  ])
                ])
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /empresas (chunk-665fac01 â†’ "6382") â€“ layout: full */
    wp.push([['chunk-665fac01'], {
      '6382': function (t, e) {
        e.__esModule = true;
        e.default = {
          computed: {
            user:    function () { return this.$store.state.authenticate.userInfo || {}; },
            company: function () { return this.$store.state.authenticate.companySelected; }
          },
          methods: {
            select: function (company) {
              this.$store.commit('SET_COMPANY_SELECTED', company);
              localStorage.setItem('COMPANY_SELECTED', JSON.stringify(company));
              this.$router.push({ name: 'painel' });
            }
          },
          render: function (h) {
            var self = this;
            var companies = self.user.companies || [
              { id: 1, name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS', opened_at: '2020-01-01' }
            ];
            return h('div', {
              staticClass: 'd-flex align-items-center justify-content-center',
              style: { minHeight: '100vh', background: '#f8f8f8', padding: '2rem' }
            }, [
              h('div', { style: { width: '100%', maxWidth: '480px' } }, [
                h('div', { staticClass: 'text-center mb-2' }, [
                  h('h3', { staticClass: 'font-weight-bolder' }, 'Selecionar empresa'),
                  h('p', { staticClass: 'text-muted' }, 'Escolha a empresa que deseja acessar')
                ]),
                h('div', {},
                  companies.map(function (co) {
                    var selected = self.company && self.company.id === co.id;
                    return h('div', {
                      key: co.id,
                      staticClass: 'card mb-1',
                      style: { cursor: 'pointer', border: selected ? '2px solid #0090ff' : '1px solid #ebe9f1' },
                      on: { click: function () { self.select(co); } }
                    }, [
                      h('div', { staticClass: 'card-body d-flex align-items-center justify-content-between' }, [
                        h('div', { staticClass: 'd-flex align-items-center' }, [
                          h('b-avatar', { attrs: { variant: 'light-primary', text: co.name.charAt(0), size: '48', rounded: '' }, staticClass: 'mr-1' }),
                          h('div', [
                            h('div', { staticClass: 'font-weight-bold' }, co.name),
                            h('small', { staticClass: 'text-muted' }, 'Abertura: ' + (co.opened_at || '').split('-').reverse().join('/'))
                          ])
                        ]),
                        selected
                          ? h('feather-icon', { attrs: { icon: 'CheckCircleIcon', size: '20' }, staticClass: 'text-primary' })
                          : h('feather-icon', { attrs: { icon: 'ChevronRightIcon', size: '20' }, staticClass: 'text-muted' })
                      ])
                    ]);
                  })
                )
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /parceiros (chunk-a924f88a â†’ "1aa8") */
    wp.push([['chunk-a924f88a'], {
      '1aa8': function (t, e) {
        e.__esModule = true;
        var partners = [
          { name: 'Notasy',        desc: 'Emissão de notas fiscais integrada ao seu faturamento', icon: 'FileIcon',       variant: 'light-primary', url: 'https://notasy.com.br' },
          { name: 'Conta Simples', desc: 'Conta bancária PJ com múltiplos cartões de crédito',   icon: 'CreditCardIcon', variant: 'light-success', url: 'https://lp.contasimples.com/contasy' },
          { name: 'Appmax',        desc: 'Gateway de pagamentos com 98% de taxa de aprovação',   icon: 'TrendingUpIcon', variant: 'light-warning', url: 'https://appmax.com.br' },
          { name: 'Jusbrasil',     desc: 'Consulta jurídica e acompanhamento de processos',      icon: 'BookIcon',       variant: 'light-info',    url: 'https://jusbrasil.com.br' }
        ];
        e.default = {
          render: function (h) {
            return h('div', [
              /* Header card */
              h('div', { staticClass: 'card mb-1' }, [
                h('div', { staticClass: 'card-header' }, [
                  h('div', { staticClass: 'd-flex align-items-center' }, [
                    h('feather-icon', { attrs: { icon: 'StarIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                    h('h4', { staticClass: 'mb-0' }, 'Parceiros Marshalls')
                  ])
                ]),
                h('div', { staticClass: 'card-body' }, [
                  h('p', { staticClass: 'text-muted mb-0' }, 'Benefícios exclusivos para clientes Marshalls. Acesse as plataformas parceiras e aproveite as vantagens.')
                ])
              ]),
              /* Partner cards */
              h('div', { staticClass: 'row' }, partners.map(function (p) {
                  return h('div', { staticClass: 'col-12 col-md-6 mb-1', key: p.name }, [
                    h('div', { staticClass: 'card h-100' }, [
                      h('div', { staticClass: 'card-body d-flex align-items-start' }, [
                        h('b-avatar', {
                          attrs: { variant: p.variant, size: '54', rounded: '' },
                          staticClass: 'mr-1 flex-shrink-0'
                        }, [h('feather-icon', { attrs: { icon: p.icon, size: '22' } })]),
                        h('div', { staticClass: 'w-100' }, [
                          h('div', { staticClass: 'd-flex justify-content-between align-items-start mb-25' }, [
                            h('h5', { staticClass: 'mb-0 font-weight-bolder' }, p.name),
                            h('b-button', {
                              attrs: { variant: 'outline-primary', size: 'sm', href: p.url, target: '_blank' }
                            }, 'Acessar')
                          ]),
                          h('p', { staticClass: 'text-muted small mb-0' }, p.desc)
                        ])
                      ])
                    ])
                  ]);
                })
              )
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /impostos/:id (chunk-1e1e2ade â†’ "7110") */
    wp.push([['chunk-1e1e2ade'], {
      '7110': function (t, e) {
        e.__esModule = true;
        var taxData = {
          '1': { period: '01/2025', type: 'DAS', due: '20/02/2025', amount: 'R$ 852,00',   status: 'paid',    revenue: 'R$ 14.200,00', rate: '6,0%', faixa: '1Âª Faixa' },
          '2': { period: '02/2025', type: 'DAS', due: '20/03/2025', amount: 'R$ 948,00',   status: 'paid',    revenue: 'R$ 15.800,00', rate: '6,0%', faixa: '1Âª Faixa' },
          '3': { period: '03/2025', type: 'DAS', due: '20/04/2025', amount: 'R$ 990,00',   status: 'paid',    revenue: 'R$ 16.500,00', rate: '6,0%', faixa: '1Âª Faixa' },
          '4': { period: '04/2025', type: 'DAS', due: '20/05/2025', amount: 'R$ 1.032,00', status: 'paid',    revenue: 'R$ 17.200,00', rate: '6,0%', faixa: '1Âª Faixa' },
          '5': { period: '05/2025', type: 'DAS', due: '20/06/2025', amount: 'R$ 1.110,00', status: 'pending', revenue: 'R$ 18.500,00', rate: '6,0%', faixa: '1Âª Faixa' }
        };
        e.default = {
          computed: {
            tax: function () { return taxData[this.$route.params.id] || taxData['1']; }
          },
          methods: {
            back: function () { this.$router.go(-1); }
          },
          render: function (h) {
            var tx = this.tax;
            var self = this;
            return h('div', [
              /* Back button */
              h('div', { staticClass: 'row mb-1' }, [
                h('div', { staticClass: 'col' }, [
                  h('b-button', {
                    attrs: { variant: 'flat-secondary', size: 'sm' },
                    on: { click: function () { self.back(); } }
                  }, [
                    h('feather-icon', { attrs: { icon: 'ArrowLeftIcon', size: '14' }, staticClass: 'mr-50' }),
                    'Voltar'
                  ])
                ])
              ]),
              /* Stat row */
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-6 col-md-3' }, [statCard(h, tx.amount, 'Valor do imposto', 'DollarSignIcon', 'light-primary')]),
                h('div', { staticClass: 'col-6 col-md-3' }, [statCard(h, tx.revenue, 'Faturamento', 'TrendingUpIcon', 'light-info')]),
                h('div', { staticClass: 'col-6 col-md-3' }, [statCard(h, tx.rate, 'Alíquota efetiva', 'PercentIcon', 'light-warning')]),
                h('div', { staticClass: 'col-6 col-md-3' }, [statCard(h, tx.due, 'Vencimento', 'CalendarIcon', tx.status === 'paid' ? 'light-success' : 'light-danger')])
              ]),
              /* Detail card */
              h('div', { staticClass: 'card' }, [
                h('div', { staticClass: 'card-header' }, [
                  h('div', { staticClass: 'd-flex align-items-center justify-content-between w-100' }, [
                    h('div', { staticClass: 'd-flex align-items-center' }, [
                      h('feather-icon', { attrs: { icon: 'FileTextIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                      h('h4', { staticClass: 'mb-0' }, 'Detalhes do imposto')
                    ]),
                    badge(h, tx.status)
                  ])
                ]),
                h('div', { staticClass: 'card-body' }, [
                  h('div', { staticClass: 'row' }, [
                    infoCol(h, 'Competência',           tx.period),
                    infoCol(h, 'Tipo',                  tx.type),
                    infoCol(h, 'Vencimento',             tx.due),
                    infoCol(h, 'Valor',                  tx.amount),
                    infoCol(h, 'Faturamento do período', tx.revenue),
                    infoCol(h, 'Alíquota efetiva',       tx.rate),
                    infoCol(h, 'Faixa Simples Nacional', tx.faixa)
                  ]),
                  tx.status === 'paid'
                    ? h('b-alert', { attrs: { show: true, variant: 'success' }, staticClass: 'mt-1' }, [
                        h('feather-icon', { attrs: { icon: 'CheckCircleIcon', size: '14' }, staticClass: 'mr-50' }),
                        ' Imposto pago e quitado.'
                      ])
                    : h('div', { staticClass: 'd-flex justify-content-end mt-1' }, [
                        h('b-button', { attrs: { variant: 'primary' } }, [
                          h('feather-icon', { attrs: { icon: 'DownloadIcon', size: '14' }, staticClass: 'mr-50' }),
                          'Baixar guia DAS'
                        ])
                      ])
                ])
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /declaracoes/:id (chunk-546837cd â†’ "4f32") */
    wp.push([['chunk-546837cd'], {
      '4f32': function (t, e) {
        e.__esModule = true;
        var declData = {
          '1': { period: '01/2025', type: 'DASN-Simei', due: '31/01/2025', sent: '15/01/2025', status: 'sent',    protocol: 'DASN-2025-001234', obs: 'Declaração anual enviada com sucesso.' },
          '2': { period: '01/2025', type: 'DEFIS',      due: '31/03/2025', sent: '10/03/2025', status: 'sent',    protocol: 'DEFIS-2025-005678', obs: 'Declaração de informações socioeconômicas e fiscais.' },
          '3': { period: '12/2024', type: 'DeSTDA',     due: '20/01/2025', sent: '18/01/2025', status: 'sent',    protocol: 'DESTDA-2025-009012', obs: 'Declaração de substituição tributária.' },
          '4': { period: '01/2025', type: 'DeSTDA',     due: '20/02/2025', sent: '19/02/2025', status: 'sent',    protocol: 'DESTDA-2025-003456', obs: 'Declaração de substituição tributária.' },
          '5': { period: '02/2025', type: 'DeSTDA',     due: '20/03/2025', sent: null,         status: 'pending', protocol: null,                 obs: 'Aguardando envio pelo contador.' }
        };
        e.default = {
          computed: {
            decl: function () { return declData[this.$route.params.id] || declData['1']; }
          },
          methods: {
            back: function () { this.$router.go(-1); }
          },
          render: function (h) {
            var d = this.decl;
            var self = this;
            return h('div', [
              /* Back button */
              h('div', { staticClass: 'row mb-1' }, [
                h('div', { staticClass: 'col' }, [
                  h('b-button', {
                    attrs: { variant: 'flat-secondary', size: 'sm' },
                    on: { click: function () { self.back(); } }
                  }, [
                    h('feather-icon', { attrs: { icon: 'ArrowLeftIcon', size: '14' }, staticClass: 'mr-50' }),
                    'Voltar'
                  ])
                ])
              ]),
              /* Stat row */
              h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col-6 col-md-4' }, [statCard(h, d.type, 'Tipo de declaração', 'CalendarIcon', 'light-primary')]),
                h('div', { staticClass: 'col-6 col-md-4' }, [statCard(h, d.sent || 'Pendente', 'Data de envio', 'SendIcon', d.status === 'sent' ? 'light-success' : 'light-warning')]),
                h('div', { staticClass: 'col-12 col-md-4' }, [statCard(h, d.due, 'Prazo de entrega', 'ClockIcon', 'light-info')])
              ]),
              /* Detail card */
              h('div', { staticClass: 'card' }, [
                h('div', { staticClass: 'card-header' }, [
                  h('div', { staticClass: 'd-flex align-items-center justify-content-between w-100' }, [
                    h('div', { staticClass: 'd-flex align-items-center' }, [
                      h('feather-icon', { attrs: { icon: 'CalendarIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                      h('h4', { staticClass: 'mb-0' }, 'Detalhes da declaração')
                    ]),
                    badge(h, d.status)
                  ])
                ]),
                h('div', { staticClass: 'card-body' }, [
                  h('div', { staticClass: 'row' }, [
                    infoCol(h, 'Período de apuração', d.period),
                    infoCol(h, 'Tipo',                d.type),
                    infoCol(h, 'Prazo de entrega',    d.due),
                    infoCol(h, 'Data de envio',       d.sent || 'â€”'),
                    infoCol(h, 'Protocolo',            d.protocol || 'â€”')
                  ]),
                  h('b-alert', {
                    attrs: { show: true, variant: d.status === 'sent' ? 'success' : 'warning' },
                    staticClass: 'mt-1'
                  }, d.obs)
                ])
              ])
            ]);
          }
        };
      }
    }]);

    /* â”€â”€ /impostos/:id/declaracao (chunk-3419fd6c â†’ "5bf0") */
    wp.push([['chunk-3419fd6c'], {
      '5bf0': function (t, e) {
        e.__esModule = true;
        e.default = {
          methods: {
            back: function () { this.$router.go(-1); }
          },
          render: function (h) {
            var self = this;
            return h('div', [
              /* Back button */
              h('div', { staticClass: 'row mb-1' }, [
                h('div', { staticClass: 'col' }, [
                  h('b-button', {
                    attrs: { variant: 'flat-secondary', size: 'sm' },
                    on: { click: function () { self.back(); } }
                  }, [
                    h('feather-icon', { attrs: { icon: 'ArrowLeftIcon', size: '14' }, staticClass: 'mr-50' }),
                    'Voltar'
                  ])
                ])
              ]),
              h('div', { staticClass: 'card' }, [
                h('div', { staticClass: 'card-header' }, [
                  h('div', { staticClass: 'd-flex align-items-center' }, [
                    h('feather-icon', { attrs: { icon: 'FileTextIcon', size: '18' }, staticClass: 'mr-75 text-primary' }),
                    h('h4', { staticClass: 'mb-0' }, 'Declaração de atividades')
                  ])
                ]),
                h('div', { staticClass: 'card-body' }, [
                  h('b-alert', { attrs: { show: true, variant: 'info' }, staticClass: 'mb-2' }, [
                    h('feather-icon', { attrs: { icon: 'InfoIcon', size: '14' }, staticClass: 'mr-50' }),
                    ' Preencha as informações referentes ao período de apuração.'
                  ]),
                  h('div', { staticClass: 'row' }, [
                    h('div', { staticClass: 'col-12 col-md-6 mb-1' }, [
                      h('label', { staticClass: 'font-weight-bold' }, 'Receita bruta do mês (R$)'),
                      h('b-form-input', { attrs: { placeholder: '0,00', type: 'number' } })
                    ]),
                    h('div', { staticClass: 'col-12 col-md-6 mb-1' }, [
                      h('label', { staticClass: 'font-weight-bold' }, 'Receita de exportação (R$)'),
                      h('b-form-input', { attrs: { placeholder: '0,00', type: 'number' } })
                    ])
                  ]),
                  h('div', { staticClass: 'd-flex justify-content-end mt-1' }, [
                    h('b-button', { attrs: { variant: 'primary' } }, [
                      h('feather-icon', { attrs: { icon: 'SendIcon', size: '14' }, staticClass: 'mr-50' }),
                      'Enviar declaração'
                    ])
                  ])
                ])
              ])
            ]);
          }
        };
      }
    }]);

  })();

  /* â”€â”€ Menu item hover styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  (function () {
    var style = document.createElement('style');
    style.textContent = [
      '.main-menu .navigation li.nav-item > a,',
      '.main-menu .navigation li.nav-item ul li > a {',
      '  transition: background 150ms ease, color 150ms ease !important;',
      '}',
      '.main-menu .navigation li.nav-item:not(.active) > a:hover,',
      '.main-menu .navigation li.nav-item:not(.active).hover > a {',
      '  background: rgba(0, 144, 255, 0.08) !important;',
      '  color: #0090ff !important;',
      '  border-radius: 8px;',
      '}',
      '.main-menu .navigation li.nav-item ul li:not(.active) > a:hover,',
      '.main-menu .navigation li.nav-item ul li:not(.active).hover > a {',
      '  background: rgba(0, 144, 255, 0.08) !important;',
      '  color: #0090ff !important;',
      '  border-radius: 4px;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  })();

  document.addEventListener('DOMContentLoaded', function () {
    injectLogo();
    _logoObserver.observe(document.body, { childList: true, subtree: true });
    // Para de observar após 10s para não desperdiçar recursos
    setTimeout(function () { _logoObserver.disconnect(); }, 10000);
  });
})();
