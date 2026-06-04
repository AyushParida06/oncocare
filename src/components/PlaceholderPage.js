import React from 'react';

export default function PlaceholderPage({ title, icon, color, iconColor, description, features }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page header */}
      <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: iconColor }}>
          <i className={`ti ${icon}`} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{title}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>{description}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>Module Active</span>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {features.map((f, i) => (
          <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: iconColor, marginBottom: 10 }}>
              <i className={`ti ${f.icon}`} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{f.label}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.4 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Coming soon notice */}
      <div style={{ background: '#f9fafb', border: '0.5px dashed #d1d5db', borderRadius: 12, padding: '18px 24px', textAlign: 'center', color: '#888', fontSize: 13 }}>
        <i className="ti ti-tool" style={{ fontSize: 20, marginBottom: 6, display: 'block', color: '#bbb' }} />
        Full module UI coming soon. Select a feature above to get started.
      </div>
    </div>
  );
}
