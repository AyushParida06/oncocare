import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexPageBase } from '../../shared/convex-page-base';

@Component({
  selector: 'app-nursing',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './nursing.component.html',
})
export class NursingComponent extends ConvexPageBase implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService  = inject(LanguageService);

  patients    = signal<any[]>([]);
  vitals      = signal<any[]>([]);
  carePlans   = signal<any[]>([]);
  showVitalsModal    = signal(false);
  showCarePlanModal  = signal(false);

  vitalsForm = signal({ patientId:'', bp:'', pulse:'', temp:'', spo2:'', pain:'' });
  carePlanForm = signal({ patientId:'', goal:'', interventions:'', evaluationDate:'' });

  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);

  ngOnInit() {
    this.sub(api.patients.list, {}, (v: any) => this.patients.set(v ?? []));
    this.sub(api.nursing.getVitals, {}, (v: any) => this.vitals.set(v ?? []));
    this.sub(api.nursing.getCarePlans, {}, (v: any) => this.carePlans.set(v ?? []));
  }
  ngOnDestroy() { this.cleanup(); }

  getPatientName(id: string) {
    const p = this.patients().find((x: any) => x._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }

  async saveVitals() {
    const f = this.vitalsForm();
    if (!f.patientId) return;
    await this.mutate(api.nursing.addVitals, { patientId: f.patientId, bloodPressure: f.bp, heartRate: f.pulse, temperature: f.temp, oxygenSaturation: f.spo2, date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }), nurseName: 'System Nurse' });
    this.showVitalsModal.set(false);
    this.vitalsForm.set({ patientId:'', bp:'', pulse:'', temp:'', spo2:'', pain:'' });
  }

  async saveCarePlan() {
    const f = this.carePlanForm();
    if (!f.patientId || !f.goal) return;
    await this.mutate(api.nursing.addCarePlan, { patientId: f.patientId, title: f.goal, description: f.interventions, startDate: new Date().toISOString().split('T')[0], status: 'active' });
    this.showCarePlanModal.set(false);
    this.carePlanForm.set({ patientId:'', goal:'', interventions:'', evaluationDate:'' });
  }
}
