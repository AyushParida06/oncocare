import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { api } from '../convex/_generated/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const CANCER_TYPES = ['Breast Cancer','Lung Cancer','Colorectal Cancer','Prostate Cancer','Blood/Lymphoma','Cervical Cancer','Ovarian Cancer','Brain Tumour','Skin Cancer','Thyroid Cancer','Liver Cancer','Pancreatic Cancer','Other'];
const STAGES = ['Stage I','Stage IA','Stage IB','Stage II','Stage IIA','Stage IIB','Stage III','Stage IIIA','Stage IIIB','Stage IV'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function Outpatient() {
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark = theme === 'dark';

  const [tab, setTab] = useState('list');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const patients = useQuery(api.patients.list, {});
  const createPatient = useMutation(api.patients.create);
  const removePatient = useMutation(api.patients.remove);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { mrn:'',firstName:'',lastName:'',dateOfBirth:'',gender:'Female',phone:'',email:'',address:'',bloodGroup:'B+',cancerType:'Breast Cancer',cancerStage:'Stage II',diagnosisDate:'',primaryOncologist:'Dr. Ramesh K',status:'active',insurance:'' }
  });

  const onSubmit = async (data) => {
    setError(''); setSuccess(''); setSaving(true);
    try { await createPatient(data); setSuccess(`Patient ${data.firstName} ${data.lastName} registered!`); reset(); setTab('list'); }
    catch(e) { setError(e.message); }
    setSaving(false);
  };

  // Theme tokens
  const cardBg     = isDark ? '#1e2030' : '#fff';
  const cardBorder = isDark ? '#2d3148'    : '#e5e7eb';
  const textMain   = isDark ? '#e2e8f0' : '#111';
  const textMuted  = isDark ? '#64748b'    : '#888';
  const textSub    = isDark ? '#94a3b8'    : '#2d3148';
  const inputBg    = isDark ? '#2d3148'    : '#fafafa';
  const inputBorderC = isDark ? '#3a3f5c'  : '#e5e7eb';
  const rowBorder  = isDark ? '#2d3148' : '#f4f6f8';
  const mrnBg      = isDark ? '#2d3148'    : '#f4f6f8';

  const cardStyle = { background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 12, boxShadow: isDark ? '0 0 12px rgba(99,102,241,0.10)' : 'none', transition: 'background 0.3s, border-color 0.3s' };
  const inp = { width: '100%', padding: '8px 10px', borderRadius: 8, border: `0.5px solid ${inputBorderC}`, fontSize: 13, outline: 'none', background: inputBg, color: textMain };
  const inpErr = { ...inp, border: '0.5px solid #A32D2D', background: isDark ? '#3a2020' : '#FFF0F0' };
  const secLabel = { fontSize: 11, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, paddingBottom: 6, borderBottom: `0.5px solid ${rowBorder}` };
  const fLabel   = { fontSize: 11, color: textMuted, marginBottom: 4 };
  const errTxt   = { fontSize: 10, color: '#f87171', marginTop: 4, display: 'block' };
  const g3       = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 };

  const STATUS_COLORS = {
    active:    { bg: isDark ? 'rgba(74,222,128,0.15)' : '#E1F5EE', color: '#4ade80' },
    remission: { bg: isDark ? 'rgba(96,165,250,0.15)' : '#EAF3DE', color: '#60a5fa' },
    palliative:{ bg: isDark ? 'rgba(232,121,249,0.15)' : '#EEEDFE', color: '#e879f9' },
    discharged:{ bg: isDark ? 'rgba(170,170,170,0.15)' : '#f4f6f8', color: '#64748b'   },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: textMain, ...(isDark ? { textShadow: '0 0 8px rgba(74,222,128,0.4)' } : {}) }}>Outpatient Management</div>
          <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>Register and manage cancer patients</div>
        </div>
        <button onClick={() => { setTab(tab === 'form' ? 'list' : 'form'); setSuccess(''); setError(''); }}
          style={{ background: tab === 'form' ? (isDark ? '#2d3148' : '#f4f6f8') : '#0F6E56', color: tab === 'form' ? textMuted : '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: tab !== 'form' && isDark ? '0 0 10px rgba(99,102,241,0.35)' : 'none' }}>
          <i className={`ti ${tab === 'form' ? 'ti-list' : 'ti-user-plus'}`} />
          {tab === 'form' ? 'View Patients' : 'Register New Patient'}
        </button>
      </div>

      {success && <div style={{ background: isDark ? 'rgba(74,222,128,0.15)' : '#E1F5EE', border: `0.5px solid ${isDark ? '#4ade8066' : '#a3d9c0'}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: isDark ? '#4ade80' : '#0F6E56', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-circle-check" /> {success}</div>}
      {error   && <div style={{ background: isDark ? 'rgba(248,113,113,0.15)' : '#FCEBEB', border: `0.5px solid ${isDark ? '#f8717166' : '#f5b8b8'}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: isDark ? '#f87171' : '#A32D2D', display: 'flex', alignItems: 'center', gap: 8 }}><i className="ti ti-alert-circle" /> {error}</div>}

      {/* Registration Form */}
      {tab === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ ...cardStyle, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: textMain, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-user-plus" style={{ color: isDark ? '#4ade80' : '#0F6E56' }} /> Register New Patient
          </div>
          <div style={secLabel}>Personal Information</div>
          <div style={g3}>
            <div><div style={fLabel}>MRN *</div><input {...register("mrn",{required:"MRN is required"})} placeholder="OC-2026-006" style={errors.mrn ? inpErr : inp} />{errors.mrn && <span style={errTxt}>{errors.mrn.message}</span>}</div>
            <div><div style={fLabel}>First Name *</div><input {...register("firstName",{required:"Required"})} placeholder="First name" style={errors.firstName ? inpErr : inp} />{errors.firstName && <span style={errTxt}>{errors.firstName.message}</span>}</div>
            <div><div style={fLabel}>Last Name *</div><input {...register("lastName",{required:"Required"})} placeholder="Last name" style={errors.lastName ? inpErr : inp} />{errors.lastName && <span style={errTxt}>{errors.lastName.message}</span>}</div>
            <div><div style={fLabel}>Date of Birth</div><input type="date" {...register("dateOfBirth")} style={inp} /></div>
            <div><div style={fLabel}>Phone *</div><input {...register("phone",{required:"Required"})} placeholder="9876543210" style={errors.phone ? inpErr : inp} />{errors.phone && <span style={errTxt}>{errors.phone.message}</span>}</div>
            <div><div style={fLabel}>Email</div><input type="email" {...register("email")} placeholder="email@example.com" style={inp} /></div>
            <div><div style={fLabel}>Gender</div><select {...register("gender")} style={inp}>{['Female','Male','Other'].map(o=><option key={o}>{o}</option>)}</select></div>
            <div><div style={fLabel}>Blood Group</div><select {...register("bloodGroup")} style={inp}>{BLOOD_GROUPS.map(o=><option key={o}>{o}</option>)}</select></div>
            <div><div style={fLabel}>Insurance</div><input {...register("insurance")} placeholder="Insurance provider" style={inp} /></div>
            <div style={{gridColumn:'1/-1'}}><div style={fLabel}>Address</div><input {...register("address")} placeholder="123 Hospital St..." style={inp} /></div>
          </div>
          <div style={{...secLabel,marginTop:20}}>Oncology Information</div>
          <div style={g3}>
            <div><div style={fLabel}>Cancer Type *</div><select {...register("cancerType",{required:"Required"})} style={inp}>{CANCER_TYPES.map(o=><option key={o}>{o}</option>)}</select></div>
            <div><div style={fLabel}>Stage *</div><select {...register("cancerStage",{required:"Required"})} style={inp}>{STAGES.map(o=><option key={o}>{o}</option>)}</select></div>
            <div><div style={fLabel}>Diagnosis Date *</div><input type="date" {...register("diagnosisDate",{required:"Required"})} style={errors.diagnosisDate ? inpErr : inp} />{errors.diagnosisDate && <span style={errTxt}>{errors.diagnosisDate.message}</span>}</div>
            <div><div style={fLabel}>Primary Oncologist</div><input {...register("primaryOncologist")} style={inp} /></div>
            <div><div style={fLabel}>Status</div><select {...register("status")} style={inp}>{['active','remission','palliative','discharged'].map(o=><option key={o}>{o}</option>)}</select></div>
          </div>
          <div style={{marginTop:20,display:'flex',gap:10}}>
            <button type="submit" disabled={saving} style={{background:saving?'#64748b':'#0F6E56',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:500,cursor:saving?'not-allowed':'pointer',boxShadow:isDark&&!saving?'0 0 10px rgba(99,102,241,0.35)':'none'}}>
              {saving ? 'Savingâ€¦' : 'Register Patient'}
            </button>
            <button type="button" onClick={()=>{setTab('list');reset();}} style={{background:isDark?'#2d3148':'#f4f6f8',color:textMuted,border:'none',borderRadius:8,padding:'10px 18px',fontSize:14,cursor:'pointer'}}>Cancel</button>
          </div>
        </form>
      )}

      {/* Patient List */}
      {tab === 'list' && (
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${cardBorder}`, display: 'grid', gridTemplateColumns: '120px 1fr 1fr 140px 100px 100px 80px', gap: 12, fontSize: 11, color: textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>MRN</span><span>Patient</span><span>Cancer Type</span><span>Stage</span><span>Oncologist</span><span>Status</span><span></span>
          </div>
          {patients === undefined && <div style={{ padding: 24, textAlign: 'center', color: textMuted, fontSize: 13 }}>Loadingâ€¦</div>}
          {patients && patients.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: textMuted, fontSize: 13 }}>
              <i className="ti ti-users" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
              No patients yet. Click "Register New Patient" to add one.
            </div>
          )}
          {patients && patients.map((p, i) => {
            const sc = STATUS_COLORS[p.status] || STATUS_COLORS.active;
            return (
              <div key={p._id} style={{ padding: '12px 16px', borderBottom: i < patients.length - 1 ? `0.5px solid ${rowBorder}` : 'none', display: 'grid', gridTemplateColumns: '120px 1fr 1fr 140px 100px 100px 80px', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, background: mrnBg, padding: '2px 6px', borderRadius: 4 }}>{p.mrn}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textMain }}>{p.firstName} {p.lastName}</div>
                  <div style={{ fontSize: 11, color: textMuted }}>{p.gender} Â· {p.phone}</div>
                </div>
                <div style={{ fontSize: 12, color: textSub }}>{p.cancerType}</div>
                <div style={{ fontSize: 12, color: textSub }}>{p.cancerStage}</div>
                <div style={{ fontSize: 12, color: textSub }}>{p.primaryOncologist}</div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: sc.bg, color: sc.color, display: 'inline-block' }}>{p.status}</span>
                <button onClick={() => removePatient({ id: p._id })} style={{ background: isDark ? 'rgba(248,113,113,0.15)' : '#FCEBEB', color: isDark ? '#f87171' : '#A32D2D', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
