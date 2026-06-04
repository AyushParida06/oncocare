import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getIncidents = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { date } = args;
    if (date) {
      return await ctx.db
        .query("qualityIncidents")
        .withIndex("by_date", (q) => q.eq("date", date))
        .collect();
    }
    return await ctx.db.query("qualityIncidents").collect();
  },
});

export const logIncident = mutation({
  args: {
    date: v.string(),
    description: v.string(),
    severity: v.string(),
    department: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("qualityIncidents", {
      ...args,
    });
  },
});

export const updateIncidentStatus = mutation({
  args: {
    id: v.id("qualityIncidents"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const severitySummary = query({
  args: {},
  handler: async (ctx) => {
    const incidents = await ctx.db.query("qualityIncidents").take(200);
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const byStatus: Record<string, number> = { open: 0, investigating: 0, resolved: 0 };
    for (const inc of incidents) {
      counts[inc.severity] = (counts[inc.severity] || 0) + 1;
      byStatus[inc.status] = (byStatus[inc.status] || 0) + 1;
    }
    return { bySeverity: counts, byStatus, total: incidents.length };
  },
});
