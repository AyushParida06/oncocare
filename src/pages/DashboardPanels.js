import React from 'react';

const STAGES = ['Stage I','Stage II','Stage III','Stage IV'];


const SEV_COLORS = { critical:'#ef4444',high:'#f97316',medium:'#f59e0b',low:'#22c55e' };
const CLAIM_COLORS = { submitted:'#60a5fa',processing:'#fbbf24',approved:'#34d399',rejected:'#f87171' };

export function Card({ title, sub, action, children, isDark, style={}}) {
  return (
    <div style={{
      background: isDark?'#1e2030':'#fff',
      border:`1px solid ${isDark?'#2d3148':'#e5e7eb'}`,
      borderRadius:14, padding:'18px 20px',
      boxShadow: isDark?'0 4px 24px rgba(0,0,0,0.5)':'0 1px 8px rgba(0,0,0,0.07)',
      display:'flex',flexDirection:'column',gap:14,
      transition:'all .3s', ...style
    }}>
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:isDark?'#e2e8f0':'#111',letterSpacing:'.01em'}}>{title}</div>
          {sub&&<div style={{fontSize:11,color:isDark?'#64748b':'#9ca3af',marginTop:2}}>{sub}</div>}
        </div>
        {action&&<span style={{fontSize:11,color:'#6366f1',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>{action} →</span>}
      </div>
      {children}
    </div>
  );
}

