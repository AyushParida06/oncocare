import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function PharmacyMgmt() {
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark = theme === 'dark';

  const patients = useQuery(api.patients.list) || [];
  const orders = useQuery(api.pharmacy.getOrders) || [];
  
  const addOrder = useMutation(api.pharmacy.addOrder);
  const updateOrderStatus = useMutation(api.pharmacy.updateOrderStatus);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: ''
  });

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'verified');
  const historyOrders = orders.filter(o => o.status === 'dispensed');

  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.medication) return;
    
    const today = new Date().toISOString().split('T')[0];

    await addOrder({
      patientId: formData.patientId,
      medication: formData.medication,
      dosage: formData.dosage,
      frequency: formData.frequency,
      orderedDate: today,
      status: 'pending'
    });
    
    setShowModal(false);
    setFormData({ patientId: '', medication: '', dosage: '', frequency: '' });
  };

  const handleVerify = async (id) => {
    await updateOrderStatus({ id, status: 'verified' });
  };

  const handleDispense = async (id) => {
    await updateOrderStatus({ id, status: 'dispensed' });
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Patient';
  };

  const getPatientMRN = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? p.mrn : 'N/A';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: isDark ? 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)' : 'linear-gradient(135deg, #f5f3ff 0%, #fff 100%)',
        border: `0.5px solid ${isDark ? 'rgba(139,92,246,0.4)' : '#ede9fe'}`,
        borderRadius: 16,
        padding: '24px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ background: isDark ? '#a78bfa' : '#8b5cf6', color: '#fff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '0 0 12px rgba(167,139,250,0.6)' : 'none' }}>
              <i className="ti ti-prescription" style={{ fontSize: 18 }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#e2e8f0' : '#111' }}>{l('mod_pharmacy')}</div>
          </div>
          <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#3a3f5c', maxWidth: 500 }}>
            {l('desc_pharmacy')}
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: isDark ? '#a78bfa' : '#8b5cf6',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: isDark ? '0 0 12px rgba(167,139,250,0.4)' : '0 4px 12px rgba(139,92,246,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          <i className="ti ti-plus" />
          {l('pharmacy_new_order')}
        </button>
      </div>

      {/* Active Orders Grid */}
      <div style={{
        background: isDark ? '#12141f' : '#fff',
        border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#e2e8f0' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-activity" style={{ color: isDark ? '#a78bfa' : '#8b5cf6' }} />
          {l('pharmacy_active')} ({activeOrders.length})
        </div>
        
        {activeOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: isDark ? '#888' : '#64748b', fontSize: 14 }}>
            No active orders found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, color: isDark ? '#64748b' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('pharmacy_medication')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('pharmacy_dosage')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('pharmacy_frequency')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_status')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map(o => (
                  <tr key={o._id} style={{ borderBottom: `1px solid ${isDark ? '#16182a' : '#e2e8f0'}`, color: isDark ? '#ddd' : '#2d3148' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(167,139,250,0.1)' : '#f5f3ff', color: isDark ? '#a78bfa' : '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>
                          {getPatientName(o.patientId).charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{getPatientName(o.patientId)}</div>
                          <div style={{ fontSize: 12, color: isDark ? '#888' : '#888', fontFamily: 'monospace' }}>{getPatientMRN(o.patientId)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{o.medication}</td>
                    <td style={{ padding: '16px' }}>{o.dosage}</td>
                    <td style={{ padding: '16px' }}>{o.frequency}</td>
                    <td style={{ padding: '16px' }}>
                      {o.status === 'pending' ? (
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb', color: isDark ? '#fbbf24' : '#d97706' }}>
                          {l('pharmacy_status_pending')}
                        </span>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb' }}>
                          {l('pharmacy_status_verified')}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {o.status === 'pending' && (
                        <button 
                          onClick={() => handleVerify(o._id)}
                          style={{
                            background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',
                            color: isDark ? '#60a5fa' : '#2563eb',
                            border: `1px solid ${isDark ? 'rgba(59,130,246,0.3)' : '#bfdbfe'}`,
                            padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                          }}
                        >
                          {l('pharmacy_verify')}
                        </button>
                      )}
                      {o.status === 'verified' && (
                        <button 
                          onClick={() => handleDispense(o._id)}
                          style={{
                            background: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5',
                            color: isDark ? '#34d399' : '#059669',
                            border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0'}`,
                            padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                          }}
                        >
                          {l('pharmacy_dispense')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispensed History */}
      {historyOrders.length > 0 && (
        <div style={{
          background: isDark ? '#12141f' : '#fff',
          border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#e2e8f0' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-history" style={{ color: isDark ? '#64748b' : '#666' }} />
            {l('pharmacy_history')}
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, color: isDark ? '#64748b' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('pharmacy_medication')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('pharmacy_dosage')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('pharmacy_frequency')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_status')}</th>
                </tr>
              </thead>
              <tbody>
                {historyOrders.map(o => (
                  <tr key={o._id} style={{ borderBottom: `1px solid ${isDark ? '#16182a' : '#e2e8f0'}`, color: isDark ? '#888' : '#777' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{getPatientName(o.patientId)}</td>
                    <td style={{ padding: '16px' }}>{o.medication}</td>
                    <td style={{ padding: '16px' }}>{o.dosage}</td>
                    <td style={{ padding: '16px' }}>{o.frequency}</td>
                    <td style={{ padding: '16px', color: isDark ? '#34d399' : '#059669', fontWeight: 500 }}>
                      <i className="ti ti-check" style={{ marginRight: 4 }} />
                      {l('pharmacy_status_dispensed')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Order Modal */}
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
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{l('pharmacy_new_order')}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: isDark ? '#64748b' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddOrder} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('inpatient_select_patient')}</label>
                <select 
                  required
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                    background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="">-- {l('inpatient_select_patient')} --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('pharmacy_medication')}</label>
                <input 
                  type="text" required placeholder="e.g. Doxorubicin"
                  value={formData.medication} onChange={e => setFormData({...formData, medication: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                    background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('pharmacy_dosage')}</label>
                  <input 
                    type="text" required placeholder="e.g. 50mg"
                    value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})}
                    style={{ 
                      padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                      background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('pharmacy_frequency')}</label>
                  <input 
                    type="text" required placeholder="e.g. Once daily"
                    value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}
                    style={{ 
                      padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                      background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: 'transparent', color: isDark ? '#64748b' : '#3a3f5c', cursor: 'pointer', fontWeight: 500 }}>
                  {l('btn_cancel')}
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#a78bfa' : '#8b5cf6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  {l('btn_save')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
