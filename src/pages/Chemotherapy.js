import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '../convex/_generated/api';

const PROTOCOLS = ['AC-T','R-CHOP','FOLFOX','FOLFIRI','BEP','MVAC','Carboplatin/Paclitaxel','Gemcitabine/Cisplatin','ABVD','Docetaxel','Capecitabine','Other'];
const STATUS_COLORS = { scheduled: { bg: '#E6F1FB', color: '#185FA5' }, 'in-progress': { bg: '#FAEEDA', color: '#854F0B' }, completed: { bg: '#E1F5EE', color: '#0F6E56' }, delayed: { bg: '#FCEBEB', color: '#A32D2D' }, skipped: { bg: '#f4f6f8', color: '#888' } };

export default function Chemotherapy() {
  const today = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState('list');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const sessions  = useQuery(api.chemoSessions.list, {});
  const patients  = useQuery(api.patients.list, {});
  const createSession = useMutation(api.chemoSessions.create);
  const updateStatus  = useMutation(api.chemoSessions.updateStatus);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      protocol: 'AC-T',
      cycleNumber: 1,
      scheduledDate: today,
      status: 'scheduled',
      notes: '',
      drugs: [{ name: '', dose: '', route: 'IV' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "drugs"
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
      await createSession({
        ...data,
        cycleNumber: parseInt(data.cycleNumber),
        patientId: selectedPatient._id
      });
      setSuccess(`Chemo session scheduled for ${selectedPatient.firstName} ${selectedPatient.lastName}!`);
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
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>Chemotherapy</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Schedule and track chemotherapy sessions</div>
        </div>
        <button onClick={() => { setTab(tab === 'form' ? 'list' : 'form'); setSuccess(''); setError(''); }}
          style={{ background: tab === 'form' ? '#f4f6f8' : '#854F0B', color: tab === 'form' ? '#555' : '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className={`ti ${tab === 'form' ? 'ti-list' : 'ti-plus'}`} />
          {tab === 'form' ? 'View Sessions' : 'New Session'}
        </button>
      </div>

      {success && <div style={{ background: '#E1F5EE', border: '0.5px solid #a3d9c0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-circle-check" /> {success}</div>}
      {error   && <div style={{ background: '#FCEBEB', border: '0.5px solid #f5b8b8', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-alert-circle" /> {error}</div>}

      {tab === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-pill" style={{ color: '#854F0B' }} /> Schedule Chemotherapy Session
          </div>

          <div style={sectionLabel}>Select Patient</div>
          <input value={patientSearch} onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); }} placeholder="Search patient by name or MRN…" style={{ ...inputStyle, marginBottom: 8 }} />
          {patientSearch && !selectedPatient && (
            <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
              {filteredPatients.slice(0, 5).map(p => (
                <div key={p._id} onClick={() => { setSelectedPatient(p); setPatientSearch(`${p.firstName} ${p.lastName} (${p.mrn})`); }}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '0.5px solid #f4f6f8', fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <span style={{ fontWeight: 500 }}>{p.firstName} {p.lastName}</span>
                  <span style={{ color: '#888', marginLeft: 8, fontSize: 11 }}>{p.mrn} · {p.cancerType} · {p.cancerStage}</span>
                </div>
              ))}
            </div>
          )}
          {selectedPatient && <div style={{ background: '#FAEEDA', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#854F0B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-user-check" /> {selectedPatient.firstName} {selectedPatient.lastName} — {selectedPatient.cancerType} {selectedPatient.cancerStage}</div>}

          <div style={sectionLabel}>Session Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
            <div>
              <div style={fieldLabel}>Protocol</div>
              <select {...register("protocol")} style={inputStyle}>
                {PROTOCOLS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={fieldLabel}>Cycle Number</div>
              <input type="number" min="1" {...register("cycleNumber", { required: "Cycle Number is required" })} style={errors.cycleNumber ? inputStyleError : inputStyle} />
              {errors.cycleNumber && <span style={errorText}>{errors.cycleNumber.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Scheduled Date</div>
              <input type="date" {...register("scheduledDate", { required: "Scheduled Date is required" })} style={errors.scheduledDate ? inputStyleError : inputStyle} />
              {errors.scheduledDate && <span style={errorText}>{errors.scheduledDate.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Status</div>
              <select {...register("status")} style={inputStyle}>
                {['scheduled','in-progress','completed','delayed','skipped'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '2/-1' }}>
              <div style={fieldLabel}>Notes</div>
              <input {...register("notes")} placeholder="Any special notes…" style={inputStyle} />
            </div>
          </div>

          <div style={sectionLabel}>Drugs</div>
          {fields.map((field, i) => (
            <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 40px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
              <div>
                {i === 0 && <div style={fieldLabel}>Drug Name</div>}
                <input {...register(`drugs.${i}.name`, { required: "Required" })} placeholder="e.g. Doxorubicin" style={errors.drugs?.[i]?.name ? inputStyleError : inputStyle} />
              </div>
              <div>
                {i === 0 && <div style={fieldLabel}>Dose</div>}
                <input {...register(`drugs.${i}.dose`, { required: "Required" })} placeholder="e.g. 60 mg/m²" style={errors.drugs?.[i]?.dose ? inputStyleError : inputStyle} />
              </div>
              <div>
                {i === 0 && <div style={fieldLabel}>Route</div>}
                <select {...register(`drugs.${i}.route`)} style={inputStyle}>
                  {['IV','Oral','SC','IM'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => remove(i)} disabled={fields.length === 1}
                style={{ background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 8, padding: '8px', cursor: fields.length === 1 ? 'not-allowed' : 'pointer', opacity: fields.length === 1 ? 0.4 : 1 }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => append({ name: '', dose: '', route: 'IV' })} style={{ background: '#f4f6f8', color: '#555', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <i className="ti ti-plus" /> Add Drug
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving} style={{ background: saving ? '#aaa' : '#854F0B', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Schedule Session'}
            </button>
            <button type="button" onClick={() => { setTab('list'); reset(); setSelectedPatient(null); setPatientSearch(''); }} style={{ background: '#f4f6f8', color: '#555', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {tab === 'list' && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'grid', gridTemplateColumns: '120px 100px 120px 80px 1fr 100px', gap: 12, fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase' }}>
            <span>Date</span><span>Protocol</span><span>Cycle</span><span>Drugs</span><span>Notes</span><span>Status</span>
          </div>
          {sessions === undefined && <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading…</div>}
          {sessions && sessions.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 13 }}><i className="ti ti-pill" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />No sessions yet.</div>}
          {sessions && sessions.map((s, i) => {
            const sc = STATUS_COLORS[s.status] || STATUS_COLORS.scheduled;
            return (
              <div key={s._id} style={{ padding: '12px 16px', borderBottom: i < sessions.length - 1 ? '0.5px solid #f4f6f8' : 'none', display: 'grid', gridTemplateColumns: '120px 100px 120px 80px 1fr 100px', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>{s.scheduledDate}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{s.protocol}</div>
                <div style={{ fontSize: 12, color: '#555' }}>Cycle {s.cycleNumber}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{s.drugs.length} drug{s.drugs.length > 1 ? 's' : ''}</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{s.notes || '—'}</div>
                <span onClick={() => updateStatus({ id: s._id, status: s.status === 'scheduled' ? 'in-progress' : s.status === 'in-progress' ? 'completed' : s.status })}
                  style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: sc.bg, color: sc.color, cursor: 'pointer' }} title="Click to advance status">{s.status}</span>
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
