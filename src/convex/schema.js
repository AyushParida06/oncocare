import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
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
        drugs: v.array(v.object({
            name: v.string(),
            dose: v.string(),
            route: v.string(),
        })),
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
});
