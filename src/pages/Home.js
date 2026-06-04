import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { useTheme } from '../context/ThemeContext';

import { api } from '../convex/_generated/api';

const modules = [
  { path: '/outpatient',      icon: 'ti-stethoscope',    label: 'Outpatient Consultation', desc: 'OPD visits & follow-ups',          color: '#E1F5EE', iconColor: '#0F6E56' },
  { path: '/chemotherapy',    icon: 'ti-pill',            label: 'Chemotherapy',             desc: 'Cycles, protocols & dosing',       color: '#FAEEDA', iconColor: '#854F0B' },
  { path: '/radiology',       icon: 'ti-radioactive',     label: 'Radiology & Imaging',      desc: 'CT, MRI, PET scans',               color: '#E6F1FB', iconColor: '#185FA5' },
  { path: '/lab-results',     icon: 'ti-microscope',      label: 'Lab Results',              desc: 'CBC, tumour markers, biopsies',    color: '#EEEDFE', iconColor: '#534AB7' },
  { path: '/appointments',    icon: 'ti-calendar-event',  label: 'Appointment Booking',      desc: 'Schedule & manage visits',         color: '#FAECE7', iconColor: '#993C1D' },
  { path: '/inpatient',       icon: 'ti-bed',             label: 'Inpatient / Admission',    desc: 'ADT & bed management',             color: '#EAF3DE', iconColor: '#3B6D11' },
  { path: '/emergency',       icon: 'ti-urgent',          label: 'Emergency Dept.',          desc: 'Urgent oncology cases',            color: '#FCEBEB', iconColor: '#A32D2D' },
  { path: '/pharmacy',        icon: 'ti-pill',            label: 'Pharmacy',                 desc: 'Chemo drugs & prescriptions',      color: '#FBEAF0', iconColor: '#993556' },
  { path: '/billing',         icon: 'ti-receipt',         label: 'Billing & Insurance',      desc: 'Invoices & claims',                color: '#f4f6f8', iconColor: '#555'    },
  { path: '/tumour-registry', icon: 'ti-dna',             label: 'Tumour Registry',          desc: 'Cancer staging & tracking',        color: '#E1F5EE', iconColor: '#0F6E56' },
  { path: '/clinical-trials', icon: 'ti-activity',        label: 'Clinical Trials',          desc: 'Trial enrolment & data',           color: '#E6F1FB', iconColor: '#185FA5' },
  { path: '/palliative-care', icon: 'ti-heart-handshake', label: 'Palliative Care',          desc: 'Pain & end-of-life support',       color: '#EEEDFE', iconColor: '#534AB7' },
];

const FALLBACK_STATS = { total: 0, active: 0 };
const FALLBACK_APPT  = { total: 0, confirmed: 0 };
const FALLBACK_CHEMO = { total: 0, pending: 0 };
const FALLBACK_ADMIT = 0;

export default function Home() {
  const navigate  = useNavigate();
  const { theme } = useTheme();
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

  const stats = [
    { label: 'Active Patients',        value: String(ps.active ?? ps.total ?? 0), sub: `${ps.total ?? 0} total registered`,       subColor: '#1D9E75' },
    { label: 'Chemo Sessions Today',   value: String(cc.total  ?? 0),             sub: `${cc.pending ?? 0} pending`,               subColor: '#BA7517' },
    { label: 'Appointments Today',     value: String(ac.total  ?? 0),             sub: `${ac.confirmed ?? 0} confirmed`,           subColor: '#1D9E75' },
    { label: 'Inpatients',             value: String(ip),                          sub: 'Currently admitted',                       subColor: '#888'    },
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

  const statValueGlow = isDark
    ? { textShadow: '0 0 10px rgba(255,255,255,0.7), 0 0 20px rgba(29,158,117,0.6)' }
    : {};

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
          {stats.map(s => (
            <div key={s.label} style={{ ...cardStyle, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: textMuted, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: textMain, ...statValueGlow }}>
                {patientStats === undefined ? <span style={{ fontSize: 14, color: '#aaa' }}>Loading…</span> : s.value}
              </div>
              <div style={{ fontSize: 11, marginTop: 4, color: s.subColor, ...numberGlow }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Modules grid */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: textMain, marginBottom: 10 }}>Modules</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {modules.map(m => (
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

        <div style={{ textAlign: 'center', fontSize: 10, color: textMuted, paddingTop: 4 }}>OncoCare HMS v1.0.0 · © 2026</div>
      </div>
    </div>
  );
}
