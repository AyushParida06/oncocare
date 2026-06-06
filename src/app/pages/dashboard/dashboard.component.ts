import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConvexClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexService } from '../../services/convex.service';
import {
  RingChartComponent, HeatmapGridComponent, StatusFunnelComponent,
  SeverityBarsComponent, ClaimsFunnelComponent, AppointmentBarsComponent, PatientMonitoringComponent
} from './panels/dashboard-panels.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RingChartComponent, HeatmapGridComponent, StatusFunnelComponent,
            SeverityBarsComponent, ClaimsFunnelComponent, AppointmentBarsComponent, PatientMonitoringComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LanguageService);
  readonly router = inject(Router);
  private readonly convexSvc = inject(ConvexService);
  private client!: ConvexClient;

  // Reactive data signals
  patientStats = signal<any>(undefined);
  chemoCount   = signal<any>(undefined);
  apptCount    = signal<any>(undefined);
  inpatients   = signal<any>(undefined);
  stageData    = signal<any>(undefined);
  apptTypes    = signal<any>(undefined);
  chemoStatus  = signal<any>(undefined);
  billing      = signal<any>(undefined);
  qualityData  = signal<any>(undefined);
  claimsData   = signal<any>(undefined);
  todayAppts   = signal<any[]>([]);

  private _unsubs: (() => void)[] = [];

  get isDark() { return this.themeService.isDark(); }
  get t() { return (k: string) => this.langService.t(k); }

  readonly today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  readonly todayStr = new Date().toISOString().split('T')[0];

  readonly CHEMO_COLORS: Record<string, string> = {
    completed:'#34d399', 'in-progress':'#60a5fa', scheduled:'#fbbf24', delayed:'#f87171', skipped:'#94a3b8'
  };

  get kpis() {
    const d = this.isDark;
    return [
      { label:'Total Patients',     value: this.patientStats()?.total     ?? '—', icon:'ti-users',          color:'#818cf8', glow:'129,140,248' },
      { label:'Active Patients',    value: this.patientStats()?.active    ?? '—', icon:'ti-heart-pulse',    color:'#34d399', glow:'52,211,153' },
      { label:'Chemo Today',        value: this.chemoCount()?.total       ?? '—', icon:'ti-pill',           color:'#f87171', glow:'248,113,113' },
      { label:'Appointments Today', value: this.apptCount()?.total        ?? '—', icon:'ti-calendar-event', color:'#60a5fa', glow:'96,165,250' },
      { label:'Inpatients',         value: this.inpatients()              ?? '—', icon:'ti-bed',            color:'#fbbf24', glow:'251,191,36' },
      { label:'In Remission',       value: this.patientStats()?.remission ?? '—', icon:'ti-rosette',        color:'#a78bfa', glow:'167,139,250' },
    ];
  }

  get modules() {
    const l = this.langService;
    return [
      { path:'/outpatient',        icon:'ti-stethoscope', label:l.t('mod_outpatient'),      color:'#E1F5EE', iconColor:'#0F6E56' },
      { path:'/inpatient',         icon:'ti-bed',         label:l.t('mod_inpatient'),       color:'#EAF3DE', iconColor:'#3B6D11' },
      { path:'/nursing',           icon:'ti-user',        label:l.t('mod_nursing'),         color:'#E1F5EE', iconColor:'#0F6E56' },
      { path:'/clinical-pharmacy', icon:'ti-pill',        label:l.t('mod_clinical_pharm'),  color:'#FAEEDA', iconColor:'#854F0B' },
      { path:'/tumor-board',       icon:'ti-users',       label:l.t('mod_tumor_board'),     color:'#EEEDFE', iconColor:'#534AB7' },
      { path:'/clinical-quality',  icon:'ti-chart-bar',   label:l.t('mod_quality'),         color:'#E6F1FB', iconColor:'#185FA5' },
      { path:'/lis',               icon:'ti-microscope',  label:l.t('mod_lis'),             color:'#FBEAF0', iconColor:'#993556' },
      { path:'/ris',               icon:'ti-camera',      label:l.t('mod_ris'),             color:'#EAF3DE', iconColor:'#3B6D11' },
      { path:'/pharmacy-mgmt',     icon:'ti-package',     label:l.t('mod_pharmacy'),        color:'#E1F5EE', iconColor:'#0F6E56' },
      { path:'/patient-billing',   icon:'ti-receipt',     label:l.t('mod_patient_billing'), color:'#FCEBEB', iconColor:'#A32D2D' },
      { path:'/revenue-cycle',     icon:'ti-chart-pie',   label:l.t('mod_revenue_cycle'),   color:'#FAEEDA', iconColor:'#854F0B' },
    ];
  }

  get chemoSegs() {
    const cs = this.chemoStatus() || {};
    return Object.entries(cs).filter(([,v]: any) => v > 0)
      .map(([k,v]: any) => ({ label:k, value:v, color: this.CHEMO_COLORS[k] || '#94a3b8' }));
  }
  get chemoTotal() { return this.chemoSegs.reduce((a, s) => a + s.value, 0); }

  get billingData() { return this.billing() || {}; }

  ngOnInit(): void {
    this.client = this.convexSvc.client;
    const today = this.todayStr;

    const sub = <T>(query: any, args: any, sig: ReturnType<typeof signal<T>>) => {
      return this.client.onUpdate(query, args, (v: T) => sig.set(v));
    };

    this._unsubs = [
      sub(api.patients.stats, {}, this.patientStats),
      sub(api.chemoSessions.todayCount, {}, this.chemoCount),
      sub(api.appointments.todayCount, {}, this.apptCount),
      sub(api.clinical.activeAdmissionsCount, {}, this.inpatients),
      sub(api.patients.stageBreakdown, {}, this.stageData),
      sub(api.appointments.typeSummary, {}, this.apptTypes),
      sub(api.chemoSessions.statusSummary, {}, this.chemoStatus),
      sub(api.billing.summary, {}, this.billing),
      sub(api.quality.severitySummary, {}, this.qualityData),
      sub(api.revenue.claimsSummary, {}, this.claimsData),
      sub(api.appointments.list, { date: today }, this.todayAppts),
    ];
  }

  ngOnDestroy(): void {
    this._unsubs.forEach(u => u());
  }

  navigate(path: string) { this.router.navigate([path]); }
}
