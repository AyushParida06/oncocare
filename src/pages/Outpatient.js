import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { api } from '../convex/_generated/api';

const CANCER_TYPES = ['Breast Cancer','Lung Cancer','Colorectal Cancer','Prostate Cancer','Blood/Lymphoma','Cervical Cancer','Ovarian Cancer','Brain Tumour','Skin Cancer','Thyroid Cancer','Liver Cancer','Pancreatic Cancer','Other'];
const STAGES = ['Stage I','Stage IA','Stage IB','Stage II','Stage IIA','Stage IIB','Stage III','Stage IIIA','Stage IIIB','Stage IV'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function Outpatient() {
  const [tab, setTab] = useState('list');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const patients = useQuery(api.patients.list, {});
  const createPatient = useMutation(api.patients.create);
  const removePatient = useMutation(api.patients.remove);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      mrn: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Female',
      phone: '',
      email: '',
      address: '',
      bloodGroup: 'B+',
      cancerType: 'Breast Cancer',
      cancerStage: 'Stage II',
      diagnosisDate: '',
      primaryOncologist: 'Dr. Ramesh K',
      status: 'active',
      insurance: ''
    }
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await createPatient(data);
      setSuccess(`Patient ${data.firstName} ${data.lastName} registered successfully!`);
      reset();
      setTab('list');
    } catch(e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const STATUS_COLORS = { active: { bg: '#E1F5EE', color: '#0F6E56' }, remission: { bg: '#EAF3DE', color: '#3B6D11' }, palliative: { bg: '#EEEDFE', color: '#534AB7' }, discharged: { bg: '#f4f6f8', color: '#888' } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>Outpatient Consultation</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Register and manage cancer patients</div>
        </div>
        <button onClick={() => { setTab(tab === 'form' ? 'list' : 'form'); setSuccess(''); setError(''); }}
          style={{ background: tab === 'form' ? '#f4f6f8' : '#0F6E56', color: tab === 'form' ? '#555' : '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className={`ti ${tab === 'form' ? 'ti-list' : 'ti-user-plus'}`} />
          {tab === 'form' ? 'View Patients' : 'Register New Patient'}
        </button>
      </div>

      {/* Success / Error */}
      {success && <div style={{ background: '#E1F5EE', border: '0.5px solid #a3d9c0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-circle-check" /> {success}</div>}
      {error   && <div style={{ background: '#FCEBEB', border: '0.5px solid #f5b8b8', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-alert-circle" /> {error}</div>}

      {/* Registration Form */}
      {tab === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-user-plus" style={{ color: '#0F6E56' }} /> Register New Patient
          </div>

          {/* Section: Personal Info */}
          <div style={sectionLabel}>Personal Information</div>
          <div style={grid3}>
            <div>
              <div style={fieldLabel}>MRN *</div>
              <input {...register("mrn", { required: "MRN is required" })} placeholder="OC-2026-006" style={errors.mrn ? inputStyleError : inputStyle} />
              {errors.mrn && <span style={errorText}>{errors.mrn.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>First Name *</div>
              <input {...register("firstName", { required: "First Name is required" })} placeholder="First name" style={errors.firstName ? inputStyleError : inputStyle} />
              {errors.firstName && <span style={errorText}>{errors.firstName.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Last Name *</div>
              <input {...register("lastName", { required: "Last Name is required" })} placeholder="Last name" style={errors.lastName ? inputStyleError : inputStyle} />
              {errors.lastName && <span style={errorText}>{errors.lastName.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Date of Birth</div>
              <input type="date" {...register("dateOfBirth")} style={inputStyle} />
            </div>
            <div>
              <div style={fieldLabel}>Phone *</div>
              <input {...register("phone", { required: "Phone is required" })} placeholder="9876543210" style={errors.phone ? inputStyleError : inputStyle} />
              {errors.phone && <span style={errorText}>{errors.phone.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Email</div>
              <input type="email" {...register("email")} placeholder="email@example.com" style={inputStyle} />
            </div>
            <div>
              <div style={fieldLabel}>Gender</div>
              <select {...register("gender")} style={inputStyle}>
                {['Female','Male','Other'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={fieldLabel}>Blood Group</div>
              <select {...register("bloodGroup")} style={inputStyle}>
                {BLOOD_GROUPS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={fieldLabel}>Insurance</div>
              <input {...register("insurance")} placeholder="Insurance provider" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={fieldLabel}>Address</div>
              <input {...register("address")} placeholder="123 Hospital St..." style={inputStyle} />
            </div>
          </div>

          <div style={{ ...sectionLabel, marginTop: 20 }}>Oncology Information</div>
          <div style={grid3}>
            <div>
              <div style={fieldLabel}>Cancer Type *</div>
              <select {...register("cancerType", { required: "Cancer Type is required" })} style={inputStyle}>
                {CANCER_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={fieldLabel}>Stage *</div>
              <select {...register("cancerStage", { required: "Cancer Stage is required" })} style={inputStyle}>
                {STAGES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={fieldLabel}>Diagnosis Date *</div>
              <input type="date" {...register("diagnosisDate", { required: "Diagnosis Date is required" })} style={errors.diagnosisDate ? inputStyleError : inputStyle} />
              {errors.diagnosisDate && <span style={errorText}>{errors.diagnosisDate.message}</span>}
            </div>
            <div>
              <div style={fieldLabel}>Primary Oncologist</div>
              <input {...register("primaryOncologist")} style={inputStyle} />
            </div>
            <div>
              <div style={fieldLabel}>Status</div>
              <select {...register("status")} style={inputStyle}>
                {['active','remission','palliative','discharged'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving}
              style={{ background: saving ? '#aaa' : '#0F6E56', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Register Patient'}
            </button>
            <button type="button" onClick={() => { setTab('list'); reset(); }}
              style={{ background: '#f4f6f8', color: '#555', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Patient List */}
      {tab === 'list' && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'grid', gridTemplateColumns: '120px 1fr 1fr 140px 100px 100px 80px', gap: 12, fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>MRN</span><span>Patient</span><span>Cancer Type</span><span>Stage</span><span>Oncologist</span><span>Status</span><span></span>
          </div>
          {patients === undefined && <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading…</div>}
          {patients && patients.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 13 }}>
              <i className="ti ti-users" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
              No patients yet. Click "Register New Patient" to add one.
            </div>
          )}
          {patients && patients.map((p, i) => {
            const sc = STATUS_COLORS[p.status] || STATUS_COLORS.active;
            return (
              <div key={p._id} style={{ padding: '12px 16px', borderBottom: i < patients.length - 1 ? '0.5px solid #f4f6f8' : 'none', display: 'grid', gridTemplateColumns: '120px 1fr 1fr 140px 100px 100px 80px', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#888', background: '#f4f6f8', padding: '2px 6px', borderRadius: 4 }}>{p.mrn}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{p.firstName} {p.lastName}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{p.gender} · {p.phone}</div>
                </div>
                <div style={{ fontSize: 12, color: '#333' }}>{p.cancerType}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{p.cancerStage}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{p.primaryOncologist}</div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: sc.bg, color: sc.color, display: 'inline-block' }}>{p.status}</span>
                <button onClick={() => removePatient({ id: p._id })}
                  style={{ background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const sectionLabel = { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, paddingBottom: 6, borderBottom: '0.5px solid #f4f6f8' };
const fieldLabel   = { fontSize: 11, color: '#888', marginBottom: 4 };
const inputStyle   = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid #e5e7eb', fontSize: 13, outline: 'none', background: '#fafafa' };
const inputStyleError = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '0.5px solid #A32D2D', fontSize: 13, outline: 'none', background: '#FFF0F0' };
const errorText    = { fontSize: 10, color: '#A32D2D', marginTop: 4, display: 'block' };
const grid3        = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 };
