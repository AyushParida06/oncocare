import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
const info = {
  title: 'Revenue Cycle Management',
  subtitle: 'Maximize Revenue Performance',
  icon: 'ti-chart-pie',
  glowColor: '251,191,36',
  features: [
    { icon: 'ti-ti-file-invoice', label: 'Claims Processing', desc: 'Automated insurance claims' },
    { icon: 'ti-ti-alert-triangle', label: 'Denial Management', desc: 'Track and resolve claim denials' },
    { icon: 'ti-ti-clock', label: 'AR Management', desc: 'Accounts receivable tracking' },
    { icon: 'ti-ti-chart-line', label: 'Revenue Analytics', desc: 'Financial performance dashboards' },
  ],
};
export default function RevenueCycle() {
  const { theme } = useTheme();
  const { t: l } = useLanguage(); const isDark = theme === 'dark';
  const cardBg = isDark ? '#2a2a2a' : '#fff'; const cardBorder = isDark ? '#444' : '#e5e7eb';
  const textMain = isDark ? '#f5f5f5' : '#111'; const textMuted = isDark ? '#aaa' : '#888';
  const cardStyle = { background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 12, boxShadow: isDark ? `0 0 16px rgba(${info.glowColor},0.12)` : 'none', transition: 'background 0.3s' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ ...cardStyle, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 18, borderLeft: `4px solid rgb(${info.glowColor})` }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: `rgba(${info.glowColor},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: `rgb(${info.glowColor})` , boxShadow: isDark ? `0 0 16px rgba(${info.glowColor},0.4)` : 'none' }}><i className={`ti ${info.icon}`} /></div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: textMain, ...(isDark ? { textShadow: `0 0 10px rgba(${info.glowColor},0.5)` } : {}) }}>{l('mod_revenue_cycle')}</div>
          <div style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>{info.subtitle}</div>
        </div>
        <div style={{ marginLeft: 'auto', background: `rgba(${info.glowColor},0.15)`, border: `1px solid rgba(${info.glowColor},0.3)`, borderRadius: 8, padding: '6px 14px', fontSize: 12, color: `rgb(${info.glowColor})` , fontWeight: 500 }}>{l('ui_module_active')}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        {info.features.map(f => (
          <div key={f.label} style={{ ...cardStyle, padding: 18, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${info.glowColor},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: `rgb(${info.glowColor})` , flexShrink: 0, boxShadow: isDark ? `0 0 8px rgba(${info.glowColor},0.3)` : 'none' }}>
              <i className={`ti ${f.icon}`} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: textMain }}>{f.label}</div>
              <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...cardStyle, padding: 32, textAlign: 'center' }}>
        <i className={`ti ${info.icon}`} style={{ fontSize: 36, color: `rgba(${info.glowColor},0.4)`, display: 'block', marginBottom: 12 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: textMain, marginBottom: 8 }}>Full Module Coming Soon</div>
        <div style={{ fontSize: 13, color: textMuted }}>This module is being configured. Core features will be available shortly.</div>
      </div>
    </div>
  );
}
