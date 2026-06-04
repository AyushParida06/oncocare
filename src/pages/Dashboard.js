import React from 'react';
import { useQuery } from 'convex/react';
import { useTheme } from '../context/ThemeContext';

import { api } from '../convex/_generated/api';

const CANCER_COLORS = ['#D4537E','#D85A30','#639922','#7F77DD','#378ADD','#888780'];

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark    = theme === 'dark';

  const patientStats = useQuery(api.patients.stats, {});
  const chemoCount   = useQuery(api.chemoSessions.todayCount, {});
  const apptCount    = useQuery(api.appointments.todayCount, {});
  const inpatients   = useQuery(api.clinical.activeAdmissionsCount, {});

  const isLoading = patientStats === undefined;
  const notConnected = false;

  const byType    = patientStats?.byType || {};
  const totalPts  = patientStats?.total  || 0;
  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1]);

  const cards = [
    { label: 'Total Patients',        value: patientStats?.total  ?? '—', icon: 'ti-users',             color: '#E1F5EE', iconColor: '#0F6E56' },
    { label: 'Active Patients',       value: patientStats?.active ?? '—', icon: 'ti-heart-pulse',       color: '#FAEEDA', iconColor: '#854F0B' },
    { label: 'Chemo Sessions Today',  value: chemoCount?.total    ?? '—', icon: 'ti-pill',              color: '#FCEBEB', iconColor: '#A32D2D' },
    { label: 'Appointments Today',    value: apptCount?.total     ?? '—', icon: 'ti-calendar-event',   color: '#EAF3DE', iconColor: '#3B6D11' },
    { label: 'Inpatients',            value: inpatients           ?? '—', icon: 'ti-bed',               color: '#E6F1FB', iconColor: '#185FA5' },
    { label: 'Remission',             value: patientStats?.remission ?? '—', icon: 'ti-rosette',        color: '#EEEDFE', iconColor: '#534AB7' },
  ];

  // Theme-aware styles
  const cardBg     = isDark ? '#2a2a2a' : '#fff';
  const cardBorder = isDark ? '#444'    : '#e5e7eb';
  const textMain   = isDark ? '#f5f5f5' : '#111';
  const textMuted  = isDark ? '#aaa'    : '#888';
  const textSub    = isDark ? '#ccc'    : '#333';
  const barBg      = isDark ? '#3a3a3a' : '#f4f6f8';
  const sectionBorder = isDark ? '#3a3a3a' : '#f4f6f8';

  // Glowing effect for numbers
  const numberGlow = isDark
    ? { textShadow: '0 0 10px rgba(255,255,255,0.7), 0 0 20px rgba(29,158,117,0.6)' }
    : {};

  const cardStyle = {
    background: cardBg,
    border: `0.5px solid ${cardBorder}`,
    borderRadius: 12,
    boxShadow: isDark ? '0 0 12px rgba(29,158,117,0.15)' : 'none',
    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: textMain, ...(isDark ? { textShadow: '0 0 6px rgba(255,255,255,0.3)' } : {}) }}>Dashboard Overview</div>

      {notConnected && (
        <div style={{ background: '#FAEEDA', border: '0.5px solid #f0c070', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#854F0B', display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-plug-off" /> Convex not connected — run <code style={{ background: 'rgba(0,0,0,0.08)', padding: '2px 6px', borderRadius: 4 }}>npx convex dev</code> then refresh.
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {cards.map(c => (
          <div key={c.label} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.08)' : c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: isDark ? '#7dd3b8' : c.iconColor, boxShadow: isDark ? `0 0 8px ${c.iconColor}44` : 'none' }}>
              <i className={`ti ${c.icon}`} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: textMuted }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: textMain, ...numberGlow }}>
                {isLoading ? <span style={{ fontSize: 14, color: '#aaa' }}>…</span> : c.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Cancer type breakdown — live from DB */}
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: textMain }}>Patient Distribution by Cancer Type</div>
          {isLoading && <div style={{ fontSize: 12, color: textMuted }}>Loading…</div>}
          {!isLoading && typeEntries.length === 0 && <div style={{ fontSize: 12, color: textMuted }}>No patient data yet. Seed demo data to populate.</div>}
          {typeEntries.map(([type, count], i) => {
            const pct = totalPts ? Math.round((count / totalPts) * 100) : 0;
            return (
              <div key={type} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: textSub }}>{type}</span>
                  <span style={{ color: textMuted, ...(isDark ? { textShadow: '0 0 6px rgba(255,255,255,0.5)' } : {}) }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background: barBg, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: CANCER_COLORS[i % CANCER_COLORS.length], borderRadius: 4, transition: 'width 0.6s ease', boxShadow: isDark ? `0 0 6px ${CANCER_COLORS[i % CANCER_COLORS.length]}88` : 'none' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: textMain }}>Quick Actions</div>
          {[
            { label: 'Register New Patient',   icon: 'ti-user-plus',       color: '#E1F5EE', iconColor: '#0F6E56', path: '/outpatient'   },
            { label: 'Book Appointment',       icon: 'ti-calendar-plus',   color: '#FAECE7', iconColor: '#993C1D', path: '/appointments' },
            { label: 'New Chemo Session',      icon: 'ti-pill',            color: '#FAEEDA', iconColor: '#854F0B', path: '/chemotherapy' },
            { label: 'Order Lab Test',         icon: 'ti-microscope',      color: '#EEEDFE', iconColor: '#534AB7', path: '/lab-results'  },
            { label: 'Order Radiology',        icon: 'ti-radioactive',     color: '#E6F1FB', iconColor: '#185FA5', path: '/radiology'    },
            { label: 'Admit Patient',          icon: 'ti-bed',             color: '#EAF3DE', iconColor: '#3B6D11', path: '/inpatient'    },
          ].map(q => (
            <div key={q.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `0.5px solid ${sectionBorder}`, cursor: 'pointer', transition: 'padding-left 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.paddingLeft = '4px'}
              onMouseLeave={e => e.currentTarget.style.paddingLeft = '0px'}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: isDark ? 'rgba(255,255,255,0.08)' : q.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: isDark ? '#7dd3b8' : q.iconColor, boxShadow: isDark ? `0 0 6px ${q.iconColor}44` : 'none' }}>
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
