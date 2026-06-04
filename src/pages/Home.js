import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import useCountUp from '../hooks/useCountUp';
import { api } from '../convex/_generated/api';

// Animated number — counts up from 0 to `value` on mount / value change
function AnimatedValue({ value, color, glow }) {
  const animated = useCountUp(Number(value), 1400);
  return (
    <span style={{ color, ...glow }}>
      {animated}
    </span>
  );
}

const getModules = (l) => [
  // Clinical Care
  { path: '/outpatient',       icon: 'ti-stethoscope', label: l('mod_outpatient'),                desc: l('desc_outpatient'),             color: '#E1F5EE', iconColor: '#0F6E56' },
  { path: '/inpatient',        icon: 'ti-bed',         label: l('mod_inpatient'),                 desc: l('desc_inpatient'),              color: '#EAF3DE', iconColor: '#3B6D11' },
  { path: '/nursing',          icon: 'ti-user',        label: l('mod_nursing'),                   desc: l('desc_nursing'),                color: '#E1F5EE', iconColor: '#0F6E56' },
  { path: '/clinical-pharmacy',icon: 'ti-pill',        label: l('mod_clinical_pharm'),            desc: l('desc_clinical_pharm'),         color: '#FAEEDA', iconColor: '#854F0B' },
  { path: '/tumor-board',      icon: 'ti-users',       label: l('mod_tumor_board'),               desc: l('desc_tumor_board'),            color: '#EEEDFE', iconColor: '#534AB7' },
  { path: '/clinical-quality', icon: 'ti-chart-bar',   label: l('mod_quality'),                   desc: l('desc_quality'),                color: '#E6F1FB', iconColor: '#185FA5' },
  // Diagnostics & Pharmacy
  { path: '/lis',              icon: 'ti-microscope',  label: l('mod_lis'),                       desc: l('desc_lis'),                    color: '#FBEAF0', iconColor: '#993556' },
  { path: '/ris',              icon: 'ti-camera',      label: l('mod_ris'),                       desc: l('desc_ris'),                    color: '#EAF3DE', iconColor: '#3B6D11' },
  { path: '/pharmacy-mgmt',    icon: 'ti-package',     label: l('mod_pharmacy'),                  desc: l('desc_pharmacy'),               color: '#E1F5EE', iconColor: '#0F6E56' },
  // Patient Flow & Billing
  { path: '/patient-billing',  icon: 'ti-receipt',     label: l('mod_patient_billing'),           desc: l('desc_patient_billing'),        color: '#FCEBEB', iconColor: '#A32D2D' },
  { path: '/revenue-cycle',    icon: 'ti-chart-pie',   label: l('mod_revenue_cycle'),             desc: l('desc_revenue_cycle'),          color: '#FAEEDA', iconColor: '#854F0B' },
];

const FALLBACK_STATS = { total: 0, active: 0 };
const FALLBACK_APPT  = { total: 0, confirmed: 0 };
const FALLBACK_CHEMO = { total: 0, pending: 0 };
const FALLBACK_ADMIT = 0;

