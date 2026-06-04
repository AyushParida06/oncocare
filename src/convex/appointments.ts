import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .order("asc")
      .take(100);
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    type: v.string(),
    date: v.string(),
    time: v.string(),
    doctor: v.string(),
    department: v.string(),
    status: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate patient exists
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Selected patient does not exist");
    }
    return await ctx.db.insert("appointments", args);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const appt = await ctx.db.get(args.id);
    if (!appt) {
      throw new Error("Appointment not found");
    }
    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const appt = await ctx.db.get(args.id);
    if (!appt) {
      throw new Error("Appointment not found");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const todayCount = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const todayAppts = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();

    return {
      total: todayAppts.length,
      confirmed: todayAppts.filter(
        (a) => a.status === "confirmed" || a.status === "completed"
      ).length,
    };
  },
});
