import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function LIS() {
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark = theme === 'dark';

  const patients = useQuery(api.patients.list) || [];
  const labs = useQuery(api.clinical.listLabs) || [];
  
  const createLab = useMutation(api.clinical.createLab);
  const updateLabStatus = useMutation(api.clinical.updateLabStatus);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    testName: '',
    orderedBy: '',
    notes: ''
  });

  const activeLabs = labs.filter(lab => lab.status !== 'resulted');
  const completedLabs = labs.filter(lab => lab.status === 'resulted');

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.testName || !formData.orderedBy) return;
    
    const today = new Date().toISOString().split('T')[0];

    await createLab({
      patientId: formData.patientId,
      testName: formData.testName,
      orderedBy: formData.orderedBy,
      notes: formData.notes,
      orderedDate: today,
      status: 'ordered'
    });
    
    setShowModal(false);
    setFormData({ patientId: '', testName: '', orderedBy: '', notes: '' });
  };

  const advanceStatus = async (id, currentStatus) => {
    let nextStatus = 'ordered';
    if (currentStatus === 'ordered') nextStatus = 'collected';
    else if (currentStatus === 'collected') nextStatus = 'processing';
    else if (currentStatus === 'processing') nextStatus = 'resulted';
    
    if (nextStatus !== currentStatus) {
      await updateLabStatus({ id, status: nextStatus });
    }
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Patient';
  };

  const getPatientMRN = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? p.mrn : 'N/A';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ordered': return { bg: isDark ? 'rgba(156,163,175,0.1)' : '#f3f4f6', color: isDark ? '#9ca3af' : '#4b5563', border: isDark ? '#4b5563' : '#d1d5db', label: l('lis_stat_ordered') };
      case 'collected': return { bg: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb', border: isDark ? '#3b82f666' : '#bfdbfe', label: l('lis_stat_collected') };
      case 'processing': return { bg: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb', color: isDark ? '#fbbf24' : '#d97706', border: isDark ? '#f59e0b66' : '#fde68a', label: l('lis_stat_processing') };
      case 'resulted': return { bg: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', color: isDark ? '#34d399' : '#059669', border: isDark ? '#10b98166' : '#a7f3d0', label: l('lis_stat_resulted') };
      default: return { bg: '#eee', color: '#666', border: '#ddd', label: status };
    }
  };

  const getNextActionLabel = (status) => {
    switch (status) {
      case 'ordered': return l('lis_action_collect');
      case 'collected': return l('lis_action_process');
      case 'processing': return l('lis_action_result');
      default: return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div style={{
          background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)' : 'linear-gradient(135deg, #eef2ff 0%, #fff 100%)',
          border: `0.5px solid ${isDark ? 'rgba(99,102,241,0.4)' : '#c7d2fe'}`,
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
                <div style={{ background: isDark ? '#818cf8' : '#4f46e5', color: '#fff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '0 0 12px rgba(129,140,248,0.6)' : 'none' }}>
                  <i className="ti ti-microscope" style={{ fontSize: 18 }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#e2e8f0' : '#111' }}>{l('mod_lis')}</div>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#3a3f5c' }}>
                {l('desc_lis')}
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                background: isDark ? '#818cf8' : '#6366f1',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: isDark ? '0 0 12px rgba(129,140,248,0.4)' : '0 4px 12px rgba(99,102,241,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <i className="ti ti-plus" />
              {l('lis_new_order')}
            </button>
          </div>
        </div>
      </div>

      {/* Active Lab Orders Grid */}
      <div style={{
        background: isDark ? '#12141f' : '#fff',
        border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#e2e8f0' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-activity" style={{ color: isDark ? '#818cf8' : '#4f46e5' }} />
          {l('lis_active_labs')} ({activeLabs.length})
        </div>
        
        {activeLabs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: isDark ? '#888' : '#64748b', fontSize: 14 }}>
            No active lab orders found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, color: isDark ? '#64748b' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('lis_test_name')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('lis_ordered_by')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('lis_status')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeLabs.map(lab => {
                  const badge = getStatusBadge(lab.status);
                  const nextAction = getNextActionLabel(lab.status);
                  return (
                    <tr key={lab._id} style={{ borderBottom: `1px solid ${isDark ? '#16182a' : '#e2e8f0'}`, color: isDark ? '#ddd' : '#2d3148' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(129,140,248,0.1)' : '#eef2ff', color: isDark ? '#818cf8' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>
                            {getPatientName(lab.patientId).charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{getPatientName(lab.patientId)}</div>
                            <div style={{ fontSize: 12, color: isDark ? '#888' : '#888', fontFamily: 'monospace' }}>{getPatientMRN(lab.patientId)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: isDark ? '#64748b' : '#666' }}>{lab.orderedDate}</td>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{lab.testName}</td>
                      <td style={{ padding: '16px', color: isDark ? '#64748b' : '#666' }}>{lab.orderedBy}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' 
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {nextAction && (
                          <button 
                            onClick={() => advanceStatus(lab._id, lab.status)}
                            style={{
                              background: isDark ? 'rgba(99,102,241,0.1)' : '#e0e7ff',
                              color: isDark ? '#818cf8' : '#4338ca',
                              border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#c7d2fe'}`,
                              padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                            }}
                          >
                            {nextAction}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed Labs History */}
      {completedLabs.length > 0 && (
        <div style={{
          background: isDark ? '#12141f' : '#fff',
          border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#e2e8f0' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-check" style={{ color: isDark ? '#34d399' : '#10b981' }} />
            {l('lis_completed_labs')}
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, color: isDark ? '#64748b' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('lis_test_name')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('lis_ordered_by')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('lis_status')}</th>
                </tr>
              </thead>
              <tbody>
                {completedLabs.map(lab => {
                  const badge = getStatusBadge(lab.status);
                  return (
                    <tr key={lab._id} style={{ borderBottom: `1px solid ${isDark ? '#16182a' : '#e2e8f0'}`, color: isDark ? '#888' : '#777' }}>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{getPatientName(lab.patientId)}</td>
                      <td style={{ padding: '16px' }}>{lab.orderedDate}</td>
                      <td style={{ padding: '16px' }}>{lab.testName}</td>
                      <td style={{ padding: '16px' }}>{lab.orderedBy}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          background: isDark ? '#2d3148' : '#f9fafb', color: badge.color, border: `1px solid ${isDark ? '#2d3148' : '#eee'}`,
                          padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' 
                        }}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Lab Order Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#12141f' : '#fff',
            border: `1px solid ${isDark ? '#2d3148' : '#eee'}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{l('lis_new_order')}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: isDark ? '#64748b' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateOrder} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>Select Patient</label>
                <select 
                  required
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                    background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('lis_test_name')}</label>
                <input 
                  type="text" required placeholder="e.g. Complete Blood Count (CBC)"
                  value={formData.testName} onChange={e => setFormData({...formData, testName: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                    background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('lis_ordered_by')}</label>
                <input 
                  type="text" required placeholder="e.g. Dr. Smith"
                  value={formData.orderedBy} onChange={e => setFormData({...formData, orderedBy: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                    background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: 'transparent', color: isDark ? '#64748b' : '#3a3f5c', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#818cf8' : '#4f46e5', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Order Test
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
