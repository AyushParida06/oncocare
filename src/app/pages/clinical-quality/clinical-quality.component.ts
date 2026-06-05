import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexPageBase } from '../../shared/convex-page-base';

@Component({
  selector: 'app-clinical-quality',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clinical-quality.component.html',
})
export class ClinicalQualityComponent extends ConvexPageBase implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService  = inject(LanguageService);

  incidents  = signal<any[]>([]);
  showModal  = signal(false);
  form = signal({ department:'', severity:'low', description:'', reportedBy:'' });

  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);

  get active()   { return this.incidents().filter((i: any) => i.status !== 'resolved'); }
  get resolved() { return this.incidents().filter((i: any) => i.status === 'resolved'); }

  ngOnInit() {
    this.sub(api.quality.getIncidents, {}, (v: any) => this.incidents.set(v ?? []));
  }
  ngOnDestroy() { this.cleanup(); }

  async report() {
    const f = this.form();
    if (!f.department || !f.description) return;
    await this.mutate(api.quality.logIncident, { department: f.department, severity: f.severity, description: f.description, date: new Date().toISOString().split('T')[0], status: 'open' });
    this.showModal.set(false);
    this.form.set({ department:'', severity:'low', description:'', reportedBy:'' });
  }

  async resolve(id: string) {
    await this.mutate(api.quality.updateIncidentStatus, { id, status: 'resolved' });
  }

  sevColor(sev: string) {
    const m: Record<string,string> = { critical:'#ef4444', high:'#f97316', medium:'#f59e0b', low:'#22c55e' };
    return m[sev] ?? '#888';
  }
}
