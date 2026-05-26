/* Configuração de título e breadcrumb por rota - baseado no Vue Router do original */

export const routeConfig = {
  '/painel': {
    pageTitle: 'Plantão 24h',
    breadcrumb: [{ text: 'Atendimento médico', active: true }],
  },
  '/empresa/detalhes': {
    pageTitle: 'Encaminhamentos',
    breadcrumb: [{ text: 'Detalhes dos Encaminhamentos', active: true }],
  },
  '/impostos': {
    pageTitle: 'Histórico',
    breadcrumb: [{ text: 'Detalhes do Histórico', active: true }],
  },
  '/declaracoes': {
    pageTitle: 'Meus dados',
    breadcrumb: [{ text: 'Detalhes dos Meus Dados', active: true }],
  },
  '/perfil': {
    pageTitle: 'Meu Clube',
    breadcrumb: [{ text: 'Detalhes do Meu Clube', active: true }],
  },
  '/parceiros': {
    pageTitle: 'Assinatura',
    breadcrumb: [{ text: 'Detalhes da Assinatura', active: true }],
  },
  '/assinaturas': {
    pageTitle: 'Assinatura',
    breadcrumb: [{ text: 'Tipo de Assinatura Individual', active: true }],
  },
  '/certificado-digital': {
    pageTitle: 'Certificado digital de pessoa física (e-CPF)',
    breadcrumb: [{ text: 'Certificado digital', active: true }],
  },
  '/indicadores': {
    pageTitle: 'Agendamentos',
    breadcrumb: [{ text: 'Detalhes dos meus agendamentos', active: true }],
  },
  '/mudar-senha': {
    pageTitle: 'Mudar minha senha',
    breadcrumb: [{ text: 'Detalhes da alteração de senha', active: true }],
  },
  '/encaminhamentos': {
    pageTitle: 'Encaminhamentos',
    breadcrumb: [{ text: 'Meus encaminhamentos', active: true }],
  },
  '/historico': {
    pageTitle: 'Histórico',
    breadcrumb: [{ text: 'Histórico de atendimentos', active: true }],
  },
  '/meu-clube': {
    pageTitle: 'Meu Clube',
    breadcrumb: [{ text: 'Benefícios exclusivos', active: true }],
  },
  '/agendamentos': {
    pageTitle: 'Agendamentos',
    breadcrumb: [{ text: 'Detalhes dos meus agendamentos', active: true }],
  },
  '/requerimentos': {
    pageTitle: 'Requerimentos',
    breadcrumb: [{ text: 'Requerimentos', active: true }],
  },
  '/nfse-emitidas': {
    pageTitle: 'NFS-e Emitidas',
    breadcrumb: [{ text: 'Notas fiscais emitidas', active: true }],
  },
};

export function getRouteConfig(pathname) {
  if (routeConfig[pathname]) return routeConfig[pathname];

  /* Rotas dinâmicas */
  if (pathname.startsWith('/impostos/') && pathname.endsWith('/declaracao')) {
    return {
      pageTitle: 'Impostos',
      breadcrumb: [
        { text: 'Impostos', href: '/impostos', active: false },
        { text: 'Declaração de atividades', active: true },
      ],
    };
  }
  if (pathname.startsWith('/impostos/')) {
    return {
      pageTitle: 'Impostos',
      breadcrumb: [
        { text: 'Impostos', href: '/impostos', active: false },
        { text: 'Detalhes do imposto', active: true },
      ],
    };
  }
  if (pathname.startsWith('/declaracoes/')) {
    return {
      pageTitle: 'Declarações',
      breadcrumb: [
        { text: 'Declarações', href: '/declaracoes', active: false },
        { text: 'Detalhes da declaração', active: true },
      ],
    };
  }

  return { pageTitle: 'Marshalls', breadcrumb: [] };
}
