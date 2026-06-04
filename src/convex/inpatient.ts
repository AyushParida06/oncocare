import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAdmissions = query({
  args: { patientId: v.optional(v.id("patients")) },
  handler: async (ctx, args) => {
    const { patientId } = args;
    if (patientId) {
      return await ctx.db
        .query("inpatientAdmissions")
        .withIndex("by_patient", (q) => q.eq("patientId", patientId))
        .collect();
    }
    return await ctx.db.query("inpatientAdmissions").collect();
  },
});

export const addAdmission = mutation({
  args: {
    patientId: v.id("patients"),
    room: v.string(),
    bed: v.string(),
    admissionDate: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inpatientAdmissions", {
      ...args,
    });
  },
});

export const updateAdmissionStatus = mutation({
  args: {
    id: v.id("inpatientAdmissions"),
    status: v.string(),
    dischargeDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, status, dischargeDate } = args;
    await ctx.db.patch(id, { status, dischargeDate });
  },
});

export const deleteAdmission = mutation({
  args: { id: v.id("inpatientAdmissions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
