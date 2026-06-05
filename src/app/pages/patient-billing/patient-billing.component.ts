import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { api } from '../../../convex/_generated/api';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConvexPageBase } from '../../shared/convex-page-base';

@Component({
  selector: 'app-patient-billing',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './patient-billing.component.html',
})
export class PatientBillingComponent extends ConvexPageBase implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly langService  = inject(LanguageService);

  patients = signal<any[]>([]);
  invoices = signal<any[]>([]);
  showModal = signal(false);
  form = signal({ patientId:'', amount:'', description:'' });

  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);

  get unpaid() { return this.invoices().filter((i: any) => i.status === 'unpaid'); }
  get paid()   { return this.invoices().filter((i: any) => i.status === 'paid'); }
  get totalUnpaid() { return this.unpaid.reduce((a: number, i: any) => a + (i.amount || 0), 0); }
  get totalPaid()   { return this.paid.reduce((a: number, i: any) => a + (i.amount || 0), 0); }

  ngOnInit() {
    this.sub(api.patients.list, {}, (v: any) => this.patients.set(v ?? []));
    this.sub(api.billing.getInvoices, {}, (v: any) => this.invoices.set(v ?? []));
  }
  ngOnDestroy() { this.cleanup(); }

  getPatientName(id: string) {
    const p = this.patients().find((x: any) => x._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }
  getPatientMRN(id: string) { return this.patients().find((x: any) => x._id === id)?.mrn ?? 'N/A'; }

  async addInvoice() {
    const f = this.form();
    if (!f.patientId || !f.amount || !f.description) return;
    await this.mutate(api.billing.addInvoice, { patientId: f.patientId, amount: parseFloat(f.amount), description: f.description, date: new Date().toISOString().split('T')[0], status: 'unpaid' });
    this.showModal.set(false);
    this.form.set({ patientId:'', amount:'', description:'' });
  }

  async markPaid(id: string) { await this.mutate(api.billing.updateInvoiceStatus, { id, status: 'paid' }); }
  async deleteInvoice(id: string) {
    if (confirm('Delete this invoice? This cannot be undone.')) {
      await this.mutate(api.billing.deleteInvoice, { id });
    }
  }

  downloadPDF(inv: any, statusLabel: string) {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(16,185,129);
    doc.text('VistaOnco Hospital', 20, 20);
    doc.setFontSize(14); doc.setTextColor(100,100,100);
    doc.text(statusLabel === 'Paid' ? 'Payment Receipt' : 'Patient Invoice', 20, 30);
    doc.setDrawColor(200,200,200); doc.line(20,35,190,35);
    doc.setFontSize(12); doc.setTextColor(50,50,50);
    doc.text(`Date: ${inv.date}`, 20, 45);
    doc.text(`Patient: ${this.getPatientName(inv.patientId)}`, 20, 55);
    doc.text(`MRN: ${this.getPatientMRN(inv.patientId)}`, 20, 65);
    doc.text(`Status: ${statusLabel}`, 20, 75);
    doc.setFillColor(240,240,240); doc.rect(20,90,170,10,'F');
    doc.setFontSize(11); doc.setTextColor(0,0,0);
    doc.text('Description', 25, 97); doc.text('Amount', 150, 97);
    doc.setFontSize(11); doc.setTextColor(50,50,50);
    doc.text(inv.description, 25, 110);
    doc.text(`Rs. ${parseFloat(inv.amount).toLocaleString()}`, 150, 110);
    doc.setFontSize(10); doc.setTextColor(150,150,150);
    doc.text('Thank you for choosing VistaOnco Hospital.', 20, 280);
    doc.save(`${statusLabel === 'Paid' ? 'Receipt' : 'Invoice'}_${this.getPatientMRN(inv.patientId)}_${inv.date}.pdf`);
  }
}
