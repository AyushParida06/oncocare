import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { api } from '../convex/_generated/api';

const STATUS_COLORS = { scheduled: { bg: '#E6F1FB', color: '#185FA5' }, confirmed: { bg: '#E1F5EE', color: '#0F6E56' }, completed: { bg: '#EAF3DE', color: '#3B6D11' }, cancelled: { bg: '#FCEBEB', color: '#A32D2D' }, 'no-show': { bg: '#f4f6f8', color: '#888' } };
const TYPE_COLORS   = { chemotherapy: { bg: '#FAEEDA', color: '#854F0B' }, consultation: { bg: '#E1F5EE', color: '#0F6E56' }, radiology: { bg: '#E6F1FB', color: '#185FA5' }, lab: { bg: '#EEEDFE', color: '#534AB7' }, followup: { bg: '#f4f6f8', color: '#555' } };

export default function Appointments() {
  const today = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState('list');
  const [filterDate, setFilterDate] = useState(today);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]   = useState('');

  const appointments = useQuery(api.appointments.list, { date: filterDate });
  const patients     = useQuery(api.patients.list, {});
  const createAppt   = useMutation(api.appointments.create);
  const updateStatus = useMutation(api.appointments.updateStatus);
  const removeAppt   = useMutation(api.appointments.remove);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      type: 'consultation',
      date: today,
      time: '09:00',
      doctor: 'Dr. Ramesh K',
      department: 'Outpatient',
      status: 'scheduled',
      notes: ''
    }
  });

  const filteredPatients = (patients || []).filter(p =>
    `${p.firstName} ${p.lastName} ${p.mrn}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }
    setSaving(true);
    try {
      await createAppt({ ...data, patientId: selectedPatient._id });
      setSuccess(`Appointment booked for ${selectedPatient.firstName} ${selectedPatient.lastName}!`);
      reset();
      setSelectedPatient(null);
      setPatientSearch('');
      setTab('list');
    } catch(e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setValue('type', val);
    const dept = { consultation:'Outpatient', chemotherapy:'Chemotherapy', radiology:'Radiology', lab:'Laboratory', followup:'Outpatient' }[val] || 'Outpatient';
    setValue('department', dept);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>Appointments</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Schedule and manage patient appointments</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {tab === 'list' && <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: '7px 10px', borderRadius: 8, border: '0.5px solid #e5e7eb', fontSize: 13, outline: 'none' }} />}
          <button onClick={() => { setTab(tab === 'form' ? 'list' : 'form'); setSuccess(''); setError(''); }}
            style={{ background: tab === 'form' ? '#f4f6f8' : '#0F6E56', color: tab === 'form' ? '#555' : '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className={`ti ${tab === 'form' ? 'ti-list' : 'ti-calendar-plus'}`} />
            {tab === 'form' ? 'View Appointments' : 'New Appointment'}
          </button>
        </div>
      </div>

      {success && <div style={{ background: '#E1F5EE', border: '0.5px solid #a3d9c0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-circle-check" /> {success}</div>}
      {error   && <div style={{ background: '#FCEBEB', border: '0.5px solid #f5b8b8', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-alert-circle" /> {error}</div>}

      {tab === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-calendar-plus" style={{ color: '#993C1D' }} /> Book New Appointment
          </div>

          {/* Patient search */}
          <div style={sectionLabel}>Select Patient</div>
          <input value={patientSearch} onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
            placeholder="Search by name or MRN…" style={{ ...inputStyle, marginBottom: 8 }} />
          {patientSearch && !selectedPatient && (
            <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
              {filteredPatients.length === 0 && <div style={{ padding: 12, fontSize: 13, color: '#aaa', textAlign: 'center' }}>No patients found</div>}
              {filteredPatients.slice(0, 5).map(p => (
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
          {selectedPatient && (
            <div style={{ background: '#E1F5EE', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#0F6E56', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-user-check" /> {selectedPatient.firstName} {selectedPatient.lastName} — {selectedPatient.cancerType}
            </div>
          )}

          <div style={sectionLabel}>Appointment Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            <div>
              <div style={fieldLabel}>Type</div>
              <select {...register("type")} onChange={handleTypeChange} style={inputStyle}>
                {['consultation','chemotherapy','radiology','lab','followup'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={fieldLabel}>Date</div>
              <input type="date" {...register("date", { required: "Date is required" })} style={errors.date ? inputStyleError : inputStyle} />
              {errors.date && <span style={errorText}>{errors.date.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Time</div>
              <input type="time" {...register("time", { required: "Time is required" })} style={errors.time ? inputStyleError : inputStyle} />
              {errors.time && <span style={errorText}>{errors.time.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Doctor</div>
              <input {...register("doctor", { required: "Doctor is required" })} style={errors.doctor ? inputStyleError : inputStyle} />
              {errors.doctor && <span style={errorText}>{errors.doctor.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Department</div>
              <input {...register("department")} style={inputStyle} />
            </div>
            <div>
              <div style={fieldLabel}>Status</div>
              <select {...register("status")} style={inputStyle}>
                {['scheduled','confirmed'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={fieldLabel}>Notes (optional)</div>
              <textarea {...register("notes")} rows={2}
                style={{ ...inputStyle, resize: 'vertical' }} placeholder="Any special instructions…" />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving}
              style={{ background: saving ? '#aaa' : '#0F6E56', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Book Appointment'}
            </button>
            <button type="button" onClick={() => { setTab('list'); reset(); setSelectedPatient(null); setPatientSearch(''); }}
              style={{ background: '#f4f6f8', color: '#555', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {tab === 'list' && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'grid', gridTemplateColumns: '80px 120px 160px 80px 120px 80px', gap: 12, fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase' }}>
            <span>Time</span><span>Type</span><span>Doctor</span><span>Dept</span><span>Status</span><span></span>
          </div>
          {appointments === undefined && <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading…</div>}
          {appointments && appointments.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 13 }}><i className="ti ti-calendar-off" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />No appointments for {filterDate}</div>}
          {appointments && appointments.map((a, i) => {
            const sc = STATUS_COLORS[a.status] || STATUS_COLORS.scheduled;
            const tc = TYPE_COLORS[a.type]     || TYPE_COLORS.followup;
            return (
              <div key={a._id} style={{ padding: '12px 16px', borderBottom: i < appointments.length - 1 ? '0.5px solid #f4f6f8' : 'none', display: 'grid', gridTemplateColumns: '80px 120px 160px 80px 120px 80px', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{a.time}</div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: tc.bg, color: tc.color }}>{a.type}</span>
                <div style={{ fontSize: 12, color: '#555' }}>{a.doctor}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{a.department}</div>
                <span onClick={() => updateStatus({ id: a._id, status: a.status === 'scheduled' ? 'confirmed' : a.status === 'confirmed' ? 'completed' : a.status })}
                  style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: sc.bg, color: sc.color, cursor: 'pointer' }} title="Click to advance status">{a.status}</span>
                <button onClick={() => removeAppt({ id: a._id })} style={{ background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>Delete</button>
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
