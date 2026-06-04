import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrders = query({
  args: { patientId: v.optional(v.id("patients")) },
  handler: async (ctx, args) => {
    const { patientId } = args;
    if (patientId) {
      return await ctx.db
        .query("clinicalPharmacyOrders")
        .withIndex("by_patient", (q) => q.eq("patientId", patientId))
        .collect();
    }
    return await ctx.db.query("clinicalPharmacyOrders").collect();
  },
});

export const addOrder = mutation({
  args: {
    patientId: v.id("patients"),
    medication: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    orderedDate: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clinicalPharmacyOrders", {
      ...args,
    });
  },
});

export const updateOrderStatus = mutation({
  args: {
    id: v.id("clinicalPharmacyOrders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
