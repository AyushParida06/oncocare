import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function TumorBoard() {
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark = theme === 'dark';

  const patients = useQuery(api.patients.list) || [];
  const meetings = useQuery(api.tumorBoard.getMeetings) || [];
  
  const addMeeting = useMutation(api.tumorBoard.addMeeting);
  const addCase = useMutation(api.tumorBoard.addCase);
  const updateCaseDecision = useMutation(api.tumorBoard.updateCaseDecision);

  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  
  const meetingCases = useQuery(api.tumorBoard.getCases, selectedMeetingId ? { meetingId: selectedMeetingId } : "skip") || [];

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ date: '', location: '', notes: '' });

  const [showCaseModal, setShowCaseModal] = useState(false);
  const [caseForm, setCaseForm] = useState({ patientId: '', summary: '' });

  const [decisionEditingId, setDecisionEditingId] = useState(null);
  const [decisionText, setDecisionText] = useState('');

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.date) return;
    await addMeeting({
      date: meetingForm.date,
      location: meetingForm.location,
      notes: meetingForm.notes
    });
    setShowMeetingModal(false);
    setMeetingForm({ date: '', location: '', notes: '' });
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    if (!selectedMeetingId || !caseForm.patientId || !caseForm.summary) return;
    await addCase({
      meetingId: selectedMeetingId,
      patientId: caseForm.patientId,
      summary: caseForm.summary
    });
    setShowCaseModal(false);
    setCaseForm({ patientId: '', summary: '' });
  };

  const handleSaveDecision = async (caseId) => {
    await updateCaseDecision({
      caseId,
      decision: decisionText
    });
    setDecisionEditingId(null);
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Patient';
  };

  const getPatientMRN = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? p.mrn : 'N/A';
  };

  const selectedMeeting = meetings.find(m => m._id === selectedMeetingId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: 'calc(100vh - 100px)' }}>
      {/* Header Banner */}
      <div style={{
        background: isDark ? 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.05) 100%)' : 'linear-gradient(135deg, #fdf2f8 0%, #fff 100%)',
        border: `0.5px solid ${isDark ? 'rgba(236,72,153,0.4)' : '#fbcfe8'}`,
        borderRadius: 16,
        padding: '24px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ background: isDark ? '#f472b6' : '#db2777', color: '#fff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '0 0 12px rgba(244,114,182,0.6)' : 'none' }}>
              <i className="ti ti-users" style={{ fontSize: 18 }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#e2e8f0' : '#111' }}>{l('mod_tumor_board')}</div>
          </div>
          <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#3a3f5c' }}>
            {l('desc_tumor_board')}
          </div>
        </div>
        <button 
          onClick={() => setShowMeetingModal(true)}
          style={{
            background: isDark ? '#f472b6' : '#db2777',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: isDark ? '0 0 12px rgba(244,114,182,0.4)' : '0 4px 12px rgba(219,39,119,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <i className="ti ti-calendar-plus" />
          {l('tb_new_meeting')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Left Sidebar: Meetings List */}
        <div style={{
          width: 320,
          background: isDark ? '#12141f' : '#fff',
          border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, fontWeight: 600, color: isDark ? '#e2e8f0' : '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-calendar-event" style={{ color: isDark ? '#f472b6' : '#db2777' }} />
            {l('tb_meetings')}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {meetings.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: isDark ? '#666' : '#64748b', fontSize: 13 }}>No meetings scheduled.</div>
            ) : (
              meetings.map(m => {
                const isSelected = selectedMeetingId === m._id;
                return (
                  <div 
                    key={m._id}
                    onClick={() => setSelectedMeetingId(m._id)}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 8,
                      cursor: 'pointer',
                      background: isSelected ? (isDark ? 'rgba(236,72,153,0.1)' : '#fdf2f8') : 'transparent',
                      border: `1px solid ${isSelected ? (isDark ? 'rgba(236,72,153,0.3)' : '#fbcfe8') : 'transparent'}`,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = isDark ? '#16182a' : '#f9fafb' }}
                    onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ fontWeight: 600, color: isSelected ? (isDark ? '#f472b6' : '#db2777') : (isDark ? '#ddd' : '#2d3148'), marginBottom: 4 }}>
                      {new Date(m.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    {m.location && (
                      <div style={{ fontSize: 12, color: isDark ? '#888' : '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="ti ti-map-pin" /> {m.location}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content: Cases List */}
        <div style={{
          flex: 1,
          background: isDark ? '#12141f' : '#fff',
          border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          {selectedMeeting ? (
            <>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#e2e8f0' : '#111', marginBottom: 4 }}>
                    {new Date(selectedMeeting.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  {selectedMeeting.location && <div style={{ fontSize: 13, color: isDark ? '#888' : '#666' }}>Location: {selectedMeeting.location}</div>}
                  {selectedMeeting.notes && <div style={{ fontSize: 13, color: isDark ? '#888' : '#666', marginTop: 4 }}>{selectedMeeting.notes}</div>}
                </div>
                <button 
                  onClick={() => setShowCaseModal(true)}
                  style={{
                    background: isDark ? 'rgba(236,72,153,0.1)' : '#fdf2f8',
                    color: isDark ? '#f472b6' : '#db2777',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${isDark ? 'rgba(236,72,153,0.3)' : '#fbcfe8'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <i className="ti ti-user-plus" />
                  {l('tb_add_case')}
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#94a3b8' : '#2d3148', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-clipboard-list" />
                  {l('tb_cases')} ({meetingCases.length})
                </div>
                
                {meetingCases.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: isDark ? '#666' : '#64748b', fontSize: 14 }}>
                    No cases added to this meeting yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {meetingCases.map(c => (
                      <div key={c._id} style={{
                        background: isDark ? '#16182a' : '#f9fafb',
                        border: `1px solid ${isDark ? '#2d3148' : '#eee'}`,
                        borderRadius: 12,
                        padding: 20
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? 'rgba(236,72,153,0.1)' : '#fdf2f8', color: isDark ? '#f472b6' : '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16 }}>
                            {getPatientName(c.patientId).charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{getPatientName(c.patientId)}</div>
                            <div style={{ fontSize: 12, color: isDark ? '#888' : '#666', fontFamily: 'monospace' }}>MRN: {getPatientMRN(c.patientId)}</div>
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#64748b' : '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l('tb_summary')}</div>
                          <div style={{ fontSize: 14, color: isDark ? '#ddd' : '#2d3148', lineHeight: 1.5, background: isDark ? '#12141f' : '#fff', padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#eee'}` }}>
                            {c.summary}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#64748b' : '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l('tb_decision')}</div>
                          {decisionEditingId === c._id ? (
                            <div style={{ display: 'flex', gap: 10 }}>
                              <input 
                                type="text"
                                autoFocus
                                value={decisionText}
                                onChange={e => setDecisionText(e.target.value)}
                                style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: isDark ? '#12141f' : '#fff', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' }}
                                placeholder="Enter final clinical decision..."
                              />
                              <button onClick={() => handleSaveDecision(c._id)} style={{ padding: '0 16px', borderRadius: 8, border: 'none', background: isDark ? '#f472b6' : '#db2777', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{l('tb_save_decision')}</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? 'rgba(16,185,129,0.05)' : '#ecfdf5', padding: 12, borderRadius: 8, border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : '#d1fae5'}` }}>
                              <div style={{ fontSize: 14, color: c.decision ? (isDark ? '#34d399' : '#059669') : (isDark ? '#888' : '#64748b'), fontWeight: c.decision ? 500 : 400 }}>
                                {c.decision || 'No decision recorded yet.'}
                              </div>
                              <button 
                                onClick={() => { setDecisionEditingId(c._id); setDecisionText(c.decision || ''); }}
                                style={{ background: 'none', border: 'none', color: isDark ? '#f472b6' : '#db2777', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                              >
                                {l('tb_record_decision')}
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: isDark ? '#666' : '#64748b', gap: 16 }}>
              <i className="ti ti-users-group" style={{ fontSize: 48, opacity: 0.5 }} />
              <div style={{ fontSize: 16 }}>Select a meeting from the sidebar to view cases.</div>
            </div>
          )}
        </div>
      </div>

      {/* New Meeting Modal */}
      {showMeetingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: isDark ? '#12141f' : '#fff', border: `1px solid ${isDark ? '#2d3148' : '#eee'}`, borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{l('tb_new_meeting')}</div>
              <button onClick={() => setShowMeetingModal(false)} style={{ background: 'none', border: 'none', color: isDark ? '#64748b' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            <form onSubmit={handleAddMeeting} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('tb_date')}</label>
                <input type="date" required value={meetingForm.date} onChange={e => setMeetingForm({...meetingForm, date: e.target.value})} style={{ padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('tb_location')} (Optional)</label>
                <input type="text" placeholder="e.g. Conference Room B" value={meetingForm.location} onChange={e => setMeetingForm({...meetingForm, location: e.target.value})} style={{ padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowMeetingModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: 'transparent', color: isDark ? '#64748b' : '#3a3f5c', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#f472b6' : '#db2777', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Create Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Case Modal */}
      {showCaseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: isDark ? '#12141f' : '#fff', border: `1px solid ${isDark ? '#2d3148' : '#eee'}`, borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{l('tb_add_case')}</div>
              <button onClick={() => setShowCaseModal(false)} style={{ background: 'none', border: 'none', color: isDark ? '#64748b' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            <form onSubmit={handleAddCase} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>Select Patient</label>
                <select required value={caseForm.patientId} onChange={e => setCaseForm({...caseForm, patientId: e.target.value})} style={{ padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' }}>
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('tb_summary')}</label>
                <textarea required rows={4} placeholder="Summarize the clinical presentation, histology, and question for the board..." value={caseForm.summary} onChange={e => setCaseForm({...caseForm, summary: e.target.value})} style={{ padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowCaseModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: 'transparent', color: isDark ? '#64748b' : '#3a3f5c', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#f472b6' : '#db2777', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Add Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
