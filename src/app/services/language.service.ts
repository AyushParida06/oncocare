import { Injectable, signal, computed } from '@angular/core';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    mod_outpatient:'Outpatient',mod_inpatient:'Inpatient',mod_nursing:'Nursing',
    mod_clinical_pharm:'Clinical Pharmacy',mod_tumor_board:'Tumor Board',
    mod_quality:'Clinical Quality',mod_lis:'Lab Information System',mod_ris:'Radiology IS',
    mod_pharmacy:'Pharmacy Mgmt',mod_patient_billing:'Patient Billing',
    mod_revenue_cycle:'Revenue Cycle',mod_billing:'Patient Billing',
    desc_outpatient:'Register and manage cancer outpatients',
    desc_inpatient:'Manage inpatient admissions and discharges',
    desc_nursing:'Nursing assessments, vitals and care plans',
    desc_clinical_pharm:'Clinical pharmacy operations',
    desc_tumor_board:'Multidisciplinary tumor board meetings',
    desc_quality:'Clinical quality and safety incident tracking',
    desc_lis:'Laboratory information and test management',
    desc_ris:'Radiology information and imaging management',
    desc_pharmacy:'Pharmacy order management and dispensing',
    desc_billing:'Patient invoicing and billing management',
    ui_module_active:'Module Active',
    inpatient_admit:'Admit Patient',inpatient_discharge:'Discharge',
    inpatient_active:'Active Admissions',inpatient_history:'Discharge History',
    inpatient_no_records:'No active admissions.',inpatient_room:'Room',
    inpatient_bed:'Bed',inpatient_date:'Admission Date',
    inpatient_discharge_date:'Discharge Date',inpatient_select_patient:'Select Patient',
    inpatient_status:'Status',
    nursing_assessment:'Patient Assessment',nursing_assessment_desc:'Record vitals and observations',
    nursing_med_admin:'Medication Admin',nursing_med_admin_desc:'Log medication administration',
    nursing_care_plans:'Care Plans',nursing_care_plans_desc:'Create and manage care plans',
    nursing_handover:'Shift Handover',nursing_handover_desc:'Document shift handover notes',
    qual_report_incident:'Report Incident',qual_active_incidents:'Active Incidents',
    qual_resolved_incidents:'Resolved Incidents',qual_date:'Date',
    qual_department:'Department',qual_severity:'Severity',qual_description:'Description',
    qual_status:'Status',qual_resolve:'Resolve',
    qual_sev_low:'Low',qual_sev_medium:'Medium',qual_sev_high:'High',qual_sev_critical:'Critical',
    qual_stat_open:'Open',qual_stat_investigating:'Investigating',qual_stat_resolved:'Resolved',
    lis_new_order:'New Lab Order',lis_active_labs:'Active Lab Orders',
    lis_completed_labs:'Completed Labs',lis_test_name:'Test Name',
    lis_ordered_by:'Ordered By',lis_status:'Status',
    lis_stat_ordered:'Ordered',lis_stat_collected:'Collected',
    lis_stat_processing:'Processing',lis_stat_resulted:'Resulted',
    lis_action_collect:'Mark Collected',lis_action_process:'Mark Processing',
    lis_action_result:'Mark Resulted',
    tb_new_meeting:'New Meeting',tb_meetings:'Meetings',tb_add_case:'Add Case',
    tb_cases:'Cases',tb_summary:'Clinical Summary',tb_decision:'Board Decision',
    tb_record_decision:'Record Decision',tb_save_decision:'Save',
    tb_date:'Date',tb_location:'Location',
    pharmacy_new_order:'New Order',pharmacy_active:'Active Orders',
    pharmacy_history:'Dispensed History',pharmacy_medication:'Medication',
    pharmacy_dosage:'Dosage',pharmacy_frequency:'Frequency',
    pharmacy_verify:'Verify',pharmacy_dispense:'Dispense',
    pharmacy_status_pending:'Pending',pharmacy_status_verified:'Verified',
    pharmacy_status_dispensed:'Dispensed',
    billing_new_invoice:'New Invoice',billing_unpaid:'Unpaid Invoices',
    billing_paid:'Paid Invoices',billing_description:'Description',
    billing_amount:'Amount',billing_mark_paid:'Mark Paid',
    billing_total_unpaid:'Total Unpaid',billing_total_revenue:'Total Revenue',
    billing_status_paid:'Paid',
    btn_cancel:'Cancel',btn_save:'Save',
  },
  hi: {
    mod_outpatient:'बाह्य रोगी',mod_inpatient:'आंतरिक रोगी',mod_nursing:'नर्सिंग',
    mod_clinical_pharm:'क्लिनिकल फार्मेसी',mod_tumor_board:'ट्यूमर बोर्ड',
    mod_quality:'क्लिनिकल गुणवत्ता',mod_lis:'प्रयोगशाला IS',mod_ris:'रेडियोलॉजी IS',
    mod_pharmacy:'फार्मेसी प्रबंधन',mod_patient_billing:'रोगी बिलिंग',
    mod_revenue_cycle:'राजस्व चक्र',mod_billing:'रोगी बिलिंग',
    ui_module_active:'मॉड्यूल सक्रिय',
    btn_cancel:'रद्द करें',btn_save:'सहेजें',
    inpatient_admit:'रोगी भर्ती',inpatient_discharge:'छुट्टी',
    inpatient_active:'सक्रिय भर्ती',inpatient_history:'छुट्टी इतिहास',
    qual_report_incident:'घटना रिपोर्ट करें',
  },
  ta: {
    mod_outpatient:'வெளிநோயாளி',mod_inpatient:'உள்நோயாளி',mod_nursing:'நர்சிங்',
    mod_quality:'மருத்துவ தரம்',mod_billing:'நோயாளி பில்லிங்',
    ui_module_active:'தொகுதி செயலில்',btn_cancel:'ரத்து',btn_save:'சேமி',
  },
};

export type LangCode = 'en' | 'hi' | 'ta';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'vistaonco_lang';
  readonly lang = signal<LangCode>(this._loadLang());

  private _loadLang(): LangCode {
    try {
      const v = localStorage.getItem(this.STORAGE_KEY);
      return (v === 'hi' || v === 'ta') ? v as LangCode : 'en';
    } catch { return 'en'; }
  }

  setLang(l: LangCode): void {
    this.lang.set(l);
    try { localStorage.setItem(this.STORAGE_KEY, l); } catch {}
  }

  /** Translate key — falls back to English then to the key itself */
  t(key: string): string {
    const l = this.lang();
    return TRANSLATIONS[l]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key;
  }
}
