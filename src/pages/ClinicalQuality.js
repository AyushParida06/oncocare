import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function ClinicalQuality() {
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark = theme === 'dark';

  const incidents = useQuery(api.quality.getIncidents, {}) || [];
  
  const logIncident = useMutation(api.quality.logIncident);
  const updateIncidentStatus = useMutation(api.quality.updateIncidentStatus);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    severity: 'low',
    description: ''
  });

  const activeIncidents = incidents.filter(inc => inc.status !== 'resolved');
  const resolvedIncidents = incidents.filter(inc => inc.status === 'resolved');

  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!formData.department || !formData.description) return;
    
    const today = new Date().toISOString().split('T')[0];

    await logIncident({
      date: today,
      department: formData.department,
      severity: formData.severity,
      description: formData.description,
      status: 'open'
    });
    
    setShowModal(false);
    setFormData({ department: '', severity: 'low', description: '' });
  };

  const handleResolve = async (id) => {
    await updateIncidentStatus({ id, status: 'resolved' });
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'low': return { bg: isDark ? 'rgba(52,211,153,0.1)' : '#d1fae5', color: isDark ? '#34d399' : '#059669', border: isDark ? '#34d39966' : '#a7f3d0' };
      case 'medium': return { bg: isDark ? 'rgba(251,191,36,0.1)' : '#fef3c7', color: isDark ? '#fbbf24' : '#d97706', border: isDark ? '#fbbf2466' : '#fde68a' };
      case 'high': return { bg: isDark ? 'rgba(249,115,22,0.1)' : '#ffedd5', color: isDark ? '#f97316' : '#c2410c', border: isDark ? '#f9731666' : '#fed7aa' };
      case 'critical': return { bg: isDark ? 'rgba(239,68,68,0.1)' : '#fee2e2', color: isDark ? '#ef4444' : '#b91c1c', border: isDark ? '#ef444466' : '#fecaca' };
      default: return { bg: '#eee', color: '#666', border: '#ddd' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        
        <div style={{
          background: isDark ? 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(14,165,233,0.05) 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #fff 100%)',
          border: `0.5px solid ${isDark ? 'rgba(14,165,233,0.4)' : '#bae6fd'}`,
          borderRadius: 16,
          padding: '24px 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ background: isDark ? '#38bdf8' : '#0284c7', color: '#fff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '0 0 12px rgba(56,189,248,0.6)' : 'none' }}>
                  <i className="ti ti-shield-check" style={{ fontSize: 18 }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#f5f5f5' : '#111' }}>{l('mod_quality')}</div>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#ccc' : '#555' }}>
                {l('desc_quality')}
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                background: isDark ? '#38bdf8' : '#0ea5e9',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: isDark ? '0 0 12px rgba(56,189,248,0.4)' : '0 4px 12px rgba(14,165,233,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <i className="ti ti-plus" />
              {l('qual_report_incident')}
            </button>
          </div>
        </div>

      </div>

      {/* Active Incidents Grid */}
      <div style={{
        background: isDark ? '#1a1a1a' : '#fff',
        border: `0.5px solid ${isDark ? '#333' : '#eee'}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f5f5f5' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-alert-triangle" style={{ color: isDark ? '#fbbf24' : '#d97706' }} />
          {l('qual_active_incidents')} ({activeIncidents.length})
        </div>
        
        {activeIncidents.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: isDark ? '#888' : '#aaa', fontSize: 14 }}>
            No active incidents reported.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, color: isDark ? '#aaa' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_date')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_department')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_severity')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_description')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_status')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeIncidents.map(inc => {
                  const badge = getSeverityBadge(inc.severity);
                  return (
                    <tr key={inc._id} style={{ borderBottom: `1px solid ${isDark ? '#222' : '#f5f5f5'}`, color: isDark ? '#ddd' : '#333' }}>
                      <td style={{ padding: '16px', color: isDark ? '#aaa' : '#666' }}>{inc.date}</td>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{inc.department}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' 
                        }}>
                          {l(`qual_sev_${inc.severity}`)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inc.description}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isDark ? '#aaa' : '#666' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: inc.status === 'open' ? '#f43f5e' : '#fbbf24' }}></span>
                          {l(`qual_stat_${inc.status}`)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => handleResolve(inc._id)}
                          style={{
                            background: isDark ? 'rgba(56,189,248,0.1)' : '#e0f2fe',
                            color: isDark ? '#38bdf8' : '#0284c7',
                            border: `1px solid ${isDark ? 'rgba(56,189,248,0.3)' : '#bae6fd'}`,
                            padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                          }}
                        >
                          {l('qual_resolve')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolved Incidents History */}
      {resolvedIncidents.length > 0 && (
        <div style={{
          background: isDark ? '#1a1a1a' : '#fff',
          border: `0.5px solid ${isDark ? '#333' : '#eee'}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f5f5f5' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-shield-check" style={{ color: isDark ? '#38bdf8' : '#0ea5e9' }} />
            {l('qual_resolved_incidents')}
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, color: isDark ? '#aaa' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_date')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_department')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_severity')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_description')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('qual_status')}</th>
                </tr>
              </thead>
              <tbody>
                {resolvedIncidents.map(inc => {
                  const badge = getSeverityBadge(inc.severity);
                  return (
                    <tr key={inc._id} style={{ borderBottom: `1px solid ${isDark ? '#222' : '#f5f5f5'}`, color: isDark ? '#888' : '#777' }}>
                      <td style={{ padding: '16px' }}>{inc.date}</td>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{inc.department}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          background: isDark ? '#333' : '#f9fafb', color: badge.color, border: `1px solid ${isDark ? '#444' : '#eee'}`,
                          padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' 
                        }}>
                          {l(`qual_sev_${inc.severity}`)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inc.description}</td>
                      <td style={{ padding: '16px', color: isDark ? '#34d399' : '#059669', fontWeight: 500 }}>
                        <i className="ti ti-check" style={{ marginRight: 4 }} />
                        {l('qual_stat_resolved')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#eee'}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{l('qual_report_incident')}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: isDark ? '#aaa' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={handleReportIncident} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>{l('qual_department')}</label>
                <input 
                  type="text" required placeholder="e.g. Inpatient Ward A"
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>{l('qual_severity')}</label>
                <select 
                  required
                  value={formData.severity} 
                  onChange={e => setFormData({...formData, severity: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="low">{l('qual_sev_low')}</option>
                  <option value="medium">{l('qual_sev_medium')}</option>
                  <option value="high">{l('qual_sev_high')}</option>
                  <option value="critical">{l('qual_sev_critical')}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>{l('qual_description')}</label>
                <textarea 
                  required rows="3" placeholder="Describe the safety incident or audit finding..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: 'transparent', color: isDark ? '#aaa' : '#555', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#38bdf8' : '#0ea5e9', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Submit Report
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
