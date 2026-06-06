'use client';

import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import FeatherIcon from '@/components/ui/FeatherIcon';

const companies = [
  { id: 1, name: 'MARSHALLS CORPORATE AND DIGITAL BUSINESS', opened_at: '2020-01-01' },
];

export default function EmpresasPage() {
  const router = useRouter();

  function formatDate(iso) {
    if (!iso) return '—';
    return iso.split('-').reverse().join('/');
  }

  function select(company) {
    router.push('/plantao');
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', background: '#f8f8f8', padding: '2rem' }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div className="text-center mb-2">
          <h3 className="font-weight-bolder">Selecionar empresa</h3>
          <p className="text-muted">Escolha a empresa que deseja acessar</p>
        </div>

        {companies.map(co => (
          <div
            key={co.id}
            className="card mb-1"
            style={{ cursor: 'pointer', border: '2px solid #0090ff' }}
            onClick={() => select(co)}
          >
            <div className="card-body d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <Avatar
                  variant="light-primary"
                  text={co.name.charAt(0)}
                  size={48}
                  rounded
                  className="mr-1"
                />
                <div>
                  <div className="font-weight-bold">{co.name}</div>
                  <small className="text-muted">Abertura: {formatDate(co.opened_at)}</small>
                </div>
              </div>
              <FeatherIcon icon="CheckCircle" size={20} className="text-primary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
