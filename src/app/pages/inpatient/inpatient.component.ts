import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexPageBase } from '../../shared/convex-page-base';

@Component({
  selector: 'app-inpatient',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './inpatient.component.html',
})
export class InpatientComponent extends ConvexPageBase implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService  = inject(LanguageService);

  patients    = signal<any[]>([]);
  admissions  = signal<any[]>([]);
  showModal   = signal(false);
  form = signal({ patientId:'', room:'', bed:'', diagnosis:'', notes:'' });

  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);

  get active() { return this.admissions().filter((a: any) => a.status === 'admitted'); }
  get history() { return this.admissions().filter((a: any) => a.status === 'discharged'); }

  ngOnInit() {
    this.sub(api.patients.list, {}, (v: any) => this.patients.set(v ?? []));
    this.sub(api.inpatient.getAdmissions, {}, (v: any) => this.admissions.set(v ?? []));
  }
  ngOnDestroy() { this.cleanup(); }

  getPatientName(id: string) {
    const p = this.patients().find((x: any) => x._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }
  getPatientMRN(id: string) {
    const p = this.patients().find((x: any) => x._id === id);
    return p?.mrn ?? 'N/A';
  }

  async admit() {
    const f = this.form();
    if (!f.patientId || !f.room || !f.bed) return;
    await this.mutate(api.inpatient.addAdmission, { ...f, admissionDate: new Date().toISOString().split('T')[0], status: 'admitted' });
    this.showModal.set(false);
    this.form.set({ patientId:'', room:'', bed:'', diagnosis:'', notes:'' });
  }

  async discharge(id: string) { await this.mutate(api.inpatient.updateAdmissionStatus, { id, status: 'discharged', dischargeDate: new Date().toISOString().split('T')[0] }); }
}
