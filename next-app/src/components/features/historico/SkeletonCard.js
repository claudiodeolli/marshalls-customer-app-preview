export default function SkeletonCard() {
  return (
    <div className="col-12 col-sm-6 col-md-4 mb-2">
      <div className="card mb-0 h-100" style={{ backgroundColor: '#e9f2fa' }}>
        <div className="card-body" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div className="sk" style={{ width: 82, height: 11 }} />
              <div className="sk" style={{ width: 70, height: 11 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
              <div className="sk" style={{ width: 105, height: 11 }} />
              <div className="sk" style={{ width: 85, height: 11 }} />
            </div>
          </div>
          <hr style={{ margin: '8px 0', borderColor: 'rgba(0,0,0,0.1)' }} />
          <div className="sk" style={{ width: 72, height: 10, marginBottom: 5 }} />
          <div className="sk" style={{ width: '78%', height: 15, marginBottom: '1rem' }} />
          <div className="sk" style={{ width: 72, height: 10, marginBottom: 5 }} />
          <div className="sk" style={{ width: '55%', height: 15 }} />
        </div>
      </div>
    </div>
  );
}
