import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrders = query({
  args: { patientId: v.optional(v.id("patients")) },
  handler: async (ctx, args) => {
    const { patientId } = args;
    if (patientId) {
      return await ctx.db
        .query("radiologyOrders")
        .withIndex("by_patient", (q) => q.eq("patientId", patientId))
        .collect();
    }
    return await ctx.db.query("radiologyOrders").collect();
  },
});

export const addOrder = mutation({
  args: {
    patientId: v.id("patients"),
    modality: v.string(),
    orderedDate: v.string(),
    status: v.string(),
    reportText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("radiologyOrders", {
      ...args,
    });
  },
});
