import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getStats, updatePatientStats } from "./statsHelper";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Return a bounded list of patients (up to 100) to ensure performance
    return await ctx.db.query("patients").take(100);
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if patient with MRN already exists
    const existing = await ctx.db
      .query("patients")
      .withIndex("by_mrn", (q) => q.eq("mrn", args.mrn))
      .first();

    if (existing) {
      throw new Error(`Patient with MRN ${args.mrn} already exists`);
    }

    const id = await ctx.db.insert("patients", args);

    // Update stats counters
    let activeChange = 0;
    let remissionChange = 0;
    if (args.status === "active") activeChange = 1;
    if (args.status === "remission") remissionChange = 1;

    // Assume emergency/active status might count as inpatient admission for demo
    let admissionsChange = 0;
    if (args.status === "active") admissionsChange = 1;

    await updatePatientStats(ctx, {
      total: 1,
      active: activeChange,
      remission: remissionChange,
      typeChange: { newType: args.cancerType },
      admissions: admissionsChange,
    });

    return id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.id);
    if (!patient) {
      throw new Error("Patient not found");
    }

    await ctx.db.delete(args.id);

    // Update stats counters
    let activeChange = 0;
    let remissionChange = 0;
    if (patient.status === "active") activeChange = -1;
    if (patient.status === "remission") remissionChange = -1;

    let admissionsChange = 0;
    if (patient.status === "active") admissionsChange = -1;

    await updatePatientStats(ctx, {
      total: -1,
      active: activeChange,
      remission: remissionChange,
      typeChange: { oldType: patient.cancerType },
      admissions: admissionsChange,
    });

    return args.id;
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const s = await getStats(ctx);
    return {
      total: s.totalPatients,
      active: s.activePatients,
      remission: s.remissionPatients,
      byType: s.byType,
    };
  },
});

export const stageBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const patients = await ctx.db.query("patients").take(500);
    const map: Record<string, Record<string, number>> = {};
    for (const p of patients) {
      const type = p.cancerType || "Unknown";
      const stage = p.cancerStage || "Unknown";
      if (!map[type]) map[type] = {};
      map[type][stage] = (map[type][stage] || 0) + 1;
    }
    // Also compute per-status counts
    const statusCounts: Record<string, number> = {};
    for (const p of patients) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }
    return { byTypeStage: map, statusCounts };
  },
});
