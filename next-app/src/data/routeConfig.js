/* Configuração de título e breadcrumb por rota - baseado no Vue Router do original */

export const routeConfig = {
  '/painel': {
    pageTitle: 'Plantão 24h',
    breadcrumb: [{ text: 'Atendimento médico', active: true }],
  },
  '/encaminhamentos': {
    pageTitle: 'Encaminhamentos',
    breadcrumb: [{ text: 'Meus encaminhamentos', active: true }],
  },
  '/historico': {
    pageTitle: 'Histórico',
    breadcrumb: [{ text: 'Histórico de atendimentos', active: true }],
  },
  '/agendamentos': {
    pageTitle: 'Agendamentos',
    breadcrumb: [{ text: 'Meus agendamentos', active: true }],
  },
  '/meus-dados': {
    pageTitle: 'Meus dados',
    breadcrumb: [{ text: 'Informações pessoais', active: true }],
  },
  '/meu-clube': {
    pageTitle: 'Meu Clube',
    breadcrumb: [{ text: 'Benefícios exclusivos', active: true }],
  },
  '/assinaturas': {
    pageTitle: 'Assinatura',
    breadcrumb: [{ text: 'Tipo de Assinatura Individual', active: true }],
  },
  '/mudar-senha': {
    pageTitle: 'Mudar minha senha',
    breadcrumb: [{ text: 'Alteração de senha', active: true }],
  },
  '/certificado-digital': {
    pageTitle: 'Certificado digital de pessoa física (e-CPF)',
    breadcrumb: [{ text: 'Certificado digital', active: true }],
  },
  '/nfse-emitidas': {
    pageTitle: 'NFS-e Emitidas',
    breadcrumb: [{ text: 'Notas fiscais emitidas', active: true }],
  },
  '/requerimentos': {
    pageTitle: 'Requerimentos',
    breadcrumb: [{ text: 'Requerimentos', active: true }],
  },
};

export function getRouteConfig(pathname) {
  const p = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  if (routeConfig[p]) return routeConfig[p];

  /* Rotas dinâmicas */
  if (p.startsWith('/impostos/') && p.endsWith('/declaracao')) {
    return {
      pageTitle: 'Histórico',
      breadcrumb: [
        { text: 'Histórico', href: '/historico', active: false },
        { text: 'Declaração de atividades', active: true },
      ],
    };
  }
  if (p.startsWith('/impostos/')) {
    return {
      pageTitle: 'Histórico',
      breadcrumb: [
        { text: 'Histórico', href: '/historico', active: false },
        { text: 'Detalhes', active: true },
      ],
    };
  }

  return { pageTitle: 'Marshalls', breadcrumb: [] };
}
