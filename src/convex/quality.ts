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