export default function Home() {
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark    = theme === 'dark';
  const today     = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Live Convex queries
  const patientStats = useQuery(api.patients.stats, {});
  const apptCount    = useQuery(api.appointments.todayCount, {});
  const chemoCount   = useQuery(api.chemoSessions.todayCount, {});
  const inpatients   = useQuery(api.clinical.activeAdmissionsCount, {});
  const todayAppts   = useQuery(api.appointments.list, { date: new Date().toISOString().split('T')[0] });

  const ps = patientStats || FALLBACK_STATS;
  const ac = apptCount    || FALLBACK_APPT;
  const cc = chemoCount   || FALLBACK_CHEMO;
  const ip = inpatients   ?? FALLBACK_ADMIT;

  // Vibrant colors per stat (numColor = big number, glowColor = glow shadow)
  const statMeta = [
    { numColor: isDark ? '#4ade80' : '#111', glowColor: '74,222,128',  subColor: '#1D9E75' }, // green
    { numColor: isDark ? '#fb923c' : '#111', glowColor: '251,146,60',  subColor: '#BA7517' }, // orange
    { numColor: isDark ? '#60a5fa' : '#111', glowColor: '96,165,250',  subColor: '#1D9E75' }, // blue
    { numColor: isDark ? '#e879f9' : '#111', glowColor: '232,121,249', subColor: '#888'    }, // purple
  ];

  const stats = [
    { label: 'Active Patients',        value: String(ps.active ?? ps.total ?? 0), sub: `${ps.total ?? 0} total registered`,  ...statMeta[0] },
    { label: 'Chemo Sessions Today',   value: String(cc.total  ?? 0),             sub: `${cc.pending ?? 0} pending`,          ...statMeta[1] },
    { label: 'Appointments Today',     value: String(ac.total  ?? 0),             sub: `${ac.confirmed ?? 0} confirmed`,      ...statMeta[2] },
    { label: 'Inpatients',             value: String(ip),                          sub: 'Currently admitted',                  ...statMeta[3] },
  ];

  const typeColors   = { chemotherapy: '#FAEEDA', consultation: '#E1F5EE', radiology: '#E6F1FB', lab: '#EEEDFE', followup: '#f4f6f8' };
  const typeBadge    = { chemotherapy: '#854F0B', consultation: '#0F6E56', radiology: '#185FA5', lab: '#534AB7', followup: '#555'    };

  // Theme-aware styles
  const cardBg     = isDark ? '#2a2a2a' : '#fff';
  const cardBorder = isDark ? '#444'    : '#e5e7eb';
  const textMain   = isDark ? '#f5f5f5' : '#111';
  const textMuted  = isDark ? '#aaa'    : '#888';
  const textSub    = isDark ? '#ccc'    : '#333';
  const hoverBg    = isDark ? '#333'    : '#f9fafb';
  const sectionBorder = isDark ? '#3a3a3a' : '#f4f6f8';

  // Glowing effect for numbers in dark mode
  const numberGlow = isDark
    ? { textShadow: '0 0 8px rgba(29,158,117,0.9), 0 0 16px rgba(29,158,117,0.5)' }
    : {};

  // statValueGlow is now per-stat using s.glowColor

  const cardStyle = {
    background: cardBg,
    border: `0.5px solid ${cardBorder}`,
    borderRadius: 12,
    boxShadow: isDark ? '0 0 12px rgba(29,158,117,0.15)' : 'none',
    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  };

  const sideCard = {
    ...cardStyle,
    padding: 14,
  };

  const sideTitle = { fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Welcome banner */}
        <div style={{ background: 'linear-gradient(135deg,#0F6E56,#1D9E75)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>DR</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Hi, Dr. Ramesh K</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Senior Oncologist · {today}</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', border: '0.5px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-building-hospital" /> CancerCare Institute
          </div>
        </div>

        {/* Live stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {stats.map(s => {
            const valGlow = isDark
              ? { textShadow: `0 0 10px rgba(${s.glowColor},0.9), 0 0 22px rgba(${s.glowColor},0.5)` }
              : {};
            const subGlow = isDark
              ? { textShadow: `0 0 6px rgba(${s.glowColor},0.7)` }
              : {};
            return (
              <div key={s.label} style={{ ...cardStyle, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: textMuted, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  {patientStats === undefined
                    ? <span style={{ fontSize: 14, color: '#aaa' }}>Loading…</span>
                    : <AnimatedValue value={s.value} color={s.numColor} glow={valGlow} />}
                </div>
                <div style={{ fontSize: 11, marginTop: 4, color: s.subColor, ...subGlow }}>{s.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Modules grid */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: textMain, marginBottom: 10 }}>Modules</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {getModules(l).map(m => (
              <div key={m.path} onClick={() => navigate(m.path)}
                style={{ ...cardStyle, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.transform = 'translateY(-1px)'; if (isDark) e.currentTarget.style.boxShadow = '0 0 18px rgba(29,158,117,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = cardBg;  e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isDark ? '0 0 12px rgba(29,158,117,0.15)' : 'none'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: isDark ? '#7dd3b8' : m.iconColor, flexShrink: 0, boxShadow: isDark ? `0 0 8px ${m.iconColor}44` : 'none' }}>
                  <i className={`ti ${m.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: textMain, lineHeight: 1.3 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 220, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={sideCard}>
          <div style={{ ...sideTitle, color: '#A32D2D' }}><i className="ti ti-bell" style={{ color: '#A32D2D' }} /> Notifications</div>
          <div style={{ fontSize: 12, color: textMuted }}>No unread notifications</div>
        </div>

        <div style={sideCard}>
          <div style={{ ...sideTitle, color: '#0F6E56' }}><i className="ti ti-calendar-event" style={{ color: '#0F6E56' }} /> Today's Appointments</div>
          {!todayAppts || todayAppts.length === 0 ? (
            <div style={{ fontSize: 12, color: textMuted }}>{todayAppts === undefined ? 'Loading…' : 'No appointments today'}</div>
          ) : todayAppts.slice(0, 4).map((a, i) => (
            <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < Math.min(todayAppts.length, 4) - 1 ? `0.5px solid ${cardBorder}` : 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: textMain }}>{a.patientId}</div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>⏱ {a.time}</div>
              <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: isDark ? 'rgba(255,255,255,0.08)' : (typeColors[a.type] || '#f4f6f8'), color: typeBadge[a.type] || textMuted }}>{a.type}</span>
            </div>
          ))}
        </div>

        <div style={sideCard}>
          <div style={{ ...sideTitle, color: '#0F6E56' }}><i className="ti ti-clipboard-check" style={{ color: '#0F6E56' }} /> Roster</div>
          <div style={{ fontSize: 12, color: '#1D9E75', display: 'flex', alignItems: 'center', gap: 6, ...(isDark ? { textShadow: '0 0 6px rgba(29,158,117,0.8)' } : {}) }}><i className="ti ti-circle-check" /> Shift: 8:00 AM – 4:00 PM</div>
          <div style={{ fontSize: 11, color: textMuted, marginTop: 8 }}>Oncology Ward B · 6 staff on duty</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 10, color: textMuted, paddingTop: 4 }}><span style={{ color: '#B02323' }}>Vista</span><span style={{ color: '#01408F' }}>Onco</span> HMS v1.0.0 · © 2026</div>
      </div>
    </div>
  );
}
