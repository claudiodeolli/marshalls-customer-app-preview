export default function SkeletonCard() {
  return (
    <div className="col-12 col-sm-6 col-xl-4 mb-2">
      <div className="card h-100 mb-0" style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ height: '4px', background: '#e9ecef' }} />
        <div className="card-body" style={{ flexGrow: 1 }}>
          <div className="d-flex align-items-center mb-75">
            <div className="sk" style={{ width: 18, height: 18, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
            <div className="sk" style={{ width: '62%', height: 16 }} />
          </div>
          <div className="d-flex align-items-center mb-75">
            <div className="sk" style={{ width: 16, height: 16, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
            <div className="sk" style={{ width: '48%', height: 13 }} />
          </div>
          <div className="d-flex align-items-center mb-50">
            <div className="sk" style={{ width: 14, height: 14, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
            <div className="sk" style={{ width: '72%', height: 11 }} />
          </div>
          <div className="d-flex align-items-center mb-1">
            <div className="sk" style={{ width: 14, height: 14, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
            <div className="sk" style={{ width: '66%', height: 11 }} />
          </div>
          <div className="sk" style={{ width: 62, height: 18, borderRadius: '10px' }} />
        </div>
        <div className="d-flex justify-content-end" style={{ gap: '8px', borderTop: '1px solid #f0f0f0', padding: '12px 16px' }}>
          <div className="sk" style={{ width: 68, height: 29, borderRadius: '4px' }} />
          <div className="sk" style={{ width: 72, height: 29, borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
}
