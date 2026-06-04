import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { api } from '../convex/_generated/api';

const FLAG_COLORS = { H: { bg: '#FAEEDA', color: '#854F0B' }, L: { bg: '#E6F1FB', color: '#185FA5' }, C: { bg: '#FCEBEB', color: '#A32D2D' } };
const STATUS_COLORS = { ordered: { bg: '#E6F1FB', color: '#185FA5' }, resulted: { bg: '#E1F5EE', color: '#0F6E56' }, critical: { bg: '#FCEBEB', color: '#A32D2D' }, processing: { bg: '#FAEEDA', color: '#854F0B' } };
const COMMON_TESTS = ['CBC','LFT','RFT','Blood Sugar','Tumour Markers (CA-125)','Tumour Markers (PSA)','Tumour Markers (CEA)','Tumour Markers (AFP)','Coagulation Profile','Electrolytes','Thyroid Profile','HbA1c','Biopsy / Histopathology','Molecular Testing (BRCA)','Molecular Testing (EGFR)'];

export default function LabResults() {
  const today = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState('list');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const labs     = useQuery(api.clinical.listLabs, {});
  const patients = useQuery(api.patients.list, {});
  const createLab = useMutation(api.clinical.createLab);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      testName: 'CBC',
      orderedBy: 'Dr. Ramesh K',
      orderedDate: today,
      status: 'ordered',
      notes: ''
    }
  });

  const filteredPatients = (patients || []).filter(p => `${p.firstName} ${p.lastName} ${p.mrn}`.toLowerCase().includes(patientSearch.toLowerCase()));

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }
    setSaving(true);
    try {
      await createLab({ ...data, patientId: selectedPatient._id });
      setSuccess(`Lab order placed for ${selectedPatient.firstName} ${selectedPatient.lastName}!`);
      reset();
      setSelectedPatient(null);
      setPatientSearch('');
      setTab('list');
    } catch(e) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>Lab Results</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Order and manage laboratory tests</div>
        </div>
        <button onClick={() => { setTab(tab === 'form' ? 'list' : 'form'); setSuccess(''); setError(''); }}
          style={{ background: tab === 'form' ? '#f4f6f8' : '#534AB7', color: tab === 'form' ? '#555' : '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className={`ti ${tab === 'form' ? 'ti-list' : 'ti-plus'}`} />
          {tab === 'form' ? 'View Results' : 'Order Lab Test'}
        </button>
      </div>

      {success && <div style={{ background: '#E1F5EE', border: '0.5px solid #a3d9c0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-circle-check" /> {success}</div>}
      {error   && <div style={{ background: '#FCEBEB', border: '0.5px solid #f5b8b8', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-alert-circle" /> {error}</div>}

      {tab === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-microscope" style={{ color: '#534AB7' }} /> Order Lab Test
          </div>

          <div style={sectionLabel}>Select Patient</div>
          <input value={patientSearch} onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); }} placeholder="Search patient by name or MRN…" style={{ ...inputStyle, marginBottom: 8 }} />
          {patientSearch && !selectedPatient && (
            <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
              {filteredPatients.slice(0,5).map(p => (
                <div key={p._id} onClick={() => { setSelectedPatient(p); setPatientSearch(`${p.firstName} ${p.lastName} (${p.mrn})`); }}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '0.5px solid #f4f6f8', fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <span style={{ fontWeight: 500 }}>{p.firstName} {p.lastName}</span>
                  <span style={{ color: '#888', marginLeft: 8, fontSize: 11 }}>{p.mrn} · {p.cancerType}</span>
                </div>
              ))}
            </div>
          )}
          {selectedPatient && <div style={{ background: '#EEEDFE', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#534AB7', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-user-check" /> {selectedPatient.firstName} {selectedPatient.lastName} — {selectedPatient.cancerType}</div>}

          <div style={sectionLabel}>Test Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={fieldLabel}>Test Name</div>
              <select {...register("testName")} style={inputStyle}>
                {COMMON_TESTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={fieldLabel}>Ordered By</div>
              <input {...register("orderedBy", { required: "Ordered By is required" })} style={errors.orderedBy ? inputStyleError : inputStyle} />
              {errors.orderedBy && <span style={errorText}>{errors.orderedBy.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Order Date</div>
              <input type="date" {...register("orderedDate", { required: "Order Date is required" })} style={errors.orderedDate ? inputStyleError : inputStyle} />
              {errors.orderedDate && <span style={errorText}>{errors.orderedDate.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Status</div>
              <select {...register("status")} style={inputStyle}>
                {['ordered','collected','processing','resulted','critical'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={fieldLabel}>Notes</div>
              <input {...register("notes")} placeholder="Clinical context, fasting required, etc." style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving} style={{ background: saving ? '#aaa' : '#534AB7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Place Order'}
            </button>
            <button type="button" onClick={() => { setTab('list'); reset(); setSelectedPatient(null); setPatientSearch(''); }} style={{ background: '#f4f6f8', color: '#555', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {tab === 'list' && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'grid', gridTemplateColumns: '120px 1fr 160px 100px 100px', gap: 12, fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase' }}>
            <span>Date</span><span>Test</span><span>Ordered By</span><span>Notes</span><span>Status</span>
          </div>
          {labs === undefined && <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading…</div>}
          {labs && labs.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 13 }}><i className="ti ti-microscope" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />No lab orders yet.</div>}
          {labs && labs.map((l, i) => {
            const sc = STATUS_COLORS[l.status] || STATUS_COLORS.ordered;
            return (
              <div key={l._id} style={{ padding: '12px 16px', borderBottom: i < labs.length - 1 ? '0.5px solid #f4f6f8' : 'none', display: 'grid', gridTemplateColumns: '120px 1fr 160px 100px 100px', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>{l.orderedDate}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{l.testName}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{l.orderedBy}</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{l.notes || '—'}</div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>{l.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const sectionLabel = { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingBottom: 6, borderBottom: '0.5px solid #f4f6f8' };
const fieldLabel   = { fontSize: 11, color: '#888', marginBottom: 4 };
const inputStyle   = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid #e5e7eb', fontSize: 13, outline: 'none', background: '#fafafa' };
const inputStyleError = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid #A32D2D', fontSize: 13, outline: 'none', background: '#FFF0F0' };
const errorText    = { fontSize: 10, color: '#A32D2D', marginTop: 4, display: 'block' };
