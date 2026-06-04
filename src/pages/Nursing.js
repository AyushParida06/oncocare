import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Nursing() {
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark = theme === 'dark';

  const patients = useQuery(api.patients.list) || [];
  const addVitals = useMutation(api.nursing.addVitals);
  const addNote = useMutation(api.nursing.addNote);
  const addCarePlan = useMutation(api.nursing.addCarePlan);

  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    temperature: '',
    heartRate: '',
    bloodPressure: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    nurseName: 'Current User'
  });

  const cards = [
    { id: 'assessment', title: l('nursing_assessment'), desc: l('nursing_assessment_desc'), icon: 'ti-clipboard-heart', color: '#3b82f6' },
    { id: 'med_admin', title: l('nursing_med_admin'), desc: l('nursing_med_admin_desc'), icon: 'ti-pill', color: '#8b5cf6' },
    { id: 'care_plans', title: l('nursing_care_plans'), desc: l('nursing_care_plans_desc'), icon: 'ti-file-description', color: '#10b981' },
    { id: 'handover', title: l('nursing_handover'), desc: l('nursing_handover_desc'), icon: 'ti-users', color: '#f59e0b' },
  ];

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!formData.patientId) return;

    const today = new Date();
    
    await addVitals({
      patientId: formData.patientId,
      date: today.toISOString().split('T')[0],
      time: today.toTimeString().split(' ')[0].substring(0, 5),
      temperature: formData.temperature,
      heartRate: formData.heartRate,
      bloodPressure: formData.bloodPressure,
      respiratoryRate: formData.respiratoryRate,
      oxygenSaturation: formData.oxygenSaturation,
      nurseName: formData.nurseName
    });

    setActiveModal(null);
    setFormData({ ...formData, temperature: '', heartRate: '', bloodPressure: '', respiratoryRate: '', oxygenSaturation: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: isDark ? '#1e1e1e' : '#fff',
        border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
        borderRadius: 12,
        padding: '24px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: 12, 
            background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', 
            color: isDark ? '#60a5fa' : '#3b82f6', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: isDark ? 'inset 0 0 20px rgba(59,130,246,0.2)' : 'none' 
          }}>
            <i className="ti ti-user" style={{ fontSize: 24 }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: isDark ? '#f5f5f5' : '#111', marginBottom: 4 }}>
              {l('mod_nursing')}
            </div>
            <div style={{ fontSize: 13, color: isDark ? '#a3a3a3' : '#6b7280' }}>
              {l('desc_nursing')}
            </div>
          </div>
        </div>
        <div style={{
          background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',
          color: isDark ? '#60a5fa' : '#3b82f6',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}`,
        }}>
          {l('ui_module_active')}
        </div>
      </div>

      {/* 2x2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {cards.map(card => (
          <div key={card.id} 
            onClick={() => {
              if (card.id === 'assessment') setActiveModal('assessment');
              if (card.id === 'handover') setActiveModal('handover');
              if (card.id === 'med_admin') setActiveModal('med_admin');
              if (card.id === 'care_plans') setActiveModal('care_plans');
            }}
            style={{
            background: isDark ? '#1e1e1e' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            cursor: 'pointer',
            transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isDark ? '#252525' : '#f9fafb';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = isDark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 20px rgba(0,0,0,0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isDark ? '#1e1e1e' : '#fff';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.02)';
          }}
          >
            <div style={{ 
              width: 42, height: 42, borderRadius: 10, 
              background: isDark ? 'rgba(255,255,255,0.05)' : `${card.color}15`, 
              color: isDark ? '#a3a3a3' : card.color, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${isDark ? '#333' : `${card.color}30`}`
            }}>
              <i className={`ti ${card.icon}`} style={{ fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#f5f5f5' : '#111', marginBottom: 4 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#888' : '#6b7280' }}>
                {card.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Modal */}
      {activeModal === 'assessment' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#1e1e1e' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#eee'}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-clipboard-heart" style={{ color: '#3b82f6' }} />
                Record Patient Vitals
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: isDark ? '#aaa' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={handleSaveVitals} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Select Patient</label>
                <select 
                  required
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Heart Rate (bpm)</label>
                  <input 
                    type="text" placeholder="e.g. 72"
                    value={formData.heartRate} onChange={e => setFormData({...formData, heartRate: e.target.value})}
                    style={{ 
                      padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                      background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Blood Pressure (mmHg)</label>
                  <input 
                    type="text" placeholder="e.g. 120/80"
                    value={formData.bloodPressure} onChange={e => setFormData({...formData, bloodPressure: e.target.value})}
                    style={{ 
                      padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                      background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>SpO2 (%)</label>
                  <input 
                    type="text" placeholder="e.g. 98"
                    value={formData.oxygenSaturation} onChange={e => setFormData({...formData, oxygenSaturation: e.target.value})}
                    style={{ 
                      padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                      background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Temperature (°F)</label>
                  <input 
                    type="text" placeholder="e.g. 98.6"
                    value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})}
                    style={{ 
                      padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                      background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: 'transparent', color: isDark ? '#aaa' : '#555', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Save Vitals
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Handover Notes Modal */}
      {activeModal === 'handover' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#1e1e1e' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#eee'}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-users" style={{ color: '#f59e0b' }} />
                Shift Handover Note
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: isDark ? '#aaa' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!formData.patientId || !formData.handoverNote) return;
              const today = new Date();
              
              await addNote({
                patientId: formData.patientId,
                date: today.toISOString().split('T')[0],
                time: today.toTimeString().split(' ')[0].substring(0, 5),
                nurseName: formData.nurseName || 'Current User',
                note: formData.handoverNote,
                type: 'handover'
              });

              setActiveModal(null);
              setFormData({ ...formData, handoverNote: '' });
            }} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Select Patient</label>
                <select 
                  required
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Handover Observations & Plan</label>
                <textarea 
                  required placeholder="Enter clinical observations, pending tasks, and care plan for the next shift..."
                  rows={5}
                  value={formData.handoverNote || ''} onChange={e => setFormData({...formData, handoverNote: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: 'transparent', color: isDark ? '#aaa' : '#555', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Save Handover Note
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Medication Admin Modal */}
      {activeModal === 'med_admin' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#1e1e1e' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#eee'}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-pill" style={{ color: '#8b5cf6' }} />
                Record Medication Administration
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: isDark ? '#aaa' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!formData.patientId || !formData.medicationAdmin) return;
              const today = new Date();
              
              await addNote({
                patientId: formData.patientId,
                date: today.toISOString().split('T')[0],
                time: today.toTimeString().split(' ')[0].substring(0, 5),
                nurseName: formData.nurseName || 'Current User',
                note: formData.medicationAdmin,
                type: 'medication_admin'
              });

              setActiveModal(null);
              setFormData({ ...formData, medicationAdmin: '' });
            }} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Select Patient</label>
                <select 
                  required
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Medication & Dosage Details</label>
                <input 
                  type="text" required placeholder="e.g. Paracetamol 500mg IV"
                  value={formData.medicationAdmin || ''} onChange={e => setFormData({...formData, medicationAdmin: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: 'transparent', color: isDark ? '#aaa' : '#555', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Log Medication
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Care Plans Modal */}
      {activeModal === 'care_plans' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#1e1e1e' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#eee'}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-file-description" style={{ color: '#10b981' }} />
                Create Nursing Care Plan
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: isDark ? '#aaa' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!formData.patientId || !formData.carePlanTitle) return;
              const today = new Date();
              
              await addCarePlan({
                patientId: formData.patientId,
                title: formData.carePlanTitle,
                description: formData.carePlanDesc,
                startDate: today.toISOString().split('T')[0],
                status: 'active'
              });

              setActiveModal(null);
              setFormData({ ...formData, carePlanTitle: '', carePlanDesc: '' });
            }} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Select Patient</label>
                <select 
                  required
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Plan Title</label>
                <input 
                  type="text" required placeholder="e.g. Post-Chemo Nausea Management"
                  value={formData.carePlanTitle || ''} onChange={e => setFormData({...formData, carePlanTitle: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#aaa' : '#555' }}>Plan Interventions</label>
                <textarea 
                  placeholder="Outline the nursing interventions..."
                  rows={4}
                  value={formData.carePlanDesc || ''} onChange={e => setFormData({...formData, carePlanDesc: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, 
                    background: isDark ? '#222' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: 'transparent', color: isDark ? '#aaa' : '#555', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Create Plan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
