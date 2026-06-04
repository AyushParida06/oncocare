import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getVitals = query({
  args: { patientId: v.optional(v.id("patients")) },
  handler: async (ctx, args) => {
    const { patientId } = args;
    if (patientId) {
      return await ctx.db
        .query("vitals")
        .withIndex("by_patient", (q) => q.eq("patientId", patientId))
        .collect();
    }
    return await ctx.db.query("vitals").collect();
  },
});

export const addVitals = mutation({
  args: {
    patientId: v.id("patients"),
    date: v.string(),
    time: v.string(),
    temperature: v.optional(v.string()),
    heartRate: v.optional(v.string()),
    bloodPressure: v.optional(v.string()),
    respiratoryRate: v.optional(v.string()),
    oxygenSaturation: v.optional(v.string()),
    nurseName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vitals", {
      ...args,
    });
  },
});

export const getNotes = query({
  args: { patientId: v.optional(v.id("patients")) },
  handler: async (ctx, args) => {
    const { patientId } = args;
    if (patientId) {
      return await ctx.db
        .query("nursingNotes")
        .withIndex("by_patient", (q) => q.eq("patientId", patientId))
        .collect();
    }
    return await ctx.db.query("nursingNotes").collect();
  },
});

export const addNote = mutation({
  args: {
    patientId: v.id("patients"),
    date: v.string(),
    time: v.string(),
    nurseName: v.string(),
    note: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("nursingNotes", {
      ...args,
    });
  },
});

export const addCarePlan = mutation({
  args: {
    patientId: v.id("patients"),
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("oncologyCarePlans", {
      ...args,
    });
  },
});