export function RingChart({ segments, total, size=130, thickness=18, isDark }) {
  const r=(size-thickness*2)/2, cx=size/2, cy=size/2;
  const circ=2*Math.PI*r;
  let off=0;
  const segs=segments.map(s=>{
    const dash=total>0?(s.value/total)*circ-1.5:0;
    const res={...s,dash:Math.max(0,dash),off};
    off+=total>0?(s.value/total)*circ:0;
    return res;
  });
  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={isDark?'#2d3148':'#f1f5f9'} strokeWidth={thickness}/>
        {segs.map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.dash} ${circ-s.dash}`}
            strokeDashoffset={-s.off}
            style={{transition:'all .6s'}}/>
        ))}
      </svg>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
        <div style={{fontSize:20,fontWeight:800,color:isDark?'#e2e8f0':'#111'}}>{total}</div>
        <div style={{fontSize:9,color:isDark?'#64748b':'#9ca3af',textTransform:'uppercase',letterSpacing:'.05em'}}>total</div>
      </div>
    </div>
  );
}

export function HeatmapGrid({ breakdown, isDark }) {
  const types=Object.keys(breakdown||{});
  if(!types.length) return <Empty isDark={isDark}/>;
  let max=0;
  types.forEach(t=>STAGES.forEach(s=>{const c=breakdown[t]?.[s]||0;if(c>max)max=c;}));
  const cell=(n)=>{
    if(!n||!max) return isDark?'#1e2030':'#f8fafc';
    const i=n/max;
    if(i<.25) return isDark?'#1e3a5f':'#dbeafe';
    if(i<.5)  return isDark?'#1e4d9b':'#93c5fd';
    if(i<.75) return isDark?'#2563eb':'#3b82f6';
    return isDark?'#818cf8':'#1d4ed8';
  };
  const txt=(n)=>!n?isDark?'#3a4060':'#e2e8f0':n/max>=.5?'#fff':isDark?'#c7d2fe':'#1e3a5f';
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{borderCollapse:'separate',borderSpacing:4,width:'100%',fontSize:11}}>
        <thead>
          <tr>
            <th style={{textAlign:'left',color:isDark?'#64748b':'#9ca3af',fontWeight:600,paddingBottom:6,fontSize:10}}>TYPE \ STAGE</th>
            {STAGES.map(s=><th key={s} style={{textAlign:'center',color:isDark?'#64748b':'#9ca3af',fontWeight:600,paddingBottom:6,fontSize:10}}>{s}</th>)}
            <th style={{textAlign:'center',color:isDark?'#64748b':'#9ca3af',fontWeight:600,fontSize:10}}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {types.map(t=>{
            const row=STAGES.reduce((s,st)=>s+(breakdown[t]?.[st]||0),0);
            return (
              <tr key={t}>
                <td style={{color:isDark?'#cbd5e1':'#475569',paddingRight:8,fontWeight:500,fontSize:11,whiteSpace:'nowrap',maxWidth:100,overflow:'hidden',textOverflow:'ellipsis'}}>{t}</td>
                {STAGES.map(st=>{
                  const n=breakdown[t]?.[st]||0;
                  return <td key={st} style={{background:cell(n),color:txt(n),textAlign:'center',borderRadius:6,padding:'7px 4px',fontWeight:n?700:400,transition:'background .3s'}}>{n||'—'}</td>;
                })}
                <td style={{textAlign:'center',fontWeight:700,color:isDark?'#818cf8':'#6366f1',fontSize:12}}>{row}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{display:'flex',alignItems:'center',gap:5,marginTop:10,justifyContent:'flex-end'}}>
        <span style={{fontSize:10,color:isDark?'#64748b':'#9ca3af'}}>Low</span>
        {(isDark?['#1e3a5f','#1e4d9b','#2563eb','#818cf8']:['#dbeafe','#93c5fd','#3b82f6','#1d4ed8']).map((c,i)=>(
          <div key={i} style={{width:14,height:8,borderRadius:3,background:c}}/>
        ))}
        <span style={{fontSize:10,color:isDark?'#64748b':'#9ca3af'}}>High</span>
      </div>
    </div>
  );
}

export function StatusFunnel({ statusCounts, total, isDark }) {
  const rows=[
    {label:'Active',key:'active',color:'#34d399'},
    {label:'Remission',key:'remission',color:'#60a5fa'},
    {label:'Palliative',key:'palliative',color:'#f59e0b'},
    {label:'Discharged',key:'discharged',color:'#94a3b8'},
  ];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {rows.map((r,i)=>{
        const n=statusCounts?.[r.key]||0;
        const pct=total>0?Math.round((n/total)*100):0;
        return (
          <div key={r.key}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:5}}>
              <span style={{color:isDark?'#cbd5e1':'#475569',fontWeight:600}}>{r.label}</span>
              <span style={{color:r.color,fontWeight:700}}>{n} <span style={{fontWeight:400,color:isDark?'#64748b':'#9ca3af'}}>({pct}%)</span></span>
            </div>
            <div style={{background:isDark?'#2d3148':'#f1f5f9',borderRadius:6,height:9,width:`${100-i*8}%`}}>
              <div style={{width:`${pct}%`,height:'100%',background:r.color,borderRadius:6,boxShadow:isDark?`0 0 8px ${r.color}99`:'none',transition:'width .7s ease'}}/>
            </div>
          </div>
        );
      })}
      <div style={{marginTop:4,padding:'10px 14px',background:isDark?'#16182a':'#f8fafc',borderRadius:8,borderLeft:'3px solid #6366f1'}}>
        <div style={{fontSize:10,color:isDark?'#64748b':'#9ca3af',marginBottom:4,fontWeight:600,letterSpacing:'.04em'}}>STEP-THROUGH ANALYSIS</div>
        {[
          {from:'Active',to:'Remission',n:statusCounts?.remission||0,d:statusCounts?.active||1},
          {from:'Remission',to:'Palliative',n:statusCounts?.palliative||0,d:statusCounts?.remission||1},
        ].map((x,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:11,padding:'2px 0',color:isDark?'#94a3b8':'#6b7280'}}>
            <span>{x.from} → {x.to}</span>
            <span style={{color:'#34d399',fontWeight:700}}>{x.d>0?Math.round((x.n/x.d)*100):0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppointmentBars({ data, isDark }) {
  if(!data||!Object.keys(data).length) return <Empty isDark={isDark}/>;
  const types=Object.keys(data);
  const max=Math.max(...types.map(t=>Object.values(data[t]).reduce((a,b)=>a+b,0)));
  const statuses=['scheduled','confirmed','completed','cancelled','no-show'];
  const sCols={scheduled:'#fbbf24',confirmed:'#34d399',completed:'#818cf8',cancelled:'#f87171','no-show':'#94a3b8'};
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {types.map(t=>{
        const total=Object.values(data[t]).reduce((a,b)=>a+b,0);
        const pct=max>0?(total/max)*100:0;
        return (
          <div key={t}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
              <span style={{color:isDark?'#cbd5e1':'#475569',fontWeight:600,textTransform:'capitalize'}}>{t}</span>
              <span style={{color:isDark?'#94a3b8':'#9ca3af',fontWeight:500}}>{total}</span>
            </div>
            <div style={{display:'flex',height:8,width:`${pct}%`,borderRadius:6,overflow:'hidden',background:isDark?'#2d3148':'#f1f5f9'}}>
              {statuses.map(s=>data[t][s]?(
                <div key={s} style={{flex:data[t][s],background:sCols[s],transition:'flex .6s'}}/>
              ):null)}
            </div>
          </div>
        );
      })}
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px 14px',marginTop:4}}>
        {Object.entries(sCols).map(([s,c])=>(
          <div key={s} style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:8,height:8,borderRadius:2,background:c}}/>
            <span style={{fontSize:10,color:isDark?'#64748b':'#9ca3af',textTransform:'capitalize'}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SeverityBars({ data, isDark }) {
  const sev=['critical','high','medium','low'];
  const max=Math.max(...sev.map(s=>data?.bySeverity?.[s]||0),1);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {sev.map(s=>{
        const n=data?.bySeverity?.[s]||0;
        const pct=max>0?Math.round((n/max)*100):0;
        return (
          <div key={s}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
              <span style={{color:isDark?'#cbd5e1':'#475569',fontWeight:600,textTransform:'capitalize'}}>{s}</span>
              <span style={{color:SEV_COLORS[s],fontWeight:700}}>{n}</span>
            </div>
            <div style={{background:isDark?'#2d3148':'#f1f5f9',borderRadius:6,height:9}}>
              <div style={{width:`${pct}%`,height:'100%',background:SEV_COLORS[s],borderRadius:6,boxShadow:isDark?`0 0 6px ${SEV_COLORS[s]}88`:'none',transition:'width .7s'}}/>
            </div>
          </div>
        );
      })}
      <div style={{display:'flex',gap:8,marginTop:4}}>
        {['open','investigating','resolved'].map(s=>(
          <div key={s} style={{flex:1,padding:'8px 10px',background:isDark?'#16182a':'#f8fafc',borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:16,fontWeight:700,color:s==='resolved'?'#34d399':s==='open'?'#f87171':'#fbbf24'}}>{data?.byStatus?.[s]||0}</div>
            <div style={{fontSize:10,color:isDark?'#64748b':'#9ca3af',marginTop:2,textTransform:'capitalize'}}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClaimsFunnel({ data, isDark }) {
  const steps=['submitted','processing','approved'];
  const max=data?.counts?.submitted||1;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {steps.map((s,i)=>{
        const n=data?.counts?.[s]||0;
        const pct=max>0?Math.round((n/max)*100):0;
        const drop=i>0?Math.round(((data?.counts?.[steps[i-1]]||0)-n)):null;
        return (
          <div key={s}>
            {i>0&&<div style={{fontSize:10,color:isDark?'#64748b':'#9ca3af',marginBottom:4,paddingLeft:4}}>↓ {drop} drop from {steps[i-1]}</div>}
            <div style={{background:CLAIM_COLORS[s],borderRadius:8,padding:'10px 14px',width:`${100-i*12}%`,transition:'width .6s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12,fontWeight:700,color:'#fff',textTransform:'capitalize'}}>{s}</span>
                <span style={{fontSize:16,fontWeight:800,color:'#fff'}}>{n} <span style={{fontSize:11,fontWeight:400}}>({pct}%)</span></span>
              </div>
            </div>
          </div>
        );
      })}
      {data?.counts?.rejected>0&&(
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,padding:'8px 12px',background:isDark?'#2d1515':'#fef2f2',borderRadius:8}}>
          <i className="ti ti-alert-triangle" style={{color:'#ef4444'}}/>
          <span style={{fontSize:12,color:'#ef4444',fontWeight:600}}>{data.counts.rejected} rejected claims</span>
        </div>
      )}
      <div style={{marginTop:4,padding:'10px 14px',background:isDark?'#16182a':'#f8fafc',borderRadius:8}}>
        <div style={{fontSize:10,color:isDark?'#64748b':'#9ca3af',marginBottom:6,fontWeight:600}}>CLAIM AMOUNTS</div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
          <span style={{color:isDark?'#94a3b8':'#6b7280'}}>Total submitted</span>
          <span style={{color:isDark?'#e2e8f0':'#111',fontWeight:700}}>₹{((data?.totalAmount||0)/1000).toFixed(0)}K</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginTop:4}}>
          <span style={{color:isDark?'#94a3b8':'#6b7280'}}>Approved</span>
          <span style={{color:'#34d399',fontWeight:700}}>₹{((data?.approvedAmount||0)/1000).toFixed(0)}K</span>
        </div>
      </div>
    </div>
  );
}

function Empty({ isDark }) {
  return <div style={{textAlign:'center',padding:'28px 0',color:isDark?'#3a4060':'#d1d5db',fontSize:12}}>No data yet</div>;
}
