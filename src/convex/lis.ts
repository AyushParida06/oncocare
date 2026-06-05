import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrders = query({
  handler: async (ctx) => {
    return await ctx.db.query("labs").order("desc").collect();
  },
});

export const addOrder = mutation({
  args: {
    patientId: v.id("patients"),
    testName: v.string(),
    orderedBy: v.string(),
    orderedDate: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("labs", {
      ...args,
      notes: args.notes || '',
    });
  },
});

export const updateOrderStatus = mutation({
  args: {
    id: v.id("labs"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
