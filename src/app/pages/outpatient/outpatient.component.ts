import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexPageBase } from '../../shared/convex-page-base';

@Component({
  selector: 'app-outpatient',
  standalone: true,
  imports: [FormsModule],
  providers: [],
  templateUrl: './outpatient.component.html',
})
export class OutpatientComponent extends ConvexPageBase implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LanguageService);

  patients   = signal<any[]>([]);
  appointments = signal<any[]>([]);
  showModal  = signal(false);
  showPatientModal = signal(false);

  form = signal({ patientId:'', time:'', type:'consultation', notes:'' });
  
  patientForm = signal({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
    phone: '', email: '', address: '', bloodGroup: 'O+',
    cancerType: '', cancerStage: 'Stage I', diagnosisDate: '',
    primaryOncologist: 'Dr. Ramesh K', status: 'active', insurance: ''
  });

  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);

  ngOnInit() {
    this.sub(api.patients.list, {}, (v: any) => this.patients.set(v ?? []));
    this.sub(api.appointments.list, { date: new Date().toISOString().split('T')[0] }, (v: any) => this.appointments.set(v ?? []));
  }
  ngOnDestroy() { this.cleanup(); }

  getPatientName(id: string) {
    const p = this.patients().find((x: any) => x._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }

  async addAppointment() {
    const f = this.form();
    if (!f.patientId || !f.time) return;
    await this.mutate(api.appointments.create, { ...f, date: new Date().toISOString().split('T')[0], status: 'scheduled', doctor: 'Dr. Unknown', department: 'General' });
    this.showModal.set(false);
    this.form.set({ patientId:'', time:'', type:'consultation', notes:'' });
  }

  async addPatient() {
    const f = this.patientForm();
    if (!f.firstName || !f.lastName || !f.dateOfBirth || !f.cancerType) return;
    
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const mrn = `MRN-${dateStr}-${randomDigits}`;

    try {
      await this.mutate(api.patients.create, { ...f, mrn });
      this.showPatientModal.set(false);
      this.patientForm.set({
        firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
        phone: '', email: '', address: '', bloodGroup: 'O+',
        cancerType: '', cancerStage: 'Stage I', diagnosisDate: '',
        primaryOncologist: 'Dr. Ramesh K', status: 'active', insurance: ''
      });
    } catch (e: any) {
      alert("Error adding patient: " + e.message);
    }
  }

  async updateStatus(id: string, status: string) {
    await this.mutate(api.appointments.updateStatus, { id, status });
  }
}
