import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexPageBase } from '../../shared/convex-page-base';

@Component({
  selector: 'app-tumor-board',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tumor-board.component.html',
})
export class TumorBoardComponent extends ConvexPageBase implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService  = inject(LanguageService);

  meetings   = signal<any[]>([]);
  cases      = signal<any[]>([]);
  patients   = signal<any[]>([]);
  selectedMeeting = signal<any>(null);
  showMeetingModal = signal(false);
  showCaseModal    = signal(false);
  showDecisionModal = signal(false);
  editingCase = signal<any>(null);

  meetingForm = signal({ date:'', location:'', agenda:'' });
  caseForm    = signal({ patientId:'', summary:'' });
  decisionText = signal('');

  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);

  get meetingCases() {
    const m = this.selectedMeeting();
    return m ? this.cases().filter((c: any) => c.meetingId === m._id) : [];
  }

  ngOnInit() {
    this.sub(api.tumorBoard.getMeetings, {}, (v: any) => this.meetings.set(v ?? []));
    this.sub(api.tumorBoard.getCases, {}, (v: any) => this.cases.set(v ?? []));
    this.sub(api.patients.list, {}, (v: any) => this.patients.set(v ?? []));
  }
  ngOnDestroy() { this.cleanup(); }

  getPatientName(id: string) {
    const p = this.patients().find((x: any) => x._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }

  async createMeeting() {
    const f = this.meetingForm();
    if (!f.date || !f.location) return;
    try {
      await this.mutate(api.tumorBoard.addMeeting, { ...f });
      this.showMeetingModal.set(false);
      this.meetingForm.set({ date: '', location: '', agenda: '' });
    } catch (e) {
      console.error(e);
    }
  }

  async addCase() {
    const m = this.selectedMeeting();
    const f = this.caseForm();
    if (!m || !f.patientId) return;
    await this.mutate(api.tumorBoard.addCase, { meetingId: m._id, ...f, status: 'pending' });
    this.showCaseModal.set(false);
    this.caseForm.set({ patientId:'', summary:'' });
  }

  async saveDecision() {
    const c = this.editingCase();
    if (!c || !this.decisionText()) return;
    try {
      await this.mutate(api.tumorBoard.updateCaseDecision, { caseId: c._id, decision: this.decisionText() });
      this.showDecisionModal.set(false);
      this.editingCase.set(null);
      this.decisionText.set('');
    } catch (e) {
      console.error(e);
    }
  }

  openDecision(c: any) { this.editingCase.set(c); this.decisionText.set(c.decision ?? ''); this.showDecisionModal.set(true); }
}
