import React from 'react';
import { useQuery } from 'convex/react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../convex/_generated/api';
import useCountUp from '../hooks/useCountUp';

// Animated number — eases from 0 to target
function AnimatedValue({ value, color, glow }) {
  const animated = useCountUp(Number(value), 1400);
  return <span style={{ color, ...glow }}>{animated}</span>;
}

const CANCER_COLORS = ['#4ade80','#fb923c','#60a5fa','#e879f9','#f87171','#fbbf24'];

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const patientStats = useQuery(api.patients.stats, {});
  const chemoCount   = useQuery(api.chemoSessions.todayCount, {});
  const apptCount    = useQuery(api.appointments.todayCount, {});
  const inpatients   = useQuery(api.clinical.activeAdmissionsCount, {});

  const isLoading = patientStats === undefined;
  const byType    = patientStats?.byType || {};
  const totalPts  = patientStats?.total  || 0;
  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1]);

  // Vibrant per-card colors (dark only)
  const statMeta = [
    { numColor: isDark ? '#4ade80' : '#111', glowColor: '74,222,128',  iconColor: '#0F6E56', color: '#E1F5EE', icon: 'ti-users'          },
    { numColor: isDark ? '#fb923c' : '#111', glowColor: '251,146,60',  iconColor: '#854F0B', color: '#FAEEDA', icon: 'ti-heart-pulse'    },
    { numColor: isDark ? '#f87171' : '#111', glowColor: '248,113,113', iconColor: '#A32D2D', color: '#FCEBEB', icon: 'ti-pill'           },
    { numColor: isDark ? '#60a5fa' : '#111', glowColor: '96,165,250',  iconColor: '#3B6D11', color: '#EAF3DE', icon: 'ti-calendar-event' },
    { numColor: isDark ? '#e879f9' : '#111', glowColor: '232,121,249', iconColor: '#185FA5', color: '#E6F1FB', icon: 'ti-bed'            },
    { numColor: isDark ? '#fbbf24' : '#111', glowColor: '251,191,36',  iconColor: '#534AB7', color: '#EEEDFE', icon: 'ti-rosette'        },
  ];

  const cards = [
    { label: 'Total Patients',        value: patientStats?.total     ?? '—', ...statMeta[0] },
    { label: 'Active Patients',       value: patientStats?.active    ?? '—', ...statMeta[1] },
    { label: 'Chemo Sessions Today',  value: chemoCount?.total       ?? '—', ...statMeta[2] },
    { label: 'Appointments Today',    value: apptCount?.total        ?? '—', ...statMeta[3] },
    { label: 'Inpatients',            value: inpatients              ?? '—', ...statMeta[4] },
    { label: 'Remission',             value: patientStats?.remission ?? '—', ...statMeta[5] },
  ];

  // Theme tokens
  const cardBg      = isDark ? '#2a2a2a' : '#fff';
  const cardBorder  = isDark ? '#444'    : '#e5e7eb';
  const textMain    = isDark ? '#f5f5f5' : '#111';
  const textMuted   = isDark ? '#aaa'    : '#888';
  const textSub     = isDark ? '#ccc'    : '#333';
  const barBg       = isDark ? '#3a3a3a' : '#f4f6f8';
  const sectionBorder = isDark ? '#3a3a3a' : '#f4f6f8';
  const hoverBg     = isDark ? '#333'    : '#f9fafb';

  const cardStyle = {
    background: cardBg,
    border: `0.5px solid ${cardBorder}`,
    borderRadius: 12,
    boxShadow: isDark ? '0 0 12px rgba(29,158,117,0.15)' : 'none',
    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: textMain, ...(isDark ? { textShadow: '0 0 6px rgba(255,255,255,0.3)' } : {}) }}>
        Dashboard Overview
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {cards.map(c => {
          const valGlow = isDark
            ? { textShadow: `0 0 10px rgba(${c.glowColor},0.9), 0 0 22px rgba(${c.glowColor},0.5)` }
            : {};
          return (
            <div key={c.label} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.08)' : c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: isDark ? c.numColor : c.iconColor, boxShadow: isDark ? `0 0 10px rgba(${c.glowColor},0.5)` : 'none' }}>
                <i className={`ti ${c.icon}`} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: textMuted }}>{c.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {isLoading
                    ? <span style={{ fontSize: 14, color: '#aaa' }}>…</span>
                    : <AnimatedValue value={c.value} color={c.numColor} glow={valGlow} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Cancer type breakdown */}
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: textMain }}>Patient Distribution by Cancer Type</div>
          {isLoading && <div style={{ fontSize: 12, color: textMuted }}>Loading…</div>}
          {!isLoading && typeEntries.length === 0 && <div style={{ fontSize: 12, color: textMuted }}>No patient data yet. Seed demo data to populate.</div>}
          {typeEntries.map(([type, count], i) => {
            const pct = totalPts ? Math.round((count / totalPts) * 100) : 0;
            const col = CANCER_COLORS[i % CANCER_COLORS.length];
            return (
              <div key={type} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: textSub }}>{type}</span>
                  <span style={{ color: isDark ? col : textMuted, ...(isDark ? { textShadow: `0 0 6px rgba(${CANCER_COLORS[i % 6]},0.7)` } : {}) }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background: barBg, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 4, transition: 'width 0.6s ease', boxShadow: isDark ? `0 0 6px ${col}88` : 'none' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: textMain }}>Quick Actions</div>
          {[
            { label: 'Register New Patient',   icon: 'ti-user-plus',       color: '#E1F5EE', iconColor: '#0F6E56', glow: '74,222,128'  },
            { label: 'Book Appointment',       icon: 'ti-calendar-plus',   color: '#FAECE7', iconColor: '#993C1D', glow: '251,146,60'  },
            { label: 'New Chemo Session',      icon: 'ti-pill',            color: '#FAEEDA', iconColor: '#854F0B', glow: '248,113,113' },
            { label: 'Order Lab Test',         icon: 'ti-microscope',      color: '#EEEDFE', iconColor: '#534AB7', glow: '232,121,249' },
            { label: 'Order Radiology',        icon: 'ti-radioactive',     color: '#E6F1FB', iconColor: '#185FA5', glow: '96,165,250'  },
            { label: 'Admit Patient',          icon: 'ti-bed',             color: '#EAF3DE', iconColor: '#3B6D11', glow: '251,191,36'  },
          ].map(q => (
            <div key={q.label}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `0.5px solid ${sectionBorder}`, cursor: 'pointer', transition: 'padding-left 0.2s ease, background 0.2s ease', borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.paddingLeft = '6px'}
              onMouseLeave={e => e.currentTarget.style.paddingLeft = '0px'}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: isDark ? 'rgba(255,255,255,0.08)' : q.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: isDark ? `rgb(${q.glow})` : q.iconColor, boxShadow: isDark ? `0 0 8px rgba(${q.glow},0.5)` : 'none' }}>
                <i className={`ti ${q.icon}`} />
              </div>
              <span style={{ fontSize: 13, color: textSub }}>{q.label}</span>
              <i className="ti ti-chevron-right" style={{ marginLeft: 'auto', color: isDark ? '#666' : '#ccc', fontSize: 14 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
