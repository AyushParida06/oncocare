import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Inpatient() {
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark = theme === 'dark';

  const patients = useQuery(api.patients.list) || [];
  const admissions = useQuery(api.inpatient.getAdmissions) || [];
  
  const addAdmission = useMutation(api.inpatient.addAdmission);
  const updateAdmissionStatus = useMutation(api.inpatient.updateAdmissionStatus);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    room: '',
    bed: '',
    admissionDate: new Date().toISOString().split('T')[0]
  });

  const activeAdmissions = admissions.filter(a => a.status === 'admitted');
  const historyAdmissions = admissions.filter(a => a.status === 'discharged');

  const handleAdmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.room || !formData.bed) return;
    
    await addAdmission({
      patientId: formData.patientId,
      room: formData.room,
      bed: formData.bed,
      admissionDate: formData.admissionDate,
      status: 'admitted'
    });
    
    setShowModal(false);
    setFormData({ ...formData, room: '', bed: '' }); // reset some fields
  };

  const handleDischarge = async (id) => {
    const today = new Date().toISOString().split('T')[0];
    await updateAdmissionStatus({
      id,
      status: 'discharged',
      dischargeDate: today
    });
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
        background: isDark ? 'linear-gradient(135deg, rgba(59,109,17,0.15) 0%, rgba(59,109,17,0.05) 100%)' : 'linear-gradient(135deg, #EAF3DE 0%, #fff 100%)',
        border: `0.5px solid ${isDark ? '#3B6D1166' : '#d2e5b8'}`,
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
            <div style={{ background: isDark ? '#4ade80' : '#3B6D11', color: '#fff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '0 0 12px rgba(74,222,128,0.6)' : 'none' }}>
              <i className="ti ti-bed" style={{ fontSize: 18 }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#f5f5f5' : '#111' }}>{l('mod_inpatient')}</div>
          </div>
          <div style={{ fontSize: 13, color: isDark ? '#ccc' : '#555', maxWidth: 500 }}>
            {l('desc_inpatient')}
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: isDark ? '#4ade80' : '#3B6D11',
            color: isDark ? '#000' : '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: isDark ? '0 0 12px rgba(74,222,128,0.4)' : '0 4px 12px rgba(59,109,17,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          <i className="ti ti-plus" />
          {l('inpatient_admit')}
        </button>
      </div>

      {/* Active Admissions Grid */}
      <div style={{
        background: isDark ? '#1a1a1a' : '#fff',
        border: `0.5px solid ${isDark ? '#333' : '#eee'}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f5f5f5' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-activity" style={{ color: isDark ? '#4ade80' : '#3B6D11' }} />
          {l('inpatient_active')} ({activeAdmissions.length})
        </div>
        
        {activeAdmissions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: isDark ? '#888' : '#aaa', fontSize: 14 }}>
            {l('inpatient_no_records')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, color: isDark ? '#aaa' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>MRN</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_room')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_bed')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_date')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAdmissions.map(a => (
                  <tr key={a._id} style={{ borderBottom: `1px solid ${isDark ? '#222' : '#f5f5f5'}`, color: isDark ? '#ddd' : '#333' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(74,222,128,0.1)' : '#EAF3DE', color: isDark ? '#4ade80' : '#3B6D11', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>
                          {getPatientName(a.patientId).charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{getPatientName(a.patientId)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: 13 }}>{getPatientMRN(a.patientId)}</td>
                    <td style={{ padding: '16px' }}>{a.room}</td>
                    <td style={{ padding: '16px' }}>{a.bed}</td>
                    <td style={{ padding: '16px' }}>{a.admissionDate}</td>
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => handleDischarge(a._id)}
                        style={{
                          background: isDark ? 'rgba(239,68,68,0.1)' : '#FCEBEB',
                          color: isDark ? '#ef4444' : '#A32D2D',
                          border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fad4d4'}`,
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.2)' : '#fad4d4'}
                        onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : '#FCEBEB'}
                      >
                        {l('inpatient_discharge')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Discharged Admissions Grid */}
      {historyAdmissions.length > 0 && (
        <div style={{
          background: isDark ? '#1a1a1a' : '#fff',
          border: `0.5px solid ${isDark ? '#333' : '#eee'}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f5f5f5' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-history" style={{ color: isDark ? '#aaa' : '#666' }} />
            {l('inpatient_history')}
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, color: isDark ? '#aaa' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_room')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_bed')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_date')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('inpatient_discharge_date')}</th>
                </tr>
              </thead>
              <tbody>
                {historyAdmissions.map(a => (
                  <tr key={a._id} style={{ borderBottom: `1px solid ${isDark ? '#222' : '#f5f5f5'}`, color: isDark ? '#888' : '#777' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{getPatientName(a.patientId)}</td>
                    <td style={{ padding: '16px' }}>{a.room}</td>
                    <td style={{ padding: '16px' }}>{a.bed}</td>
                    <td style={{ padding: '16px' }}>{a.admissionDate}</td>
                    <td style={{ padding: '16px', color: isDark ? '#ef4444' : '#A32D2D', fontWeight: 500 }}>{a.dischargeDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admit Patient Modal */}
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
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{l('inpatient_admit')}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: isDark ? '#aaa' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={handleAdmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>{l('inpatient_select_patient')}</label>
                <select 
                  required
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="">-- {l('inpatient_select_patient')} --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>{l('inpatient_room')}</label>
                  <input 
                    type="text" required placeholder="e.g. 101"
                    value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})}
                    style={{ 
                      padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                      background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>{l('inpatient_bed')}</label>
                  <input 
                    type="text" required placeholder="e.g. A"
                    value={formData.bed} onChange={e => setFormData({...formData, bed: e.target.value})}
                    style={{ 
                      padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                      background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>{l('inpatient_date')}</label>
                <input 
                  type="date" required
                  value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: 'transparent', color: isDark ? '#aaa' : '#555', cursor: 'pointer', fontWeight: 500 }}>
                  {l('btn_cancel')}
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#4ade80' : '#3B6D11', color: isDark ? '#000' : '#fff', cursor: 'pointer', fontWeight: 600 }}>
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
