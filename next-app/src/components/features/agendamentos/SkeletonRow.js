export default function SkeletonRow() {
  return (
    <div className="card mb-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div style={{ flex: 1 }}>
            <div className="d-flex align-items-center mb-50">
              <div className="sk" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
              <div className="sk" style={{ width: '42%', height: 18 }} />
            </div>
            <div className="d-flex align-items-center mb-50">
              <div className="sk" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
              <div className="sk" style={{ width: '36%', height: 14 }} />
            </div>
            <div className="d-flex align-items-center mb-50">
              <div className="sk" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8, flexShrink: 0 }} />
              <div className="sk" style={{ width: '52%', height: 14 }} />
            </div>
            <div className="sk" style={{ width: 70, height: 18, borderRadius: '10px', marginTop: '6px' }} />
          </div>
          <div style={{ marginLeft: '16px', flexShrink: 0 }}>
            <div className="sk" style={{ width: 135, height: 30, borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
