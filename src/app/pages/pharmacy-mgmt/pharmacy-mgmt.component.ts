import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexPageBase } from '../../shared/convex-page-base';

@Component({
  selector: 'app-pharmacy-mgmt',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pharmacy-mgmt.component.html',
})
export class PharmacyMgmtComponent extends ConvexPageBase implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService  = inject(LanguageService);

  patients = signal<any[]>([]);
  orders   = signal<any[]>([]);
  showModal = signal(false);
  form = signal({ patientId:'', medication:'', dosage:'', frequency:'' });

  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);

  get active()  { return this.orders().filter((o: any) => o.status === 'pending' || o.status === 'verified'); }
  get history() { return this.orders().filter((o: any) => o.status === 'dispensed'); }

  ngOnInit() {
    this.sub(api.patients.list, {}, (v: any) => this.patients.set(v ?? []));
    this.sub(api.pharmacy.getOrders, {}, (v: any) => this.orders.set(v ?? []));
  }
  ngOnDestroy() { this.cleanup(); }

  getPatientName(id: string) {
    const p = this.patients().find((x: any) => x._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }
  getPatientMRN(id: string) { return this.patients().find((x: any) => x._id === id)?.mrn ?? 'N/A'; }

  async addOrder() {
    const f = this.form();
    if (!f.patientId || !f.medication) return;
    await this.mutate(api.pharmacy.addOrder, { ...f, orderedDate: new Date().toISOString().split('T')[0], status: 'pending' });
    this.showModal.set(false);
    this.form.set({ patientId:'', medication:'', dosage:'', frequency:'' });
  }

  async verify(id: string)   { await this.mutate(api.pharmacy.updateOrderStatus, { id, status: 'verified' }); }
  async dispense(id: string) { await this.mutate(api.pharmacy.updateOrderStatus, { id, status: 'dispensed' }); }
}
