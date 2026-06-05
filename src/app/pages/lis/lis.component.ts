import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexPageBase } from '../../shared/convex-page-base';

@Component({
  selector: 'app-lis',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './lis.component.html',
})
export class LisComponent extends ConvexPageBase implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService  = inject(LanguageService);

  patients = signal<any[]>([]);
  orders   = signal<any[]>([]);
  showModal = signal(false);
  form = signal({ patientId:'', testName:'', orderedBy:'' });

  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);

  get active()    { return this.orders().filter((o: any) => o.status !== 'resulted'); }
  get completed() { return this.orders().filter((o: any) => o.status === 'resulted'); }

  ngOnInit() {
    this.sub(api.patients.list, {}, (v: any) => this.patients.set(v ?? []));
    this.sub(api.clinical.listLabs, {}, (v: any) => this.orders.set(v ?? []));
  }
  ngOnDestroy() { this.cleanup(); }

  getPatientName(id: string) {
    const p = this.patients().find((x: any) => x._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }

  async addOrder() {
    const f = this.form();
    if (!f.patientId || !f.testName) return;
    await this.mutate(api.clinical.createLab, { ...f, orderedDate: new Date().toISOString().split('T')[0], status: 'ordered', notes: '' });
    this.showModal.set(false);
    this.form.set({ patientId:'', testName:'', orderedBy:'' });
  }

  async advance(id: string, current: string) {
    const next: Record<string,string> = { ordered:'collected', collected:'processing', processing:'resulted' };
    await this.mutate(api.clinical.updateLabStatus, { id, status: next[current] ?? current });
  }

  nextLabel(s: string) {
    const m: Record<string,string> = { ordered:'Mark Collected', collected:'Mark Processing', processing:'Mark Resulted' };
    return m[s] ?? '';
  }
}
