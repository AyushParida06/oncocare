import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-ring-chart',
  standalone: true,
  template: `
    <div [style.position]="'relative'" [style.width.px]="size" [style.height.px]="size" [style.flexShrink]="'0'">
      <svg [attr.width]="size" [attr.height]="size" [style.transform]="'rotate(-90deg)'">
        <circle [attr.cx]="cx" [attr.cy]="cy" [attr.r]="r" fill="none"
                [attr.stroke]="isDark ? '#2d3148' : '#f1f5f9'" [attr.stroke-width]="thickness"/>
        @for (seg of computedSegs; track seg.label; let i = $index) {
          <circle [attr.cx]="cx" [attr.cy]="cy" [attr.r]="r" fill="none"
                  [attr.stroke]="seg.color" [attr.stroke-width]="thickness"
                  [attr.stroke-dasharray]="seg.dash + ' ' + (circ - seg.dash)"
                  [attr.stroke-dashoffset]="-seg.off"/>
        }
      </svg>
      <div [style.position]="'absolute'" [style.top]="'50%'" [style.left]="'50%'"
           [style.transform]="'translate(-50%,-50%)'" [style.textAlign]="'center'">
        <div [style.fontSize]="'20px'" [style.fontWeight]="'800'" [style.color]="isDark ? '#e2e8f0' : '#111'">{{ total }}</div>
        <div [style.fontSize]="'9px'" [style.color]="isDark ? '#64748b' : '#9ca3af'" [style.textTransform]="'uppercase'" [style.letterSpacing]="'.05em'">total</div>
      </div>
    </div>
  `
})
export class RingChartComponent {
  @Input() segments: { label: string; value: number; color: string }[] = [];
  @Input() total = 0;
  @Input() size = 130;
  @Input() thickness = 18;
  @Input() isDark = true;

  get r() { return (this.size - this.thickness * 2) / 2; }
  get cx() { return this.size / 2; }
  get cy() { return this.size / 2; }
  get circ() { return 2 * Math.PI * this.r; }

  get computedSegs() {
    let off = 0;
    return this.segments.map(s => {
      const dash = this.total > 0 ? Math.max(0, (s.value / this.total) * this.circ - 1.5) : 0;
      const res = { ...s, dash, off };
      off += this.total > 0 ? (s.value / this.total) * this.circ : 0;
      return res;
    });
  }
}

@Component({
  selector: 'app-heatmap-grid',
  standalone: true,
  template: `
    <div [style.overflowX]="'auto'">
      @if (!types.length) {
        <div [style.textAlign]="'center'" [style.padding]="'28px 0'" [style.color]="isDark ? '#3a4060' : '#d1d5db'" [style.fontSize]="'12px'">No data yet</div>
      } @else {
        <table [style.borderCollapse]="'separate'" [style.borderSpacing]="'4px'" [style.width]="'100%'" [style.fontSize]="'11px'">
          <thead><tr>
            <th [style.textAlign]="'left'" [style.color]="isDark ? '#64748b' : '#9ca3af'" [style.fontWeight]="'600'" [style.paddingBottom]="'6px'" [style.fontSize]="'10px'">TYPE \\ STAGE</th>
            @for (s of stages; track s) {
              <th [style.textAlign]="'center'" [style.color]="isDark ? '#64748b' : '#9ca3af'" [style.fontWeight]="'600'" [style.paddingBottom]="'6px'" [style.fontSize]="'10px'">{{ s }}</th>
            }
            <th [style.textAlign]="'center'" [style.color]="isDark ? '#64748b' : '#9ca3af'" [style.fontWeight]="'600'" [style.fontSize]="'10px'">TOTAL</th>
          </tr></thead>
          <tbody>
            @for (t of types; track t) {
              <tr>
                <td [style.color]="isDark ? '#cbd5e1' : '#475569'" [style.paddingRight]="'8px'" [style.fontWeight]="'500'" [style.fontSize]="'11px'" [style.maxWidth]="'100px'" [style.overflow]="'hidden'" [style.textOverflow]="'ellipsis'" [style.whiteSpace]="'nowrap'">{{ t }}</td>
                @for (st of stages; track st) {
                  <td [style.background]="cellColor(breakdown[t]?.[st] || 0)"
                      [style.color]="cellText(breakdown[t]?.[st] || 0)"
                      [style.textAlign]="'center'" [style.borderRadius]="'6px'"
                      [style.padding]="'7px 4px'" [style.fontWeight]="(breakdown[t]?.[st] || 0) ? '700' : '400'">
                    {{ (breakdown[t]?.[st] || 0) || '—' }}
                  </td>
                }
                <td [style.textAlign]="'center'" [style.fontWeight]="'700'" [style.color]="isDark ? '#818cf8' : '#6366f1'" [style.fontSize]="'12px'">{{ rowTotal(t) }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `
})
export class HeatmapGridComponent {
  @Input() breakdown: Record<string, Record<string, number>> = {};
  @Input() isDark = true;

