import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  patients: defineTable({
    mrn: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.string(),
    phone: v.string(),
    email: v.string(),
    address: v.string(),
    bloodGroup: v.string(),
    cancerType: v.string(),
    cancerStage: v.string(),
    diagnosisDate: v.string(),
    primaryOncologist: v.string(),
    status: v.string(), // active, remission, palliative, discharged
    insurance: v.string(),
  }).index("by_mrn", ["mrn"]),

  appointments: defineTable({
    patientId: v.id("patients"),
    type: v.string(), // chemotherapy, consultation, radiology, lab, followup
    date: v.string(), // YYYY-MM-DD
    time: v.string(), // HH:MM
    doctor: v.string(),
    department: v.string(),
    status: v.string(), // scheduled, confirmed, completed, cancelled, no-show
    notes: v.string(),
  }).index("by_date", ["date"]),

  chemoSessions: defineTable({
    patientId: v.id("patients"),
    protocol: v.string(),
    cycleNumber: v.number(),
    scheduledDate: v.string(), // YYYY-MM-DD
    status: v.string(), // scheduled, in-progress, completed, delayed, skipped
    notes: v.string(),
    drugs: v.array(
      v.object({
        name: v.string(),
        dose: v.string(),
        route: v.string(),
      })
    ),
  }).index("by_date", ["scheduledDate"]),

  labs: defineTable({
    patientId: v.id("patients"),
    testName: v.string(),
    orderedBy: v.string(),
    orderedDate: v.string(), // YYYY-MM-DD
    status: v.string(), // ordered, collected, processing, resulted, critical
    notes: v.string(),
  }).index("by_date", ["orderedDate"]),

  stats: defineTable({
    key: v.string(), // unique key e.g. "dashboard"
    totalPatients: v.number(),
    activePatients: v.number(),
    remissionPatients: v.number(),
    byType: v.record(v.string(), v.number()),
    todayAppointments: v.number(),
    confirmedTodayAppointments: v.number(),
    todayChemoSessions: v.number(),
    pendingTodayChemoSessions: v.number(),
    activeAdmissionsCount: v.number(),
  }).index("by_key", ["key"]),

  // New tables for VistaOnco modules
  oncologyCarePlans: defineTable({
    patientId: v.id("patients"),
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
  }),
  carePlanItems: defineTable({
    planId: v.id("oncologyCarePlans"),
    name: v.string(),
    dueDate: v.optional(v.string()),
    completed: v.boolean(),
  }),
  tumourBoardMeetings: defineTable({
    date: v.string(), // YYYY-MM-DD
    location: v.optional(v.string()), // e.g., Conference Room B
    notes: v.optional(v.string()),
  }),
  tumourBoardCases: defineTable({
    meetingId: v.id("tumourBoardMeetings"),
    patientId: v.id("patients"),
    summary: v.string(),
    decision: v.optional(v.string()),
  }),

  // Inpatient Care
  inpatientAdmissions: defineTable({
    patientId: v.id("patients"),
    room: v.string(),
    bed: v.string(),
    admissionDate: v.string(),
    dischargeDate: v.optional(v.string()),
    status: v.string(), // admitted, discharged, transferred
  }).index("by_patient", ["patientId"]),

  // Nursing Information System (NIS)
  nursingNotes: defineTable({
    patientId: v.id("patients"),
    date: v.string(),
    time: v.string(),
    nurseName: v.string(),
    note: v.string(),
    type: v.string(), // handover, assessment, general
  }).index("by_patient", ["patientId"]),

  vitals: defineTable({
    patientId: v.id("patients"),
    date: v.string(),
    time: v.string(),
    temperature: v.optional(v.string()),
    heartRate: v.optional(v.string()),
    bloodPressure: v.optional(v.string()),
    respiratoryRate: v.optional(v.string()),
    oxygenSaturation: v.optional(v.string()),
    nurseName: v.string(),
  }).index("by_patient", ["patientId"]),

  // Clinical Pharmacy
  clinicalPharmacyOrders: defineTable({
    patientId: v.id("patients"),
    medication: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    orderedDate: v.string(),
    status: v.string(), // pending, verified, dispensed
  }).index("by_patient", ["patientId"]),

  // Clinical Quality
  qualityIncidents: defineTable({
    date: v.string(),
    description: v.string(),
    severity: v.string(), // low, medium, high, critical
    department: v.string(),
    status: v.string(), // open, investigating, resolved
  }).index("by_date", ["date"]),

  // Radiology Information System (RIS)
  radiologyOrders: defineTable({
    patientId: v.id("patients"),
    modality: v.string(), // CT, MRI, XRAY, PET
    orderedDate: v.string(),
    status: v.string(), // ordered, scheduled, completed, reported
    reportText: v.optional(v.string()),
  }).index("by_patient", ["patientId"]),

  // Patient Billing
  patientInvoices: defineTable({
    patientId: v.id("patients"),
    amount: v.number(),
    date: v.string(),
    description: v.string(),
    status: v.string(), // unpaid, partially_paid, paid
  }).index("by_patient", ["patientId"]),

  // Revenue Cycle
  insuranceClaims: defineTable({
    invoiceId: v.id("patientInvoices"),
    insuranceProvider: v.string(),
    claimAmount: v.number(),
    submittedDate: v.string(),
    status: v.string(), // submitted, processing, approved, rejected
  }).index("by_invoice", ["invoiceId"]),
  
  ...authTables,
});
