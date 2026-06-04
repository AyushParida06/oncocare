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

export const claimsSummary = query({
  args: {},
  handler: async (ctx) => {
    const claims = await ctx.db.query("insuranceClaims").take(200);
    const counts: Record<string, number> = { submitted: 0, processing: 0, approved: 0, rejected: 0 };
    let totalAmount = 0, approvedAmount = 0;
    for (const c of claims) {
      counts[c.status] = (counts[c.status] || 0) + 1;
      totalAmount += c.claimAmount;
      if (c.status === "approved") approvedAmount += c.claimAmount;
    }
    return { counts, totalAmount, approvedAmount, total: claims.length };
  },
});
