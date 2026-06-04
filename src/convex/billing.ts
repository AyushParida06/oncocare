import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getInvoices = query({
  args: { patientId: v.optional(v.id("patients")) },
  handler: async (ctx, args) => {
    const { patientId } = args;
    if (patientId) {
      return await ctx.db
        .query("patientInvoices")
        .withIndex("by_patient", (q) => q.eq("patientId", patientId))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("patientInvoices").order("desc").collect();
  },
});

export const addInvoice = mutation({
  args: {
    patientId: v.id("patients"),
    amount: v.number(),
    date: v.string(),
    description: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patientInvoices", {
      ...args,
    });
  },
});

export const updateInvoiceStatus = mutation({
  args: {
    id: v.id("patientInvoices"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteInvoice = mutation({
  args: {
    id: v.id("patientInvoices"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const summary = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("patientInvoices").take(500);
    let totalBilled = 0, totalPaid = 0, totalPending = 0;
    let countPaid = 0, countPartial = 0, countUnpaid = 0;
    for (const inv of invoices) {
      totalBilled += inv.amount;
      if (inv.status === "paid") { totalPaid += inv.amount; countPaid++; }
      else if (inv.status === "partially_paid") { totalPending += inv.amount; countPartial++; }
      else { totalPending += inv.amount; countUnpaid++; }
    }
    return { totalBilled, totalPaid, totalPending, countPaid, countPartial, countUnpaid, total: invoices.length };
  },
});
