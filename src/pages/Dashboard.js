import React from 'react';
import { useQuery } from 'convex/react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../convex/_generated/api';
import useCountUp from '../hooks/useCountUp';
import {
  Card, RingChart, HeatmapGrid, StatusFunnel,
  AppointmentBars, SeverityBars, ClaimsFunnel
} from './DashboardPanels';

function AnimatedValue({ value, color, glow }) {
  const n = useCountUp(Number(value), 1400);
  return <span style={{ color, ...glow }}>{n}</span>;
}

const CHEMO_COLORS = {
  completed:'#34d399','in-progress':'#60a5fa',
  scheduled:'#fbbf24',delayed:'#f87171',skipped:'#94a3b8'
};

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const patientStats  = useQuery(api.patients.stats, {});
  const chemoCount    = useQuery(api.chemoSessions.todayCount, {});
  const apptCount     = useQuery(api.appointments.todayCount, {});
  const inpatients    = useQuery(api.clinical.activeAdmissionsCount, {});
  const stageData     = useQuery(api.patients.stageBreakdown, {});
  const apptTypes     = useQuery(api.appointments.typeSummary, {});
  const chemoStatus   = useQuery(api.chemoSessions.statusSummary, {});
  const billing       = useQuery(api.billing.summary, {});
  const qualityData   = useQuery(api.quality.severitySummary, {});
  const claimsData    = useQuery(api.revenue.claimsSummary, {});

  const t = {
    bg:    isDark ? '#12141f' : '#f0f2f8',
    card:  isDark ? '#1e2030' : '#fff',
    muted: isDark ? '#64748b' : '#9ca3af',
    text:  isDark ? '#e2e8f0' : '#111',
  };

  const kpis = [
    { label:'Total Patients',       value:patientStats?.total     ??'—', icon:'ti-users',          color:'#818cf8', glow:'129,140,248' },
    { label:'Active Patients',      value:patientStats?.active    ??'—', icon:'ti-heart-pulse',    color:'#34d399', glow:'52,211,153'  },
    { label:'Chemo Today',          value:chemoCount?.total       ??'—', icon:'ti-pill',           color:'#f87171', glow:'248,113,113' },
    { label:'Appointments Today',   value:apptCount?.total        ??'—', icon:'ti-calendar-event', color:'#60a5fa', glow:'96,165,250'  },
    { label:'Inpatients',           value:inpatients              ??'—', icon:'ti-bed',            color:'#fbbf24', glow:'251,191,36'  },
    { label:'In Remission',         value:patientStats?.remission ??'—', icon:'ti-rosette',        color:'#a78bfa', glow:'167,139,250' },
  ];

  const chemoTotal = Object.values(chemoStatus||{}).reduce((a,b)=>a+b,0);
  const chemoSegs  = Object.entries(chemoStatus||{})
    .filter(([,v])=>v>0)
    .map(([k,v])=>({label:k,value:v,color:CHEMO_COLORS[k]||'#94a3b8'}));

  const today = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:t.text,letterSpacing:'-.01em'}}>Clinical Analytics</div>
          <div style={{fontSize:12,color:t.muted,marginTop:2}}>{today}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 14px',background:isDark?'#1e2030':'#fff',border:`1px solid ${isDark?'#2d3148':'#e5e7eb'}`,borderRadius:10}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#34d399',boxShadow:'0 0 6px #34d39988'}}/>
          <span style={{fontSize:12,color:t.muted,fontWeight:500}}>Live data</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10}}>
        {kpis.map(k=>{
          const isLoad=patientStats===undefined;
          const glow=isDark?{textShadow:`0 0 12px rgba(${k.glow},.9),0 0 24px rgba(${k.glow},.4)`}:{};
          return (
            <div key={k.label} style={{
              background:isDark?'#1e2030':'#fff',
              border:`1px solid ${isDark?'#2d3148':'#e5e7eb'}`,
              borderRadius:12,padding:'14px 16px',
              boxShadow:isDark?`0 0 20px rgba(${k.glow},.08)`:'0 1px 6px rgba(0,0,0,.06)',
              borderTop:`3px solid ${k.color}`,
            }}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{width:30,height:30,borderRadius:8,background:isDark?`rgba(${k.glow},.15)`:`${k.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:k.color}}>
                  <i className={`ti ${k.icon}`}/>
                </div>
                <div style={{fontSize:10,color:t.muted,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',lineHeight:1.2}}>{k.label}</div>
              </div>
              <div style={{fontSize:24,fontWeight:800}}>
                {isLoad?<span style={{fontSize:14,color:'#555'}}>…</span>
                  :<AnimatedValue value={k.value} color={k.color} glow={glow}/>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Heatmap + Status Funnel */}
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:16}}>
        <Card title="Cancer Stage Heatmap" sub="Patient distribution · type × stage · color = density" action="View all" isDark={isDark}>
          <HeatmapGrid breakdown={stageData?.byTypeStage||{}} isDark={isDark}/>
        </Card>
        <Card title="Patient Status Pipeline" sub="Workflow cascade · active → discharged" isDark={isDark}>
          <StatusFunnel statusCounts={stageData?.statusCounts} total={patientStats?.total||0} isDark={isDark}/>
        </Card>
      </div>

      {/* Row 3: Appointment Mix + Chemo Donut */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card title="Appointment Type Mix" sub="All appointments · stacked by status" isDark={isDark}>
          <AppointmentBars data={apptTypes} isDark={isDark}/>
        </Card>
        <Card title="Chemo Session Status" sub="All sessions · distribution by state" isDark={isDark}>
          <div style={{display:'flex',gap:20,alignItems:'center'}}>
            <RingChart segments={chemoSegs} total={chemoTotal} isDark={isDark}/>
            <div style={{display:'flex',flexDirection:'column',gap:8,flex:1}}>
              {chemoSegs.map(s=>(
                <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <div style={{width:9,height:9,borderRadius:3,background:s.color,boxShadow:isDark?`0 0 5px ${s.color}99`:'none'}}/>
                    <span style={{fontSize:12,color:isDark?'#cbd5e1':'#475569',textTransform:'capitalize',fontWeight:500}}>{s.label}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:s.color}}>{s.value}</span>
                </div>
              ))}
              {chemoSegs.length===0&&<div style={{fontSize:12,color:t.muted}}>No sessions yet</div>}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 4: Billing Summary */}
      <Card title="Billing Overview" sub="Patient invoices · payment status breakdown" action="View billing" isDark={isDark}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {label:'Total Billed',val:billing?.totalBilled||0,color:'#818cf8',icon:'ti-receipt'},
            {label:'Total Paid',   val:billing?.totalPaid||0,  color:'#34d399',icon:'ti-circle-check'},
            {label:'Pending',      val:billing?.totalPending||0,color:'#f87171',icon:'ti-clock'},
          ].map(b=>(
            <div key={b.label} style={{padding:'14px 16px',background:isDark?'#16182a':'#f8fafc',borderRadius:10,border:`1px solid ${isDark?'#2d3148':'#e5e7eb'}`}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8}}>
                <i className={`ti ${b.icon}`} style={{color:b.color,fontSize:15}}/>
                <span style={{fontSize:11,color:t.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'.04em'}}>{b.label}</span>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:b.color}}>₹{(b.val/1000).toFixed(1)}K</div>
              <div style={{fontSize:10,color:t.muted,marginTop:2}}>{billing?.total||0} invoice{billing?.total!==1?'s':''}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:11,color:t.muted,marginBottom:6,fontWeight:600}}>PAYMENT MIX</div>
          <div style={{display:'flex',height:10,borderRadius:6,overflow:'hidden',background:isDark?'#2d3148':'#f1f5f9'}}>
            {billing?.totalBilled>0&&[
              {v:billing.totalPaid,c:'#34d399'},
              {v:billing.totalPending,c:'#f87171'},
            ].map((s,i)=>(
              <div key={i} style={{flex:s.v,background:s.c,transition:'flex .6s'}}/>
            ))}
          </div>
          <div style={{display:'flex',gap:16,marginTop:6}}>
            {[{c:'#34d399',l:'Paid'},{c:'#f87171',l:'Pending'}].map(x=>(
              <div key={x.l} style={{display:'flex',alignItems:'center',gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:x.c}}/>
                <span style={{fontSize:10,color:t.muted}}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Row 5: Quality + Claims */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card title="Quality Incidents" sub="Severity breakdown · resolution status" isDark={isDark}>
          <SeverityBars data={qualityData} isDark={isDark}/>
        </Card>
        <Card title="Insurance Claims Funnel" sub="Workflow taper · resolution tracked separately" isDark={isDark}>
          <ClaimsFunnel data={claimsData} isDark={isDark}/>
        </Card>
      </div>

    </div>
  );
}
