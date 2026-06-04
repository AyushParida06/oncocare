import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getClaims = query({
  args: { invoiceId: v.optional(v.id("patientInvoices")) },
  handler: async (ctx, args) => {
    const { invoiceId } = args;
    if (invoiceId) {
      return await ctx.db
        .query("insuranceClaims")
        .withIndex("by_invoice", (q) => q.eq("invoiceId", invoiceId))
        .collect();
    }
    return await ctx.db.query("insuranceClaims").collect();
  },
});

export const submitClaim = mutation({
  args: {
    invoiceId: v.id("patientInvoices"),
    insuranceProvider: v.string(),
    claimAmount: v.number(),
    submittedDate: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("insuranceClaims", {
      ...args,
    });
  },
});