  readonly stages = ['Stage I','Stage II','Stage III','Stage IV'];
  get types() { return Object.keys(this.breakdown || {}); }
  get max() {
    let m = 0;
    this.types.forEach(t => this.stages.forEach(s => { const c = this.breakdown[t]?.[s] || 0; if (c > m) m = c; }));
    return m;
  }
  rowTotal(t: string) { return this.stages.reduce((a, s) => a + (this.breakdown[t]?.[s] || 0), 0); }
  cellColor(n: number) {
    if (!n || !this.max) return this.isDark ? '#1e2030' : '#f8fafc';
    const i = n / this.max;
    if (i < .25) return this.isDark ? '#1e3a5f' : '#dbeafe';
    if (i < .5) return this.isDark ? '#1e4d9b' : '#93c5fd';
    if (i < .75) return this.isDark ? '#2563eb' : '#3b82f6';
    return this.isDark ? '#818cf8' : '#1d4ed8';
  }
  cellText(n: number) {
    return !n ? (this.isDark ? '#3a4060' : '#e2e8f0') : (n / this.max >= .5 ? '#fff' : (this.isDark ? '#c7d2fe' : '#1e3a5f'));
  }
}

@Component({
  selector: 'app-status-funnel',
  standalone: true,
  template: `
    <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.gap]="'12px'">
      @for (r of rows; track r.key; let i = $index) {
        <div>
          <div [style.display]="'flex'" [style.justifyContent]="'space-between'" [style.fontSize]="'11px'" [style.marginBottom]="'5px'">
            <span [style.color]="isDark ? '#cbd5e1' : '#475569'" [style.fontWeight]="'600'">{{ r.label }}</span>
            <span [style.color]="r.color" [style.fontWeight]="'700'">{{ statusCounts?.[r.key] || 0 }} <span [style.fontWeight]="'400'" [style.color]="isDark ? '#64748b' : '#9ca3af'">({{ pct(r.key) }}%)</span></span>
          </div>
          <div [style.background]="isDark ? '#2d3148' : '#f1f5f9'" [style.borderRadius]="'6px'" [style.height]="'9px'" [style.width]="(100 - i * 8) + '%'">
            <div [style.width]="pct(r.key) + '%'" [style.height]="'100%'" [style.background]="r.color" [style.borderRadius]="'6px'" [style.transition]="'width .7s ease'"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class StatusFunnelComponent {
  @Input() statusCounts: any = {};
  @Input() total = 0;
  @Input() isDark = true;
  readonly rows = [
    { label:'Active', key:'active', color:'#34d399' },
    { label:'Remission', key:'remission', color:'#60a5fa' },
    { label:'Palliative', key:'palliative', color:'#f59e0b' },
    { label:'Discharged', key:'discharged', color:'#94a3b8' },
  ];
  pct(key: string) { return this.total > 0 ? Math.round(((this.statusCounts?.[key] || 0) / this.total) * 100) : 0; }
}

@Component({
  selector: 'app-severity-bars',
  standalone: true,
  template: `
    <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.gap]="'12px'">
      @for (s of sevs; track s.key) {
        <div>
          <div [style.display]="'flex'" [style.justifyContent]="'space-between'" [style.fontSize]="'11px'" [style.marginBottom]="'4px'">
            <span [style.color]="isDark ? '#cbd5e1' : '#475569'" [style.fontWeight]="'600'" [style.textTransform]="'capitalize'">{{ s.key }}</span>
            <span [style.color]="s.color" [style.fontWeight]="'700'">{{ data?.bySeverity?.[s.key] || 0 }}</span>
          </div>
          <div [style.background]="isDark ? '#2d3148' : '#f1f5f9'" [style.borderRadius]="'6px'" [style.height]="'9px'">
            <div [style.width]="pct(s.key) + '%'" [style.height]="'100%'" [style.background]="s.color" [style.borderRadius]="'6px'" [style.transition]="'width .7s'"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class SeverityBarsComponent {
  @Input() data: any = {};
  @Input() isDark = true;
  readonly sevs = [
    { key:'critical', color:'#ef4444' }, { key:'high', color:'#f97316' },
    { key:'medium', color:'#f59e0b' },   { key:'low', color:'#22c55e' },
  ];
  get max() { return Math.max(...this.sevs.map(s => this.data?.bySeverity?.[s.key] || 0), 1); }
  pct(k: string) { return Math.round(((this.data?.bySeverity?.[k] || 0) / this.max) * 100); }
}

@Component({
  selector: 'app-claims-funnel',
  standalone: true,
  template: `
    <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.gap]="'10px'">
      @for (step of steps; track step; let i = $index) {
        <div>
          @if (i > 0) {
            <div [style.fontSize]="'10px'" [style.color]="isDark ? '#64748b' : '#9ca3af'" [style.marginBottom]="'4px'" [style.paddingLeft]="'4px'">
              ↓ {{ drop(i) }} drop from {{ steps[i-1] }}
            </div>
          }
          <div [style.background]="claimColors[step]" [style.borderRadius]="'8px'" [style.padding]="'10px 14px'" [style.width]="(100 - i * 12) + '%'" [style.transition]="'width .6s'">
            <div [style.display]="'flex'" [style.justifyContent]="'space-between'" [style.alignItems]="'center'">
              <span [style.fontSize]="'12px'" [style.fontWeight]="'700'" [style.color]="'#fff'" [style.textTransform]="'capitalize'">{{ step }}</span>
              <span [style.fontSize]="'16px'" [style.fontWeight]="'800'" [style.color]="'#fff'">{{ data?.counts?.[step] || 0 }} <span [style.fontSize]="'11px'" [style.fontWeight]="'400'">({{ pct(step) }}%)</span></span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ClaimsFunnelComponent {
  @Input() data: any = {};
  @Input() isDark = true;
  readonly steps = ['submitted','processing','approved'];
  readonly claimColors: Record<string, string> = { submitted:'#60a5fa', processing:'#fbbf24', approved:'#34d399' };
  get max() { return this.data?.counts?.submitted || 1; }
  pct(s: string) { return this.max > 0 ? Math.round(((this.data?.counts?.[s] || 0) / this.max) * 100) : 0; }
  drop(i: number) { return (this.data?.counts?.[this.steps[i-1]] || 0) - (this.data?.counts?.[this.steps[i]] || 0); }
}

@Component({
  selector: 'app-appointment-bars',
  standalone: true,
  template: `
    @if (!types.length) {
      <div [style.textAlign]="'center'" [style.padding]="'28px 0'" [style.color]="isDark ? '#3a4060' : '#d1d5db'" [style.fontSize]="'12px'">No data yet</div>
    } @else {
      <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.gap]="'10px'">
        @for (t of types; track t) {
          <div>
            <div [style.display]="'flex'" [style.justifyContent]="'space-between'" [style.fontSize]="'11px'" [style.marginBottom]="'4px'">
              <span [style.color]="isDark ? '#cbd5e1' : '#475569'" [style.fontWeight]="'600'" [style.textTransform]="'capitalize'">{{ t }}</span>
              <span [style.color]="isDark ? '#94a3b8' : '#9ca3af'" [style.fontWeight]="'500'">{{ rowTotal(t) }}</span>
            </div>
            <div [style.display]="'flex'" [style.height]="'8px'" [style.width]="barWidth(t)" [style.borderRadius]="'6px'" [style.overflow]="'hidden'" [style.background]="isDark ? '#2d3148' : '#f1f5f9'">
              @for (s of statuses; track s) {
                @if (data[t][s]) {
                  <div [style.flex]="data[t][s]" [style.background]="statusColors[s]"></div>
                }
              }
            </div>
          </div>
        }
      </div>
    }
  `
})
export class AppointmentBarsComponent {
  @Input() data: Record<string, Record<string, number>> = {};
  @Input() isDark = true;
  readonly statuses = ['scheduled','confirmed','completed','cancelled','no-show'];
  readonly statusColors: Record<string, string> = { scheduled:'#fbbf24', confirmed:'#34d399', completed:'#818cf8', cancelled:'#f87171', 'no-show':'#94a3b8' };
  get types() { return Object.keys(this.data || {}); }
  rowTotal(t: string) { return Object.values(this.data[t] || {}).reduce((a, b) => a + b, 0); }
  get globalMax() { return Math.max(...this.types.map(t => this.rowTotal(t)), 1); }
  barWidth(t: string) { return Math.round((this.rowTotal(t) / this.globalMax) * 100) + '%'; }
}

@Component({
  selector: 'app-patient-monitoring',
  standalone: true,
  template: `
    <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.gap]="'12px'">
      <!-- Header -->
      <div [style.display]="'flex'" [style.justifyContent]="'space-between'" [style.alignItems]="'center'">
        <div [style.display]="'flex'" [style.alignItems]="'center'" [style.gap]="'8px'">
          <div [style.fontSize]="'13px'" [style.fontWeight]="'700'" [style.color]="isDark ? '#e2e8f0' : '#111'">Live Telemetry</div>
          <div [style.display]="'flex'" [style.alignItems]="'center'" [style.gap]="'6px'" 
               [style.background]="'rgba(239, 68, 68, 0.1)'" [style.padding]="'3px 8px'" [style.borderRadius]="'12px'">
            <div class="pulse-dot" [style.width]="'6px'" [style.height]="'6px'" [style.background]="'#ef4444'" [style.borderRadius]="'50%'"></div>
            <span [style.fontSize]="'10px'" [style.fontWeight]="'700'" [style.color]="'#ef4444'" [style.letterSpacing]="'.05em'" [style.textTransform]="'uppercase'">Live</span>
          </div>
        </div>
        <div [style.fontSize]="'11px'" [style.color]="isDark ? '#94a3b8' : '#888'">Updating every 2s</div>
      </div>

      <!-- Grid of Patients -->
      <div [style.display]="'grid'" [style.gridTemplateColumns]="'repeat(4, 1fr)'" [style.gap]="'12px'">
        @for (p of patients; track p.id) {
          <div [style.background]="isDark ? '#1e2030' : '#fff'" 
               [style.border]="'1px solid ' + (isDark ? '#2d3148' : '#e5e7eb')" 
               [style.borderRadius]="'12px'" [style.padding]="'14px'"
               [style.display]="'flex'" [style.flexDirection]="'column'" [style.gap]="'12px'"
               [style.position]="'relative'" [style.overflow]="'hidden'">
            
            <!-- Very faint colored glow behind the card based on status -->
            <div [style.position]="'absolute'" [style.top]="'-20px'" [style.right]="'-20px'" 
                 [style.width]="'80px'" [style.height]="'80px'" [style.borderRadius]="'50%'"
                 [style.background]="p.status === 'Critical' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)'"
                 [style.filter]="'blur(20px)'" [style.zIndex]="'0'"></div>

            <!-- Patient Info -->
            <div [style.display]="'flex'" [style.justifyContent]="'space-between'" [style.alignItems]="'flex-start'" [style.zIndex]="'1'">
              <div>
                <div [style.fontSize]="'13px'" [style.fontWeight]="'700'" [style.color]="isDark ? '#e2e8f0' : '#111'">{{ p.name }}</div>
                <div [style.fontSize]="'10px'" [style.color]="isDark ? '#64748b' : '#9ca3af'">ID: {{ p.id }} • {{ p.ward }}</div>
              </div>
              <div [style.fontSize]="'9px'" [style.fontWeight]="'700'" [style.padding]="'2px 6px'" [style.borderRadius]="'4px'"
                   [style.background]="p.status === 'Critical' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'"
                   [style.color]="p.status === 'Critical' ? '#ef4444' : '#22c55e'" [style.textTransform]="'uppercase'">
                {{ p.status }}
              </div>
            </div>

            <!-- Vitals Grid -->
            <div [style.display]="'grid'" [style.gridTemplateColumns]="'repeat(3, 1fr)'" [style.gap]="'12px'" [style.zIndex]="'1'" [style.alignItems]="'end'">
              <!-- HR Graph -->
              <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.justifyContent]="'flex-end'">
                <div [style.display]="'flex'" [style.justifyContent]="'flex-start'" [style.alignItems]="'baseline'" [style.gap]="'6px'" [style.marginBottom]="'2px'">
                  <div [style.fontSize]="'10px'" [style.color]="isDark ? '#64748b' : '#9ca3af'">HR</div>
                  <div [style.fontSize]="'16px'" [style.fontWeight]="'800'" [style.fontFamily]="'monospace'"
                       [style.color]="p.hr > 100 ? '#ef4444' : (isDark ? '#38bdf8' : '#0ea5e9')"
                       [style.transition]="'color 0.3s'">{{ p.hr }}</div>
                </div>
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" 
                     [style.width]="'90%'" [style.height]="'14px'" [style.display]="'block'" [style.overflow]="'hidden'">
                  <!-- Live Sparkline -->
                  <polyline fill="none" [attr.stroke]="p.hr > 100 ? '#ef4444' : (isDark ? '#38bdf8' : '#0ea5e9')" 
                            stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"
                            [attr.points]="getSvgPoints(p.hr)"
                            [style.transition]="'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'"></polyline>
                </svg>
              </div>
              <!-- SpO2 -->
              <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.justifyContent]="'flex-end'" [style.paddingBottom]="'4px'">
                <div [style.fontSize]="'10px'" [style.color]="isDark ? '#64748b' : '#9ca3af'" [style.marginBottom]="'2px'">SpO2 (%)</div>
                <div [style.fontSize]="'18px'" [style.fontWeight]="'800'" [style.fontFamily]="'monospace'"
                     [style.color]="p.spo2 < 95 ? '#f59e0b' : (isDark ? '#34d399' : '#10b981')"
                     [style.transition]="'color 0.3s'">{{ p.spo2 }}</div>
              </div>
              <!-- BP -->
              <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.justifyContent]="'flex-end'" [style.paddingBottom]="'4px'">
                <div [style.fontSize]="'10px'" [style.color]="isDark ? '#64748b' : '#9ca3af'" [style.marginBottom]="'2px'">BP (mmHg)</div>
                <div [style.fontSize]="'14px'" [style.fontWeight]="'800'" [style.fontFamily]="'monospace'"
                     [style.color]="isDark ? '#c084fc' : '#9333ea'" [style.marginTop]="'4px'"
                     [style.transition]="'color 0.3s'">{{ p.bpSys }}/{{ p.bpDia }}</div>
              </div>
            </div>

          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse-dot {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .pulse-dot { animation: pulse-dot 2s infinite; }
  `]
})
export class PatientMonitoringComponent implements OnInit, OnDestroy {
  @Input() isDark = true;
  
  patients: any[] = [
    { id: '1042', name: 'Eleanor R.', ward: 'ICU-A', status: 'Stable', hr: 72, spo2: 98, bpSys: 120, bpDia: 80, baseHr: 72, baseSpo2: 98, baseBpSys: 120, baseBpDia: 80 },
    { id: '8921', name: 'Marcus T.', ward: 'Chemo-1', status: 'Critical', hr: 105, spo2: 93, bpSys: 145, bpDia: 90, baseHr: 105, baseSpo2: 93, baseBpSys: 145, baseBpDia: 90 },
    { id: '3314', name: 'Sarah W.', ward: 'ICU-B', status: 'Stable', hr: 68, spo2: 99, bpSys: 115, bpDia: 75, baseHr: 68, baseSpo2: 99, baseBpSys: 115, baseBpDia: 75 },
    { id: '5590', name: 'David L.', ward: 'Chemo-2', status: 'Stable', hr: 85, spo2: 97, bpSys: 130, bpDia: 85, baseHr: 85, baseSpo2: 97, baseBpSys: 130, baseBpDia: 85 }
  ];

  private intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.patients = this.patients.map(p => {
        const hrOffset = Math.floor(Math.random() * 5) - 2;
        const spo2Offset = Math.floor(Math.random() * 3) - 1;
        const sysOffset = Math.floor(Math.random() * 5) - 2;
        
        const newHr = Math.max(40, Math.min(180, p.baseHr + hrOffset));
        
        return {
          ...p,
          hr: newHr,
          spo2: Math.max(80, Math.min(100, p.baseSpo2 + spo2Offset)),
          bpSys: Math.max(80, Math.min(200, p.baseBpSys + sysOffset))
        };
      });
    }, 2000);
  }

  getSvgPoints(hr: number): string {
    const points: string[] = [];
    const beatsInView = hr / 25; 
    const L = 100 / beatsInView;
    const MAX_BEATS = 10;
    
    for (let i = 0; i < MAX_BEATS; i++) {
      const startX = i * L;
      const p = (pct: number, y: number) => {
        const px = startX + L * pct;
        points.push(px.toFixed(1) + ',' + y.toFixed(1));
      };

      p(0, 14);
      p(0.3, 14);
      p(0.35, 12); 
      p(0.4, 14);
      p(0.45, 14);
      p(0.48, 16); 
      p(0.5, 2);   
      p(0.53, 18); 
      p(0.56, 14);
      p(0.65, 14);
      p(0.75, 11); 
      p(0.85, 14);
      p(1, 14);
    }
    return points.join(' ');
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
 
